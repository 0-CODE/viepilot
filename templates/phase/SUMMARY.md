# Phase {{PHASE_NUMBER}}: {{PHASE_NAME}} - Summary

## Overview
- **Started**: {{START_DATE}}
- **Completed**: {{END_DATE}}
- **Duration**: {{DURATION}}
- **Status**: Complete ✅

## Completed Tasks

| # | Task | Commits | Notes |
|---|------|---------|-------|
{{COMPLETED_TASKS}}

## Skipped Tasks

| # | Task | Reason |
|---|------|--------|
{{SKIPPED_TASKS}}

## Key Decisions

| Decision | Rationale |
|----------|-----------|
{{DECISIONS}}

## Files Changed

> Populate by running: `git diff vp-p{{PHASE_NUMBER}}-t1..HEAD --name-status | sort`
> List every file individually. Do NOT use glob patterns or summarize groups.

### Created
| File | Task |
|------|------|
{{CREATED_FILES}}

### Modified
| File | Task |
|------|------|
{{MODIFIED_FILES}}

### Deleted
| File | Task |
|------|------|
{{DELETED_FILES}}

## Metrics

| Metric | Value |
|--------|-------|
| Tasks completed | {{COMPLETED_COUNT}} |
| Tasks skipped | {{SKIPPED_COUNT}} |
| Commits | {{COMMIT_COUNT}} |
| Lines added | {{LINES_ADDED}} |
| Lines removed | {{LINES_REMOVED}} |
| Test coverage | {{COVERAGE}} |

## Lessons Learned

{{LESSONS}}

## Notes

{{NOTES}}

---
Git Tag: `vp-p{{PHASE_NUMBER}}-complete`
