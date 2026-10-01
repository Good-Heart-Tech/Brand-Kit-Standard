import fs from "node:fs";
import path from "node:path";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

/**
 * Optional rule pack — encodes GHT/Honey House conventions on top of core BKR schema.
 */
export function validate({ kitRoot, manifest }) {
  const errors = [];
  const warnings = [];

  if (manifest.role === "product" && !manifest.hierarchy?.parent) {
    errors.push("GHT rule: product kits must declare hierarchy.parent");
  }

  const colorsPath = path.join(kitRoot, "tokens", "colors.bkr.json");
  if (fs.existsSync(colorsPath)) {
    const doc = readJson(colorsPath);
    const primary = doc.tokens?.palette?.primary || doc.tokens?.color?.primary;
    if (primary && !primary.description) {
      warnings.push("GHT rule: primary color should include a description");
    }

    for (const group of Object.values(doc.tokens || {})) {
      for (const [name, token] of Object.entries(group)) {
        if (token.inheritsFrom && manifest.role !== "product") {
          warnings.push(
            `GHT rule: token ${name} uses inheritsFrom but kit role is not product`
          );
        }
      }
    }
  }

  if (manifest.brand.id.includes("_")) {
    errors.push("GHT rule: brand.id must use hyphens, not underscores");
  }

  return { errors, warnings };
}
