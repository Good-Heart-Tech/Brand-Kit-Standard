# @goodheart/bkr-rules-ght

Optional [BKR](https://github.com/Good-Heart-Tech/Brand-Kit-Standard) rule pack
for Good Heart Tech and Honey House kits. Enable it in `brandkit.yaml`:

```yaml
validation:
  rulesPack: "@goodheart/bkr-rules-ght"
```

Rules:

- Product kits must declare `hierarchy.parent` (error)
- Every color should have a description (warning)
- `inheritsFrom` only in product kits (warning)
- `contacts.security` is required for public kits and recommended for all (error / warning)
- Active kits cannot use a placeholder `example.org` security contact (error)
- `minContrastRatio` below 4.5 does not meet WCAG AA (warning)

Write your own pack: export `validate({ kitRoot, manifest, tokens })` returning
`{ errors, warnings }`, then set `rulesPack` to its package name or a local path
like `./rules/index.js`. MIT licensed.
