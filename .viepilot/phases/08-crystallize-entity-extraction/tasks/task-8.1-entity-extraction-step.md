# Task 8.1: crystallize.md — Domain Entity Extraction step (Fix A)

## Meta
- **Phase**: 08-crystallize-entity-extraction
- **Status**: done
- **Complexity**: M
- **Dependencies**: Phase 7 complete
- **Git Tag**: `viepilot-vp-p8-t8.1`
  _(resolved at runtime: `TAG_PREFIX=$(node bin/vp-tools.cjs tag-prefix --raw)`)_

## Task Metadata

```yaml
type: "fix"
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

Add an explicit "Domain Entity Extraction" step to `workflows/crystallize.md`, positioned after brainstorm analysis and before phase generation. This step must:
1. Require AI to explicitly list all named domain entities from brainstorm (nouns that are persisted objects)
2. For each entity: classify type (core | reference | junction) and flag `needs_crud_api: yes/no`
3. For entities with `needs_crud_api=yes`: check if a management service phase exists in planned phases
4. Output: entity manifest table — entity name, type, service_phase (or MISSING)

This is a tường minh (explicit, non-inference) step — AI must list entities, not assume they are covered.

## Pre-execution documentation gate (doc-first; BUG-001)

- [x] Task contract fields filled
- [x] Paths listed
- [x] File-Level Plan explains insertion point in crystallize.md
- [x] PHASE-STATE.md marks this task `in_progress` before first implementation commit

## Paths
```yaml
files_to_create: []
files_to_modify:
  - "workflows/crystallize.md"
```

## File-Level Plan
- `workflows/crystallize.md`: Read full file first to find the correct step to insert after. Domain Entity Extraction must come:
  - AFTER: brainstorm analysis / architecture reading steps
  - BEFORE: phase list generation
  - Label: `<step name="domain_entity_extraction">`
  - Content: explicit checklist for entity scan + classification + service phase check + entity manifest table output

## Context Required
```yaml
files_to_read:
  - "workflows/crystallize.md"        # full file — find insertion point
  - ".viepilot/requests/ENH-022.md"   # fix spec with Fix A details
```

## Acceptance Criteria
- [x] `grep -n 'Domain Entity Extraction' workflows/crystallize.md` → match found
- [x] Step requires explicit entity list (type + needs_crud_api flag)
- [x] Step checks for service phase existence per entity
- [x] Step outputs entity manifest table format
- [x] Positioned after brainstorm analysis, before phase generation

## Best Practices to Apply
- [x] Step is tường minh — AI must list entities explicitly, not infer
- [x] Entity manifest table is a concrete output, not prose
- [x] Backward compatible: projects without domain entities skip gracefully

## Do / Don't
### Do
- Use `<step>` XML block consistent with existing crystallize.md structure
- Include example entity manifest table in the step for clarity

### Don't
- Don't make this an optional "if needed" step — it must run for ALL projects
- Don't conflate with DB migration phase — CRUD API service phase is separate from schema migration

## Implementation Notes
- Added Step 6A `<step name="domain_entity_extraction">` between generate_rules (Step 6) and generate_roadmap (Step 7)
- Step has 4 sub-sections: 6A.1 entity scan, 6A.2 service phase coverage check, 6A.3 entity manifest table output, 6A.4 MISSING entity handling
- Skip condition for projects without domain entities (CLI tools, static sites)
- Entity manifest table includes example with OK/MISSING/N/A statuses

## Verification
```yaml
automated:
  - command: "grep -n 'Domain Entity Extraction' workflows/crystallize.md"
    expected: "match found"
  - command: "grep -n 'needs_crud_api' workflows/crystallize.md"
    expected: "match found in entity extraction step"
```

## State Update Checklist
- [x] Update `.viepilot/phases/08-crystallize-entity-extraction/PHASE-STATE.md` after PASS
- [x] Update `.viepilot/TRACKER.md`
- [x] Update `.viepilot/HANDOFF.json`
- [x] Update `.viepilot/ROADMAP.md` if progress changed

## Files Changed
```
M	workflows/crystallize.md
```

## Rollback
```bash
TAG_PREFIX=$(node bin/vp-tools.cjs tag-prefix --raw)
git revert --no-commit $(git rev-list "${TAG_PREFIX}-p8-t8.1".."${TAG_PREFIX}-p8-t8.1-done")
```

## Post-Completion

> **AI fills this section after task PASS**

### Implementation Summary
- Added Step 6A "Domain Entity Extraction" to crystallize.md (between Steps 6 and 7)
- Requires explicit entity list: name, type (core/reference/junction), needs_crud_api flag
- Checks service phase coverage — MISSING entities trigger user prompt
- Outputs entity manifest table in ARCHITECTURE.md
- Skip condition for projects without domain entities

### Files Changed
| File | Action |
|------|--------|
| `workflows/crystallize.md` | modified |

### Checklist Verification
- [x] `## Meta → Status` set to `done`
- [x] All `## Acceptance Criteria` boxes ticked `[x]`
- [x] PHASE-STATE.md task row updated
- [x] HANDOFF.json `position.task` → 8.2
- [x] TRACKER.md current task line updated
