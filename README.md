# Brand Kit Repository (BKR)

**BKR** is an open specification and CLI for brand-kit Git repositories that
humans, CI, and AI agents can read without inventing a second palette or voice.

Steward: [Good Heart Tech](https://github.com/Good-Heart-Tech). Spec contract:
`ght.brandkit/v1`.

## Why BKR

Most “brand kit” folders are inconsistent: PDFs for marketing, JSON for dev,
nothing for agents. BKR unifies **identity, voice, copy rules, visual guidance,
and tokens** under one validated layout, with **generated exports** (W3C Design
Tokens, CSS, Tailwind) so apps never fork hex values by hand.

Child product kits declare a **parent** repository so colors and marks stay
inherited instead of duplicated.

## Quick start

```bash
npm install
npm run validate
```

Scaffold a new kit:

```bash
node packages/bkr-cli/bin/bkr.js init ./my-brand --role organization
node packages/bkr-cli/bin/bkr.js validate ./my-brand
node packages/bkr-cli/bin/bkr.js export ./my-brand --all
```

## Repository layout

See [spec/BKR-SPEC.md](spec/BKR-SPEC.md).

| Path | Role |
|------|------|
| `brandkit.yaml` | Manifest: role, profiles, parent kit, validation |
| `AGENTS.md` | Agent loading contract (regenerate with `bkr digest`) |
| `identity/`, `voice/`, `visual/`, `copy/` | Human narrative layers |
| `tokens/*.bkr.json` | Normative design values |
| `tokens/exports/` | **Generated** — do not edit by hand |
| `assets/` | Logos, type, social, favicon |
| `examples/` | Starter templates |

## Packages

| Package | Purpose |
|---------|---------|
| [`packages/bkr-schema`](packages/bkr-schema/) | JSON Schema for manifest and tokens |
| [`packages/bkr-cli`](packages/bkr-cli/) | `init`, `validate`, `digest`, `export`, `import` |
| [`packages/bkr-rules-ght`](packages/bkr-rules-ght/) | Optional Good Heart Tech / Honey House rule pack |

## Interop

- **W3C Design Tokens (2025.10)** — primary export target under `tokens/exports/dtcg/`
- **CSS / Tailwind** — generated variables and theme snippets
- Other agent UI brief formats can be produced from the same token source; BKR
  does not require them as source of truth

## License

MIT for this specification and tooling. Individual brand kits may use stricter
terms for trademarks and assets; see each kit’s `copy/legal.md`.
