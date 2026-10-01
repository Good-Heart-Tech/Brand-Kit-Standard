# Agent instructions (BKR)

This repository follows the **Brand Kit Repository (BKR)** layout (`ght.brandkit/v1`).

## Load order

1. `brandkit.yaml` — profiles, role, parent kit
2. `digest/AGENT_CONTEXT.md` — size-capped summary (generated)
3. As needed: `voice/`, `visual/logo.md`, `tokens/exports/css/variables.css`

## Rules

- **Tokens win** over prose for hex, spacing, and type scales.
- **Product kits** inherit palette rules from `hierarchy.parent`; do not introduce a second primary.
- Regenerate digest after substantive edits: `bkr digest`.

## Human docs

See `README.md` for the file index.
