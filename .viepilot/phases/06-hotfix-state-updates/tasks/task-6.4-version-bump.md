# Task 6.4: Version Bump 2.0.1 → 2.0.2 + CHANGELOG

## Meta
- **Phase**: 06-hotfix-state-updates
- **Status**: not_started
- **Complexity**: S
- **Dependencies**: Tasks 6.1, 6.2, 6.3, 6.5 (all must complete first)
- **Git Tag**: vp-p6-t6.4

## Task Metadata

```yaml
type: "docs"
complexity: "S"
write_scope:
  - "package.json"
  - "CHANGELOG.md"
  - ".viepilot/TRACKER.md"
  - ".viepilot/requests/BUG-005.md"
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

Bump version từ `2.0.1` → `2.0.2` (PATCH — bug fix only, no new features). Cập nhật CHANGELOG.md với entry cho 2.0.2. Mark BUG-005 resolved.

## Pre-execution documentation gate (doc-first; BUG-001)

- [ ] Paths filled với real paths
- [ ] PHASE-STATE.md marks 6.4 `in_progress` before first commit

## Paths

```yaml
files_to_modify:
  - "package.json"                          # version: "2.0.1" → "2.0.2"
  - "CHANGELOG.md"                          # add [2.0.2] entry
  - ".viepilot/TRACKER.md"                  # version update
  - ".viepilot/requests/BUG-005.md"        # Status: triaged → done; Resolution filled
  - ".viepilot/requests/BUG-006.md"        # Status: triaged → done; Resolution filled
```

## File-Level Plan

- `package.json`: `"version": "2.0.1"` → `"version": "2.0.2"`
- `CHANGELOG.md`: Thêm entry `[2.0.2] - 2026-04-03` với section `### Fixed` listing BUG-005 + BUG-006 fixes
- `.viepilot/TRACKER.md`: Update version line to `2.0.2`; add BUG-005 to resolution notes
- `.viepilot/requests/BUG-005.md`: `Status: triaged` → `Status: done`; fill `## Resolution` section

## Context Required

```yaml
files_to_read:
  - "package.json"
  - "CHANGELOG.md"
  - ".viepilot/TRACKER.md"
```

## Acceptance Criteria

- [ ] `package.json` version is `2.0.2`
- [ ] `CHANGELOG.md` has `[2.0.2]` entry with BUG-005 fixed items listed
- [ ] `TRACKER.md` version is `2.0.2`
- [ ] `BUG-005.md` Status is `done` and Resolution section filled
- [ ] `BUG-006.md` Status is `done` and Resolution section filled
- [ ] git tag `v2.0.2` created after commit

## Best Practices to Apply

- [ ] CHANGELOG entry format: `[2.0.2] - YYYY-MM-DD` → `### Fixed` section
- [ ] BUG-005 resolution summary concise: what was added and where

## Implementation Notes

```
(AI populates during implement)
```

## Verification

```yaml
automated:
  - command: "node -p \"require('./package.json').version\""
    expected: "2.0.2"
  - command: "grep -n '\\[2\\.0\\.2\\]' CHANGELOG.md"
    expected: "1 match"
  - command: "grep -n 'BUG-005' CHANGELOG.md"
    expected: "1 match"
  - command: "git tag | grep v2.0.2"
    expected: "v2.0.2"
```

## State Update Checklist

- [ ] PHASE-STATE.md task 6.4 → `done`
- [ ] PHASE-STATE.md status → complete
- [ ] TRACKER.md updated
- [ ] HANDOFF.json updated

## Files Changed

```
(Auto-populated after completion)
```

## Rollback

```bash
git revert --no-commit $(git rev-list vp-p6-t6.4..vp-p6-t6.4-done)
```
