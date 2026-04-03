# Delegate envelopes (Tier B)

Optional **file-based handoff** from the **main** `/vp-auto` agent to an isolated **worker** session. Normative workflow behavior lives in `workflows/autonomous.md` (Tier A re-hydrate) and user-facing docs in `docs/user/features/autonomous-mode.md`.

## Layout (consumer project)

```
.viepilot/delegates/
├── README.md          ← this file (copied from template at crystallize)
├── pending/           ← worker picks up charters here (optional convention)
├── done/              ← worker drops completed envelopes here
└── examples/          ← non-normative samples (parse + field reference)
```

## Envelope contract (JSON)

Each file is one object. **Pending** (worker input) and **done** (worker output) share a core shape; **done** adds completion fields.

### Required — pending (`pending/{id}.json` or worker inbox)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Stable id, e.g. `del-20260403-001` |
| `parent_task` | string | ROADMAP/task id this delegate supports (e.g. `5.2`) |
| `charter` | string | What the worker must do / not do |
| `mode` | string | `explore` \| `verify` \| `write` |
| `created_at` | string | ISO-8601 timestamp |

### Optional — pending

| Field | Type | Description |
|-------|------|-------------|
| `write_scope` | string[] | Repo-relative paths the worker **may** modify; omit or empty ⇒ **read-only** |
| `allowed_tools_hint` | string[] | Non-binding hint for host UI (e.g. `Read`, `Shell`) |

### Required — done (`done/{id}.json`)

All pending fields **plus**:

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | e.g. `complete`, `failed`, `blocked` |
| `summary` | string | Short outcome for main agent (no full transcript) |
| `evidence_paths` | string[] | Repo-relative files proving work (logs, diffs, notes) |
| `errors` | string[] | Human-readable errors; use `[]` when none |

## Merge rules (main agent)

1. **Source of truth for merge:** only `delegates/done/{id}.json`. Never treat `pending/` as approved output.
2. **Read-only default:** if `write_scope` is absent or empty, the worker must not write project files; main still reads `done/` for findings.
3. **Writes:** when `write_scope` is set, worker changes must stay inside those paths; main reviews `git diff` against the envelope before merging or continuing.
4. **Context hygiene:** paste **summaries + evidence paths** into the parent task log — not full worker transcripts — to avoid context rot.

## Examples

See `examples/pending.example.json` and `examples/done.example.json`.
