import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function resolveKitPath(inputPath) {
  return path.resolve(process.cwd(), inputPath || ".");
}

export function readManifest(kitRoot) {
  const yamlPath = path.join(kitRoot, "brandkit.yaml");
  if (!fs.existsSync(yamlPath)) {
    throw new Error(`Missing brandkit.yaml at ${yamlPath}`);
  }
  const raw = fs.readFileSync(yamlPath, "utf8");
  return YAML.parse(raw);
}

export function writeManifest(kitRoot, manifest) {
  const yamlPath = path.join(kitRoot, "brandkit.yaml");
  const doc = YAML.stringify(manifest, { lineWidth: 0 });
  fs.writeFileSync(yamlPath, doc, "utf8");
}

export function pathExists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

export function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

export function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function writeJson(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export function writeText(filePath, text) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, text, "utf8");
}

export function listBkrTokenFiles(kitRoot) {
  const tokensDir = path.join(kitRoot, "tokens");
  if (!pathExists(tokensDir)) return [];
  const out = [];
  walk(tokensDir, (fp) => {
    if (fp.endsWith(".bkr.json") && !fp.includes(`${path.sep}exports${path.sep}`)) {
      out.push(fp);
    }
  });
  return out;
}

function walk(dir, onFile) {
  for (const name of fs.readdirSync(dir)) {
    const fp = path.join(dir, name);
    const st = fs.statSync(fp);
    if (st.isDirectory()) walk(fp, onFile);
    else onFile(fp);
  }
}

export function schemaPath(name) {
  return path.join(__dirname, "..", "..", "bkr-schema", "schemas", name);
}

export function templatesDir() {
  return path.join(__dirname, "..", "templates");
}

export function hashStableString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}
