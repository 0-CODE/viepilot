# Task 16.1: ENH-028 — crystallize Review Gate

## Meta
- **Phase**: 16-enh-028-crystallize-review-gate
- **Status**: done
- **Complexity**: L
- **Dependencies**: Phase 14 complete (vp-tools ask)
- **Git Tag**: `viepilot-vp-p16-t16.1`

## Task Metadata
```yaml
type: build
complexity: L
write_scope:
  - workflows/crystallize.md
  - skills/vp-crystallize/SKILL.md
  - CHANGELOG.md
recovery_budget: L
```

## Objective
Add a `review_gate` step to crystallize so extraction results can be reviewed before generation, with `--no-review` and `--extract-only` support, explicit Plan Mode / read-only guidance, and TTY-aware `vp-tools ask` section approvals.

## Context Required
```yaml
files_to_read:
  - .viepilot/requests/ENH-028.md
```

## Paths
- `workflows/crystallize.md`
- `skills/vp-crystallize/SKILL.md`
- `CHANGELOG.md`

## File-Level Plan
- `workflows/crystallize.md`: insert a dedicated `review_gate` step between extraction and generation; define `--no-review` and `--extract-only`; present entity manifest, selected diagrams, and phase skeleton; describe approve/modify/abort flows; prefer `vp-tools ask` in TTY and numbered fallback otherwise.
- `skills/vp-crystallize/SKILL.md`: sync the skill entrypoint with the two-phase extraction/generation flow and the new flags so review behavior is visible before execution.
- `CHANGELOG.md`: record ENH-028 review-gate behavior under `Unreleased` for the next release cut.

## Acceptance Criteria
- [x] `<step name="review_gate">` exists in `workflows/crystallize.md` between extraction and generation
- [x] Review gate presents entity manifest, diagram list, and phase skeleton
- [x] Section-level approve/modify options are documented
- [x] `--no-review` is documented as skipping the gate
- [x] `--extract-only` is documented as stopping after extraction output
- [x] Review gate explicitly frames extraction as Plan Mode / read-only guidance
- [x] `skills/vp-crystallize/SKILL.md` reflects the new flags and review behavior

## Implementation Notes
- Keep later crystallize step numbers stable; add a named step rather than renumbering the workflow.
- Stay within the declared `write_scope`; no other repo files should change for implementation.
- Preserve the ViePilot namespace guard; `vp-tools ask` is a helper, not a skill substitution.
- Implemented: `workflows/crystallize.md` now declares a two-phase extraction/generation flow, adds `Step 6B: Review Gate`, documents `--no-review` and `--extract-only`, and routes section approval through `vp-tools ask` when TTY is available. `skills/vp-crystallize/SKILL.md` now advertises the same flags and review semantics. `CHANGELOG.md` records the new review gate under `Unreleased`.
- Verification passed locally: grep confirmed `review_gate`, both flags, Plan Mode guidance, and `vp-tools ask` references; workflow inspection confirmed the new step sits between Step 6A and Step 7; final diff stayed within the declared implementation scope plus state files.

## Verification
- `rg -n "<step name=\"review_gate\">|--no-review|--extract-only|Plan Mode|vp-tools ask" workflows/crystallize.md skills/vp-crystallize/SKILL.md`
  Expected: review gate markers and both flags appear in the updated docs.
- `sed -n '640,760p' workflows/crystallize.md`
  Expected: extraction output leads into the review gate before ROADMAP generation.
- `git diff -- workflows/crystallize.md skills/vp-crystallize/SKILL.md .viepilot/phases/16-enh-028-crystallize-review-gate/tasks/task-16.1-enh-028-crystallize-review-gate.md .viepilot/phases/16-enh-028-crystallize-review-gate/PHASE-STATE.md`
  Expected: only the task doc, phase state, and declared write-scope files are modified.

## State Update Checklist
- [x] PHASE-STATE / TRACKER / HANDOFF per protocol

## Files Changed
```text
M	.viepilot/HANDOFF.json
M	.viepilot/TRACKER.md
M	.viepilot/phases/16-enh-028-crystallize-review-gate/PHASE-STATE.md
M	.viepilot/phases/16-enh-028-crystallize-review-gate/tasks/task-16.1-enh-028-crystallize-review-gate.md
M	CHANGELOG.md
M	skills/vp-crystallize/SKILL.md
M	workflows/crystallize.md
```
