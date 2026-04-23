# Phase 9: Generalize vp-audit (ENH-006)

## Overview
- **Started**: 2026-03-30
- **Status**: complete
- **Progress**: 2/2 tasks (100%)
- **Current Task**: -

## Task Status

| # | Task | Status | Started | Completed | Git Tag |
|---|------|--------|---------|-----------|---------|
| 9.1 | workflows/audit.md: rewrite with 3-tier architecture (detect → state → docs → framework) | done | 2026-03-30 | 2026-03-30 | vp-p9-t1-done |
| 9.2 | skills/vp-audit/SKILL.md: rewrite objective, flags, success_criteria for project-agnostic | done | 2026-03-30 | 2026-03-30 | vp-p9-t2-done |

## Files Changed

| File | Action | Task |
|------|--------|------|
| workflows/audit.md | Modified | 9.1 |
| skills/vp-audit/SKILL.md | Modified | 9.2 |
| .viepilot/phases/09-generalize-audit/PHASE-STATE.md | Created | 9.1 |

## Blockers
_None currently_

## Notes
- ENH-006 (critical): vp-audit must work meaningfully on any project, not just viepilot
- Depends on Phase 8 (framework detection pattern established)
