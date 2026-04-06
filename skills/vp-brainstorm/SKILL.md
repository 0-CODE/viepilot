---
name: vp-brainstorm
description: "Brainstorm session to collect ideas and decisions for the project"
version: 1.1.0
---

<cursor_skill_adapter>
## A. Skill Invocation
- Skill được gọi khi user mention `vp-brainstorm`, `/vp-brainstorm`, hoặc yêu cầu "brainstorm"
- Treat all user text after the skill mention as `{{VP_ARGS}}`

## B. User Prompting
Prompt user conversationally with numbered list options.

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

- Scoped to **session artifacts** (`docs/brainstorm/*`, `.viepilot/ui-direction/*`). Does **not** implement on behalf of **`/vp-auto`** for `lib/`, `tests/`, or framework `workflows/`/`skills/` changes — after brainstorm use **`/vp-crystallize`** / **`/vp-evolve`** → **`/vp-auto`** depending on the stage. Explicit override — state it in chat.
</implementation_routing_guard>


<objective>
Collect ideas, requirements, and architecture decisions for the project through interactive Q&A.

Supports:
- Create a new session
- Continue a previous session
- Review a past session
- Landing page layout discovery (follow-up questions to finalize layout)
- In-session research (research during the brainstorm session on demand)
- UI Direction mode: create/update HTML prototype + notes under `.viepilot/ui-direction/{session-id}/` — supports **multi-page** (`pages/{slug}.html` + hub `index.html`) and the **`## Pages inventory`** hook in `notes.md` when `pages/` exists (FEAT-007)
- **Phase assignment (ENH-030):** in every session, features/capabilities are assigned directly to Phase 1, Phase 2, Phase 3... — no MVP/Post-MVP/Future tiers. Session file stores assignments in the `## Phases` section.
- **Project meta intake (FEAT-009):** after **scope locked**, **before** `Completed` / `/end`, if `.viepilot/META.md` (`viepilot_profile_id`) is missing — run **sequential** Q&A with proposals; read/write `~/.viepilot/profile-map.md`; create `~/.viepilot/profiles/<slug>.md` + binding per **`docs/dev/global-profiles.md`**. If a profile is already bound — skip intake by default (ask if change needed).
- **UX walkthrough (FEAT-010 + ENH-019 + ENH-020):** in **`--ui`** mode, command **`/research-ui`** or **`/research ui`** runs 3 phases — simulates **end-user** (with **content stress pass** + **stress recipes by archetype** → **Stress findings**) → **UX designer + web research** → update `index.html` / `pages/*.html` / `style.css` and write **`## UX walkthrough log`** in `notes.md` (sync hub + **Pages inventory** for multi-page).
- **Background UI extraction (ENH-026):** automatically detects UI signal keywords in every brainstorm session (no `--ui` flag required); silent accumulation buffer; surfaces for confirmation when topic ends, `/save`, or ≥5 signals — does not interrupt the main conversation.
- **Architect Design Mode (FEAT-011):** `/vp-brainstorm --architect` or auto-activate when ≥3 components/services detected; generate HTML workspace (architecture, data-flow, decisions, tech-stack, tech-notes, feature-map) with Mermaid diagrams; incremental update per decision; `/review-arch` command; machine-readable `notes.md` YAML schema.
- **ERD page (ENH-027):** Architect workspace includes `erd.html` — Mermaid `erDiagram`, entity list table, relationship summary; triggered by DB/entity/table/relationship keywords; notes.md `## erd` YAML section exported to ARCHITECTURE.md `## Database Schema` via crystallize Step 1D.
- **User Use Cases page (ENH-028):** Architect workspace includes `user-use-cases.html` — actor/use-case diagram (Mermaid flowchart), use case table; triggered by user/role/actor/story keywords; notes.md `## use_cases` YAML section exported to PROJECT-CONTEXT.md `## User Stories & Use Cases` via crystallize Step 1D.
- **C4Context/Sequence/Deployment/APIs pages (ENH-029, 12-page workspace):** Architect workspace expanded to 12 pages — `sequence-diagram.html` (per-scenario sequenceDiagram), `deployment.html` (infra graph + environments + CI/CD pipeline), `apis.html` (endpoint tables with HTTP method badges); page boundary rules table; trigger keywords for sequence/deploy/API; notes.md `## apis` YAML section; deployment+APIs exported to ARCHITECTURE.md via crystallize Step 1D (sequence excluded — scenario docs are not architecture artifacts).

**Creates/Updates:**
- `docs/brainstorm/session-{YYYY-MM-DD}.md`

**After:** Ready for `/vp-crystallize`

**Language configuration (ENH-032):**
- Step 0 reads `~/.viepilot/config.json` → `BRAINSTORM_LANG` = `language.document` (default: `en`).
- `BRAINSTORM_LANG` is used for brainstorm file storage and generated content.
- User session language takes precedence over config if different.
- Configure via: `vp-tools config set language.document vi`
</objective>

<execution_context>
@$HOME/.cursor/viepilot/workflows/brainstorm.md
</execution_context>

<context>
Optional flags:
- `--new` : Force create a new session
- `--continue` : Continue the most recent session
- `--list` : List all sessions
- `--landing` : Prioritize the Landing Page layout discovery flow
- `--research` : Enable proactive research suggestions during the session
- `--ui` : Enable UI Direction mode (live HTML/CSS direction artifacts)
</context>

<process>
Execute workflow from `@$HOME/.cursor/viepilot/workflows/brainstorm.md`

Key steps:
1. Detect existing sessions
2. Ask user intent (new/continue/review)
3. Load context if continuing
4. Run interactive Q&A with topic-based structure
5. If topic is a landing page: ask follow-up layout questions + reference `21st.dev` to suggest sections/components
6. If topic needs UI/UX: create/update UI Direction artifacts under `.viepilot/ui-direction/{session-id}/` — legacy: `index.html` + `style.css` + `notes.md`; multi-page: add `pages/*.html`, `index.html` as hub, and after each page change update **`## Pages inventory`** in `notes.md` (see `docs/user/features/ui-direction.md`)
6b. When user types **`/research-ui`** or **`/research ui`** during a UI session: follow **`workflows/brainstorm.md`** exactly (FEAT-010) — do not merge into the short regular research step
7. If user requests research or needs to clarify a decision: research inline in the session and return to the topic
8. When a topic adds/modifies a capability: update **`## Phases`** in the session per `workflows/brainstorm.md`
9. Before completing the session: **step 5 — Project meta intake (FEAT-009)** in `workflows/brainstorm.md` when binding is missing; sequential Q&A + profile-map disambiguation + write global profile + `.viepilot/META.md`
10. Save session with structured format (including **`## Project meta intake (FEAT-009)`**, research notes + UI direction references + **`## Phases`**)
11. Suggest next action: `/vp-crystallize`
</process>

<success_criteria>
- [ ] Session file created/updated with all required sections
- [ ] Decisions documented with rationale
- [ ] Open questions listed
- [ ] Action items captured
- [ ] Landing page topics include explicit layout selection questions
- [ ] 21st.dev references included when relevant
- [ ] Research can be executed inside the same brainstorm session
- [ ] UI Direction artifacts created/updated when UI mode is active
- [ ] Multi-page sessions: hub links + `## Pages inventory` stay in sync with `pages/*.html`
- [ ] **FEAT-010 + ENH-019 + ENH-020**: `/research-ui` (when `--ui`) runs all 3 phases, including **content stress pass** + **archetype recipes** + **`## UX walkthrough log`** (with **Stress findings**) when prototype is updated
- [ ] `## Phases` present with Phase 1 having real content when scope is discussed
- [ ] **FEAT-009**: intake completed, binding already present, **or** waiver with reason before Completed; session records **`## Project meta intake (FEAT-009)`**
- [ ] Next steps suggested
</success_criteria>
