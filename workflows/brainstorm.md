<purpose>
Interactive brainstorm session to gather ideas, requirements, and decisions for the project.
Allows research inline within the same brainstorm session when needed.
</purpose>

## Adapter Compatibility

| Feature | Claude Code (terminal) | Cursor (Agent/Skills) | Codex CLI | Antigravity (native) |
|---------|----------------------|-----------------------|-----------|----------------------|
| Interactive prompts | ✅ `AskUserQuestion` tool — **REQUIRED** | ❌ text fallback | ❌ text fallback | ❌ text fallback |

**Claude Code (terminal):** Always call `AskUserQuestion` first. Only fall back to the plain-text menu below if the tool returns an error or is unavailable.
**Cursor / Codex CLI / Antigravity / other adapters:** `AskUserQuestion` not available — use text menus below.

## ViePilot Skill Scope Policy (BUG-004)

- Default behavior: only use and suggest skills under `vp-*`.
- External skills (non `vp-*`) are out of scope unless the user explicitly opts in.
- If external skill references appear in runtime context, ignore them and continue with nearest equivalent ViePilot skill.


<process>

<step name="detect_session_language">
## 0. Detect Session Language (ENH-032)

Read `~/.viepilot/config.json` → set `BRAINSTORM_LANG`:
- `BRAINSTORM_LANG` = `language.document` from config (default: `en`)

Use `BRAINSTORM_LANG` for brainstorm file storage (filenames, generated content).
If the user writes in a different language during the session, that takes precedence over the config value.
If `~/.viepilot/config.json` is absent, default to `en` — do not fail.
</step>

<step name="persona_domain_pack">
## 0B. Persona Domain Pack Integration (ENH-073)

At session start, before presenting topics, run:
```bash
node "$HOME/.claude/viepilot/bin/vp-tools.cjs" persona auto-switch
node "$HOME/.claude/viepilot/bin/vp-tools.cjs" persona context
```

Store the result as `PERSONA_CONTEXT`. If command unavailable or errors → `PERSONA_CONTEXT = null`, continue silently.

**If `PERSONA_CONTEXT` is available:**
1. Read `persona.domain` — load corresponding `lib/domain-packs/{domain}.json`
   - If domain is array (merged persona): load all packs and union their fields
2. Apply to topic list:
   - Prepend `extra_topics` not already in template (injected before session topics)
   - Reorder template topics by `topic_priority` (matching topics float to top)
   - Remove topics whose id is in `persona.brainstorm.topic_skip`
3. When phase discussion begins: suggest `phase_template.phases` from domain pack as default ordering
4. When Architect Design Mode activates: add domain pack `architect_pages` to workspace
5. If `persona.confidence < 0.6`: add inline note "(persona auto-detected, may be inaccurate — run /vp-persona to refine)" — not a blocking prompt

**Persona context is silently injected into the session — no banner, no AUQ.**
</step>

<step name="detect_embedded_domain">
## 0C. Detect Embedded Domain (ENH-071)

Scan the user's **initial message** (and, on `--continue`, the prior session content) for embedded trigger keywords.

**MCU family keywords**: `STM32`, `ESP32`, `ESP8266`, `nRF52`, `nRF5`, `AVR`, `PIC`, `RISC-V`, `Cortex-M`, `RP2040`, `MSP430`, `SAM`, `SAMD`, `LPC`, `GD32`, `CH32`

**Concept keywords**: `firmware`, `bare-metal`, `microcontroller`, `embedded`, `GPIO`, `interrupt`, `HAL`, `bootloader`, `RTOS`, `FreeRTOS`, `Zephyr`, `ThreadX`, `ChibiOS`, `RT-Thread`, `linker`, `peripheral`, `UART`, `SPI`, `I2C`, `CAN`, `watchdog`, `flash memory`, `memory map`, `ISR`, `DMA`, `PWM`, `ADC`, `DAC`, `MCU`, `SoC`

**Activation rule**: `≥2` keyword matches (across both lists) → set `embedded_domain: true`

**Manual override**: `--domain embedded` flag → set `embedded_domain: true` unconditionally, regardless of keyword count.

**On first activation** — show one-time banner (then suppress for rest of session):

```
🔌 Embedded Domain Mode activated
   Hardware topology, pin map, memory layout, RTOS scheduler,
   protocol matrix, and power budget pages will be added to the
   Architect workspace when relevant keywords are detected.
   UI Direction web-UI suggestions are suppressed
   (hardware display keywords route to hw-topology instead).
```

**Embedded topic injections** (activate when `embedded_domain: true`):
- MCU/Toolchain sub-topic probes → added to tech-stack section (§ Gap 2)
- RTOS/Scheduling topic → added after architecture/components (§ Gap 3)
- Power Budget topic → triggered by battery/sleep/power keywords (§ Gap 7)
- Safety/Compliance topic → triggered by safety/watchdog/SIL/ASIL keywords (§ Gap 10)
- Firmware Phase Template → offered at phase assignment step (§ Gap 9)

---

### Embedded Topic Probes (ENH-071)

#### MCU/Toolchain Sub-Topic (Gap 2)
When `embedded_domain: true`, after general tech-stack questions, inject:

```
🔌 Embedded Toolchain — let's capture your hardware/toolchain choices:

1. MCU/SoC family?
   (STM32 / ESP32 / nRF52 / RISC-V / AVR / RP2040 / SAM / other)
2. Toolchain?
   (GCC-ARM / Clang / IAR Embedded Workbench / Keil MDK / other)
3. Build system?
   (CMake / Make / PlatformIO / West (Zephyr) / Arduino / other)
4. Debug interface?
   (SWD / JTAG / UART-bootloader / ESP ROM bootloader / other)
5. Flasher/debugger tool?
   (OpenOCD / J-Link / ST-Link / Black Magic Probe / esptool / other)
6. SDK/HAL?
   (STM32 HAL+LL / ESP-IDF / nRF5 SDK / Zephyr west / Arduino framework / vendor BSP / custom)
```

→ Store responses in `notes.md ## embedded_toolchain` YAML section.

#### RTOS/Scheduling Topic (Gap 3)
When `embedded_domain: true`, add as a brainstorm topic after architecture/components:

```
🔌 RTOS & Scheduling — describe your execution model:

1. Execution model?
   (bare-metal super-loop / bare-metal interrupt-driven / RTOS)
2. If RTOS: which one?
   (FreeRTOS / Zephyr / ThreadX (Azure RTOS) / RT-Thread / ChibiOS / other)
3. Tasks/threads needed?
   (for each: name, period or event-driven, priority 1–10, estimated stack KB)
4. ISR table?
   (interrupt source, handler function, priority level 0=highest)
5. Shared resource protection?
   (mutex / semaphore / critical section / taskENTER_CRITICAL / spinlock)
6. Hard real-time constraints?
   (any response-time budget in µs or ms?)
```

→ Store in `notes.md ## rtos_config` YAML section.

#### Power Budget Topic (Gap 7)
**Trigger**: battery / sleep / power / current / µA / mAh / Standby / Stop / Shutdown / Hibernate / IoT / LoRa keywords in session AND `embedded_domain: true`

```
🔋 Power Budget — capture power management requirements:

1. Power supply?
   (battery: chemistry + capacity mAh / USB / DC adapter / energy harvesting)
2. Active mode target current? (mA)
3. Sleep strategy: which MCU sleep mode?
   (Stop / Standby / Shutdown / Hibernate / vendor-specific)
4. Which peripherals stay active during sleep?
   (RTC / LoRa / BLE / ADC / none)
5. Wake-up sources?
   (RTC timer / GPIO interrupt / UART wakeup / WDT)
6. Target battery lifetime? (hours / days / months)
```

→ Store in `notes.md ## power_budget` YAML section.

#### Safety/Compliance Topic (Gap 10)
**Trigger**: safety / watchdog / fault / SIL / ASIL / IEC / ISO 26262 / DO-178 / EN 50128 / safety-critical keywords in session

```
🛡️ Safety & Compliance — capture safety requirements:

1. Safety standard?
   (IEC 61508 SIL 1–4 / ISO 26262 ASIL A–D / DO-178C / EN 50128 / none)
2. Watchdog configuration?
   (IWDG / WWDG / timeout value ms / pet strategy)
3. Stack overflow detection?
   (MPU / FreeRTOS stack check / canary / none)
4. Fault handler strategy?
   (HardFault / MemManage / BusFault → reset / safe state / log + continue)
5. Safe state definition?
   (what is the safe fallback on error detection?)
6. Diagnostic coverage requirements? (if applicable)
```

→ Store in `notes.md ## safety_config` YAML section.

#### Firmware Phase Ordering Template (Gap 9)
When `embedded_domain: true`, at the **Phase Assignment** step, offer the standard firmware phase template before free-form phase entry:

```
🔌 Firmware Phase Template — suggested ordering for embedded projects
(customize: remove, merge, or rename phases as needed):

Phase 1: Board Bring-Up
  (clock config, GPIO init, UART console, LED blink, JTAG/SWD verify)
Phase 2: Driver Layer
  (all peripheral drivers from hw-topology: SPI, I2C, UART, CAN, ADC, PWM, etc.)
Phase 3: RTOS Configuration
  (task creation, queues, semaphores, heap sizing, stack overflow detection)
Phase 4: Middleware & Protocols
  (MQTT/BLE/LoRa stack, filesystem/NVS, OTA bootloader, custom protocols)
Phase 5: Application Logic
  (state machines, business logic, data processing, sensor fusion)
Phase 6: Integration & System Test
  (hardware-in-the-loop, timing verification, stress test, power measurement)
Phase 7: OTA & Production
  (bootloader signing, provisioning flow, factory test jig, final firmware)

1. Use this template (customize as needed)
2. Enter phases manually
```

→ Store phases in `notes.md ## phases` with `domain: embedded` tag.
</step>

<step name="detect_sessions">
## 1. Detect Previous Sessions

```bash
ls -la docs/brainstorm/session-*.md 2>/dev/null | tail -5
```

Parse results to get list of existing sessions.
</step>

<step name="ask_intent">
## 2. Ask User Intent

**If previous sessions exist:**

> **Adapter-aware prompt:**
> **Claude Code (terminal) — REQUIRED:** Call `AskUserQuestion` tool. Only fall back to text menu if the tool errors or is unavailable. AUQ spec:
>   - question: "Previous brainstorm sessions found. What would you like to do?"
>   - header: "Session"
>   - options: [{ label: "Continue recent session", description: "Resume the most recent session from where it stopped" }, { label: "Review specific session", description: "Choose a particular session to review or continue" }, { label: "New brainstorm session", description: "Start fresh — previous sessions are preserved" }]
>   - multiSelect: false
> **Cursor / Codex / Antigravity / other:** use text menu below

```
I found previous brainstorm sessions:
{list sessions with dates}

What would you like to do?
1. Continue the most recent session
2. Review a specific session
3. Create a new brainstorm session
```

**If no sessions:**
Automatically create a new session.
</step>

<step name="load_context">
## 3. Load Context (if continuing)

If the user chooses to continue:
1. Read the previous session file
2. Summarize content already discussed
3. Identify remaining open questions / action items
4. Continue from the stopping point
5. If the session already has a **`## Phases`** section: briefly summarize existing phases; all subsequent updates must **merge** into that section (no silent deletion) unless the user explicitly requests narrowing/expanding scope.
</step>

<step name="upgrade_gap_detection">
### Step 3B: Upgrade Gap Detection (ENH-067)

**Runs immediately after step 3 (Load Context) when user is continuing an existing session.**

#### Trigger conditions — ALL must be true:
- Session `workflow_version` is absent **OR** older than current ViePilot version
- Session `upgrade_supplement_version` is absent **OR** older than current ViePilot version
- (Prevents re-surfacing already-supplemented topics on subsequent opens)

Resolve current ViePilot version: `node bin/vp-tools.cjs info` → `version` field.

#### Gap computation — version threshold table:

| Introduced in | Topic | Detection heuristic (false-positive guard) |
|--------------|-------|---------------------------------------------|
| v2.32.0 | Topic 6: Admin & Governance (ENH-063) | session has no `## Admin` section AND no `admin:` YAML block |
| v2.33.0 | Topic 7: Content Management (ENH-065) | session has no `## Content` section AND no `content_types:` YAML block |
| v2.34.0 | Topic 8: User Data Management (ENH-066) | session has no `## User Data` section AND no `profile_fields:` YAML block |

Always cross-check: even if the version threshold says a topic should be missing, confirm it
is actually absent from the session file before listing it as a gap. This avoids false positives
for users who added content manually or partially covered the topic under a different heading.

#### Upgrade banner

**Claude Code (terminal) — REQUIRED:**
```
question: "🔄 Upgrade gap detected — session was created with ViePilot v{old}, current is v{new}.\nMissing topics: {comma-separated list}. Discuss these gaps now?"
header: "Upgrade"
options:
  - label: "Yes — discuss now (Recommended)"
    description: "Run Q&A for missing topics inline; append ## Upgrade supplement to session"
  - label: "Remind me at /save"
    description: "Continue session normally; re-surface gap at /save"
  - label: "Skip"
    description: "Ignore gaps for this session"
```

**Text fallback (Cursor / Codex / other):**
```
🔄 Upgrade gap detected (v{old} → v{new})
Missing topics: {list}

1. Discuss gaps now (Recommended)
2. Remind me at /save
3. Skip
```

#### On "Yes — discuss now"

Run only the Q&A sub-questions for each missing topic (re-use the relevant topic block from
**Topics Template** in step 4). After completing Q&A for all missing topics, append the results
to the session file under a clearly delimited section:

```markdown
## Upgrade supplement (v{old} → v{new})
*Added {YYYY-MM-DD} after upgrading ViePilot to v{new}*

### Topic 6: Admin & Governance [include only if this topic was missing]
{Q&A results using Admin & Governance topic format}

### Topic 7: Content Management [include only if this topic was missing]
{Q&A results using Content Management topic format}

### Topic 8: User Data Management [include only if this topic was missing]
{Q&A results using User Data Management topic format}
```

After appending:
1. Set `upgrade_supplement_version: "{current}"` in the session's `## Session Info` block
2. Suggest: "Supplement complete — run `/vp-crystallize --upgrade` to patch your project artifacts"

#### On "Remind at /save"
Store the pending gap list. Re-surface the same AUQ at `/save` before writing the session file.

#### On "Skip"
Proceed normally. Do **not** set `upgrade_supplement_version` — gap will re-surface on next open.
</step>

<step name="brainstorm_mode">
## 4. Brainstorm Mode

### Topics Template
Suggested topics to brainstorm:

1. **Domain Analysis**
   - Project goals
   - User personas
   - Core use cases

2. **Architecture**
   - System components
   - Data flow
   - Technology stack
   - Diagram applicability signals (for crystallize):
     - Service/module count and boundaries
     - Event-driven usage (queues, webhooks, async jobs)
     - Deployment topology (single node vs multi-env / distributed)
     - User journey complexity (single actor/simple flow vs multi-actor)
     - External integration surface (few vs many protocols/services)

3. **Data Model**
   - Core entities
   - Relationships
   - Storage strategy

4. **API Design**
   - Endpoint structure
   - Authentication
   - Real-time requirements

5. **Infrastructure**
   - Deployment strategy
   - Monitoring
   - Scaling

6. **Admin & Governance**
   - Who are the admin personas? (super-admin, org-admin, ops team, support agent)
   - User & Role management? (invite users, deactivate, RBAC/ABAC, permission matrix)
   - Monitoring dashboard? (system health, error rates, latency, active users, SLA targets)
   - Audit log requirements? (which actions must be tracked? retention period? compliance?)
   - Billing & subscription management? (plans, invoices, upgrade/downgrade, payment history)
   - Rate limiting / quota per tier? (API call limits, storage quotas, feature limits)
   - Feature flags / runtime configuration? (kill switches, A/B toggles, env settings)
   - Reporting & data export? (business metrics, usage analytics, CSV/Excel export)
   - Notification management? (email/push templates, delivery log, unsubscribe management)

7. **Admin Entity Management** (ENH-068)
   - Which DB entities / domain objects need admin CRUD interfaces? (e.g., products, orders, categories, tenants, campaigns, bookings…)
   - For each entity: which operations are needed? (Create / Read / Update / Delete / List)
   - **List view** requirements: columns displayed, default sort, pagination style (offset vs. cursor), search & filter fields, range filters (date, price), multi-select filters
   - **Bulk actions**: bulk delete, bulk status change, bulk export — which entities need these?
   - **Create/Edit form**: required vs. optional fields, validation rules, nested relation fields (e.g., product → category), rich text / file upload fields, inline vs. separate page, auto-save / draft mode needed?
   - **Delete semantics**: hard delete vs. soft delete (`is_deleted` / `deleted_at`); cascade rules for related records; restore / undelete capability needed?
   - **Import / Export**: CSV/XLSX import for bulk seeding (e.g., product catalog); export filtered data from list views to CSV/XLSX/JSON; import validation error reporting
   - **Audit trail per entity**: which entities need change history (actor + timestamp + field diff)? Separate audit table vs. event-sourced approach; surfaced in admin UI or log-only?
   - **Admin ownership scoping**: are entities scoped per tenant/org (multi-tenant)? Can org_admin see only their org's data while super_admin sees all?
   - **Read-only vs. editable entities**: which entities are system-generated (read-only in admin) vs. admin/user-generated (editable)?

8. **Content Management**
   - What types of content exist in this system? (articles, products, pages, media, courses, listings, FAQs...)
   - Who creates content? (admin only, verified users, any user, API import)
   - Content lifecycle? (draft → review → published → archived)
   - Rich text or structured fields? (WYSIWYG, markdown, JSON schema, headless CMS API)
   - Media management? (image upload, video, file attachments, CDN, storage limits per plan)
   - Taxonomy & organization? (categories, tags, collections, folders, hierarchical tree)
   - Multi-language / localization? (which locales, translation workflow, fallback strategy)
   - Search & filtering? (full-text search, faceted filters, sort options, relevance tuning)
   - Content versioning / history? (rollback, diff view, scheduled publish, expiry)
   - SEO fields? (slug, meta title, meta description, OG image, canonical URL, sitemap)

9. **User Data Management**
   - What user data does the system store? (profile, preferences, history, uploads)
   - Profile management? (edit name/avatar/email/password, delete account)
   - Notification preferences? (email, push, SMS — per channel and frequency)
   - Privacy & data controls? (view my data, export data, right-to-erasure / GDPR delete)
   - Activity history? (login history, action log, what user can see about themselves)
   - Connected accounts / integrations? (OAuth providers, third-party app connections, revoke access)
   - Session & device management? (active sessions list, sign out all devices)
   - Two-factor authentication? (TOTP, SMS, backup codes)
   - Consent management? (cookie consent, marketing opt-in, terms acceptance log)
   - Data retention policy? (how long data is kept, anonymization after deletion)

10. **Phase assignment (ENH-030):** during brainstorm, each feature/capability is assigned to a specific **phase** — Phase 1, Phase 2, Phase 3... Do not use MVP/Post-MVP/Future tiers. If the user has not stated a phase, ask: “Which phase would you like to assign this feature to?”

### Interactive Q&A
For each topic:
1. Ask specific questions
2. Wait for user response
3. Synthesize and ask follow-up questions
4. Suggest alternatives if needed
5. Record decisions

### Mid-session Structured Choice Rule (BUG-022)

When presenting a decision with **≥2 discrete named options** during Q&A (e.g. "Hero first
or Features section?", "lean into multi-adapter or persona angle?", any numbered choice set),
use adapter-aware prompts:

> **Claude Code (terminal) — REQUIRED:** Call `AskUserQuestion`. AUQ spec:
>   - question: "{The direction/decision question}"
>   - header: "{short label, ≤12 chars}"
>   - options: one entry per discrete choice (2–4 options per AUQ call)
>   - multiSelect: false (unless user explicitly wants multi-select)
> **Cursor / Codex / Antigravity / Copilot:** present as plain numbered list.

**Exempt from AUQ** (remain plain conversational text):
- Open-ended questions with no discrete choices ("Anything else you'd like to add?")
- Follow-up clarification questions ("Tell me more about X")
- Questions where the expected answer is a free-form description

**AUQ per decision, not per topic:** One AUQ call per structured decision point.
Do not bundle multiple unrelated decisions into a single AUQ call.

### Mid-session Transition Prompt Rule (BUG-023)

When the AI offers **session-flow choices** at a section or topic boundary — after presenting
a table, completing an analysis, or finishing a discussion topic — use adapter-aware prompts:

> **Claude Code (terminal) — REQUIRED:** Call `AskUserQuestion`. Canonical AUQ spec:
>   - question: "What would you like to do next?"
>   - header: "Next step"
>   - options (vary by context; always ≥2):
>     - label: "Save session → /vp-crystallize", description: "Generate implementation specs"
>     - label: "Update UI Direction artifacts", description: "Update index.html/notes.md now"
>     - label: "Continue discussing", description: "Explore another section or topic"
>   - multiSelect: false
> **Cursor / Codex / Antigravity / Copilot:** present as plain numbered list.

**Scope:** session-FLOW control choices only — distinct from BUG-022 (Q&A content/direction
decisions during Q&A). Triggered when offering: save/crystallize, update artifacts, or
continue/discuss more. NOT triggered for content questions about what to build or design.

### Landing Page Deep-Dive (activated contextually)
If the user is brainstorming a landing page / homepage / marketing page:

1. Ask follow-up questions to finalize the layout:
   - Main goal of the landing page? (signup, booking demo, download, contact)
   - Primary audience?
   - Visual tone? (minimal, modern, bold, enterprise, playful)
   - Primary CTA and secondary CTA?
2. Present a layout menu for the user to choose from:

> **Adapter-aware prompt:**
> **Claude Code (terminal) — REQUIRED:** Call `AskUserQuestion` tool. Only fall back to text menu if the tool errors or is unavailable. AUQ spec:
>   - question: "Which landing page layout fits your goals and audience?"
>   - header: "Layout"
>   - options: [{ label: "Layout A — Hero centric", description: "Hero + trust logos + features + CTA — best for brand awareness and conversions" }, { label: "Layout B — Problem/Solution", description: "Problem/Solution + social proof + pricing + FAQ — best for SaaS sign-ups" }, { label: "Layout C — Product storytelling", description: "Screenshots + testimonials + final CTA — best for product demos" }, { label: "Layout D — SaaS conversion", description: "Integrations + comparison + onboarding steps — best for tool adoption" }]
>   - multiSelect: false
> **Cursor / Codex / Antigravity / other:** use list below

   - Layout A: Hero centric + trust logos + features + CTA
   - Layout B: Problem/Solution + social proof + pricing + FAQ
   - Layout C: Product storytelling + screenshots + testimonials + final CTA
   - Layout D: SaaS conversion + integrations + comparison + onboarding steps
3. Reference `https://21st.dev` to suggest sections/components suited to the chosen layout.
4. Record clearly in the session:
   - Layout the user chose
   - Component candidates from 21st.dev
   - Reason for choice based on objective + audience

### In-session Research Mode
User can request research inline during brainstorm (no skill switch needed):
- Trigger phrases: "research this", "can you research", "need to research", "find best practice"
- When triggered:
  1. Define research scope (1-3 sentences)
  2. Quickly gather from appropriate sources (official docs, reference sites, patterns)
  3. Return a short summary: findings, trade-offs, recommendation
  4. Return to the current brainstorm topic with a proposed decision

If the assistant notices a topic has high ambiguity or risk of a wrong decision, the assistant should proactively suggest:
`This item should be researched quickly before locking in — would you like me to research it now in this session?`

### UI Direction Mode (design-in-the-loop; FEAT-002 + FEAT-007)
If the user is brainstorming a project with UI/UX or requests a visual design:

**Layout — choose one:**

- **Legacy (single screen):** `.viepilot/ui-direction/{session-id}/index.html` + `style.css` + `notes.md`.
- **Multi-page (multiple screens):** same session directory, add `pages/{slug}.html` for each page; `index.html` is the **hub** (links to every page). `style.css` is shared.

**General rules**

1. Create a direction workspace for the current session (minimum `style.css` + `notes.md`; HTML per chosen layout).
2. Each time the user changes a requirement/layout/component:
   - Update HTML/CSS direction directly
   - Record decision + rationale in `notes.md` (single source of truth for design intent)

### Design Token Extraction (ENH-076)

**Trigger:** UI Direction Mode active (`--ui` flag) OR ≥2 design keywords detected in session:
`color` / `font` / `brand` / `spacing` / `typography` / `palette` / `theme` / `style`

**Extraction process:**
During Q&A, AI tracks design decisions and maps them to a TOKEN_MAP:
- Color mentions → `tokens.colors.*` (primary, surface, accent, error, success, warning)
- Font/typeface mentions → `tokens.typography.fontFamily`, `fontSize`
- Size/scale/rhythm mentions → `tokens.spacing.base`, `tokens.spacing.scale`
- Roundness/corner mentions → `tokens.rounded.*` (sm/md/lg/full)

**Output — `.viepilot/ui-direction/{session-id}/design.md`** (Design.MD v1 spec):
```yaml
---
name: "{project-name}"
description: "{one-line brand description from session}"
colors:
  primary: "{hex}"
  surface: "{hex}"
  accent: "{hex}"
typography:
  fontFamily: "{font}, sans-serif"
  fontSize:
    base: 16
spacing:
  base: 8
  scale: [4, 8, 16, 24, 32, 48]
rounded:
  sm: 4px
  md: 8px
---

## Overview
{Brand personality extracted from session}

## Colors
{Color rationale from session decisions}

## Typography
{Font rationale from session decisions}
```

**notes.md section added** (append to session notes.md):
```yaml
## design_tokens
colors:
  primary: "{hex}"
typography:
  fontFamily: "{font}"
spacing_base: 8
design_md_path: .viepilot/ui-direction/{session-id}/design.md
design_md_generated: true
```

**After generation:** Show inline summary:
```
🎨 Design.MD generated: primary={hex} | font={font} | spacing={n}px
   Path: .viepilot/ui-direction/{session-id}/design.md
```

**Incremental updates:** If user refines a color or font later in the session, update
`design.md` and `notes.md ## design_tokens` in place (same as how `index.html` is updated
incrementally as design decisions evolve).

### Skill Registry Integration (FEAT-020)

**Trigger**: UI Direction Mode is active (at least one HTML file being generated or updated).

**Step — Load registry:**
```bash
node ~/.claude/viepilot/bin/vp-tools.cjs get-registry 2>/dev/null \
  || node ~/.cursor/viepilot/bin/vp-tools.cjs get-registry 2>/dev/null \
  || cat ~/.viepilot/skill-registry.json 2>/dev/null
```
Parse JSON output → extract `skills[]`.
If output is `null` or command fails: skip silently — no warning, no prompt

**Step — Match skills to UI signals:**
Map brainstorm UI signal keywords to capability tags:

| UI Signal keywords | Capability match |
|-------------------|-----------------|
| `component`, `layout`, `screen`, `page`, `UI`, `UX` | `ui-generation`, `component-design` |
| `responsive`, `mobile`, `grid` | `responsive-layout` |
| `design`, `theme`, `color`, `typography` | `design-system`, `design-tokens` |
| `form`, `button`, `input`, `modal` | `component-design` |

For each registered skill: if `skill.capabilities` intersects matched capability tags → skill is **active**.

**Step — Silent apply:**
- For each active skill: prepend `skill.best_practices[]` to the context used for HTML generation
- **No banner, no prompt, no mention to user** — best practices blend into generated output
- This is background-only, like Background UI Extraction (ENH-026)

**Step — Record in notes.md:**
After the session's first UI artifact is generated (or updated), append to `notes.md`:

```yaml
## skills_used
- id: frontend-design
  version: null
  trigger: ui-generation signal
  applied_at: brainstorm-session
  best_practices_applied:
    - Mobile-first
    - Design tokens
```

If `## skills_used` already exists: merge (add new skills, update applied_at).
If no skills matched or registry absent: omit `## skills_used` section.

**Required hook (multi-page only)**

When the `pages/` directory exists or any `pages/*.html` is added / renamed / removed:

- Update the **hub** `index.html` (nav / list of links to all remaining pages).
- Immediately update the **`## Pages inventory`** section in `notes.md` (table: Slug | File | Title | Purpose | Key sections | Nav to) — must match 100% of the current `pages/*.html` file set.
- Do not end a topic / do not consider the UI session “synced” if the inventory diverges from files on disk.

3. If the user sends references/components (including 21st.dev prompts/links), record clearly:
   - reference source
   - the UI area it applies to (page slug if multi-page)
   - adjustments according to product objectives
4. Keep the prototype at a directional description level; do not force production-ready code at the brainstorm stage.

### Recommended Breakdown Ordering (ENH-061)

For sessions that produce both system architecture and UI/UX artifacts, follow this sequence to ensure complete idea→architect+UI breakdown:

```
Step 1: Free idea collection
  → Explore the problem space; no structure required yet

Step 2: Scope lock + Phase assignment  (existing)
  → Assign all features to Phase 1 / Phase 2 / Phase 3...
  → Fill ## Phases in session draft

Step 2B: Workspace Mode Selection  (BUG-018)
  → After scope lock, before any design workspace is created
  → AUQ: Both / Architect only / UI Direction only / Neither

Step 3: Feature → Coverage mapping  (ENH-061)
  → For each Phase 1 feature: name the architect component AND UI screen
  → Output: ## Coverage matrix in notes.md

Step 4: Architect Design  (existing — only when Step 2B selects Both or Architect only)
  → Fill architect workspace per coverage matrix
  → Use /vp-brainstorm --architect or let heuristics fire

Step 5: Architect → UI sync  (ENH-061 — arch_to_ui_sync)
  → After architect edits: check which architectural decisions impact UI screens
  → Prompt user to update UI Direction accordingly

Step 6: UI Direction  (existing — only when Step 2B selects Both or UI Direction only)
  → Fill UI workspace per coverage matrix + arch feedback
  → Use /vp-brainstorm --ui or proactive 🎨 banner

Step 7: Completeness gate  (ENH-061)
  → Validate: every Phase 1 feature has ≥1 coverage (architect OR UI)
  → Warn on any feature with no coverage in both modes

Step 8: /save → /vp-crystallize  (existing)
```

> **Note**: Steps 3–7 are optional for simple or early-stage sessions. The flow is recommended when a session produces both Architect Design and UI Direction artifacts.

### Step 2B: Workspace Mode Selection (BUG-018)

Runs **after scope lock** (`## Phases` in session draft is populated) and **before any design workspace is created**.

> **Claude Code (terminal) — REQUIRED:** Call `AskUserQuestion` tool:
> - question: `"Scope locked. Which design workspaces would you like to activate for this session?"`
> - header: `"Workspaces"`
> - options:
>   - `{ label: "Both Architect + UI Direction (Recommended)", description: "Full coverage: architecture HTML workspace + UI prototype direction per ENH-061 Breakdown Ordering" }`
>   - `{ label: "Architect Design only (🏗️)", description: "System architecture, data-flow, ERD, APIs, decisions HTML workspace" }`
>   - `{ label: "UI Direction only (🎨)", description: "HTML prototype direction for screens/pages" }`
>   - `{ label: "Neither — text-only", description: "Continue as text brainstorm, activate workspaces manually later with --architect or --ui" }`
> - multiSelect: false
>
> **Text fallback (Cursor/Codex/Copilot/Antigravity):**
> ```
> Scope locked. Which design workspaces would you like to activate?
> 1. Both Architect + UI Direction (Recommended) — full coverage per ENH-061
> 2. Architect Design only (🏗️) — HTML architecture workspace
> 3. UI Direction only (🎨) — HTML prototype direction
> 4. Neither — text-only, activate manually later
> ```

**On selection:**
- **"Both"**: activate Architect Mode (Step 4) → arch_to_ui_sync (Step 5) → UI Direction (Step 6) — in that order
- **"Architect Design only"**: activate Architect Mode (Step 4), skip Step 6
- **"UI Direction only"**: skip Architect (Step 4), activate UI Direction (Step 6) directly
- **"Neither"**: skip both Steps 4 and 6; user can activate later with `--architect` / `--ui` flag

**Guard rule (BUG-018 fix):**
- Architect auto-activate heuristic (≥3 components / ≥1 stack mention) **MUST NOT fire independently** once Step 2B runs.
- If heuristic fires **before** scope lock: save the signal, defer prompt until Step 2B.
- If user selects **"Neither"** or **"UI Direction only"** at Step 2B: suppress Architect auto-activate for the remainder of this session.
- If user selects **"Architect Design only"** or **"Both"**: heuristic is redundant — workspace activates per selection, no second prompt.

---

### Architect Design Mode (FEAT-011)

Brainstorm system architecture with live HTML generation — a visual workspace for the user to review, edit, and present before running `/vp-crystallize`.

#### Activation

Activated when **any one** of the following conditions is met:

1. **Explicit flag**: user uses `/vp-brainstorm --architect`
2. **Auto-activate heuristic** (see below)
3. **Architecture topic + complexity threshold**: user selects "Architecture" topic in the brainstorm menu AND (service count ≥3 OR ≥1 tech stack suggestion is made)

**Auto-activate heuristic**: during brainstorm, track:
- **Component/service mentions**: names matching the pattern `{capitalized} Service|API|Module|Layer|Server|Database` (e.g., "UserService", "Payment API", "Data Layer")
- **Stack mentions**: any keyword from the known stack list (React, Node.js, PostgreSQL, Redis, Kafka, AWS, Docker, etc.)

When **≥3 components** OR **≥1 stack suggestion** is mentioned → prompt:

```
🏗️ I noticed you are designing an architecture with multiple components.
Activate Architect Design Mode so I can create an HTML visualization?
1. Yes — create workspace and generate initial HTML
2. No — continue text-only
```

- **Option 1 (Yes)**: create workspace (directory + files), generate initial HTML from content already discussed, continue in Architect Mode.
- **Option 2 (No)**: continue text-only brainstorm; heuristic will not prompt again in this session.

#### Workspace layout

```
.viepilot/architect/{session-id}/
  index.html              # Hub: sidebar nav + tabs → to all sections
  architecture.html       # System diagram (graph TD / C4Context) + component descriptions
  data-flow.html          # High-level service/event flows (sequenceDiagram / flowchart LR)
  decisions.html          # ADR log: Date | Decision | Options | Chosen | Rationale | Status
  tech-stack.html         # Layer-by-layer: frontend, backend, infra, data, DevOps
  tech-notes.html         # 3 columns: Assumptions | Risks | Open Questions
  feature-map.html        # Features with tags: layer, phase, priority, status
  erd.html                # Database ERD: entities, attributes, relationships (erDiagram) — ENH-027
  user-use-cases.html     # User Stories / Use Cases / Actors (flowchart TD) — ENH-028
  sequence-diagram.html   # Per-scenario sequences (sequenceDiagram) — ENH-029
  deployment.html         # Infra, environments, CI/CD pipeline — ENH-029
  apis.html               # Service API listing & design decisions — ENH-029
  admin.html              # Admin & governance capabilities — actor flow, role hierarchy, key operations, audit schema (ENH-063)
  content.html            # Content types, lifecycle state machine, creator roles, taxonomy, media/SEO schema (ENH-065)
  user-data.html          # User-owned data controls — profile fields, privacy rights, session management, 2FA, consent schema (ENH-066)
  style.css               # Shared: dark/light CSS vars, .updated highlight, Mermaid container, responsive nav
  notes.md                # Machine-readable YAML (see schema below)
```

**Mermaid.js** — all diagrams use: `<script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js">`
- `architecture.html` → `graph TD` or `C4Context`
- `data-flow.html` → `sequenceDiagram` or `flowchart LR`
- `feature-map.html` → `mindmap` or `quadrantChart`
- `erd.html` → `erDiagram` (entities, attributes, relationships)
- `user-use-cases.html` → `flowchart TD` (actors → use case bubbles)
- `sequence-diagram.html` → `sequenceDiagram` (per-scenario step-by-step)
- `deployment.html` → `graph TD` (infra) + `flowchart LR` (CI/CD pipeline)
- `apis.html` → no diagram; endpoint tables with HTTP method badges

#### Page Boundary Rules (ENH-029)

| Page | Use when... |
|------|------------|
| `data-flow.html` | High-level service/event flows — which services talk to which |
| `sequence-diagram.html` | Per-scenario step-by-step interactions with exact message order |
| `architecture.html` | Component structure + C4 system context + external integrations |
| `deployment.html` | Infrastructure, environments, ops concerns, CI/CD pipeline |
| `apis.html` | API endpoint design, HTTP methods, request/response contracts |
| `admin.html` | Admin personas, role hierarchy, key admin operations (CRUD users, billing management, audit log schema), access control model |
| `entity-mgmt.html` | Admin entity CRUD matrix: entity name, admin ops (C/R/U/D), soft delete flag, bulk actions, audit trail, multi-tenant scope; import/export summary table (ENH-068) |
| `content.html` | Content types, lifecycle states, creator permission matrix, taxonomy tree, media storage config, SEO field schema |
| `user-data.html` | User-owned data: profile field list, privacy rights matrix (export/erasure), connected OAuth providers, session/device management, 2FA config, consent log schema |

#### Admin & Governance Detection (ENH-063)

**Trigger keywords** (case-insensitive, Vietnamese or English):
> `admin`, `administrator`, `back-office`, `quản trị`, `quản lý người dùng`, `user management`, `role`, `permission`, `phân quyền`, `monitor`, `monitoring`, `giám sát`, `audit log`, `audit trail`, `nhật ký`, `billing`, `subscription`, `gói cước`, `thanh toán`, `rate limit`, `quota`, `feature flag`, `feature toggle`, `report`, `reporting`, `báo cáo`, `analytics`, `phân tích`, `SLA`, `compliance`, `GDPR`, `SOC2`, `alert`, `cảnh báo`, `health check`, `observability`

**Early-session detection:**
At session start, scan initial message for admin keywords. If **≥1 keyword** found → show proactive banner:

> **Adapter-aware prompt:**
> **Claude Code (terminal) — REQUIRED:** Call `AskUserQuestion` tool. AUQ spec:
>   - question: "I noticed your project may involve admin or governance capabilities. Should we discuss Admin & Governance (Topic 6)?"
>   - header: "Admin & Governance"
>   - options: [{ label: "Yes — explore admin panel, user management, monitoring, audit logs", description: "Recommended for multi-user/SaaS projects" }, { label: "Not needed — single-user or admin-free project", description: "" }, { label: "Later — add to notes, continue current topic", description: "" }]
>
> **Text fallback:**
> ```
> 🔐 I noticed your project may involve admin or governance capabilities.
> Should we discuss Admin & Governance (Topic 6)?
>
> 1. Yes — explore admin panel, user management, monitoring, audit logs (Recommended for multi-user/SaaS)
> 2. Not needed — single-user or admin-free project
> 3. Later — add to notes, continue current topic
> ```

**During-session detection:**
When **≥2 unique admin keywords** detected → surface confirmation:

> **Claude Code (terminal) — REQUIRED:** Call `AskUserQuestion`:
>   - question: "Admin/governance signals detected in this session. Would you like to cover Admin & Governance (Topic 6)?"
>   - options: [{ label: "Yes — switch to / add admin topic", description: "" }, { label: "Note in background (no topic switch)", description: "" }, { label: "Skip for this session", description: "" }]
>
> **Text fallback:** `🔐 Admin/governance signals detected. Cover Admin & Governance (Topic 6)? 1. Yes 2. Note in background 3. Skip`

**Admin coverage gate before /save:**
Before writing session file, check:
- Project has multi-user signals (`role`, `team`, `organization`) OR
- SaaS/paid product signals (`subscription`, `billing`, `plan`) OR
- Compliance signals (`audit`, `GDPR`, `SOC2`)

If ANY detected AND `## admin` YAML section not present in notes.md:

> **Text fallback:**
> ```
> ⚠️ Admin gap detected: project has multi-user/SaaS/compliance signals but Admin & Governance was not covered.
> 1. Add admin topic now (go to Topic 6)
> 2. Add note to backlog (".viepilot/requests/ENH-admin-tbd.md")
> 3. Dismiss — skip admin for this session
> ```
> (Non-blocking — user can dismiss)

**admin.html trigger:** admin keyword detected in session AND Architect Mode is active → create/update `admin.html`.

#### Content Management Detection (ENH-065)

**Trigger keywords** (case-insensitive, Vietnamese or English):
> `article`, `blog`, `post`, `product`, `catalog`, `listing`, `page`, `landing page`, `content`, `nội dung`, `bài viết`, `sản phẩm`, `danh mục`, `CMS`, `headless`, `media`, `upload`, `image`, `video`, `category`, `tag`, `taxonomy`, `search`, `SEO`, `slug`, `WYSIWYG`, `markdown`, `template`, `course`, `lesson`, `knowledge base`, `FAQ`, `documentation`, `docs`

**Early-session detection:**
At session start, scan initial message for content keywords. If **≥1 keyword** found → show proactive banner:

> **Adapter-aware prompt:**
> **Claude Code (terminal) — REQUIRED:** Call `AskUserQuestion` tool. AUQ spec:
>   - question: "I noticed your project may involve content management capabilities. Should we discuss Content Management (Topic 7)?"
>   - header: "Content Mgmt"
>   - options: [{ label: "Yes — explore content types, lifecycle, media, search, SEO", description: "Recommended for blogs, eCommerce, SaaS, LMS, marketplace" }, { label: "Not needed — no content layer in this project", description: "" }, { label: "Later — add to notes, continue current topic", description: "" }]
>
> **Text fallback:**
> ```
> 🗂️ I noticed your project may involve content management capabilities.
> Should we discuss Content Management (Topic 7)?
>
> 1. Yes — explore content types, lifecycle, media, search, SEO (Recommended for blogs, eCommerce, SaaS, LMS, marketplace)
> 2. Not needed — no content layer in this project
> 3. Later — add to notes, continue current topic
> ```

**During-session detection:**
When **≥2 unique content keywords** detected → surface confirmation:

> **Claude Code (terminal) — REQUIRED:** Call `AskUserQuestion`:
>   - question: "Content management signals detected in this session. Would you like to cover Content Management (Topic 7)?"
>   - options: [{ label: "Yes — switch to / add content topic", description: "" }, { label: "Note in background (no topic switch)", description: "" }, { label: "Skip for this session", description: "" }]
>
> **Text fallback:** `🗂️ Content management signals detected. Cover Content Management (Topic 7)? 1. Yes 2. Note in background 3. Skip`

**Content coverage gate before /save:**
Before writing session file, check:
- Project has content-type signals (`article`, `product`, `post`, `page`, `listing`, `course`) OR
- Media signals (`upload`, `image`, `video`, `media`, `CDN`) OR
- SEO/search signals (`SEO`, `slug`, `search`, `facets`)

If ANY detected AND `## content` YAML section not present in notes.md:

> **Text fallback:**
> ```
> ⚠️ Content gap detected: project has content-type/media/SEO signals but Content Management was not covered.
> 1. Add content topic now (go to Topic 7)
> 2. Add note to backlog (".viepilot/requests/ENH-content-tbd.md")
> 3. Dismiss — skip content management for this session
> ```
> (Non-blocking — user can dismiss)

**content.html trigger:** content keyword detected in session AND Architect Mode is active → create/update `content.html`.

#### User Data Management Detection (ENH-066)

**Trigger keywords** (case-insensitive, Vietnamese or English):
> `profile`, `account`, `settings`, `preferences`, `notification`, `privacy`, `GDPR`, `data export`, `delete account`, `logout`, `session`, `device`, `2FA`, `two-factor`, `OAuth`, `login history`, `user data`, `personal data`, `tài khoản`, `hồ sơ`, `cài đặt`, `thông báo`, `quyền riêng tư`, `lịch sử`, `xóa tài khoản`, `đăng xuất`, `consent`, `cookie`

**Early-session detection:**
At session start, scan initial message for user data keywords. If **≥1 keyword** found → show proactive banner:

> **Adapter-aware prompt:**
> **Claude Code (terminal) — REQUIRED:** Call `AskUserQuestion` tool. AUQ spec:
>   - question: "I noticed your project may involve user data management capabilities. Should we discuss User Data Management (Topic 8)?"
>   - header: "User Data"
>   - options: [{ label: "Yes — explore profile, privacy controls, 2FA, sessions", description: "Recommended for B2C apps, SaaS, apps with GDPR requirements" }, { label: "Not needed — no user data layer in this project", description: "" }, { label: "Later — add to notes, continue current topic", description: "" }]
>
> **Text fallback:**
> ```
> 👤 I noticed your project may involve user data management capabilities.
> Should we discuss User Data Management (Topic 8)?
>
> 1. Yes — explore profile, privacy controls, 2FA, sessions (Recommended for B2C apps, SaaS, GDPR)
> 2. Not needed — no user data layer in this project
> 3. Later — add to notes, continue current topic
> ```

**During-session detection:**
When **≥2 unique user data keywords** detected → surface confirmation:

> **Claude Code (terminal) — REQUIRED:** Call `AskUserQuestion`:
>   - question: "User data management signals detected in this session. Would you like to cover User Data Management (Topic 8)?"
>   - options: [{ label: "Yes — switch to / add user data topic", description: "" }, { label: "Note in background (no topic switch)", description: "" }, { label: "Skip for this session", description: "" }]
>
> **Text fallback:** `👤 User data management signals detected. Cover User Data Management (Topic 8)? 1. Yes 2. Note in background 3. Skip`

**User data coverage gate before /save:**
Before writing session file, check:
- Project has user-account signals (`profile`, `account`, `settings`, `login`) OR
- Privacy signals (`GDPR`, `privacy`, `data export`, `delete account`) OR
- Auth/session signals (`2FA`, `session`, `OAuth`, `connected accounts`)

If ANY detected AND `## user_data` YAML section not present in notes.md:

> **Text fallback:**
> ```
> ⚠️ User data gap detected: project has user-account/privacy/auth signals but User Data Management was not covered.
> 1. Add user data topic now (go to Topic 8)
> 2. Add note to backlog (".viepilot/requests/ENH-user-data-tbd.md")
> 3. Dismiss — skip user data management for this session
> ```
> (Non-blocking — user can dismiss)

**user-data.html trigger:** user data keyword detected in session AND Architect Mode is active → create/update `user-data.html`.

#### Admin Entity Management Detection (ENH-068)

**Trigger keywords** (case-insensitive, Vietnamese or English):
> `CRUD`, `entity`, `table`, `manage`, `list view`, `admin panel`, `data management`, `import`, `export`, `bulk`, `soft delete`, `audit trail`, `quản lý dữ liệu`, `bảng dữ liệu`, `danh sách`, `thêm sửa xóa`

**Early-session detection:**
At session start, scan initial message for entity management keywords. If **≥1 keyword** found → show proactive banner:

> **Adapter-aware prompt:**
> **Claude Code (terminal) — REQUIRED:** Call `AskUserQuestion` tool. AUQ spec:
>   - question: "I noticed your project may involve admin data management. Should we discuss Admin Entity Management (Topic 7)?"
>   - header: "Entity Mgmt"
>   - options: [{ label: "Yes — explore CRUD, list views, bulk ops, import/export, audit trail", description: "Recommended for projects with DB entities managed via admin panel" }, { label: "Not needed — no admin CRUD interface in this project", description: "" }, { label: "Later — add to notes, continue current topic", description: "" }]
>
> **Text fallback:**
> ```
> 🗄️ I noticed your project may involve admin data management.
> Should we discuss Admin Entity Management (Topic 7)?
>
> 1. Yes — explore CRUD, list views, bulk ops, import/export, audit trail (Recommended)
> 2. Not needed — no admin CRUD interface in this project
> 3. Later — add to notes, continue current topic
> ```

**During-session detection:**
Maintain a running count of unique entity management keywords encountered during the session.
At ≥2 unique keywords → show soft prompt at next topic boundary (same format as above).
Does not interrupt mid-topic conversation.

**Coverage gate before /save:**

If `## erd` YAML is present in architect `notes.md` OR `erd.html` is in the workspace
AND session has no `## Admin Entity Management` / `## entity_mgmt` coverage:

> **Claude Code (terminal):** AUQ:
>   - question: "🗄️ Entity management gap — your project has DB entities defined but admin CRUD coverage was not discussed. Add now?"
>   - options: [{ label: "Add entity management topic now", description: "Go to Topic 7" }, { label: "Add note to backlog", description: "Log as .viepilot/requests/ENH-entity-mgmt-tbd.md" }, { label: "Dismiss", description: "Skip entity management for this session" }]
>
> **Text fallback:**
> ```
> 🗄️ Entity management gap — your project has DB entities but no admin CRUD coverage defined.
> 1. Add entity management topic now (go to Topic 7)
> 2. Add note to backlog (".viepilot/requests/ENH-entity-mgmt-tbd.md")
> 3. Dismiss — skip entity management for this session
> ```
> (Non-blocking — user can dismiss)

**entity-mgmt.html trigger:** entity management keyword detected in session AND Architect Mode is active → create/update `entity-mgmt.html`.

---

#### Embedded Domain Architect Pages (ENH-071 Gaps 1, 4, 5, 8)

All 6 pages below are only created when **`embedded_domain: true`** AND Architect Mode is active. Each page follows the standard workspace pattern: create HTML in `.viepilot/architect/{session-id}/`, link in `index.html` nav under an **Embedded** section, update `## Pages inventory` in `notes.md`.

---

##### `hw-topology.html` — Hardware Topology (Gap 1)

**Trigger**: Always created when `embedded_domain: true` AND Architect Mode activates.

**Content**:
- Mermaid `graph TD` block diagram: MCU node connected to external ICs/sensors/actuators via labeled bus arrows (bus type + speed on arrow label)
- Component table: Part | Type | Interface | Bus Speed | Notes
- Power rails table: Rail | Source | Voltage | Max current (mA)

**notes.md YAML section**:
```yaml
## hw_topology
mcu:
  family: ""        # e.g. STM32F4, ESP32-S3
  core: ""          # e.g. Cortex-M4 @168MHz
  flash_kb: 0
  ram_kb: 0
peripherals: []     # on-chip peripherals: [{ name, type, instance }]
external_ics: []    # [{ name, type, interface, bus_speed, notes }]
buses: []           # [{ type: SPI|I2C|UART|CAN|USB, speed, devices: [] }]
power_rails: []     # [{ rail, source, voltage_v, max_ma }]
```

---

##### `pin-map.html` — GPIO/Pin Assignment (Gap 4)

**Trigger**: GPIO / pin / pinout / assignment / alternate function keywords AND `embedded_domain: true` OR when `hw-topology.html` is created (auto-companion).

**Content**:
- Pin assignment table: Pin# | GPIO Name | Alt Function | Peripheral | Direction (IN/OUT/AF) | Pull (Up/Down/None) | Voltage Level | Notes
- Conflict detection: if two rows share the same GPIO name with conflicting functions → highlight row in red and note conflict

**notes.md YAML section**:
```yaml
## pin_map
pins: []        # [{ pin_num, gpio_name, function, peripheral, direction, pull, voltage_v, notes }]
conflicts: []   # auto-detected: [{ gpio_name, conflicting_functions: [] }]
```

---

##### `memory-layout.html` — Memory Partitioning (Gap 5)

**Trigger**: flash / RAM / memory / linker / bootloader / OTA / partition / NVS / EEPROM keywords AND `embedded_domain: true`.

**Content**:
- Flash regions table: Region | Start Address | Size (KB) | Usage | Notes
- RAM regions table: Region | Start Address | Size (KB) | Usage | Notes
- Linker constraint notes: stack size, heap size, section alignment, placement constraints
- OTA layout diagram (simple text diagram) when OTA mentioned

**notes.md YAML section**:
```yaml
## memory_layout
flash_total_kb: 0
ram_total_kb: 0
flash_regions: []   # [{ name, start_hex, size_kb, usage, notes }]
ram_regions: []     # [{ name, start_hex, size_kb, usage, notes }]
linker_notes: ""
```

---

##### `protocol-matrix.html` — Communication Protocol Matrix (Gap 8)

**Trigger**: CAN / I2C / SPI / UART / RS-485 / BLE / Wi-Fi / LoRa / LoRaWAN / MQTT / Modbus / CANopen / USB / Zigbee keywords AND `embedded_domain: true`.

**Content** (distinct from `apis.html` which covers HTTP REST):
- Bus protocol table: Protocol | Role (master/slave/both) | Speed | Topology | Connected Devices | Notes
- Wireless/external table: Protocol | Role | Endpoint/Broker | QoS/Notes
- Note at top: "Embedded bus & wireless protocols — see `apis.html` for HTTP REST endpoints (if applicable)"

**notes.md YAML section**:
```yaml
## protocols
bus_protocols: []   # [{ name, role, speed, topology, devices: [], notes }]
wireless: []        # [{ protocol, role, endpoint, notes }]
```

**Coexistence rule**: If the project also has a cloud API (HTTP/REST), both `protocol-matrix.html` AND `apis.html` exist in the workspace — they are separate artifacts.

---

##### `rtos-scheduler.html` — RTOS & Task Scheduler (Gap 3 visual)

**Trigger**: RTOS / FreeRTOS / Zephyr / ThreadX / task / scheduler / semaphore / queue / ISR / interrupt priority keywords AND `embedded_domain: true`.

**Content**:
- Task table: Task Name | Priority | Period or Event | Stack KB | State | Notes
- ISR table: Interrupt Source | Handler Function | Priority | Shared Resources | Notes
- Mermaid `stateDiagram-v2` for key task state transitions (only if ≤5 tasks — omit if larger)
- Shared resource matrix: Resource | Protected by | Tasks using it

**notes.md**: uses `## rtos_config` section written by Task 106.1 probes (no new section — extends same YAML).

---

##### `power-budget.html` — Power Budget (Gap 7 visual)

**Trigger**: battery / sleep / power / current / µA / mAh / Standby / Stop / Shutdown / Hibernate / LoRa / IoT keywords AND `embedded_domain: true`.

**Content**:
- Power modes table: Mode | MCU state | Active peripherals | Typical current (µA/mA) | Wake-up sources
- Battery life estimate: Duty cycle % | Avg current (mA) | Capacity (mAh) | Runtime (days) formula
- Power rail summary (linked from `hw-topology` if available)

**notes.md**: uses `## power_budget` section written by Task 106.1 probes (no new section — extends same YAML).

---

#### Embedded Workspace Layout (ENH-071)

When `embedded_domain: true` and Architect Mode is active, the `index.html` hub includes an **Embedded** nav section after the standard pages:

```html
<!-- Embedded section (only shown when embedded_domain: true) -->
<a href="hw-topology.html">🔌 HW Topology</a>
<a href="pin-map.html">📌 Pin Map</a>
<a href="memory-layout.html">🗺️ Memory Layout</a>
<a href="protocol-matrix.html">📡 Protocol Matrix</a>
<a href="rtos-scheduler.html">⏱️ RTOS Scheduler</a>
<a href="power-budget.html">🔋 Power Budget</a>
```

Pages are only linked when they have been created (missing pages are omitted from nav).

#### Sequence trigger keywords (ENH-029)
When the user mentions: `scenario`, `step by step`, `login flow`, `checkout flow`, `detailed interaction`, `sequence`, `interaction diagram` → update `sequence-diagram.html` + update `notes.md ## sequences` section.

#### Deployment trigger keywords (ENH-029)
When the user mentions: `deploy`, `deployment`, `infrastructure`, `infra`, `environment`, `staging`, `production`, `prod`, `AWS`, `GCP`, `Azure`, `Docker`, `Kubernetes`, `k8s`, `CI/CD`, `pipeline`, `server`, `hosting`, `cloud` → update `deployment.html` + update `notes.md ## deployment` section.

#### APIs trigger keywords (ENH-029)
When the user mentions: `endpoint`, `API`, `REST`, `GraphQL`, `gRPC`, `route`, `HTTP`, `POST`, `GET`, `PUT`, `DELETE`, `PATCH`, `request`, `response`, `payload`, `auth header` → update `apis.html` + update `notes.md ## apis` section.

#### ERD trigger keywords (ENH-027)
When the user mentions any keyword: `database`, `entity`, `table`, `schema`, `relation`, `relationship`, `foreign key`, `primary key`, `ERD`, `data model`, `normalization` → update `erd.html` + update `notes.md ## erd` section.

#### Use Case trigger keywords (ENH-028)
When the user mentions: `user story`, `use case`, `actor`, `persona`, `as a user`, `user flow`, `workflow`, `journey`, `role`, `permission` → update `user-use-cases.html` + update `notes.md ## use_cases` section.

#### Dialogue cadence

1. After each **major decision** (tech stack, service boundary, data model) → update the related HTML section + update `notes.md`.
2. When the user **changes a decision** → **incremental update**: only edit the related section; keep all other sections unchanged. Add `data-updated="true"` attribute + class `.updated` CSS highlight (yellow left border + "updated" badge) to the changed element.
3. **`/review-arch`** command → ViePilot outputs a summary table of all `decisions` (from `notes.md`) + list of `open_questions` with status; ask the user to confirm before continuing.

#### Incremental update rule

When a decision changes:
- Identify the **related HTML file** (e.g., tech stack change → only edit `tech-stack.html` + `architecture.html`).
- Do **not** regenerate the entire workspace.
- Add `data-updated="true"` to the changed `<section>` or `<tr>`.
- Update `notes.md` YAML (`updated` date + corresponding entry).
- Preserve `decisions.html` history — only add new rows or update the `status` field (do not delete history).

#### Architect Item Actions (ENH-033)

Each item in the Architect HTML workspace has a stable ID in the format `[ARCH:{page-slug}:{item-id}]`
(e.g., `[ARCH:decisions:D1]`, `[ARCH:erd:E2]`, `[ARCH:apis:A4]`).

Two buttons appear on hover next to each item in the HTML:
- **✅ Approve** — copies: `[ARCH:{slug}:{id}] APPROVE — "{title}" on {slug} page. No changes needed.`
- **✏️ Edit** — copies: `[ARCH:{slug}:{id}] EDIT — "{title}" on {slug} page. Current: "{excerpt}". What should I change?`

**When you receive an APPROVE prompt:**
- Confirm the item is accepted as-is.
- Do NOT touch any other item or page.
- Ask if the user wants to continue reviewing other items.

**When you receive an EDIT prompt:**
- Acknowledge the item by its full ID (`[ARCH:{slug}:{id}]`).
- State what the current content is.
- Ask the user what they want to change.
- Apply the change only to that specific item on that specific page.

**ISOLATION RULE — CRITICAL:**
Each action is **strictly scoped** to the named page and item.

- Approving `[ARCH:architecture:C2]` does **NOT** approve any item in `erd`, `apis`, `decisions`, or any other page.
- Editing `[ARCH:decisions:D1]` does **NOT** trigger updates to `architecture`, `erd`, or any other page unless the user explicitly asks for cross-page follow-up.
- **Never infer or cascade approval/edit across pages.** Each page is an independent artifact namespace.
- Cross-page impacts (e.g., "this decision affects the ERD") must come from a **separate, explicit** user prompt after the first action is complete.

#### notes.md YAML schema

```yaml
---
session_id: {id}
project: {name}
created: {date}
updated: {date}
---
## decisions
- id: D001
  topic: Database choice
  options: [PostgreSQL, MongoDB, DynamoDB]
  chosen: PostgreSQL
  rationale: ACID compliance needed for financial data
  status: decided  # decided | open | deferred

## open_questions
- id: Q001
  question: Caching layer Redis hay Memcached?
  context: High read traffic expected
  due: before crystallize

## tech_stack
  frontend: React + TypeScript
  backend: Node.js + Express
  database: PostgreSQL
  infra: AWS ECS + RDS
  devops: GitHub Actions + Terraform

## erd
entities:
  - name: User
    attributes: [id, email, name, created_at]
    primary_key: id
  - name: Order
    attributes: [id, user_id, total, status]
    primary_key: id
    foreign_keys:
      - user_id → User.id
relationships:
  - from: User
    to: Order
    type: one-to-many
    label: places

## use_cases
actors:
  - name: Guest
    role: Unauthenticated visitor
  - name: User
    role: Registered member
user_stories:
  - id: US001
    as_a: User
    i_want: to register an account
    so_that: I can access premium features
    priority: must-have
    status: open

## apis
style: REST  # REST | GraphQL | gRPC | WebSocket
services:
  - name: "{Service 1}"
    endpoints:
      - method: GET
        path: /api/resource
        auth: true
        notes: "{notes}"
      - method: POST
        path: /api/resource
        auth: true
        notes: "{notes}"
design_decisions:
  - decision: Authentication
    choice: "{JWT / Session / OAuth2 / API Key}"
    rationale: "{rationale}"

## admin
admin_personas:
  - id: super_admin
    capabilities: [user_management, billing, system_config, audit_log_view]
  - id: org_admin
    capabilities: [invite_users, role_assign, reporting]
capabilities:
  - id: user_management
    required: yes
    phase: 2
    notes: invite, deactivate, RBAC
  - id: audit_log
    required: yes
    phase: 3
    notes: all write ops, 90-day retention
  - id: monitoring_dashboard
    required: optional
    phase: 3
    notes: error rate, latency, active users
  - id: billing_management
    required: no
    phase: ~
    notes: not in scope

## content
content_types:
  - id: article
    created_by: [admin, author]
    lifecycle: [draft, review, published, archived]
    fields: [title, body_rich_text, slug, tags, seo_meta]
    phase: 2
  - id: product
    created_by: [admin]
    lifecycle: [draft, published, discontinued]
    fields: [name, description, price, images, category]
    phase: 1
media:
  storage: S3  # S3 | GCS | Azure Blob | local
  cdn: CloudFront
  types: [image, pdf]
  max_size_mb: 10
localization:
  locales: [en]
  fallback: en
search:
  engine: postgres_fts  # postgres_fts | Elasticsearch | Algolia | Typesense
  full_text: yes
  facets: [category, tags]

## user_data
profile_fields:
  - name
  - email
  - avatar_url
  - timezone
  - locale
settings_categories:
  - id: notifications
    channels: [email, push, in_app]
    frequency: [immediately, daily_digest, weekly]
  - id: privacy
    fields: [data_visibility, analytics_opt_out]
privacy_rights:
  data_export: yes
  right_to_erasure: yes
  data_retention_days: 730
connected_accounts:
  - provider: google
    scope: [email, profile]
  - provider: github
    scope: [read:user, user:email]
session_management:
  multi_session: yes
  show_active_devices: yes
  force_logout_all: yes
two_factor:
  totp: yes
  sms: no
  backup_codes: yes

## entity_mgmt
entities:
  - name: product
    admin_crud: [create, read, update, delete]
    soft_delete: yes
    bulk_actions: [export, status_change]
    audit_trail: yes
    scoped_by: org
  - name: order
    admin_crud: [read, update]
    soft_delete: no
    bulk_actions: [export]
    audit_trail: yes
    scoped_by: org
import_export:
  csv_import: [product]
  csv_export: [product, order, user]

## architect_sync
- synced_at: "{ISO datetime}"
  source_session: "{ui-direction session-id}"
  trigger: "end-of-session | /sync-arch"
  changes:
    - page: "{slug}"
      item_id: "{data-arch-id}"
      action: "updated | added"
      change: "{brief description, ≤80 chars}"
```

### Background UI Extraction (silent mode) — ENH-026

Runs **silently** in every brainstorm session (no `--ui` flag required). Does not interrupt the main conversation.

#### Signal keywords
When the assistant detects any keyword (case-insensitive, Vietnamese or English) in the user's message or session summary:

> `màu`, `màu sắc`, `color`, `layout`, `màn hình`, `screen`, `page`, `trang`, `button`, `nút`, `form`, `biểu mẫu`, `mobile`, `responsive`, `giao diện`, `UI`, `UX`, `design`, `dashboard`, `sidebar`, `header`, `footer`, `modal`, `popup`, `icon`, `theme`, `typography`, `font`, `spacing`, `grid`, `card`, `component`, `hero`, `banner`

#### Embedded Domain UI Suppression (ENH-071 Gap 6)

**Before adding any keyword to the UI buffer**, check if `embedded_domain: true`.

If `embedded_domain: true` AND keyword is a display/screen word (`display`, `screen`, `LCD`, `OLED`, `TFT`, `touch`):

1. Check for **hardware context counter-keywords** in the same message or nearby context:
   - Hardware indicators: `GPIO`, `SPI`, `I2C`, `driver`, `framebuffer`, `ILI9341`, `SSD1306`, `ST7789`, `HX8357`, `RA8875`, `E-Ink`, `EPD`, `7-segment`, `LVGL`, `u8g2`, `resolution`, `pixel`, `backlight`, `contrast`, `init sequence`

2. **If hardware context confirmed**:
   - Do NOT add to `ui_idea_buffer[]`
   - Add as peripheral to `hw_topology_buffer[]` instead: `{ type: "display", interface: "SPI/I2C/parallel", part: "{detected_part_if_any}" }`
   - Log silently: "Display keyword suppressed from UI Direction → added to hw-topology peripherals"

3. **If ambiguous** (no hardware counter-keywords, could be web dashboard):
   - Add to `ui_idea_buffer[]` normally with note: `"context: may be hardware display — verify"`

4. **Early-session UI Direction banner (ENH-060) suppression**:
   - If `embedded_domain: true` AND all accumulated display signals have hardware context → **suppress** the `🎨 UI Direction Mode?` banner entirely
   - Replace with a one-time note: `"Hardware displays detected — will appear in hw-topology page"`
   - If signals are mixed (some hardware, some ambiguous) → show banner but prepend: `"⚠️ Embedded context detected — confirm if this is a web/mobile UI or hardware display"`

#### Early-session detection (ENH-060)
At the very start of a brainstorm session, scan the user's **initial message** for UI/UX signal keywords. If **≥1 keyword** is found AND `embedded_domain` is NOT active, show the proactive activation banner **immediately** (before topic selection):

```
🎨 I noticed your project involves UI/UX design.
Would you like to activate UI Direction Mode? I can generate an HTML prototype direction alongside our brainstorm.

1. Yes — activate UI Direction Mode (create .viepilot/ui-direction/{session-id}/)
2. Save ideas to notes only (background, no HTML yet)
3. No — continue brainstorm without UI Direction
```

This mirrors **Architect Design Mode** which proactively banners when system architecture heuristics fire.

#### Threshold & accumulation rule
- **Count unique keyword occurrences** during the ongoing session.
- When **≥1 signal occurrence** is detected: begin **silent accumulation** — record UI ideas into a `ui_idea_buffer[]` in the session context.
- **Non-blocking**: does not interrupt the main conversation, does not ask for user confirmation immediately.
- Each buffer entry records: keyword trigger, utterance context (short summary ≤20 words).

#### Surface triggers (when to ask the user)
Display a confirmation dialogue when any of the following conditions occur:
- (a) **Topic ends** — user types `/topic` to switch to a new topic or says "next"
- (b) **User types `/save` or `/review`**
- (c) **≥2 unique signals accumulated** in the buffer

#### Confirmation dialogue template
```
🎨 I noticed UI/UX design ideas in this session:
- {idea 1 extracted from buffer}
- {idea 2 extracted from buffer}
...

Would you like to activate UI Direction Mode?
1. Save to .viepilot/ui-direction/{session-id}/notes.md (background, no HTML yet)
2. Save + activate UI Direction Mode (create .viepilot/ui-direction/{session-id}/, generate HTML direction)
3. No — discard and continue brainstorming
```

**Option 1**: Write `## Background extracted ideas` to `.viepilot/ui-direction/{session-id}/notes.md` (create file/directory if not yet present). Clear buffer. Continue.

**Option 2**: Write to notes.md (same as Option 1) **+ fully trigger the `### UI Direction Mode` workflow** (create `index.html`, `style.css`). Clear buffer. Continue in UI Direction Mode.

**Option 3**: Keep buffer unchanged (do not clear, do not write). Continue brainstorm. Re-surface at the next trigger.

#### Auto-write path (Option 1 + 2)
```bash
mkdir -p .viepilot/ui-direction/{session-id}
# Append to notes.md (create if missing):
# ## Background extracted ideas
# - {idea from buffer, with source context}
```

### UI Direction — UX walkthrough & upgrade (FEAT-010)

When inside **`/vp-brainstorm --ui`** or a `.viepilot/ui-direction/{session-id}/` already exists for the current session, the user can invoke:

- **`/research-ui`** — runs the full pipeline below
- **`/research ui`** — **alias** of `/research-ui` (space after `research`; does not conflict with `/research {free topic}`)

The user can include one line of context (e.g., product name **Trips**, persona, priority flow) — entered in the same message as the command.

Apply **the phases sequentially** (assistant does not skip a phase unless the user explicitly says “phase 1 only”):

#### Phase 1 — Simulate end user

1. Role-play as the **end user** using the prototype (get app name / main screen from `notes.md`, HTML, or user prompt).
2. List **3–8 specific scenarios** (e.g., first app launch, completing the main task, edge case errors) — prioritize the correct page if multi-page (`pages/*.html`).
3. For each scenario: describe **behavior** (imagined reading/clicking on the current UI) → record **pain**: ambiguity, missing feedback, too many steps, mismatch with mental model, mobile/a11y concerns, etc.
4. Synthesize **Voice of pseudo-user** (bullets + severity **low / medium / high**).
5. **Content stress & layout overflow pass (content stress pass)** — *required in every `/research-ui` run*: after happy/edge behavior, simulate **boundary data** on each key screen/page (or the full hub if single-screen). Consider at minimum **3–6 of the following categories** (choose those relevant to product context; skip inapplicable ones but **note “N/A + reason”**):
   - **Long copy**: headline, subtitle, CTA, input placeholder, tooltip, breadcrumb, long place/person names (Unicode), long emails/URLs.
   - **Volume**: lists/grids with **many elements**, multi-column/row tables, stacked tags/badges, notification stacks, calendars with many events.
   - **Numbers & formats**: very large/small monetary values, long units, time zones/locales (if the product supports them).
   - **Error / validation states**: long error messages, multiple simultaneous errors, inline + banner.
   - **Empty vs fully packed**: no data vs max items; skeleton vs flash of long content.
   - **Viewport**: same stress on **narrow** (mobile) and **wide** (desktop) if the prototype targets multiple screen sizes.

   **Stress recipes by archetype (ENH-020)** — after applying the checklist above, **lock in 1–2 archetypes** that match the product (from `notes.md` / HTML / user) and apply **at least two recipes** from each selected row (may be rephrased in the session language; **note the archetype** in Stress findings):

   | Archetype | Stress priorities (suggested recipes) | Notes |
   |-----------|---------------------------------------|-------|
   | **Landing / marketing** | Hero **headline** very short vs very long; **pricing** 3–5 tiers + long feature list per tier; **FAQ** 10–20 items (accordion/stack); **logo / social proof** row of 8–15 logos + long names | Sticky CTA vs long content; section order when overflow |
   | **App shell / SaaS admin** | **Table** many columns + many rows; **filter bar** chip + dropdown overflow; **sidebar** multi-level; **notification** stack / toast overlap | Dense vs comfortable state; frozen column |
   | **Form-heavy / wizard** | Long **label + hint**; **multi-step** 5–7 steps + long breadcrumb; **errors** inline per field + global banner; expandable **optional fields** block | Tab order, submit disabled ambiguity |
   | **Content / reader** | Very long **article**; wide **code block**; **TOC** 20–40 headings; **related** 8–15 cards | Max line length, sidenote, mobile reading |
   | **Commerce / booking / marketplace** | Dense search results **grid**; **price** + long unit + discount; **date/time** + time zone + DST; **seat/room booking** + long availability text | Cart / summary on mobile |

   Hybrid (e.g., marketing + app): **merge recipes** from relevant rows; avoid repeating the same meaningless stress on two identical screens.

   For prototypes with only short sample content: **no requirement** to edit files immediately in Phase 1 — instead **describe assumptions** (“if the title is 120 characters…”) and how the UI would **overflow, ellipsis, scroll, overlap, wrap poorly**.
6. Also synthesize **Stress findings** (bullets: stress type → observation → severity **low/medium/high**) and merge into the Phase 1 summary for Phase 2.

#### Phase 2 — UX designer + research

1. Switch role: **UX/UI designer** receiving feedback from Phase 1 (**including Stress findings**).
2. Map pain → **design root cause** (short heuristic, missing/incorrect pattern); **prioritize** P0 / P1 / P2 — **prioritize P0** if content stress causes **information loss, mis-clicks, or unusability** (overflow covering CTA, truncated meaningful text, table overflow unreadable).
3. **Web research**: when benchmarking or industry-standard patterns are needed, run **1–3 queries** (search) → summarize source, takeaway, trade-off.
4. **Propose specific improvements** (UI components, copy, layout, flow) tied to file/page (`slug` if multi-page).

#### Phase 3 — Update artifacts

1. Edit **`index.html`**, **`pages/*.html`**, **`style.css`** per P0 → P1 within the session scope (prototype direction, no forcing production code).
2. In **`notes.md`**, add or append a **`## UX walkthrough log`** section (one entry per command run): date/scenarios simulated, main pains, **Stress findings** (summary), research links (if any), **intent diff** (bullets), files changed. *Optional:* adjust HTML with **long placeholder/copy** or add a **demo row** to illustrate stress discussed (record in log).
3. **Multi-page**: after editing a page, keep **`## Pages inventory`** and the **hub** matching 100% of files in `pages/*` (hook FEAT-007).

**Relationship with `/research {topic}`**: the **free-form** command only needs a quick research and return to topic; **`/research-ui`** requires **3 phases** + **log entry** + **HTML/CSS edits when proposals are reasonable**.

User reference: `docs/user/features/ui-direction.md`.

### End of each topic
- Summarize decisions
- List action items
- Note open questions
- If the topic adds/changes a capability: update **`## Phases`** in the session draft (or remind the user to `/save`) with the appropriate phase
</step>

<step name="project_meta_intake">
## 5. Project meta intake (FEAT-009)

Normative contract: **`docs/dev/global-profiles.md`** (`~/.viepilot/profiles/`, `~/.viepilot/profile-map.md`, `.viepilot/META.md`).

### 5.1 When this step runs

Runs **before** saving the session in **`Completed`** status or when the user types **`/end`**, **if**:

1. **Scope locked**: `## Phases` in the session draft already contains real content (all features assigned to a phase) **or** the user has just verbally confirmed scope is finalized.
2. **Binding missing**: `.viepilot/META.md` does not exist **or** the frontmatter lacks a valid `viepilot_profile_id` (slug `kebab-case` per contract).

**Skip by default** (skip intake) when `.viepilot/META.md` already has a valid `viepilot_profile_id` — only ask quickly: *”Keep profile `{id}`? Change profile?”*; if kept → proceed to Save step.

### 5.2 Prepare registry

1. `mkdir -p "$HOME/.viepilot/profiles"` if needed.
2. Read `~/.viepilot/profile-map.md` if present to list existing profiles (profile_id, display_name, org_tag).

### 5.3 Disambiguation (multiple profiles / multiple orgs)

- If the brainstorm reveals **multiple orgs/clients** or **≥2 rows in profile-map** match the suggestion (same `org_tag` or tag): **require** the user to select **one** `profile_id` **or** choose **Create new profile** (new slug, not yet existing).

### 5.4 Sequential Q&A (one question per turn)

For each question:

1. Provide a short **Proposal** (1–2 sentences) inferred from the session + phase plan.
2. User responds **Accept proposal** / **Edit** (record user's version).
3. Move to the next question.

**At minimum** these must be clarified before writing the file (matches body sections in the global contract):

| Order | Question (suggested) | Maps to |
|-------|----------------------|---------|
| 1 | Display name for org/client or “personal”? | `display_name` |
| 2 | Short `org_tag` (e.g., `acme`, `personal`)? | `org_tag` |
| 3 | Branding / voice (audience, tone)? | body `## Branding & voice` |
| 4 | Public legal / attribution (if any)? | body `## Legal & attribution` |
| 5 | Public website (optional)? | frontmatter `website` |

Then: finalize **`profile_id`** = slug filename (`kebab-case`).

### 5.5 Write artifacts (machine + project)

1. **`~/.viepilot/profiles/<slug>.md`**: YAML frontmatter with all required keys (`profile_id`, `display_name`, `org_tag`, `tags`, `last_updated`) + body sections collected. Do **not** write secrets.
2. **`~/.viepilot/profile-map.md`**: add or update a table row (columns per contract); update `last_used` = current date.
3. **`.viepilot/META.md`**: create/update from `templates/project/VIEPILOT-META.md` with `viepilot_profile_id: <slug>`.

### 5.6 Record in session file

In the draft / session file, add section:

```markdown
## Project meta intake (FEAT-009)
- **status**: completed | skipped
- **profile_id**: {slug}
- **profile_path**: ~/.viepilot/profiles/{slug}.md
- **binding**: .viepilot/META.md
```

If skipped (rare): must have a **`## Meta intake waiver`** in the same session file with the **reason** provided by the user.

### 5.7 Continue

After intake is **completed** or a **valid skip** (META already has profile) → proceed to **step 6 — Save Session**.
</step>

<step name="save_session">
## 6. Save Session

### Pre-Save Phase Assignment Validation (ENH-052)

Before writing the session file, validate phase assignment completeness:

**Scope-locked session** — `## Phases` section exists with real content OR user confirmed scope finalized (ref: Step 5.1 condition 1):

```
CHECK 1: Does session draft contain a non-empty ## Phases section?
CHECK 2: Does Phase 1 have at least one feature/capability assigned?
CHECK 3: Are there any features listed outside a phase (unassigned)?
CHECK 4 (ENH-061): If both Architect workspace AND UI Direction workspace are active —
         does ## Coverage in notes.md have any Phase 1 feature with "none yet" in BOTH columns?
```

**Gate condition:**
- If scope is locked AND (CHECK 1 fails OR CHECK 2 fails):
  → **Block save.** Show:
  ```
  ⚠️  Phase assignment incomplete — cannot save as Completed.

  Features were discussed but no phase assignments exist.
  Before saving:
    1. Assign all features to phases (## Phases section)
    2. Ensure Phase 1 has at least one feature

  Return to the conversation to assign phases, then /save again.
  ```
- If scope is **not** locked (exploratory session — no feature assignments):
  → **Allow save** with `Status: In Progress` and add advisory note to session file:
  ```markdown
  > ⚠️ Exploratory session — no phase assignments yet.
  > Run /vp-brainstorm to continue and assign features to phases before /vp-crystallize.
  ```
- If CHECK 4 fires (both workspaces active + uncovered Phase 1 features): **non-blocking warning**:
  ```
  ⚠️  Coverage gap detected — these Phase 1 features have no Architect or UI coverage:
  - {feature name}
  Consider running /sync-ui or adding these features to a workspace before /vp-crystallize.
  Proceed with save? (yes / skip coverage for now)
  ```
- If brownfield stub session (`IS_BROWNFIELD=true`): **skip this gate** — brownfield stubs intentionally have no phases.
- If all checks pass → proceed to Feature → Coverage Mapping check, then file write.

### Feature → Coverage Mapping (ENH-061)

**Trigger**: After phase assignment checks pass and before file write. Runs when the session has BOTH Architect workspace AND UI Direction workspace active, or when `## Coverage` already exists in notes.md.

For each feature/capability listed under **Phase 1** in the session draft, identify:
- **Architect coverage**: which architect page handles this? (`architecture`, `data-flow`, `erd`, `apis`, `tech-stack`, `decisions`, `user-use-cases`, `sequence-diagram`, `deployment`, or `none yet`)
- **UI coverage**: which UI screen/page handles this? (page slug, `index.html`, or `none yet`)

Output a `## Coverage` section in `notes.md`:

```markdown
## Coverage
| Feature | Architect page | UI screen |
|---------|---------------|-----------|
| User authentication | architecture, apis | login.html, register.html |
| Dashboard overview | data-flow | dashboard.html |
| Notification system | architecture | none yet |
```

**Warning rules (non-blocking)**:
- If a Phase 1 feature has `none yet` in **both** columns:
  `⚠️ Feature "{name}" has no coverage in Architect or UI Direction. Consider adding it to a workspace before /vp-crystallize.`
- If Architect workspace exists but coverage matrix is empty: suggest running coverage mapping.
- User can dismiss with "skip coverage" or "fill in later" — does **not** block save.

Create/update file: `docs/brainstorm/session-{YYYY-MM-DD}.md`

```markdown
# Brainstorm Session - {YYYY-MM-DD}

## Session Info
- **Date**: {full date}
- **Participants**: User, Claude
- **Status**: In Progress | Completed
- **workflow_version**: {viepilot_semver}
- **upgrade_supplement_version**: {viepilot_semver_after_supplement | ""}

<!-- workflow_version: set from `node bin/vp-tools.cjs info` → version field at session create/save time.       -->
<!-- upgrade_supplement_version: empty on first save; set to current version after gap-detection supplement      -->
<!--   completes (ENH-067 idempotency guard — prevents re-surfacing already-supplemented topics on next open). -->

## Phases

### Phase 1
- {Feature / capability}

### Phase 2
- {Feature / capability}

### Phase 3 (and beyond)
- {Feature / capability}

## Project meta intake (FEAT-009)

- **status**: not_started | completed | skipped
- **profile_id**:
- **profile_path**:
- **binding** (.viepilot/META.md):

_(Fill after step 5 — Project meta intake; see `docs/dev/global-profiles.md`.)_

<!-- If skipped: ## Meta intake waiver + reason -->

## Architecture diagram applicability inputs

> Input contract for `/vp-crystallize` Step 4. Keep concise and explicit.

- **Project complexity**: simple | moderate | complex
- **Services/modules**: {single | multiple} + boundaries
- **Event-driven**: yes/no + channels (queue/webhook/cron)
- **Deployment shape**: local-only | single-env cloud | multi-env/distributed
- **User flow complexity**: simple | multi-step | multi-actor
- **Integration surface**: low | medium | high
- **Initial diagram hints** (optional): required / optional / N/A candidates

## Topics Discussed

### Topic 1: {Name}
**Context**: {brief context}

**Discussion**:
- Point 1
- Point 2

**Decisions**:
- [x] Decision 1
- [x] Decision 2

**Open Questions**:
- Question 1?

**Research Notes**:
- Query: {what was researched}
- Sources: {links / docs}
- Findings: {key points}
- Recommendation: {recommended direction}

**Landing Page Decisions** (if applicable):
- Chosen layout: {A|B|C|D|Custom}
- Section order: {hero -> proof -> features -> pricing -> faq -> cta}
- 21st.dev references:
  - {component/pattern 1}
  - {component/pattern 2}

**UI Direction Artifacts** (if applicable):
- Session id: {session-id}
- Layout: legacy (single `index.html`) | multi-page (`pages/*.html` + hub `index.html`)
- Files:
  - `.viepilot/ui-direction/{session-id}/index.html` (hub or single-screen)
  - `.viepilot/ui-direction/{session-id}/style.css`
  - `.viepilot/ui-direction/{session-id}/notes.md` (must include `## Pages inventory` when `pages/` exists)
  - `.viepilot/ui-direction/{session-id}/pages/*.html` (when multi-page)
- Preview focus:
  - {layout/flow summary; list each page slug if multi-page}

**UX walkthrough log** (optional; FEAT-010 + ENH-019 + ENH-020 — when `/research-ui` has been run):
- {YYYY-MM-DD}: scenarios exercised → top pains → **Stress findings** (summary) → research links → HTML/CSS edits summary

---

## Summary

### Key Decisions
1. Decision summary

### Action Items
- [ ] Action 1
- [ ] Action 2

### Next Steps
- What to do next

### Open Questions
- Unresolved questions
```

Commit:
```bash
mkdir -p docs/brainstorm
git add docs/brainstorm/
git commit -m "docs: brainstorm session {date}"
git push
```
</step>

<step name="arch_to_ui_sync">
## 6C. Architect → UI Direction Sync (ENH-061)

Bridges the gap from **Architect Design** → **UI Direction** — the reverse of `architect_delta_sync` (ENH-034, which syncs UI → Architect).

When the architect workspace is updated (any page edit during the session), scan the changed content for decisions that carry **UI implications**:

### Architectural decisions that trigger UI updates

| Architect signal | UI implication to check |
|-----------------|------------------------|
| Async / event-driven flow | Loading states, optimistic updates, error handling screens |
| API pagination | Pagination component, empty state, scroll-to-load |
| Auth roles / permissions | Conditional UI rendering, role-specific screens |
| Rate limiting / quota | Warning banners, upgrade prompts, disabled states |
| Real-time → polling fallback | Refresh indicators, stale data warnings |
| File size / type constraints | Upload validation, error messages, progress indicators |
| Third-party OAuth / SSO | Redirect flow, consent screen, token expiry handling |
| Error codes from APIs | Error state screens, retry affordances |
| Data constraints (max length, required fields) | Form validation UI, helper text |

### Trigger conditions
`arch_to_ui_sync` fires when:
- The user edits any architect workspace page during an active brainstorm session that also has a UI Direction workspace
- User types `/sync-ui` (manual trigger, parallel to `/sync-arch`)
- After `/review-arch` if changes were applied

### Output format
```
🎨 Architect → UI sync — detected implications:

From `data-flow.html` (async notification queue):
  → UI may need: notification badge with unread count, real-time update indicator, empty state
  → Affected screens: dashboard.html (not yet modeled in UI Direction)

Update UI Direction to reflect these decisions?
1. Yes — open UI Direction and address these screens/states now
2. Note it in notes.md (## arch_to_ui_sync) for later
3. Skip — already handled
```

### Manual command
`/sync-ui` — manually trigger arch_to_ui_sync from the current architect session state. If no UI Direction workspace is active, suggest activating it first.

When `/sync-ui` is used and no implications are found:
`✓ No UI Direction implications detected from current architect changes.`

### notes.md record
Append to `notes.md` when action is taken:
```yaml
## arch_to_ui_sync
- architect_page: data-flow.html
  decision: async notification queue
  ui_implication: unread count badge, empty state, real-time update indicator
  status: noted | addressed | skipped
  date: {YYYY-MM-DD}
```

### Cross-workspace HUB links (ENH-064)

When BOTH architect AND ui-direction workspaces are active in the same session:
After `arch_to_ui_sync` completes (or when both workspaces first become active together):

**Update Architect `index.html`** — add to nav/header section:
```html
<div class="cross-workspace-link">
  <a href="../../ui-direction/{session-id}/index.html" target="_blank">
    🎨 View UI Direction workspace
  </a>
</div>
```

**Update UI Direction `index.html`** — add to nav/header section:
```html
<div class="cross-workspace-link">
  <a href="../../architect/{session-id}/index.html" target="_blank">
    🏗️ View Architect workspace
  </a>
</div>
```

**Trigger conditions:**
- After arch_to_ui_sync fires (ENH-061)
- When BUG-018 Step 2B selection is "Both" and both workspaces are created
- Manual: user types `/sync-links`

**Relative path calculation:**
- From `.viepilot/architect/{session-id}/index.html` → `../../ui-direction/{session-id}/index.html`
- From `.viepilot/ui-direction/{session-id}/index.html` → `../../architect/{session-id}/index.html`
- Use the same `{session-id}` (same date YYYY-MM-DD) for cross-linking.

</step>

<step name="architect_delta_sync">
## 6B. Architect Delta Sync (ENH-034)

Bridges the gap between UI Direction Mode and the Architect HTML workspace.
When a UI brainstorm session surfaces architect-relevant gaps or changes, those
deltas are parsed and written back to the relevant architect HTML template files.

### Trigger conditions

Runs when **either** condition is met:

1. **End of UI session** — `.viepilot/ui-direction/{session-id}/` exists for the current
   session AND the session contains ≥1 architect keyword hit detected during UI discussion
   (see keyword lists below).
2. **Manual command** — user types `/sync-arch` at any point in a session.

> **Automatic mode (FEAT-012):** If the brainstorm staleness hook is installed
> (`vp-tools hooks install`), stale architect items are flagged automatically after
> **each AI response** — no need to type `/sync-arch`. The hook marks items
> `data-arch-stale="true"` (amber badge) without rewriting content. Install once per machine.
> See `docs/user/features/hooks.md` for setup.

When neither condition is met: skip silently.
When `/sync-arch` is used explicitly and no gaps are found: output
`✓ No architect gaps detected in this session.`

### Step 1: Locate architect session

```bash
ls .viepilot/architect/ 2>/dev/null
```

- Find `.viepilot/architect/{session-id}/` matching the current session context
  (same date, same project name, or most recent).
- If **no architect workspace exists**: skip with message:
  `⚠ No architect workspace found. Run /vp-brainstorm --architect first to create one.`

### Step 2: Gap detection — scan session for architect keywords by page

Use the **existing trigger keyword lists** from Architect Design Mode (defined above) to
identify which architect pages are affected:

| Page | Keywords (excerpt) |
|------|--------------------|
| `architecture.html` | service, component, module, layer, boundary, system, integration, C4 |
| `erd.html` | database, entity, table, schema, relation, foreign key, ERD, data model |
| `apis.html` | endpoint, API, REST, route, HTTP, POST, GET, PUT, DELETE, request, response |
| `deployment.html` | deploy, infrastructure, environment, staging, production, CI/CD, pipeline |
| `data-flow.html` | data flow, event flow, queue, webhook, async, pub/sub |
| `user-use-cases.html` | user story, use case, actor, persona, as a user, user flow, journey |
| `sequence-diagram.html` | sequence, step by step, login flow, checkout flow, interaction |

For each page where **≥1 keyword is found in the UI brainstorm session output**:
- Mark as **affected**.
- Extract the relevant sentences/paragraphs that describe the gap or change.

### Step 3: Update HTML for each affected page

For each affected page:

1. **Read** `.viepilot/architect/{session-id}/{page}.html`
2. **Identify the target element(s)**:
   - Match the gap context to the nearest `<tr data-arch-id="...">` row or
     `<div class="card" data-arch-id="...">` by comparing gap keywords to the
     item's `data-arch-title` or first cell content.
   - If no exact match: add a **new row** to the relevant `<tbody>` (the most
     appropriate table for the content type) with the gap information.
3. **Update element content**:
   - For existing rows: update the relevant `<td>` cell with the new/corrected
     information from the brainstorm.
   - For new rows: create `<tr data-arch-id="{PAGE-PREFIX-NEW{n}}"
     data-updated="true" class="updated">` with content from the brainstorm.
4. **Mark as updated**: add `data-updated="true"` and `class="updated"` to the
   changed element (uses existing `.updated` CSS — yellow left border + badge).
5. **Add sync note**: add `data-arch-sync-note="{brief reason, ≤60 chars}"` to the
   changed element recording why it was updated.

**Do NOT**:
- Change elements that were NOT identified as gaps.
- Cascade updates across pages (isolation rule — ENH-033 applies here too).
- Remove existing data — only update or add.

### Step 4: Record delta in notes.md

Append under `## architect_sync` section in `.viepilot/architect/{session-id}/notes.md`:

```yaml
## architect_sync
- synced_at: {ISO datetime}
  source_session: {ui-direction session-id}
  trigger: {end-of-session | /sync-arch}
  changes:
    - page: {slug}
      item_id: {data-arch-id}
      action: {updated | added}
      change: "{brief description of what was updated, ≤80 chars}"
    - page: {slug}
      item_id: {data-arch-id}
      action: updated
      change: "{description}"
```

### Step 5: Output sync report

```
🔄 Architect Sync complete

Updated {N} items across {M} pages:
  {page}    {item-id} [{action}] — {change}
  ...

Items marked with data-updated="true" in architect workspace.
Open .viepilot/architect/{session-id}/ to review changes.
```

If only 1 item changed: single-line summary is sufficient.

### notes.md schema update

The `## architect_sync` section is **appended** (not replaced) on each sync run.
Multiple sync entries can exist — each with its own `synced_at` timestamp.
</step>

<step name="suggest_next">
## 7. Suggest Next Action

```
✓ Brainstorm session saved

Summary:
- Topics covered: {count}
- Decisions made: {count}
- Open questions: {count}

Next step: /vp-crystallize
This will transform your brainstorm into:
- Project structure
- Architecture documents
- Development roadmap (phases + tasks from `## Phases` section)
```
</step>

</process>

<commands>
User can use the following commands during a brainstorm session:

- `/topic {name}` - Switch to a new topic
- `/summary` - View current session summary
- `/save` - Save progress immediately
- `/end` - End and save the session (after **step 5 — Project meta intake** when binding is missing; see workflow)
- `/questions` - View list of open questions
- `/research {topic}` - Quick research inline in the session and return to current topic
- `/research-ui` — UX walkthrough: simulate user → designer + research → update UI direction + log (`notes.md`) — only when a UI session exists (FEAT-010)
- `/research ui` — alias of `/research-ui`
- `/review-arch` — Architect Mode: output summary table of decisions + open_questions from `notes.md`, confirm before continuing (FEAT-011)
- `/sync-arch` — Architect Delta Sync (ENH-034): manually trigger architect HTML sync from current UI brainstorm session; scans session for architect gaps → updates relevant architect workspace pages
- `/sync-ui` — Architect → UI Direction Sync (ENH-061): manually trigger arch_to_ui_sync; scans architect workspace for decisions that carry UI implications and prompts UI Direction updates
- `/hooks-install` — Install the brainstorm staleness hook (FEAT-012): runs `vp-tools hooks install`; one-time setup per machine; auto-marks stale architect items after each AI response
</commands>

<success_criteria>
- [ ] Session file created with all required sections
- [ ] `## Phases` present with at least Phase 1 containing real content
- [ ] Decisions include rationale
- [ ] Open questions tracked
- [ ] Action items captured
- [ ] Landing page topics trigger layout follow-up questions
- [ ] 21st.dev references used when discussing landing pages
- [ ] Research can be run inline during the brainstorm session when the user requests it
- [ ] **FEAT-010 + ENH-019 + ENH-020**: In UI Direction, `/research-ui` (or `/research ui`) runs all 3 phases, including **content stress pass** + **archetype stress recipes** + **`## UX walkthrough log`** (Stress findings) when editing prototype
- [ ] Git committed
- [ ] **FEAT-009**: If binding is missing and scope is locked — **Project meta intake** (step 5) has been run or a **`## Meta intake waiver`** with reason exists before Completed
- [ ] **`## Project meta intake (FEAT-009)`** in session: `status` + `profile_id` when completed (or waiver if skipped)
- [ ] **ENH-034**: If UI session surfaces architect gaps → `architect_delta_sync` step runs; architect HTML updated + `## architect_sync` appended to notes.md
- [ ] **FEAT-012**: If brainstorm staleness hook installed → stale architect items auto-flagged after each AI response (amber badge); `/hooks-install` sets this up once per machine
</success_criteria>
