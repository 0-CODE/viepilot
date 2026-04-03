# Task 8.4: Version bump 2.0.3 → 2.1.0 + CHANGELOG

## Meta
- **Phase**: 08-crystallize-entity-extraction
- **Status**: not_started
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

- [ ] Task contract fields filled
- [ ] Paths listed
- [ ] PHASE-STATE.md marks this task `in_progress`

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
- [ ] `node -p "require('./package.json').version"` → `2.1.0`
- [ ] `grep '\[2.1.0\]' CHANGELOG.md` → match found
- [ ] ENH-022.md Status = done
- [ ] Git tag `viepilot-vp-p8-complete` created

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
- [ ] PHASE-STATE.md → phase complete
- [ ] TRACKER.md → version 2.1.0, phase 08 complete
- [ ] HANDOFF.json → position.task → 9.1
- [ ] ROADMAP.md → Phase 08 row → ✅ Complete

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
- (Replace with 2-5 bullets)

### Files Changed
| File | Action |
|------|--------|
| `package.json` | modified |
| `CHANGELOG.md` | modified |
| `.viepilot/TRACKER.md` | modified |
| `.viepilot/requests/ENH-022.md` | modified |

### Checklist Verification
- [ ] `## Meta → Status` set to `done`
- [ ] All `## Acceptance Criteria` boxes ticked `[x]`
- [ ] PHASE-STATE.md phase status = complete
- [ ] ROADMAP.md Phase 08 row → ✅ Complete
- [ ] HANDOFF.json `position.task` → 9.1
- [ ] TRACKER.md version = 2.1.0
