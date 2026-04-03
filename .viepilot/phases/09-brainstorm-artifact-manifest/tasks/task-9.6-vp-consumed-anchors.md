# Task 9.6: crystallize.md — vp:consumed anchor tracking stub

## Meta
- **Phase**: 09-brainstorm-artifact-manifest
- **Status**: done
- **Complexity**: S
- **Dependencies**: Tasks 9.3, 9.5
- **Git Tag**: `viepilot-vp-p9-t9.6`

## Task Metadata

```yaml
type: "build"
complexity: "S"
write_scope:
  - "workflows/crystallize.md"
recovery_budget: "S"
```

## Objective

Add `vp:consumed` HTML comment anchor tracking to crystallize.md Step 4 (generate_architecture). Tags ARCHITECTURE.md sections that were populated from brainstorm artifacts with anchors for future drift detection. Full drift check deferred to Post-v2.1.

## Pre-execution documentation gate (doc-first; BUG-001)

- [x] Task contract fields filled
- [x] Paths listed
- [x] File-Level Plan explains what and why
- [x] PHASE-STATE.md marks this task `in_progress` before first implementation commit

## Paths
```yaml
files_to_create: []
files_to_modify:
  - "workflows/crystallize.md"
```

## File-Level Plan
- `workflows/crystallize.md`: Add "Consumed Anchor Tracking" sub-section at end of Step 4 (generate_architecture). Documents anchor format, placement rules, and drift check stub.

## Acceptance Criteria
- [x] `grep -n 'vp:consumed' workflows/crystallize.md` → match found
- [x] Anchor format documented
- [x] Drift check noted as stub (Post-v2.1)

## Implementation Notes
- Added `### Consumed Anchor Tracking (vp:consumed) — stub` at end of Step 4
- Anchor format: `<!-- vp:consumed artifact="{type}" session="{id}" at="{date}" -->`
- Placed before major sections populated from brainstorm artifacts
- Drift check deferred — stub only injects anchors, no active detection

## Files Changed
```
M	workflows/crystallize.md
```

## State Update Checklist
- [x] Update PHASE-STATE.md after PASS
- [x] Update TRACKER.md
- [x] Update HANDOFF.json
- [x] Update ROADMAP.md if progress changed

## Post-Completion

### Implementation Summary
- Added vp:consumed anchor tracking stub to crystallize.md Step 4
- Anchor format and placement rules documented
- Drift check noted as Post-v2.1 future work
- Enables /vp-audit to detect brainstorm→ARCHITECTURE.md drift later

### Files Changed
| File | Action |
|------|--------|
| `workflows/crystallize.md` | modified |
