# Phase 53 Summary — FEAT-013: Dynamic Adapter System → v2.0.0

**Status**: ✅ Complete  
**Version shipped**: 2.0.0 (MAJOR)  
**Completed**: 2026-04-08

## What was done

### Task 53.1 — lib/adapters/
Created 3 new files:
- `lib/adapters/claude-code.cjs` — Claude Code adapter: `~/.claude/skills`, `~/.claude/viepilot`, pathRewrite, hooks config (`settings.json`), `templates/architect` in installSubdirs
- `lib/adapters/cursor.cjs` — Cursor adapter: `~/.cursor/skills`, `~/.cursor/viepilot`, no pathRewrite, no hooks configFile
- `lib/adapters/index.cjs` — Registry: `getAdapter(id)` (throws on unknown), `listAdapters()` (deduplicated), aliases `cursor-agent` + `cursor-ide` → cursor

### Task 53.2 — lib/viepilot-install.cjs refactor
- Removed hardcoded `cursorSkillsDir`, `viepilotDir = .cursor/viepilot`, `installClaudeSkills` if-branch
- Added adapter import; `buildInstallPlan()` resolves `installTargets` → adapter objects via registry
- Single adapter loop (mkdir → copy skills → copy viepilot files → chmod → path rewrite)
- Backward compat: empty `installTargets` + cursor profile → cursor adapter; else claude-code default
- Legacy path keys (`cursorSkillsDir`, `claudeSkillsDir`, `claudeViepilotDir`) preserved in return
- Default profile changed from `'cursor-ide'` → `'claude-code'`
- Also fixed: `templates/architect` now in all adapter installSubdirs (was missing from Claude Code install)

### Task 53.3 — bin/viepilot.cjs + dev-install.sh
- `viepilot.cjs`: TARGETS built from `adapterMap`; `--yes` without `--target` defaults to `['claude-code']`
- `dev-install.sh`: replaced hardcoded `CURSOR_SKILLS_DIR`/`VIEPILOT_DIR`/`INSTALL_PROFILE` with `VIEPILOT_ADAPTER` env var; case statement handles claude-code (default) / cursor variants; backward compat `VIEPILOT_INSTALL_PROFILE` alias

### Task 53.4 — bin/vp-tools.cjs hooks scaffold
- Added `os` import
- Added `hooks scaffold [--adapter <id>]` command: prints `~/.claude/settings.json` snippet for Claude Code; prints Cursor explanation for no-hook adapters; error on unknown adapter
- Added to help text

### Task 53.5 — Tests
- Created `tests/unit/viepilot-adapters.test.js` (19 tests, 4 groups)
- Updated 7 existing tests in `viepilot-install.test.js` to reflect new defaults and cursor-explicit behavior

## Acceptance criteria
- ✅ `lib/adapters/` exists with 3 files; `getAdapter`/`listAdapters` work
- ✅ `buildInstallPlan([])` installs to `~/.claude/` by default
- ✅ `buildInstallPlan(['cursor-agent'])` → `~/.cursor/` (no regression)
- ✅ `dev-install.sh` `VIEPILOT_ADAPTER=claude-code` default
- ✅ `vp-tools hooks scaffold` prints Claude Code settings.json snippet
- ✅ 558 tests pass (was 539 + 19 new)
- ✅ Adding a new adapter = 1 file in `lib/adapters/` + entry in `index.cjs`
