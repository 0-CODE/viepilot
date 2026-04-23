# Phase 19: Installer UX + uninstall + symlink reliability (FEAT-005)

## Overview
- **Started**: 2026-03-31
- **Status**: complete
- **Progress**: 5/5 tasks (100%)
- **Current Task**: none

## Task Status

| # | Task | Status | Started | Completed | Git Tag |
|---|------|--------|---------|-----------|---------|
| 19.1 | Build arrow/space interactive selector (multi + radio) | done | 2026-03-31 | 2026-03-31 | - |
| 19.2 | Fix symlink install mode causing missing skill detection | done | 2026-03-31 | 2026-03-31 | - |
| 19.3 | Add `npx viepilot uninstall` command | done | 2026-03-31 | 2026-03-31 | - |
| 19.4 | Add tests for selector + uninstall + regression checks | done | 2026-03-31 | 2026-03-31 | - |
| 19.5 | Update docs for install/uninstall UX and recovery | done | 2026-03-31 | 2026-03-31 | - |

## Files Planned

| File | Action | Task |
|------|--------|------|
| `bin/viepilot.cjs` | Modify | 19.1-19.3 |
| `install.sh`, `dev-install.sh` | Modify | 19.2-19.3 |
| `tests/unit/guided-installer.test.js` | Modify | 19.4 |
| `README.md`, `docs/user/quick-start.md`, `docs/troubleshooting.md` | Modify | 19.5 |
| `.viepilot/TRACKER.md`, `.viepilot/HANDOFF.json`, `.viepilot/ROADMAP.md`, `CHANGELOG.md` | Update | state/planning |

## Blockers
_None currently_

## Notes
- Created via `/vp-evolve --feature` from `FEAT-005`.
- Implemented keyboard selector, uninstall command, and copy-first dev install flow to avoid skill discovery issues from symlinks.
