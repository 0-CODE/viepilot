---
name: vp-brainstorm
description: "Brainstorm session để thu thập ý tưởng, quyết định cho dự án"
version: 0.4.0
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
- Default mode: only use and reference  skills in ViePilot workflows.
- External skills () are out of framework scope unless user explicitly opts in.
- If external skills appear in runtime context, ignore them and route with the closest built-in  skill.
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
7. Nếu user yêu cầu research hoặc cần làm rõ quyết định: research ngay trong session và quay lại topic
8. Khi topic thêm/sửa capability hoặc release scope: cập nhật **`## Product horizon`** trong session (merge, không xóa tier tags im lặng) theo `workflows/brainstorm.md`
9. Save session with structured format (bao gồm research notes + UI direction references + **Product horizon** khi có)
10. Suggest next action: `/vp-crystallize`
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
- [ ] `## Product horizon` present với MVP / Post-MVP / Future (hoặc explicit single-release statement) khi scope được thảo luận
- [ ] Next steps suggested
</success_criteria>
