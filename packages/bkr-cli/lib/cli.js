import path from "node:path";
import { readManifest, resolveKitPath } from "./fs-kit.js";
import { loadTokens } from "./tokens.js";
import { takePreviews } from "./preview.js";
import { validateKit } from "./validate.js";
import { ALL_TARGETS, exportKit, importLegacyGhtColors } from "./export.js";
import { buildDigest } from "./digest.js";
import { initKit } from "./init.js";
import { publishKit } from "./publish.js";
import { upgradeKit } from "./upgrade.js";

const HELP = `bkr: Brand Kit Repository CLI

Usage:
  bkr init <dir> [--role organization|product] [--brand-id id] [--display-name name]
                 [--security-contact url-or-email] [--parent-repo url] [--parent-ref ref]
                 [--parent-brand-id id] [--parent-path ../org-kit]
  bkr validate [dir] [--strict] [--parent <path-to-parent-kit>]
  bkr export [dir] [--all] [--dtcg] [--css] [--tailwind] [--html] [--agent]
  bkr digest [dir] [--max-bytes N]
  bkr publish [dir] [--dry-run] [--out <dir>]
  bkr preview [dir]            (screenshots to tokens/exports/png/, needs Chrome or Edge)
  bkr upgrade [dir]
  bkr import legacy-ght-colors <dir> <path-to-colors.json>

Typical loop after editing a kit:
  bkr export --all && bkr digest && bkr validate
`;

function printResult(label, result) {
  for (const line of result.errors || []) console.error(`error: ${line}`);
  for (const line of result.warnings || []) console.warn(`warn: ${line}`);
  for (const line of result.notes || []) console.log(`note: ${line}`);
  if (result.ok) {
    console.log(`${label}: OK${result.warnings?.length ? ` (${result.warnings.length} warning(s))` : ""}`);
  } else {
    console.error(`${label}: FAILED (${result.errors.length} error(s), ${result.warnings?.length || 0} warning(s))`);
  }
}

const dirArg = (args) => (args[1] && !args[1].startsWith("-") ? args[1] : ".");

export async function runCli(argv) {
  const args = argv.slice(2);
  const cmd = args[0];

  if (!cmd || cmd === "--help" || cmd === "-h") {
    console.log(HELP);
    return;
  }

  if (cmd === "init") {
    const dir = args[1];
    if (!dir || dir.startsWith("-")) throw new Error("init requires a target directory");
    const out = initKit(resolveKitPath(dir), {
      role: getFlag(args, "--role"),
      brandId: getFlag(args, "--brand-id"),
      displayName: getFlag(args, "--display-name"),
      securityContact: getFlag(args, "--security-contact"),
      parentRepository: getFlag(args, "--parent-repo"),
      parentRef: getFlag(args, "--parent-ref"),
      parentBrandId: getFlag(args, "--parent-brand-id"),
      parentPath: getFlag(args, "--parent-path"),
    });
    console.log(`Initialized BKR kit at ${out}`);
    console.log("Next: fill in the TODO(bkr) sections, then run `bkr export --all && bkr digest && bkr validate`.");
    return;
  }

  if (cmd === "validate") {
    const result = await validateKit(resolveKitPath(dirArg(args)), {
      strict: args.includes("--strict"),
      parent: getFlag(args, "--parent"),
    });
    printResult("validate", result);
    if (!result.ok) process.exitCode = 1;
    return;
  }

  if (cmd === "export") {
    const targets = ["all", ...ALL_TARGETS].filter((t) => args.includes(`--${t}`));
    if (targets.length === 0) targets.push("all");
    const { results, brandId, hashWritten } = exportKit(resolveKitPath(dirArg(args)), targets);
    console.log(`export: ${brandId} -> ${results.length} file(s)`);
    for (const r of results) console.log(`  ${r}`);
    if (!hashWritten) console.log("note: partial export; run `bkr export --all` to refresh the stale-export hash");
    return;
  }

  if (cmd === "digest") {
    const maxBytes = Number(getFlag(args, "--max-bytes")) || undefined;
    const { digestPath, bytes } = buildDigest(resolveKitPath(dirArg(args)), { maxBytes });
    console.log(`digest: wrote ${digestPath} (${bytes} bytes)`);
    return;
  }

  if (cmd === "publish") {
    const dryRun = args.includes("--dry-run");
    const result = await publishKit(resolveKitPath(dirArg(args)), { dryRun, out: getFlag(args, "--out") });
    if (result.ok) {
      console.log(`${dryRun ? "Would share" : "Shared"} ${result.files.length} file(s) (${result.visibility}):`);
      for (const f of result.files) console.log(`  ${f}`);
      if (!dryRun) console.log(`Bundle written to ${result.outDir}`);
    }
    printResult(dryRun ? "publish (dry run)" : "publish", result);
    if (!result.ok) process.exitCode = 1;
    return;
  }

  if (cmd === "preview") {
    const kit = resolveKitPath(dirArg(args));
    exportKit(kit, ["all"]);
    const { browser, written } = takePreviews(kit, readManifest(kit), loadTokens(kit));
    exportKit(kit, ["docs"]); // fill <!-- bkr:previews --> now that the PNGs exist
    console.log(`preview: ${written.length} screenshot(s) with ${browser}`);
    for (const w of written) console.log(`  ${w}`);
    return;
  }

  if (cmd === "upgrade") {
    const { changes, todo } = upgradeKit(resolveKitPath(dirArg(args)));
    console.log("upgrade: changes");
    for (const c of changes) console.log(`  - ${c}`);
    if (todo.length) {
      console.log("upgrade: still to do by hand");
      for (const t of todo) console.log(`  - ${t}`);
    }
    console.log("Then run `bkr validate --strict`.");
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

  throw new Error(`Unknown command: ${cmd}. Run bkr --help.`);
}

function getFlag(args, name) {
  const i = args.indexOf(name);
  if (i === -1) return undefined;
  return args[i + 1];
}
