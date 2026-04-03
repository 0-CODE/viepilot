# Phase 07: Hotfix — Working Directory Guard — State

## Overview
- **Started**: —
- **Status**: not_started
- **Progress**: 0/3 tasks (0%)
- **Current Task**: —

## Execution State

```yaml
execution_state:
  current: "—"
  status: not_started
  available_transitions:
    on_start:     "→ executing"
    on_pass:      "→ update_state → next_task"
    on_fail_l1:   "→ recovering_l1 (max 1 attempts) → re_verify"
    on_fail_l2:   "→ recovering_l2 (max 2 attempts) → re_verify"
    on_fail_l3:   "→ recovering_l3 (max 0 attempts) → control_point"
    on_exhausted: "→ control_point"
  recovery_budget:
    l1_used: 0
    l2_used: 0
    l3_used: 0
```

## Task Status

| # | Task | Status | Started | Completed | Git Tag |
|---|------|--------|---------|-----------|---------|
| 7.1 | autonomous.md — Working Directory Guard block | not_started | — | — | — |
| 7.2 | AI-GUIDE.md template — Install path READ-ONLY note | not_started | — | — | — |
| 7.3 | Version bump 2.0.2 → 2.0.3 + CHANGELOG | not_started | — | — | — |

## Sub-task Tracking

| Sub-task | Description | Status | Attempts |
|----------|-------------|--------|----------|
| — | — | — | — |

## Blockers

_None currently_

## Decisions Made (This Phase)

| Decision | Rationale | Task |
|----------|-----------|------|

## Files Changed

| File | Action | Task |
|------|--------|------|

## Quality Metrics
- Tests written: 0
- Tests passing: 0
- Code coverage: N/A
- Linting errors: 0

## Notes

Phase 07 scaffolded by `/vp-evolve` on 2026-04-03. Fixes BUG-007.
Execution order: 7.1 → 7.2 → 7.3
