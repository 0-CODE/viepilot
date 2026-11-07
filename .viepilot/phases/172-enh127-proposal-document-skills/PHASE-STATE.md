# PHASE-STATE — Phase 172

## Phase
172 — ENH-127: vp-proposal uses Claude Code document skills (pptx, docx, xlsx, pdf) (v3.20.0)

## Status
in_progress

## Tasks
| Task | Status | Notes |
|------|--------|-------|
| 172.1 | done ✅ | proposal-env.cjs: skills via session/disk, deps with hints, checks with skip reasons |
| 172.2 | done ✅ | skills in Steps 6/6b/7, Step 6c Deck QA gate, env check at Initialize, SKILL exception |
| 172.3 | done ✅ | proposal-budget.cjs (spec, openpyxl/read-back scripts, evaluateSpec) + workflow rules |
| 172.4 | done ✅ | proposal-import.cjs (parse/diff/format/apply) + real slide_text.py round trip test |
| 172.5 | in_progress 🔄 | CHANGELOG 3.20.0 + resolve ENH-127 |

## Dependencies
- Phase 171

## Version Target
3.20.0 (MINOR)

## Sources
.viepilot/requests/ENH-127.md

## Todo
- [x] [vp] 172.1 — Environment detection: document skills + dependencies
- [x] [vp] 172.2 — Workflow: pptx/docx skills in generation + Deck QA gate
- [x] [vp] 172.3 — Budget workbooks (xlsx) + pdf use
- [x] [vp] 172.4 — Import hand edits via the document skills
- [~] [vp] 172.5 — Tests + CHANGELOG 3.20.0 + resolve ENH-127
