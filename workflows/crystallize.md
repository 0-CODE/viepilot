<purpose>
Convert brainstorm sessions into structured artifacts for autonomous AI execution.
</purpose>

## ViePilot Skill Scope Policy (BUG-004)

- Default behavior: only use and suggest skills under `vp-*`.
- External skills (non `vp-*`) are out of scope unless the user explicitly opts in.
- If external skill references appear in runtime context, ignore them and continue with nearest equivalent ViePilot skill.


<process>

<step name="collect_metadata">
## Step 0: Collect Project Metadata

### ViePilot active profile (FEAT-009)

Normative: **`docs/dev/global-profiles.md`**. Binding: **`.viepilot/META.md`** (`viepilot_profile_id`, optional `viepilot_profile_path`).

**Before** the Basic Info question block:

1. If `.viepilot/META.md` exists, parse YAML frontmatter to extract `viepilot_profile_id` and optionally `viepilot_profile_path`.
2. **Resolve** the profile markdown file:
   - If `viepilot_profile_path` is set and the file exists (expand `~` / `$HOME`) → use that path.
   - Else if a valid `viepilot_profile_id` is present → `$HOME/.viepilot/profiles/<viepilot_profile_id>.md`.
3. **When the profile file is readable:**
   - Read frontmatter (`display_name`, `org_tag`, `website`, `tags`, …) and body (`## Organization`, `## Branding & voice`, `## Audience`, `## Legal & attribution`, `## Contact (public)`).
   - **Pre-fill** Step 0 questions (org, website, short description if matched) as a **proposal**; user must **confirm** or **edit**.
   - Record working note **`profile_resolved`**: `{ profile_id, absolute_path }` for use in later steps.
4. **When META is absent, id is missing, or file does not exist:**
   - Record **`profile_resolved: none`** and continue Step 0 as normal — do **not** fail crystallize.

Ask the user for project information:

### Basic Info
```
1. Project name?
   Default: (extract from brainstorm)
   
2. Short description (1-2 sentences)?
```

### Organization Info
```
3. Company/organization name?

4. Company website? (optional)
```

### Package Info
```
5. Package Base ID (Java package)?
   Example: com.acme.smarttrack
   Validation: ^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)*$
   
6. Maven Artifact ID?
   Default: {project-name-kebab-case}
   
7. Maven Group ID?
   Default: {package_base_id}
```

### Developer Info
```
8. Lead developer name?

9. Lead developer email?

10. GitHub username? (optional)
```

### Repository Info
```
11. Repository URL? (optional)

12. Issue Tracker URL?
    Default: {repository_url}/issues
```

### License & Year
```
13. License?
    Options: MIT, Apache-2.0, GPL-3.0, BSD-3-Clause, Proprietary
    Default: MIT
    
14. Project start year?
    Default: {current_year}
```

Store all metadata for template generation.
</step>

<step name="analyze_brainstorm">
## Step 1: Analyze Brainstorm

```bash
ls docs/brainstorm/session-*.md
```

For each session file:
1. Extract decisions (look for "Decision:" patterns)
2. Extract architecture info
3. Extract database schemas
4. Extract features/requirements
5. Extract tech stack choices
6. **Phase assignment** — parse `## Phases` from brainstorm session(s):
   - Collect features/capabilities listed under each `### Phase N` heading.
   - If a feature has no phase assigned → ask user which phase before continuing.
   - Record `phases_inventory: { phase_1: [...], phase_2: [...], ... }` in working notes.

**Phase assignment gate (before leaving Step 1):**
- [ ] Every brainstorm session checked for `## Phases` section OR features explicitly assigned during conversation.
- [ ] All features have a phase number assigned — no unassigned features.
- [ ] `phases_inventory` recorded in working notes with at least Phase 1 non-empty.

Validate completeness:
- [ ] Tech stack defined
- [ ] Core features identified
- [ ] Database schema exists
- [ ] API requirements clear
- [ ] Phase assignment gate satisfied (phases_inventory recorded)

If gaps found → ask user to clarify or return to brainstorm.
</step>

<step name="consume_ui_direction">
## Step 1A: Consume UI Direction Artifacts (for UI/UX projects)

### UI Scope Detection (ENH-026 hard gate)

Before checking for artifacts, scan brainstorm session files (`docs/brainstorm/session-*.md`) for UI signal keywords:

> `màu`, `màu sắc`, `color`, `layout`, `màn hình`, `screen`, `page`, `trang`, `button`, `nút`, `form`, `biểu mẫu`, `mobile`, `responsive`, `giao diện`, `UI`, `UX`, `design`, `dashboard`, `sidebar`, `header`, `footer`, `modal`, `popup`, `icon`, `theme`, `typography`, `font`, `spacing`, `grid`, `card`, `component`, `hero`, `banner`

If **≥3 unique signal occurrences** found → set `ui_scope_detected = true`.

**Hard gate** (only when `ui_scope_detected = true`):

Check if `.viepilot/ui-direction/` exists and contains any session artifacts.

If `ui_scope_detected = true` **AND** artifacts are missing → **STOP** and present:

```
⚠️ UI Direction artifacts missing

The brainstorm session indicates this project has UI scope but `.viepilot/ui-direction/` has no artifacts yet.

1. Return to /vp-brainstorm --ui to create direction first (recommended)
2. Continue with assumptions — record in ARCHITECTURE.md and proceed
```

**Option 2 path**: append to `.viepilot/ARCHITECTURE.md`:

```markdown
## UI Direction Assumptions
> Auto-generated by crystallize (ENH-026 gate bypassed by user)
- UI scope detected in brainstorm but no ui-direction artifacts present
- Proceeding without visual direction; architecture decisions may need UI review later
```

If `ui_scope_detected = false` → skip gate; proceed normally.

### Consume artifacts (when available)

Check for direction artifacts:

```bash
ls -la .viepilot/ui-direction/ 2>/dev/null
```

When available, for the selected/latest session:
- Read `.viepilot/ui-direction/{session-id}/notes.md` first (source of design decisions)
- If `pages/` exists and contains `*.html`:
  - Require section **`## Pages inventory`** in `notes.md`; treat it as the **site map** (page count, purpose, navigation).
  - List all `pages/*.html` and confirm each file is represented in the inventory table (if mismatch → stop and ask user to fix brainstorm artifacts or document assumptions).
  - Read **each** `pages/{slug}.html` for section structure, components, and interaction hints.
  - Read hub `index.html` for cross-page navigation intent.
- Else (legacy single-file layout):
  - Read `index.html` + `style.css` only (no `pages/`).
- Always read `style.css` for shared styling constraints.
- Extract from HTML: layout hierarchy, component candidates, interaction expectations.
- In architecture / UI plan output, **enumerate every page** from inventory (or state explicitly single-page legacy).

If `notes.md` exists but has no `## Pages inventory` section and brainstorm shows multi-page scope → warn user and request fix or assumptions before proceeding.
</step>

<step name="research_stack_official">
## Step 1B: Research Official Stack Guidance (mandatory)

For each selected stack extracted in Step 1:
1. Use `WebSearch` to find official documentation and authoritative references.
2. Use `WebFetch` to read and verify each selected source before summarizing.
3. Prefer source priority in this order:
   - Official framework docs/specification
   - Official project GitHub org docs
   - Maintainer-authored references
   - Community articles (only as supplemental context)
4. Reject weak sources (outdated, anonymous, unclear version, no technical detail).
5. Build a concise implementation guide that can be reused by `vp-auto`.
6. Capture "Do / Don't" rules and common anti-patterns.

Required output per stack:
- Quick summary (token-light)
- Best practices
- Anti-patterns
- Source links + checked date
- Version compatibility note (e.g. MyBatis 3.x, Spring Boot 3.x integration notes)

Recommended structure:
```yaml
stack: mybatis
official_sources:
  - https://mybatis.org/mybatis-3/
guideline:
  do:
    - Prefer XML mapper for complex SQL and reusable fragments
  dont:
    - Avoid large inline SQL annotations for complex queries
```

If official sources cannot be verified, pause crystallize and ask user to confirm temporary assumptions.
</step>

<step name="write_stack_cache">
## Step 1C: Write Global Stack Cache

Persist stack guidance globally for cross-project reuse:

```bash
mkdir -p "$HOME/.viepilot/stacks/{stack}"
```

Files per stack:
- `~/.viepilot/stacks/{stack}/SUMMARY.md` (short checklist for fast lookup)
- `~/.viepilot/stacks/{stack}/BEST-PRACTICES.md`
- `~/.viepilot/stacks/{stack}/ANTI-PATTERNS.md`
- `~/.viepilot/stacks/{stack}/SOURCES.md` (official docs + last validated date)

Also create project-local index for traceability:
- `.viepilot/STACKS.md` listing stacks used and cache paths.
</step>

<step name="consume_architect_artifacts">
## Step 1D: Consume Architect Artifacts (FEAT-011)

If `.viepilot/architect/` exists with at least one session directory:

1. **Select most recent session** (by directory mtime or newest session-id).
2. **Read `notes.md`** → parse YAML frontmatter sections:
   - **`decisions[]`** → append to `.viepilot/ARCHITECTURE.md` under:
     ```markdown
     ## Architecture Decisions (from Architect Mode)
     | ID | Topic | Chosen | Rationale | Status |
     ```
   - **`tech_stack{}`** → use as **authoritative tech stack** (overrides brainstorm text if conflict; when conflict detected: surface to user with both values and ask which to use before proceeding).
   - **`open_questions[]`** with `status: open` → surface as list:
     ```
     ⚠️ These questions were open at end of Architect Design Mode — please resolve before proceeding:
     - Q001: {question}
     - Q002: {question}
     ```
3. **`erd.html` / `notes.md ## erd`** (if exists — ENH-027) → append to `.viepilot/ARCHITECTURE.md`:
   ```markdown
   ## Database Schema (from Architect ERD)
   | Entity | Attributes | PK | FK | Notes |
   ...
   ### Relationships
   | Entity A | Type | Entity B | Label |
   ```
4. **`user-use-cases.html` / `notes.md ## use_cases`** (if exists — ENH-028) → append to `.viepilot/PROJECT-CONTEXT.md`:
   ```markdown
   ## User Stories & Use Cases (from Architect Mode)
   ### Actors
   | Actor | Role | Goals |
   ### User Stories
   | ID | As a... | I want to... | So that... | Priority |
   ```
5. **`deployment.html` / `notes.md ## deployment`** (if exists — ENH-029) → append to `.viepilot/ARCHITECTURE.md`:
   ```markdown
   ## Deployment & Infrastructure (from Architect Mode)
   | Env | URL | Purpose | Services | Config notes |
   ...
   ### Infrastructure Components
   | Component | Type | Provider | Sizing | Notes |
   ```
6. **`apis.html` / `notes.md ## apis`** (if exists — ENH-029) → append to `.viepilot/ARCHITECTURE.md`:
   ```markdown
   ## API Design (from Architect Mode)
   ### API Style: {REST / GraphQL / gRPC / WebSocket}
   | Service | Method | Path | Auth? | Notes |
   ...
   ### API Design Decisions
   | Decision | Choice | Rationale |
   ```
   Note: `sequence-diagram.html` is intentionally excluded from crystallize extraction — per-scenario diagrams are not architecture artifacts (they live in Architect Mode workspace only).
7. **`feature-map.html`** → cross-reference Phase badges with `phases_inventory`; if discrepancies found (feature in HTML not in inventory, or vice versa) → list them for user to confirm.
8. **Record in working notes**:
   - `architect_session_id`: {id}
   - `decisions_imported`: {count}
   - `open_questions_count`: {count of open questions}
   - `erd_entities_count`: {count if erd present, else "n/a"}
   - `use_cases_count`: {count if use_cases present, else "n/a"}
   - `deployment_imported`: {true/false}
   - `apis_imported`: {true/false}

If `.viepilot/architect/` does **not** exist but brainstorm shows complex architecture (≥5 services/components detected):
- Suggest (soft prompt — not a hard block):
  ```
  💡 Would you like to return to /vp-brainstorm --architect to create visualizations first?
  1. Yes — return to architect mode
  2. No — continue crystallize with text-only brainstorm
  ```
- User confirmation required before proceeding.
</step>

<step name="generate_ai_guide">
## Step 2: Generate AI-GUIDE.md

Create `.viepilot/AI-GUIDE.md` using template:
`@$HOME/.cursor/viepilot/templates/project/AI-GUIDE.md`

Customize with:
- Project-specific file references
- **ViePilot profile (FEAT-009):** If Step 0 set `profile_resolved` to a valid path, add a **Quick context** entry recording `profile_id`, the profile file path, and a reminder to read that file for **tone/branding** when writing user-facing text. If `profile_resolved: none`, write a single line: no global profile bound.
- Context loading strategy based on project size — **preserve template ordering** where `PROJECT-CONTEXT.md` **`<product_vision>`** and **`ROADMAP.md` phases** are read **before** deep implementation / architecture lock; state this explicitly in the generated `AI-GUIDE.md` if you trim sections
- Quick lookup for project-specific terms
- Fast stack lookup section:
  - Read `.viepilot/STACKS.md`
  - For each task stack, read cache `SUMMARY.md` first
  - Expand to `BEST-PRACTICES.md` only if task complexity requires
</step>

<step name="generate_project_meta">
## Step 3: Generate PROJECT-META.md

Create `.viepilot/PROJECT-META.md` using template:
`@$HOME/.cursor/viepilot/templates/project/PROJECT-META.md`

Fill with collected metadata:
- Project info
- Organization info
- Package structure (generate from base ID)
- Developer info
- File headers (generate from metadata)
- **FEAT-009:** If the profile was resolved in Step 0 and the user confirmed the pre-fill, **prioritize** aligning the Organization / attribution table in the template with the profile content (public data only; no secrets).
</step>

<step name="generate_architecture">
## Step 4: Generate ARCHITECTURE.md

Create `.viepilot/ARCHITECTURE.md` using template:
`@$HOME/.cursor/viepilot/templates/project/ARCHITECTURE.md`

Extract from brainstorm:
- System overview diagram
- Services definitions
- Data flow
- Technology decisions with rationale
- Integration points

### ViePilot organization context (FEAT-009)

- If Step 0 recorded **`profile_resolved`** with a valid path: immediately after the first **overview** section of `.viepilot/ARCHITECTURE.md`, add the following section:

```markdown
## ViePilot organization context

> **Active profile**: `{profile_id}` — `{absolute path to profile file}` — binding `.viepilot/META.md`.

```

Then add **2–8 bullets** summarizing (no secrets) from the **Organization**, **Branding & voice**, and **Audience** sections of the profile file.

- If **`profile_resolved: none`**: add one line below the overview: *No ViePilot global profile bound — organization context comes from Step 0 only.*

Before writing diagrams, create a **diagram applicability matrix** from brainstorm signals (complexity, service boundaries, event usage, deployment shape, user-flow complexity, integration surface):

| Diagram type | Status | Rule |
|--------------|--------|------|
| `system-overview` | required/optional/N/A | Required if >1 major component or integration boundary |
| `data-flow` | required/optional/N/A | Required when request/response or data pipeline is central |
| `event-flows` | required/optional/N/A | Required when async events/webhooks/queues exist |
| `module-dependencies` | required/optional/N/A | Required when multi-module/layer boundaries matter |
| `deployment` | required/optional/N/A | Required for multi-env/distributed deployment concerns |
| `user-use-case` | required/optional/N/A | Required when user journey/actor interactions drive design |

Generation rules:
- `required`: include explicit ` ```mermaid ` block in `.viepilot/ARCHITECTURE.md`
- `optional`: may be simplified or merged with a nearby section, but keep section heading discoverable
- `N/A`: keep heading and add one-line rationale (`Not applicable: ...`) so `vp-audit` and `vp-auto` can interpret intent
- Never default to “all six detailed diagrams”; diagram depth must scale with project complexity from brainstorm.

### Architecture diagram source files on disk (ENH-022)

When a diagram type is **`required`** or **`optional`** and you emit a **non-empty Mermaid diagram** for it, also persist the **same** diagram body (Mermaid source only — **no** markdown fences) under **`.viepilot/architecture/`** using the canonical filenames below. When status is **`N/A`** or the section has **no** real diagram (placeholder-only / rationale-only), **do not** create the matching `.mermaid` file (and remove a stale file if regenerating a project).

| Diagram type (matrix key) | File (under `.viepilot/architecture/`) |
|---------------------------|----------------------------------------|
| `system-overview` | `system-overview.mermaid` |
| `data-flow` | `data-flow.mermaid` |
| `event-flows` | `event-flows.mermaid` |
| `module-dependencies` | `module-dependencies.mermaid` |
| `deployment` | `deployment.mermaid` |
| `user-use-case` | `user-use-case.mermaid` |

**Single source of truth (mirror policy):** the line-for-line Mermaid **inside** the ` ```mermaid ` fence in `.viepilot/ARCHITECTURE.md` must match the contents of the paired `.viepilot/architecture/<name>.mermaid` file. If you update one, update the other in the same crystallize pass.

**System overview exception:** if the overview uses a non-Mermaid diagram (e.g. ASCII in a plain ` ``` ` block) and matrix marks `system-overview` as `required`, prefer converting to Mermaid for consistency; if you keep ASCII only, **omit** `system-overview.mermaid` and state that choice in the matrix reason column.

**Discoverability:** in `.viepilot/ARCHITECTURE.md`, under each diagram section that has a sidecar file, add a line with bold label **Diagram source** and an inline-code path `.viepilot/architecture/<filename>.mermaid`.

Create `.viepilot/architecture/` only when at least one `.mermaid` file will be written (empty directory otherwise is unnecessary).
</step>

<step name="generate_context">
## Step 5: Generate PROJECT-CONTEXT.md

Create `.viepilot/PROJECT-CONTEXT.md` using template:
`@$HOME/.cursor/viepilot/templates/project/PROJECT-CONTEXT.md`

Extract:
- Domain knowledge
- Key concepts
- Business rules
- Naming conventions
- Constraints

**FEAT-009 — ViePilot active profile block:** If the profile was resolved in Step 0, insert **before** `<domain_knowledge>` (or immediately after the file title) the following section:

```markdown
## ViePilot active profile (FEAT-009)

| Field | Value |
|-------|-------|
| profile_id | … |
| profile file | … |
| org_tag | … |

**Summary (non-secret):** …

```

If no profile: a single line *Profile binding not configured (`META.md` or global profile file missing).*
</step>

<step name="generate_rules">
## Step 6: Generate SYSTEM-RULES.md

Create `.viepilot/SYSTEM-RULES.md` using template:
`@$HOME/.cursor/viepilot/templates/project/SYSTEM-RULES.md`

Include:
- Architecture rules
- Coding rules (language-specific)
- Comment standards (good/bad examples)
- Versioning (SemVer)
- Git conventions (Conventional Commits)
- Changelog standards (Keep a Changelog)
- Contributor standards
- Quality gates
- Forbidden patterns
- Stack-specific enforcement:
  - Must follow cached stack `Do/Don't` guidance
  - Require official-source alignment for framework-specific implementation
</step>

<step name="generate_roadmap">
## Step 7: Generate ROADMAP.md

Create `.viepilot/ROADMAP.md` using template:
`@$HOME/.cursor/viepilot/templates/project/ROADMAP.md`

From brainstorm `phases_inventory`:
1. Generate phases in order: Phase 1, Phase 2, Phase 3... from `phases_inventory`.
2. For each phase:
   - Define goal
   - Break into tasks
   - Set acceptance criteria
   - Add verification checkpoints
   - Estimate complexity (S/M/L/XL)
3. Define dependencies between phases.
4. Each phase: tasks, acceptance criteria, verification commands.
5. No Post-MVP / horizon block needed — all work is already in phases.
</step>

<step name="generate_schemas">
## Step 8: Generate schemas/

Create `.viepilot/schemas/`:

**database-schema.sql**
- Extract from brainstorm
- Add proper comments
- Include indexes, constraints

**kafka-topics.yaml**
- List all topics
- Define message schemas
- Include examples

**api-contracts.yaml** (OpenAPI stub)
- Endpoint definitions
- Request/Response schemas
- Auth requirements
</step>

<step name="generate_tracker">
## Step 9: Initialize TRACKER.md

Create `.viepilot/TRACKER.md` using template:
`@$HOME/.cursor/viepilot/templates/project/TRACKER.md`

Initialize:
- Current state (all phases not_started)
- Progress overview (0%)
- Decision log (import from brainstorm)
- Version info (0.1.0-alpha)
- Next action

Create empty `.viepilot/HANDOFF.json`
</step>

<step name="generate_phase_dirs">
## Step 10: Create Phase Directories

For each phase in ROADMAP.md:
```bash
mkdir -p .viepilot/phases/{NN}-{phase-slug}/tasks/
```

Create:
- `SPEC.md` - Phase specification
- `PHASE-STATE.md` - Initial state (not_started)
- `tasks/` directory with task files
</step>

<step name="generate_project_files">
## Step 11: Generate Project Files

**CHANGELOG.md**
```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup

## [0.1.0] - {date}

### Added
- Project initialization via ViePilot
- Architecture documentation
- Development roadmap

[Unreleased]: {repo}/compare/v0.1.0...HEAD
[0.1.0]: {repo}/releases/tag/v0.1.0
```

**CONTRIBUTING.md** - From template with org info
**CONTRIBUTORS.md** - With lead developer
**LICENSE** - Based on chosen license
**README.md** - Project overview with links to docs
</step>

<step name="commit_confirm">
## Step 12: Commit & Confirm

```bash
git add .viepilot/ CHANGELOG.md CONTRIBUTING.md CONTRIBUTORS.md LICENSE README.md
git commit -m "feat: initialize project with ViePilot

- Add project documentation (.viepilot/)
- Add architecture and coding standards
- Add development roadmap
- Add changelog and contributing guidelines"
git push
```

Display summary:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► CRYSTALLIZE COMPLETE ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Project: {project_name}
 Package: {package_base_id}
 License: {license}

 Created:
 ├── .viepilot/
 │   ├── AI-GUIDE.md
 │   ├── PROJECT-META.md
 │   ├── ARCHITECTURE.md
 │   ├── architecture/   (*.mermaid sidecars when diagrams generated — ENH-022)
 │   ├── PROJECT-CONTEXT.md
 │   ├── SYSTEM-RULES.md
 │   ├── ROADMAP.md ({phase_count} phases)
 │   ├── TRACKER.md
 │   └── schemas/
 │
 ├── CHANGELOG.md
 ├── CONTRIBUTING.md
 ├── CONTRIBUTORS.md
 ├── LICENSE
 └── README.md

 Phases: {phase_count}
 Tasks: {total_task_count}
 
 Next step: /vp-auto
 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Note: global stack cache at `~/.viepilot/stacks/` is machine-level knowledge and is not committed to project git.
</step>

</process>

<success_criteria>
- [ ] All metadata collected
- [ ] Official research completed for each selected stack
- [ ] Global stack cache written under ~/.viepilot/stacks/{stack}/
- [ ] Step 1: phase assignment gate satisfied (phases_inventory recorded, all features assigned)
- [ ] All artifacts created in .viepilot/
- [ ] PROJECT-META.md complete
- [ ] SYSTEM-RULES.md has all standards
- [ ] ROADMAP.md has phases with tasks in order from phases_inventory
- [ ] Phase directories created
- [ ] Project files created
- [ ] Git committed
</success_criteria>
