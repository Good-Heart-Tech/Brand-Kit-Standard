// Token loading, value checks, and color math shared by validate, export, and publish.
import path from "node:path";
import { listBkrTokenFiles, readJson } from "./fs-kit.js";

// Base token files live anywhere under tokens/ except tokens/themes/ and tokens/exports/.
// Theme files live in tokens/themes/<name>.bkr.json and override base token values.
export function loadTokens(kitRoot) {
  const base = [];
  const themes = {};
  const files = [];
  for (const file of listBkrTokenFiles(kitRoot)) {
    const rel = toPosix(path.relative(kitRoot, file));
    let doc;
    try {
      doc = readJson(file);
    } catch (e) {
      files.push({ file, rel, doc: null, error: e.message });
      continue;
    }
    files.push({ file, rel, doc });
    const themeMatch = rel.match(/^tokens\/themes\/([^/]+)\.bkr\.json$/);
    const flat = flattenTokens(doc, rel);
    if (themeMatch) {
      themes[themeMatch[1]] = flat;
    } else {
      base.push(...flat);
    }
  }
  return { base, themes, files };
}

export function flattenTokens(doc, rel = "") {
  const out = [];
  for (const [group, names] of Object.entries(doc?.tokens || {})) {
    for (const [name, token] of Object.entries(names || {})) {
      out.push({ group, name, path: `${group}.${name}`, token, rel });
    }
  }
  return out;
}

export function toPosix(p) {
  return p.split(path.sep).join("/");
}

export function kebab(s) {
  return String(s)
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[_\s.]+/g, "-")
    .toLowerCase();
}

export function cssPrefix(manifest) {
  return manifest.consumption?.cssPrefix || manifest.brand.id.replace(/-/g, "");
}

export function cssVarName(manifest, group, name) {
  return `--${cssPrefix(manifest)}-${kebab(group)}-${kebab(name)}`;
}

// --- Value checks per token type -------------------------------------------

const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const DIMENSION = /^-?\d+(\.\d+)?(px|rem)$/;
const DURATION = /^\d+(\.\d+)?(ms|s)$/;

// Returns an error message, or null when the value fits its type.
export function checkTokenValue(token) {
  const { type, value } = token;
  switch (type) {
    case "color":
      return typeof value === "string" && HEX.test(value)
        ? null
        : `color value must be hex like #1A2B3C (got ${JSON.stringify(value)})`;
    case "dimension":
      return typeof value === "string" && DIMENSION.test(value)
        ? null
        : `dimension value must be a number with px or rem, like 16px or 1.5rem (got ${JSON.stringify(value)})`;
    case "duration":
      return typeof value === "string" && DURATION.test(value)
        ? null
        : `duration value must be like 200ms or 0.3s (got ${JSON.stringify(value)})`;
    case "fontFamily": {
      const ok =
        (typeof value === "string" && value.length > 0) ||
        (Array.isArray(value) && value.length > 0 && value.every((v) => typeof v === "string"));
      return ok ? null : "fontFamily value must be a string or a list of font names";
    }
    case "fontWeight":
      return typeof value === "number" && value >= 1 && value <= 1000
        ? null
        : `fontWeight value must be a number from 1 to 1000 (got ${JSON.stringify(value)})`;
    case "number":
      return typeof value === "number" ? null : "number value must be a number";
    case "string":
      return typeof value === "string" ? null : "string value must be text";
    default:
      return `unknown token type ${type}`;
  }
}

// --- Color math (WCAG 2.2) ---------------------------------------------------

export function parseHex(hex) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
  return { r, g, b, a };
}

function channel(c) {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function luminance(hex) {
  const { r, g, b } = parseHex(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(hexA, hexB) {
  const la = luminance(hexA);
  const lb = luminance(hexB);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

// Evaluates manifest validation.contrastPairs for the base palette and every theme.
// Returns rows like { theme, foreground, background, use, ratio, min, pass, error }.
export function evaluateContrast(manifest, tokens) {
  const pairs = manifest.validation?.contrastPairs || [];
  const defaultMin = manifest.validation?.minContrastRatio ?? 4.5;
  const baseMap = new Map(tokens.base.map((t) => [t.path, t.token]));
  const rows = [];
  const themeNames = ["base", ...Object.keys(tokens.themes).sort()];

  for (const themeName of themeNames) {
    const overrides =
      themeName === "base" ? new Map() : new Map(tokens.themes[themeName].map((t) => [t.path, t.token]));
    for (const pair of pairs) {
      const min = pair.min ?? defaultMin;
      const fg = overrides.get(pair.foreground) || baseMap.get(pair.foreground);
      const bg = overrides.get(pair.background) || baseMap.get(pair.background);
      const row = {
        theme: themeName,
        foreground: pair.foreground,
        background: pair.background,
        use: pair.use || "",
        min,
      };
      if (!fg || !bg) {
        row.error = `unknown token ${!fg ? pair.foreground : pair.background}`;
      } else if (fg.type !== "color" || bg.type !== "color") {
        row.error = "contrast pairs must reference color tokens";
      } else if (checkTokenValue(fg) || checkTokenValue(bg)) {
        row.error = "contrast pair uses an invalid color value";
      } else {
        row.fgValue = fg.value;
        row.bgValue = bg.value;
        row.ratio = contrastRatio(fg.value, bg.value);
        row.pass = row.ratio >= min;
      }
      rows.push(row);
    }
  }
  return rows;
}

// --- DTCG (W3C Design Tokens 2025.10) value conversion -----------------------

const round4 = (n) => Math.round(n * 10000) / 10000;

export function toDtcgValue(token) {
  const { type, value } = token;
  if (type === "color") {
    const { r, g, b, a } = parseHex(value);
    const hex = `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
    const out = { colorSpace: "srgb", components: [round4(r / 255), round4(g / 255), round4(b / 255)] };
    if (a !== 1) out.alpha = round4(a);
    out.hex = hex;
    return out;
  }
  if (type === "dimension") {
    const m = value.match(/^(-?\d+(?:\.\d+)?)(px|rem)$/);
    return { value: Number(m[1]), unit: m[2] };
  }
  if (type === "duration") {
    const m = value.match(/^(\d+(?:\.\d+)?)(ms|s)$/);
    return { value: Number(m[1]), unit: m[2] };
  }
  return value;
}

// CSS text for a token value, or null for types that do not belong in CSS.
export function toCssValue(token) {
  const { type, value } = token;
  if (type === "string") return null;
  if (type === "fontFamily") {
    const list = Array.isArray(value) ? value : [value];
    return list.map((f) => (/[\s'"]/.test(f) && !/^["']/.test(f) ? `"${f}"` : f)).join(", ");
  }
  return String(value);
}
