# Task 18.1: ENH-024 — Fork State Updates (run_in_background)

## Meta
- **Phase**: 18-enh-024-fork-state-background
- **Status**: done
- **Complexity**: M
- **Git Tag**: `viepilot-vp-p18-t18.1`

## Task Metadata
```yaml
type: build
complexity: M
write_scope:
  - workflows/autonomous.md
  - CHANGELOG.md
recovery_budget: M
```

## Objective
Document the optional `run_in_background` pattern for state updates after task PASS, with a synchronous fallback if the background confirmation is unavailable or delayed.

## Context Required
```yaml
files_to_read:
  - .viepilot/requests/ENH-024.md
```

## Paths
- `workflows/autonomous.md`
- `CHANGELOG.md`

## File-Level Plan
- `workflows/autonomous.md`: add a concise fork-state-update pattern to the PASS/state-update flow, explain that background updates are optional and depend on host agent support, and require synchronous fallback when confirmation is missing.
- `CHANGELOG.md`: record the optional background state-update pattern under `Unreleased`.

## Acceptance Criteria
- [x] `autonomous.md` documents a fork state update pattern with `run_in_background: true`
- [x] Fallback guard is documented: synchronous state write if the fork is not confirmed
- [x] The pattern is framed as optional host-dependent behavior, not a replacement for explicit state integrity

## Implementation Notes
- Keep the new guidance near existing PASS/state-update logic so it is discoverable from the execution loop.
- Preserve synchronous writes as the source of truth when background execution is not available or confirmation is late.
- Keep edits inside the declared `write_scope`.
- Implemented: `workflows/autonomous.md` now documents an optional `run_in_background` housekeeping fork after PASS and explicitly requires synchronous fallback when confirmation is unavailable. `CHANGELOG.md` records the pattern under `Unreleased`.
- Verification passed locally: grep confirmed the `Fork State Update` block, workflow inspection showed it sits beside PASS/state-update handling, and the diff stayed within scope plus state files.

## Verification
- `rg -n "run_in_background|Fork State Update|background agent|synchronous fallback|10s" workflows/autonomous.md`
  Expected: the optional fork pattern and fallback guard appear in the PASS/state update section.
- `sed -n '520,620p' workflows/autonomous.md`
  Expected: the new block sits adjacent to PASS handling / state update checklist.
- `git diff -- workflows/autonomous.md .viepilot/phases/18-enh-024-fork-state-background/tasks/task-18.1-enh-024-fork-state-background.md .viepilot/phases/18-enh-024-fork-state-background/PHASE-STATE.md`
  Expected: implementation stays within scope plus state files.

## State Update Checklist
- [x] PHASE-STATE / TRACKER / HANDOFF per protocol

## Files Changed
```text
M	.viepilot/HANDOFF.json
M	.viepilot/TRACKER.md
M	.viepilot/phases/18-enh-024-fork-state-background/PHASE-STATE.md
M	.viepilot/phases/18-enh-024-fork-state-background/tasks/task-18.1-enh-024-fork-state-background.md
M	CHANGELOG.md
M	workflows/autonomous.md
```
