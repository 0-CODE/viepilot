# Phase 18: npm publish distribution (FEAT-004)

## Overview
- **Started**: 2026-03-31
- **Status**: in_progress
- **Progress**: 4/5 tasks (80%)
- **Current Task**: 18.4 (blocked on npm 2FA/token policy)

## Task Status

| # | Task | Status | Started | Completed | Git Tag |
|---|------|--------|---------|-----------|---------|
| 18.1 | Harden package metadata for npm publish | done | 2026-03-31 | 2026-03-31 | vp-p18-t1-done |
| 18.2 | Add publish scripts and prepublish checks | done | 2026-03-31 | 2026-03-31 | vp-p18-t2-done |
| 18.3 | Add secure npm release workflow (token-based) | done | 2026-03-31 | 2026-03-31 | vp-p18-t3-done |
| 18.4 | Add post-publish smoke verification flow | blocked | 2026-03-31 | - | vp-p18-t4 |
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
- npm publish now fails with `E404` for `viepilot@1.0.0`: package name unavailable or account lacks permission for unscoped `viepilot`.
- Final post-publish smoke verification (`npm view` + `npx viepilot ...` from registry) cannot complete until publish succeeds.

## Notes
- Created via `/vp-evolve --feature` from `FEAT-004`.
