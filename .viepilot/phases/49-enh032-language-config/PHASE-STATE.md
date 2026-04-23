# Phase 49 State

## Status: complete

## Tasks
- [x] 49.1 New lib/viepilot-config.cjs — schema, read/write, defaults en/en
- [x] 49.2 lib/viepilot-install.cjs — language setup prompts at install end
- [x] 49.3 bin/vp-tools.cjs — config get/set/reset CLI commands
- [x] 49.4 workflows/crystallize.md — inject load_language_config + DOCUMENT_LANG
- [x] 49.5 workflows/brainstorm.md — detect_session_language step
- [x] 49.6 workflows/autonomous.md — load_language_config; banners reference COMMUNICATION_LANG
- [x] 49.7 SKILL.md: vp-crystallize, vp-brainstorm, vp-auto — document ENH-032
- [x] 49.8 Jest contract tests for ENH-032

## Blockers
_None_

## Notes
- Planned: 2026-04-06
- Version target: 1.17.0
- Dependency: Phase 48 (ENH-031 language standardization)
- Config file location: ~/.viepilot/config.json (cross-installer, Cursor + Claude Code)
- Defaults: communication=en, document=en
