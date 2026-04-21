---
name: vp-crystallize
description: "Convert brainstorm sessions into executable artifacts"
version: 0.8.0
---

<greeting>
## Invocation Banner

Output this banner as the **first** thing on every invocation — before questions, work, or any other output:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► VP-CRYSTALLIZE  v0.8.0 (fw 2.19.0)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
</greeting>

<cursor_skill_adapter>
## A. Skill Invocation
- Skill được gọi khi user mention `vp-crystallize`, `/vp-crystallize`, hoặc "crystallize", "setup project"
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

- Creates **artifacts** in `.viepilot/` (and template copy) from brainstorm — does **not** replace **`/vp-auto`** for implementing application code / framework shipping. Backlog feature code: **`/vp-evolve`** + **`/vp-auto`**. See `workflows/request.md`.
</implementation_routing_guard>


<objective>
Convert brainstorm sessions into structured artifacts for autonomous AI execution.

**Creates:**
```
.viepilot/
├── AI-GUIDE.md          # AI navigation guide
├── PROJECT-META.md      # Project metadata
├── ARCHITECTURE.md      # System design
├── architecture/        # ENH-022: *.mermaid sidecars (mirror fenced diagrams)
├── PROJECT-CONTEXT.md   # Domain knowledge + `<product_vision>` (phased scope)
├── SYSTEM-RULES.md      # Coding rules & standards
├── ROADMAP.md           # Phases & tasks in order from phases_inventory
├── TRACKER.md           # Progress tracking
├── HANDOFF.json         # Machine-readable state
└── schemas/             # Database, API, Kafka schemas
```

**Also creates:**
- `CHANGELOG.md`
- `CONTRIBUTING.md`
- `CONTRIBUTORS.md`
- `LICENSE`
- Updated `README.md`

**ViePilot profile (FEAT-009):**
- Reads `.viepilot/META.md` → file `~/.viepilot/profiles/<slug>.md` (contract: `docs/dev/global-profiles.md`); pre-fills Step 0; merges into **ARCHITECTURE** (`## ViePilot organization context`), **PROJECT-CONTEXT** (`## ViePilot active profile`), **AI-GUIDE** quick context.

**Stack intelligence (global cache):**
- `~/.viepilot/stacks/{stack}/SUMMARY.md`
- `~/.viepilot/stacks/{stack}/BEST-PRACTICES.md`
- `~/.viepilot/stacks/{stack}/ANTI-PATTERNS.md`
- `~/.viepilot/stacks/{stack}/SOURCES.md`
- `.viepilot/STACKS.md` (project-local index to global cache)

**After:** Ready for `/vp-auto`

**UI direction hard gate (ENH-026):**
- Step 1A scans brainstorm for UI signal keywords; if ≥3 signals detected + no artifacts → **STOP** with 2-option dialogue (go back to brainstorm --ui OR proceed with assumptions written to ARCHITECTURE.md). Enforces direction-first workflow before crystallize proceeds.

**Architect artifacts consumption (FEAT-011):**
- Step 1D reads `.viepilot/architect/{session}/notes.md` YAML — imports `decisions[]` → ARCHITECTURE.md, uses `tech_stack{}` as authoritative stack (conflict → ask user), surfaces `open_questions[]` with `status: open`. Soft suggestion (not hard block) when architect dir missing but ≥5 services detected.

**Admin & Governance Export (ENH-063):**
- Step 1D item 7: if `admin.html` or `notes.md ## admin` exists in architect workspace → append `## Admin & Governance` table to `.viepilot/PROJECT-CONTEXT.md` (columns: Capability | Required | Phase | Notes) + Admin Personas table. Records `admin_imported` and `admin_capabilities_count` in working notes.

**Content Management Export (ENH-065):**
- Step 1D item 8: if `content.html` or `notes.md ## content` exists in architect workspace → append `## Content Management` table to `.viepilot/PROJECT-CONTEXT.md` (columns: Content Type | Created By | Lifecycle | Key Fields | Phase) + Media/Storage and Localization sub-tables. Records `content_imported` and `content_types_count` in working notes.

**Mandatory Workspace Read Gates (ENH-064):**
- **Architect workspace (Step 1D):** if `.viepilot/architect/` exists → reads ALL 12 pages front-to-back before any extraction. `architect_read_complete: true` required. Missing `notes.md` → STOP.
- **UI Direction workspace (Step 1A strengthened):** if `.viepilot/ui-direction/` exists → reads ALL pages/*.html + ALL notes.md sections. `ui_direction_read_complete: true` required. Pages inventory mismatch → STOP.
- **Cross-reference gate (Step 1F):** when both workspaces present → validates coverage matrix; warns on Phase 1 features with no architect OR UI coverage.
- **No silent skip**: any workspace that exists MUST be fully read. Partial reads are not allowed.

**Language configuration (ENH-032):**
- Step 0-A reads `~/.viepilot/config.json` → `DOCUMENT_LANG` (default: `en`) and `COMMUNICATION_LANG` (default: `en`).
- `DOCUMENT_LANG` controls content language for all generated files (ROADMAP, TRACKER, ARCHITECTURE, etc.).
- `COMMUNICATION_LANG` controls prompt/confirmation language for this session.
- Configure via: `vp-tools config set language.document vi`

**Brownfield Mode (`--brownfield`) — FEAT-018:**

Use when adopting ViePilot on an **existing project** (no brainstorm session required).

Flags:
- `--brownfield` : Explicit brownfield mode
- *(auto-detected)* : Triggers when `docs/brainstorm/` is absent/empty AND `.viepilot/` does not exist

Scanner runs 12 signal categories across the existing codebase:
1. **Build manifests** — `package.json`, `pom.xml`, `pyproject.toml`, `Cargo.toml`, `go.mod`, etc. (11 platforms) → infers project_name, version, language, deps
2. **Framework detection** — 40+ dependency patterns → backend/frontend/ORM/auth/broker/test frameworks
3. **Architecture layers** — 18 directory patterns → controller/service/repository/frontend/infra/etc.
4. **Database schema signals** — Flyway/Liquibase/Prisma/Rails migrations + docker-compose services
5. **API contracts** — OpenAPI, gRPC `.proto`, GraphQL schemas
6. **Infrastructure** — Dockerfile, docker-compose, k8s, Terraform, Vercel, Fly.io, etc. (16 patterns)
7. **Environment config** — `.env.example` key names (never reads `.env`)
8. **Test coverage** — Jest/pytest/JUnit/Cypress config + coverage report dirs
9. **Code quality tools** — ESLint/Prettier/SonarQube/pre-commit/golangci-lint/etc. (14 patterns)
10. **Documentation** — README, CHANGELOG, ADRs, docs/ (priority-ordered)
11. **Git history** — commit convention, version pattern, contributors, repo URL
12. **Language survey** — file extension glob → language distribution

**Multi-repo / monorepo support (ENH-047):**

- **Git submodule detection** — reads `.gitmodules`; scans each initialized submodule path (Signal Cat 1+2+4); records uninitialized paths as `primary_language: MISSING`. Never runs `git submodule update` — read-only.
- **Polyrepo hints** — detects docker-compose `../` build contexts, `file:../` deps, CI cross-repo clones, README external links, Makefile `cd ../` targets; outputs `polyrepo_hints[]`; prompts user to supply `related_repos[]` (optional).
- **Per-module gap detection** — every `modules[]` entry carries `gap_tier` (DETECTED/ASSUMED/MISSING), `must_detect_status{}` (evidence per field: value + source + tier), and `open_questions[]`. A module with `gap_tier: MISSING` blocks artifact generation with a targeted per-field prompt.

**Scan Report contains:**
- Root `gap_tier` (= worst tier across all modules: MISSING > ASSUMED > DETECTED)
- `modules[]` — one entry per workspace/submodule/root with `gap_tier`, `must_detect_status{}`, `open_questions[]`
- `polyrepo_hints[]` — polyrepo signals (omitted when empty, no empty arrays)
- `related_repos[]` — user-supplied sibling repos (omitted when empty)
- Root `open_questions[]` — includes rollup from all modules

Produces **Scan Report** (YAML) with DETECTED / ASSUMED / MISSING classification.
MUST-DETECT gaps (root: project_name, primary_language, ≥1 framework, current_version; per-module: primary_language, framework, module_purpose, entry_point) block artifact generation until user fills interactively.
Generates `docs/brainstorm/session-brownfield-import.md` stub for `vp-audit` compatibility.
Safety: never reads `.env`; skips `node_modules/`, `.git/`, `target/`, `build/`, `dist/`.
</objective>

<execution_context>
@$HOME/{envToolDir}/workflows/crystallize.md
@$HOME/{envToolDir}/templates/project/
</execution_context>

<process>
Execute workflow from `@$HOME/{envToolDir}/workflows/crystallize.md`

Key steps:

### Step 0: Collect Project Metadata
- **FEAT-009:** Load `.viepilot/META.md` + global profile file first (`workflows/crystallize.md`); set `profile_resolved` or `none`; pre-fill org/website when profile is present.
Ask user for (confirm proposals from profile if present):
- Project name, description
- Organization name, website
- Package Base ID (e.g., com.company.project)
- Maven Group ID, Artifact ID
- Lead developer info (name, email, GitHub)
- Repository URL
- License choice
- Inception year

### Step 1: Analyze Brainstorm
- Load all brainstorm sessions
- Extract: decisions, architecture, schemas, features
- Extract selected tech stacks
- **Phase assignment (ENH-030):** parse `## Phases` from brainstorm sessions; build `phases_inventory`; run phase assignment gate (all features must have a phase — full contract: `workflows/crystallize.md` Step 1)
- Validate completeness (tech stack, features, schema/API clarity, **phase assignment gate**)

### Step 1A: Consume UI direction (if present)
- Read `.viepilot/ui-direction/{session-id}/notes.md` first, then `style.css`, then HTML:
  - **Multi-page:** if `pages/*.html` exists → require `## Pages inventory` in `notes.md`, validate it lists every page file, read each `pages/*.html` plus hub `index.html` for navigation.
  - **Legacy:** no `pages/` → read `index.html` + `style.css` as before.
- Carry approved layout/component decisions into architecture + roadmap artifacts; **architecture must reference all pages** from inventory when multi-page.
- Mark assumptions explicitly if direction artifacts are missing or inventory/files mismatch.

### Step 1B: Official stack research (mandatory)
- For every selected stack, research official docs and authoritative sources
- Build concise "Do / Don't / Pitfalls" guidance
- If guidance is uncertain, ask user before locking decisions
- Tool policy:
  - Use `WebSearch` to discover candidate sources
  - Use `WebFetch` to read source content before extracting guidance
  - Prioritize official docs, specs, and maintainers' references over blog posts
  - Save source URLs and access date in `SOURCES.md`

### Step 1C: Write stack cache
- Persist guidance to `~/.viepilot/stacks/{stack}/...`
- Create `.viepilot/STACKS.md` for lookup mapping

### Step 2: Generate AI-GUIDE.md
- Quick lookup table
- Context loading strategy
- File relationships
- **FEAT-009:** Quick context for `profile_id` + profile path when resolved

### Step 3: Generate PROJECT-META.md
- Project info
- Organization info
- Package structure
- Developer info
- File headers template
- **FEAT-009:** Align Organization with confirmed profile content (public only)

### Step 4: Generate ARCHITECTURE.md
- System overview
- **FEAT-009:** Section `## ViePilot organization context` when profile is present (or none line)
- Services definitions
- Data flow
- Technology decisions
- Build **diagram applicability matrix** for:
  - `system-overview`, `data-flow`, `event-flows`, `module-dependencies`, `deployment`, `user-use-case`
- For each type assign status: `required` | `optional` | `N/A`
- Apply generation policy:
  - `required` => include concrete Mermaid block
  - `optional` => allow lightweight/merged representation
  - `N/A` => keep section heading + one-line rationale
- **ENH-022:** For each diagram type with real Mermaid, write **`.viepilot/architecture/<type>.mermaid`** (raw source) and keep it **identical** to the body inside the fenced ` ```mermaid ` block in `ARCHITECTURE.md`; omit files for `N/A` or no diagram — see `workflows/crystallize.md` Step 4.

### Step 5: Generate PROJECT-CONTEXT.md
- **FEAT-009:** Block `## ViePilot active profile (FEAT-009)` when binding is present
- Domain knowledge
- Business rules
- Conventions
- Constraints
- Fill **`<product_vision>`** from template (`templates/project/PROJECT-CONTEXT.md`): Project scope, Phase overview, anti-goals — aligned with brainstorm `## Phases` + Step 1 phases_inventory

### Step 6: Generate SYSTEM-RULES.md
- Architecture rules
- Coding rules
- Comment standards (good/bad examples)
- Versioning (SemVer)
- Git conventions (Conventional Commits)
- Changelog standards (Keep a Changelog)
- Quality gates
- Stack-specific rules from cache

### Step 7: Generate ROADMAP.md
- Use `templates/project/ROADMAP.md` — phases in order (Phase 1, Phase 2...) from `phases_inventory`; no Post-MVP block
- Each phase: tasks, acceptance criteria, verification commands
- **Self-check before finalize:** all phases from phases_inventory appear in ROADMAP; if mismatch → stop and ask user — see `workflows/crystallize.md` Step 7

### Step 8: Generate schemas/
- database-schema.sql
- kafka-topics.yaml
- api-contracts.yaml

### Step 9: Initialize TRACKER.md
- Current state
- Progress overview
- Decision log
- Version info

### Step 10: Generate Project Files
- CHANGELOG.md
- CONTRIBUTING.md
- CONTRIBUTORS.md
- LICENSE
- README.md (updated)

### Step 11: Commit & Confirm
- Git commit all artifacts
- Display summary
- Suggest: `/vp-auto`
</process>

<success_criteria>
- [ ] UI direction artifacts consumed for UI/UX scopes (or assumptions documented)
- [ ] Official stack research completed before architecture lock
- [ ] Global cache created for all selected stacks
- [ ] Project-local stack index (`.viepilot/STACKS.md`) created
- [ ] All artifacts created in .viepilot/
- [ ] PROJECT-META.md has complete metadata
- [ ] SYSTEM-RULES.md has all standards
- [ ] Step 1 phase assignment gate satisfied (phases_inventory recorded, all features assigned)
- [ ] PROJECT-CONTEXT.md includes populated **`<product_vision>`** (template placeholders filled from brainstorm)
- [ ] ROADMAP.md has phases with tasks in order from phases_inventory
- [ ] TRACKER.md initialized
- [ ] Project files created
- [ ] Git committed
- [ ] ARCHITECTURE diagram matrix is present and consistent (`required|optional|N/A`)
- [ ] **ENH-022:** Every generated Mermaid diagram has a `.viepilot/architecture/<canonical-name>.mermaid` file in sync with `ARCHITECTURE.md` (no extra files created for N/A)
- [ ] **FEAT-009:** When profile is bound — ARCHITECTURE + PROJECT-CONTEXT record the profile source; if not — state none / not configured explicitly
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
- License selection (Step 0 metadata)
- Brownfield overwrite confirmation (Step 0-B)
- Polyrepo related-repos prompt (Step 0-B)
- UI direction gate choice (Step 1A)
- Architect mode suggestion (Step 1D)

### Step 1E — Skill Decision Gate (FEAT-020)

After scope lock, before SPEC generation, crystallize checks for `## skills_used`
in the brainstorm session's notes.md:

- **No skills_used found** → step silently skipped
- **Skills found** → AUQ presents each skill (required / optional / exclude)
- **Decision written** to `PROJECT-CONTEXT.md ## Skills`

The `## Skills` decision is **final** — `/vp-auto` reads it at execution time
and injects skill best practices per task without re-prompting.

Install skills: `vp-tools install-skill <source>`
Registry: `vp-tools scan-skills`
Docs: `docs/user/features/skill-registry.md`
