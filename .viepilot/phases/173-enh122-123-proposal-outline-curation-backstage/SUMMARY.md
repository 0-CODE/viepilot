# Phase 173 Summary — ENH-122 + ENH-123 (v3.21.0)

## Delivered
- `lib/proposal-outline.cjs`: outline for all 14 type/variant combos (base skeletons of the 4 original types now in code), validation, gate table.
- `lib/proposal-sources.cjs`: path-only inventory (7 kinds; never opens a file), Content Map with enforced decisions, manifest-against-map validation, gaps.
- `lib/proposal-curation.cjs`: `detectProcessLeak` (variant allowances), `detectDevNotes`, `enforceMaterialRule`, `buildBackstage`, `findBackstageLeaks`.
- Persona #31 Backstage Editor as observer (`selectCouncil`), blockers `process-log-instead-of-proposal` and `material-risk-hidden`.
- Workflow: Step 3g Outline, 3h Source Inventory, 3i Content Map (before content), Step 4d Curation Check (before rendering), council with #31; prompt-contract "Proposal, not process"; SKILL 0.6.0.

## Review notes (implemented inline by the orchestrator)
- JavaScript `\W` stripped the Vietnamese capital "Đ" at bullet start, hiding "Đã thêm…" changelog lines — switched to Unicode `[^\p{L}\p{N}]`.
- Research `full` mode used `id >= 26` and would have pulled observer #31 in as a reviewer; observers are now excluded from reviewer selection and quick-mode padding.
- Curation step placed after Step 4c to keep the visual-artifacts step id stable for existing tests.

## Verification
- Full suite 3136 passed + 1 skipped; `lintWorkflowGates` → []; backward-compatible persona selections identical to the pre-169 snapshot; `todo check --phase 173 --phase-complete` → OK.

## Known gaps
- Detectors are deterministic keyword rules; the Backstage Editor (LLM) makes the final call per finding with the user at the gate.
