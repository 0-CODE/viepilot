# Task 15.1: ENH-023 — handoff-sync + hooks documentation

## Meta
- **Phase**: 15-enh-023-handoff-hooks
- **Status**: done
- **Complexity**: M
- **Git Tag**: `viepilot-vp-p15-t15.1`

## Task Metadata
```yaml
type: build
complexity: M
write_scope:
  - bin/vp-tools.cjs
  - workflows/autonomous.md
  - templates/project/README.md
  - workflows/crystallize.md
  - docs/user/claude-code-setup.md
  - CHANGELOG.md
  - tests/unit/validators.test.js
recovery_budget: M
```

## Objective
`vp-tools handoff-sync --check|--force`; hooks JSON example; autonomous.md optional note per ENH-023.

## Paths
- `bin/vp-tools.cjs`
- `workflows/autonomous.md`
- `templates/project/README.md`
- `workflows/crystallize.md`
- `docs/user/claude-code-setup.md`
- `CHANGELOG.md`
- `tests/unit/validators.test.js`

## File-Level Plan
- `bin/vp-tools.cjs`: add `handoff-sync` subcommand that compares `HANDOFF.json`, `TRACKER.md`, and active `PHASE-STATE.md`, with `--check` for stale detection and `--force` for repair.
- `workflows/autonomous.md`: add a short note in the task state-update flow that hooks are optional reinforcement only, not a substitute for explicit state writes.
- `templates/project/README.md`: document a recommended Claude Code hooks snippet using `handoff-sync --check` and `--force` in generated project guidance.
- `workflows/crystallize.md`: ensure generated project guidance references the hooks recommendation in the project template output path.
- `docs/user/claude-code-setup.md`: add user-facing setup guidance for the hook commands and expected behavior.
- `CHANGELOG.md`: record the new `handoff-sync` safeguard and hooks recommendation under `Unreleased`.
- `tests/unit/validators.test.js`: cover the new `handoff-sync` CLI command behavior and failure mode at subprocess level.

## Implementation Notes
- Keep `handoff-sync` read/repair logic project-local; do not depend on install-path runtime files.
- Prefer reusing existing state parsing helpers in `vp-tools` if present rather than creating a parallel parser path.
- `--check` must exit non-zero on detected drift so hooks can signal stale state.
- `--force` must rewrite the full `HANDOFF.json` payload while preserving schema validity.
- Hooks docs must be framed as opt-in safety rails; `vp-auto` remains responsible for state updates.
- Implemented: `vp-tools handoff-sync` with tracker/phase-state comparison, `--force` repair path, CLI help text, hooks docs in project template + Claude Code setup, workflow notes, changelog entry, and subprocess coverage in `tests/unit/validators.test.js`.
- Verification passed locally: `node --check bin/vp-tools.cjs`, `npx jest tests/unit/validators.test.js --runInBand`, `node bin/vp-tools.cjs handoff-sync --check`, and `node bin/vp-tools.cjs handoff-sync --force`.
- Remaining gate: git persistence is not ready (`clean_worktree=false`), so the task remains `in_progress` pending commit/push before PASS state updates.

## Best Practices
- Follow existing `bin/` shell/Node CLI conventions and preserve backward compatibility for current subcommands.
- Keep workflow/doc wording concise and normative; avoid duplicating large sections already defined elsewhere.
- Restrict edits to the declared `write_scope` unless the task contract is explicitly amended first.

## Context Required
```yaml
files_to_read:
  - .viepilot/requests/ENH-023.md
```

## Acceptance Criteria
- [x] `vp-tools handoff-sync --check` exits non-zero when HANDOFF.json position != PHASE-STATE current task/status.
- [x] `vp-tools handoff-sync --force` updates HANDOFF.json from PHASE-STATE + TRACKER.
- [x] Hooks config example documented in project template/docs for Claude Code usage.
- [x] `autonomous.md` notes hooks integration as optional reinforcement.

## Verification
- `node bin/vp-tools.cjs handoff-sync --check` returns success when state is already in sync.
- Introduce a temporary stale `HANDOFF.json` position, run `node bin/vp-tools.cjs handoff-sync --check`, and confirm it exits non-zero with a drift warning.
- Run `node bin/vp-tools.cjs handoff-sync --force` and confirm `HANDOFF.json` matches `TRACKER.md` + active `PHASE-STATE.md` again.
- Inspect generated or documented hooks examples for `PostToolUse` and `Stop` commands using `handoff-sync`.

## State Update Checklist
- [x] PHASE-STATE / TRACKER / HANDOFF per protocol

## Files Changed
```text
M	.viepilot/HANDOFF.json
M	.viepilot/TRACKER.md
M	.viepilot/phases/15-enh-023-handoff-hooks/PHASE-STATE.md
M	.viepilot/phases/15-enh-023-handoff-hooks/tasks/task-15.1-enh-023-handoff-sync-hooks.md
M	CHANGELOG.md
M	bin/vp-tools.cjs
M	docs/user/claude-code-setup.md
M	templates/project/README.md
M	tests/unit/validators.test.js
M	workflows/autonomous.md
M	workflows/crystallize.md
```
