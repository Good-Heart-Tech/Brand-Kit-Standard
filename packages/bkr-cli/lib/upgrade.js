// `bkr upgrade`: moves a 0.1 kit to the current spec without losing comments in brandkit.yaml.
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import {
  CURRENT_SPEC_VERSION,
  LEGACY_TOKEN_SCHEMA_URL,
  MANIFEST_SCHEMA_URL,
  TOKEN_SCHEMA_URL,
  fillTemplate,
  pathExists,
  templatesDir,
  writeJson,
  writeText,
} from "./fs-kit.js";
import { kebab, loadTokens } from "./tokens.js";
import { resolveVisibility } from "./publication.js";
import { exportKit } from "./export.js";
import { buildDigest } from "./digest.js";

export function upgradeKit(kitRoot) {
  const yamlPath = path.join(kitRoot, "brandkit.yaml");
  if (!pathExists(yamlPath)) throw new Error(`Missing brandkit.yaml at ${yamlPath}`);
  const raw = fs.readFileSync(yamlPath, "utf8");
  const doc = YAML.parseDocument(raw);
  const manifest = doc.toJS();
  const changes = [];
  const todo = [];

  if (String(manifest.specVersion).startsWith("0.2.")) {
    changes.push(`already on spec ${manifest.specVersion}; refreshed exports and digest only`);
  } else {
    doc.set("specVersion", CURRENT_SPEC_VERSION);
    changes.push(`specVersion ${manifest.specVersion} -> ${CURRENT_SPEC_VERSION}`);
  }

  // Sharing: replace partnerPublic / allowExternalMirror with publication.visibility
  const visibility = resolveVisibility(manifest);
  if (!manifest.publication?.visibility) {
    doc.setIn(["publication", "visibility"], visibility);
    changes.push(`publication.visibility set to ${visibility}`);
  }
  if (doc.hasIn(["publication", "allowExternalMirror"])) {
    doc.deleteIn(["publication", "allowExternalMirror"]);
    changes.push("removed deprecated publication.allowExternalMirror");
  }
  if (doc.hasIn(["profiles", "partnerPublic"])) {
    doc.deleteIn(["profiles", "partnerPublic"]);
    changes.push("removed deprecated profiles.partnerPublic");
    if (pathExists(path.join(kitRoot, "profiles", "partner-public"))) {
      todo.push("profiles/partner-public/ is no longer used; move any notes into brandkit.yaml publication.includedPaths, then delete the folder");
    }
  }

  // Security profile and brand-protection checklist
  if (!manifest.profiles?.security) {
    doc.setIn(["profiles", "security"], true);
    changes.push("profiles.security enabled");
  }
  const protection = path.join(kitRoot, "security", "brand-protection.md");
  if (!pathExists(protection)) {
    const tpl = fs.readFileSync(path.join(templatesDir(), "organization", "security", "brand-protection.md"), "utf8");
    writeText(protection, fillTemplate(tpl, { displayName: manifest.brand.displayName, brandId: manifest.brand.id }));
    changes.push("added security/brand-protection.md checklist");
  }
  if (!(manifest.validation?.contrastPairs || []).length) {
    todo.push("add validation.contrastPairs listing your text/background color pairs");
  }

  // Generated files that moved
  const oldSwatches = path.join(kitRoot, "examples", "swatches.html");
  if (pathExists(oldSwatches)) {
    todo.push("examples/swatches.html is replaced by tokens/exports/html/brand-at-a-glance.html; delete the old file");
  }

  // Human-visible colors (0.3): palette image in the README, generated blocks in visual/
  const readme = path.join(kitRoot, "README.md");
  if (pathExists(readme)) {
    const text = fs.readFileSync(readme, "utf8");
    if (!text.includes("tokens/exports/svg/palette.svg") && !/<!--\s*bkr:palette\s*-->/.test(text)) {
      const nl = text.indexOf("\n");
      const at = /^# /.test(text) && nl !== -1 ? nl + 1 : 0;
      writeText(readme, `${text.slice(0, at)}\n![Colors](tokens/exports/svg/palette.svg)\n\n${text.slice(at).replace(/^\n+/, "")}`);
      changes.push("README.md now shows the palette image");
    }
  }
  for (const [rel, kind, heading] of [
    ["visual/palette.md", "palette", "All colors"],
    ["visual/accessibility.md", "contrast", "Checked text and background pairs"],
    ["visual/logo.md", "logos", "Logo files"],
  ]) {
    const p = path.join(kitRoot, rel);
    if (!pathExists(p)) continue;
    const text = fs.readFileSync(p, "utf8");
    if (new RegExp(`<!--\\s*bkr:${kind}\\s*-->`).test(text)) continue;
    writeText(p, `${text.replace(/\s*$/, "")}\n\n## ${heading}\n\n<!-- bkr:${kind} -->\n`);
    changes.push(`${rel}: added a generated bkr:${kind} block`);
  }

  // .gitignore for publish output
  const gi = path.join(kitRoot, ".gitignore");
  const giText = pathExists(gi) ? fs.readFileSync(gi, "utf8") : "";
  if (!/^dist\/?$/m.test(giText)) {
    writeText(gi, `${giText}${giText && !giText.endsWith("\n") ? "\n" : ""}dist/\n`);
    changes.push(".gitignore now ignores dist/ (bkr publish output)");
  }

  // Manifest schema hint for editors
  let text = doc.toString({ lineWidth: 0 });
  if (!text.includes("yaml-language-server")) {
    text = `# yaml-language-server: $schema=${MANIFEST_SCHEMA_URL}\n${text}`;
  }
  writeText(yamlPath, text);

  // Token $schema URLs
  for (const f of loadTokens(kitRoot).files) {
    if (!f.doc) continue;
    if (!f.doc.$schema || f.doc.$schema === LEGACY_TOKEN_SCHEMA_URL) {
      const { $schema: _old, ...rest } = f.doc;
      writeJson(f.file, { $schema: TOKEN_SCHEMA_URL, ...rest });
      changes.push(`${f.rel}: $schema -> ${TOKEN_SCHEMA_URL}`);
    }
  }

  // CSS variable names changed from camelCase to kebab-case
  const renamed = cssRenames(kitRoot, manifest);
  if (renamed.length) {
    todo.push(
      `CSS variable names changed. Update apps that use them:\n${renamed.map(([a, b]) => `      ${a} -> ${b}`).join("\n")}`
    );
  }
  if (pathExists(path.join(kitRoot, "tokens", "exports", "css", "dark-theme.css"))) {
    changes.push("dark theme now ships inside variables.css (dark-theme.css removed)");
  }

  exportKit(kitRoot, ["all"]);
  buildDigest(kitRoot);
  changes.push("regenerated tokens/exports/, digest, and AGENTS.md");

  return { changes, todo };
}

function cssRenames(kitRoot, manifest) {
  const prefix = manifest.consumption?.cssPrefix || manifest.brand.id.replace(/-/g, "");
  const out = [];
  for (const t of loadTokens(kitRoot).base) {
    const oldName = `--${prefix}-${t.group}-${t.name}`.replace(/_/g, "-");
    const newName = `--${prefix}-${kebab(t.group)}-${kebab(t.name)}`;
    if (oldName !== newName) out.push([oldName, newName]);
  }
  return out;
}
