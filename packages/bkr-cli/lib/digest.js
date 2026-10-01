import fs from "node:fs";
import path from "node:path";
import {
  ensureDir,
  pathExists,
  readManifest,
  writeText,
} from "./fs-kit.js";

const DEFAULT_MAX_BYTES = 12000;

function readHead(filePath, maxChars = 2000) {
  if (!pathExists(filePath)) return "";
  const raw = fs.readFileSync(filePath, "utf8");
  return raw.length > maxChars ? `${raw.slice(0, maxChars)}\n…` : raw;
}

function bulletLinesFromMarkdown(md, maxItems = 8) {
  return md
    .split("\n")
    .filter((line) => /^[-*]/.test(line.trim()))
    .slice(0, maxItems)
    .join("\n");
}

export function buildDigest(kitRoot, options = {}) {
  const maxBytes = options.maxBytes || DEFAULT_MAX_BYTES;
  const manifest = readManifest(kitRoot);

  const about = readHead(path.join(kitRoot, "identity", "about.md"), 1500);
  const tone = readHead(path.join(kitRoot, "voice", "tone.md"), 1500);
  const logo = readHead(path.join(kitRoot, "visual", "logo.md"), 1200);
  const vocabulary = bulletLinesFromMarkdown(
    readHead(path.join(kitRoot, "voice", "vocabulary.md"), 2500)
  );

  let body = `# Agent context (generated)

> Regenerate: \`bkr digest\`. Normative colors live in \`tokens/*.bkr.json\` and exports.

## Brand

- **Id:** ${manifest.brand.id}
- **Name:** ${manifest.brand.displayName}
- **Status:** ${manifest.brand.status}
- **Role:** ${manifest.role}
`;

  if (manifest.hierarchy?.parent) {
    body += `- **Parent kit:** ${manifest.hierarchy.parent.repository} @ ${manifest.hierarchy.parent.ref}\n`;
  }

  body += `
## Identity (excerpt)

${about || "_No identity/about.md excerpt._"}

## Voice (excerpt)

${tone || "_No voice/tone.md excerpt._"}

## Vocabulary highlights

${vocabulary || "_No bullet vocabulary lines found._"}

## Logo rules (excerpt)

${logo || "_No visual/logo.md excerpt._"}

## Consumption

- CSS variables: \`${manifest.consumption.cssVariables}\`
- Do not invent hex outside exported tokens.
- Load full \`copy/legal.md\` before external publication.
`;

  if (Buffer.byteLength(body, "utf8") > maxBytes) {
    body = `${body.slice(0, maxBytes - 20)}\n\n… [truncated]\n`;
  }

  const digestPath = path.join(kitRoot, manifest.consumption.agentDigest);
  ensureDir(path.dirname(digestPath));
  writeText(digestPath, body);

  const agentsPath = path.join(kitRoot, "AGENTS.md");
  const agentsDoc = `# Agent instructions (BKR)

This repository follows the **Brand Kit Repository (BKR)** layout (\`ght.brandkit/v1\`).

## Load order

1. \`brandkit.yaml\` — profiles, role, parent kit
2. \`${manifest.consumption.agentDigest}\` — size-capped summary (generated)
3. As needed: \`voice/\`, \`visual/logo.md\`, \`tokens/exports/css/variables.css\`

## Rules

- **Tokens win** over prose for hex, spacing, and type scales.
- **Product kits** inherit palette rules from \`hierarchy.parent\`; do not introduce a second primary.
- Regenerate digest after substantive edits: \`bkr digest\`.

## Human docs

See \`README.md\` for the file index.
`;

  writeText(agentsPath, agentsDoc);

  return { digestPath, agentsPath, bytes: Buffer.byteLength(body, "utf8") };
}
