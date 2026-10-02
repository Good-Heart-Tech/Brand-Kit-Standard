# Colors

Official values live in `tokens/colors.bkr.json` (light) and
`tokens/themes/dark.bkr.json` (dark). See them all in
`tokens/exports/html/brand-at-a-glance.html`.

## Defaults

- Page background: `surface`
- Callout panels: `subtle`
- Headings: `ink`
- Body text: `body`
- Buttons: `onPrimary` label on `primary`
- Links: `link` on `surface`
- Charts and illustrations: `accent`

## Dark theme

The dark theme swaps `surface`, `subtle`, `ink`, `body`, `primary`, and `link`.
Use the CSS variables and it switches automatically.

## Do not

- Fill large backgrounds with `primary`
- Use `accent` for text or buttons (it is too light to read on white)
- Add colors that are not in the tokens
