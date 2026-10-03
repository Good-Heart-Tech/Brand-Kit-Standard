# @goodheart/obks-cli

The `obks` command for [Open Brand Kit Standard (OBKS) kits](https://github.com/Good-Heart-Tech/Open-Brand-Kit-Standard).

```bash
npx @goodheart/obks-cli init ./my-brand --brand-id my-brand --display-name "My Brand"
cd my-brand
npx @goodheart/obks-cli export --all
npx @goodheart/obks-cli digest
npx @goodheart/obks-cli validate --strict
```

| Command | What it does |
|---------|--------------|
| `init <dir>` | Scaffold an organization or product kit |
| `validate [dir] [--strict] [--parent <dir>]` | Check schema, files, token formats, contrast, stale exports, sharing guardrails, parent tokens |
| `export [dir] --all` | DTCG, CSS, Tailwind v3/v4, brand-at-a-glance page, agent UI brief |
| `digest [dir]` | Regenerate `AGENTS.md` and the agent digest |
| `publish [dir] [--dry-run]` | Bundle only the files the kit allows to be shared |
| `upgrade [dir]` | Move a 0.1 kit to 0.2 |

Spec: [OBKS-SPEC.md](https://github.com/Good-Heart-Tech/Open-Brand-Kit-Standard/blob/main/spec/OBKS-SPEC.md). MIT licensed.
