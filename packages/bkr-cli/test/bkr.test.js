// Run with: npm test (from the repo root) or node --test packages/bkr-cli/test/
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { initKit } from "../lib/init.js";
import { validateKit } from "../lib/validate.js";
import { exportKit } from "../lib/export.js";
import { buildDigest } from "../lib/digest.js";
import { publishKit } from "../lib/publish.js";
import { upgradeKit } from "../lib/upgrade.js";
import { checkTokenValue, contrastRatio, cssVarName, kebab, toDtcgValue } from "../lib/tokens.js";
import { readManifest, writeManifest } from "../lib/fs-kit.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "bkr-test-"));
}

function newKit(opts = {}) {
  const dir = path.join(tmp(), opts.dirName || "kit");
  initKit(dir, { brandId: "test-org", displayName: "Test Org", ...opts });
  return dir;
}

function editJson(file, fn) {
  const doc = JSON.parse(fs.readFileSync(file, "utf8"));
  fn(doc);
  fs.writeFileSync(file, JSON.stringify(doc, null, 2));
}

function editManifest(dir, fn) {
  const m = readManifest(dir);
  fn(m);
  writeManifest(dir, m);
}

const hasMsg = (list, re) => list.some((m) => re.test(m));

// --- Unit helpers -----------------------------------------------------------------

test("contrast ratio matches WCAG reference values", () => {
  assert.equal(Math.round(contrastRatio("#000000", "#FFFFFF")), 21);
  assert.equal(contrastRatio("#FFFFFF", "#FFFFFF"), 1);
  // #767676 is the classic lightest gray that passes 4.5:1 on white
  assert.ok(contrastRatio("#767676", "#FFFFFF") >= 4.5);
  assert.ok(contrastRatio("#777777", "#FFFFFF") < 4.5);
});

test("CSS variable names are kebab-case", () => {
  assert.equal(kebab("productAccent"), "product-accent");
  assert.equal(kebab("fontSize"), "font-size");
  assert.equal(cssVarName({ brand: { id: "acme-docs" }, consumption: {} }, "palette", "productAccent"), "--acmedocs-palette-product-accent");
});

test("DTCG values use the 2025.10 object shapes", () => {
  const c = toDtcgValue({ type: "color", value: "#FF0000" });
  assert.deepEqual(c, { colorSpace: "srgb", components: [1, 0, 0], hex: "#ff0000" });
  assert.deepEqual(toDtcgValue({ type: "dimension", value: "1.5rem" }), { value: 1.5, unit: "rem" });
  assert.deepEqual(toDtcgValue({ type: "duration", value: "200ms" }), { value: 200, unit: "ms" });
});

test("token value checks catch bad values", () => {
  assert.equal(checkTokenValue({ type: "color", value: "#2563EB" }), null);
  assert.match(checkTokenValue({ type: "color", value: "blue" }), /hex/);
  assert.match(checkTokenValue({ type: "dimension", value: "16" }), /px or rem/);
  assert.match(checkTokenValue({ type: "fontWeight", value: "bold" }), /number/);
});

// --- Kit lifecycle ------------------------------------------------------------------

test("a fresh kit validates, but strict mode flags unfinished TODO sections", async () => {
  const dir = newKit();
  const loose = await validateKit(dir);
  assert.deepEqual(loose.errors, []);
  assert.ok(loose.ok);
  assert.ok(hasMsg(loose.warnings, /TODO\(bkr\)/));
  const strict = await validateKit(dir, { strict: true });
  assert.equal(strict.ok, false);
});

test("TODO sections are errors once a kit is marked active", async () => {
  const dir = newKit();
  editManifest(dir, (m) => (m.brand.status = "active"));
  exportKit(dir, ["all"]);
  const r = await validateKit(dir);
  assert.ok(hasMsg(r.errors, /TODO\(bkr\)/));
});

test("export output is deterministic", () => {
  const dir = newKit();
  const css = path.join(dir, "tokens/exports/css/variables.css");
  const html = path.join(dir, "tokens/exports/html/brand-at-a-glance.html");
  const before = [fs.readFileSync(css, "utf8"), fs.readFileSync(html, "utf8")];
  exportKit(dir, ["all"]);
  assert.deepEqual([fs.readFileSync(css, "utf8"), fs.readFileSync(html, "utf8")], before);
});

test("stale exports are detected after a token change", async () => {
  const dir = newKit();
  editJson(path.join(dir, "tokens/colors.bkr.json"), (d) => (d.tokens.palette.accent.value = "#00AAFF"));
  let r = await validateKit(dir);
  assert.ok(hasMsg(r.warnings, /out of date/));
  exportKit(dir, ["all"]);
  r = await validateKit(dir);
  assert.ok(!hasMsg(r.warnings, /out of date/));
});

test("a failing contrast pair is an error, in light and dark themes", async () => {
  const dir = newKit();
  editJson(path.join(dir, "tokens/colors.bkr.json"), (d) => (d.tokens.palette.body.value = "#BBBBBB"));
  exportKit(dir, ["all"]);
  const r = await validateKit(dir);
  assert.ok(hasMsg(r.errors, /contrast \(base\): palette\.body on palette\.surface/));

  editJson(path.join(dir, "tokens/colors.bkr.json"), (d) => (d.tokens.palette.body.value = "#334155"));
  editJson(path.join(dir, "tokens/themes/dark.bkr.json"), (d) => (d.tokens.palette.body.value = "#334155"));
  exportKit(dir, ["all"]);
  const r2 = await validateKit(dir);
  assert.ok(hasMsg(r2.errors, /contrast \(dark\): palette\.body/));
});

test("theme files may only override existing base tokens", async () => {
  const dir = newKit();
  editJson(path.join(dir, "tokens/themes/dark.bkr.json"), (d) => {
    d.tokens.palette.brandNew = { value: "#123456", type: "color" };
  });
  const r = await validateKit(dir);
  assert.ok(hasMsg(r.errors, /not a base token/));
});

test("prose that mentions a missing token is flagged", async () => {
  const dir = newKit();
  fs.appendFileSync(path.join(dir, "visual/palette.md"), "\n- Error banners: `danger`\n");
  const r = await validateKit(dir);
  assert.ok(hasMsg(r.warnings, /mentions `danger`/));
  fs.appendFileSync(path.join(dir, "visual/palette.md"), "\n<!-- bkr-ignore-refs: danger -->\n");
  const r2 = await validateKit(dir);
  assert.ok(!hasMsg(r2.warnings, /mentions `danger`/));
});

test("unsafe SVG logos are rejected", async () => {
  const dir = newKit();
  fs.writeFileSync(path.join(dir, "assets/logo/bad.svg"), '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
  const r = await validateKit(dir);
  assert.ok(hasMsg(r.errors, /bad\.svg: SVG contains <script>/));
});

test("product kits are checked against a local parent kit", async () => {
  const root = tmp();
  const org = path.join(root, "org");
  initKit(org, { brandId: "test-org", displayName: "Test Org" });
  const child = path.join(root, "child");
  initKit(child, { role: "product", brandId: "test-child", displayName: "Child", parentBrandId: "test-org", parentPath: "../org" });

  let r = await validateKit(child);
  assert.deepEqual(r.errors, []);

  editJson(path.join(child, "tokens/colors.bkr.json"), (d) => (d.tokens.palette.primary.value = "#FF0000"));
  r = await validateKit(child);
  assert.ok(hasMsg(r.errors, /palette\.primary is "#FF0000" but parent palette\.primary is "#2563EB"/));

  editJson(path.join(child, "tokens/colors.bkr.json"), (d) => {
    d.tokens.palette.primary.value = "#2563EB";
    delete d.tokens.palette.ink.inheritsFrom;
  });
  r = await validateKit(child);
  assert.ok(hasMsg(r.errors, /palette\.ink redefines a parent token/));
});

test("a product kit without a parent path gets a note, not a failure", async () => {
  const child = path.join(tmp(), "child");
  initKit(child, { role: "product", brandId: "test-child", displayName: "Child" });
  const r = await validateKit(child);
  assert.deepEqual(r.errors, []);
  assert.ok(hasMsg(r.notes, /parent tokens not checked/));
});

test("a missing manifest parent path is a note, but a missing --parent is an error", async () => {
  const child = path.join(tmp(), "child");
  initKit(child, { role: "product", brandId: "test-child", displayName: "Child", parentPath: "../not-checked-out" });
  const r = await validateKit(child);
  assert.deepEqual(r.errors, []);
  assert.ok(hasMsg(r.notes, /not-checked-out/));
  const r2 = await validateKit(child, { parent: path.join(tmp(), "nope") });
  assert.ok(hasMsg(r2.errors, /parent kit/));
});

test("local rule packs are loaded from the kit", async () => {
  const dir = newKit();
  fs.writeFileSync(
    path.join(dir, "rules.js"),
    "export function validate({ manifest }) { return { errors: [`local rule saw ${manifest.brand.id}`], warnings: [] }; }\n"
  );
  editManifest(dir, (m) => (m.validation.rulesPack = "./rules.js"));
  exportKit(dir, ["all"]);
  const r = await validateKit(dir);
  assert.ok(hasMsg(r.errors, /local rule saw test-org/));
});

// --- Sharing --------------------------------------------------------------------------

test("private kits cannot be published", async () => {
  const dir = newKit();
  const r = await publishKit(dir, { dryRun: true });
  assert.equal(r.ok, false);
  assert.ok(hasMsg(r.errors, /private/));
});

test("sharing guardrails warn about risky files and staff contacts", async () => {
  const dir = newKit();
  fs.writeFileSync(path.join(dir, "copy/email-signature.html"), "<p>Jane Doe, jane@testorg.org, 208-555-0134</p>");
  fs.writeFileSync(path.join(dir, "copy/donate.md"), "Donate today with a gift card!");
  editManifest(dir, (m) => {
    m.publication = {
      visibility: "partner",
      includedPaths: ["assets/logo/", "identity/naming.md", "copy/email-signature.html", "copy/donate.md", "missing.md"],
    };
  });
  const r = await validateKit(dir);
  assert.ok(hasMsg(r.errors, /missing\.md does not exist/));
  assert.ok(hasMsg(r.warnings, /naming\.md: internal naming/));
  assert.ok(hasMsg(r.warnings, /email-signature\.html/));
  assert.ok(hasMsg(r.warnings, /jane@testorg\.org/));
  assert.ok(hasMsg(r.warnings, /phone number/));
  assert.ok(hasMsg(r.warnings, /donate\.md: contains fundraising/));
});

test("publish builds a bundle with only the listed files", async () => {
  const dir = newKit();
  editManifest(dir, (m) => {
    m.publication = { visibility: "public", includedPaths: ["assets/logo/", "tokens/exports/css/variables.css"] };
  });
  exportKit(dir, ["all"]);
  const r = await publishKit(dir);
  assert.ok(r.ok, r.errors.join("\n"));
  const out = path.join(dir, "dist/brand-bundle");
  assert.ok(fs.existsSync(path.join(out, "assets/logo/mark.svg")));
  assert.ok(fs.existsSync(path.join(out, "tokens/exports/css/variables.css")));
  assert.ok(!fs.existsSync(path.join(out, "identity")));
  assert.match(fs.readFileSync(path.join(out, "BUNDLE.md"), "utf8"), /security@example\.org/);

  // Never wipes a folder it did not create
  const foreign = path.join(tmp(), "foreign");
  fs.mkdirSync(foreign);
  fs.writeFileSync(path.join(foreign, "keep.txt"), "important");
  const r2 = await publishKit(dir, { out: foreign });
  assert.equal(r2.ok, false);
  assert.ok(fs.existsSync(path.join(foreign, "keep.txt")));
});

// --- Upgrade --------------------------------------------------------------------------

test("upgrade moves a 0.1 kit to 0.2 and keeps manifest comments", async () => {
  const dir = newKit();
  const yamlPath = path.join(dir, "brandkit.yaml");
  let text = fs.readFileSync(yamlPath, "utf8");
  text = text
    .replace("specVersion: 0.2.0", "specVersion: 0.1.0")
    .replace("  security: true\n", "  partnerPublic: true\n")
    .replace(/publication:\n  visibility: private\n  includedPaths: \[\]\n/, "")
    .replace("schema: ght.brandkit/v1", "# keep this comment\nschema: ght.brandkit/v1");
  fs.writeFileSync(yamlPath, text);
  fs.rmSync(path.join(dir, "security"), { recursive: true });
  editJson(path.join(dir, "tokens/colors.bkr.json"), (d) => (d.$schema = "https://goodheart.tech/schemas/bkr-token/v1"));

  const before = await validateKit(dir);
  assert.ok(hasMsg(before.warnings, /bkr upgrade/));

  const { changes } = upgradeKit(dir);
  assert.ok(changes.length > 0);
  const m = readManifest(dir);
  assert.equal(m.specVersion, "0.2.0");
  assert.equal(m.publication.visibility, "partner");
  assert.equal(m.profiles.partnerPublic, undefined);
  assert.equal(m.profiles.security, true);
  assert.match(fs.readFileSync(yamlPath, "utf8"), /# keep this comment/);
  assert.ok(fs.existsSync(path.join(dir, "security/brand-protection.md")));
  assert.match(fs.readFileSync(path.join(dir, "tokens/colors.bkr.json"), "utf8"), /good-heart-tech\.github\.io/);
});

// --- Examples in this repo -----------------------------------------------------------------

test("every example kit passes strict validation", async () => {
  const examples = path.join(repoRoot, "examples");
  for (const name of fs.readdirSync(examples)) {
    const dir = path.join(examples, name);
    if (!fs.existsSync(path.join(dir, "brandkit.yaml"))) continue;
    const r = await validateKit(dir, { strict: true });
    assert.ok(r.ok, `${name}:\n${[...r.errors, ...r.warnings].join("\n")}`);
  }
});

test("digest stays under its size cap", () => {
  const dir = newKit();
  const { bytes } = buildDigest(dir, { maxBytes: 1500 });
  assert.ok(bytes <= 1500);
});
