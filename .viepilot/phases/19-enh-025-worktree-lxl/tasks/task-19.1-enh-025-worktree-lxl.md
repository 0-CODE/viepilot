# Task 19.1: ENH-025 — Worktree isolation for L/XL tasks

## Meta
- **Phase**: 19-enh-025-worktree-lxl
- **Status**: done
- **Complexity**: M
- **Git Tag**: `viepilot-vp-p19-t19.1`

## Task Metadata
```yaml
type: build
complexity: M
write_scope:
  - workflows/autonomous.md
  - templates/phase/TASK.md
  - CHANGELOG.md
recovery_budget: M
```

## Objective
Document the worktree-isolation offer for L/XL tasks in `autonomous.md` and add the `worktree_isolation` field to the TASK template with a default of `auto`.

## Context Required
```yaml
files_to_read:
  - .viepilot/requests/ENH-025.md
```

## Paths
- `workflows/autonomous.md`
- `templates/phase/TASK.md`
- `CHANGELOG.md`

## File-Level Plan
- `workflows/autonomous.md`: add a worktree-isolation decision point for L/XL tasks (or tasks whose metadata forces it), describe the user approval/merge flow, and clarify that failed worktree execution leaves the main branch untouched.
- `templates/phase/TASK.md`: add `worktree_isolation: auto` with documented values `auto | always | never`.
- `CHANGELOG.md`: record the worktree-isolation option under `Unreleased`.

## Acceptance Criteria
- [x] `autonomous.md` offers worktree isolation when task complexity is `L` or `XL`
- [x] `templates/phase/TASK.md` has a `worktree_isolation` field with default `auto`
- [x] Workflow documents diff review before merge when worktree execution completes
- [x] Workflow states that failed worktree execution does not affect the main working tree

## Implementation Notes
- Keep the offer optional by default; only `always` should force it regardless of complexity.
- Place the workflow guidance before implementation begins so the isolation choice happens before edits.
- Keep edits inside the declared `write_scope`.
- Implemented: `workflows/autonomous.md` now offers worktree isolation for `L` / `XL` tasks (and honors `worktree_isolation` overrides), while `templates/phase/TASK.md` now seeds `worktree_isolation: "auto"`. `CHANGELOG.md` records the capability under `Unreleased`.
- Verification passed locally: grep confirmed the worktree offer and template field, workflow inspection placed the decision point before `Execute Task`, and the diff stayed within scope plus state files.

## Verification
- `rg -n "worktree|worktree_isolation|auto \\| always \\| never|diff review|main branch unaffected" workflows/autonomous.md templates/phase/TASK.md`
  Expected: both files document the offer, field, and safety properties.
- `sed -n '276,380p' workflows/autonomous.md`
  Expected: the worktree block appears between task checkpoint / preflight and execute-task steps.
- `git diff -- workflows/autonomous.md templates/phase/TASK.md .viepilot/phases/19-enh-025-worktree-lxl/tasks/task-19.1-enh-025-worktree-lxl.md .viepilot/phases/19-enh-025-worktree-lxl/PHASE-STATE.md`
  Expected: implementation stays within scope plus state files.

## State Update Checklist
- [x] PHASE-STATE / TRACKER / HANDOFF per protocol

## Files Changed
```text
M	.viepilot/HANDOFF.json
M	.viepilot/TRACKER.md
M	.viepilot/phases/19-enh-025-worktree-lxl/PHASE-STATE.md
M	.viepilot/phases/19-enh-025-worktree-lxl/tasks/task-19.1-enh-025-worktree-lxl.md
M	CHANGELOG.md
M	templates/phase/TASK.md
M	workflows/autonomous.md
```
