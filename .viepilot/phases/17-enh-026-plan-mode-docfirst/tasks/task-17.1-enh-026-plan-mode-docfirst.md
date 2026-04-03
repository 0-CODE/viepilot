# Task 17.1: ENH-026 — Plan mode + doc-first gate docs

## Meta
- **Phase**: 17-enh-026-plan-mode-docfirst
- **Status**: done
- **Complexity**: S
- **Git Tag**: `viepilot-vp-p17-t17.1`

## Task Metadata
```yaml
type: docs
complexity: S
write_scope:
  - workflows/autonomous.md
  - docs/user/features/autonomous-mode.md
  - CHANGELOG.md
recovery_budget: S
```

## Objective
Document Plan Mode as an optional structural enforcement layer for the BUG-001 doc-first gate in `autonomous.md`, and add matching user guidance in `docs/user/features/autonomous-mode.md`.

## Context Required
```yaml
files_to_read:
  - .viepilot/requests/ENH-026.md
```

## Paths
- `workflows/autonomous.md`
- `docs/user/features/autonomous-mode.md`
- `CHANGELOG.md`

## File-Level Plan
- `workflows/autonomous.md`: extend the pre-execution documentation gate with explicit Option A / Option B guidance so Plan Mode is recommended but not required.
- `docs/user/features/autonomous-mode.md`: add a "Plan Mode for Task Contract Review" section covering when to use it, how to activate it in Claude Code, and which task contract fields to inspect before switching back to execution mode.
- `CHANGELOG.md`: note the new Plan Mode doc-first guidance under `Unreleased`.

## Acceptance Criteria
- [x] `autonomous.md` documents Plan Mode as a doc-first gate enforcement option
- [x] `autonomous-mode.md` contains a "Plan Mode for Task Contract Review" section
- [x] User docs explain how to activate Plan Mode in Claude Code and what to review

## Implementation Notes
- Keep the workflow change normative and short; do not restate large parts of the existing gate.
- Preserve the existing doc-first gate as a valid fallback for hosts that do not expose Plan Mode.
- Keep edits inside the declared `write_scope`.
- Implemented: `workflows/autonomous.md` now documents Option A / Option B enforcement for the doc-first gate, and `docs/user/features/autonomous-mode.md` now includes a dedicated Plan Mode review section with activation paths and a contract-review checklist. `CHANGELOG.md` records the new guidance under `Unreleased`.
- Verification passed locally: grep confirmed Plan Mode anchors in both files, workflow inspection showed the guidance inside the pre-execution gate, and the diff stayed within scope plus state files.

## Verification
- `rg -n "Plan Mode|Option A|Option B|Task Contract Review|write_scope" workflows/autonomous.md docs/user/features/autonomous-mode.md`
  Expected: both files mention Plan Mode activation and review targets.
- `sed -n '208,250p' workflows/autonomous.md`
  Expected: Plan Mode guidance appears inside the pre-execution documentation gate.
- `git diff -- workflows/autonomous.md docs/user/features/autonomous-mode.md .viepilot/phases/17-enh-026-plan-mode-docfirst/tasks/task-17.1-enh-026-plan-mode-docfirst.md .viepilot/phases/17-enh-026-plan-mode-docfirst/PHASE-STATE.md`
  Expected: implementation stays within task scope plus state files.

## State Update Checklist
- [x] PHASE-STATE / TRACKER / HANDOFF per protocol

## Files Changed
```text
M	.viepilot/HANDOFF.json
M	.viepilot/TRACKER.md
M	.viepilot/phases/17-enh-026-plan-mode-docfirst/PHASE-STATE.md
M	.viepilot/phases/17-enh-026-plan-mode-docfirst/tasks/task-17.1-enh-026-plan-mode-docfirst.md
M	CHANGELOG.md
M	docs/user/features/autonomous-mode.md
M	workflows/autonomous.md
```
