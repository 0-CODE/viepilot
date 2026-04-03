# Task 11.5: Version bump 2.1.2 → 2.1.3 + CHANGELOG

## Meta
- **Phase**: 11-diagram-profile-system
- **Status**: done
- **Complexity**: S
- **Dependencies**: Tasks 11.1–11.4 (shipping workflow + changelog bullets already in [Unreleased])
- **Git Tag**: `viepilot-vp-p11-t11.5` → **done**: `viepilot-vp-p11-t11.5-done`
  _(resolved at runtime: `TAG_PREFIX=$(node bin/vp-tools.cjs tag-prefix --raw)`)_

## Task Metadata

```yaml
type: "release"
complexity: "S"
write_scope:
  - "package.json"
  - "CHANGELOG.md"
  - ".viepilot/TRACKER.md"
  - ".viepilot/ROADMAP.md"
  - ".viepilot/phases/11-diagram-profile-system/PHASE-STATE.md"
  - ".viepilot/phases/11-diagram-profile-system/SUMMARY.md"
  - ".viepilot/HANDOFF.json"
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

Release **2.1.3**: set `package.json` version, promote Phase 11 **Added** items from `CHANGELOG.md` **[Unreleased]** into a new **`[2.1.3]`** section, close Phase 11 in tracker/roadmap/phase state, write **`SUMMARY.md`** for the phase (file list from `git diff "${TAG_PREFIX}-p11-t11.1"..HEAD`), and create git tags **`${TAG_PREFIX}-p11-t11.5-done`** + **`${TAG_PREFIX}-p11-complete`**.

## Pre-execution documentation gate (doc-first; BUG-001)

- [x] Task contract fields filled
- [x] Paths listed
- [x] File-Level Plan below
- [x] PHASE-STATE.md marks this task `in_progress` before first implementation commit

## Paths
```yaml
files_to_create:
  - ".viepilot/phases/11-diagram-profile-system/SUMMARY.md"
files_to_modify:
  - "package.json"
  - "CHANGELOG.md"
  - ".viepilot/TRACKER.md"
  - ".viepilot/ROADMAP.md"
  - ".viepilot/phases/11-diagram-profile-system/PHASE-STATE.md"
  - ".viepilot/HANDOFF.json"
```

## File-Level Plan

- **`package.json`**: `"version": "2.1.3"`.
- **`CHANGELOG.md`**: Insert `## [2.1.3] - 2026-04-03` with summary line + **### Added** containing the four Phase 11 bullets currently under [Unreleased] (11.1–11.4); remove those bullets from [Unreleased]; keep **### Planned** under [Unreleased] only.
- **`SUMMARY.md`**: From `templates/phase/SUMMARY.md` structure — fill dates, completed task table 11.1–11.5, **Files Changed** from `git diff viepilot-vp-p11-t11.1..HEAD --name-status | sort` (every path, no globs); metrics approximated from `git log` / `shortstat` if needed.
- **`ROADMAP.md`**: Phase 11 header + Progress Summary row → ✅ Complete, 5/5, 100%; bump **Overall** task count (27/40, 67.5%).
- **`PHASE-STATE.md`**: All tasks done; overview **complete**; `execution_state` → `pass`, `current: "—"`; append `CHANGELOG` / `package.json` / `SUMMARY` to Files Changed table.
- **`TRACKER.md`**: Version 2.1.3; Phase 11 complete; next Phase 12 + task 12.1; milestone progress 27/40.
- **`HANDOFF.json`**: `position.phase` `12`, `task` `12.1`, reset recovery counters, update `last_decision` + `last_written`.

## Context Required
```yaml
files_to_read:
  - "CHANGELOG.md"
  - "templates/phase/SUMMARY.md"
  - ".viepilot/ROADMAP.md"
```

## Acceptance Criteria
- [x] `node -p "require('./package.json').version"` → `2.1.3`
- [x] `CHANGELOG.md` contains `## [2.1.3]` with Phase 11 features; [Unreleased] no longer lists those Added bullets
- [x] `PHASE-STATE.md` shows Phase 11 complete; `HANDOFF` points to 12.1
- [x] Git tags: `viepilot-vp-p11-t11.5`, `viepilot-vp-p11-t11.5-done`, `viepilot-vp-p11-complete`

## Best Practices to Apply
- [x] Keep a Changelog format + SemVer PATCH for cumulative Phase 11 feature drop
- [x] English release notes; match prior 2.1.x changelog tone

## Verification
```yaml
automated:
  - command: "node -p \"require('./package.json').version\""
    expected: "2.1.3"
  - command: "grep -n '\\[2.1.3\\]' CHANGELOG.md"
    expected: "match"
  - command: "npm test"
    expected: "pass"
```

## State Update Checklist
- [x] Task file Meta → done + checklists
- [x] `git push` + `git push --tags` + `git-persistence --strict`

## Implementation Notes

- Released **2.1.3**; moved Phase 11 **Added** bullets from [Unreleased] to `[2.1.3]`.
- Wrote `SUMMARY.md` (stale-diagram pass N/A for this repo phase); `ROADMAP` Progress Summary + Phase 11 header; `HANDOFF` → Phase **12.1**.

## Files Changed

```
M	.viepilot/HANDOFF.json
M	.viepilot/ROADMAP.md
M	.viepilot/TRACKER.md
M	.viepilot/phases/11-diagram-profile-system/PHASE-STATE.md
A	.viepilot/phases/11-diagram-profile-system/SUMMARY.md
A	.viepilot/phases/11-diagram-profile-system/tasks/task-11.5-version-bump-changelog.md
M	CHANGELOG.md
M	package.json
```
