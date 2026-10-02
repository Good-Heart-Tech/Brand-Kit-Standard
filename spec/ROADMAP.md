# BKR roadmap (steward backlog)

## Done in 0.2

- Stale-export detection (SHA-256 source hash)
- WCAG contrast checks for declared pairs, in every theme
- Narrative vs token drift warnings
- Typography, spacing, motion, and theme tokens; DTCG 2025.10 value shapes
- Tailwind v4 export, self-contained brand-at-a-glance page, agent UI brief
- `publication.visibility` (private / partner / public), `bkr publish`, impersonation guardrails
- `security` profile with a brand protection checklist
- Parent kit checks with a local path
- Pluggable rule packs (npm or local path)
- `bkr upgrade` for 0.1 kits
- Hosted schemas (GitHub Pages), reusable GitHub Action, npm release workflow
- Plain-language guide, intake worksheet, Canva guide, exports guide

## Adoption (Good Heart Tech), next

1. Enable GitHub Pages (Source: GitHub Actions) so schema URLs resolve
2. Create the `goodheart` npm organization, add `NPM_TOKEN`, and publish a `v0.2.0` release
3. Migrate `Good-Heart-Tech-Branding-Marketing` using `spec/MIGRATION.md`
4. Migrate Honey House parent and child kits with `bkr-rules-ght`
5. Wire one app (website or email signatures) to `tokens/exports/css/variables.css`
6. Add each migrated kit to `ADOPTERS.md`

## 0.3 candidates

- Fetch a parent kit by Git ref (no local checkout needed)
- PNG and favicon `.ico` generation from SVG logos
- `bkr check-domain`: report SPF, DKIM, DMARC, and BIMI status for `contacts` domains
- Multiple languages for `copy/` (for example `copy/es/`)

## Deferred until someone needs it

- Figma variables sync bot (design to BKR pull request)
- Campaign kit templates
