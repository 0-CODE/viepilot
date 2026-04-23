# Phase 17: Guided NPX installer (FEAT-003)

## Overview
- **Started**: 2026-03-31
- **Status**: complete
- **Progress**: 5/5 tasks (100%)
- **Current Task**: none

## Task Status

| # | Task | Status | Started | Completed | Git Tag |
|---|------|--------|---------|-----------|---------|
| 17.1 | Add npm bin entrypoint for `npx viepilot` | done | 2026-03-31 | 2026-03-31 | vp-p17-t1-done |
| 17.2 | Build guided install command with target selector | done | 2026-03-31 | 2026-03-31 | vp-p17-t2-done |
| 17.3 | Implement profile handlers for Claude/Cursor modes | done | 2026-03-31 | 2026-03-31 | vp-p17-t3-done |
| 17.4 | Add non-interactive flags + install verification | done | 2026-03-31 | 2026-03-31 | vp-p17-t4-done |
| 17.5 | Update docs for NPX guided onboarding | done | 2026-03-31 | 2026-03-31 | vp-p17-t5-done |

## Files Planned

| File | Action | Task |
|------|--------|------|
| `package.json` | Modify | 17.1 |
| `bin/*` | Add/Modify | 17.1-17.4 |
| `install.sh`, `dev-install.sh` | Modify | 17.3 |
| `README.md`, `docs/user/quick-start.md`, installer docs | Modify | 17.5 |
| `.viepilot/TRACKER.md`, `.viepilot/HANDOFF.json`, `.viepilot/ROADMAP.md`, `CHANGELOG.md` | Update | state/planning |

## Blockers
_None currently_

## Notes
- Created via `/vp-evolve --feature` from `FEAT-003`.
