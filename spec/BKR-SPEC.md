# BKR specification 0.1

**Contract id:** `ght.brandkit/v1`  
**Status:** draft (Good Heart Tech steward)

## 1. Scope

A **Brand Kit Repository (BKR)** is a Git repository that holds everything needed
to represent an organization or product brand in software, documents, and
AI-assisted workflows—without scattering truth across unrelated files.

BKR is **not** a design-system component library. It may *reference* UI
frameworks, but its job is **brand truth**: who we are, how we sound, what we
may say, how marks and colors behave, and machine-readable tokens.

## 2. Normative vs narrative

| Kind | Location | Authority |
|------|----------|-----------|
| Manifest | `brandkit.yaml` | Profiles, hierarchy, validation level |
| Tokens | `tokens/**/*.bkr.json` | Color, type, theme values |
| Exports | `tokens/exports/**` | Generated only; CI overwrites |
| Narrative | `identity/`, `voice/`, `visual/`, `copy/` | Usage, rationale, legal |

When narrative and tokens disagree, **tokens win** for implementable values.
Narrative must be updated to match after token changes.

## 3. Manifest (`brandkit.yaml`)

Required top-level keys:

- `schema`: must be `ght.brandkit/v1`
- `specVersion`: semver of this document the kit conforms to (e.g. `0.1.0`)
- `brand`: `id`, `displayName`, `status` (`draft` | `active` | `deprecated`)
- `role`: `organization` | `product` | `campaign`
- `profiles`: enabled layers (see §4)
- `consumption`: hints for apps and agents

Optional:

- `hierarchy.parent`: `{ repository, ref, brandId }` for child kits
- `publication`: what may be republished if the repo is shared externally
- `validation`: `{ rulesPack, minContrastRatio }`
- `contacts`: brand and legal owner emails

## 4. Profiles (layers)

Profiles declare which directories are **required** for validation.

| Profile key | Directories | Purpose |
|-------------|-------------|---------|
| `core` | always | manifest, README, AGENTS.md |
| `identity` | `identity/` | Positioning, naming |
| `voice` | `voice/` | Tone, vocabulary |
| `visual` | `visual/`, `assets/` | Logo rules, accessibility |
| `copy` | `copy/` | Approved messaging, legal |
| `tokens` | `tokens/` | BKR token files + exports |
| `partnerPublic` | `profiles/partner-public/` | Redistributable subset index |

Default starter templates enable: `core`, `identity`, `voice`, `visual`, `copy`, `tokens`.

## 5. Hierarchy

- **Organization** kits define the canonical palette and master marks.
- **Product** kits **must** set `hierarchy.parent` and must not define colors
  outside the parent palette unless listed in `tokens/colors.bkr.json` under
  `extensions` with a documented `inheritsFrom` parent token.
- **Campaign** kits are short-lived; may omit `assets/logo` if they only reuse parent marks.

Rule packs (e.g. `bkr-rules-ght`) add cross-repo checks beyond JSON Schema.

## 6. Token files (`.bkr.json`)

Each file is a JSON document with:

- `$schema`: URL or path to BKR token schema
- `meta`: `{ brandId, layer }` where `layer` is `color` | `typography` | `theme`
- `tokens`: map of group → name → token object

Token object fields:

- `value` (required): hex, number, string per type
- `type` (required): `color` | `dimension` | `fontFamily` | `fontWeight` | `duration` | `string`
- `description` (recommended)
- `usage` (optional): `{ contexts: string[], avoid: string[] }`
- `aliases` (optional): alternate values documented but not exported as separate tokens
- `inheritsFrom` (optional, product kits): parent token path `group.name`

## 7. Exports

Running `bkr export` writes:

| Target | Output |
|--------|--------|
| `dtcg` | `tokens/exports/dtcg/*.tokens.json` (W3C Design Tokens 2025.10 shape) |
| `css` | `tokens/exports/css/variables.css`, optional `dark-theme.css` |
| `tailwind` | `tokens/exports/tailwind/theme.cjs` |

Exports are **deterministic** from `.bkr.json` sources. Do not hand-edit.

## 8. Agent contract

`AGENTS.md` at repo root describes load order:

1. `brandkit.yaml`
2. `digest/AGENT_CONTEXT.md` (generated, size-capped)
3. On demand: `voice/*`, `visual/logo.md`, `tokens/exports/css/variables.css`

Regenerate with `bkr digest`. The digest is a lossy summary for prompt budget;
full repo remains authoritative for CI and humans.

## 9. Validation

`bkr validate`:

1. Parse manifest against JSON Schema
2. Verify required paths for enabled profiles
3. Validate each `*.bkr.json` against token schema
4. Run optional `rulesPack` (e.g. `@goodheart/bkr-rules-ght`)
5. Warn if `tokens/exports/` is stale (hash mismatch)

Exit code `1` on errors; warnings do not fail unless `--strict`.

## 10. Versioning

- **Spec** semver in this repo (`spec/BKR-SPEC.md` header)
- **Kit** `specVersion` must be compatible with the CLI’s supported range
- Breaking manifest changes bump `ght.brandkit/v2` (future)

## 11. Security and publication

- Never commit licensed font binaries without rights documented in `copy/legal.md`
- `partnerPublic` profile lists paths safe to mirror; default internal kits keep repo private
- Trademarks remain restricted regardless of MIT tooling license
