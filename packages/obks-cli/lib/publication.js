// Decides what a kit is allowed to share outside the organization, and flags files
// that would make impersonation (phishing) easier if they were shared.
import fs from "node:fs";
import path from "node:path";
import { listFiles, pathExists } from "./fs-kit.js";
import { toPosix } from "./tokens.js";

export const VISIBILITIES = ["private", "partner", "public"];

// Safe to share: the generated brand page is a static color/logo sheet.
const ALLOWED_HTML = new Set(["tokens/exports/html/brand-at-a-glance.html"]);

// Each rule: [test(relPath) -> bool, reason]
const RISKY_PATHS = [
  [(p) => p === "identity/naming.md", "internal naming and drafts help attackers write believable pretexts"],
  [(p) => p === "identity/facts.md", "approved facts can include internal numbers (revenue, headcount, customers); share a press version instead"],
  [(p) => p === "copy/claims.md" || p === "voice/topics.md", "claims rules and sensitive-topic positions are internal guidance"],
  [(p) => /(^|\/)(signatures?|email-?templates?|emails?|newsletters?)(\/|$)/i.test(p) || /signature/i.test(path.posix.basename(p)),
    "email and signature templates are ready-made parts for spoofed emails"],
  [(p) => /\.(eml|msg|oft|mjml)$/i.test(p), "email files are ready-made parts for spoofed emails"],
  [(p) => /\.html?$/i.test(p) && !ALLOWED_HTML.has(p), "HTML pages can be reused as look-alike (phishing) pages"],
  [(p) => /(login|log-in|signin|sign-in|password|donat|payment|checkout|invoice)/i.test(p),
    "login, payment, checkout, invoice, and donation designs are what phishing copies"],
  [(p) => /\.(ai|psd|fig|sketch|indd|xd|afdesign|afphoto)$/i.test(p), "design source files make forged documents easier"],
  [(p) => /^(security|digest)\//.test(p) || p === "AGENTS.md" || p === "brandkit.yaml",
    "internal kit files (security checklist, agent context, manifest with contacts) are not meant for outside use"],
  [(p) => /\.(ttf|otf|woff2?|eot)$/i.test(p), "font files usually need a redistribution license (document it in copy/legal.md)"],
];

const TEXT_EXT = /\.(md|txt|json|ya?ml|html?|svg|css|cjs|js)$/i;
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const PHONE = /(?:\+?\d{1,2}[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/g;

export function resolveVisibility(manifest) {
  const pub = manifest.publication || {};
  if (pub.visibility) return pub.visibility;
  // 0.1 fallbacks
  if (pub.allowExternalMirror) return "public";
  if (manifest.profiles?.partnerPublic) return "partner";
  return "private";
}

// Returns { visibility, files: [relPath], errors, warnings }.
export function collectPublication(kitRoot, manifest) {
  const errors = [];
  const warnings = [];
  const pub = manifest.publication || {};
  const visibility = resolveVisibility(manifest);
  const included = pub.includedPaths || [];

  if (manifest.profiles?.partnerPublic !== undefined) {
    warnings.push("profiles.partnerPublic is deprecated; use publication.visibility (run `obks upgrade`)");
  }
  if (pub.allowExternalMirror !== undefined) {
    warnings.push("publication.allowExternalMirror is deprecated; use publication.visibility (run `obks upgrade`)");
  }

  if (visibility === "private") {
    if (included.length) {
      warnings.push("publication.includedPaths is set but visibility is private, so nothing will be shared");
    }
    return { visibility, files: [], errors, warnings };
  }

  if (included.length === 0) {
    errors.push(`publication.visibility is ${visibility} but publication.includedPaths is empty`);
  }

  const files = new Set();
  for (const entry of included) {
    const abs = path.resolve(kitRoot, entry);
    const rel = toPosix(path.relative(kitRoot, abs));
    if (rel.startsWith("..") || path.isAbsolute(rel)) {
      errors.push(`publication.includedPaths: ${entry} is outside the kit`);
      continue;
    }
    if (!pathExists(abs)) {
      errors.push(`publication.includedPaths: ${entry} does not exist`);
      continue;
    }
    const found = fs.statSync(abs).isDirectory() ? listFiles(abs) : [abs];
    for (const f of found) files.add(toPosix(path.relative(kitRoot, f)));
  }

  const securityContact = manifest.contacts?.security?.toLowerCase();
  for (const rel of [...files].sort()) {
    for (const [test, reason] of RISKY_PATHS) {
      if (test(rel)) {
        warnings.push(`sharing ${rel}: ${reason}`);
        break;
      }
    }
    if (TEXT_EXT.test(rel)) {
      const text = fs.readFileSync(path.join(kitRoot, rel), "utf8");
      const emails = [...new Set(text.match(EMAIL) || [])].filter(
        (e) => e.toLowerCase() !== securityContact && !/@example\.(org|com|net)$/i.test(e)
      );
      if (emails.length) {
        warnings.push(`sharing ${rel}: contains email address(es) ${emails.join(", ")}; staff contacts fuel targeted phishing`);
      }
      if (/\.md$/i.test(rel) && /\b(donat\w*|fundrais\w*|gift cards?|wire transfers?|pricing|price lists?|payment terms|bank details|routing numbers?|remit to)\b/i.test(text)) {
        warnings.push(`sharing ${rel}: contains payment, pricing, or fundraising wording, which makes fake payment or donation requests easier; keep it internal or move press text to a separate file`);
      }
      if (PHONE.test(text)) {
        warnings.push(`sharing ${rel}: contains what looks like a phone number`);
      }
      PHONE.lastIndex = 0;
    }
  }

  return { visibility, files: [...files].sort(), errors, warnings };
}
