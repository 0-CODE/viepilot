<purpose>
Interactive brainstorm session to gather ideas, requirements, and decisions for the project.
Allows research inline within the same brainstorm session when needed.
</purpose>

## Adapter Compatibility

| Feature | Claude Code (terminal) | Cursor (Agent/Skills) | Codex CLI | Antigravity (native) |
|---------|----------------------|-----------------------|-----------|----------------------|
| Interactive prompts | ✅ `AskUserQuestion` tool | ❌ text fallback | ❌ text fallback | ❌ text fallback |

When `AskUserQuestion` is not available, each prompt block falls back to the plain-text numbered list shown below it — no configuration needed.

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
> - **Claude Code (terminal):** use `AskUserQuestion` tool — spec:
>   - question: "Previous brainstorm sessions found. What would you like to do?"
>   - header: "Session"
>   - options: [{ label: "Continue recent session", description: "Resume the most recent session from where it stopped" }, { label: "Review specific session", description: "Choose a particular session to review or continue" }, { label: "New brainstorm session", description: "Start fresh — previous sessions are preserved" }]
>   - multiSelect: false
> - **Cursor / Codex / Antigravity / other:** use text menu below

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

6. **Phase assignment (ENH-030):** during brainstorm, each feature/capability is assigned to a specific **phase** — Phase 1, Phase 2, Phase 3... Do not use MVP/Post-MVP/Future tiers. If the user has not stated a phase, ask: “Which phase would you like to assign this feature to?”

### Interactive Q&A
For each topic:
1. Ask specific questions
2. Wait for user response
3. Synthesize and ask follow-up questions
4. Suggest alternatives if needed
5. Record decisions

### Landing Page Deep-Dive (activated contextually)
If the user is brainstorming a landing page / homepage / marketing page:

1. Ask follow-up questions to finalize the layout:
   - Main goal of the landing page? (signup, booking demo, download, contact)
   - Primary audience?
   - Visual tone? (minimal, modern, bold, enterprise, playful)
   - Primary CTA and secondary CTA?
2. Present a layout menu for the user to choose from:

> **Adapter-aware prompt:**
> - **Claude Code (terminal):** use `AskUserQuestion` tool — spec:
>   - question: "Which landing page layout fits your goals and audience?"
>   - header: "Layout"
>   - options: [{ label: "Layout A — Hero centric", description: "Hero + trust logos + features + CTA — best for brand awareness and conversions" }, { label: "Layout B — Problem/Solution", description: "Problem/Solution + social proof + pricing + FAQ — best for SaaS sign-ups" }, { label: "Layout C — Product storytelling", description: "Screenshots + testimonials + final CTA — best for product demos" }, { label: "Layout D — SaaS conversion", description: "Integrations + comparison + onboarding steps — best for tool adoption" }]
>   - multiSelect: false
> - **Cursor / Codex / Antigravity / other:** use list below

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

#### Threshold & accumulation rule
- **Count unique keyword occurrences** during the ongoing session.
- When **≥3 unique signal occurrences** are reached: begin **silent accumulation** — record UI ideas into a `ui_idea_buffer[]` in the session context.
- **Non-blocking**: does not interrupt the main conversation, does not ask for user confirmation immediately.
- Each buffer entry records: keyword trigger, utterance context (short summary ≤20 words).

#### Surface triggers (when to ask the user)
Display a confirmation dialogue when any of the following conditions occur:
- (a) **Topic ends** — user types `/topic` to switch to a new topic or says "next"
- (b) **User types `/save` or `/review`**
- (c) **≥5 signals accumulated** in the buffer

#### Confirmation dialogue template
```
💡 I detected some UI ideas in this session:
- {idea 1 extracted from buffer}
- {idea 2 extracted from buffer}
...

What would you like to do?
1. Save to .viepilot/ui-direction/{session-id}/notes.md (background extraction)
2. Save + activate UI Direction Mode to generate HTML direction
3. Discard and continue brainstorming
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
- If brownfield stub session (`IS_BROWNFIELD=true`): **skip this gate** — brownfield stubs intentionally have no phases.
- If all checks pass → proceed to file write below.

Create/update file: `docs/brainstorm/session-{YYYY-MM-DD}.md`

```markdown
# Brainstorm Session - {YYYY-MM-DD}

## Session Info
- **Date**: {full date}
- **Participants**: User, Claude
- **Status**: In Progress | Completed

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
