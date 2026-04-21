# Phase 95 Spec — `/vp-skills` Slash Command + BUG-016 Fix

## Goal
- **ENH-062**: Tạo `skills/vp-skills/SKILL.md` — agent slash command cho global skill registry management (scan/list/install/uninstall/update/info). Hoạt động từ bất kỳ project nào bằng installed path.
- **BUG-016**: Fix `workflows/autonomous.md` và `workflows/brainstorm.md` — thay `Call loadRegistry()` (không executable) bằng shell command thực thi được.

## Version Target
2.31.0

## Tasks
- 95.1 `skills/vp-skills/SKILL.md` — new skill (scan/list/install/uninstall/update/info)
- 95.2 `bin/vp-tools.cjs` — `get-registry` subcommand (JSON output)
- 95.3 Fix `workflows/autonomous.md` + `workflows/brainstorm.md` — BUG-016
- 95.4 Tests + CHANGELOG + version 2.31.0

## Dependencies
- FEAT-020 ✅ (lib/skill-registry.cjs, lib/skill-installer.cjs)
- BUG-016 (fix in task 95.3)
- ENH-062 (implement in task 95.1)

## Acceptance Criteria
- [ ] `/vp-skills` skill installed via normal `vp-tools install` flow (skills/ directory pickup)
- [ ] `get-registry` CLI subcommand outputs valid JSON
- [ ] workflows use `node ~/.claude/viepilot/bin/vp-tools.cjs get-registry` (not `loadRegistry()`)
- [ ] All tests pass
- [ ] version = "2.31.0"
