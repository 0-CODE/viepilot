---
name: vp-brainstorm
description: "Brainstorm session to collect ideas and decisions for the project"
version: 1.1.0
---

<greeting>
## Invocation Banner

Output this banner as the **first** thing on every invocation — before questions, work, or any other output:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► VP-BRAINSTORM  v1.1.0 (fw 2.19.0)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
</greeting>

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
- **Background UI extraction (ENH-026 + ENH-060):** automatically detects UI signal keywords in every brainstorm session (no `--ui` flag required). **Auto-suggests itself (ENH-060):** if the initial message contains ≥1 UI keyword, shows a proactive 🎨 banner immediately — mirrors Architect Design Mode's 🏗️ proactive activation. Accumulation starts at ≥1 signal (was ≥3); surfaces for confirmation when topic ends, `/save`, or **≥2 unique signals** accumulated (was ≥5) — does not interrupt the main conversation.
- **Idea → Architecture breakdown loop (ENH-061):** structured 8-step flow from free idea collection → scope lock → **Feature → Coverage mapping** (maps each Phase 1 feature to an architect page + UI screen, outputs `## Coverage` matrix in `notes.md`) → Architect Design → **`arch_to_ui_sync`** reverse sync (surfaces UI implications of architectural decisions; `/sync-ui` command) → UI Direction → **completeness gate** (CHECK 4: warns if any Phase 1 feature has no coverage in either mode, non-blocking). See `Recommended Breakdown Ordering` section in `workflows/brainstorm.md`.
- **Unified workspace mode selection (BUG-018):** after scope lock, before any design workspace is created, an AUQ prompt offers: Both / Architect only / UI Direction only / Neither. Architect auto-activate heuristic is deferred until after this selection; suppressed if user selects "Neither" or "UI Direction only".
- **Admin & Governance coverage (ENH-063):** Topic 6 in brainstorm template; proactive 🔐 heuristic fires on admin/governance keywords; admin coverage gate before /save for multi-user/SaaS/compliance projects; `admin.html` added to Architect workspace when applicable; `notes.md ## admin` YAML exported via crystallize.
- **Content Management coverage (ENH-065):** Topic 7 in brainstorm template; proactive 🗂️ heuristic fires on content-type/media/SEO keywords; content coverage gate before /save for projects with content layer; `content.html` added to Architect workspace; `notes.md ## content` YAML exported via crystallize.
- **Admin Entity Management coverage (ENH-068):** Topic 7 in brainstorm template; proactive 🗄️ heuristic fires on CRUD/entity/admin panel keywords; entity management coverage gate before /save for projects with DB entities (cross-references ERD); `entity-mgmt.html` added to Architect workspace; `notes.md ## entity_mgmt` YAML exported via crystallize.
- **User Data Management coverage (ENH-066):** Topic 9 in brainstorm template; proactive 👤 heuristic fires on user-account/privacy/auth keywords; user data coverage gate before /save for B2C/SaaS/GDPR projects; `user-data.html` added to Architect workspace; `notes.md ## user_data` YAML exported via crystallize.
- **Architect Design Mode (FEAT-011):** `/vp-brainstorm --architect` or auto-activate when ≥3 components/services detected; generate HTML workspace (architecture, data-flow, decisions, tech-stack, tech-notes, feature-map) with Mermaid diagrams; incremental update per decision; `/review-arch` command; machine-readable `notes.md` YAML schema.
- **ERD page (ENH-027):** Architect workspace includes `erd.html` — Mermaid `erDiagram`, entity list table, relationship summary; triggered by DB/entity/table/relationship keywords; notes.md `## erd` YAML section exported to ARCHITECTURE.md `## Database Schema` via crystallize Step 1D.
- **User Use Cases page (ENH-028):** Architect workspace includes `user-use-cases.html` — actor/use-case diagram (Mermaid flowchart), use case table; triggered by user/role/actor/story keywords; notes.md `## use_cases` YAML section exported to PROJECT-CONTEXT.md `## User Stories & Use Cases` via crystallize Step 1D.
- **C4Context/Sequence/Deployment/APIs pages (ENH-029, 12-page workspace):** Architect workspace expanded to 12 pages — `sequence-diagram.html` (per-scenario sequenceDiagram), `deployment.html` (infra graph + environments + CI/CD pipeline), `apis.html` (endpoint tables with HTTP method badges); page boundary rules table; trigger keywords for sequence/deploy/API; notes.md `## apis` YAML section; deployment+APIs exported to ARCHITECTURE.md via crystallize Step 1D (sequence excluded — scenario docs are not architecture artifacts).
- **Embedded Domain Mode (ENH-071):** Activated when ≥2 embedded trigger keywords detected (MCU families: STM32/ESP32/nRF52/AVR/RISC-V/RP2040; concepts: firmware/bare-metal/GPIO/interrupt/HAL/bootloader/RTOS) OR `--domain embedded` flag. Adds 6 Architect workspace pages for embedded hardware artifacts, injects domain-specific topic probes, suppresses web-UI false-positives for hardware display keywords, and offers a firmware phase ordering template. crystallize exports 8 YAML sections to ARCHITECTURE.md hardware sections.

**Creates/Updates:**
- `docs/brainstorm/session-{YYYY-MM-DD}.md`

**After:** Ready for `/vp-crystallize`

**Language configuration (ENH-032):**
- Step 0 reads `~/.viepilot/config.json` → `BRAINSTORM_LANG` = `language.document` (default: `en`).
- `BRAINSTORM_LANG` is used for brainstorm file storage and generated content.
- User session language takes precedence over config if different.
- Configure via: `vp-tools config set language.document vi`

**Workflow version stamps (ENH-067):**
- Session files record `workflow_version` (current ViePilot semver) at create/save time.
- `upgrade_supplement_version` stamped after gap-detection supplement completes (idempotency guard).

**Upgrade gap detection (ENH-067):**
- On `--continue`, compares session `workflow_version` vs. current Topics Template to detect missing topics.
- Proactive 🔄 upgrade banner (AUQ) lists missing topics; user can discuss inline, defer to /save, or skip.
- Inline supplement appended as `## Upgrade supplement (vX → vY)` section; `upgrade_supplement_version` stamped for idempotency.
- After supplement: suggests `/vp-crystallize --upgrade` to patch project artifacts.
</objective>

<execution_context>
@$HOME/{envToolDir}/workflows/brainstorm.md
</execution_context>

<context>
Optional flags:
- `--new` : Force create a new session
- `--continue` : Continue the most recent session
- `--list` : List all sessions
- `--landing` : Prioritize the Landing Page layout discovery flow
- `--research` : Enable proactive research suggestions during the session
- `--ui` : Enable UI Direction mode (live HTML/CSS direction artifacts)
- `--domain embedded` : Force-activate Embedded Domain Mode (hardware topology, RTOS, pin map, memory layout, protocol matrix, power budget pages + topic probes)
</context>

### Embedded Domain Mode (ENH-071)

**Activation**: Automatically when ≥2 embedded keywords detected, or via `--domain embedded` flag. One-time `🔌 Embedded Domain Mode activated` banner shown.

**Topic probes injected when `embedded_domain: true`:**
- **MCU/Toolchain** (Gap 2): MCU family, toolchain (GCC-ARM/Keil/IAR), build system (CMake/PlatformIO/West), debug interface (SWD/JTAG), flasher, SDK/HAL
- **RTOS/Scheduling** (Gap 3): bare-metal vs RTOS choice, task list, ISR table, resource protection strategy
- **Power Budget** (Gap 7): supply type, sleep modes, current targets, battery life (triggered by battery/power/sleep keywords)
- **Safety/Compliance** (Gap 10): IEC 61508/ISO 26262/DO-178C, watchdog, fault handlers (triggered by safety/SIL/ASIL keywords)
- **Firmware Phase Template** (Gap 9): Board Bring-Up → Drivers → RTOS → Middleware → Application → Integration Test → OTA

**6 new Architect workspace pages** (in `.viepilot/architect/{session-id}/`):

| Page | Trigger | Content |
|------|---------|---------|
| `hw-topology.html` | Always in embedded domain | MCU block diagram (Mermaid graph TD) + component/bus/power-rail tables |
| `pin-map.html` | GPIO/pin/pinout keywords | Pin assignment table (Pin# / GPIO / Function / Peripheral / Direction / Pull / Voltage) |
| `memory-layout.html` | Flash/RAM/linker/bootloader/OTA keywords | Flash + RAM regions tables + linker constraint notes |
| `protocol-matrix.html` | CAN/I2C/SPI/BLE/LoRa/MQTT/Modbus keywords | Bus protocol + wireless connectivity tables (distinct from `apis.html` HTTP REST) |
| `rtos-scheduler.html` | RTOS/FreeRTOS/task/ISR/scheduler keywords | Task priority table + ISR table + state diagram (≤5 tasks) |
| `power-budget.html` | Battery/sleep/power/µA/mAh keywords | Power modes table + battery life estimate |

Pages linked in `index.html` under an **Embedded** nav section.

**UI Direction false-positive suppression** (Gap 6):
- `LCD` / `OLED` / `TFT` / `display` / `screen` in hardware context → routed to `hw-topology` peripherals, NOT UI Direction buffer
- Hardware context confirmed by: GPIO / SPI / I2C / driver / framebuffer / ILI9341 / SSD1306 / LVGL / u8g2 keywords
- `🎨 UI Direction Mode?` banner suppressed when all display signals have hardware context

**notes.md YAML sections written:** `## hw_topology`, `## pin_map`, `## memory_layout`, `## protocols`, `## rtos_config`, `## embedded_toolchain`, `## power_budget`, `## safety_config`

**crystallize Step 1D item 13 exports:**
- `## Hardware Architecture` (from `hw_topology`)
- `## Hardware Interface` (from `pin_map`)
- `## Memory Map` (from `memory_layout`)
- `## Communication Protocols` (from `protocols`) — distinct from `## APIs`
- `## RTOS & Task Model` (from `rtos_config`)
- `## Toolchain & Build System` (from `embedded_toolchain`)
- `## Power Budget` (from `power_budget`)
- `## Safety & Reliability` (from `safety_config`)
- `## Embedded Domain: true` + MCU family written to `PROJECT-CONTEXT.md`
- UI Coverage Gate skipped; Hardware Coverage Check (driver-task completeness, non-blocking) applied instead

<process>
Execute workflow from `@$HOME/{envToolDir}/workflows/brainstorm.md`

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

## Adapter Compatibility

### AskUserQuestion Tool (ENH-048)
This skill uses adapter-aware interactive prompts. Behavior depends on your adapter:

| Adapter | Interactive Prompts | Notes |
|---------|---------------------|-------|
| Claude Code (terminal) | ✅ `AskUserQuestion` tool — **REQUIRED** | Must call AUQ; plain-text only if tool errors or is unavailable |
| Claude Code (VS Code ext) | ⚠️ Partial | Terminal yes; VS Code UI pending [anthropics/claude-code#12609](https://github.com/anthropics/claude-code/issues/12609) |
| Cursor (Plan Mode) | ⚠️ Partial | `AskQuestion` in Plan Mode only — not in Agent/Skills Mode |
| Cursor (Agent/Skills) | ❌ Text fallback | AskQuestion not available in Agent Mode |
| Codex CLI | ❌ Text fallback | Native tool N/A; community MCP available |
| Antigravity (native agent) | ❌ Text fallback | Artifact model, no raw tool calls |
| GitHub Copilot | ✅ `/skill-name` in Chat | Via `.agent.md` custom agent; AUQ not available — text fallback |

**Claude Code (terminal) — AUQ preload required (ENH-059):**
Before the first interactive prompt, call `ToolSearch` with `query: "select:AskUserQuestion"` to load the deferred tool schema. Only after `ToolSearch` succeeds can `AskUserQuestion` be invoked. If `ToolSearch` returns an error, fall back to plain-text numbered list for that session.

When `AskUserQuestion` is not available on other adapters, the skill automatically falls back to
plain-text numbered list prompts — no configuration required.

**Prompts using AskUserQuestion in this skill:**
- Session intent (continue / review / new — Step 2)
- Landing page layout selection (Step 4 — Layout A/B/C/D)


### Skill Registry Integration (FEAT-020)

When UI Direction Mode is active, vp-brainstorm automatically:
1. Loads `~/.viepilot/skill-registry.json` (written by `vp-tools scan-skills`)
2. Matches installed skills by `capabilities` to current UI signals
3. **Silently** applies matched skill `best_practices` to HTML generation
4. Records matched skills in `notes.md ## skills_used`

**No prompt is shown** — integration is transparent. Skills with relevant
capabilities (e.g., `ui-generation`, `component-design`, `responsive-layout`)
are detected automatically.

Skill decisions are **locked at crystallize time** (see `/vp-crystallize`).
`/vp-auto` executes with those locked decisions — no re-asking.

Install skills via `vp-tools install-skill <source>`.
See: `docs/user/features/skill-registry.md`
