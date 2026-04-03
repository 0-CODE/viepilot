# Task 7.3: Version bump 2.0.2 → 2.0.3 + CHANGELOG

## Meta
- **Phase**: 07-working-dir-guard
- **Status**: not_started
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

- [ ] Task contract fields filled
- [ ] Paths listed
- [ ] PHASE-STATE.md marks this task `in_progress` before commits

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
- [ ] `node -p "require('./package.json').version"` → `2.0.3`
- [ ] `grep '\[2.0.3\]' CHANGELOG.md` → match found
- [ ] BUG-007.md Status = done
- [ ] Git tag `viepilot-vp-p7-complete` created

## Best Practices to Apply
- [ ] CHANGELOG follows Keep a Changelog format
- [ ] Git tag created with descriptive message

## Implementation Notes
```
(AI fills during implementation)
```

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
- [ ] Update `.viepilot/phases/07-working-dir-guard/PHASE-STATE.md` → phase complete
- [ ] Update `.viepilot/TRACKER.md` → version 2.0.3, phase 07 complete
- [ ] Update `.viepilot/HANDOFF.json`
- [ ] Update `.viepilot/ROADMAP.md` phase 07 row → ✅ Complete

## Files Changed
```
(Auto-populated after completion)
```

## Rollback
```bash
TAG_PREFIX=$(node bin/vp-tools.cjs tag-prefix --raw)
git revert --no-commit $(git rev-list "${TAG_PREFIX}-p7-t7.3".."${TAG_PREFIX}-p7-t7.3-done")
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
| `.viepilot/requests/BUG-007.md` | modified |

### Checklist Verification
- [ ] `## Meta → Status` set to `done`
- [ ] All `## Acceptance Criteria` boxes ticked `[x]`
- [ ] PHASE-STATE.md phase status = complete
- [ ] ROADMAP.md Phase 07 row → ✅ Complete
- [ ] HANDOFF.json `position.task` → 8.1 (next phase)
- [ ] TRACKER.md version = 2.0.3, phase = 08
