# Task 10.3: autonomous.md — Token budget awareness (sub-task check)

## Meta
- **Phase**: 10-gap-e-g-token-budget
- **Status**: done
- **Complexity**: M
- **Dependencies**: Task 10.2
- **Git Tag**: `viepilot-vp-p10-t10.3-done`

## Task Metadata

```yaml
type: "build"
complexity: "M"
write_scope:
  - "workflows/autonomous.md"
recovery_budget: "M"
```

## Objective

Bổ sung vào `workflows/autonomous.md` một **cổng kiểm tra ngữ cảnh/token** ngay **sau mỗi sub-task PASS** (sau bước cập nhật state trong Execute Task): ước lượng `used_pct`; **>70%** → cảnh báo + menu tạm dừng; **>90%** → bắt buộc dừng và ghi `HANDOFF.json`. Hỗ trợ `--fast` để bỏ qua nhánh cảnh báo (không bỏ qua ngưỡng 90%).

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
```

## File-Level Plan

- `workflows/autonomous.md`:
  - Trong **`#### Execute Task`**, ngay sau bullet **step 9** (sau khi liệt kê cập nhật HANDOFF / PHASE-STATE cho sub-task PASS), thêm subsection **`#### Token budget check (sub-task; token_budget)`** với quy trình rõ ràng:
    - Cách tính **`used_pct`** (ưu tiên metric nền tảng; không có thì heuristic bảo thủ + ghi nhãn *estimate*).
    - **`used_pct > 90`**: không tiếp tục sub-task tiếp theo; cập nhật `.viepilot/HANDOFF.json` (`meta.last_written`, `position` khớp sub-task vừa xong / kế tiếp; ghi chú ngắn trong `context.last_decision` hoặc tương đương theo schema v1/v2).
    - **`used_pct > 70` và ≤ 90**: banner cảnh báo + menu số (tiếp tục / pause có sync HANDOFF / dừng autonomous); nếu `{{VP_ARGS}}` có **`--fast`** thì bỏ menu và tiếp tục.
    - Nhắc detect schema HANDOFF (tham chiếu block Schema Detection ngay phía trên trong cùng file).
  - Đảm bảo có chuỗi grep được **`token_budget`** trong phần sub-task (tiêu đề hoặc nội dung).

## Acceptance Criteria

- [x] Sau mỗi sub-task PASS, workflow mô tả rõ bước **`token_budget`** trước bước xử lý FAIL/recovery tiếp theo
- [x] Ngưỡng 70% (warn + lựa chọn) và 90% (bắt buộc dừng + HANDOFF) được nêu rõ
- [x] `--fast` bỏ qua nhánh warn 70–90%, **không** bỏ qua ngưỡng 90%
- [x] `grep -n 'token_budget' workflows/autonomous.md` có kết quả trong ngữ cảnh sub-task

## Verification
```yaml
automated:
  - command: "grep -n 'token_budget' workflows/autonomous.md"
    expected: "at least one match"
  - command: "grep -n 'used_pct' workflows/autonomous.md"
    expected: "at least one match"
```

## State Update Checklist
- [x] Update PHASE-STATE.md after PASS
- [x] Update TRACKER.md (Next Action + task pointer)
- [x] Update HANDOFF.json
- [x] ROADMAP Progress Summary if task completes

## Post-Completion

### Implementation Summary
- Added `#### Token budget check (sub-task; token_budget)` to `workflows/autonomous.md` after Execute Task step 9: `used_pct` estimate, >90% force pause + HANDOFF sync, >70% warn menu, `--fast` skips warn only.

### Files Changed
| File | Action |
|------|--------|
| `workflows/autonomous.md` | modified |
| `.viepilot/phases/10-gap-e-g-token-budget/tasks/task-10.3-autonomous-token-budget.md` | created |

## Implementation Notes

- Subsection placed after step 9 state writes and before sub-task FAIL handling (step 10).
- HANDOFF updates reference v1/v2 schema detection already documented above in the same workflow file.
- Task 10.4 will add `HANDOFF.log` event `token_budget_warning` (out of scope for 10.3).
