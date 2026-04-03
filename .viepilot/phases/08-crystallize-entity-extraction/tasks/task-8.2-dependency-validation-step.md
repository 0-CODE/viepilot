# Task 8.2: crystallize.md — Dependency Validation step (Fix C)

## Meta
- **Phase**: 08-crystallize-entity-extraction
- **Status**: not_started
- **Complexity**: M
- **Dependencies**: Task 8.1
- **Git Tag**: `viepilot-vp-p8-t8.2`
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

Add "Dependency Validation" step to `workflows/crystallize.md`, positioned after all phases have been generated. This step must:
1. Scan all generated task descriptions for dependency patterns: "resolve {entity}", "create {entity}", "update {entity}", "manage {entity}", "lookup {entity}", "enrich {entity}"
2. For each match: verify a {EntityName}Service or {entity} management phase exists with a lower phase number
3. If not found → WARNING: "Task X.Y depends on {entity} management but no service phase found"
4. Offer resolution: auto-add stub phase OR user confirms it's intentional (e.g., entity resolved from config)

## Pre-execution documentation gate (doc-first; BUG-001)

- [ ] Task contract fields filled
- [ ] Paths listed
- [ ] File-Level Plan explains insertion point
- [ ] PHASE-STATE.md marks this task `in_progress` before first implementation commit

## Paths
```yaml
files_to_create: []
files_to_modify:
  - "workflows/crystallize.md"
```

## File-Level Plan
- `workflows/crystallize.md`: Add `<step name="dependency_validation">` after phase generation steps (after all task descriptions are written). Step content:
  - Scan pattern list: resolve/create/update/manage/lookup/enrich + entity name
  - Cross-reference: entity name → service phase lookup
  - Output: dependency gap warnings (or "No gaps found")
  - Resolution options: auto-stub or user-confirm intentional

## Context Required
```yaml
files_to_read:
  - "workflows/crystallize.md"        # full file — find post-phase-gen insertion point
  - ".viepilot/requests/ENH-022.md"   # Fix C details
```

## Acceptance Criteria
- [ ] `grep -n 'Dependency Validation' workflows/crystallize.md` → match found
- [ ] Step scans for "resolve/create/manage/lookup {entity}" patterns
- [ ] Step outputs WARNING format when gap detected
- [ ] Step positioned after phase generation
- [ ] Resolution options (stub or intentional confirm) documented in step

## Best Practices to Apply
- [ ] Pattern list is concrete, not open-ended NLP
- [ ] Warning format is actionable (specifies which task + which entity)
- [ ] Step skips gracefully if no domain entities found (Task 8.1 produced empty manifest)

## Do / Don't
### Do
- Use concrete dependency patterns (not semantic analysis)
- Make warning format easy to scan: "⚠ Task X.Y: resolves `tenant` but no TenantService phase found"

### Don't
- Don't auto-add phases without user confirmation
- Don't flag every entity mention — only dependency call patterns (resolve/create/manage/etc)

## Implementation Notes
```
(AI fills during implementation)
```

## Verification
```yaml
automated:
  - command: "grep -n 'Dependency Validation' workflows/crystallize.md"
    expected: "match found after phase generation step"
  - command: "grep -n 'resolve\\|enrich\\|lookup' workflows/crystallize.md"
    expected: "match found in dependency validation scan pattern list"
```

## State Update Checklist
- [ ] Update PHASE-STATE.md after PASS
- [ ] Update TRACKER.md
- [ ] Update HANDOFF.json
- [ ] Update ROADMAP.md if progress changed

## Files Changed
```
(Auto-populated after completion)
```

## Rollback
```bash
TAG_PREFIX=$(node bin/vp-tools.cjs tag-prefix --raw)
git revert --no-commit $(git rev-list "${TAG_PREFIX}-p8-t8.2".."${TAG_PREFIX}-p8-t8.2-done")
```

## Post-Completion

> **AI fills this section after task PASS**

### Implementation Summary
- (Replace with 2-5 bullets)

### Files Changed
| File | Action |
|------|--------|
| `workflows/crystallize.md` | modified |

### Checklist Verification
- [ ] `## Meta → Status` set to `done`
- [ ] All `## Acceptance Criteria` boxes ticked `[x]`
- [ ] PHASE-STATE.md task row updated
- [ ] HANDOFF.json `position.task` → 8.3
- [ ] TRACKER.md updated
