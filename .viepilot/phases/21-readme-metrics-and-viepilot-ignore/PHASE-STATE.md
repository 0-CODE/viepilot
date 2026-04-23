# Phase 21: README metric realign + `.viepilot` ignore/untrack (ENH-013)

## Overview
- **Started**: 2026-03-31
- **Status**: complete
- **Progress**: 5/5 tasks (100%)
- **Current Task**: none

## Task Status

| # | Task | Status | Started | Completed | Git Tag |
|---|------|--------|---------|-----------|---------|
| 21.1 | Recompute and sync README metrics | done | 2026-03-31 | 2026-03-31 | - |
| 21.2 | Add verify/re-sync guidance | done | 2026-03-31 | 2026-03-31 | - |
| 21.3 | Add repo ignore rule for `.viepilot` | done | 2026-03-31 | 2026-03-31 | - |
| 21.4 | Untrack `.viepilot` from git index safely | done | 2026-03-31 | 2026-03-31 | - |
| 21.5 | Update docs/changelog/tracker state | done | 2026-03-31 | 2026-03-31 | - |

## Files Changed
- `README.md`
- `.gitignore`
- `CHANGELOG.md`
- `.viepilot/*` local state files

## Verification
- `npm run readme:sync` (with `cloc`) ✅
- `git rm -r --cached .viepilot` completed ✅
