# Task 9.3: crystallize.md — Step 0A mandatory manifest consume

## Meta
- **Phase**: 09-brainstorm-artifact-manifest
- **Status**: done
- **Complexity**: M
- **Dependencies**: Tasks 9.1, 9.2
- **Git Tag**: `viepilot-vp-p9-t9.3`

## Task Metadata

```yaml
type: "build"
complexity: "M"
write_scope:
  - "workflows/crystallize.md"
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

Add Step 0A to crystallize.md: mandatory manifest consume. Runs after Step 0 (collect metadata) and before Step 1 (analyze brainstorm). Must:
1. Read `.viepilot/brainstorm-manifest.json` if it exists
2. Extract all artifacts with `consumed: false` — these are new since last crystallize
3. Load artifact paths into working context for subsequent steps
4. Fallback gracefully if manifest missing (first-time crystallize on project without brainstorm)
5. After crystallize completes: mark consumed artifacts as `consumed: true` + `consumed_at: {date}`

## Pre-execution documentation gate (doc-first; BUG-001)

- [x] Task contract fields filled
- [x] Paths listed
- [x] File-Level Plan explains insertion point
- [x] PHASE-STATE.md marks this task `in_progress` before first implementation commit

## Paths
```yaml
files_to_create: []
files_to_modify:
  - "workflows/crystallize.md"
```

## File-Level Plan
- `workflows/crystallize.md`: Insert `<step name="consume_manifest">` between Step 0 (collect_metadata) and Step 1 (analyze_brainstorm). Content:
  - Read `.viepilot/brainstorm-manifest.json`
  - Fallback if missing: log "No brainstorm manifest found — running without artifact context"
  - For each artifact type: if consumed=false, load path + summary into crystallize working context
  - Special handling for domain_entities: feed directly into Step 6A entity extraction
  - Special handling for tech_stack: feed into Step 2/3 stack research
  - After all crystallize steps complete (in commit_confirm step): update manifest consumed=true + consumed_at

## Acceptance Criteria
- [x] `grep -n 'consume_manifest\|Step 0A' workflows/crystallize.md` → match found
- [x] Step reads brainstorm-manifest.json
- [x] Fallback if manifest missing
- [x] Marks `consumed: true` + `consumed_at` after crystallize completes
- [x] Positioned after Step 0, before Step 1

## Verification
```yaml
automated:
  - command: "grep -n 'consume_manifest' workflows/crystallize.md"
    expected: "match found between Step 0 and Step 1"
  - command: "grep -n 'consumed.*true' workflows/crystallize.md"
    expected: "match in post-crystallize update block"
```

## State Update Checklist
- [x] Update PHASE-STATE.md after PASS
- [x] Update TRACKER.md
- [x] Update HANDOFF.json
- [x] Update ROADMAP.md if progress changed

## Files Changed
```
M	workflows/crystallize.md
```

## Post-Completion

### Implementation Summary
- Added `<step name="consume_manifest">` (Step 0A) between Steps 0 and 1 in crystallize.md
- Reads brainstorm-manifest.json, loads 7 artifact types into working context
- Graceful fallback when manifest is missing (first-time crystallize)
- Domain entities passed to Step 6A, tech stack to Step 2/3, compliance to Step 10
- Step 12 (commit_confirm) updated with 12.1 sub-step to mark artifacts consumed=true

### Files Changed
| File | Action |
|------|--------|
| `workflows/crystallize.md` | modified |
