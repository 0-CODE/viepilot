# Phase 12: Verification + Docs + v2.1.0 Final Release

## Goal
Integration tests for all v2.1 features, documentation updates, README sync, and final v2.1.0 release tag.

## Tasks

| # | Task | Complexity | File(s) |
|---|------|------------|---------|
| 12.1 | Integration test: BUG-007 guard triggers correctly | S | test/manual |
| 12.2 | Integration test: ENH-022 entity extraction on sample project | S | test/manual |
| 12.3 | Update docs: autonomous-mode.md, quick-start.md, advanced-usage.md | M | `docs/user/` |
| 12.4 | README.md sync | S | `README.md` |
| 12.5 | Final version confirm + git tag viepilot-vp-v2.1.0 | S | `package.json`, `CHANGELOG.md`, git |

## Execution Order
12.1 → 12.2 → 12.3 → 12.4 → 12.5

## Acceptance Criteria
- [ ] BUG-007 test: attempt install path edit → control point triggered
- [ ] ENH-022 test: crystallize on sample → entity manifest + dependency warning produced
- [ ] README version badge = 2.1.0
- [ ] git tag viepilot-vp-v2.1.0 created

## Dependencies
- All of Phases 7-11 complete

## Notes
Scaffolded by `/vp-evolve` on 2026-04-03.
Final phase of v2.1 milestone.
