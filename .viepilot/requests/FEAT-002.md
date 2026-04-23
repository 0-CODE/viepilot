# FEAT: UI-first brainstorm with live HTML direction + reusable UI component library

## Meta
- **ID**: FEAT-002
- **Type**: Feature
- **Status**: ✅ done
- **Priority**: high (must-have for design-heavy projects)
- **Created**: 2026-03-31
- **Reporter**: User
- **Assignee**: AI

## Summary
Thêm capability UI-first cho ViePilot: trong brainstorm có thể build/preview giao diện mẫu HTML theo trao đổi, cập nhật liên tục theo quyết định mới, và khi crystallize sẽ tham chiếu toàn bộ direction UI đã chốt để re-implement đúng tech stack dự án. Đồng thời bổ sung workflow sưu tầm/phân loại component từ 21st.dev để tái sử dụng trong các lần brainstorm UI/UX sau.

## Details

### Feature 1 — Brainstorm UI/UX với HTML live direction

#### Problem
- Brainstorm thiết kế hiện thiên về text/decision, thiếu artifact giao diện có thể xem trực quan ngay.
- Khi thay đổi direction, khó theo dõi lịch sử thiết kế đã chốt và dễ lệch khi vào crystallize.

#### Desired behavior
1. Trong các phiên brainstorm dự án cần UI/UX, workflow tạo file HTML/CSS/JS preview (hoặc static prototype) để mô tả layout, section, component hierarchy.
2. Mỗi lần user cập nhật yêu cầu, UI direction được cập nhật tương ứng (single source of truth cho visual direction).
3. Khi crystallize, workflow phải đọc và tham chiếu artifact UI direction để tái tạo đúng intent theo tech stack đích (React/Vue/Next/...).
4. Cho phép user gửi component tham khảo trong lúc brainstorm; assistant cập nhật prototype theo nguồn tham chiếu đó.

#### Suggested artifacts
- `.viepilot/ui-direction/{session-id}/`
  - `index.html`
  - `style.css`
  - `notes.md` (decision log cho visual)
  - `assets/` (optional references)
- Optional mirror trong project docs:
  - `docs/ui-direction/{session-id}/`

### Feature 2 — Workflow sưu tầm UI component (21st.dev prompt curation)

#### Problem
- Component tham khảo thường rải rác, khó tái dùng giữa nhiều project/session.

#### Desired behavior
1. Thêm workflow/skill để nhận input component references (prompt/link/snippet từ 21st.dev).
2. Hệ thống phân loại, chuẩn hoá metadata, lưu vào kho global:
   - `~/.viepilot/ui-components/{component}/{variant-or-source}/...`
3. Có bản local trong project để làm stock component:
   - `.viepilot/ui-components/`
4. Khi cài framework (`install.sh` / `dev-install.sh`), cài kèm bộ component cơ bản làm "nguyên liệu thô".
5. Brainstorm/crystallize có thể query thư viện này để đề xuất/ghép component nhanh hơn.

## Acceptance Criteria
- [x] Có flow brainstorm UI mode tạo/duy trì HTML preview artifact theo từng session.
- [x] UI direction được cập nhật khi decision đổi và có decision log đi kèm.
- [x] Crystallize đọc được UI direction và dùng làm input bắt buộc cho implementation plan frontend.
- [x] Có workflow/skill riêng cho curation component từ 21st.dev (ingest + classify + store).
- [x] Có cấu trúc lưu global `~/.viepilot/ui-components/` và local `.viepilot/ui-components/`.
- [x] Install script hỗ trợ bootstrap stock components cơ bản.
- [x] Có docs hướng dẫn quy trình đóng góp/tái sử dụng component library.

## Related
- Phase: **M1.13 / Phase 16** — `.viepilot/phases/16-ui-direction-and-component-library/`
- Route: `/vp-auto --phase 16`
- Affected areas (expected):
  - `workflows/brainstorm.md`
  - `workflows/crystallize.md`
  - `skills/vp-brainstorm/SKILL.md`
  - `skills/vp-crystallize/SKILL.md`
  - `install.sh`, `dev-install.sh`
  - `docs/*` (UI direction + component curation guide)
- Dependencies:
  - May leverage existing stack cache (`~/.viepilot/stacks/`) + add UI component cache alongside.

## Discussion
Đây là feature hướng "design-in-the-loop": user vừa brainstorm vừa tinh chỉnh mẫu giao diện, giúp giảm sai lệch giữa ý tưởng và implementation. Component curation giúp tái sử dụng tri thức UI qua nhiều dự án thay vì lặp lại từ đầu.

## Resolution
- 2026-03-31: Triaged và lập kế hoạch triển khai tại **M1.13 / Phase 16** (`.viepilot/phases/16-ui-direction-and-component-library/`).
- 2026-03-31: Implemented + documented. Delivered in framework release **v0.9.0**.
