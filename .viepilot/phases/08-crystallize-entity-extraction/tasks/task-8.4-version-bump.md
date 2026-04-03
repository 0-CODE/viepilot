# Task 8.4: Version bump 2.0.3 → 2.1.0 + CHANGELOG

## Meta
- **Phase**: 08-crystallize-entity-extraction
- **Status**: done
- **Complexity**: S
- **Dependencies**: Tasks 8.1, 8.2, 8.3
- **Git Tag**: `viepilot-vp-p8-t8.4`
  _(resolved at runtime: `TAG_PREFIX=$(node bin/vp-tools.cjs tag-prefix --raw)`)_

## Task Metadata

```yaml
type: "docs"
complexity: "S"
write_scope:
  - "package.json"
  - "CHANGELOG.md"
  - ".viepilot/TRACKER.md"
  - ".viepilot/requests/ENH-022.md"
recovery_budget: "S"
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

Bump version to 2.1.0 (first MINOR release of v2.1 milestone). Add CHANGELOG entry. Mark ENH-022 done. Create phase-complete tag.

## Pre-execution documentation gate (doc-first; BUG-001)

- [x] Task contract fields filled
- [x] Paths listed
- [x] PHASE-STATE.md marks this task `in_progress`

## Paths
```yaml
files_to_modify:
  - "package.json"
  - "CHANGELOG.md"
  - ".viepilot/TRACKER.md"
  - ".viepilot/requests/ENH-022.md"
  - ".viepilot/phases/08-crystallize-entity-extraction/PHASE-STATE.md"
```

## File-Level Plan
- `package.json`: `"version": "2.0.3"` → `"version": "2.1.0"`
- `CHANGELOG.md`: add `[2.1.0] - 2026-04-03` under `[Unreleased]`:
  - Added: ENH-022 — Crystallize domain entity extraction step: explicit entity list + needs_crud_api classification
  - Added: ENH-022 — Crystallize dependency validation step: scan task descriptions for service phase gaps + WARNING output
  - Added: ENH-022 — Entity manifest table written to SPEC.md `## Domain Entity Manifest` section
- `.viepilot/TRACKER.md`: version 2.1.0, phase 08 complete, milestone v2.1 in progress
- `ENH-022.md`: Status → done, add Resolution

## Acceptance Criteria
- [x] `node -p "require('./package.json').version"` → `2.1.0`
- [x] `grep '\[2.1.0\]' CHANGELOG.md` → match found
- [x] ENH-022.md Status = done
- [x] Git tag `viepilot-vp-p8-complete` created

## Verification
```yaml
automated:
  - command: "node -p \"require('./package.json').version\""
    expected: "2.1.0"
  - command: "grep '\\[2.1.0\\]' CHANGELOG.md"
    expected: "match found"
  - command: "git tag | grep 'viepilot-vp-p8-complete'"
    expected: "viepilot-vp-p8-complete"
```

## State Update Checklist
- [x] PHASE-STATE.md → phase complete
- [x] TRACKER.md → version 2.1.0, phase 08 complete
- [x] HANDOFF.json → position.task → 9.1
- [x] ROADMAP.md → Phase 08 row → ✅ Complete

## Files Changed
```
(Auto-populated after completion)
```

## Rollback
```bash
TAG_PREFIX=$(node bin/vp-tools.cjs tag-prefix --raw)
git revert --no-commit $(git rev-list "${TAG_PREFIX}-p8-t8.4".."${TAG_PREFIX}-p8-t8.4-done")
```

## Post-Completion

> **AI fills this section after task PASS**

### Implementation Summary
- `package.json` bumped 2.0.3 → 2.1.0
- `CHANGELOG.md` [2.1.0] entry with 3 ENH-022 sub-bullets (Fix A, Fix C, Entity Manifest Artifact)
- ENH-022.md marked done with resolution note
- TRACKER.md, ROADMAP.md, PHASE-STATE.md, HANDOFF.json all updated to reflect Phase 08 complete + Phase 09 next

### Files Changed
| File | Action |
|------|--------|
| `package.json` | modified |
| `CHANGELOG.md` | modified |
| `.viepilot/TRACKER.md` | modified |
| `.viepilot/ROADMAP.md` | modified |
| `.viepilot/requests/ENH-022.md` | modified |
| `.viepilot/HANDOFF.json` | modified |
| `.viepilot/phases/08-crystallize-entity-extraction/PHASE-STATE.md` | modified |

### Checklist Verification
- [x] `## Meta → Status` set to `done`
- [x] All `## Acceptance Criteria` boxes ticked `[x]`
- [x] PHASE-STATE.md phase status = complete
- [x] ROADMAP.md Phase 08 row → ✅ Complete
- [x] HANDOFF.json `position.task` → 9.1
- [x] TRACKER.md version = 2.1.0
