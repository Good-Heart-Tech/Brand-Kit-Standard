// Regenerates and strictly validates every kit in examples/.
// Usage: node scripts/examples.js            (regenerate + validate)
//        node scripts/examples.js --no-write (validate only)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { exportKit } from "../packages/bkr-cli/lib/export.js";
import { buildDigest } from "../packages/bkr-cli/lib/digest.js";
import { validateKit } from "../packages/bkr-cli/lib/validate.js";

const examplesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "examples");
const write = !process.argv.includes("--no-write");
let failed = false;

for (const name of fs.readdirSync(examplesDir).sort()) {
  const kit = path.join(examplesDir, name);
  if (!fs.existsSync(path.join(kit, "brandkit.yaml"))) continue;
  if (write) {
    exportKit(kit, ["all"]);
    buildDigest(kit);
  }
  const r = await validateKit(kit, { strict: true });
  for (const e of r.errors) console.error(`  error: ${e}`);
  for (const w of r.warnings) console.warn(`  warn: ${w}`);
  console.log(`${r.ok ? "OK    " : "FAILED"} examples/${name}`);
  if (!r.ok) failed = true;
}

process.exitCode = failed ? 1 : 0;
