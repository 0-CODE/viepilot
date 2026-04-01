---
name: vp-crystallize
description: "Chuyển đổi brainstorm thành executable artifacts"
version: 0.3.0
---

<cursor_skill_adapter>
## A. Skill Invocation
- Skill được gọi khi user mention `vp-crystallize`, `/vp-crystallize`, hoặc "crystallize", "setup project"
- Treat all user text after the skill mention as `{{VP_ARGS}}`

## B. User Prompting
Prompt user conversationally với numbered list options.

## C. Tool Usage
Use Cursor tools: `Shell`, `ReadFile`, `Glob`, `rg`, `ApplyPatch`, `WebSearch`, `WebFetch`, `Subagent`
</cursor_skill_adapter>

<objective>
Chuyển đổi brainstorm sessions thành structured artifacts để AI có thể autonomous execution.

**Creates:**
```
.viepilot/
├── AI-GUIDE.md          # Navigation cho AI
├── PROJECT-META.md      # Metadata dự án
├── ARCHITECTURE.md      # System design
├── PROJECT-CONTEXT.md   # Domain knowledge
├── SYSTEM-RULES.md      # Coding rules & standards
├── ROADMAP.md           # Phases & tasks
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

**Stack intelligence (global cache):**
- `~/.viepilot/stacks/{stack}/SUMMARY.md`
- `~/.viepilot/stacks/{stack}/BEST-PRACTICES.md`
- `~/.viepilot/stacks/{stack}/ANTI-PATTERNS.md`
- `~/.viepilot/stacks/{stack}/SOURCES.md`
- `.viepilot/STACKS.md` (project-local index to global cache)

**After:** Ready for `/vp-auto`
</objective>

<execution_context>
@$HOME/.cursor/viepilot/workflows/crystallize.md
@$HOME/.cursor/viepilot/templates/project/
</execution_context>

<process>
Execute workflow from `@$HOME/.cursor/viepilot/workflows/crystallize.md`

Key steps:

### Step 0: Collect Project Metadata
Ask user for:
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
- Validate completeness

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

### Step 3: Generate PROJECT-META.md
- Project info
- Organization info
- Package structure
- Developer info
- File headers template

### Step 4: Generate ARCHITECTURE.md
- System overview
- Services definitions
- Data flow
- Technology decisions

### Step 5: Generate PROJECT-CONTEXT.md
- Domain knowledge
- Business rules
- Conventions
- Constraints

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
- Break into phases
- Define tasks per phase
- Set acceptance criteria
- Add verification checkpoints

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
- [ ] ROADMAP.md has phases with tasks
- [ ] TRACKER.md initialized
- [ ] Project files created
- [ ] Git committed
</success_criteria>
