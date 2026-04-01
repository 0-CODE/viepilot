# Global profiles & project meta binding (FEAT-009)

Normative contract for machine-level **reusable org/context** (`~/.viepilot/`) and **per-repo binding** (`.viepilot/META.md`). Implementations (installer, brainstorm intake, crystallize, vp-docs) MUST follow this doc unless a phase explicitly supersedes it.

## Layout (machine-level)

Same home as stack cache and UI components:

| Path | Purpose |
|------|---------|
| `~/.viepilot/profiles/` | One markdown file per reusable profile |
| `~/.viepilot/profiles/<slug>.md` | Profile body + YAML frontmatter |
| `~/.viepilot/profile-map.md` | Registry for lookup / disambiguation (human-editable) |

`npx viepilot install` (Node installer) creates `profiles/` and seeds `profile-map.md` when missing — see `lib/viepilot-install.cjs`. Manual equivalent:

```bash
mkdir -p "$HOME/.viepilot/profiles"
```

## Profile slug & filename

- **Slug**: `kebab-case`, characters `[a-z0-9-]` only, length 1–64.
- **File**: `~/.viepilot/profiles/<slug>.md` where `<slug>` matches basename without `.md`.
- **profile_id**: MUST equal `<slug>` (stable id for maps and binding). Future UUID optional in later revisions; v1 uses slug only.

## Profile file schema (`*.md`)

YAML frontmatter (required keys):

| Key | Type | Description |
|-----|------|-------------|
| `profile_id` | string | Same as slug |
| `display_name` | string | Human label |
| `org_tag` | string | Short org / client tag (e.g. `acme`, `personal`) |
| `tags` | string[] | Freeform tags for filtering |
| `last_updated` | string | ISO 8601 date `YYYY-MM-DD` |

Optional frontmatter:

| Key | Type | Description |
|-----|------|-------------|
| `locale` | string | BCP 47 or free text (e.g. `vi-VN`) |
| `website` | string | Public URL only |

Recommended markdown body sections (headings):

- `## Organization`
- `## Branding & voice`
- `## Audience`
- `## Legal & attribution` (public-facing lines only)
- `## Contact (public)`
- `## Notes`

### Forbidden content

Do **not** store secrets in profiles: API keys, passwords, tokens, private PEMs, session cookies, or any credential used for auth. Use a secrets manager; profiles are **non-sensitive** context only.

## Registry: `~/.viepilot/profile-map.md`

Purpose: **quick lookup** without opening every `profiles/*.md`.

### File shape

1. Title + short intro (1–3 lines).
2. One markdown **table** with fixed columns (header row literal):

| profile_id | display_name | org_tag | profile_path | tags | last_used |

- **profile_path**: Prefer absolute path `~/.viepilot/profiles/<slug>.md` or `$HOME/.viepilot/profiles/<slug>.md` for clarity.
- **tags**: Comma-separated in cell.
- **last_used**: ISO `YYYY-MM-DD` or empty; tooling SHOULD update when user selects profile for a project.

### Rules

- **Add** a row when a new profile is created.
- **Do not** delete rows silently; deprecate with a tag or note if needed.
- Implementations SHOULD sort or filter by `org_tag` / `tags` when offering disambiguation (multiple companies).

## Project binding (repo-local)

### Source of truth: `.viepilot/META.md`

Small file (see template `templates/project/VIEPILOT-META.md`). Minimum YAML frontmatter:

| Key | Type | Description |
|-----|------|-------------|
| `viepilot_profile_id` | string | Active profile slug / `profile_id` |

Optional:

| Key | Type | Description |
|-----|------|-------------|
| `viepilot_profile_path` | string | Override path to profile file (advanced; default derived from id) |

Crystallize / vp-docs / automation **MUST** resolve active profile by:

1. Read `.viepilot/META.md` frontmatter `viepilot_profile_id`.
2. If missing → intake or explicit user choice (Phase 31.2+).
3. Load `~/.viepilot/profiles/<viepilot_profile_id>.md` unless `viepilot_profile_path` set.
4. If file missing → error or re-prompt (implementation-defined in later tasks).

### Optional mirror

`HANDOFF.json` MAY duplicate `viepilot_profile_id` for session continuity. If both exist, **META.md wins**; tooling SHOULD keep them in sync when updating binding.

## Relation to `PROJECT-META.md`

`templates/project/PROJECT-META.md` is a **large product metadata** template (attribution, headers, etc.). **Do not merge** with ViePilot binding. Keep **VIEPILOT-META.md** (or `.viepilot/META.md`) separate and small.

## References

- UI component store pattern: `workflows/ui-components.md` (`~/.viepilot/ui-components/`)
- Stack cache: `~/.viepilot/stacks/{stack}/`
- Request: `.viepilot/requests/FEAT-009.md` (local)
