# Task 10.5: crystallize.md + autonomous.md — Gap G Extended keyword scan

## Meta
- **Phase**: 10-gap-e-g-token-budget
- **Status**: done
- **Complexity**: S
- **Dependencies**: Task 10.4
- **Git Tag**: `viepilot-vp-p10-t10.5-done`

## Task Metadata

```yaml
type: "build"
complexity: "S"
write_scope:
  - "workflows/crystallize.md"
  - "workflows/autonomous.md"
  - "workflows/evolve.md"
  - "docs/user/features/autonomous-mode.md"
  - "CHANGELOG.md"
recovery_budget: "S"
```

## Objective

Mở rộng Gap G: danh sách từ khóa cố định (`password`, `token`, `session`, `encrypt`, `stripe`, `payment`, `bcrypt`, `tls`, `migration`, `schema`) quét **nội dung text** của task. Khi match nhưng `recovery_overrides.L3.block` chưa bật (path-based không kích hoạt): **gợi ý** `L3.block: true` + cảnh báo; **không tự động ghi** từ keyword một mình tại crystallize; tại autonomous → **control point** hoặc ghi nhận rủi ro qua HANDOFF.log.

## Pre-execution documentation gate (doc-first; BUG-001)

- [x] Task contract fields filled
- [x] Paths listed
- [x] File-Level Plan explains what and why
- [x] PHASE-STATE.md marked this task `in_progress` before first implementation commit

## Paths
```yaml
files_to_create: []
files_to_modify:
  - "workflows/crystallize.md"
  - "workflows/autonomous.md"
  - "workflows/evolve.md"
  - "docs/user/features/autonomous-mode.md"
  - "CHANGELOG.md"
```

## File-Level Plan

- `workflows/crystallize.md` — Trong **Step 10 / Gap G**: tách **G1 path-based** (giữ hành vi auto `L3.block` hiện tại) và **G2 Extended keyword scan** trên text mô tả task (ROADMAP description + Objective/AC dự kiến). Nếu có `COMPLIANCE_KEYWORDS_EXTENDED` hit và G1 chưa bật `L3.block`: **không auto-set**; hướng dẫn AI hiển thị cảnh báo + gợi ý YAML; **bắt buộc user chọn** (apply / decline ghi Notes / defer) trước khi ghi Task Metadata.
- `workflows/autonomous.md` — Ngay sau **Compliance Pre-flight (path)**: thêm **Gap G Extended — keyword scan** trên nội dung file task (Objective, Acceptance Criteria, File-Level Plan, Implementation Notes, Paths). Nếu có hit và `L3.block` chưa true: **control point** với options: (1) user sửa task bật L3.block rồi retry, (2) acknowledge — append HANDOFF.log `compliance_keyword_ack` (non-blocking) rồi tiếp tục, (3) stop.
- `workflows/evolve.md` — Cập nhật dòng Gap G trong Task Metadata auto-populate để tham chiếu G2 giống crystallize.
- `docs/user/features/autonomous-mode.md` — Mục ngắn Gap G Extended + ví dụ JSONL `compliance_keyword_ack` nếu có.
- `CHANGELOG.md` — `[Unreleased]` Added: Gap G Extended keyword scan (Phase 10.5); chỉnh **Planned** nếu còn trùng.

## Acceptance Criteria

- [x] `workflows/crystallize.md` chứa `COMPLIANCE_KEYWORDS_EXTENDED` (đủ 10 từ khóa ROADMAP) và quy tắc G2 “suggest + user confirms”, không auto-set chỉ từ keyword khi G1 chưa bật
- [x] `workflows/autonomous.md` chứa block keyword scan + control point + optional `compliance_keyword_ack`
- [x] `grep -n 'COMPLIANCE_KEYWORDS_EXTENDED' workflows/crystallize.md workflows/autonomous.md` có kết quả ở cả hai file
- [x] `grep -n 'Gap G Extended' workflows/autonomous.md` có ít nhất một match

## Verification
```yaml
automated:
  - command: "grep -n 'COMPLIANCE_KEYWORDS_EXTENDED' workflows/crystallize.md workflows/autonomous.md"
    expected: "matches in both files"
  - command: "grep -n 'Gap G Extended' workflows/autonomous.md"
    expected: "at least one match"
  - command: "grep -n 'compliance_keyword_ack' workflows/autonomous.md"
    expected: "at least one match"
```

## State Update Checklist
- [x] Update PHASE-STATE.md after PASS
- [x] Update TRACKER.md (Next Action → 10.6)
- [x] Update HANDOFF.json
- [x] ROADMAP Progress Summary (phase 10 row + overall)

## Post-Completion

### Implementation Summary

- **crystallize Step 10**: Tách **G1** (path-based, auto `L3.block` như cũ) và **G2** `COMPLIANCE_KEYWORDS_EXTENDED` trên text mô tả task — chỉ gợi ý + menu user (apply / decline ghi Notes / defer), không auto-set khi G1 chưa bật.
- **autonomous**: Block **Gap G Extended** sau Compliance Pre-flight path-based; control point với fix+retry / `compliance_keyword_ack` / stop.
- **evolve**: Một dòng tham chiếu G1/G2.
- **Docs + CHANGELOG**: `autonomous-mode.md` + `[Unreleased]` Added.

### Files Changed

```
M	CHANGELOG.md
M	docs/user/features/autonomous-mode.md
M	workflows/autonomous.md
M	workflows/crystallize.md
M	workflows/evolve.md
```

## Implementation Notes

- Git tags: `viepilot-vp-p10-t10.5` → parent của commit implement; `viepilot-vp-p10-t10.5-done` trên `fbe5258`.
- `.viepilot/` gitignored — state chỉ cập nhật local.
