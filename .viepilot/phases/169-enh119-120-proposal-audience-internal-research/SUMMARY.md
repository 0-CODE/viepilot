# Phase 169 Summary — ENH-119 + ENH-120 (v3.17.0)

## Delivered
- Purpose consult: free text first → deterministic hints (`extractAudienceHints`) + gaps (`findIntakeGaps`) → LLM consult (`templates/proposal/purpose-consult-prompt.md`) → AUQ only for missing audience groups.
- `recommendProposalType` → type + variant + reason + 1–2 alternatives; user confirms; `--type`/`--variant` override.
- Variant framework (`TYPE_VARIANTS`, deep-frozen) with `internal-presentation` ×5 and `research-proposal` ×5 (incl. kickoff); stock template fallback to `general`.
- Personas 21–25 (internal) and 26–30 (academic); research rubric R1–R3 + citation blocker; `selectPersonas` variant/profile-aware; original selections byte-identical to a pre-change snapshot.
- Workflow: Step 2b+ Purpose Consult, Step 2c Audience Intake, Step 3 recommend/confirm, variant docs, suggestVoice/suggestDuration defaults, type-aware rubric in Step 8b. SKILL 0.4.0.

## Quality notes (orchestrator review)
- 169.1: variants not deep-frozen → fixed in 169.2 (`deepFreeze`, recursion bug fixed in f9e9e64).
- 169.2: one review-fix commit landed after the task was marked done because a piped test command hid a failure; corrected in f9e9e64 — commands now gate on the test exit code.
- 169.3: executor PASS hid 8 + 6 behaviour defects (e.g. "thuyết minh kickoff" → feature-demo, unaccented Vietnamese, "quỹ" matching "quý", missing primary role from free text). Fixed; 14 free-text probes locked in tests.
- 169.4 / 169.5: executors stopped at the turn limit; orchestrator completed and fixed (base mapping rows, unclosed/duplicate `</step>`, wrong `findIntakeGaps(hints.matched)` usage, `before` vs `beforeAll`).

## Verification
- Full suite: 2708 passed + 1 skipped.
- `todo check --phase 169 --phase-complete` → OK.
- Tests: phase169-t1…t5 + phase169-enh119-120-proposal-audience (e2e, 13 tests).

## Known gaps
- 14/21 workflow steps still lack an AskUserQuestion gate → ENH-124.
- No outline/content-curation gate yet → ENH-122; no disadvantage/backstage scan → ENH-123.
- Free-text understanding is deterministic keyword-based; the LLM consult step is expected to correct it, and the user confirms.
