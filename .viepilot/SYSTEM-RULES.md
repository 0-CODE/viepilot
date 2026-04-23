# ViePilot - System Rules

<coding_rules>

## File Structure Rules

### Skills
```markdown
# Required Structure:
---
name: vp-{name}
description: "{short description}"
version: {semver}
---

<cursor_skill_adapter>
## A. Skill Invocation
- Describe triggers

## B. User Prompting
- Describe prompting style

## C. Tool Usage
- List tools to use
</cursor_skill_adapter>

<objective>
What this skill accomplishes.
**Creates/Updates:** {files}
**After:** {next action}
</objective>

<execution_context>
@$HOME/.cursor/viepilot/workflows/{workflow}.md
</execution_context>

<context>
Optional flags and arguments
</context>

<process>
Execute workflow from @...
Key steps:
1. ...
2. ...
</process>

<success_criteria>
- [ ] Criteria 1
- [ ] Criteria 2
</success_criteria>
```

### Workflows
```xml
<purpose>
Brief description of what this workflow does.
</purpose>

<process>

<step name="unique_step_name">
## N. Step Title

Instructions for this step.
Code blocks if needed:
```bash
command
```
</step>

</process>

<commands>
Optional: User commands available during workflow
</commands>

<success_criteria>
- [ ] Criteria 1
- [ ] Criteria 2
</success_criteria>
```

### Templates
- Use `{{PLACEHOLDER}}` for variables
- ALL CAPS for placeholder names
- Include sensible defaults where possible
- Document required vs optional placeholders

</coding_rules>

<comment_standards>

## Good Comments

```javascript
// Prevents race condition when multiple workers claim same job
// Uses optimistic locking with version check
async function claimJob(jobId, workerId) {

// Warning: This cache is NOT thread-safe
// Use jobCache.synchronized() for concurrent access
const jobCache = new Map();

// Business rule: Jobs older than 7 days auto-expire
// See: JIRA-1234 for compliance requirements
const EXPIRY_DAYS = 7;
```

## Bad Comments

```javascript
// ❌ DON'T: State the obvious
const count = 0; // Initialize count to zero

// ❌ DON'T: Explain what code does (let code speak)
// Loop through all items
for (const item of items) {

// ❌ DON'T: Comment out dead code
// function oldImplementation() { ... }

// ❌ DON'T: Write journal/history comments
// 2024-01-15: Changed logic
// 2024-01-20: Fixed bug

// ❌ DON'T: Misleading comments
// Returns the user name (but actually returns ID)
function getUser() { return userId; }
```

## When to Comment

| ✅ DO Comment | ❌ DON'T Comment |
|--------------|-----------------|
| WHY (reasoning) | WHAT (obvious) |
| Business rules | Syntax explanation |
| Side effects | Trivial operations |
| Non-obvious tradeoffs | Dead code |
| TODO with ticket | Journal entries |
| Warnings about gotchas | Self-explanatory code |

</comment_standards>

<versioning>

## Semantic Versioning (SemVer)

```
MAJOR.MINOR.PATCH[-PRERELEASE]

MAJOR: Breaking changes (incompatible API changes)
MINOR: New features (backward compatible)
PATCH: Bug fixes (backward compatible)

Examples:
- 0.1.0 → 0.2.0: New skill added
- 0.2.0 → 0.2.1: Bug fix in workflow
- 0.2.1 → 1.0.0: Production ready, stable API
```

## Version Bump Rules (Canonical)

All version bump decisions across `/vp-evolve` and `/vp-auto` MUST follow this table.
Do **not** redefine bump logic inline in `workflows/evolve.md` or `workflows/autonomous.md` — reference this section instead.

| Change type | Bump | Notes |
|-------------|------|-------|
| Breaking API/behavior change | **MAJOR** | Incompatible with prior behavior |
| New skill, workflow, feature, or capability | **MINOR** | Backward compatible addition |
| New template | **MINOR** | New artifact type |
| Bug fix only (no new features) | **PATCH** | Backward compatible fix |
| Refactor / internal cleanup (no behavior change) | **PATCH** | No user-facing change |
| Docs / tests only | **PATCH** | No code behavior change |
| Mixed phase (feature + fix) | **MINOR** | Highest applicable bump wins |

**Precedence rule:** MAJOR > MINOR > PATCH.
When a phase contains multiple change types, apply the highest applicable bump.
Example: phase with a new feature AND a bug fix → MINOR (not PATCH).

> **Source of truth:** This table is the only authoritative definition of bump rules in this project.

</versioning>

<git_conventions>

## Conventional Commits

```
{type}({scope}): {description}

[optional body]

[optional footer]
```

### Types
| Type | When to Use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code change, no new feature/fix |
| `test` | Adding tests |
| `chore` | Maintenance tasks |

### Scopes for ViePilot
| Scope | For |
|-------|-----|
| `skill` | skills/ changes |
| `workflow` | workflows/ changes |
| `template` | templates/ changes |
| `cli` | bin/ changes |
| `docs` | docs/ changes |
| `core` | Core functionality |

### Examples
```bash
feat(skill): add vp-debug for systematic debugging
fix(workflow): correct state tracking in autonomous mode
docs(readme): update installation instructions
refactor(template): simplify placeholder naming
chore(ci): add GitHub Actions workflow
```

## Branching

| Branch | Purpose |
|--------|---------|
| `main` | Stable releases |
| `develop` | Integration branch |
| `feat/{name}` | New features |
| `fix/{name}` | Bug fixes |
| `docs/{name}` | Documentation |

## Tags

```bash
# Release tags
v0.1.0, v0.2.0, v1.0.0

# ViePilot checkpoints (during development)
vp-p{phase}-t{task}         # Starting task
vp-p{phase}-t{task}-done    # Completed task
vp-p{phase}-complete        # Completed phase
```

</git_conventions>

<changelog_standards>

## Keep a Changelog Format

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- New features

### Changed
- Changes in existing functionality

### Deprecated
- Soon-to-be removed features

### Removed
- Removed features

### Fixed
- Bug fixes

### Security
- Vulnerability fixes

## [0.1.0] - YYYY-MM-DD

### Added
- Initial release
```

## Categories

| Category | Use For |
|----------|---------|
| Added | New features |
| Changed | Changes to existing features |
| Deprecated | Features to be removed |
| Removed | Removed features |
| Fixed | Bug fixes |
| Security | Security fixes |

</changelog_standards>

<contributor_standards>

## CONTRIBUTORS.md Format

```markdown
# Contributors

## Lead Developer
- **Trần Thành Nhân** - Lead Developer

## Contributors

### 💻 Code
- Name (@github) - Description

### 📖 Documentation
- Name (@github) - Description

### 🎨 Design
- Name (@github) - Description

### 🐛 Bug Reports
- Name (@github) - Description

### 💡 Ideas
- Name (@github) - Description
```

## Contribution Types

| Emoji | Type |
|-------|------|
| 💻 | Code |
| 📖 | Documentation |
| 🎨 | Design |
| 🐛 | Bug Reports |
| 💡 | Ideas |
| 🔧 | Tools |
| 🌍 | Translation |
| ⚠️ | Tests |
| 🚇 | Infrastructure |
| 📦 | Packaging |

</contributor_standards>

<quality_gates>

## Before Commit
- [ ] No syntax errors
- [ ] Follows file structure rules
- [ ] Comments follow standards
- [ ] Placeholders documented

## Before Release
- [ ] CHANGELOG updated
- [ ] Version bumped correctly
- [ ] README reflects changes
- [ ] All skills tested
- [ ] Documentation complete

</quality_gates>

<do_not>

## ❌ DO NOT

1. **DON'T** commit without meaningful message
2. **DON'T** skip version bumping
3. **DON'T** leave placeholder unfilled in production
4. **DON'T** delete state files without backup
5. **DON'T** modify HANDOFF.json manually (use CLI)
6. **DON'T** create skills without workflow reference
7. **DON'T** break existing skill APIs without MAJOR bump
8. **DON'T** commit secrets or credentials
9. **DON'T** use non-standard commit types
10. **DON'T** skip success_criteria in skills/workflows

</do_not>
