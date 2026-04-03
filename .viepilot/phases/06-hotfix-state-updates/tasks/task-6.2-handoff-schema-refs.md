# Task 6.2: autonomous.md — Fix HANDOFF.json Schema References

## Meta
- **Phase**: 06-hotfix-state-updates
- **Status**: not_started
- **Complexity**: S
- **Dependencies**: Task 6.1
- **Git Tag**: vp-p6-t6.2

## Task Metadata

```yaml
type: "fix"
complexity: "S"
write_scope:
  - "workflows/autonomous.md"
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

Fix các chỗ trong `autonomous.md` đang reference HANDOFF.json fields không tồn tại hoặc sai schema (Gap G5 từ BUG-005). HANDOFF.json template v2 dùng nested schema (`position.*`, `recovery.*`, `control_point.*`, `meta.*`), nhưng một số update blocks trong autonomous.md vẫn dùng flat-style fields hoặc mix schemas.

## Pre-execution documentation gate (doc-first; BUG-001)

- [ ] Paths filled với real paths
- [ ] File-Level Plan explains what/why
- [ ] PHASE-STATE.md marks 6.2 `in_progress` before first commit

## Paths

```yaml
files_to_modify:
  - "workflows/autonomous.md"
```

## File-Level Plan

`workflows/autonomous.md` — Tìm và sửa tất cả HANDOFF.json update blocks:

1. **In "PASS" block** — Tìm HANDOFF.json update block:
   ```json
   position.task = "{next_task}"
   position.sub_task = null
   position.status = "not_started"
   recovery.l1_attempts = 0
   ...
   meta.last_written = "<ISO8601>"
   ```
   → Verify fields match v2 template (`version`, `position.phase`, `position.task`, `position.sub_task`, `position.status`, `recovery.l1_attempts`, `recovery.l2_attempts`, `recovery.l3_attempts`, `meta.last_written`)
   → Add note: if project uses v1 flat HANDOFF.json, update fields `task`, `status`, `lastUpdated` equivalently

2. **In "FAIL / control_point" block** — Tìm:
   ```json
   control_point.active = true
   control_point.reason = "..."
   control_point.ts = "..."
   recovery.recent_blocker = true
   ```
   → Verify these match v2 template schema
   → Add note: `recovery.recent_blocker` maps to v1 `blockers: [...]` array

3. **In sub-task update block (item 9)** — Verify:
   - `position.sub_task = "{sub_task_id}"` ← v2 field
   - `meta.last_written = "<ISO8601>"` ← v2 field
   → Ensure consistent with v2

4. **Add schema detection note** at top of "Execute Task" section:
   ```
   > **Schema note**: HANDOFF.json may be v1 (flat: `task`, `status`, `lastUpdated`) or v2 (nested: `position.*`, `recovery.*`, `meta.*`). 
   > Check `version` field: if absent or 1 → v1; if 2 → v2. Update the correct fields for whichever schema is present.
   > New projects always use v2 (from template). Existing v1 projects should be migrated via `DEBT` request before running vp-auto.
   ```

## Context Required

```yaml
files_to_read:
  - "workflows/autonomous.md"              # find existing HANDOFF.json update blocks
  - "templates/project/HANDOFF.json"       # canonical v2 schema
  - ".viepilot/requests/BUG-005.md"       # G5 gap details
```

## Acceptance Criteria

- [ ] All HANDOFF.json update blocks in `autonomous.md` use v2 nested field paths
- [ ] Schema detection note added before first HANDOFF.json write instruction
- [ ] `recovery.recent_blocker` field usage is consistent across PASS and control_point blocks
- [ ] No flat-schema references (`lastUpdated`, `context_notes`, `next_action`) remain in update blocks

## Best Practices to Apply

- [ ] Read autonomous.md fully before editing — don't patch blindly
- [ ] Grep for all HANDOFF.json write instructions before making changes

## Implementation Notes

```
(AI populates during implement)
```

## Verification

```yaml
automated:
  - command: "grep -n 'lastUpdated\\|context_notes\\|next_action' workflows/autonomous.md"
    expected: "0 matches (no v1 flat fields in update blocks)"
  - command: "grep -n 'position\\.task\\|meta\\.last_written' workflows/autonomous.md"
    expected: "matches found (v2 fields present)"
  - command: "grep -n 'Schema note' workflows/autonomous.md"
    expected: "1 match (detection note added)"
```

## State Update Checklist

- [ ] PHASE-STATE.md task 6.2 → `done`
- [ ] TRACKER.md updated
- [ ] HANDOFF.json updated

## Files Changed

```
(Auto-populated after completion)
```

## Rollback

```bash
git revert --no-commit $(git rev-list vp-p6-t6.2..vp-p6-t6.2-done)
```
