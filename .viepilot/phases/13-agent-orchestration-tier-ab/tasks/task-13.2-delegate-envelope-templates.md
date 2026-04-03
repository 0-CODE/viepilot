# Task 13.2: templates/project/delegates/ — envelope schema + samples

## Meta
- **Phase**: 13-agent-orchestration-tier-ab
- **Status**: complete
- **Complexity**: M
- **Dependencies**: 13.1 (recommended: merge order after 13.1 to avoid autonomous churn)
- **Git Tag**: `viepilot-vp-p13-t13.2`

## Task Metadata

```yaml
type: build
complexity: M
write_scope:
  - templates/project/delegates/
  - workflows/crystallize.md
recovery_budget: M
can_parallel_with: []
recovery_overrides:
  L1: { block: false }
  L2: { block: false }
  L3: { block: false, reason: "" }
```

## Objective
Introduce **delegate envelope** artifacts for Tier B: documented JSON shape for `.viepilot/delegates/pending/{id}.json` and `done/{id}.json`, plus `README.md` in `templates/project/delegates/`. Optionally wire crystallize/install to copy `delegates/` into new projects (minimal: document in README if auto-copy out of scope).

## Paths
```yaml
files_to_create:
  - templates/project/delegates/README.md
  - templates/project/delegates/examples/pending.example.json
  - templates/project/delegates/examples/done.example.json
files_to_modify:
  - workflows/crystallize.md
```

## File-Level Plan
- `templates/project/delegates/README.md`: Fields — `id`, `parent_task`, `charter`, `mode` (explore|verify|write), `write_scope` (optional), `allowed_tools_hint`, `created_at`.
- Examples: minimal valid pending + done with `status`, `summary`, `evidence_paths`, `errors`.
- `workflows/crystallize.md`: If policy exists for copying template dirs, add `delegates/`; else single note in Step that lists optional artifact.

## Context Required
```yaml
files_to_read:
  - .viepilot/ARCHITECTURE.md
  - docs/brainstorm/session-2026-04-03.md
  - workflows/autonomous.md
```

## Acceptance Criteria
- [x] `templates/project/delegates/` committed with README + two examples.
- [x] Contract states: worker writes only under allowed paths; main merges from `done/` only.

## Verification
```yaml
automated:
  - command: "test -f templates/project/delegates/README.md && echo ok"
    expected: "ok"
manual:
  - description: "Validate example JSON parses with jq or node"
    required: true
```

## State Update Checklist
- [x] PHASE-STATE / TRACKER / HANDOFF per protocol

## Implementation Notes
- Added `README.md` with field tables, merge rules (main reads **only** `done/{id}.json`), layout for `pending/` + `done/` + `examples/`.
- Examples use shared `id` `del-example-pending` to show pending → done shape.
- `crystallize.md` Step 9: mkdir `pending`/`done`/`examples`, copy README + examples into `.viepilot/delegates/` on new projects.

## Post-Completion
- Installer mirrors `templates/project/*` recursively — `delegates/` ships with package without install.cjs changes.
