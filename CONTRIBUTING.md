# Contributing

Thanks for helping. BKR is maintained by volunteers, so the code favors plain,
readable JavaScript over clever abstractions.

## Setup

```bash
npm install
npm test
npm run examples
```

## Where things live

| Path | What |
|------|------|
| `packages/bkr-cli/lib/` | One file per concern: `validate.js`, `export.js`, `brief.js` (HTML page and agent brief), `publication.js` (sharing rules), `publish.js`, `upgrade.js`, `digest.js`, `init.js`, `tokens.js` (token loading and color math), `fs-kit.js` |
| `packages/bkr-cli/templates/` | What `bkr init` copies. `gitignore` becomes `.gitignore`. |
| `packages/bkr-cli/test/` | `node:test` tests |
| `packages/bkr-schema/schemas/` | JSON Schemas (editors fetch them from jsDelivr, which serves this repo directly) |
| `examples/` | Kits validated in CI; regenerate with `npm run examples` |
| `spec/` | The specification, migration guide, roadmap |
| `docs/` | Plain-language guides |

## Rules of thumb

- **Exports must be deterministic.** No timestamps or random values in generated files.
- **Change the spec and the code together.** If you add a check, document it in `spec/BKR-SPEC.md` section 9 and add a test.
- **Examples must pass `--strict`.** CI regenerates them and fails if the committed output differs.
- **Write for non-technical readers** in templates and `docs/`: short sentences, no jargon, no em dashes.
- **Breaking output changes** (variable names, file locations) go in `CHANGELOG.md` and `spec/MIGRATION.md`, and bump `EXPORT_FORMAT` in `export.js`.

## Releasing

1. Bump versions in the three `packages/*/package.json` files and the root `package.json`.
2. Update `CHANGELOG.md`.
3. Create a GitHub release tagged `vX.Y.Z`. The release workflow publishes to npm.
4. Move the action tag users reference (for example `v0.2.0`) to that release.
