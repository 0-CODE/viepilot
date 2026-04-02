# Phase {{PHASE_NUMBER}}: {{PHASE_NAME}} — State

## Overview
- **Started**: {{START_DATE}}
- **Status**: not_started | in_progress | complete
- **Progress**: 0/{{TASK_COUNT}} tasks (0%)
- **Current Task**: —

## Execution State

```yaml
execution_state:
  current: "{{CURRENT_TASK_ID}}"        # e.g., task_1_1
  status: not_started                   # not_started | executing | recovering_l1 | recovering_l2 | recovering_l3 | control_point | pass | skip
  available_transitions:
    on_start:     "→ executing"
    on_pass:      "→ update_state → next_task"
    on_fail_l1:   "→ recovering_l1 (max {{L1_MAX}} attempts) → re_verify"
    on_fail_l2:   "→ recovering_l2 (max {{L2_MAX}} attempts) → re_verify"
    on_fail_l3:   "→ recovering_l3 (max 1 attempt) → re_verify"
    on_exhausted: "→ control_point"
  recovery_budget:
    l1_used: 0
    l2_used: 0
    l3_used: 0
```

> Optional — populated by vp-auto during execution. v1 phases without this block gracefully skip.

## Task Status

| # | Task | Status | Started | Completed | Git Tag |
|---|------|--------|---------|-----------|---------|
{{TASK_TABLE}}

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

List **every file individually** — run `git diff vp-p{N}-t{M}..HEAD --name-status` to get actual list. Do NOT use glob patterns.

| File | Action | Task |
|------|--------|------|

## Quality Metrics
- Tests written: 0
- Tests passing: 0
- Code coverage: N/A
- Linting errors: 0

## Notes
