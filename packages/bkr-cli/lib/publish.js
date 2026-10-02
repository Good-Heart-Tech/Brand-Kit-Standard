// `bkr publish`: copies only the shareable files into a bundle folder.
import fs from "node:fs";
import path from "node:path";
import { ensureDir, pathExists, writeText } from "./fs-kit.js";
import { collectPublication } from "./publication.js";
import { validateKit } from "./validate.js";

const MARKER = ".bkr-bundle";

export async function publishKit(kitRoot, { dryRun = false, out } = {}) {
  const result = await validateKit(kitRoot);
  if (!result.manifest) {
    return { ok: false, errors: result.errors, warnings: [], files: [] };
  }
  const manifest = result.manifest;
  const pub = collectPublication(kitRoot, manifest);

  if (pub.visibility === "private") {
    return {
      ok: false,
      errors: ["This kit is private (publication.visibility). Set it to partner or public and list publication.includedPaths to share files."],
      warnings: [],
      files: [],
    };
  }
  if (!result.ok) {
    return { ok: false, errors: ["Fix validation errors before publishing.", ...result.errors], warnings: result.warnings, files: [] };
  }

  const outDir = path.resolve(out || path.join(kitRoot, "dist", "brand-bundle"));
  const summary = { ok: true, errors: [], warnings: pub.warnings, files: pub.files, outDir, visibility: pub.visibility, dryRun };
  if (dryRun) return summary;

  // Only clear a folder that is empty or that bkr created before.
  if (pathExists(outDir) && fs.readdirSync(outDir).length > 0) {
    if (!pathExists(path.join(outDir, MARKER))) {
      return { ...summary, ok: false, errors: [`${outDir} is not empty and was not created by bkr publish; choose another --out`] };
    }
    fs.rmSync(outDir, { recursive: true, force: true });
  }
  ensureDir(outDir);

  for (const rel of pub.files) {
    const dest = path.join(outDir, rel);
    ensureDir(path.dirname(dest));
    fs.copyFileSync(path.join(kitRoot, rel), dest);
  }

  writeText(path.join(outDir, MARKER), "Created by bkr publish. Safe to delete and rebuild.\n");
  writeText(path.join(outDir, "BUNDLE.md"), bundleReadme(manifest, pub));
  return summary;
}

function bundleReadme(manifest, pub) {
  const audience = pub.visibility === "public" ? "the public (for example a press kit)" : "approved partners";
  return `# ${manifest.brand.displayName} brand files

These files are shared with ${audience}. They were exported from the
${manifest.brand.displayName} brand kit with \`bkr publish\`.

## Use

- Use the logos and colors only to refer to ${manifest.brand.displayName}.
- Do not change, recolor, or stretch the logos.${pub.files.includes("visual/logo.md") ? " See `visual/logo.md`." : ""}
- Do not imply endorsement or partnership without written approval.
- The name and logo are trademarks of ${manifest.brand.displayName}.

${manifest.contacts?.security ? `## Report impersonation

If you see a website, email, or social account pretending to be ${manifest.brand.displayName},
report it to ${manifest.contacts.security}.
` : ""}
## Files

${pub.files.map((f) => `- \`${f}\``).join("\n")}
`;
}
