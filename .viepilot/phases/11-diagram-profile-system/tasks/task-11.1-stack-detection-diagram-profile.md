# Task 11.1: crystallize.md — Stack detection → diagram profile selection

## Meta
- **Phase**: 11-diagram-profile-system
- **Status**: done
- **Complexity**: M
- **Dependencies**: Phase 8 complete (entity extraction informs state-heavy detection)
- **Git Tag**: `viepilot-vp-p11-t11.1`
  _(resolved at runtime: `TAG_PREFIX=$(node bin/vp-tools.cjs tag-prefix --raw)`)_

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

Add **Step 1D** to `workflows/crystallize.md` (after global stack cache **Step 1C**, before **Step 2** AI-GUIDE) that:

1. Consolidates stack/architecture signals from manifest `tech_stack`, Step 1 brainstorm, and `.viepilot/STACKS.md`.
2. Sets boolean detection flags: `microservices`, `kafka_or_messaging`, `relational_sql`, `spa_frontend`, `auth_boundary`, `state_heavy_entities`.
3. Includes a **normative stack → diagram profile** matrix and a deterministic profile-selection order.
4. Records a `diagram_profile` working-note structure (`profile_id`, flags, rationale) for **Step 4** to consume when filling the diagram applicability matrix.

## Pre-execution documentation gate (doc-first; BUG-001)

- [x] Task contract fields filled
- [x] Paths listed
- [x] File-Level Plan explains insertion point and Step 4 linkage
- [x] PHASE-STATE.md marks this task `in_progress` before first implementation commit

## Paths
```yaml
files_to_create: []
files_to_modify:
  - "workflows/crystallize.md"
```

## File-Level Plan
- `workflows/crystallize.md`: Insert `<step name="diagram_profile_selection">` immediately after Step 1C (`write_stack_cache`) and before Step 2 (`generate_ai_guide`). Content: signal sources, flag detection table (microservices, Kafka/MQ, SQL, SPA, auth, state-heavy entities), profile matrix (`distributed-events`, `microservices-api`, `spa-sql-monolith`, `sql-monolith`, `spa-frontend`, `default-monolith`), selection algorithm, YAML working-note shape.
- `workflows/crystallize.md`: In Step 4 (`generate_architecture`), before the existing “diagram applicability matrix” subsection, add a short normative block: derive/refine matrix rows using `diagram_profile` from Step 1D (do not downgrade a profile-primary diagram to N/A without brainstorm-level rationale).

## Context Required
```yaml
files_to_read:
  - "workflows/crystallize.md"
  - ".viepilot/phases/11-diagram-profile-system/SPEC.md"
```

## Acceptance Criteria
- [x] `grep -n 'diagram_profile_selection' workflows/crystallize.md` → match found
- [x] Step documents all six detection dimensions: microservices, Kafka/messaging, SQL, SPA, auth, state-heavy entities
- [x] Normative profile matrix + ordered selection rules present
- [x] Step 4 references Step 1D `diagram_profile` when classifying diagram types

## Best Practices to Apply
- [x] Match existing `<step name="...">` / `## Step N:` conventions in crystallize.md
- [x] Keep token-efficient tables; English for workflow normative text (existing file mix)
- [x] Backward compatible: if signals are thin, fall back to `default-monolith` with one-line note

## Do / Don't
### Do
- Reuse manifest Step 0A `tech_stack` and Step 6A entity hints for `state_heavy_entities` where applicable
- Keep Step 1D strictly about **selection**; defer SPEC.md matrix table layout to task 11.2

### Don't
- Don't create architecture folders or SPEC tables in this task (11.3 / 11.2)
- Don't change ENH-022 sidecar filename table unless required for consistency

## Implementation Notes
- Inserted Step 1D after Step 1C; added Step 4 subsection linking matrix to `diagram_profile`
- Aligned `primary_emphasis` vocabulary with existing six matrix keys (`system-overview`, `data-flow`, etc.)
- `state_heavy_entities` uses brainstorm + manifest `domain_entities` only (Step 6A runs after Step 4 in doc order)

## Verification
```yaml
automated:
  - command: "grep -n 'diagram_profile_selection' workflows/crystallize.md"
    expected: "match"
  - command: "grep -n 'state_heavy_entities' workflows/crystallize.md"
    expected: "match in Step 1D"
  - command: "grep -n 'diagram_profile' workflows/crystallize.md"
    expected: "multiple matches (1D + Step 4)"
```

## State Update Checklist
- [x] Update `.viepilot/phases/11-diagram-profile-system/PHASE-STATE.md` after PASS
- [x] Update `.viepilot/TRACKER.md`
- [x] Update `.viepilot/HANDOFF.json`
- [x] Update `.viepilot/ROADMAP.md` if phase progress changed

## Files Changed
```
M	workflows/crystallize.md
M	CHANGELOG.md
A	.viepilot/phases/11-diagram-profile-system/tasks/task-11.1-stack-detection-diagram-profile.md
M	.viepilot/phases/11-diagram-profile-system/PHASE-STATE.md
```

## Rollback
```bash
TAG_PREFIX=$(node bin/vp-tools.cjs tag-prefix --raw)
git revert --no-commit $(git rev-list "${TAG_PREFIX}-p11-t11.1".."${TAG_PREFIX}-p11-t11.1-done")
```

## Post-Completion

### Implementation Summary
- Step 1D derives `diagram_profile` from manifest, brainstorm, and `STACKS.md` with six boolean flags and six profile IDs
- Step 4 matrix section now requires merging brainstorm signals with `diagram_profile.primary_emphasis`
- CHANGELOG [Unreleased] documents Phase 11.1

### Files Changed
| File | Action |
|------|--------|
| `workflows/crystallize.md` | modified |
| `CHANGELOG.md` | modified |

### Checklist Verification
- [x] Meta Status → done
- [x] Acceptance criteria ticked
- [x] PHASE-STATE / HANDOFF / TRACKER updated
