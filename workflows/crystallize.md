<purpose>
Chuyển đổi brainstorm sessions thành structured artifacts để AI có thể autonomous execution.
</purpose>

<process>

<step name="collect_metadata">
## Step 0: Collect Project Metadata

Hỏi user các thông tin dự án:

### Basic Info
```
1. Tên dự án?
   Default: (extract from brainstorm)
   
2. Mô tả ngắn gọn (1-2 câu)?
```

### Organization Info
```
3. Tên công ty/tổ chức phát triển?

4. Website công ty? (optional)
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
8. Tên người phát triển chính?

9. Email người phát triển chính?

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
    
14. Năm bắt đầu dự án?
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
6. **Product horizon (mandatory)** — parse `## Product horizon` when present (contract: `workflows/brainstorm.md`):
   - Classify bullets under **MVP (ship first)**, **Post-MVP (after first release)**, and **Future / exploratory** using trailing tags `(MVP)` / `(Post-MVP)` / `(Future)` when present.
   - Capture **Non-goals for MVP** and **Deferred capabilities (from MVP)** as first-class lists (these feed roadmap horizon and architecture constraints).
   - Record **extensibility / platform notes** that imply deferred work (e.g., plugin model later, multi-tenant after MVP) if written in horizon or architecture sections.
   - If the session states **single-release only** / **no deferred epics** (see brainstorm scope note), record `horizon_mode: single_release` in working notes for Step 7.

**Consolidate across sessions** into a single **horizon inventory** (dedupe by capability name; if the same capability appears under conflicting tiers → stop and ask the user which tier wins).

**Horizon validation gate (before leaving Step 1):**
- [ ] Every brainstorm file was checked for `## Product horizon` **or** an explicit in-session single-release / no-deferred statement.
- [ ] If `## Product horizon` is missing and the session still discusses releases beyond MVP without a single-release statement → stop and ask the user to update the session (e.g. `/vp-brainstorm` save) or confirm **single-release only** for the whole project.
- [ ] Either **horizon inventory is non-empty** (Post-MVP/Future/deferred items captured) **or** **single-release** is explicitly recorded — no silent default.

Validate completeness:
- [ ] Tech stack defined
- [ ] Core features identified
- [ ] Database schema exists
- [ ] API requirements clear
- [ ] Product horizon processed per gate above (inventory or explicit single-release)

If gaps found → ask user to clarify or return to brainstorm.
</step>

<step name="consume_ui_direction">
## Step 1A: Consume UI Direction Artifacts (for UI/UX projects)

If brainstorm indicates frontend/UI scope, check for direction artifacts:

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

If UI scope is present but artifacts are missing:
- Warn user and request either:
  1. generate UI direction via `/vp-brainstorm --ui`, or
  2. explicitly continue with assumptions.
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

<step name="generate_ai_guide">
## Step 2: Generate AI-GUIDE.md

Create `.viepilot/AI-GUIDE.md` using template:
`@$HOME/.cursor/viepilot/templates/project/AI-GUIDE.md`

Customize with:
- Project-specific file references
- Context loading strategy based on project size
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

From brainstorm features/MVP breakdown:
1. Create **executable MVP phases** (what `/vp-auto` can run next; near-term delivery only).
2. For each phase:
   - Define goal
   - Break into tasks
   - Set acceptance criteria
   - Add verification checkpoints
   - Estimate complexity (S/M/L/XL)
3. Define dependencies between MVP phases.
4. **Post-MVP / product horizon (mandatory section in `.viepilot/ROADMAP.md`):**
   - After MVP phases, always add a dedicated block (heading e.g. `## Post-MVP / Product horizon` or match the project template’s equivalent) that is **never omitted**:
     - If Step 1 recorded **single-release** / no deferred epics: state explicitly *e.g.* **Single-release scope — no separate post-MVP epics** and that deferred capabilities are none by confirmation (do not invent future work).
     - Otherwise: summarize **horizon inventory** items as **epic-level** entries (dependencies, rough sequencing OK; full task breakdown optional).
   - Where a future epic depends on MVP deliverables, note **dependency links** back to the MVP phase(s) that unlock it.
5. **ROADMAP self-check before finalize:**
   - If Step 1 **horizon inventory** is non-empty but the draft ROADMAP **drops** those items or lacks the horizon block → **stop** and ask the user to reconcile (do not ship a roadmap that silently omits post-MVP content from brainstorm).
   - If brainstorm contained Post-MVP ideas only in free text without `## Product horizon` → you should already have stopped in Step 1; do not proceed to commit ROADMAP.
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
- [ ] Step 1: product horizon extracted **or** explicit single-release recorded; validation gate satisfied
- [ ] All artifacts created in .viepilot/
- [ ] PROJECT-META.md complete
- [ ] SYSTEM-RULES.md has all standards
- [ ] ROADMAP.md has MVP phases with tasks **and** mandatory Post-MVP / horizon block (or explicit single-release statement)
- [ ] Phase directories created
- [ ] Project files created
- [ ] Git committed
</success_criteria>
