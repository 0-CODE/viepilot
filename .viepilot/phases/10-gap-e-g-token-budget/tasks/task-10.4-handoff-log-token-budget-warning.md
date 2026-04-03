# Task 10.4: HANDOFF.log — `token_budget_warning` event

## Meta
- **Phase**: 10-gap-e-g-token-budget
- **Status**: done
- **Complexity**: S
- **Dependencies**: Task 10.3
- **Git Tag**: `viepilot-vp-p10-t10.4-done`

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

- [x] Sau khi ước lượng `used_pct`, nếu `used_pct > 70`, workflow mô tả rõ lệnh append `token_budget_warning` kèm `used_pct`
- [x] Event ghi non-blocking (append JSONL, không chặn luồng)
- [x] `grep -n 'token_budget_warning' workflows/autonomous.md` có kết quả

## Verification
```yaml
automated:
  - command: "grep -n 'token_budget_warning' workflows/autonomous.md"
    expected: "at least one match"
  - command: "grep -n 'used_pct' workflows/autonomous.md | head -5"
    expected: "at least one match"
```

## State Update Checklist
- [x] Update PHASE-STATE.md after PASS
- [x] Update TRACKER.md (Next Action + task pointer)
- [x] Update HANDOFF.json
- [x] ROADMAP Progress Summary if task completes (optional — chỉ khi 10.4 là task cuối phase; hiện không)

## Post-Completion

### Implementation Summary

- Thêm bước **1b** trong `Token budget check`: khi `used_pct > 70`, append JSONL `token_budget_warning` với `used_pct`, `severity` warn/critical, `task`, `phase`, optional `sub_task`; không fail nếu append lỗi.
- Cập nhật ví dụ HANDOFF.log trong `autonomous-mode.md` và mục Added trong `CHANGELOG.md`.

### Files Changed

```
M	CHANGELOG.md
M	docs/user/features/autonomous-mode.md
M	workflows/autonomous.md
```

_(Deliverable diff từ tag `viepilot-vp-p10-t10.4`; commit doc-first + task file nằm trước tag start.)_

## Implementation Notes

- Step **1b** đặt sau ước lượng `used_pct` và trước nhánh force pause 90% / menu 70%, để mọi lần vượt 70% đều có audit trail trong log.
- `severity` phân biệt cảnh báo thường (70–90) và critical (>90).
- Task file + PHASE-STATE doc-first commit trước tag `viepilot-vp-p10-t10.4`.
