# FEAT-010 — UI Direction UX walkthrough (`/research-ui`)

## Metadata
- **ID**: FEAT-010
- **Type**: Feature (brainstorm + UI Direction)
- **Status**: done (code landed; ship **1.9.1** when ready)
- **Priority**: high
- **Owner**: product / framework

## Problem
Người dùng `/vp-brainstorm --ui` thường tự chế prompt dài: mô phỏng **end-user** → thu phản hồi → **UX designer** + web research → chỉnh HTML/CSS. Việc này chưa được chuẩn hóa trong workflow; `/research {topic}` hiện chỉ “research nhanh” chung, không ép 3 phase và không ghi **`## UX walkthrough log`** vào `notes.md`.

## Goal
- Slash command **`/research-ui`** (alias **`/research ui`**) trong phiên có UI Direction: chạy **Phase 1 end-user simulation** → **Phase 2 designer + research** → **Phase 3 cập nhật artifacts** (và log trong `notes.md`).
- Tài liệu user + skill + contract test khớp chuỗi bắt buộc.

## Acceptance Criteria
- [x] `workflows/brainstorm.md` định nghĩa đủ 3 phase + hooks multi-page (`Pages inventory`)
- [x] `skills/vp-brainstorm` + `docs/skills-reference.md` liệt kê lệnh
- [x] `docs/user/features/ui-direction.md` hướng dẫn sử dụng
- [x] Jest contract kiểm tra chuỗi then chốt

## Resolution
Đã merge vào `main`: `/research-ui`, `/research ui`, `## UX walkthrough log`, `vp-brainstorm` **0.6.0**, `vp-fe010-ui-walkthrough-contracts.test.js`. **npm** vẫn **1.9.0** cho đến khi cut release **1.9.1**.

## Related
- **Milestone**: M1.28
- **Phase**: 32 — `.viepilot/phases/32-ui-direction-ux-walkthrough-fe010/`
