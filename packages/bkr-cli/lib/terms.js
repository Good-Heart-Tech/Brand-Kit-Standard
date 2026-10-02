// Word rules from voice/terms.yaml, and `bkr check-copy`, which flags avoided words in drafts.
//
// voice/terms.yaml:
//   terms:
//     - use: sign in
//       avoid: [log in]
//       reason: Matches the words in our product
//     - avoid: [cheap]
//       use: affordable
//       topic: pricing
//     - use: WOSP
//       avoid: [Wosp, wosp]
//       caseSensitive: true
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { pathExists } from "./fs-kit.js";

export const TERMS_FILE = "voice/terms.yaml";
export const MAX_TERMS = 75;

export function loadTerms(kitRoot) {
  const p = path.join(kitRoot, TERMS_FILE);
  if (!pathExists(p)) return null;
  try {
    return { doc: YAML.parse(fs.readFileSync(p, "utf8")) || {}, error: null };
  } catch (e) {
    return { doc: null, error: e.message };
  }
}

// Returns { errors, warnings } for the terms file itself.
export function checkTerms(loaded, validateTermsDoc) {
  const errors = [];
  const warnings = [];
  if (!loaded) return { errors, warnings };
  if (loaded.error) return { errors: [`${TERMS_FILE}: invalid YAML (${loaded.error})`], warnings };
  if (!validateTermsDoc(loaded.doc)) {
    for (const err of validateTermsDoc.errors || []) errors.push(`${TERMS_FILE}: ${err.instancePath || "/"} ${err.message}`);
    return { errors, warnings };
  }
  const terms = loaded.doc.terms || [];
  if (terms.length > MAX_TERMS) {
    warnings.push(`${TERMS_FILE}: ${terms.length} terms; past about ${MAX_TERMS} people and AI tools stop following the list, so keep only the ones that matter`);
  }
  const norm = (t, s) => (t.caseSensitive ? s : s.toLowerCase());
  const uses = new Map();
  for (const t of terms) if (t.use) uses.set(norm(t, t.use), t.use);
  terms.forEach((t, i) => {
    for (const a of t.avoid || []) {
      if (t.use && norm(t, a) === norm(t, t.use)) errors.push(`${TERMS_FILE}: entry ${i + 1} both uses and avoids "${a}"`);
      else if (uses.has(norm(t, a))) warnings.push(`${TERMS_FILE}: "${a}" is avoided in entry ${i + 1} but recommended elsewhere`);
    }
  });
  return { errors, warnings };
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Blanks out text that should not be checked (code, URLs, HTML tags, generated blocks)
// while keeping line and column positions.
function maskText(text, file) {
  const blank = (m) => m.replace(/[^\n]/g, " ");
  let out = text.replace(/\r\n/g, "\n");
  out = out.replace(/<!--\s*bkr:(\w+)\s*-->[\s\S]*?<!--\s*\/bkr:\1\s*-->/g, blank);
  if (/\.(md|markdown|mdx)$/i.test(file)) {
    out = out.replace(/```[\s\S]*?```/g, blank).replace(/`[^`\n]*`/g, blank);
  }
  if (/\.(html?|mdx|md)$/i.test(file)) {
    out = out.replace(/<(script|style)[\s\S]*?<\/\1>/gi, blank).replace(/<[^>\n]+>/g, blank);
  }
  out = out.replace(/https?:\/\/\S+/g, blank).replace(/<!--[\s\S]*?-->/g, blank);
  return out;
}

// Finds avoided words. Returns [{ line, col, found, use, reason, topic }].
export function findAvoided(text, file, terms) {
  const masked = maskText(text, file);
  const lineStarts = [0];
  for (let i = 0; i < masked.length; i++) if (masked[i] === "\n") lineStarts.push(i + 1);
  const pos = (idx) => {
    let lo = 0;
    let hi = lineStarts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (lineStarts[mid] <= idx) lo = mid;
      else hi = mid - 1;
    }
    return { line: lo + 1, col: idx - lineStarts[lo] + 1 };
  };
  const hits = [];
  for (const t of terms) {
    for (const a of t.avoid || []) {
      const re = new RegExp(`(?<![\\w-])${escapeRe(a).replace(/\\? /g, "\\s+")}(?![\\w-])`, t.caseSensitive ? "g" : "gi");
      for (const m of masked.matchAll(re)) {
        // A case-sensitive rule for a name should not flag the correct spelling.
        if (t.caseSensitive && t.use && m[0] === t.use) continue;
        hits.push({ ...pos(m.index), found: m[0], use: t.use || null, reason: t.reason || "", topic: t.topic || "" });
      }
    }
  }
  return hits.sort((x, y) => x.line - y.line || x.col - y.col);
}

export function formatHit(file, h) {
  const fix = h.use ? `use "${h.use}"` : "avoid this word";
  return `${file}:${h.line}:${h.col}  "${h.found}": ${fix}${h.reason ? ` (${h.reason})` : ""}`;
}
