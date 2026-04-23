# FEAT: Multi-page UI Direction artifacts + auto-sync notes for Crystallize

## Meta
- **ID**: FEAT-007
- **Type**: Feature (brainstorm-derived)
- **Status**: done
- **Priority**: high
- **Created**: 2026-04-01
- **Reporter**: User
- **Assignee**: AI

## Summary
Mở rộng chế độ brainstorm UI (`/vp-brainstorm --ui`) để mỗi **page** trong sản phẩm có **file HTML riêng** (dễ kiểm soát, diff rõ), và có **hook / quy trình bắt buộc** cập nhật lại `notes.md` (hoặc manifest kèm theo) mỗi khi thêm hoặc đổi page — để `/vp-crystallize` luôn biết **có bao nhiêu page**, **chức năng / user goal** từng page, và không bỏ sót khi lên kiến trúc UI.

## Details

### Current behavior (FEAT-002 baseline)
- Một session UI direction thường gom vào:
  - `index.html`, `style.css`, `notes.md` trong `.viepilot/ui-direction/{session-id}/`
- Crystallize đọc chủ yếu `notes.md` + `index.html` + `style.css` làm đầu vào định hướng.

### Desired behavior
1. **Per-page HTML**
   - Khi brainstorm nhiều màn/page khác nhau (vd: landing, dashboard, settings), mỗi page có file HTML riêng, ví dụ:
     - `pages/landing.html`, `pages/dashboard.html`, … **hoặc** quy ước đặt tên rõ ràng trong cùng thư mục session.
   - `index.html` có thể giữ vai trò **hub** (liệt kê link tới các page) hoặc mirror page chính — cần chốt trong spec implementation.
   - `style.css` có thể shared; tránh duplicate lớn (optional: partials strategy documented).

2. **Auto / mandatory hook cập nhật “UI direction notes”**
   - Mỗi lần **tạo page mới** hoặc **đổi scope page** (rename, split, merge):
     - Cập nhật structured block trong `notes.md` (hoặc file companion như `PAGES.md` / `manifest.json` — cần chọn một source of truth cho machine + human).
   - Block tối thiểu nên có cho mỗi page:
     - `id` / slug file
     - **Purpose** (user goal, primary actions)
     - **Key components / sections**
     - **Navigation / entry points** (từ page nào tới page nào)
     - **Open questions** (optional)
   - Workflow brainstorm phải nêu rõ bước “sau khi ghi file HTML page → cập nhật manifest/notes” như một **gate** (tương tự tinh thần doc-first).

3. **Crystallize consumption**
   - `workflows/crystallize.md` + `skills/vp-crystallize/SKILL.md` đọc manifest + danh sách page trước khi map sang stack; architecture UI phải account for **full page list**, không chỉ `index.html`.

### Brainstorm angles (for planning phase)
- Convention cho tên file và thư mục `pages/` vs flat.
- Backward compatibility: session cũ chỉ có `index.html` vẫn valid.
- Validation nhẹ (optional script): liệt kê `.html` trong session và so khớp với manifest.

## Acceptance Criteria
- [x] Quy ước artifact đa page được document trong `docs/user/features/ui-direction.md` và `workflows/brainstorm.md`.
- [x] `skills/vp-brainstorm/SKILL.md` mô tả rõ: khi thêm/sửa page HTML → bắt buộc cập nhật manifest / `notes.md` structured section.
- [x] Có ví dụ cấu trúc thư mục session (hub + `pages/*.html` + shared CSS + notes/manifest).
- [x] `workflows/crystallize.md` + `skills/vp-crystallize/SKILL.md` đọc và sử dụng manifest / danh sách page khi có.
- [x] Script verify `npm run verify:ui-direction` + unit tests.

## Related
- **Phase**: M1.20 / Phase 24 — `.viepilot/phases/24-multi-page-ui-direction-manifest/`
- **Builds on**: FEAT-002 (UI direction mode)
- **Files (expected touch)**: `workflows/brainstorm.md`, `workflows/crystallize.md`, `skills/vp-brainstorm/SKILL.md`, `skills/vp-crystallize/SKILL.md`, `docs/user/features/ui-direction.md`
- **Dependencies**: None blocking

## Discussion
- User muốn kiểm soát tốt hơn khi nhiều page; single `index.html` khó scale.
- Crystallize cần “bản đồ site” tường minh để architecture UI không thiếu màn hình.

## Resolution
Completed in M1.20 / Phase 24 (2026-04-01):
- Documented legacy vs multi-page layout; mandatory `## Pages inventory` in `notes.md` when `pages/*.html` exist.
- Updated `workflows/brainstorm.md`, `skills/vp-brainstorm/SKILL.md` (v0.3.1).
- Updated `workflows/crystallize.md`, `skills/vp-crystallize/SKILL.md` for full page intake.
- Added `scripts/verify-ui-direction-pages.cjs`, tests, `npm run verify:ui-direction`, and `docs/skills-reference.md` notes.
