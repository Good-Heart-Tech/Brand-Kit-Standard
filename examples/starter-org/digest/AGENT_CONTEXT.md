# Agent context (generated)

> Regenerate with `bkr digest`. Normative values live in `tokens/*.bkr.json` and `tokens/exports/`.

## Brand

- **Id:** acme-labs
- **Name:** Acme Labs
- **Status:** active
- **Role:** organization
- **Sharing:** Partner: only paths in `publication.includedPaths` may go to partners. Build them with `bkr publish`.
- **Report impersonation:** security@acme-labs.example

## Identity (excerpt)

# About Acme Labs

Acme Labs builds free, accessible software for community organizations, so
small teams can spend their time on their mission instead of on IT.

## Personality

- Calm and competent
- Plain language over buzzwords
- Evidence before hype
- Inclusive by default

## Who we talk to

- Staff and volunteers at community organizations (often non-technical)
- Funders and foundation program officers
- Volunteer engineers who contribute code

## Positioning

We are the dependable, no-cost option. We do not compete on features; we
compete on being easy to trust and easy to maintain.

## Voice (excerpt)

# Voice and tone

Our voice stays the same everywhere: calm, clear, and helpful. Our tone shifts
with the moment.

| Situation | Tone | Example |
|-----------|------|---------|
| Website and newsletters | Warm, confident | "Your team's tools, set up once and kept up to date." |
| Product screens | Direct, helpful | "Save changes" not "Submit" |
| Support replies | Patient, precise | "Here is what happened, and here is the fix." |
| Funders | Specific, outcome-first | "Saved 40 partner organizations 1,200 staff hours." |
| Legal | Formal | No jokes, no slang |

## Always

- Short sentences and active verbs
- Explain any technical term the first time it appears
- Blame the problem, never the person

## Vocabulary highlights

- "team" over "resource"
- "sign in" over "log in"
- "email" over "e-mail"
- "people" or "staff" over "users" when talking to customers
- "synergy", "disrupt", "best-in-class"
- Acronyms without explanation (write "multi-factor authentication (MFA)" first)
- "Simply" or "just" in instructions (it makes people feel bad when it is not simple)
- Gender-neutral defaults ("they", "everyone", "folks")
- Avoid idioms that do not translate well

## Approved messaging (excerpt)

# Approved messaging

**Tagline:** Tools that stay on brand.

**One sentence:** Acme Labs builds free, accessible software for community
organizations.

**Boilerplate (short):** Acme Labs helps community organizations run
dependable, consistent technology at no cost.

**Boilerplate (long):** Acme Labs builds and maintains free software for
community organizations. Our tools share one brand kit, so colors, wording,
and accessibility stay consistent across every website, app, and AI assistant
a team uses.

**Call to action:** Start free at our website.

## Logo rules (excerpt)

# Logo

| File | Use |
|------|-----|
| `assets/logo/mark.svg` | Default, full color on light backgrounds |
| `assets/logo/mark-reversed.svg` | On dark backgrounds or photos |
| `assets/logo/mark-mono.svg` | One-color printing, stamps, embroidery |
| `assets/logo/wordmark.svg` | Website headers and letterhead |
| `assets/logo/favicon.svg` | Browser tabs and app icons |

## Clear space

Leave empty space around the logo equal to at least 12% of its width.

## Minimum size

- Mark: 24px on screen, 0.5 inch in print
- Wordmark: 120px wide on screen

## Colorways

- Default: full color on `surface`
- Dark: reversed mark on `ink`

## Do not

- Stretch, rotate, or add shadows
- Recolor the mark
- Place it on busy photos without the reversed version

## Consumption

- CSS variables: `tokens/exports/css/variables.css`
- UI brief (colors, type, approved contrast pairs): `tokens/exports/agent/ui-brief.md`
- Do not invent hex values or fonts outside exported tokens.
- Load full `copy/legal.md` before external publication.
