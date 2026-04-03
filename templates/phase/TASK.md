# Task {{TASK_NUMBER}}: {{TASK_NAME}}

## Meta
- **Phase**: {{PHASE_NUMBER}}-{{PHASE_SLUG}}
- **Status**: not_started | in_progress | blocked | done | skipped
- **Complexity**: {{COMPLEXITY}}
- **Dependencies**: {{DEPENDENCIES}}
- **Git Tag**: `${TAG_PREFIX}-p{{PHASE_NUMBER}}-t{{TASK_NUMBER}}`
  _(resolved at runtime: `TAG_PREFIX=$(node bin/vp-tools.cjs tag-prefix --raw)`)_

## Task Metadata

```yaml
type: "{{TASK_TYPE}}"              # build | fix | refactor | test | docs | infra
complexity: "{{COMPLEXITY}}"       # S | M | L | XL (maps to recovery budget)
write_scope:
  - "{{WRITE_SCOPE_PATH_1}}"       # Files/dirs this task may modify
  # - "{{WRITE_SCOPE_PATH_2}}"
recovery_budget: "{{COMPLEXITY}}"  # S: L1x1,L2x1 | M: L1x1,L2x2 | L: L1x2,L2x2,L3x1 | XL: L1x2,L2x3,L3x1
can_parallel_with: []              # Task IDs that can run concurrently (Post-MVP)
recovery_overrides:
  L1:
    block: false                   # true = skip L1 recovery entirely
  L2:
    block: false                   # true = skip L2 recovery entirely
  L3:
    block: false                   # true = never attempt scope reduction for this task
    reason: ""                     # Required when block: true — explain why (compliance, auth, payment, etc.)
```

> Optional — vp-auto populates during crystallize/evolve. Missing fields default to complexity-based budget.

## Objective

{{TASK_OBJECTIVE}}

## Pre-execution documentation gate (doc-first; BUG-001)

**Complete before any implementation commits** (see `workflows/autonomous.md`). Read-only research and editing *this task file* to fill the plan are allowed.

- [ ] Task contract fields below are filled with **real** paths and intent (no literal `{{PLACEHOLDER}}` rows left in Paths / File-Level Plan).
- [ ] `## Paths` lists every file/dir to create or modify for this task.
- [ ] `## File-Level Plan` **or** `## Implementation Notes` explains *what* and *why* per path.
- [ ] `.viepilot/phases/{{PHASE_NUMBER}}-{{PHASE_SLUG}}/PHASE-STATE.md` marks this task `in_progress` before the first implementation commit.

If any box is unchecked when coding starts → **blocked**; finish the plan first.

## Paths
```yaml
files_to_create:
  - {{NEW_FILE_PATH_1}}
files_to_modify:
  - {{MODIFIED_FILE_PATH_1}}
```

## File-Level Plan
- `{{FILE_PATH}}`: {{WHAT_TO_CHANGE_AND_WHY}}
- `{{FILE_PATH_2}}`: {{WHAT_TO_CHANGE_AND_WHY}}

## Context Required
```yaml
files_to_read:
  - .viepilot/ARCHITECTURE.md#{{RELEVANT_SECTION}}
  - .viepilot/SYSTEM-RULES.md#coding_rules
  {{ADDITIONAL_CONTEXT}}
```

## Acceptance Criteria
- [ ] {{CRITERIA_1}}
- [ ] {{CRITERIA_2}}
- [ ] {{CRITERIA_3}}

## Best Practices to Apply
- [ ] {{STACK_SPECIFIC_PRACTICE_1}}
- [ ] {{CODE_QUALITY_PRACTICE_1}}
- [ ] {{TESTING_OR_VERIFICATION_PRACTICE}}

## Do / Don't
### Do
- {{DO_ITEM_1}}
- {{DO_ITEM_2}}

### Don't
- {{DONT_ITEM_1}}
- {{DONT_ITEM_2}}

## Implementation Notes
```
(AI ghi lại notes trong quá trình implement)
- Decisions made:
- Issues encountered:
- Deviations from plan:
```

## Verification
```yaml
automated:
  - command: "{{VERIFY_COMMAND}}"
    expected: "{{EXPECTED_OUTPUT}}"
  - command: "{{VERIFY_COMMAND_2}}"
    expected: "{{EXPECTED_OUTPUT_2}}"
  {{ADDITIONAL_CHECKS}}

manual:
  - description: "{{MANUAL_CHECK}}"
    required: {{REQUIRED}}
```

## State Update Checklist
- [ ] Update `.viepilot/phases/{{PHASE_NUMBER}}-{{PHASE_SLUG}}/PHASE-STATE.md` after each PASS sub-task
- [ ] Update `.viepilot/TRACKER.md` with current task/progress
- [ ] Update `.viepilot/HANDOFF.json` to exact resume point
- [ ] Update `.viepilot/ROADMAP.md` if phase progress/status changed

## Files Changed
```
(Auto-populated after completion)
```

## Rollback
```bash
# If need to undo this task:
TAG_PREFIX=$(node bin/vp-tools.cjs tag-prefix --raw)
git revert --no-commit $(git rev-list "${TAG_PREFIX}-p{{PHASE_NUMBER}}-t{{TASK_NUMBER}}".."${TAG_PREFIX}-p{{PHASE_NUMBER}}-t{{TASK_NUMBER}}-done")
```

## Post-Completion

> **AI fills this section after task PASS** — replace all placeholders below with actual values.

### Implementation Summary
- (Replace with 2–5 bullets describing what was actually built/changed and why)

### Files Changed
| File | Action |
|------|--------|
| `(file path)` | created \| modified \| deleted |

### Checklist Verification
- [ ] `## Meta → Status` set to `done`
- [ ] All `## Pre-execution documentation gate` boxes ticked `[x]`
- [ ] All `## Acceptance Criteria` boxes ticked `[x]`
- [ ] All `## Best Practices to Apply` boxes ticked `[x]`
- [ ] `## Files Changed` table populated (above)
- [ ] PHASE-STATE.md task row: Status=`done`, Completed=today, Git Tag=actual tag
- [ ] PHASE-STATE.md `execution_state.status` updated
- [ ] PHASE-STATE.md Files Changed table: entry added for each file
- [ ] HANDOFF.json `position.task` → next task ID
- [ ] HANDOFF.json `meta.last_written` → now
- [ ] TRACKER.md current task line updated
