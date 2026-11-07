# Phase 172 Summary — ENH-127 (v3.20.0)

## Delivered
- `lib/proposal-env.cjs`: document skills (session-listed or local, name-checked) + dependencies with OS hints; `assessEnvironment().checks` gives canRun / "skipped — <reason>" for content, file and visual QA, docx verification, xlsx recalculation, pdf reading.
- Workflow: Initialize assesses the environment (AUQ when missing); Step 6 loads the pptx skill; Step 6b runs the skill's `validate.py` after the animation post-process (fail-loud); new Step 6c Deck QA gate (content / file / visual QA, slide images kept for the Rehearsal Hall); Step 7 loads the docx skill (optional council comments as Word comments); budget workbook + research PDF rules in Step 4.
- `lib/proposal-budget.cjs`: 4 budget cases with live formulas; openpyxl writer + read-back scripts; `evaluateSpec` fallback.
- `lib/proposal-import.cjs`: slide_text.py → manifest diff → apply accepted slides; wired into the Step 1b hand-edit gate.
- SKILL: namespace-guard exception scoped to vp-proposal.

## Notes
- All tasks in this phase were implemented by the orchestrator (no executor dispatch) after repeated executor turn-limit stops on large files in 170–171.
- Budget spec had an off-by-one row in the first draft (formulas pointing one row low) — caught by generating a real workbook before committing.

## Verification
- Full suite 3033 passed + 1 skipped. Real round trip pptxgenjs → pptx skill `slide_text.py` → `parseSlideText` passes; real openpyxl workbook written and formulas checked cell by cell.

## Not verified here
- Visual QA and formula recalculation: LibreOffice (`soffice`) and Poppler (`pdftoppm`) are not installed on this machine; `defusedxml` is missing for `validate.py`. The workflow reports these checks as skipped with install hints.
