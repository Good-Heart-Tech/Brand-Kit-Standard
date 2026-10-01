import Ajv from "ajv";
import addFormats from "ajv-formats";
import fs from "node:fs";
import path from "node:path";
import {
  listBkrTokenFiles,
  pathExists,
  readJson,
  readManifest,
  schemaPath,
} from "./fs-kit.js";

const PROFILE_PATHS = {
  identity: ["identity/about.md", "identity/naming.md"],
  voice: ["voice/tone.md", "voice/vocabulary.md"],
  visual: ["visual/palette.md", "visual/logo.md", "visual/accessibility.md"],
  copy: ["copy/messaging.md", "copy/legal.md"],
  tokens: ["tokens/colors.bkr.json"],
};

export function createValidator() {
  const ajv = new Ajv({ allErrors: true, strict: false, validateSchema: false });
  addFormats(ajv);
  const brandkitSchema = readJson(schemaPath("brandkit.schema.json"));
  const tokenSchema = readJson(schemaPath("bkr-token.schema.json"));
  delete brandkitSchema.$schema;
  delete tokenSchema.$schema;
  return {
    validateManifest: ajv.compile(brandkitSchema),
    validateTokenDoc: ajv.compile(tokenSchema),
  };
}

export async function validateKit(kitRoot, options = {}) {
  const strict = Boolean(options.strict);
  const errors = [];
  const warnings = [];

  if (!pathExists(path.join(kitRoot, "README.md"))) {
    errors.push("Missing README.md");
  }
  if (!pathExists(path.join(kitRoot, "AGENTS.md"))) {
    errors.push("Missing AGENTS.md");
  }

  let manifest;
  try {
    manifest = readManifest(kitRoot);
  } catch (e) {
    errors.push(e.message);
    return { ok: false, errors, warnings, manifest: null };
  }

  const { validateManifest, validateTokenDoc } = createValidator();
  if (!validateManifest(manifest)) {
    for (const err of validateManifest.errors || []) {
      errors.push(`brandkit.yaml: ${err.instancePath || "/"} ${err.message}`);
    }
  }

  const profiles = manifest.profiles || {};
  for (const [profile, enabled] of Object.entries(profiles)) {
    if (profile === "core" || !enabled) continue;
    const required = PROFILE_PATHS[profile];
    if (!required) continue;
    for (const rel of required) {
      const abs = path.join(kitRoot, rel);
      if (!pathExists(abs)) {
        errors.push(`Profile ${profile}: missing ${rel}`);
      }
    }
  }

  if (profiles.visual) {
    const logoDir = path.join(kitRoot, "assets", "logo");
    if (!pathExists(logoDir)) {
      errors.push("Profile visual: missing assets/logo/");
    } else {
      const files = fs.readdirSync(logoDir).filter((f) => !f.startsWith("."));
      if (files.length === 0) {
        errors.push("Profile visual: assets/logo/ is empty");
      }
    }
  }

  if (profiles.tokens) {
    const tokenFiles = listBkrTokenFiles(kitRoot);
    if (tokenFiles.length === 0) {
      errors.push("No tokens/*.bkr.json files found");
    }
    for (const fp of tokenFiles) {
      let doc;
      try {
        doc = readJson(fp);
      } catch (e) {
        errors.push(`${fp}: invalid JSON (${e.message})`);
        continue;
      }
      if (!validateTokenDoc(doc)) {
        for (const err of validateTokenDoc.errors || []) {
          errors.push(`${fp}: ${err.instancePath || "/"} ${err.message}`);
        }
      }
      if (doc.meta?.brandId && doc.meta.brandId !== manifest.brand.id) {
        warnings.push(`${fp}: meta.brandId does not match manifest brand.id`);
      }
    }

    const exportsManifest = path.join(kitRoot, "tokens", "exports", ".bkr-export-hash");
    if (!pathExists(exportsManifest)) {
      warnings.push(
        "tokens/exports/.bkr-export-hash missing — run `bkr export --all`"
      );
    }
  }

  if (manifest.validation?.rulesPack) {
    try {
      const pack = await loadRulesPack(manifest.validation.rulesPack);
      const packResult = pack.validate({ kitRoot, manifest });
      errors.push(...(packResult.errors || []));
      warnings.push(...(packResult.warnings || []));
    } catch (e) {
      warnings.push(`rulesPack: ${e.message}`);
    }
  }

  const ok = errors.length === 0 && (!strict || warnings.length === 0);
  return { ok, errors, warnings, manifest };
}

async function loadRulesPack(name) {
  if (name === "@goodheart/bkr-rules-ght") {
    return import("@goodheart/bkr-rules-ght");
  }
  throw new Error(`Unknown rules pack ${name}`);
}
