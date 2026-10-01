import fs from "node:fs";
import path from "node:path";
import {
  ensureDir,
  templatesDir,
  writeManifest,
  writeText,
} from "./fs-kit.js";
import { buildDigest } from "./digest.js";
import { exportKit } from "./export.js";

function copyTemplateTree(srcDir, destDir, vars) {
  for (const name of fs.readdirSync(srcDir)) {
    const src = path.join(srcDir, name);
    const dest = path.join(destDir, name);
    const st = fs.statSync(src);
    if (st.isDirectory()) {
      ensureDir(dest);
      copyTemplateTree(src, dest, vars);
    } else {
      let text = fs.readFileSync(src, "utf8");
      for (const [key, val] of Object.entries(vars)) {
        text = text.replaceAll(`{{${key}}}`, val);
      }
      writeText(dest, text);
    }
  }
}

export function initKit(targetDir, options = {}) {
  const role = options.role || "organization";
  const brandId = options.brandId || "example-brand";
  const displayName = options.displayName || "Example Brand";

  if (fs.existsSync(targetDir) && fs.readdirSync(targetDir).length > 0) {
    throw new Error(`Target directory not empty: ${targetDir}`);
  }

  ensureDir(targetDir);

  const templateName = role === "product" ? "product" : "organization";
  const templateRoot = path.join(templatesDir(), templateName);
  copyTemplateTree(templateRoot, targetDir, {
    brandId,
    displayName,
    parentRepository:
      options.parentRepository ||
      "https://github.com/Good-Heart-Tech/Good-Heart-Tech-Branding-Marketing",
    parentRef: options.parentRef || "main",
    parentBrandId: options.parentBrandId || "good-heart-tech",
  });

  const manifest = {
    schema: "ght.brandkit/v1",
    specVersion: "0.1.0",
    brand: {
      id: brandId,
      displayName,
      status: "draft",
    },
    role,
    profiles: {
      core: true,
      identity: true,
      voice: true,
      visual: true,
      copy: true,
      tokens: true,
      partnerPublic: false,
    },
    consumption: {
      cssVariables: "tokens/exports/css/variables.css",
      agentDigest: "digest/AGENT_CONTEXT.md",
      tailwindTheme: "tokens/exports/tailwind/theme.cjs",
    },
    validation: {
      rulesPack: "@goodheart/bkr-rules-ght",
      minContrastRatio: 4.5,
    },
    contacts: {
      brand: "brand@example.org",
      legal: "legal@example.org",
    },
  };

  if (role === "product") {
    manifest.hierarchy = {
      parent: {
        repository:
          options.parentRepository ||
          "https://github.com/Good-Heart-Tech/Good-Heart-Tech-Branding-Marketing",
        ref: options.parentRef || "main",
        brandId: options.parentBrandId || "good-heart-tech",
      },
    };
  }

  writeManifest(targetDir, manifest);
  exportKit(targetDir, ["all"]);
  buildDigest(targetDir);

  return targetDir;
}
