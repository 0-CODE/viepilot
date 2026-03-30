# Task {{TASK_NUMBER}}: {{TASK_NAME}}

## Meta
- **Phase**: {{PHASE_NUMBER}}-{{PHASE_SLUG}}
- **Status**: not_started | in_progress | blocked | done | skipped
- **Complexity**: {{COMPLEXITY}}
- **Dependencies**: {{DEPENDENCIES}}
- **Git Tag**: vp-p{{PHASE_NUMBER}}-t{{TASK_NUMBER}}

## Objective

{{TASK_OBJECTIVE}}

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
  {{ADDITIONAL_CHECKS}}

manual:
  - description: "{{MANUAL_CHECK}}"
    required: {{REQUIRED}}
```

## Files Changed
```
(Auto-populated after completion)
```

## Rollback
```bash
# If need to undo this task:
git revert --no-commit $(git rev-list vp-p{{PHASE_NUMBER}}-t{{TASK_NUMBER}}..vp-p{{PHASE_NUMBER}}-t{{TASK_NUMBER}}-done)
```
