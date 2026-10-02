# @goodheart/bkr-cli

The `bkr` command for [Brand Kit Repositories (BKR)](https://github.com/Good-Heart-Tech/Brand-Kit-Standard).

```bash
npx @goodheart/bkr-cli init ./my-brand --brand-id my-brand --display-name "My Brand"
cd my-brand
npx @goodheart/bkr-cli export --all
npx @goodheart/bkr-cli digest
npx @goodheart/bkr-cli validate --strict
```

| Command | What it does |
|---------|--------------|
| `init <dir>` | Scaffold an organization or product kit |
| `validate [dir] [--strict] [--parent <dir>]` | Check schema, files, token formats, contrast, stale exports, sharing guardrails, parent tokens |
| `export [dir] --all` | DTCG, CSS, Tailwind v3/v4, brand-at-a-glance page, agent UI brief |
| `digest [dir]` | Regenerate `AGENTS.md` and the agent digest |
| `publish [dir] [--dry-run]` | Bundle only the files the kit allows to be shared |
| `upgrade [dir]` | Move a 0.1 kit to 0.2 |

Spec: [BKR-SPEC.md](https://github.com/Good-Heart-Tech/Brand-Kit-Standard/blob/main/spec/BKR-SPEC.md). MIT licensed.
