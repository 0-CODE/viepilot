# Phase 22: project-prefixed git checkpoint tags + compatibility (BUG-002)

## Overview
- **Started**: 2026-03-31
- **Status**: complete
- **Progress**: 5/5 tasks (100%)
- **Current Task**: none

## Task Status

| # | Task | Status | Started | Completed | Git Tag |
|---|------|--------|---------|-----------|---------|
| 22.1 | Define deterministic project slug for tag prefix | done | 2026-03-31 | 2026-03-31 | - |
| 22.2 | Update tag creation in autonomous flow | done | 2026-03-31 | 2026-03-31 | - |
| 22.3 | Update checkpoint list/lookup/recovery logic | done | 2026-03-31 | 2026-03-31 | - |
| 22.4 | Add tests for tag naming and compatibility | done | 2026-03-31 | 2026-03-31 | - |
| 22.5 | Update docs and migration notes | done | 2026-03-31 | 2026-03-31 | - |

## Notes
- Doc-first gate satisfied: task plans written in `tasks/22.x.md` before shipping edits.
- `vp-tools tag-prefix` now emits deterministic project prefix (e.g. `viepilot-vp`).
- Checkpoint parsing/listing supports both legacy `vp-p...` and project-scoped `{project}-vp-p...` formats.
