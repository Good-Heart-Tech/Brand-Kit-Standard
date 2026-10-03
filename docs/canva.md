# Load your brand kit into Canva

Canva is where many teams make social posts, flyers, and presentations.
Canva's Brand Kit is part of its paid plans (Pro, Teams, and Enterprise).
Eligible nonprofits and schools can get those features free through Canva for
Nonprofits and Canva for Education.

You only need two things from your brand kit:

- the **brand-at-a-glance page**: `tokens/exports/html/brand-at-a-glance.html`
- the **logo files**: `assets/logo/`

## 1. Open your Brand Kit in Canva

In Canva, go to **Brand** in the left menu, then open (or create) your Brand Kit.

## 2. Logos

Upload each file from `assets/logo/`. Canva accepts SVG and PNG. Name them
clearly, for example "Logo - full color" and "Logo - for dark backgrounds".

## 3. Colors

Open the brand-at-a-glance page. For each color, copy the code shown on the
swatch (for example `#2F6B3A`) and add it to your Canva brand colors. Use the
token name as the color name (for example "primary" or "harvest") so everyone
uses the same words.

Check the readability table on the same page before putting text on a color.
If a pair is not listed there, ask whoever maintains the kit to check it first.

## 4. Fonts

Look in `tokens/typography.obks.json` or the Typography section of the
brand-at-a-glance page. Many free fonts (like Inter or Atkinson Hyperlegible)
are already in Canva's font list. Set them for headings and body text.

Only upload a font file to Canva if your license allows it. Check
`copy/legal.md`.

## 5. Voice

If your Canva Brand Kit has a brand voice section, paste a short summary from
`voice/tone.md` and the "Prefer" and "Avoid" lists from `voice/vocabulary.md`.

## 6. Keep it in sync

When the brand kit changes, the brand-at-a-glance page changes too. Ask your
kit maintainer to tell you when to update Canva, or check the page every few months.
