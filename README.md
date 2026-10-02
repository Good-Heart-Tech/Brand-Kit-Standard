# Brand Kit Repository (BKR)

**BKR** is an open standard and free CLI for brand kits that people, websites,
and AI assistants can all read, so nobody has to guess your colors, invent a
second logo, or write in the wrong voice.

It works for any organization: companies and startups, government agencies,
nonprofits, schools, and one-person businesses. A kit can be a whole
organization, or a product, department, or sub-brand that inherits from one.

Steward: [Good Heart Tech](https://github.com/Good-Heart-Tech).
Spec: [`spec/BKR-SPEC.md`](spec/BKR-SPEC.md) (0.2, contract `ght.brandkit/v1`).

## For the people who own the brand

A brand kit is one folder with your logo, colors, fonts, how you sound, and
your approved wording. BKR keeps it organized so that:

- your website, apps, email signatures, slides, and AI tools all use the **same** colors and words
- anyone browsing the kit on GitHub **sees** the palette, the brand in use, and do and don't examples
- colors are **checked for readability** automatically
- the kit stays **private** unless you choose to share parts of it, and it warns
  you before you share anything that would help scammers impersonate you

Start here: **[Start your brand kit](docs/start-your-brand-kit.md)**. Fill in
the [intake worksheet](docs/intake-worksheet.md), or see
[how to load a kit into Canva](docs/canva.md).

## See it

Every example below is fictional. Each one shows its palette, the brand in use
(light and dark), and its do and don't pairs right on GitHub.

| Company | Government | Solo business |
|---|---|---|
| ![Ridgeline Coffee Roasters](examples/business-sample/tokens/exports/png/ui.png) | ![Brightwater County](examples/government-sample/tokens/exports/png/ui.png) | ![Juniper Lane Studio](examples/solo-sample/tokens/exports/png/ui.png) |
| ![Ridgeline palette](examples/business-sample/tokens/exports/svg/palette.svg) | ![Brightwater palette](examples/government-sample/tokens/exports/svg/palette.svg) | ![Juniper Lane palette](examples/solo-sample/tokens/exports/svg/palette.svg) |

| Example | Type | What it shows |
|---------|------|---------------|
| [`examples/business-sample`](examples/business-sample/) | Company (retail and wholesale) | Public press kit, internal pricing kept private, dark theme |
| [`examples/government-sample`](examples/government-sample/) | Government agency | Accessibility as a legal requirement, plain language, protected seal kept out of the partner bundle |
| [`examples/solo-sample`](examples/solo-sample/) | One-person business | A lighter kit with optional layers turned off, shared with printers and clients |
| [`examples/nonprofit-sample`](examples/nonprofit-sample/) | Nonprofit | Plain-language voice, donation wording kept internal, public press kit |
| [`examples/starter-org`](examples/starter-org/) | Company (software) | Every feature: dark theme, typography, spacing, full logo set, partner sharing |
| [`examples/starter-product-child`](examples/starter-product-child/) | Product or sub-brand | A child kit that inherits its parent's colors, checked automatically |
| [`examples/minimal`](examples/minimal/) | Any | The smallest useful kit: three colors and a logo |

## For engineers

### Quick start

From a clone of this repo (Node 20+):

```bash
npm install
npm test
npm run bkr -- init ../my-brand --brand-id my-brand --display-name "My Brand"
```

Once the packages are on npm:

```bash
npx @goodheart/bkr-cli init ./my-brand --brand-id my-brand --display-name "My Brand"
```

### Commands

| Command | What it does |
|---------|--------------|
| `bkr init <dir>` | Scaffold an `organization` or `product` kit with `TODO(bkr)` prompts |
| `bkr validate [dir] [--strict] [--parent <dir>]` | Schema, required files, token formats, contrast, stale exports, sharing guardrails, parent tokens, rule pack |
| `bkr export [dir] --all` | DTCG, CSS, Tailwind v3/v4, brand-at-a-glance page, agent UI brief |
| `bkr digest [dir]` | Regenerate `AGENTS.md` and `digest/AGENT_CONTEXT.md` |
| `bkr publish [dir] [--dry-run]` | Bundle only the files `publication` allows (refuses for private kits) |
| `bkr preview [dir]` | Screenshot the brand in use and the type specimen to PNG (needs Chrome or Edge) |
| `bkr upgrade [dir]` | Bring an older kit up to the current spec |
| `bkr import legacy-ght-colors <dir> <colors.json>` | Convert a legacy GHT colors file |

After editing a kit: `bkr export --all && bkr digest && bkr validate`.

### Kit layout

| Path | Role |
|------|------|
| `brandkit.yaml` | Manifest: role, profiles, parent, sharing, contrast pairs, contacts |
| `AGENTS.md`, `digest/` | Agent loading contract and summary (generated) |
| `identity/`, `voice/`, `visual/`, `copy/` | Human narrative |
| `security/brand-protection.md` | Impersonation defenses checklist |
| `tokens/*.bkr.json`, `tokens/themes/` | Normative values |
| `tokens/exports/` | Generated; do not edit |
| `assets/logo/` | Logos (SVG checked for unsafe content) |

### Using the exports in apps

See [docs/using-exports.md](docs/using-exports.md) for CSS, Tailwind v3 and v4,
and DTCG (Style Dictionary and similar tools).

### GitHub Action

```yaml
# .github/workflows/brand-kit.yml in a kit repository
name: brand-kit
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: Good-Heart-Tech/Brand-Kit-Standard@v0.4.3
        with:
          path: .
          strict: "true"
```

Inputs: `path`, `strict`, `parent-path`, `check-exports`. See [`action.yml`](action.yml).

### Packages

| Package | Purpose |
|---------|---------|
| [`@goodheart/bkr-cli`](packages/bkr-cli/) | The `bkr` command |
| [`@goodheart/bkr-schema`](packages/bkr-schema/) | JSON Schemas for the manifest and token files |
| [`@goodheart/bkr-rules-ght`](packages/bkr-rules-ght/) | Optional Good Heart Tech / Honey House rule pack |

### Repository scripts

| Script | What it does |
|--------|--------------|
| `npm test` | Unit and integration tests (Node's built-in runner) |
| `npm run examples` | Regenerate and strictly validate every example |
| `npm run validate` | Strictly validate every example without writing |
| `npm run bkr -- <args>` | Run the CLI from this checkout |

## Sharing and safety

Kits are **private by default**. `publication.visibility` can be `partner` or
`public`, and only the paths listed in `publication.includedPaths` are shared.
Colors and a basic logo are low risk because they are already on your website.
`bkr validate` warns before you share things that make phishing easier, like
email templates, donation page designs, or staff contact details. The real
defense is email authentication (DMARC) and watching for look-alike domains;
see [Protect your brand](docs/protect-your-brand.md).

## Adopters

See [ADOPTERS.md](ADOPTERS.md). Using BKR? Add your kit with a pull request.

## Interop

- **W3C Design Tokens (2025.10)**: primary machine export (`tokens/exports/dtcg/`)
- **CSS custom properties** and **Tailwind v3 / v4**
- **AI agents**: `AGENTS.md`, size-capped digest, and a UI brief

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and [CHANGELOG.md](CHANGELOG.md).

## License

MIT for this specification and tooling. Brand assets in individual kits are not
MIT unless their `copy/legal.md` says so; trademarks stay with their owners.
