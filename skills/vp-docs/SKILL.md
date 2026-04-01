---
name: vp-docs
description: "Generate comprehensive documentation cho dự án"
version: 0.1.0
---

<cursor_skill_adapter>
## A. Skill Invocation
- Skill được gọi khi user mention `vp-docs`, `/vp-docs`, "docs", "documentation", "tài liệu"
- Treat all user text after the skill mention as `{{VP_ARGS}}`

## B. User Prompting
Prompt user conversationally với options.

## C. Tool Usage
Use Cursor tools: `Shell`, `ReadFile`, `Glob`, `rg`, `ApplyPatch`, `WebSearch`, `WebFetch`, `Subagent`
</cursor_skill_adapter>
<scope_policy>
## ViePilot Namespace Guard (BUG-004)
- Default mode: only use and reference `vp-*` skills in ViePilot workflows.
- External skills (`non vp-*`) are out of framework scope unless user explicitly opts in.
- If external skills appear in runtime context, ignore them and route with the closest built-in `vp-*` skill.
</scope_policy>


<objective>
Generate comprehensive documentation từ code và artifacts.

**Creates/Updates:**
```
docs/
├── api/
│   ├── rest-api.md
│   ├── graphql-schema.md
│   ├── kafka-events.md
│   └── websocket-api.md
├── dev/
│   ├── getting-started.md
│   ├── architecture.md
│   ├── contributing.md
│   ├── testing.md
│   └── deployment.md
├── user/
│   ├── quick-start.md
│   └── features/
└── README.md (index)

docs/skills-reference.md (incremental update — add missing skills by scanning skills/ dir)
README.md (Documentation table, Project Structure section)
CHANGELOG.md (updated)
```

**Context resolved at runtime (never hardcoded):**
- GitHub owner/repo from `git remote get-url origin`
- Skills count from `ls skills/*/SKILL.md | wc -l`
- Workflows count from `ls workflows/*.md | wc -l`
</objective>

<execution_context>
@$HOME/.cursor/viepilot/workflows/documentation.md
</execution_context>

<context>
Optional flags:
- `--all` : Generate all documentation
- `--api` : API documentation only
- `--dev` : Developer guide only
- `--user` : User guide only
- `--changelog` : Update changelog only
</context>

<process>

### Step 0: Resolve Project Context (ALWAYS first)
```bash
# Read actual GitHub URL — never use hardcoded placeholder
REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
GITHUB_SLUG=$(echo "$REMOTE_URL" | sed 's|.*github\.com[:/]||; s|\.git$||')
GITHUB_OWNER=$(echo "$GITHUB_SLUG" | cut -d'/' -f1)
GITHUB_REPO=$(echo "$GITHUB_SLUG" | cut -d'/' -f2)
# Fallback: use searchable placeholder, not 'your-org'
[ -z "$GITHUB_OWNER" ] && GITHUB_OWNER="{GITHUB_OWNER}" && GITHUB_REPO="{GITHUB_REPO}"

ACTUAL_SKILLS=$(ls skills/*/SKILL.md 2>/dev/null | wc -l | tr -d ' ')
ACTUAL_WORKFLOWS=$(ls workflows/*.md 2>/dev/null | wc -l | tr -d ' ')
```

> Use `$GITHUB_OWNER/$GITHUB_REPO` in all generated files.
> Use `$ACTUAL_SKILLS` and `$ACTUAL_WORKFLOWS` for counts.
> **Never write** `your-org`, `YOUR_USERNAME`, `YOUR_ORG` into generated files.

### Step 1: Ask Documentation Scope
```
Which documentation would you like to generate?

1. All - Generate complete documentation
2. API - REST, GraphQL, Kafka, WebSocket docs
3. Developer Guide - Setup, architecture, contributing
4. User Guide - Quick start, feature guides
5. Changelog - Update from git history
```

### Step 2A: API Documentation
```yaml
sources:
  - Code annotations (@OpenAPI, @GraphQL)
  - .viepilot/schemas/api-contracts.yaml
  - Controller/Resolver classes
  - Kafka topic definitions

generate:
  rest-api.md:
    - Endpoints grouped by resource
    - Request/Response examples
    - Authentication requirements
    - Error codes
    
  graphql-schema.md:
    - Types and queries
    - Mutations
    - Subscriptions
    - Example queries
    
  kafka-events.md:
    - Topic list with descriptions
    - Message schemas
    - Producer/Consumer examples
    
  websocket-api.md:
    - Connection flow
    - Event types
    - Message formats
```

### Step 2B: Developer Guide
```yaml
sources:
  - .viepilot/ARCHITECTURE.md
  - .viepilot/SYSTEM-RULES.md
  - .viepilot/PROJECT-CONTEXT.md
  - README.md
  - Docker/deployment configs

generate:
  getting-started.md:
    - Prerequisites
    - Local setup steps
    - Running the project
    - Common issues
    
  architecture.md:
    - System overview (from ARCHITECTURE.md)
    - Service descriptions
    - Data flow diagrams
    
  contributing.md:
    - Development workflow
    - Code standards
    - PR process
    - Testing requirements
    
  testing.md:
    - Test structure
    - Running tests
    - Writing new tests
    - Coverage requirements
    
  deployment.md:
    - Environments
    - Deployment steps
    - Configuration
    - Monitoring
```

### Step 2C: User Guide
```yaml
sources:
  - Feature specs from phases
  - UI components (if frontend)
  - Business rules from PROJECT-CONTEXT.md

generate:
  quick-start.md:
    - Getting started
    - Basic usage
    - Common tasks
    
  features/:
    - One file per major feature
    - Screenshots if UI
    - Step-by-step guides
    
  faq.md:
    - Common questions
    - Troubleshooting
```

### Step 2D: Changelog Update
```yaml
sources:
  - Git commits since last version
  - .viepilot/TRACKER.md decision log
  - Phase SUMMARY.md files

process:
  1. Parse commits by type (feat, fix, etc.)
  2. Group by category (Added, Changed, Fixed, etc.)
  3. Add to [Unreleased] section
  4. Include commit references
```

### Step 3: Generate Files
Use templates and extracted content to generate markdown files.

### Step 3B: Update skills-reference.md (incremental)
```bash
# Scan skills/ directory — source of truth
SKILLS=$(ls skills/*/SKILL.md 2>/dev/null | sed 's|skills/||; s|/SKILL.md||' | sort)
DOCUMENTED=$(grep "^## /vp-" docs/skills-reference.md 2>/dev/null | sed 's|## /||' | sort)
MISSING=$(comm -23 <(echo "$SKILLS") <(echo "$DOCUMENTED"))
```
For each skill in `$MISSING`: append section to `docs/skills-reference.md`.
Do NOT overwrite existing sections (preserve manual edits).

### Step 4: Create Index
Update `docs/README.md` with:
- Documentation index
- Quick links
- Last updated date

Also update root `README.md`:
- Documentation table: add links to newly generated docs
- Project Structure `docs/` tree: reflect actual subdirectories

### Step 5: Commit
```bash
git add docs/ CHANGELOG.md
git commit -m "docs: update documentation"
```

### Step 6: Confirm
```
✓ Documentation generated

Files created/updated:
- docs/api/ ({count} files)
- docs/dev/ ({count} files)
- docs/user/ ({count} files)
- CHANGELOG.md

View at: docs/README.md
```
</process>

<success_criteria>
- [ ] Requested documentation generated
- [ ] Code examples included where relevant
- [ ] Cross-references added between docs
- [ ] Index updated
- [ ] Changelog reflects recent changes
- [ ] GitHub URLs use actual repo (no `your-org`/`YOUR_USERNAME` placeholders)
- [ ] skills-reference.md has sections for all skills in skills/ directory
- [ ] Root README.md Documentation table updated
- [ ] Git committed
</success_criteria>
