import path from "node:path";
import { resolveKitPath } from "./fs-kit.js";
import { validateKit } from "./validate.js";
import { exportKit, importLegacyGhtColors } from "./export.js";
import { buildDigest } from "./digest.js";
import { initKit } from "./init.js";

function printResult(label, result) {
  for (const line of result.errors || []) {
    console.error(`error: ${line}`);
  }
  for (const line of result.warnings || []) {
    console.warn(`warn: ${line}`);
  }
  if (result.ok) {
    console.log(`${label}: OK`);
  } else {
    console.error(`${label}: FAILED (${result.errors.length} error(s))`);
  }
}

export async function runCli(argv) {
  const args = argv.slice(2);
  const cmd = args[0];

  if (!cmd || cmd === "--help" || cmd === "-h") {
    console.log(`bkr — Brand Kit Repository CLI

Usage:
  bkr init <dir> [--role organization|product] [--brand-id id] [--display-name name]
  bkr validate [dir] [--strict]
  bkr export [dir] [--dtcg] [--css] [--tailwind] [--all]
  bkr digest [dir] [--max-bytes N]
  bkr import legacy-ght-colors <dir> <path-to-colors.json>
`);
    return;
  }

  if (cmd === "init") {
    const dir = args[1];
    if (!dir) throw new Error("init requires a target directory");
    const role = getFlag(args, "--role") || "organization";
    const brandId = getFlag(args, "--brand-id") || "example-brand";
    const displayName = getFlag(args, "--display-name") || "Example Brand";
    const out = initKit(resolveKitPath(dir), {
      role,
      brandId,
      displayName,
      parentRepository: getFlag(args, "--parent-repo"),
      parentRef: getFlag(args, "--parent-ref"),
      parentBrandId: getFlag(args, "--parent-brand-id"),
    });
    console.log(`Initialized BKR kit at ${out}`);
    return;
  }

  if (cmd === "validate") {
    const dir = args[1] && !args[1].startsWith("-") ? args[1] : ".";
    const strict = args.includes("--strict");
    const result = await validateKit(resolveKitPath(dir), { strict });
    printResult("validate", result);
    if (!result.ok) process.exitCode = 1;
    return;
  }

  if (cmd === "export") {
    const dir = args[1] && !args[1].startsWith("-") ? args[1] : ".";
    const targets = [];
    if (args.includes("--all")) targets.push("all");
    if (args.includes("--dtcg")) targets.push("dtcg");
    if (args.includes("--css")) targets.push("css");
    if (args.includes("--tailwind")) targets.push("tailwind");
    if (targets.length === 0) targets.push("all");
    const { results, brandId } = exportKit(resolveKitPath(dir), targets);
    console.log(`export: ${brandId} → ${results.length} file(s)`);
    for (const r of results) console.log(`  ${r}`);
    return;
  }

  if (cmd === "digest") {
    const dir = args[1] && !args[1].startsWith("-") ? args[1] : ".";
    const maxBytes = Number(getFlag(args, "--max-bytes")) || undefined;
    const { digestPath, bytes } = buildDigest(resolveKitPath(dir), { maxBytes });
    console.log(`digest: wrote ${digestPath} (${bytes} bytes)`);
    return;
  }

  if (cmd === "import") {
    const sub = args[1];
    if (sub === "legacy-ght-colors") {
      const dir = args[2];
      const jsonPath = args[3];
      if (!dir || !jsonPath) {
        throw new Error("usage: bkr import legacy-ght-colors <kit-dir> <colors.json>");
      }
      const out = importLegacyGhtColors(resolveKitPath(dir), path.resolve(jsonPath));
      console.log(`import: wrote ${out}`);
      return;
    }
    throw new Error(`Unknown import target: ${sub || "(none)"}`);
  }

  throw new Error(`Unknown command: ${cmd}`);
}

function getFlag(args, name) {
  const i = args.indexOf(name);
  if (i === -1) return undefined;
  return args[i + 1];
}
