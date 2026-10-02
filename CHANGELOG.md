# Changelog

## 0.2.0 (2026-10)

### Added

- **Sharing controls:** `publication.visibility` (`private` by default, `partner`, `public`) and `bkr publish [--dry-run]` to build a bundle of only the allowed files.
- **Impersonation guardrails:** warnings when shared paths include internal naming, email or signature templates, login or donation designs, design source files, fonts, staff emails, phone numbers, or fundraising wording.
- **`security` profile** with `security/brand-protection.md` (DMARC, look-alike domains, MFA, what to do if impersonated) and `contacts.security`.
- **Contrast checks:** `validation.contrastPairs`, checked in the base palette and every theme.
- **Token types:** `dimension`, `duration`, `fontFamily`, `fontWeight`, `number` are validated and exported. New layers: `spacing`, `motion`.
- **Themes:** `tokens/themes/<name>.bkr.json`; dark theme follows the system setting.
- **Exports:** Tailwind v4 `theme.css`, `brand-at-a-glance.html` (self-contained), `agent/ui-brief.md`.
- **Parent checks:** `hierarchy.parent.path` or `bkr validate --parent`.
- **Rule packs** from any npm package or a local path; packs receive parsed tokens.
- **`bkr upgrade`** for 0.1 kits (keeps manifest comments).
- **Safety checks:** unsafe SVG content is rejected.
- `TODO(bkr)` markers in templates; validation fails on unfinished sections for active kits.
- Hosted JSON Schemas (GitHub Pages), reusable GitHub Action (`action.yml`), npm release workflow.
- Examples: polished `starter-org`, fixed `starter-product-child`, new `nonprofit-sample` and `minimal`.
- Docs for nonprofit staff: start guide, intake worksheet, Canva guide, brand protection guide, exports guide.
- Test suite (`npm test`) using Node's built-in test runner.

### Changed (breaking for apps)

- CSS variable names are kebab-case (`--acmedocs-palette-product-accent`).
- Dark theme CSS ships inside `variables.css`; `dark-theme.css` is no longer written.
- DTCG color, dimension, and duration values use the 2025.10 object shapes.
- Schema URLs moved to `https://good-heart-tech.github.io/Brand-Kit-Standard/schemas/v1/`.
- `.bkr-export-hash` uses SHA-256 over the manifest, tokens, and logos; it is only written by `bkr export --all`.
- `bkr import legacy-ght-colors` uses the kit's own `brand.id` and output now validates.

### Deprecated

- `profiles.partnerPublic` (use `publication.visibility: partner`)
- `publication.allowExternalMirror` (use `publication.visibility: public`)

### Fixed

- `bkr validate` now really detects stale exports (0.1 only checked that the hash file existed).
- `minContrastRatio` is now enforced.
- Example narrative referenced tokens that did not exist.
- Example `swatches.html` pages were empty.

## 0.1.0

- Initial specification, CLI (`init`, `validate`, `export`, `digest`, `import`), schemas, and two examples.
