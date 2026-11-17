# PHASE-STATE — Phase 181

## Phase
181 — BUG-039: skills load their workflow deterministically (v3.25.0)

## Status
done ✅

## Tasks
| Task | Status | Notes |
|------|--------|-------|
| 181.1 | done ✅ | renderer + install step; 3290 tests |
| 181.2 | done ✅ | inline hard gates + banner version; 3296 tests |
| 181.3 | done ✅ | template ## Tasks + legacy parser; 3300 tests |
| 181.4 | done ✅ | stack-cache write + crystallize 1B/1C; 3328 tests; commit by orchestrator (executor commit blocked) |
| 181.5 | done ✅ | executor budget + split + 3.25.0; reinstall verified |

## Dependencies
- Phase 180 ✅

## Version Target
3.25.0 (MINOR)

## Completed
2026-11-18

## Git
- Release commit: adec459
- Tag: vp-p181-complete
- Full suite: 3346 passed (2 skipped)

## Sources
.viepilot/requests/BUG-039.md

## Todo
- [x] [vp] 181.1 — Installer: ship each skill's workflow inside the skill + explicit Read step (fix A)
- [x] [vp] 181.2 — Hard gates inline in SKILL.md (fix C) + banner fw version
- [x] [vp] 181.3 — R1: PHASE-STATE template vs todo-mirror parser
- [x] [vp] 181.4 — R2: crystallize research subagents return text; orchestrator persists the stack cache
- [x] [vp] 181.5 — R3: executor turn budget, split rule, report-before-budget; release 3.25.0
