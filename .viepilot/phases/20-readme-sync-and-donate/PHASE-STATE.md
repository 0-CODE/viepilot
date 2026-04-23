# Phase 20: README auto-sync + donate section (FEAT-006)

## Overview
- **Started**: 2026-03-31
- **Status**: complete
- **Progress**: 5/5 tasks (100%)
- **Current Task**: none

## Task Status

| # | Task | Status | Started | Completed | Git Tag |
|---|------|--------|---------|-----------|---------|
| 20.1 | Design README LOC auto-sync flow with `cloc` | done | 2026-03-31 | 2026-03-31 | - |
| 20.2 | Implement workflow hook for README metric updates | done | 2026-03-31 | 2026-03-31 | - |
| 20.3 | Add fallback/guard when `cloc` is missing | done | 2026-03-31 | 2026-03-31 | - |
| 20.4 | Add donate section (PayPal + MOMO) to README/docs | done | 2026-03-31 | 2026-03-31 | - |
| 20.5 | Add tests/verification and docs updates | done | 2026-03-31 | 2026-03-31 | - |

## Files Planned

| File | Action | Task |
|------|--------|------|
| `workflows/autonomous.md` | Modify | 20.1-20.3 |
| `skills/vp-auto/SKILL.md` | Modify | 20.1-20.3 |
| `README.md` | Modify | 20.2, 20.4 |
| `docs/*` | Modify | 20.5 |
| `.viepilot/TRACKER.md`, `.viepilot/HANDOFF.json`, `.viepilot/ROADMAP.md`, `CHANGELOG.md` | Update | state/planning |

## Blockers
_None currently_

## Notes
- Added `scripts/sync-readme-metrics.cjs` and `npm run readme:sync` for README Total LOC sync.
- Installer now checks `cloc` and provides guidance/optional best-effort install flow.
- README now includes a donation section (PayPal + MOMO).
