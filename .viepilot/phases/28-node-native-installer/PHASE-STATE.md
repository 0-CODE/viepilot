# Phase 28: Node-native installer (ENH-017)

## Overview
- **Started**: 2026-04-01
- **Status**: complete
- **Progress**: 5/5 tasks (100%)
- **Current Task**: —

## Task Status

| # | Task | Status | Started | Completed | Notes |
|---|------|--------|---------|-----------|-------|
| 28.1 | Map `install.sh` → Node API; scaffold `lib/viepilot-install.cjs` | done | 2026-04-01 | 2026-04-01 | `lib/viepilot-install.cjs` + Jest |
| 28.2 | Implement install operations (copy/symlink, profiles, home paths) | done | 2026-04-01 | 2026-04-01 | applyInstallPlan + overrideHomedir |
| 28.3 | Wire `bin/viepilot.cjs` `install` / `--dry-run` to lib (no bash spawn) | done | 2026-04-01 | 2026-04-01 | runInstallViaNode |
| 28.4 | `install.sh` wrapper hoặc deprecate + dev/CI story | done | 2026-04-01 | 2026-04-01 | thin bash → node |
| 28.5 | Tests, docs, CHANGELOG, **1.7.0**, ENH-017 done | done | 2026-04-01 | 2026-04-01 | `verify:release` |

## Notes
- Opened via `/vp-evolve` (Add Feature) sau ENH-017 pivot Node-first.
