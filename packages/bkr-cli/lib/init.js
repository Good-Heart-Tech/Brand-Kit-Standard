import fs from "node:fs";
import path from "node:path";
import {
  CURRENT_SPEC_VERSION,
  copyTemplateTree,
  ensureDir,
  templatesDir,
  writeManifest,
} from "./fs-kit.js";
import { buildDigest } from "./digest.js";
import { exportKit } from "./export.js";

const GHT_PARENT_REPO = "https://github.com/Good-Heart-Tech/Good-Heart-Tech-Branding-Marketing";

export function initKit(targetDir, options = {}) {
  const role = options.role || "organization";
  if (!["organization", "product"].includes(role)) {
    throw new Error(`--role must be organization or product (got ${role})`);
  }
  const brandId = options.brandId || "example-brand";
  const displayName = options.displayName || "Example Brand";

  if (fs.existsSync(targetDir) && fs.readdirSync(targetDir).length > 0) {
    throw new Error(`Target directory not empty: ${targetDir}`);
  }
  ensureDir(targetDir);

  const parent = {
    repository: options.parentRepository || GHT_PARENT_REPO,
    ref: options.parentRef || "main",
    brandId: options.parentBrandId || "good-heart-tech",
  };

  // Contacts are optional. Without one, templates point people to the website instead.
  const reportImpersonation = options.securityContact
    ? `report it here: ${options.securityContact}`
    : "tell us through the contact page on our website";
  copyTemplateTree(path.join(templatesDir(), role), targetDir, {
    brandId,
    reportImpersonation,
    displayName,
    parentRepository: parent.repository,
    parentRef: parent.ref,
    parentBrandId: parent.brandId,
  });

  const manifest = {
    schema: "ght.brandkit/v1",
    specVersion: CURRENT_SPEC_VERSION,
    brand: { id: brandId, displayName, status: "draft" },
    role,
    profiles: {
      core: true,
      identity: true,
      voice: true,
      visual: true,
      copy: true,
      tokens: true,
      security: true,
    },
    consumption: {
      cssVariables: "tokens/exports/css/variables.css",
      agentDigest: "digest/AGENT_CONTEXT.md",
      tailwindTheme: "tokens/exports/tailwind/theme.cjs",
    },
    publication: {
      visibility: "private",
      includedPaths: [],
    },
    validation: {
      rulesPack: options.rulesPack || "@goodheart/bkr-rules-ght",
      minContrastRatio: 4.5,
      contrastPairs: [
        { foreground: "palette.body", background: "palette.surface", use: "body text" },
        { foreground: "palette.ink", background: "palette.surface", use: "headings" },
        { foreground: "palette.onPrimary", background: "palette.primary", use: "button labels" },
        { foreground: "palette.link", background: "palette.surface", use: "links" },
      ],
    },
  };
  if (options.securityContact) {
    manifest.contacts = { security: options.securityContact };
  }

  if (role === "product") {
    manifest.hierarchy = { parent };
    if (options.parentPath) manifest.hierarchy.parent.path = options.parentPath;
    manifest.validation.contrastPairs = [
      { foreground: "palette.ink", background: "palette.surface", use: "headings and body text" },
      { foreground: "palette.onPrimary", background: "palette.primary", use: "button labels" },
    ];
  }

  writeManifest(targetDir, manifest);
  exportKit(targetDir, ["all"]);
  buildDigest(targetDir);

  return targetDir;
}
