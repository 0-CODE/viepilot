# Task 6.1: autonomous.md — State Update Checklist Block

## Meta
- **Phase**: 06-hotfix-state-updates
- **Status**: not_started
- **Complexity**: M
- **Dependencies**: Phase 05 complete
- **Git Tag**: vp-p6-t6.1

## Task Metadata

```yaml
type: "fix"
complexity: "M"
write_scope:
  - "workflows/autonomous.md"
recovery_budget: "M"
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

Thêm explicit **State Update Checklist block** vào `workflows/autonomous.md` sau section "Handle Result → PASS". Block này phải liệt kê từng edit cụ thể mà AI phải thực hiện và verify sau mỗi task PASS, covering Gaps G1–G4 và G6 từ BUG-005.

## Pre-execution documentation gate (doc-first; BUG-001)

- [ ] Paths filled với real paths
- [ ] File-Level Plan explains what/why
- [ ] PHASE-STATE.md marks 6.1 `in_progress` before first commit

## Paths

```yaml
files_to_modify:
  - "workflows/autonomous.md"
```

## File-Level Plan

`workflows/autonomous.md` — Trong section **"#### Handle Result"** → sub-section **"PASS:"**, sau dòng `- Move to next task`, thêm block mới:

```markdown
#### State Update Checklist (mandatory — complete ALL before advancing to next task)

**Verify each item was written to disk. If any edit fails → control_point("state update failed: {item}").**

**1. Task file** (`.viepilot/phases/{phase}/tasks/{task}.md`):
- Edit `## Meta → Status`: `not_started` → `done`
- Tick `## Pre-execution documentation gate` boxes: all `[ ]` → `[x]`
- Tick `## Acceptance Criteria` boxes: mark each criterion met as `[x]`
- Tick `## Best Practices to Apply` boxes: all applied → `[x]`
- Tick `## State Update Checklist` boxes (if present): all → `[x]`
- Fill `## Implementation Notes` with 2–5 bullet summary of actual implementation
- Fill `## Files Changed`: run `git diff {start-tag}..HEAD --name-status` → paste result

**2. PHASE-STATE.md** (`.viepilot/phases/{phase}/PHASE-STATE.md`):
- Task row: Status → `done`, Completed → `{today}`, Git Tag → actual tag used
- `execution_state.current` → next task ID (or `"—"` if phase complete)
- `execution_state.status` → `executing` (more tasks) or `pass` (phase complete)
- Files Changed table: append each file from this task (use git diff output)

**3. HANDOFF.json** (`.viepilot/HANDOFF.json`):
- `position.task` → next task ID
- `position.sub_task` → null
- `position.status` → `not_started`
- `recovery.l1_attempts` → 0
- `recovery.l2_attempts` → 0
- `recovery.l3_attempts` → 0
- `meta.last_written` → ISO8601 timestamp now

**4. TRACKER.md**: update current task line to reflect next task

**Gate**: Do not advance to next task until all 4 groups above are verified written.
```

## Context Required

```yaml
files_to_read:
  - "workflows/autonomous.md"          # understand current PASS block structure
  - ".viepilot/requests/BUG-005.md"   # gap details
```

## Acceptance Criteria

- [ ] `autonomous.md` contains the State Update Checklist block after "PASS:" in "Handle Result" section
- [ ] Block explicitly names task file Meta.Status update
- [ ] Block explicitly names checkbox ticking
- [ ] Block explicitly names Files Changed population via `git diff`
- [ ] Block explicitly names PHASE-STATE.md execution_state.status update
- [ ] Block explicitly names all 7 HANDOFF.json fields to update
- [ ] Block includes "Gate: Do not advance" enforcement line
- [ ] Existing PASS block content preserved (git tag creation, TRACKER update, etc.)

## Best Practices to Apply

- [ ] Insert block AFTER existing PASS content (append, don't replace)
- [ ] Use numbered groups (1-4) to make the checklist scannable
- [ ] Each item must be actionable as a single Edit tool call

## Implementation Notes

```
(AI populates during implement)
```

## Verification

```yaml
automated:
  - command: "grep -n 'State Update Checklist' workflows/autonomous.md"
    expected: "line found with the section header"
  - command: "grep -n 'execution_state.status' workflows/autonomous.md"
    expected: "at least 2 lines (existing + new block)"
  - command: "grep -n 'Meta.Status' workflows/autonomous.md"
    expected: "1 line in new block"
  - command: "grep -n 'git diff.*name-status' workflows/autonomous.md"
    expected: "1 line in new block (Files Changed instruction)"
```

## State Update Checklist

- [ ] PHASE-STATE.md task 6.1 → `done`
- [ ] TRACKER.md updated
- [ ] HANDOFF.json updated
- [ ] ROADMAP.md Phase 06 progress updated

## Files Changed

```
(Auto-populated after completion)
```

## Rollback

```bash
git revert --no-commit $(git rev-list vp-p6-t6.1..vp-p6-t6.1-done)
```
