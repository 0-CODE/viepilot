# Task 7.3: Version bump 2.0.2 → 2.0.3 + CHANGELOG

## Meta
- **Phase**: 07-working-dir-guard
- **Status**: done
- **Complexity**: S
- **Dependencies**: Tasks 7.1, 7.2
- **Git Tag**: `viepilot-vp-p7-t7.3`
  _(resolved at runtime: `TAG_PREFIX=$(node bin/vp-tools.cjs tag-prefix --raw)`)_

## Task Metadata

```yaml
type: "docs"
complexity: "S"
write_scope:
  - "package.json"
  - "CHANGELOG.md"
  - ".viepilot/TRACKER.md"
  - ".viepilot/requests/BUG-007.md"
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

Bump package.json version from 2.0.2 → 2.0.3. Add [2.0.3] CHANGELOG entry documenting BUG-007 fix. Mark BUG-007 request as done. Create phase-complete git tag.

## Pre-execution documentation gate (doc-first; BUG-001)

- [x] Task contract fields filled
- [x] Paths listed
- [x] PHASE-STATE.md marks this task `in_progress` before commits

## Paths
```yaml
files_to_create: []
files_to_modify:
  - "package.json"
  - "CHANGELOG.md"
  - ".viepilot/TRACKER.md"
  - ".viepilot/requests/BUG-007.md"
  - ".viepilot/phases/07-working-dir-guard/PHASE-STATE.md"
```

## File-Level Plan
- `package.json`: change `"version": "2.0.2"` → `"version": "2.0.3"`
- `CHANGELOG.md`: add `[2.0.3] - 2026-04-03` section under `[Unreleased]`:
  - Fixed: BUG-007 — vp-auto Working Directory Guard; autonomous.md prevents editing install paths; AI-GUIDE.md template install path READ-ONLY note
- `.viepilot/TRACKER.md`: update version to 2.0.3, phase to 07 complete, last update date
- `.viepilot/requests/BUG-007.md`: update Status → done, add Resolution section
- PHASE-STATE.md: mark phase complete, all tasks done

## Context Required
```yaml
files_to_read:
  - "package.json"
  - "CHANGELOG.md"
  - ".viepilot/TRACKER.md"
```

## Acceptance Criteria
- [x] `node -p "require('./package.json').version"` → `2.0.3`
- [x] `grep '\[2.0.3\]' CHANGELOG.md` → match found
- [x] BUG-007.md Status = done
- [x] Git tag `viepilot-vp-p7-complete` created

## Best Practices to Apply
- [x] CHANGELOG follows Keep a Changelog format
- [x] Git tag created with descriptive message

## Implementation Notes
- Bumped package.json 2.0.2 → 2.0.3
- Added CHANGELOG [2.0.3] entry with BUG-007 fix description
- Marked BUG-007 request as done with resolution details
- Updated TRACKER.md version and BUG-007 backlog status

## Verification
```yaml
automated:
  - command: "node -p \"require('./package.json').version\""
    expected: "2.0.3"
  - command: "grep '\\[2.0.3\\]' CHANGELOG.md"
    expected: "match found"
  - command: "git tag | grep 'viepilot-vp-p7-complete'"
    expected: "viepilot-vp-p7-complete"
```

## State Update Checklist
- [x] Update `.viepilot/phases/07-working-dir-guard/PHASE-STATE.md` → phase complete
- [x] Update `.viepilot/TRACKER.md` → version 2.0.3, phase 07 complete
- [x] Update `.viepilot/HANDOFF.json`
- [x] Update `.viepilot/ROADMAP.md` phase 07 row → ✅ Complete

## Files Changed
```
M	package.json
M	CHANGELOG.md
M	.viepilot/TRACKER.md
M	.viepilot/requests/BUG-007.md
```

## Rollback
```bash
TAG_PREFIX=$(node bin/vp-tools.cjs tag-prefix --raw)
git revert --no-commit $(git rev-list "${TAG_PREFIX}-p7-t7.3".."${TAG_PREFIX}-p7-t7.3-done")
```

## Post-Completion

> **AI fills this section after task PASS**

### Implementation Summary
- Bumped package.json version 2.0.2 → 2.0.3
- Added CHANGELOG [2.0.3] with BUG-007 Working Directory Guard fix description
- Marked BUG-007 request done with Fix A + Fix B resolution details
- Updated TRACKER.md version and backlog status

### Files Changed
| File | Action |
|------|--------|
| `package.json` | modified |
| `CHANGELOG.md` | modified |
| `.viepilot/TRACKER.md` | modified |
| `.viepilot/requests/BUG-007.md` | modified |

### Checklist Verification
- [x] `## Meta → Status` set to `done`
- [x] All `## Acceptance Criteria` boxes ticked `[x]`
- [x] PHASE-STATE.md phase status = complete
- [x] ROADMAP.md Phase 07 row → ✅ Complete
- [x] HANDOFF.json `position.task` → 8.1 (next phase)
- [x] TRACKER.md version = 2.0.3, phase = 08
