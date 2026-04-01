# Brainstorm sessions — product horizon (MVP / Post-MVP / Future)

ViePilot brainstorm lưu session tại `docs/brainstorm/session-*.md`. Để **không mất** ý tưởng sau MVP khi chạy `/vp-crystallize`, mỗi session nên có section **`## Product horizon`** (workflow tự gợi ý cấu trúc khi lưu).

## Tag trên từng bullet

| Tag | Ý nghĩa |
|-----|---------|
| `(MVP)` | Ship trong bản đầu tiên |
| `(Post-MVP)` | Đã thống nhất nhưng sau release đầu |
| `(Future)` | Hướng thử nghiệm / chưa cam kết |

## Các subsection khuyến nghị

- **Non-goals for MVP** — Cố tình không làm ở bản đầu (tránh bị hiểu là “quên”).
- **Deferred capabilities** — Tính năng rõ ràng bị lùi khỏi MVP để crystallize map vào roadmap horizon.

## Single-release (không có post-MVP)

Ghi một dòng explicit trong `## Product horizon`, ví dụ: **Single-release product — no separate horizon epics.**

## Tiếp tục session cũ

Khi **Continue** session, giữ và cập nhật `## Product horizon`; không xóa section này trừ khi bạn chủ động đổi scope.

## Project meta intake & global profile (FEAT-009)

Sau khi **chốt scope** (`## Product horizon` có nội dung thật hoặc bạn xác nhận đã lock) và **trước** khi kết thúc phiên (`/end` / `Completed`), nếu repo **chưa** có `.viepilot/META.md` với `viepilot_profile_id`, workflow bắt buộc chạy **Project meta intake**: hỏi **tuần tự** (có proposal), ghi `~/.viepilot/profiles/<slug>.md`, cập nhật `~/.viepilot/profile-map.md`, tạo binding **`.viepilot/META.md`**.

- Đã có profile bound → có thể bỏ qua intake mặc định (chỉ hỏi đổi profile nếu cần).
- Waiver hiếm: ghi `## Meta intake waiver` + lý do trong session.
- Hợp đồng đầy đủ: [Global profiles (dev)](../../dev/global-profiles.md).
- `npx viepilot install` tạo sẵn thư mục `~/.viepilot/profiles/` và file mẫu `profile-map.md` nếu thiếu.

## Bước tiếp

Sau brainstorm: `/vp-crystallize` — horizon trong session được dùng để bổ sung roadmap và project context; **crystallize** đọc `.viepilot/META.md` để pre-fill org/branding từ profile global khi có. Tổng quan end-to-end: [Product horizon](product-horizon.md).
