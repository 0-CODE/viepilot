# Phase 09: Brainstorm Artifact Manifest

## Goal
Implement manifest schema + brainstorm auto-generation on `/save` + crystallize mandatory consume (Step 0A). Fix all 4 brainstorm→crystallize→vp-auto drop points. Also add `vp:decision` anchor syntax for doc-drift detection.

**ENH-030 scope (folded into 9.2)**: Extend schema with `domain_entities` (required:true) + `tech_stack` (required:true) + `compliance_domains` (required:false). Both required types must be auto-extracted by brainstorm `/save` and consumed by crystallize Step 0A.

## Background
4 drop points identified via code audit:
- Drop 1: crystallize reads brainstorm via inference (conditional, not guaranteed)
- Drop 2: crystallize extracts notes.md → ARCHITECTURE.md, losing detail
- Drop 3: TASK.md context_required missing ui-direction paths (placeholder only)
- Drop 4: vp-auto has zero awareness of ui-direction artifacts

Fix: `.viepilot/brainstorm-manifest.json` as guaranteed artifact; crystallize Step 0A mandatory consume; ui_task_context_hint auto-populates TASK.md context_required; vp:decision anchors for drift tracking.

## Tasks

| # | Task | Complexity | File(s) |
|---|------|------------|---------|
| 9.1 | brainstorm-manifest.json schema v1 template | M | `templates/project/brainstorm-manifest.json` ✅ done |
| 9.2 | brainstorm.md — Auto-generate manifest on /save + /end + ENH-030 schema update | M | `workflows/brainstorm.md`, `templates/project/brainstorm-manifest.json` |
| 9.3 | crystallize.md — Step 0A mandatory manifest consume | M | `workflows/crystallize.md` |
| 9.4 | crystallize.md — Auto-populate TASK.md context_required from ui_task_context_hint | M | `workflows/crystallize.md` |
| 9.5 | brainstorm.md — vp:decision anchor syntax | M | `workflows/brainstorm.md` |
| 9.6 | crystallize.md — vp:consumed anchor tracking stub | S | `workflows/crystallize.md` |
| 9.7 | Version bump 2.1.0 → 2.1.1 + CHANGELOG | S | `package.json`, `CHANGELOG.md`, `.viepilot/TRACKER.md` |

## Execution Order
9.1 → 9.2 → 9.3 → 9.4 → 9.5 → 9.6 → 9.7

## Acceptance Criteria
- [ ] `cat .viepilot/brainstorm-manifest.json` → valid JSON after brainstorm /save
- [ ] crystallize Step 0A reads manifest before all other steps
- [ ] TASK.md for UI page task → context_required has ui-direction path auto-populated
- [ ] `/save` in brainstorm → manifest updated, vp:decision anchors present
- [ ] `node -p "require('./package.json').version"` → `2.1.1`

## Dependencies
- Phase 8 (ENH-022) complete

## Notes
Scaffolded by `/vp-evolve` on 2026-04-03.
ENH-030 folded into task 9.2 on 2026-04-03 (brainstorm session Part 4 decisions).
Tasks 9.2 + 9.5 both touch `workflows/brainstorm.md` — must be sequential.
Tasks 9.3 + 9.4 + 9.6 all touch `workflows/crystallize.md` — must be sequential.

## ENH-030: New Artifact Types (task 9.2 scope)

### `domain_entities` (required: true)
```json
{
  "type": "domain_entities",
  "entities": [
    { "name": "", "type": "core|supporting|external", "needs_crud_api": true, "service_phase": "OK|MISSING|N/A" }
  ],
  "required": true,
  "consumed": false,
  "consumed_at": null,
  "last_updated": null
}
```

### `tech_stack` (required: true)
```json
{
  "type": "tech_stack",
  "stacks": {
    "backend": [],
    "database": [],
    "frontend": [],
    "mobile": [],
    "protocol": [],
    "infra": []
  },
  "diagram_profile": null,
  "required": true,
  "consumed": false,
  "consumed_at": null,
  "last_updated": null
}
```

### `compliance_domains` (required: false)
```json
{
  "type": "compliance_domains",
  "per_service": [
    { "service": "", "risk": "HIGH|MED|LOW", "keywords": [] }
  ],
  "required": false,
  "consumed": false,
  "consumed_at": null,
  "last_updated": null
}
```
