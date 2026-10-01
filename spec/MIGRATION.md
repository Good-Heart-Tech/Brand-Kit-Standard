# Migration guide

Move an existing Good Heart Tech-style kit into BKR without losing history.

## 1. Scaffold

From this repo:

```bash
node packages/bkr-cli/bin/bkr.js init ../My-Kit --role organization \
  --brand-id my-brand --display-name "My Brand"
```

## 2. Import legacy colors JSON

If the kit uses `tokens/colors.json` (GHT shape):

```bash
node packages/bkr-cli/bin/bkr.js import legacy-ght-colors ../My-Kit ../My-Kit/tokens/colors.json
```

Then split narrative content:

| Legacy file | BKR destination |
|-------------|-----------------|
| `BRAND.md` | `visual/palette.md`, `visual/logo.md` |
| `COPY.md` | `copy/messaging.md` |
| `ACCESSIBILITY.md` | `visual/accessibility.md` |
| `LEGAL.md` | `copy/legal.md` |
| `logo/` | `assets/logo/` |

## 3. Export and validate

```bash
cd ../My-Kit
node ../Brand-Kit-Standard/packages/bkr-cli/bin/bkr.js export --all
node ../Brand-Kit-Standard/packages/bkr-cli/bin/bkr.js digest
node ../Brand-Kit-Standard/packages/bkr-cli/bin/bkr.js validate .
```

## 4. CI

Add a workflow job that runs `bkr validate` on pull requests.

## Product child kits

Set `--role product` and `--parent-repo` / `--parent-brand-id` to the parent
GitHub URL and `brand.id`. Map product-only accents under `tokens/colors.bkr.json`
without redefining the org primary hex.
