---
name: vp-brainstorm
description: "Brainstorm session để thu thập ý tưởng, quyết định cho dự án"
version: 1.1.0
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

<implementation_routing_guard>
## Implementation routing guard (ENH-021)

- Trong phạm vi **session** (`docs/brainstorm/*`, `.viepilot/ui-direction/*`). **Không** implement thay **`/vp-auto`** cho `lib/`, `tests/`, thay đổi framework `workflows/`/`skills/` — sau brainstorm dùng **`/vp-crystallize`** / **`/vp-evolve`** → **`/vp-auto`** tùy giai đoạn. Override explicit — nêu rõ trong chat.
</implementation_routing_guard>


<objective>
Thu thập ý tưởng, requirements, quyết định kiến trúc cho dự án thông qua interactive Q&A.

Hỗ trợ:
- Tạo session mới
- Tiếp tục session cũ
- Xem lại session trước đó
- Landing page layout discovery (hỏi thêm để chốt bố cục)
- In-session research (research ngay trong phiên brainstorm theo yêu cầu)
- UI Direction mode: tạo/cập nhật HTML prototype + notes trong `.viepilot/ui-direction/{session-id}/` — hỗ trợ **multi-page** (`pages/{slug}.html` + hub `index.html`) và hook **`## Pages inventory`** trong `notes.md` khi có `pages/` (FEAT-007)
- **Phase assignment (ENH-030):** trong mọi session, features/capabilities được gán trực tiếp vào Phase 1, Phase 2, Phase 3... — không dùng MVP/Post-MVP/Future tiers. Session file lưu trong `## Phases` section.
- **Project meta intake (FEAT-009):** sau khi **scope locked**, **trước** `Completed` / `/end`, nếu thiếu `.viepilot/META.md` (`viepilot_profile_id`) — chạy Q&A **tuần tự** có proposal; đọc/ghi `~/.viepilot/profile-map.md`; tạo `~/.viepilot/profiles/<slug>.md` + binding theo **`docs/dev/global-profiles.md`**. Nếu đã có profile bound — skip intake mặc định (hỏi đổi nếu cần).
- **UX walkthrough (FEAT-010 + ENH-019 + ENH-020):** trong **`--ui`**, lệnh **`/research-ui`** hoặc **`/research ui`** chạy 3 phase — mô phỏng **end-user** (kèm **content stress pass** + **stress recipes theo archetype** → **Stress findings**) → **UX designer + web research** → chỉnh `index.html` / `pages/*.html` / `style.css` và ghi **`## UX walkthrough log`** trong `notes.md` (đồng bộ hub + **Pages inventory** khi multi-page).
- **Background UI extraction (ENH-026):** tự động nhận diện UI signal keywords trong mọi phiên brainstorm (không cần `--ui` flag); silent accumulation buffer; surface để xác nhận khi topic kết thúc, `/save`, hoặc ≥5 signals — không interrupt hội thoại chính.
- **Architect Design Mode (FEAT-011):** `/vp-brainstorm --architect` hoặc auto-activate khi ≥3 components/services; generate HTML workspace (architecture, data-flow, decisions, tech-stack, tech-notes, feature-map) với Mermaid diagrams; incremental update per decision; `/review-arch` command; machine-readable `notes.md` YAML schema.
- **ERD page (ENH-027):** Architect workspace includes `erd.html` — Mermaid `erDiagram`, entity list table, relationship summary; triggered by DB/entity/table/relationship keywords; notes.md `## erd` YAML section exported to ARCHITECTURE.md `## Database Schema` via crystallize Step 1D.
- **User Use Cases page (ENH-028):** Architect workspace includes `user-use-cases.html` — actor/use-case diagram (Mermaid flowchart), use case table; triggered by user/role/actor/story keywords; notes.md `## use_cases` YAML section exported to PROJECT-CONTEXT.md `## User Stories & Use Cases` via crystallize Step 1D.
- **C4Context/Sequence/Deployment/APIs pages (ENH-029, 12-page workspace):** Architect workspace expanded to 12 pages — `sequence-diagram.html` (per-scenario sequenceDiagram), `deployment.html` (infra graph + environments + CI/CD pipeline), `apis.html` (endpoint tables with HTTP method badges); page boundary rules table; trigger keywords for sequence/deploy/API; notes.md `## apis` YAML section; deployment+APIs exported to ARCHITECTURE.md via crystallize Step 1D (sequence excluded — scenario docs are not architecture artifacts).

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
8. Khi topic thêm/sửa capability: cập nhật **`## Phases`** trong session theo `workflows/brainstorm.md`
9. Trước khi hoàn tất phiên: **bước 5 — Project meta intake (FEAT-009)** trong `workflows/brainstorm.md` khi binding thiếu; sequential Q&A + profile-map disambiguation + ghi global profile + `.viepilot/META.md`
10. Save session with structured format (bao gồm **`## Project meta intake (FEAT-009)`**, research notes + UI direction references + **`## Phases`**)
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
- [ ] **FEAT-010 + ENH-019 + ENH-020**: `/research-ui` (khi `--ui`) chạy đủ 3 phase, gồm **content stress pass** + **archetype recipes** + **`## UX walkthrough log`** (có **Stress findings**) khi có chỉnh prototype
- [ ] `## Phases` present với Phase 1 có nội dung thật khi scope được thảo luận
- [ ] **FEAT-009**: intake hoàn tất hoặc binding đã có **hoặc** waiver có lý do trước Completed; session ghi **`## Project meta intake (FEAT-009)`**
- [ ] Next steps suggested
</success_criteria>
