# Typography

We use **Public Sans** for everything. It is free under the SIL Open Font
License, it is on Google Fonts and in Canva, and many government websites use
it because it is clear at every size. Fonts live in
`tokens/typography.obks.json`.

| Use | Font | Weight | Size |
|-----|------|--------|------|
| Page and section headings | `heading` | `bold` | `heading` (36px) or `display` (48px) |
| Paragraphs and form text | `body` | `regular` | `base` (18px) |
| Lead paragraphs and alert text | `body` | `regular` | `large` (22px) |
| Buttons, labels, table headers | `body` | `semibold` | `base` (18px) |
| Captions and footnotes | `body` | `regular` | `small` (16px) |

## Rules

- Body text is never smaller than 18px on screens and 12pt in print. This is
  larger than most websites, on purpose: many of our readers have low vision.
- Nothing is smaller than 16px, including footnotes and legal text.
- Headings use `tight` line height; paragraphs use `normal`.
- Left-align text. Do not justify or center long paragraphs.
- Do not use all capital letters for sentences. Short labels such as "ALERT"
  are fine.
- Text must stay readable when zoomed to 200 percent.
