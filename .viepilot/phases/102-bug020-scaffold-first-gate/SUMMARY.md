# Phase 102 Summary — BUG-020: Scaffold-First Gate

## Result
✅ Complete — v2.37.0

## What Was Done
- Added `#### Scaffold-First Gate (BUG-020)` section to `workflows/autonomous.md` (~55 lines): marker detection table, 10-stack heuristic table, never-handcraft block list, ⛔ stop signal, SUMMARY.md `init_command:` field integration, bypass/waiver prompt
- Created `docs/user/features/scaffold-first.md` — convention documentation with full table + waiver instructions
- Appended `## Scaffold` sections (init_command + marker_file) to 6 installed framework SUMMARY.md files: laravel, nextjs, nextjs-tailwind-shadcn-threejs, nestjs, spring-boot, spring-boot-3.4
- 23 new tests in `tests/unit/phase102-bug020-scaffold-first.test.js`
- CHANGELOG [2.37.0] + version bump 2.36.1 → 2.37.0

## Key Design Decision
Two-layer enforcement: workflow gate (autonomous.md) + stack metadata (SUMMARY.md `## Scaffold`). The gate works without SUMMARY.md changes (via built-in heuristic table) and respects SUMMARY.md overrides when present.

## Test Results
1468 tests, 71 suites — all pass
