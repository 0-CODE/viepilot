# Phase 54 State

## Status: complete

## Tasks
- [x] 54.1 lib/hooks/brainstorm-staleness.cjs — Stop event hook: read stdin, detect stale items, patch HTML
- [x] 54.2 bin/vp-tools.cjs — add `hooks install [--adapter <id>]` subcommand
- [x] 54.3 docs/user/features/hooks.md + workflows/brainstorm.md — hook user docs
- [x] 54.4 tests/unit/brainstorm-staleness-hook.test.js — contract tests

## Blockers
_None_

## Notes
- Planned: 2026-04-08
- Version target: 2.1.0 (MINOR — first ViePilot hook ships)
- Depends on: FEAT-013 (Phase 53 ✅) — adapter system provides hooks.configFile path
- Hook is Option A (flag-only): writes data-arch-stale attrs; no auto-HTML rewrite
- Non-blocking: exit 0 always; errors logged, never thrown
- Claude Code Stop event fires after each AI response turn
