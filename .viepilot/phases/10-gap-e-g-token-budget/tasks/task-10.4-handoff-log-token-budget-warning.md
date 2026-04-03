# Task 10.4: HANDOFF.log — `token_budget_warning` event

## Meta
- **Phase**: 10-gap-e-g-token-budget
- **Status**: in_progress
- **Complexity**: S
- **Dependencies**: Task 10.3
- **Git Tag**: _(set on PASS)_

## Task Metadata

```yaml
type: "build"
complexity: "S"
write_scope:
  - "workflows/autonomous.md"
  - "docs/user/features/autonomous-mode.md"
  - "CHANGELOG.md"
recovery_budget: "S"
```

## Objective

Bổ sung hướng dẫn **append-only** vào `.viepilot/HANDOFF.log` khi kiểm tra token budget (sau sub-task PASS) vượt ngưỡng cảnh báo: event **`token_budget_warning`** với trường **`used_pct`** (và metadata tối thiểu đồng bộ với các event JSONL khác). Ghi **non-blocking**; đồng bộ tài liệu user-facing nếu có ví dụ event list.

## Pre-execution documentation gate (doc-first; BUG-001)

- [x] Task contract fields filled
- [x] Paths listed
- [x] File-Level Plan explains what and why
- [x] PHASE-STATE.md marked this task `in_progress` before first implementation commit

## Paths
```yaml
files_to_create: []
files_to_modify:
  - "workflows/autonomous.md"
  - "docs/user/features/autonomous-mode.md"
  - "CHANGELOG.md"
```

## File-Level Plan

- `workflows/autonomous.md` — Trong **`#### Token budget check (sub-task; token_budget)`**, ngay sau bước ước lượng **`used_pct`** (trước nhánh >90 / >70):
  - Nếu **`used_pct > 70`**: append một dòng JSONL vào `.viepilot/HANDOFF.log` (non-blocking) với `event: "token_budget_warning"`, `used_pct` (số), `task`, `phase`, `ts` ISO8601; thêm `severity`: `"critical"` khi `used_pct > 90`, ngược lại `"warn"`. Optional: `sub_task` khi đang trong luồng sub-task (placeholder `{sub_task_id}` thống nhất với Execute Task step 9).
- `docs/user/features/autonomous-mode.md` — Cập nhật ví dụ JSONL trong mục HANDOFF.log để có dòng `token_budget_warning` + `used_pct`.
- `CHANGELOG.md` — Mục `[Unreleased]` → Added: HANDOFF.log `token_budget_warning` (Phase 10).

## Acceptance Criteria

- [ ] Sau khi ước lượng `used_pct`, nếu `used_pct > 70`, workflow mô tả rõ lệnh append `token_budget_warning` kèm `used_pct`
- [ ] Event ghi non-blocking (append JSONL, không chặn luồng)
- [ ] `grep -n 'token_budget_warning' workflows/autonomous.md` có kết quả

## Verification
```yaml
automated:
  - command: "grep -n 'token_budget_warning' workflows/autonomous.md"
    expected: "at least one match"
  - command: "grep -n 'used_pct' workflows/autonomous.md | head -5"
    expected: "at least one match"
```

## State Update Checklist
- [ ] Update PHASE-STATE.md after PASS
- [ ] Update TRACKER.md (Next Action + task pointer)
- [ ] Update HANDOFF.json
- [ ] ROADMAP Progress Summary if task completes (optional — chỉ khi 10.4 là task cuối phase; hiện không)

## Post-Completion

### Implementation Summary
_(fill after PASS)_

### Files Changed
_(git diff tag..HEAD --name-status)_

## Implementation Notes
_(2–5 bullets after PASS)_
