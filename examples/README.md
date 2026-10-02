# Example BKR kits

All organizations here are **fictional**. Every kit passes `bkr validate --strict`
in CI.

| Kit | Role | Brand id | Sharing | Shows |
|-----|------|----------|---------|-------|
| [`business-sample`](business-sample/) | organization | `ridgeline-coffee` | public | A retail and wholesale company: public press kit, internal pricing kept private, dark theme |
| [`government-sample`](government-sample/) | organization | `brightwater-county` | partner | A county: accessibility as law, plain language, protected seal kept out of shared files |
| [`solo-sample`](solo-sample/) | organization | `juniper-lane-studio` | partner | A one-person studio: optional layers off, no dark theme, shared with printers and clients |
| [`nonprofit-sample`](nonprofit-sample/) | organization | `cedar-hollow-pantry` | public | A small nonprofit: plain-language voice, donor and volunteer wording kept internal, public press kit, accessible free font |
| [`starter-org`](starter-org/) | organization | `acme-labs` | partner | A software company, every feature: dark theme, typography, spacing and motion, five logo variants, contrast pairs |
| [`starter-product-child`](starter-product-child/) | product | `acme-docs` | private | Inherits `starter-org` colors; parent values checked through `hierarchy.parent.path` |
| [`minimal`](minimal/) | organization | `minimal-brand` | private | Smallest useful kit: three colors, one logo, no rule pack |

Each example README shows its palette, the brand in use, and do and don't pairs on GitHub. Open `tokens/exports/html/brand-at-a-glance.html` locally for the full page.

Regenerate and validate all examples from the repo root:

```bash
npm run examples
```
