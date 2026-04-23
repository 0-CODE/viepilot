# Phase 18: npm publish distribution (FEAT-004)

## Overview
- **Started**: 2026-03-31
- **Status**: complete
- **Progress**: 5/5 tasks (100%)
- **Current Task**: none

## Task Status

| # | Task | Status | Started | Completed | Git Tag |
|---|------|--------|---------|-----------|---------|
| 18.1 | Harden package metadata for npm publish | done | 2026-03-31 | 2026-03-31 | vp-p18-t1-done |
| 18.2 | Add publish scripts and prepublish checks | done | 2026-03-31 | 2026-03-31 | vp-p18-t2-done |
| 18.3 | Add secure npm release workflow (token-based) | done | 2026-03-31 | 2026-03-31 | vp-p18-t3-done |
| 18.4 | Add post-publish smoke verification flow | done | 2026-03-31 | 2026-03-31 | vp-p18-t4-done |
| 18.5 | Document npm release + rollback guide | done | 2026-03-31 | 2026-03-31 | vp-p18-t5-done |

## Files Planned

| File | Action | Task |
|------|--------|------|
| `package.json` | Modify | 18.1-18.2 |
| `.npmignore` / `files` config | Add/Modify | 18.1 |
| `.github/workflows/*` | Add/Modify | 18.3 |
| `scripts/` (optional release helpers) | Add/Modify | 18.2-18.4 |
| `docs/dev/deployment.md` (or release guide) | Modify | 18.5 |
| `.viepilot/TRACKER.md`, `.viepilot/HANDOFF.json`, `.viepilot/ROADMAP.md`, `CHANGELOG.md` | Update | state/planning |

## Blockers
_None currently_

## Notes
- Created via `/vp-evolve --feature` from `FEAT-004`.
- 2026-03-31: Published `viepilot@1.0.1` successfully after patch version bump.
