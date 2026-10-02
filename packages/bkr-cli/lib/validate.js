import Ajv from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import {
  CURRENT_SPEC_VERSION,
  SUPPORTED_SPEC,
  listFiles,
  pathExists,
  readJson,
  readManifest,
  schemaPath,
} from "./fs-kit.js";
import { checkTokenValue, evaluateContrast, loadTokens, toPosix } from "./tokens.js";
import { computeSourceHash, readStoredHash } from "./export.js";
import { collectPublication } from "./publication.js";
import { checkMarkdownBlocks } from "./visuals.js";

const PROFILE_PATHS = {
  identity: ["identity/about.md", "identity/naming.md"],
  voice: ["voice/tone.md", "voice/vocabulary.md"],
  visual: ["visual/palette.md", "visual/logo.md", "visual/accessibility.md"],
  copy: ["copy/messaging.md", "copy/legal.md"],
  tokens: ["tokens/colors.bkr.json"],
  security: ["security/brand-protection.md"],
};

// Marker left in templates for sections a person still needs to write.
const TODO_MARKER = "TODO(bkr)";
const TODO_LINE = /^\s*>?\s*TODO\(bkr\):/m;

// Words that look like token names in prose but are manifest or token field names.
const FIELD_WORDS = new Set([
  "value", "type", "description", "usage", "contexts", "avoid", "aliases", "inheritsFrom",
  "extensions", "meta", "tokens", "brandId", "layer",
]);

function manifestKeys(obj, out = new Set()) {
  if (obj && typeof obj === "object" && !Array.isArray(obj)) {
    for (const [k, v] of Object.entries(obj)) {
      out.add(k);
      manifestKeys(v, out);
    }
  }
  return out;
}

export function createValidator() {
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  return {
    validateManifest: ajv.compile(readJson(schemaPath("brandkit.schema.json"))),
    validateTokenDoc: ajv.compile(readJson(schemaPath("bkr-token.schema.json"))),
  };
}

// options: { strict, parent } where parent is a local path to the parent kit.
export async function validateKit(kitRoot, options = {}) {
  const strict = Boolean(options.strict);
  const errors = [];
  const warnings = [];
  const notes = [];

  if (!pathExists(path.join(kitRoot, "README.md"))) errors.push("Missing README.md");
  if (!pathExists(path.join(kitRoot, "AGENTS.md"))) errors.push("Missing AGENTS.md (run `bkr digest`)");

  let manifest;
  try {
    manifest = readManifest(kitRoot);
  } catch (e) {
    errors.push(e.message);
    return { ok: false, errors, warnings, notes, manifest: null };
  }

  const { validateManifest, validateTokenDoc } = createValidator();
  if (!validateManifest(manifest)) {
    for (const err of validateManifest.errors || []) {
      errors.push(`brandkit.yaml: ${err.instancePath || "/"} ${err.message}`);
    }
    // Later checks assume a well-formed manifest.
    if (!manifest?.brand?.id || !manifest?.profiles) {
      return { ok: false, errors, warnings, notes, manifest };
    }
  }

  if (!SUPPORTED_SPEC.test(String(manifest.specVersion))) {
    errors.push(`specVersion ${manifest.specVersion} is not supported by this CLI (supports 0.1.x and 0.2.x)`);
  } else if (String(manifest.specVersion).startsWith("0.1.")) {
    warnings.push(`specVersion ${manifest.specVersion} is out of date; run \`bkr upgrade\` to move to ${CURRENT_SPEC_VERSION}`);
  }

  // --- Required files per profile
  const profiles = manifest.profiles || {};
  for (const [profile, enabled] of Object.entries(profiles)) {
    if (!enabled) continue;
    for (const rel of PROFILE_PATHS[profile] || []) {
      if (!pathExists(path.join(kitRoot, rel))) errors.push(`Profile ${profile}: missing ${rel}`);
    }
  }
  if (!profiles.security) {
    warnings.push("Profile security is off: add security/brand-protection.md and set profiles.security: true");
  }

  if (profiles.visual) {
    const logos = listFiles(path.join(kitRoot, "assets", "logo"));
    if (!pathExists(path.join(kitRoot, "assets", "logo"))) errors.push("Profile visual: missing assets/logo/");
    else if (logos.length === 0) errors.push("Profile visual: assets/logo/ is empty");
  }
  errors.push(...checkSvgs(kitRoot));

  // --- Tokens
  let tokens = null;
  if (profiles.tokens) {
    tokens = loadTokens(kitRoot);
    if (tokens.files.length === 0) errors.push("No tokens/*.bkr.json files found");
    checkTokenFiles(tokens, manifest, validateTokenDoc, errors, warnings);

    for (const row of evaluateContrast(manifest, tokens)) {
      const label = `contrast (${row.theme}): ${row.foreground} on ${row.background}`;
      if (row.error) errors.push(`${label}: ${row.error}`);
      else if (!row.pass) errors.push(`${label} is ${row.ratio.toFixed(2)}:1, needs ${row.min}:1`);
    }
    if (!(manifest.validation?.contrastPairs || []).length) {
      warnings.push("validation.contrastPairs is empty: list your text/background pairs so contrast is checked");
    }

    warnings.push(...checkNarrativeRefs(kitRoot, tokens, manifestKeys(manifest)));

    // People cannot see a color from a hex code; READMEs must show the palette.
    if (tokens.files.every((f) => f.doc)) {
      const md = checkMarkdownBlocks(kitRoot, manifest, tokens);
      if (profiles.visual && !md.readmeVisual) {
        warnings.push(
          "README.md does not show the colors: add ![Colors](tokens/exports/svg/palette.svg) or a <!-- bkr:palette --> block"
        );
      }
      for (const rel of md.stale) {
        warnings.push(`${rel}: bkr:palette/contrast/logos block is out of date: run \`bkr export --all\``);
      }
    }

    const stored = readStoredHash(kitRoot);
    if (!stored) {
      warnings.push("tokens/exports/.bkr-export-hash missing: run `bkr export --all`");
    } else if (tokens.files.every((f) => f.doc) && stored !== computeSourceHash(kitRoot)) {
      warnings.push("tokens/exports/ is out of date with tokens/ or brandkit.yaml: run `bkr export --all`");
    }
  }

  // --- Sharing / publication
  const pub = collectPublication(kitRoot, manifest);
  errors.push(...pub.errors);
  warnings.push(...pub.warnings);

  // --- Parent kit
  const parentDir = options.parent
    ? path.resolve(options.parent)
    : manifest.hierarchy?.parent?.path
      ? path.resolve(kitRoot, manifest.hierarchy.parent.path)
      : null;
  if (manifest.role === "product" || manifest.hierarchy?.parent) {
    // A manifest path is a convenience for local sibling checkouts; CI may not have it.
    if (parentDir && !options.parent && !pathExists(path.join(parentDir, "brandkit.yaml"))) {
      notes.push(`parent tokens not checked: hierarchy.parent.path (${manifest.hierarchy.parent.path}) has no brandkit.yaml here`);
    } else if (parentDir) {
      checkParent(kitRoot, manifest, tokens || loadTokens(kitRoot), parentDir, errors, warnings);
    } else {
      notes.push("parent tokens not checked: pass --parent <path-to-parent-kit> or set hierarchy.parent.path");
    }
  }

  // --- Unfinished template sections
  const digestRel = toPosix(path.normalize(manifest.consumption?.agentDigest || ""));
  const todos = listFiles(kitRoot)
    .map((f) => [f, toPosix(path.relative(kitRoot, f))])
    .filter(([f, rel]) => f.endsWith(".md") && rel !== digestRel && rel !== "AGENTS.md")
    .filter(([f]) => TODO_LINE.test(fs.readFileSync(f, "utf8")))
    .map(([, rel]) => rel);
  if (todos.length) {
    const msg = `${todos.length} file(s) still have ${TODO_MARKER} sections to fill in: ${todos.join(", ")}`;
    if (manifest.brand.status === "active") errors.push(`${msg} (brand.status is active)`);
    else warnings.push(msg);
  }

  // --- Rule pack
  if (manifest.validation?.rulesPack) {
    try {
      const pack = await loadRulesPack(manifest.validation.rulesPack, kitRoot);
      const packResult = await pack.validate({ kitRoot, manifest, tokens });
      errors.push(...(packResult.errors || []));
      warnings.push(...(packResult.warnings || []));
    } catch (e) {
      warnings.push(`rulesPack ${manifest.validation.rulesPack}: ${e.message}`);
    }
  }

  const ok = errors.length === 0 && (!strict || warnings.length === 0);
  return { ok, errors, warnings, notes, manifest };
}

function checkTokenFiles(tokens, manifest, validateTokenDoc, errors, warnings) {
  for (const f of tokens.files) {
    if (!f.doc) {
      errors.push(`${f.rel}: invalid JSON (${f.error})`);
      continue;
    }
    if (!validateTokenDoc(f.doc)) {
      for (const err of validateTokenDoc.errors || []) {
        errors.push(`${f.rel}: ${err.instancePath || "/"} ${err.message}`);
      }
    }
    if (f.doc.meta?.brandId && f.doc.meta.brandId !== manifest.brand.id) {
      warnings.push(`${f.rel}: meta.brandId does not match manifest brand.id`);
    }
  }

  const seen = new Map();
  for (const t of tokens.base) {
    const msg = checkTokenValue(t.token);
    if (msg) errors.push(`${t.rel}: ${t.path}: ${msg}`);
    if (seen.has(t.path)) errors.push(`${t.rel}: ${t.path} is also defined in ${seen.get(t.path)}`);
    seen.set(t.path, t.rel);
  }

  const baseMap = new Map(tokens.base.map((t) => [t.path, t.token]));
  for (const [theme, entries] of Object.entries(tokens.themes)) {
    for (const t of entries) {
      const msg = checkTokenValue(t.token);
      if (msg) errors.push(`${t.rel}: ${t.path}: ${msg}`);
      const base = baseMap.get(t.path);
      if (!base) errors.push(`${t.rel}: theme ${theme} overrides ${t.path}, which is not a base token`);
      else if (base.type !== t.token.type) errors.push(`${t.rel}: ${t.path} type ${t.token.type} does not match base type ${base.type}`);
    }
  }
}

// Unsafe SVGs are an XSS risk wherever logos get embedded or shared.
function checkSvgs(kitRoot) {
  const errors = [];
  for (const f of listFiles(path.join(kitRoot, "assets"))) {
    if (!f.toLowerCase().endsWith(".svg")) continue;
    const text = fs.readFileSync(f, "utf8");
    const rel = toPosix(path.relative(kitRoot, f));
    if (/<script/i.test(text)) errors.push(`${rel}: SVG contains <script>; remove it`);
    if (/\son[a-z]+\s*=/i.test(text)) errors.push(`${rel}: SVG contains an event handler (on...=); remove it`);
    if (/<foreignObject/i.test(text)) errors.push(`${rel}: SVG contains <foreignObject>; remove it`);
    if (/<!ENTITY/i.test(text)) errors.push(`${rel}: SVG declares XML entities; remove them`);
    if (/(href|src)\s*=\s*["']\s*(https?:|javascript:|data:text\/html)/i.test(text)) {
      errors.push(`${rel}: SVG loads an external or script URL; embed assets instead`);
    }
  }
  return errors;
}

// Finds `backticked` token names in visual/*.md that no longer exist in tokens/.
// Ignore a word with: <!-- bkr-ignore-refs: word other -->
function checkNarrativeRefs(kitRoot, tokens, reserved) {
  const warnings = [];
  const known = new Set();
  const groups = new Set([...tokens.base, ...Object.values(tokens.themes).flat()].map((t) => t.group));
  for (const t of [...tokens.base, ...Object.values(tokens.themes).flat()]) {
    known.add(t.name);
    known.add(t.group);
    known.add(t.path);
  }
  for (const theme of Object.keys(tokens.themes)) known.add(theme);

  for (const f of listFiles(path.join(kitRoot, "visual"))) {
    if (!f.endsWith(".md")) continue;
    const text = fs.readFileSync(f, "utf8");
    const ignored = new Set(
      [...text.matchAll(/<!--\s*bkr-ignore-refs:([^>]*)-->/g)].flatMap((m) => m[1].trim().split(/\s+/))
    );
    const rel = toPosix(path.relative(kitRoot, f));
    for (const m of text.matchAll(/`([^`\s]+)`/g)) {
      const word = m[1];
      if (!/^[A-Za-z][A-Za-z0-9-]*(\.[A-Za-z][A-Za-z0-9-]*)?$/.test(word)) continue;
      if (/\.(svg|png|jpe?g|ico|webp|md|json|css|cjs|html|ya?ml)$/i.test(word)) continue;
      if (known.has(word) || ignored.has(word)) continue;
      const [first, second] = word.split(".");
      // Dotted words are only token paths when they start with a token group.
      if (second !== undefined && !groups.has(first)) continue;
      if (second === undefined && (FIELD_WORDS.has(word) || reserved.has(word))) continue;
      warnings.push(`${rel}: mentions \`${word}\`, which is not a token in tokens/ (fix the text or add <!-- bkr-ignore-refs: ${word} -->)`);
    }
  }
  return warnings;
}

function checkParent(kitRoot, manifest, tokens, parentDir, errors, warnings) {
  let parentManifest;
  try {
    parentManifest = readManifest(parentDir);
  } catch (e) {
    errors.push(`parent kit: ${e.message}`);
    return;
  }
  const expected = manifest.hierarchy?.parent?.brandId;
  if (expected && parentManifest.brand?.id !== expected) {
    errors.push(`parent kit at ${parentDir} is ${parentManifest.brand?.id}, but hierarchy.parent.brandId is ${expected}`);
  }
  if (parentManifest.role === "product") {
    warnings.push("parent kit is itself a product kit; parents are usually organization kits");
  }

  const parentTokens = new Map(loadTokens(parentDir).base.map((t) => [t.path, t.token]));
  for (const t of tokens.base) {
    const from = t.token.inheritsFrom;
    if (from) {
      const p = parentTokens.get(from);
      if (!p) {
        errors.push(`${t.rel}: ${t.path} inheritsFrom ${from}, which the parent kit does not define`);
      } else if (p.type !== t.token.type) {
        errors.push(`${t.rel}: ${t.path} type ${t.token.type} does not match parent ${from} (${p.type})`);
      } else if (JSON.stringify(normalize(p.value)) !== JSON.stringify(normalize(t.token.value))) {
        errors.push(`${t.rel}: ${t.path} is ${JSON.stringify(t.token.value)} but parent ${from} is ${JSON.stringify(p.value)}`);
      }
    } else if (parentTokens.has(t.path)) {
      errors.push(`${t.rel}: ${t.path} redefines a parent token; add "inheritsFrom": "${t.path}" or use a new name`);
    }
  }
}

const normalize = (v) => (typeof v === "string" ? v.toLowerCase() : v);

// Rule packs: a package name (resolved from the kit first, then from this CLI) or a
// local path like ./rules/index.js. A pack exports validate({ kitRoot, manifest, tokens }).
async function loadRulesPack(name, kitRoot) {
  if (name.startsWith(".") || path.isAbsolute(name)) {
    return import(pathToFileURL(path.resolve(kitRoot, name)).href);
  }
  try {
    const fromKit = createRequire(path.join(kitRoot, "package.json")).resolve(name);
    return import(pathToFileURL(fromKit).href);
  } catch {
    return import(name);
  }
}
