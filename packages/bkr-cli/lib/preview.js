// Brand-in-use previews and type specimens.
//
// `bkr export` writes two deterministic HTML pages:
//   tokens/exports/html/preview-ui.html    sample page in light and dark, side by side
//   tokens/exports/html/preview-type.html  type specimen (every font, weight, and size)
//
// `bkr preview` screenshots them to PNG with a locally installed Chrome or Edge:
//   tokens/exports/png/ui.png, tokens/exports/png/type.png
// PNGs render on GitHub (HTML does not). Screenshots are optional and are never
// regenerated in CI, so they are not part of the export hash; validate warns when
// they are older than the pages they were taken from.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { ensureDir, listFiles, pathExists, sha256, writeText } from "./fs-kit.js";
import { contrastRatio, luminance, toCssValue, toPosix } from "./tokens.js";

export const PNG_DIR = "tokens/exports/png";
const PREVIEW_HASH = path.join(PNG_DIR, ".bkr-preview-hash");
const GENERIC = new Set(["system-ui", "-apple-system", "sans-serif", "serif", "monospace", "ui-monospace", "ui-sans-serif", "ui-serif", "cursive"]);

const esc = (s) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// --- Roles: which tokens play which part on a sample page -------------------------------

const ROLE_NAMES = {
  surface: ["surface", "paper", "background", "page", "ghost", "white"],
  text: ["body", "text", "ink", "charcoal"],
  heading: ["ink", "heading", "text", "richBlack", "charcoal"],
  link: ["link", "huduPrimary", "primary", "vase"],
  buttonBg: ["primary", "tulip", "honey", "teal"],
  buttonText: ["onPrimary", "white"],
  card: ["subtle", "surfaceRaised", "card", "mist", "huduLight", "washGold", "washBlue"],
  accent: ["accent", "glow", "harvest", "honey", "tulip"],
};

const ROLE_USES = {
  text: /body|paragraph|text/i,
  heading: /heading/i,
  link: /link/i,
  card: /card|callout|panel/i,
};

// Picks token paths for each role: manifest `preview` first, then contrast pair uses,
// then common names. Returns { role: path }.
export function resolveRoles(manifest, tokens) {
  const colors = tokens.base.filter((t) => t.token.type === "color");
  const has = (p) => colors.some((t) => t.path === p);
  const byName = (names) => {
    for (const n of names) {
      const t = colors.find((c) => c.name === n);
      if (t) return t.path;
    }
    return null;
  };
  const roles = {};
  const pairs = manifest.validation?.contrastPairs || [];
  const fromUse = (re) => pairs.find((p) => re.test(p.use || ""));

  const text = fromUse(ROLE_USES.text);
  if (text) Object.assign(roles, { text: text.foreground, surface: text.background });
  const heading = fromUse(ROLE_USES.heading);
  if (heading) roles.heading = heading.foreground;
  const link = fromUse(ROLE_USES.link);
  if (link) roles.link = link.foreground;
  // Prefer "label on a button" pairs; "CTA" alone often means text, not a filled button.
  const button =
    pairs.find((p) => /button/i.test(p.use || "") && /label/i.test(p.use || "")) ||
    pairs.find((p) => /button/i.test(p.use || "")) ||
    fromUse(/cta/i);
  if (button) Object.assign(roles, { buttonText: button.foreground, buttonBg: button.background });
  // A card pair is one where body or heading text sits on the card color.
  const card =
    pairs.find((p) => ROLE_USES.card.test(p.use || "") && p.background !== roles.surface && [roles.text, roles.heading].includes(p.foreground)) ||
    pairs.find((p) => ROLE_USES.card.test(p.use || "") && p.background !== roles.surface && !/white|cream|on dark|dusk|charcoal/i.test(p.use || ""));
  if (card) roles.card = card.background;

  for (const [role, names] of Object.entries(ROLE_NAMES)) {
    if (!roles[role]) roles[role] = byName(names);
  }
  for (const [role, p] of Object.entries(manifest.preview || {})) {
    if (has(p)) roles[role] = p;
  }
  // Last resorts so the page always renders.
  const sorted = [...colors].sort((a, b) => luminance(b.token.value) - luminance(a.token.value));
  roles.surface ||= sorted[0]?.path;
  roles.text ||= sorted[sorted.length - 1]?.path;
  roles.heading ||= roles.text;
  roles.link ||= roles.text;
  roles.buttonBg ||= roles.link;
  roles.buttonText ||= roles.surface;
  roles.card ||= roles.surface;
  roles.accent ||= roles.buttonBg;
  return roles;
}

function valuesFor(tokens, roles, theme) {
  const base = new Map(tokens.base.filter((t) => t.token.type === "color").map((t) => [t.path, t.token.value]));
  const over = new Map((theme ? tokens.themes[theme] : []).map((t) => [t.path, t.token.value]));
  const v = {};
  for (const [role, p] of Object.entries(roles)) v[role] = (p && (over.get(p) || base.get(p))) || "#000000";

  // Never draw text on a color it cannot be read on: fall back to the brand color
  // (from this theme) with the best contrast. The page then shows only real, readable pairs.
  const palette = [...new Set([...base.keys()].map((p) => over.get(p) || base.get(p)))];
  const readable = (fg, bg, min) => {
    if (contrastRatio(fg, bg) >= min) return fg;
    return palette.reduce((best, c) => (contrastRatio(c, bg) > contrastRatio(best, bg) ? c : best), fg);
  };
  v.text = readable(v.text, v.surface, 4.5);
  v.heading = readable(v.heading, v.surface, 3);
  v.link = readable(v.link, v.surface, 4.5);
  v.buttonText = readable(v.buttonText, v.buttonBg, 4.5);
  if (contrastRatio(v.text, v.card) < 4.5) v.card = v.surface;
  v.cardHeading = readable(v.heading, v.card, 3);
  return v;
}

// Paths that change in a theme (app.*, ui.*, colorway.*) describe roles better
// than fixed pigments, so prefer them when choosing role tokens.
function themedFirst(tokens, roles) {
  const themed = new Set(Object.values(tokens.themes).flat().map((t) => t.path));
  if (!themed.size) return roles;
  const colors = tokens.base.filter((t) => t.token.type === "color");
  const out = { ...roles };
  for (const [role, names] of Object.entries(ROLE_NAMES)) {
    if (themed.has(out[role])) continue;
    const alt = colors.find((c) => themed.has(c.path) && names.includes(c.name));
    if (alt && ["surface", "text", "heading", "link", "card"].includes(role)) out[role] = alt.path;
  }
  return out;
}

function fonts(tokens) {
  const fam = (names) => {
    for (const n of names) {
      const t = tokens.base.find((x) => x.token.type === "fontFamily" && x.name === n);
      if (t) return toCssValue(t.token);
    }
    const any = tokens.base.find((x) => x.token.type === "fontFamily");
    return any ? toCssValue(any.token) : "system-ui, sans-serif";
  };
  return { heading: fam(["heading", "display", "sans", "body"]), body: fam(["body", "sans", "text", "heading"]) };
}

// One <link> per family so an unknown family does not break the others.
function fontLinks(tokens) {
  const weights = [...new Set(tokens.base.filter((t) => t.token.type === "fontWeight").map((t) => t.token.value))].sort((a, b) => a - b);
  const w = (weights.length ? weights : [400, 700]).join(";");
  const families = new Set();
  for (const t of tokens.base.filter((x) => x.token.type === "fontFamily")) {
    const list = Array.isArray(t.token.value) ? t.token.value : [t.token.value];
    const first = list[0].replace(/["']/g, "").trim();
    if (!GENERIC.has(first) && !/^(Segoe UI|Roboto|Arial|Helvetica|Georgia|Verdana|Consolas)$/i.test(first)) families.add(first);
  }
  return [...families]
    .sort()
    .map((f) => `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(f).replace(/%20/g, "+")}:wght@${w}&display=swap">`)
    .join("\n");
}

// Picks a logo for the header: a regular one for light panels, a reversed or white
// one (by file name) for dark panels. Lockups and wordmarks are preferred.
const DARK_LOGO = /reversed|white|on-dark|on-dusk|inverted/i;
function firstLogo(kitRoot, forDark = false) {
  const f = listFiles(path.join(kitRoot, "assets", "logo"))
    .map((x) => toPosix(path.relative(kitRoot, x)))
    .filter((x) => /\.(svg|png)$/i.test(x) && !/mono|favicon/i.test(x) && DARK_LOGO.test(x) === forDark)
    .sort((a, b) => (/lockup|wordmark/i.test(b) ? 1 : 0) - (/lockup|wordmark/i.test(a) ? 1 : 0))[0];
  if (!f) return null;
  const buf = fs.readFileSync(path.join(kitRoot, f));
  if (buf.length > 200 * 1024) return null;
  const type = f.toLowerCase().endsWith(".svg") ? "image/svg+xml" : "image/png";
  const body = type === "image/svg+xml" ? Buffer.from(buf.toString("utf8").replace(/\r\n/g, "\n")) : buf;
  // Lockups and wordmarks already contain the name, so the page does not repeat it.
  return { uri: `data:${type};base64,${body.toString("base64")}`, hasName: /lockup|wordmark/i.test(f) };
}

function tagline(kitRoot) {
  const p = path.join(kitRoot, "copy", "messaging.md");
  if (!pathExists(p)) return null;
  const m = fs.readFileSync(p, "utf8").match(/\*\*Tagline:?\*\*:?\s*([^\n]+)/i);
  return m ? m[1].replace(/\*\*/g, "").trim() : null;
}

function panel(label, v, f, logo, name, line) {
  return `<section style="background:${v.surface};color:${v.text};font-family:${esc(f.body)}">
  <div class="tag" style="color:${v.text}">${esc(label)}</div>
  <header style="border-bottom:3px solid ${v.accent}">
    ${logo ? `<img src="${logo.uri}" alt="" style="height:44px">` : ""}
    ${logo?.hasName ? "" : `<strong style="font-family:${esc(f.heading)};color:${v.heading}">${esc(name)}</strong>`}
    <nav><a style="color:${v.link}">About</a><a style="color:${v.link}">Services</a><a style="color:${v.link}">Contact</a></nav>
  </header>
  <h1 style="font-family:${esc(f.heading)};color:${v.heading}">${esc(line || `Welcome to ${name}`)}</h1>
  <p>This is body text in the brand's paragraph style. It shows how long-form copy reads on the page background. <a style="color:${v.link}">This is a text link.</a></p>
  <div class="row">
    <span class="btn" style="background:${v.buttonBg};color:${v.buttonText}">Primary action</span>
    <span class="btn ghost" style="border-color:${v.link};color:${v.link}">Secondary</span>
  </div>
  <div class="card" style="background:${v.card};color:${v.text};${v.card.toLowerCase() === v.surface.toLowerCase() ? `border:1px solid ${v.link}` : ""}">
    <h2 style="font-family:${esc(f.heading)};color:${v.cardHeading}">A card or callout</h2>
    <p>Cards sit on a raised surface. Text inside them keeps its contrast.</p>
  </div>
</section>`;
}

export function buildPreviewUi(kitRoot, manifest, tokens) {
  const roles = themedFirst(tokens, resolveRoles(manifest, tokens));
  const f = fonts(tokens);
  const logo = firstLogo(kitRoot);
  const name = manifest.brand.displayName;
  const line = tagline(kitRoot);
  const themes = Object.keys(tokens.themes).sort();
  const panels = [panel("Light", valuesFor(tokens, roles, null), f, logo, name, line)];
  if (themes.includes("dark")) panels.push(panel("Dark", valuesFor(tokens, roles, "dark"), f, firstLogo(kitRoot, true), name, line));
  const width = panels.length * 640;
  return `<!DOCTYPE html>
<!-- Generated by bkr export. Do not edit by hand. Screenshot with: bkr preview -->
<html lang="en"><head><meta charset="utf-8">
<meta name="bkr-shot" content="ui ${width} 480">
<title>${esc(name)} preview</title>
${fontLinks(tokens)}
<style>
  html, body { margin: 0; }
  /* Show fonts only at weights that really exist; never let the browser fake bold or italic. */
  * { font-synthesis: none; }
  body { display: flex; width: ${width}px; height: 480px; overflow: hidden; }
  section { box-sizing: border-box; width: 640px; height: 480px; padding: 24px 32px; position: relative; }
  .tag { position: absolute; top: 6px; right: 12px; font: 600 11px system-ui, sans-serif; opacity: .6; text-transform: uppercase; letter-spacing: .08em; }
  header { display: flex; align-items: center; gap: 12px; padding-bottom: 14px; margin-bottom: 24px; }
  header strong { font-size: 22px; }
  nav { margin-left: auto; display: flex; gap: 16px; font-size: 15px; }
  a { text-decoration: underline; }
  h1 { font-size: 36px; line-height: 1.15; margin: 0 0 14px; }
  h2 { font-size: 20px; margin: 0 0 6px; }
  p { font-size: 16px; line-height: 1.55; margin: 0 0 18px; }
  .row { display: flex; gap: 12px; margin-bottom: 24px; }
  .btn { display: inline-block; padding: 11px 20px; border-radius: 8px; font-weight: 700; font-size: 15px; }
  .ghost { border: 2px solid; background: transparent; }
  .card { border-radius: 12px; padding: 18px 20px; }
</style></head>
<body>
${panels.join("\n")}
</body></html>
`;
}

export function buildPreviewType(manifest, tokens) {
  const families = tokens.base.filter((t) => t.token.type === "fontFamily");
  if (!families.length) return null;
  const weights = tokens.base.filter((t) => t.token.type === "fontWeight");
  const sizes = tokens.base.filter((t) => t.token.type === "dimension" && /font/i.test(t.group));
  const px = (v) => (v.endsWith("rem") ? parseFloat(v) * 16 : parseFloat(v));
  const famHeight = 64 + (weights.length ? 34 : 0);
  const sizeHeight = sizes.reduce((h, s) => h + Math.max(24, px(s.token.value) * 1.35) + 6, 0);
  const height = Math.ceil(80 + families.length * famHeight + (sizes.length ? 40 + sizeHeight : 0) + 24);
  const rows = families
    .map((t) => {
      const css = toCssValue(t.token);
      const w = weights
        .map((x) => `<span style="font-weight:${x.token.value}">${esc(x.name)} ${x.token.value}</span>`)
        .join("");
      return `<div class="fam"><div class="meta">${esc(t.path)} <code>${esc(css)}</code></div>
<div class="sample" style="font-family:${esc(css)}">The quick brown fox jumps over the lazy dog. 0123456789</div>
${w ? `<div class="weights" style="font-family:${esc(css)}">${w}</div>` : ""}</div>`;
    })
    .join("\n");
  const body = toCssValue(families.find((t) => t.name === "body")?.token || families[0].token);
  const sizeRows = sizes
    .map((s) => `<div class="size" style="font-family:${esc(body)};font-size:${esc(s.token.value)}"><span class="lbl">${esc(s.name)} ${esc(s.token.value)}</span>Brand type at this size</div>`)
    .join("\n");
  return `<!DOCTYPE html>
<!-- Generated by bkr export. Do not edit by hand. Screenshot with: bkr preview -->
<html lang="en"><head><meta charset="utf-8">
<meta name="bkr-shot" content="type 1200 ${height}">
<title>${esc(manifest.brand.displayName)} type specimen</title>
${fontLinks(tokens)}
<style>
  html, body { margin: 0; background: #FFFFFF; color: #18181B; }
  * { font-synthesis: none; }
  body { width: 1200px; height: ${height}px; overflow: hidden; padding: 24px 32px; box-sizing: border-box; font-family: system-ui, sans-serif; }
  h1 { font-size: 20px; margin: 0 0 18px; }
  .fam { margin-bottom: 14px; }
  .meta { font-size: 12px; color: #52525B; margin-bottom: 4px; }
  .meta code { font-size: 11px; }
  .sample { font-size: 30px; line-height: 1.3; }
  .weights { display: flex; gap: 22px; font-size: 18px; margin-top: 4px; }
  h2 { font-size: 14px; color: #52525B; margin: 22px 0 8px; text-transform: uppercase; letter-spacing: .06em; }
  .size { line-height: 1.35; margin-bottom: 6px; white-space: nowrap; }
  .lbl { display: inline-block; width: 150px; font: 12px system-ui, sans-serif; color: #52525B; vertical-align: middle; }
</style></head>
<body>
<h1>${esc(manifest.brand.displayName)} type</h1>
${rows}
${sizes.length ? `<h2>Sizes</h2>\n${sizeRows}` : ""}
</body></html>
`;
}

// Hash of the pages the PNGs are taken from.
export function previewSourceHash(kitRoot, manifest, tokens) {
  return `sha256:${sha256([buildPreviewUi(kitRoot, manifest, tokens), buildPreviewType(manifest, tokens) || ""].join("\n"))}`;
}

export function previewStatus(kitRoot, manifest, tokens) {
  const p = path.join(kitRoot, PREVIEW_HASH);
  if (!pathExists(p)) return "none";
  const stored = fs.readFileSync(p, "utf8").split(/\r?\n/)[0].trim();
  return stored === previewSourceHash(kitRoot, manifest, tokens) ? "current" : "stale";
}

// --- Screenshots -------------------------------------------------------------------------

export function findBrowser() {
  if (process.env.BKR_BROWSER) return process.env.BKR_BROWSER;
  const candidates =
    process.platform === "win32"
      ? [
          "C:/Program Files/Google/Chrome/Application/chrome.exe",
          "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
          "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
          "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
        ]
      : process.platform === "darwin"
        ? [
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
            "/Applications/Chromium.app/Contents/MacOS/Chromium",
          ]
        : ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/microsoft-edge"];
  return candidates.find((c) => fs.existsSync(c)) || null;
}

function shoot(browser, htmlPath, outPng, width, height) {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "bkr-shot-"));
  try {
    execFileSync(
      browser,
      [
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        "--no-first-run",
        "--no-default-browser-check",
        `--user-data-dir=${profile}`,
        "--force-device-scale-factor=1",
        "--virtual-time-budget=8000",
        `--window-size=${width},${height}`,
        `--screenshot=${outPng}`,
        pathToFileURL(htmlPath).href,
      ],
      { stdio: "ignore", timeout: 60000 }
    );
  } finally {
    fs.rmSync(profile, { recursive: true, force: true });
  }
  if (!fs.existsSync(outPng)) throw new Error(`browser did not write ${outPng}`);
}

// Screenshots both preview pages. Requires `bkr export` to have run.
export function takePreviews(kitRoot, manifest, tokens) {
  const browser = findBrowser();
  if (!browser) {
    throw new Error("No Chrome, Edge, or Chromium found. Install one, or set BKR_BROWSER to its path.");
  }
  const outDir = path.join(kitRoot, PNG_DIR);
  ensureDir(outDir);
  const written = [];
  for (const page of ["preview-ui.html", "preview-type.html"]) {
    const html = path.join(kitRoot, "tokens", "exports", "html", page);
    if (!pathExists(html)) continue;
    const meta = fs.readFileSync(html, "utf8").match(/<meta name="bkr-shot" content="(\w+) (\d+) (\d+)">/);
    if (!meta) continue;
    const out = path.join(outDir, `${meta[1]}.png`);
    shoot(browser, html, out, Number(meta[2]), Number(meta[3]));
    written.push(out);
  }
  writeText(
    path.join(kitRoot, PREVIEW_HASH),
    `${previewSourceHash(kitRoot, manifest, tokens)}\n# Written by bkr preview. Used by bkr validate to detect stale screenshots.\n`
  );
  return { browser, written };
}

