# Phase 53 State

## Status: planned

## Tasks
- [ ] 53.1 lib/adapters/ — adapter interface + registry + claude-code + cursor adapters (new files)
- [ ] 53.2 lib/viepilot-install.cjs — refactor buildInstallPlan() to be adapter-driven
- [ ] 53.3 bin/viepilot.cjs + dev-install.sh — load TARGETS from registry; VIEPILOT_ADAPTER env var
- [ ] 53.4 bin/vp-tools.cjs — add `hooks scaffold [--adapter <id>]` subcommand
- [ ] 53.5 Jest contract tests for FEAT-013 adapter system

## Blockers
_None_

## Notes
- Planned: 2026-04-08
- Version target: 2.0.0 (MAJOR — default install target changes from cursor to claude-code;
  adapter architecture replaces hardcoded platform logic)
- Breaking changes:
  - Default install target is now claude-code (~/.claude/) not cursor (~/.cursor/)
  - Cursor users must set VIEPILOT_ADAPTER=cursor OR pass --target cursor-agent
  - bin/viepilot.cjs TARGETS now sourced from adapter registry (same IDs, backward-compat)
- NO regression for Cursor: cursor.cjs adapter preserves all existing paths exactly
- The `installTargets` array API in buildInstallPlan() is preserved for backward compat
  (tests call it); internally resolves to adapter objects
