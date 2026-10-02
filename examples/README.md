# Example BKR kits

All organizations here are **fictional**. Every kit passes `bkr validate --strict`
in CI.

| Kit | Role | Brand id | Sharing | Shows |
|-----|------|----------|---------|-------|
| [`nonprofit-sample`](nonprofit-sample/) | organization | `cedar-hollow-pantry` | public | A small nonprofit: plain-language voice, donor and volunteer wording kept internal, public press kit, accessible free font |
| [`starter-org`](starter-org/) | organization | `acme-labs` | partner | Everything: dark theme, typography, spacing and motion, five logo variants, contrast pairs |
| [`starter-product-child`](starter-product-child/) | product | `acme-docs` | private | Inherits `starter-org` colors; parent values checked through `hierarchy.parent.path` |
| [`minimal`](minimal/) | organization | `minimal-brand` | private | Smallest useful kit: three colors, one logo, no rule pack |

Open `tokens/exports/html/brand-at-a-glance.html` in any example to see it.

Regenerate and validate all examples from the repo root:

```bash
npm run examples
```
