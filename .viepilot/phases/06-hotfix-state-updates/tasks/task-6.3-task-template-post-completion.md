# Task 6.3: TASK.md Template — Post-Completion Section

## Meta
- **Phase**: 06-hotfix-state-updates
- **Status**: not_started
- **Complexity**: S
- **Dependencies**: Task 6.1
- **Git Tag**: vp-p6-t6.3

## Task Metadata

```yaml
type: "fix"
complexity: "S"
write_scope:
  - "templates/phase/TASK.md"
recovery_budget: "S"
can_parallel_with: []
recovery_overrides:
  L1:
    block: false
  L2:
    block: false
  L3:
    block: false
    reason: ""
```

## Objective

Thêm `## Post-Completion` section vào `templates/phase/TASK.md` để làm rõ các fields mà AI phải điền sau khi task PASS. Section này giúp generated task files có explicit placeholders, giảm khả năng AI skip các state updates vì thiếu "cue" trong file.

Đây là thay đổi template — tất cả task files tạo từ `/vp-evolve` hoặc `/vp-crystallize` sau fix này sẽ tự có section này.

## Pre-execution documentation gate (doc-first; BUG-001)

- [ ] Paths filled với real paths
- [ ] File-Level Plan explains what/why
- [ ] PHASE-STATE.md marks 6.3 `in_progress` before first commit

## Paths

```yaml
files_to_modify:
  - "templates/phase/TASK.md"
```

## File-Level Plan

`templates/phase/TASK.md` — Sau section `## Rollback`, thêm section mới:

```markdown
## Post-Completion

> **AI fills this section after task PASS** — do not leave placeholders.

### Implementation Summary
- (2–5 bullets describing what was actually built/changed and why)

### Files Changed
| File | Action (created/modified/deleted) |
|------|-----------------------------------|
| `{{ACTUAL_FILE_PATH}}` | created |

### Checklist Verification
- [ ] Meta.Status set to `done`
- [ ] All Pre-execution gate boxes ticked `[x]`
- [ ] All Acceptance Criteria boxes ticked `[x]`
- [ ] Files Changed table populated (above)
- [ ] PHASE-STATE.md: task row updated (Status=done, Completed=today, Git Tag=actual)
- [ ] PHASE-STATE.md: execution_state.status updated
- [ ] PHASE-STATE.md: Files Changed table entry added
- [ ] HANDOFF.json: position.task → next task
- [ ] HANDOFF.json: meta.last_written → now
- [ ] TRACKER.md: current task line updated
```

Lý do đặt sau `## Rollback`: Rollback instructions là "phòng khi cần", Post-Completion là "làm sau khi xong" — thứ tự logic: implement → verify → rollback-if-needed → post-completion.

## Context Required

```yaml
files_to_read:
  - "templates/phase/TASK.md"       # current structure
```

## Acceptance Criteria

- [ ] `templates/phase/TASK.md` has `## Post-Completion` section
- [ ] Section contains `### Implementation Summary` with bullet placeholder
- [ ] Section contains `### Files Changed` table with placeholder row
- [ ] Section contains `### Checklist Verification` with 10 checkboxes
- [ ] Checklist covers: Meta.Status, Pre-exec gate, Acceptance Criteria, Files Changed, PHASE-STATE (×3), HANDOFF (×2), TRACKER

## Best Practices to Apply

- [ ] Section placed AFTER `## Rollback` (last section in template)
- [ ] Use `> **AI fills this section after task PASS**` callout for visibility

## Implementation Notes

```
(AI populates during implement)
```

## Verification

```yaml
automated:
  - command: "grep -n 'Post-Completion' templates/phase/TASK.md"
    expected: "1 match"
  - command: "grep -n 'Implementation Summary' templates/phase/TASK.md"
    expected: "1 match"
  - command: "grep -c '\\- \\[ \\]' templates/phase/TASK.md"
    expected: "count includes 10 new Post-Completion checkboxes (total >= 20)"
```

## State Update Checklist

- [ ] PHASE-STATE.md task 6.3 → `done`
- [ ] TRACKER.md updated
- [ ] HANDOFF.json updated

## Files Changed

```
(Auto-populated after completion)
```

## Rollback

```bash
git revert --no-commit $(git rev-list vp-p6-t6.3..vp-p6-t6.3-done)
```
