# Phase {{PHASE_NUMBER}}: {{PHASE_NAME}} - Verification

## Overview
- **Verified At**: {{TIMESTAMP}}
- **Status**: passed | partial | failed

## Task Verification

{{#TASKS}}
### Task {{TASK_NUMBER}}: {{TASK_NAME}}
**Status**: {{STATUS}}

#### Automated Checks
| Check | Result | Output |
|-------|--------|--------|
{{AUTOMATED_CHECKS}}

#### Manual Checks
| Check | Result | Verified By |
|-------|--------|-------------|
{{MANUAL_CHECKS}}

{{/TASKS}}

## Quality Gate

| Criteria | Required | Result |
|----------|----------|--------|
| All acceptance criteria met | ✅ | {{RESULT}} |
| Automated tests pass | ✅ | {{RESULT}} |
| No lint errors | ✅ | {{RESULT}} |
| Code review (if required) | ⚪ | {{RESULT}} |

## Summary

| Metric | Count |
|--------|-------|
| Total checks | {{TOTAL}} |
| Passed | {{PASSED}} |
| Failed | {{FAILED}} |
| Skipped | {{SKIPPED}} |

## Issues Found

{{ISSUES}}

## Next Action

{{NEXT_ACTION}}
