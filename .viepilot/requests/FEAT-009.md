# FEAT: Project meta intake sau brainstorm (global profiles + profile-map)

## Meta
- **ID**: FEAT-009
- **Type**: Feature
- **Status**: done
- **Priority**: high
- **Created**: 2026-04-01
- **Reporter**: User
- **Assignee**: AI

## Summary
Sau khi brainstorm khởi tạo lần đầu đã **chốt scope** và **trước khi kết thúc** phiên, bắt buộc có một **phase riêng**: hỏi **tuần tự từng câu** để xây **project meta** (thông tin tổ chức, ngữ cảnh pháp lý/branding, audience, ràng buộc, v.v.). Có **đề xuất** giá trị mặc định; nếu user đồng ý thì áp đề xuất. Thông tin **tái sử dụng xuyên dự án** lưu ở **global** (máy) trong `~/.viepilot/profiles/<slug>.md` — cùng họ với `~/.viepilot/ui-components/` và `~/.viepilot/stacks/`. **Registry** tập trung: `~/.viepilot/profile-map.md` (vai trò tương tự `INDEX.md` của ui-components: tra cứu / chọn khi nhiều bối cảnh). Khi **build tài liệu** (vp-docs, crystallize, v.v.), **chỉ dùng profile đã chọn** cho repo hiện tại.

## Details

### Luồng mong muốn
1. **Trigger**: Brainstorm **first-time init** + đã có **scope locked** (điều kiện “before end” như user mô tả).
2. **Project meta intake phase** (bắt buộc, không bỏ qua mặc định):
   - Một câu hỏi mỗi lượt (tuần tự), rõ ràng, có thể có **gợi ý** (proposal) từ AI dựa trên brainstorm + repo signals.
   - User chấp nhận gợi ý → ghi nhận giá trị đó; từ chối/sửa → ghi nhận bản user.
3. **Lưu trữ**:
   - **Project-local**: metadata trỏ tới profile đang active + snapshot hoặc keys cần cho build (định nghĩa chi tiết khi implement — vd. `.viepilot/META.md` hoặc field trong `HANDOFF.json` / `PROJECT-CONTEXT`).
   - **Global reusable (canonical)**: `~/.viepilot/profiles/<slug>.md` — machine-level, **không** commit vào git dự án trừ khi user chủ động export/copy.
   - **Registry (canonical)**: `~/.viepilot/profile-map.md` — một file ở **root** home ViePilot (cạnh các thư mục con `profiles/`, `ui-components/`, `stacks/`). Nội dung tối thiểu: bảng/map với `profile id`, **display name**, org/company tag, mô tả ngắn, đường dẫn tới file profile, **tags**, `last-used`; mục tiêu **không** phải đọc lần lượt từng `*.md` trong `profiles/` để chọn.
4. **Nhiều bối cảnh**: Nếu map có **>1** profile khả dĩ (vd. hai công ty), **bắt buộc** bước **chọn profile** (hoặc tạo profile mới) trước khi ghi project binding.
5. **Downstream**: `vp-crystallize`, `vp-docs`, workflows liên quan **inject** nội dung từ **profile đã chọn** + meta project khi sinh tài liệu.

### Căn chỉnh với global ViePilot hiện có
| Tài nguyên | Đường dẫn | Ghi chú |
|------------|-----------|---------|
| Stack cache | `~/.viepilot/stacks/{stack}/…` | Đã dùng trong crystallize |
| UI components | `~/.viepilot/ui-components/{category}/{id}/…` + `INDEX.md` trong thư mục đó | Workflow tạo `mkdir -p` cả global + `.viepilot/` local |
| **Profiles (FEAT-009)** | `~/.viepilot/profiles/<slug>.md` + `~/.viepilot/profile-map.md` | Cùng `~/.viepilot/` home; installer nên `mkdir -p` giống pattern ui-components |

### Phạm vi kỹ thuật gợi ý (để phase sau chi tiết hóa)
- Cập nhật `workflows/brainstorm.md` + `skills/vp-brainstorm/SKILL.md`: gate “meta intake” sau scope lock.
- Có thể thêm skill nhẹ `vp-meta` / mở rộng `vp-brainstorm` — quyết định trong planning.
- Installer / first-run: `mkdir -p "$HOME/.viepilot/profiles"` và khởi tạo `~/.viepilot/profile-map.md` (header + bảng rỗng hoặc commented template) nếu chưa tồn tại — mirror bước prepare store trong `workflows/ui-components.md`.
- Tests: contract cho tồn tại file map, schema tối thiểu, và binding project → profile.

### Out of scope (gợi ý)
- Đồng bộ profile lên cloud / team (có thể là follow-up).
- MFA / secret: không lưu credentials trong profile; chỉ meta công khai an toàn.

## Acceptance Criteria
- [x] Sau brainstorm khởi tạo, khi scope đã chốt, workflow **bắt buộc** chạy phase **project meta intake** (hỏi lần lượt, có đề xuất, user chọn chấp nhận/sửa).
- [x] Thông tin tái sử dụng được lưu tại **global** `~/.viepilot/profiles/<slug>.md` với contract rõ ràng (frontmatter hoặc sections).
- [x] Có **`~/.viepilot/profile-map.md`** để tra cứu và chọn profile; khi >1 profile phù hợp, UI/flow **yêu cầu user chọn** rõ ràng.
- [x] Project hiện tại **ghi nhận** profile đang dùng; **build docs** (crystallize/docs pipeline) **dùng đúng profile đã chọn**.
- [x] Tài liệu user (quick-start hoặc features) mô tả cách tạo/chọn profile và map.
- [x] Tests hoặc verify script bảo vệ contract cơ bản (paths, keys bắt buộc, không ghi secret).

## Related
- **Phase**: **31** — `.viepilot/phases/31-global-project-profiles-fe009/` (M1.27)
- **Files (dự kiến)**: `workflows/brainstorm.md`, `skills/vp-brainstorm/SKILL.md`, có thể `workflows/crystallize.md`, `skills/vp-crystallize/SKILL.md`, `skills/vp-docs/SKILL.md`, installer (`lib/viepilot-install.cjs` hoặc tương đương), `docs/user/*`
- **Dependencies**: None
- **Ghi chú**: Paths đã chốt theo **một home** `~/.viepilot/` (cùng `stacks/`, `ui-components/`).

## Discussion
User muốn tránh lặp lại cùng một bộ câu hỏi tổ chức/branding giữa các repo; profile + map giảm ma sát và hỗ trợ freelancer / multi-client.

## Resolution
**M1.27 / Phase 31** shipped as **viepilot@1.9.0** (2026-04-01): normative `docs/dev/global-profiles.md`, `VIEPILOT-META.md`, brainstorm step 5 meta intake, installer `profiles/` + `profile-map` seed, crystallize + documentation + skills consumption, `tests/unit/vp-fe009-global-profiles-contracts.test.js`, user docs (`quick-start`, `brainstorm` feature).

