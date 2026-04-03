# Task 9.1: brainstorm-manifest.json schema v1 template

## Meta
- **Phase**: 09-brainstorm-artifact-manifest
- **Status**: done
- **Complexity**: M
- **Dependencies**: Phase 8 complete
- **Git Tag**: `viepilot-vp-p9-t9.1`
  _(resolved at runtime: `TAG_PREFIX=$(node bin/vp-tools.cjs tag-prefix --raw)`)_

## Task Metadata

```yaml
type: "build"
complexity: "M"
write_scope:
  - "templates/project/brainstorm-manifest.json"
recovery_budget: "M"
can_parallel_with: []
recovery_overrides:
  L1:
    block: false
  L2:
    block: false
  L3:
    block: false
    reason: ""
```

## Objective

Create `templates/project/brainstorm-manifest.json` — the schema v1 template for brainstorm artifact manifests. This file defines the structure that brainstorm.md will auto-generate and crystallize.md will consume. Must include:
- `sessions[]` — array of brainstorm session metadata
- `artifacts{}` — keyed by type: `ui_direction`, `product_horizon`, `research_notes`, `architecture_inputs`
- Each artifact: `path`, `type`, `consumed`, `consumed_at`, `summary`
- `ui_task_context_hint[]` — paths for auto-populating TASK.md `context_required`
- `version` field for schema evolution

## Pre-execution documentation gate (doc-first; BUG-001)

- [x] Task contract fields filled with real paths and intent
- [x] `## Paths` lists every file to create or modify
- [x] `## File-Level Plan` explains what and why per path
- [x] PHASE-STATE.md marks this task `in_progress` before first implementation commit

## Paths
```yaml
files_to_create:
  - "templates/project/brainstorm-manifest.json"
files_to_modify: []
```

## File-Level Plan
- `templates/project/brainstorm-manifest.json`: Create new JSON template file with schema v1 structure. Include:
  - Top-level `schema_version: 1` for future migration
  - `sessions[]` with fields: `id`, `date`, `file_path`, `topics_count`
  - `artifacts{}` with typed entries: each has `path`, `type`, `consumed`, `consumed_at`, `summary`
  - `ui_task_context_hint[]` for UI page task context auto-population
  - JSON comments via `_comment` fields (JSON doesn't support comments)

## Context Required
```yaml
files_to_read:
  - ".viepilot/phases/09-brainstorm-artifact-manifest/SPEC.md"
  - ".viepilot/ROADMAP.md"  # Phase 9 task details
```

## Acceptance Criteria
- [x] File exists at `templates/project/brainstorm-manifest.json`
- [x] Valid JSON (parseable by `JSON.parse`)
- [x] Contains `schema_version`, `sessions`, `artifacts`, `ui_task_context_hint` fields
- [x] Artifact types include: `ui_direction`, `product_horizon`, `research_notes`, `architecture_inputs`
- [x] Each artifact has `consumed: false` default

## Best Practices to Apply
- [x] Valid JSON — no trailing commas, no comments (use _comment fields)
- [x] Schema is extensible — unknown fields should be ignorable
- [x] Template uses placeholder values that are clearly distinguishable from real data

## Verification
```yaml
automated:
  - command: "node -e \"JSON.parse(require('fs').readFileSync('templates/project/brainstorm-manifest.json','utf8')); console.log('valid JSON')\""
    expected: "valid JSON"
  - command: "node -e \"const m=JSON.parse(require('fs').readFileSync('templates/project/brainstorm-manifest.json','utf8')); console.log(m.schema_version, Object.keys(m.artifacts).join(','))\""
    expected: "1 ui_direction,product_horizon,research_notes,architecture_inputs"
```

## State Update Checklist
- [x] Update PHASE-STATE.md after PASS
- [x] Update TRACKER.md
- [x] Update HANDOFF.json
- [x] Update ROADMAP.md if progress changed

## Files Changed
```
A	templates/project/brainstorm-manifest.json
```

## Post-Completion

> **AI fills this section after task PASS**

### Implementation Summary
- Created `templates/project/brainstorm-manifest.json` with schema_version 1
- 4 artifact types: ui_direction, product_horizon, research_notes, architecture_inputs
- Each artifact has path, type, consumed (default false), consumed_at, summary fields
- Includes sessions[], ui_task_context_hint[], decisions[] arrays
- Uses _comment fields for documentation (JSON-compatible)

### Files Changed
| File | Action |
|------|--------|
| `templates/project/brainstorm-manifest.json` | created |

### Checklist Verification
- [x] `## Meta → Status` set to `done`
- [x] All `## Acceptance Criteria` boxes ticked `[x]`
- [x] PHASE-STATE.md task row updated
- [x] HANDOFF.json `position.task` → 9.2
- [x] TRACKER.md updated
