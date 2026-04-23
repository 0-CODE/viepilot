# Phase 35 — SPEC

**Milestone:** M1.29  
**Phase slug:** `35-crystallize-architecture-files-en022`  
**Request:** [ENH-022](../../requests/ENH-022.md)

## Goal
Bổ sung hợp đồng **crystallize** để diagram kiến trúc (matrix ENH-018) được **lưu file** tại `.viepilot/architecture/<diagram>.mermaid`, đồng bộ với `ARCHITECTURE.md`, skill **vp-crystallize**, và kiểm tra **vp-audit** / Jest.

## Scope
- `workflows/crystallize.md` Step 4: naming, khi tạo/không tạo file, chính sách đồng bộ với markdown.
- `templates/project/ARCHITECTURE.md`: tham chiếu đường dẫn tới `.viepilot/architecture/*.mermaid`.
- `skills/vp-crystallize/SKILL.md`: mô tả artifact mới.
- `skills/vp-audit/SKILL.md` + test contract tối thiểu.

## Out of scope
- Trình render Mermaid trong CI hay CLI mới (chỉ file nguồn + docs).
- Thay đổi runtime `vp-tools` / installer trừ khi task sau này yêu cầu.

## Architecture fit
Thuộc **documentation / workflow contract** cho bootstrap dự án — không thêm service runtime.

## Success
- Tasks **35.1–35.4** done trong `PHASE-STATE.md`.
- ENH-022 **Status** → `in_progress` trong lúc `/vp-auto`, `done` khi ship.

## Target release
**1.9.5** (MINOR) sau khi phase complete và release checklist.
