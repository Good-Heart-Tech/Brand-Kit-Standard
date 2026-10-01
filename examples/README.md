# Example BKR kits

Reference implementations validated in CI.

| Kit | Role | Brand id |
|-----|------|----------|
| [`starter-org`](starter-org/) | `organization` | `acme-labs` |
| [`starter-product-child`](starter-product-child/) | `product` | `acme-docs` |

The product kit declares `starter-org` as its parent (`brand.id: acme-labs`) via
`hierarchy.parent` pointing at this repository.

Regenerate exports after token edits:

```bash
node ../packages/bkr-cli/bin/bkr.js export starter-org --all
node ../packages/bkr-cli/bin/bkr.js digest starter-org
```
