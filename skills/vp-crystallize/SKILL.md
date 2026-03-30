---
name: vp-crystallize
description: "Chuyển đổi brainstorm thành executable artifacts"
version: 0.1.0
---

<cursor_skill_adapter>
## A. Skill Invocation
- Skill được gọi khi user mention `vp-crystallize`, `/vp-crystallize`, hoặc "crystallize", "setup project"
- Treat all user text after the skill mention as `{{VP_ARGS}}`

## B. User Prompting
Prompt user conversationally với numbered list options.

## C. Tool Usage
Use Cursor tools: `Shell`, `StrReplace`, `Read`, `Write`, `Glob`, `Grep`, `Task`
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
- Validate completeness

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
- [ ] All artifacts created in .viepilot/
- [ ] PROJECT-META.md has complete metadata
- [ ] SYSTEM-RULES.md has all standards
- [ ] ROADMAP.md has phases with tasks
- [ ] TRACKER.md initialized
- [ ] Project files created
- [ ] Git committed
</success_criteria>
