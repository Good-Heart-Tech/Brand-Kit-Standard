# {{displayName}} brand kit

![Colors](tokens/exports/svg/palette.svg)

This folder is the single source of truth for how **{{displayName}}** looks and
sounds: colors, fonts, logos, voice, and approved wording. It follows the
[Brand Kit Repository (BKR)](https://github.com/Good-Heart-Tech/Brand-Kit-Standard)
standard, spec 0.2.

## Start here

- **See the brand:** open `tokens/exports/html/brand-at-a-glance.html` in any browser.
- **Finish the kit:** search for `TODO(bkr)` and replace each one with your own words.
- **Sharing:** this kit is **private** by default. To share logos with partners or
  the press, see `publication` in `brandkit.yaml` and run `bkr publish --dry-run`.

## What lives where

| What | File |
|------|------|
| Settings (name, sharing, contacts) | `brandkit.yaml` |
| Who we are | `identity/about.md`, `identity/naming.md` |
| How we sound | `voice/tone.md`, `voice/vocabulary.md` |
| Approved wording and legal | `copy/messaging.md`, `copy/legal.md` |
| Colors, fonts, logo rules | `visual/`, `assets/logo/` |
| Official values (colors, fonts) | `tokens/*.bkr.json` |
| Generated files for websites and apps | `tokens/exports/` (do not edit) |
| Protecting the brand from impersonation | `security/brand-protection.md` |
| Instructions for AI assistants | `AGENTS.md`, `digest/AGENT_CONTEXT.md` (generated) |

## Commands

After changing anything in `tokens/` or `brandkit.yaml`:

```bash
bkr export --all
bkr digest
bkr validate
```

## The brand in use

<!-- bkr:previews -->
