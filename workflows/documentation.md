<purpose>
Generate comprehensive documentation from code and artifacts.
</purpose>

## ViePilot Skill Scope Policy (BUG-004)

- Default behavior: only use and suggest skills under `vp-*`.
- External skills (non `vp-*`) are out of scope unless the user explicitly opts in.
- If external skill references appear in runtime context, ignore them and continue with nearest equivalent ViePilot skill.


<process>

<step name="resolve_context">
## 0. Resolve Project Context

Before generating any file, collect actual project context from the environment:

```bash
# Get GitHub remote URL (supports both HTTPS and SSH formats)
REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")

# Extract owner/repo slug
# https://github.com/0-CODE/viepilot.git → 0-CODE/viepilot
# git@github.com:0-CODE/viepilot.git → 0-CODE/viepilot
GITHUB_SLUG=$(echo "$REMOTE_URL" | sed 's|.*github\.com[:/]||; s|\.git$||')
GITHUB_OWNER=$(echo "$GITHUB_SLUG" | cut -d'/' -f1)
GITHUB_REPO=$(echo "$GITHUB_SLUG" | cut -d'/' -f2)

# Fallback if no remote
if [ -z "$GITHUB_OWNER" ]; then
  GITHUB_OWNER="{GITHUB_OWNER}"
  GITHUB_REPO="{GITHUB_REPO}"
fi

# Get project name from package.json or directory name
PROJECT_NAME=$(node -e "try{console.log(require('./package.json').description||require('./package.json').name)}catch(e){console.log(basename('$PWD'))}" 2>/dev/null || basename "$PWD")

# Detect project version
if [ -f "package.json" ]; then
  PROJECT_VERSION=$(node -p "require('./package.json').version" 2>/dev/null)
elif [ -f "pom.xml" ]; then
  PROJECT_VERSION=$(grep -m1 "<version>" pom.xml 2>/dev/null | sed 's/.*<version>//;s/<.*//' | tr -d ' ')
elif [ -f "pyproject.toml" ]; then
  PROJECT_VERSION=$(grep '^version' pyproject.toml 2>/dev/null | head -1 | cut -d'"' -f2)
fi

# Framework-specific counts — only if this is a viepilot framework repo
IS_VIEPILOT_FRAMEWORK=false
if [ -d "skills" ] && ls skills/vp-*/SKILL.md 2>/dev/null | head -1 > /dev/null; then
  IS_VIEPILOT_FRAMEWORK=true
  ACTUAL_SKILLS=$(ls skills/*/SKILL.md 2>/dev/null | wc -l | tr -d ' ')
  ACTUAL_WORKFLOWS=$(ls workflows/*.md 2>/dev/null | wc -l | tr -d ' ')
fi
```

Use `$GITHUB_OWNER`, `$GITHUB_REPO` throughout all generated files.
For viepilot framework repos, also use `$ACTUAL_SKILLS`, `$ACTUAL_WORKFLOWS`.
**Never hardcode** `your-org`, `YOUR_USERNAME`, `YOUR_ORG`, or static skill/workflow counts.

### 0A. ViePilot active profile (FEAT-009)

Normative: **`docs/dev/global-profiles.md`**. Same **resolution** as `workflows/crystallize.md` Step 0 (read `.viepilot/META.md` → `viepilot_profile_path` or `$HOME/.viepilot/profiles/<viepilot_profile_id>.md`).

1. If the profile file is readable, keep **working notes** (display_name, org_tag, website, audience, branding) for use when generating README / contributing / any prose **attribution** — public content only, no secrets.
2. If no binding exists or file is missing → continue; do **not** fail `/vp-docs`.
3. When a profile is present, mention in output (e.g., README footer or `docs/dev/architecture.md`) one line referencing **profile_id** if appropriate for the project policy.

Post-generation validation (run after all files generated):
```bash
PLACEHOLDERS=$(grep -r "your-org\|YOUR_USERNAME\|YOUR_ORG\|your-username" docs/ --include="*.md" -l 2>/dev/null)
if [ -n "$PLACEHOLDERS" ]; then
  echo "⚠️ WARNING: Placeholder URLs still found in:"
  echo "$PLACEHOLDERS"
  echo "Fix these before committing."
fi
```
</step>

<step name="ask_scope">
## 1. Ask Documentation Scope

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► DOCS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Which documentation would you like to generate?

1. All - Generate complete documentation
2. API - REST, GraphQL, Kafka, WebSocket docs
3. Developer Guide - Setup, architecture, contributing
4. User Guide - Quick start, feature guides
5. Changelog - Update from git history
```
</step>

<step name="api_docs">
## 2A. API Documentation

### Sources
```bash
# Find API-related files
find src -name "*Controller*.java" -o -name "*Resolver*.java"
find src -name "*Consumer*.java" -o -name "*Producer*.java"
cat .viepilot/schemas/api-contracts.yaml
cat .viepilot/schemas/kafka-topics.yaml
```

### Generate docs/api/rest-api.md
```markdown
# REST API Reference

## Authentication
{from SYSTEM-RULES or code}

## Endpoints

### {Resource}

#### GET /api/v1/{resource}
**Description**: {description}

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| ... | ... | ... | ... |

**Response**:
```json
{
  "data": [...],
  "meta": {...}
}
```

**Errors**:
| Code | Description |
|------|-------------|
| 400 | ... |
| 404 | ... |
```

### Generate docs/api/graphql-schema.md
```markdown
# GraphQL Schema

## Types

### {TypeName}
```graphql
type TypeName {
  field: Type
}
```

## Queries
{list queries with descriptions}

## Mutations
{list mutations with descriptions}

## Subscriptions
{list subscriptions with descriptions}
```

### Generate docs/api/kafka-events.md
```markdown
# Kafka Events

## Topics

### {topic.name}
**Description**: {description}
**Key**: {key format}
**Partitions**: {count}

**Message Schema**:
```json
{
  "field": "type"
}
```

**Producers**: {services that produce}
**Consumers**: {services that consume}
```

### Generate docs/api/websocket-api.md
```markdown
# WebSocket API

## Connection
**URL**: `wss://{host}/ws`
**Authentication**: {method}

## Events

### Server → Client
| Event | Description | Payload |
|-------|-------------|---------|
| ... | ... | ... |

### Client → Server
| Event | Description | Payload |
|-------|-------------|---------|
| ... | ... | ... |
```
</step>

<step name="dev_docs">
## 2B. Developer Guide

### Generate docs/dev/getting-started.md
```markdown
# Getting Started

## Prerequisites
- {requirement 1}
- {requirement 2}

## Installation

### Clone Repository
```bash
git clone {repo_url}
cd {project_name}
```

### Setup Environment
{from docker-compose or setup scripts}

### Build
```bash
{build command}
```

### Run
```bash
{run command}
```

## Verify Installation
{verification steps}

## Common Issues
{from known issues or FAQ}
```

### Generate docs/dev/architecture.md
Copy and enhance from `.viepilot/ARCHITECTURE.md`:
- Add diagrams
- Add more context
- Add examples

### Generate docs/dev/contributing.md
```markdown
# Contributing Guide

## Development Workflow
1. Fork repository
2. Create branch
3. Make changes
4. Write tests
5. Submit PR

## Code Standards
{from SYSTEM-RULES.md}

## Commit Messages
{Conventional Commits format}

## Pull Request Process
{process description}

## Testing
{testing requirements}
```

### Generate docs/dev/testing.md
```markdown
# Testing Guide

## Test Structure
```
src/test/
├── unit/
├── integration/
└── e2e/
```

## Running Tests
```bash
{test commands}
```

## Writing Tests
{guidelines}

## Coverage
{requirements}
```

### Generate docs/dev/deployment.md
```markdown
# Deployment Guide

## Environments
| Env | URL | Purpose |
|-----|-----|---------|
| dev | ... | ... |
| staging | ... | ... |
| prod | ... | ... |

## Deployment Process
{steps}

## Configuration
{config management}

## Monitoring
{monitoring setup}
```
</step>

<step name="user_docs">
## 2C. User Guide

### Generate docs/user/quick-start.md
```markdown
# Quick Start Guide

## What is {Project Name}?
{brief description}

## Getting Started

### Step 1: {First Step}
{instructions}

### Step 2: {Second Step}
{instructions}

## Basic Usage
{common tasks}

## Next Steps
- [Feature Guide](features/)
- [FAQ](faq.md)
```

### Generate docs/user/features/
For each major feature:
```markdown
# {Feature Name}

## Overview
{description}

## How to Use

### {Task 1}
{step-by-step instructions}

### {Task 2}
{step-by-step instructions}

## Tips
{helpful tips}

## Troubleshooting
{common issues}
```

### Generate docs/user/faq.md
```markdown
# Frequently Asked Questions

## General

### Q: {Question}?
A: {Answer}

## Technical

### Q: {Question}?
A: {Answer}
```
</step>

<step name="changelog">
## 2D. Changelog Update

### Gather Changes
```bash
# Get commits since last version
git log --oneline v{last_version}..HEAD
```

### Parse Commits
Group by type:
- `feat:` → Added
- `fix:` → Fixed
- `BREAKING CHANGE:` → Changed
- `deprecate:` → Deprecated
- `remove:` → Removed
- `security:` → Security

### Update CHANGELOG.md
```markdown
## [Unreleased]

### Added
- {feat commit description} ([{short_hash}]({commit_url}))

### Changed
- {change description}

### Fixed
- {fix commit description} ([{short_hash}]({commit_url}))
```
</step>

<step name="create_index">
## 3. Create Index

### Update docs/README.md
```markdown
# {Project Name} Documentation

## Quick Links
- [Quick Start](user/quick-start.md)
- [API Reference](api/rest-api.md)
- [Developer Guide](dev/getting-started.md)

## Documentation Index

### API Documentation
- [REST API](api/rest-api.md)
- [GraphQL Schema](api/graphql-schema.md)
- [Kafka Events](api/kafka-events.md)
- [WebSocket API](api/websocket-api.md)

### Developer Guide
- [Getting Started](dev/getting-started.md)
- [Architecture](dev/architecture.md)
- [Contributing](dev/contributing.md)
- [Testing](dev/testing.md)
- [Deployment](dev/deployment.md)

### User Guide
- [Quick Start](user/quick-start.md)
- [Features](user/features/)
- [FAQ](user/faq.md)

---
Last updated: {date}
```

### Update root README.md (sync Documentation section)

After generating docs/, update the root `README.md` to reflect newly created documentation:

1. **Documentation table** — scan `docs/` for all `.md` files and ensure they are linked:
   ```bash
   # Find all docs generated
   find docs/ -name "*.md" | sort
   ```
   Add rows to Documentation table for any new files not yet listed.

2. **Project Structure `docs/` tree** — update to reflect actual subdirectories:
   ```bash
   # Actual docs structure
   find docs/ -type d | sort
   ```
   Rewrite the `docs/` section of Project Structure to match filesystem.

3. Commit: `docs: sync README.md documentation links and project structure`
</step>

<step name="skills_reference">
## 3B. Generate/Update skills-reference.md (viepilot framework only)

> **Guard**: Only run this step if `skills/` directory exists and contains `*/SKILL.md` files.
> Skip entirely for non-framework projects (Java apps, Node services, Python projects, etc.).

```bash
# Check if this is a viepilot framework repo
if [ ! -d "skills" ] || ! ls skills/*/SKILL.md 2>/dev/null | head -1 > /dev/null; then
  echo "→ Skipping skills-reference.md (not a viepilot framework repo)"
  # Jump to step 4
fi
```

Always build `docs/skills-reference.md` by **scanning the actual `skills/` directory**, not from a hardcoded list.

### Algorithm

```bash
# Get sorted list of skills from filesystem
SKILLS=$(ls skills/*/SKILL.md 2>/dev/null | sed 's|skills/||; s|/SKILL.md||' | sort)
```

For each skill in `$SKILLS`:
1. Read `skills/{skill}/SKILL.md`
2. Extract from the file:
   - `<objective>` first paragraph → **Purpose**
   - `<context>` optional flags list → **Flags table**
   - `Creates/Updates` list in `<objective>` → **Output**
3. Write a section `## /{skill}` with Purpose, Flags, Output

### Incremental update (if docs/skills-reference.md already exists)

Do NOT overwrite the entire file. Instead:
```bash
# Find skills already documented
DOCUMENTED=$(grep "^## /vp-" docs/skills-reference.md 2>/dev/null | sed 's|## /||' | sort)
# Find skills missing from docs
MISSING=$(comm -23 <(echo "$SKILLS") <(echo "$DOCUMENTED"))
```

For each skill in `$MISSING`:
- Append a new section at the end of `docs/skills-reference.md`
- Commit: `docs: add {skill} section to skills-reference.md`

This preserves any manual edits to existing sections.

### Verification

After generating/updating:
```bash
ACTUAL_COUNT=$(ls skills/*/SKILL.md 2>/dev/null | wc -l | tr -d ' ')
DOC_COUNT=$(grep "^## /vp-" docs/skills-reference.md | wc -l | tr -d ' ')
if [ "$ACTUAL_COUNT" != "$DOC_COUNT" ]; then
  echo "⚠️ skills-reference.md has $DOC_COUNT sections but $ACTUAL_COUNT skills exist"
fi
```
</step>

<step name="commit">
## 4. Commit and Push

```bash
git add docs/ CHANGELOG.md README.md
git commit -m "docs: update documentation

- API documentation
- Developer guide
- User guide
- Changelog update"
git push
```
</step>

<step name="confirm">
## 5. Confirm

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► DOCS COMPLETE ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Documentation generated:

 docs/
 ├── api/ ({count} files)
 │   ├── rest-api.md
 │   ├── graphql-schema.md
 │   ├── kafka-events.md
 │   └── websocket-api.md
 │
 ├── dev/ ({count} files)
 │   ├── getting-started.md
 │   ├── architecture.md
 │   ├── contributing.md
 │   ├── testing.md
 │   └── deployment.md
 │
 ├── user/ ({count} files)
 │   ├── quick-start.md
 │   ├── features/
 │   └── faq.md
 │
 └── README.md (index)

 CHANGELOG.md updated

 View documentation: docs/README.md
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
</step>

</process>

<success_criteria>
- [ ] Requested documentation generated
- [ ] Code examples included
- [ ] Cross-references added
- [ ] Index updated
- [ ] Changelog reflects changes
- [ ] Git committed
</success_criteria>
