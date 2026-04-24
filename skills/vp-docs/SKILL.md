---
name: vp-docs
description: "Generate comprehensive documentation for the project"
version: 0.2.1
---

<greeting>
## Invocation Banner

Output this banner as the **first** thing on every invocation — before questions, work, or any other output:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► VP-DOCS  v0.2.1 (fw 2.19.0)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
</greeting>
<version_check>
## Version Update Check (ENH-072)

After displaying the greeting banner, run:
```bash
node "$HOME/.claude/viepilot/bin/vp-tools.cjs" check-update --silent
```

**If exit code = 1** (update available — new version printed to stdout):
Display notice banner before any other output:
```
┌──────────────────────────────────────────────────────────────────┐
│ ✨ ViePilot {latest_version} available  (installed: {current})   │
│    npm i -g viepilot && vp-tools install --target {adapter_id}   │
└──────────────────────────────────────────────────────────────────┘
```
Replace `{latest_version}` with stdout from the command, `{current}` with the installed
version, `{adapter_id}` with the active adapter (claude-code / cursor / antigravity / codex / copilot).

**If exit code = 0 or command unavailable**: silent, continue.

**Suppression rules:**
- `--no-update-check` flag on skill invocation → skip this step entirely
- `config.json` → `update.check: false` → skip this step entirely
- Show at most once per session (`update_check_done` session guard)
</version_check>
<persona_context>
## Persona Context Injection (ENH-073)
At skill start, run:
```bash
node "$HOME/.claude/viepilot/bin/vp-tools.cjs" persona auto-switch
node "$HOME/.claude/viepilot/bin/vp-tools.cjs" persona context
```
Inject the output as `## User Persona` context before any task execution.
Silent if command unavailable or errors.
</persona_context>


<cursor_skill_adapter>
## A. Skill Invocation
- Skill được gọi khi user mention `vp-docs`, `/vp-docs`, "docs", "documentation", "tài liệu"
- Treat all user text after the skill mention as `{{VP_ARGS}}`

## B. User Prompting
Prompt user conversationally with options.

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

- This skill edits **`docs/`**, index, README related to docs — does **not** implement **`lib/`**, **`tests/`**, default product logic; that is **`/vp-auto`**. Explicit override required. See `workflows/request.md`.
</implementation_routing_guard>


<objective>
Generate comprehensive documentation from code and artifacts.

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
- **FEAT-009:** Optional ViePilot global profile from `.viepilot/META.md` + `~/.viepilot/profiles/` for attribution/tone (`workflows/documentation.md` §0A)
</objective>

<execution_context>
@$HOME/{envToolDir}/workflows/documentation.md
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
# Forge-agnostic remote URL parser — supports GitHub, GitLab, Bitbucket, Azure DevOps, Gitea, self-hosted
REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
if echo "$REMOTE_URL" | grep -q 'dev\.azure\.com'; then
  GIT_HOST="dev.azure.com"
  GIT_OWNER=$(echo "$REMOTE_URL" | sed 's|.*dev\.azure\.com/||; s|/.*||')
  GIT_REPO=$(echo "$REMOTE_URL" | sed 's|.*/_git/||; s|\.git$||; s|/$||')
elif echo "$REMOTE_URL" | grep -q '^git@'; then
  GIT_HOST=$(echo "$REMOTE_URL" | sed 's|^git@||; s|:.*||')
  GIT_OWNER=$(echo "$REMOTE_URL" | sed 's|^git@[^:]*:||; s|/.*||')
  GIT_REPO=$(echo "$REMOTE_URL" | sed 's|^git@[^:]*:[^/]*/||; s|\.git$||')
else
  GIT_HOST=$(echo "$REMOTE_URL" | sed 's|^https\?://||; s|/.*||')
  GIT_OWNER=$(echo "$REMOTE_URL" | sed 's|^https\?://[^/]*/||; s|/.*||')
  GIT_REPO=$(echo "$REMOTE_URL" | sed 's|^https\?://[^/]*/[^/]*/||; s|\.git$||; s|/$||')
fi
# Fallback: use searchable placeholder, not 'your-org'
[ -z "$GIT_OWNER" ] && GIT_HOST="{GIT_HOST}" && GIT_OWNER="{GIT_OWNER}" && GIT_REPO="{GIT_REPO}"

ACTUAL_SKILLS=$(ls skills/*/SKILL.md 2>/dev/null | wc -l | tr -d ' ')
ACTUAL_WORKFLOWS=$(ls workflows/*.md 2>/dev/null | wc -l | tr -d ' ')
```

> Use `$GIT_HOST`, `$GIT_OWNER`, `$GIT_REPO` in all generated files.
> Use `$ACTUAL_SKILLS` and `$ACTUAL_WORKFLOWS` for counts.
> **Never write** `your-org`, `YOUR_USERNAME`, `YOUR_ORG` into generated files.

### Step 0A: ViePilot active profile (FEAT-009)

After Step 0: resolve `.viepilot/META.md` → global profile file (same rules as `workflows/crystallize.md`). Keep working notes (org, website, audience, branding) for prose docs; do **not** fail if missing. Details: `workflows/documentation.md` §0A.

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
- [ ] **FEAT-009:** If profile exists — use for attribution where appropriate; if not — silently skip (no incorrect placeholders)
</success_criteria>
