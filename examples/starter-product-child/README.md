# Acme Docs brand kit (reference product example)

![Colors](tokens/exports/svg/palette.svg)

Acme Docs is a **fictional** product of the fictional
[Acme Labs](../starter-org/) organization. This kit shows how a child kit
inherits the parent palette and adds only what is different.

- Colors marked `inheritsFrom` must match `../starter-org` exactly.
  `bkr validate` checks them because `hierarchy.parent.path` points there.
- The only new color is `productAccent`.
- Sharing is `private` (the default): nothing leaves the organization.

## Commands

```bash
bkr export --all
bkr digest
bkr validate --strict
```

In a separate repository, check out the parent kit and pass it explicitly:

```bash
bkr validate --strict --parent ../acme-labs-brand-kit
```
