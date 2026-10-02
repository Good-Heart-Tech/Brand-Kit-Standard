# Acme Labs brand kit (reference example)

Acme Labs is a **fictional** organization. This kit is the complete reference
for BKR 0.2: every profile, a dark theme, typography, spacing, contrast checks,
a full logo set, and partner sharing.

## Start here

- **See the brand:** open [`tokens/exports/html/brand-at-a-glance.html`](tokens/exports/html/brand-at-a-glance.html) in a browser.
- **AI agents:** start with [`AGENTS.md`](AGENTS.md).
- **Sharing:** `partner`. Run `bkr publish --dry-run` to see exactly what partners get.

## What lives where

| What | File |
|------|------|
| Settings (name, sharing, contacts, contrast pairs) | `brandkit.yaml` |
| Who we are | `identity/about.md`, `identity/naming.md` |
| How we sound | `voice/tone.md`, `voice/vocabulary.md` |
| Approved wording and legal | `copy/messaging.md`, `copy/legal.md` |
| Colors, type, logo rules | `visual/` |
| Logos | `assets/logo/` (mark, mono, reversed, wordmark, favicon) |
| Official values | `tokens/colors.bkr.json`, `tokens/typography.bkr.json`, `tokens/spacing.bkr.json`, `tokens/themes/dark.bkr.json` |
| Generated files | `tokens/exports/` (CSS, DTCG, Tailwind v3 and v4, HTML page, agent brief) |
| Brand protection checklist | `security/brand-protection.md` |

## Commands

```bash
bkr export --all
bkr digest
bkr validate --strict
bkr publish --dry-run
```
