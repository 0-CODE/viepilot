---
name: vp-brainstorm
description: "Brainstorm session để thu thập ý tưởng, quyết định cho dự án"
version: 0.6.1
---

<cursor_skill_adapter>
## A. Skill Invocation
- Skill được gọi khi user mention `vp-brainstorm`, `/vp-brainstorm`, hoặc yêu cầu "brainstorm"
- Treat all user text after the skill mention as `{{VP_ARGS}}`

## B. User Prompting
Prompt user conversationally với numbered list options.

## C. Tool Usage
Use Cursor tools: `Shell`, `ReadFile`, `Glob`, `rg`, `ApplyPatch`, `WebSearch`, `WebFetch`, `Subagent`
</cursor_skill_adapter>
<scope_policy>
## ViePilot Namespace Guard (BUG-004)
- Default mode: only use and reference `vp-*` skills in ViePilot workflows.
- External skills (`non vp-*`) are out of framework scope unless user explicitly opts in.
- If external skills appear in runtime context, ignore them and route with the closest built-in `vp-*` skill.
</scope_policy>


<objective>
Thu thập ý tưởng, requirements, quyết định kiến trúc cho dự án thông qua interactive Q&A.

Hỗ trợ:
- Tạo session mới
- Tiếp tục session cũ
- Xem lại session trước đó
- Landing page layout discovery (hỏi thêm để chốt bố cục)
- In-session research (research ngay trong phiên brainstorm theo yêu cầu)
- UI Direction mode: tạo/cập nhật HTML prototype + notes trong `.viepilot/ui-direction/{session-id}/` — hỗ trợ **multi-page** (`pages/{slug}.html` + hub `index.html`) và hook **`## Pages inventory`** trong `notes.md` khi có `pages/` (FEAT-007)
- **Product horizon (ENH-014):** mọi session phải duy trì **`## Product horizon`** khi thảo luận capability/milestone — tier tags `(MVP)` / `(Post-MVP)` / `(Future)`, non-goals, deferred capabilities; hoặc ghi rõ **single-release / no deferred epics** (contract: `workflows/brainstorm.md`)
- **Project meta intake (FEAT-009):** sau khi **scope locked**, **trước** `Completed` / `/end`, nếu thiếu `.viepilot/META.md` (`viepilot_profile_id`) — chạy Q&A **tuần tự** có proposal; đọc/ghi `~/.viepilot/profile-map.md`; tạo `~/.viepilot/profiles/<slug>.md` + binding theo **`docs/dev/global-profiles.md`**. Nếu đã có profile bound — skip intake mặc định (hỏi đổi nếu cần).
- **UX walkthrough (FEAT-010 + ENH-019):** trong **`--ui`**, lệnh **`/research-ui`** hoặc **`/research ui`** chạy 3 phase — mô phỏng **end-user** (kèm **content stress pass**: copy dài, khối lượng, validation, viewport → **Stress findings**) → **UX designer + web research** → chỉnh `index.html` / `pages/*.html` / `style.css` và ghi **`## UX walkthrough log`** trong `notes.md` (đồng bộ hub + **Pages inventory** khi multi-page).

**Creates/Updates:**
- `docs/brainstorm/session-{YYYY-MM-DD}.md`

**After:** Ready for `/vp-crystallize`
</objective>

<execution_context>
@$HOME/.cursor/viepilot/workflows/brainstorm.md
</execution_context>

<context>
Optional flags:
- `--new` : Force tạo session mới
- `--continue` : Tiếp tục session gần nhất
- `--list` : Liệt kê các sessions
- `--landing` : Ưu tiên flow Landing Page layout discovery
- `--research` : Bật proactive research suggestions trong phiên
- `--ui` : Bật UI Direction mode (live HTML/CSS direction artifacts)
</context>

<process>
Execute workflow from `@$HOME/.cursor/viepilot/workflows/brainstorm.md`

Key steps:
1. Detect existing sessions
2. Ask user intent (new/continue/review)
3. Load context if continuing
4. Run interactive Q&A với topic-based structure
5. Nếu topic là landing page: hỏi thêm bố cục + tham khảo `21st.dev` để đề xuất section/components
6. Nếu topic cần UI/UX: tạo/cập nhật UI Direction artifacts trong `.viepilot/ui-direction/{session-id}/` — legacy: `index.html` + `style.css` + `notes.md`; multi-page: thêm `pages/*.html`, `index.html` làm hub, và sau mỗi thay đổi page cập nhật **`## Pages inventory`** trong `notes.md` (xem `docs/user/features/ui-direction.md`)
6b. Khi user gõ **`/research-ui`** hoặc **`/research ui`** trong phiên UI: làm đúng **`workflows/brainstorm.md`** (FEAT-010) — không gộp vào bước research ngắn thường lệ
7. Nếu user yêu cầu research hoặc cần làm rõ quyết định: research ngay trong session và quay lại topic
8. Khi topic thêm/sửa capability hoặc release scope: cập nhật **`## Product horizon`** trong session (merge, không xóa tier tags im lặng) theo `workflows/brainstorm.md`
9. Trước khi hoàn tất phiên: **bước 5 — Project meta intake (FEAT-009)** trong `workflows/brainstorm.md` khi binding thiếu; sequential Q&A + profile-map disambiguation + ghi global profile + `.viepilot/META.md`
10. Save session with structured format (bao gồm **`## Project meta intake (FEAT-009)`**, research notes + UI direction references + **Product horizon** khi có)
11. Suggest next action: `/vp-crystallize`
</process>

<success_criteria>
- [ ] Session file created/updated với đầy đủ sections
- [ ] Decisions documented với rationale
- [ ] Open questions listed
- [ ] Action items captured
- [ ] Landing page topics include explicit layout selection questions
- [ ] 21st.dev references included when relevant
- [ ] Research can be executed inside the same brainstorm session
- [ ] UI Direction artifacts created/updated when UI mode is active
- [ ] Multi-page sessions: hub links + `## Pages inventory` stay in sync with `pages/*.html`
- [ ] **FEAT-010 + ENH-019**: `/research-ui` (khi `--ui`) chạy đủ 3 phase, gồm **content stress pass** + **`## UX walkthrough log`** (có **Stress findings**) khi có chỉnh prototype
- [ ] `## Product horizon` present với MVP / Post-MVP / Future (hoặc explicit single-release statement) khi scope được thảo luận
- [ ] **FEAT-009**: intake hoàn tất hoặc binding đã có **hoặc** waiver có lý do trước Completed; session ghi **`## Project meta intake (FEAT-009)`**
- [ ] Next steps suggested
</success_criteria>
