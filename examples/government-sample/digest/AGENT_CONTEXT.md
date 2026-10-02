# Agent context (generated)

> Regenerate with `bkr digest`. Normative values live in `tokens/*.bkr.json` and `tokens/exports/`.

## Brand

- **Id:** brightwater-county
- **Name:** Brightwater County
- **Status:** active
- **Role:** organization
- **Sharing:** Partner: only paths in `publication.includedPaths` may go to partners. Build them with `bkr publish`.
- **Report impersonation:** https://brightwatercounty.example/report-fraud

## Identity (excerpt)

# About Brightwater County

Brightwater County is the local government for about 180,000 residents in the
towns, farms, and river communities of the Brightwater Valley. We run the
services people use every day: parks and trails, public health clinics,
elections, property records, roads, and permits.

Every county department uses this one brand. Residents should be able to tell
at a glance that a page, letter, sign, or social media post is really from the
County, and they should be able to read and use it easily.

## What we promise residents

- Clear information they can act on, in plain language
- Services that work for everyone, including people with disabilities and
  people who speak limited English
- Honest, timely updates, especially during emergencies

## Personality

- Helpful: we lead with what people need to do and how to do it
- Neutral: we inform; we do not persuade or take sides
- Trustworthy: accurate, consistent, and easy to verify
- Calm: steady in emergencies, never alarmist

## Who we talk to

- Residents, including people with low vision, older adults, and people who
  read English as a second language (Spanish is our second most common language)
- Local businesses applying for permits and licenses
- Other agencies: cities, school districts, the state, and neighboring counties
- Reporters and local media

## Voice (excerpt)

# Voice and tone

We write in plain language, following the federal plain language guidelines:
readers should find what they need, understand it the first time, and know
what to do next. Our voice is always neutral and helpful. We never sell, hype,
or take sides.

Our tone changes with the moment.

| Situation | Tone | Example |
|-----------|------|---------|
| Service pages (permits, clinics, records) | Direct, step by step | "To renew your dog license, you need proof of a rabies shot. Renew online or at any county office." |
| Emergency alerts | Calm, urgent, action first | "Boil water notice for Riverside. Boil tap water for 1 minute before you drink it. Next update at 6 p.m." |
| Public notices and meetings | Formal, complete | "The Board of Commissioners will hold a public hearing on the 2027 budget on Tuesday, November 4, at 6 p.m. in Room 100 of the County Building." |
| Social media | Friendly, short, useful | "Heron Point trails reopen Saturday. Bring water; there is no shade on the east loop." |
| Press releases | Factual, neutral | Lead with who, what, when, and where. Quote officials by title. No opinions or words like "exciting." |
| Election information | Strictly neutral | Explain how, when, and where to vote. Never suggest how to vote. |

## Always

- Aim for a 6th to 8th grade reading level
- Lead with the action or the answer, then the details
- Use "you" for the reader and "we" for the County
- Use short sentences, headings, and lists
- Write dates and time
…

## Vocabulary highlights

- **Notice:** an official public notice required by law. Do not use it for
- **Alert:** an emergency or safety message only.
- **Official:** only for county-issued documents, websites, and accounts.
- Acronyms without spelling them out first: "Americans with Disabilities Act
- Form numbers on their own; say what the form is for: "Building Permit
- Words that suggest a political position
- "Click here"; link text says where it goes: "Find your polling place"
- Gender-neutral defaults ("they," "chairperson")
- People-first language unless a community prefers otherwise
- Short, simple sentences that translate well

## Approved messaging (excerpt)

# Approved messaging

**Tagline:** Serving every resident of the Brightwater Valley.

**One sentence:** Brightwater County provides parks, public health, elections,
roads, and other local services for the people of the Brightwater Valley.

**Boilerplate (short):** Brightwater County is the local government for about
180,000 residents of the Brightwater Valley.

**Boilerplate (long):** Brightwater County is the local government for about
180,000 residents of the Brightwater Valley. The County runs parks and trails,
public health clinics, elections, property records, roads, and permits. Learn
more and use county services at brightwatercounty.example.

**Official website line (on every notice, letter, and post):**
Official county information is only on brightwatercounty.example.

**Payment safety line (on bills, notices, and service pages):**
Brightwater County will never ask you to pay by text message, gift card, or
wire transfer. Pay only on brightwatercounty.example or at a county office.

**Accessibility line (on public notices and event pages):**
To ask for an accommodation, such as an interpreter, large print, or
captions, visit brightwatercounty.example/accessibility at least 3
…

## Logo rules (excerpt)

# Logo

The Brightwater County logo is a sun rising over the river. All county
departments use the same logo with their name set in text next to it or below
it (for example, "Brightwater County Parks").

| File | Use |
|------|-----|
| `assets/logo/mark.svg` | Default, full color on light backgrounds |
| `assets/logo/mark-reversed.svg` | On civic blue, dark backgrounds, or photos |
| `assets/logo/wordmark.svg` | Website header, letterhead, signs, and press use |
| `assets/logo/favicon.svg` | Browser tabs and app icons |

## The county seal is separate

The County also has an official seal. The seal is a protected mark for county
departments only, on official documents. It is not included in these files,
and partners and the press may not use it. Use the logo above instead.

## Clear space

Leave empty space around the logo equal to at least the height of the sun in
the mark.

## Minimum size

- Mark: 32px on screen, 0.5 inch in print
- Wordmark: 160px wide on screen, 1.5 inches wide in print

## Colorways

- Default: full-color mark on `surface`
- Dark: reversed mark on `primary` or `ink`

## Do not

- Stretch, rotate, outline, or add shadows
- Recolor the mark or change the sun to
…

## Consumption

- CSS variables: `tokens/exports/css/variables.css`
- UI brief (colors, type, approved contrast pairs): `tokens/exports/agent/ui-brief.md`
- Do not invent hex values or fonts outside exported tokens.
- Load full `copy/legal.md` before external publication.
