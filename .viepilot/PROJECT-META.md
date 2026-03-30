# ViePilot - Project Metadata

## Project Info

| Field | Value |
|-------|-------|
| **Name** | ViePilot |
| **Full Name** | Autonomous Vibe Coding Framework |
| **Description** | Bộ khung phát triển tự động có kiểm soát cho AI assistant |
| **Version** | 0.1.0 |
| **License** | MIT |
| **Year Started** | 2026 |

## Organization

| Field | Value |
|-------|-------|
| **Name** | Công Ty TNHH TMDV CÔNG NGHỆ & GIẢI PHÁP CREPS VIỆT NAM |
| **Short Name** | CREPS Vietnam |
| **GitHub** | 0-CODE |

## Lead Developer

| Field | Value |
|-------|-------|
| **Name** | Trần Thành Nhân |
| **Role** | Lead Developer |

## Repository

| Field | Value |
|-------|-------|
| **URL** | https://github.com/0-CODE/viepilot |
| **Issues** | https://github.com/0-CODE/viepilot/issues |

## Package Structure

```
viepilot/
├── skills/           # Skill definitions (vp-*)
│   └── vp-{name}/
│       └── SKILL.md
├── workflows/        # Workflow processes
│   └── {name}.md
├── templates/        # Templates
│   ├── project/      # Project-level (11)
│   └── phase/        # Phase-level (5)
├── bin/              # CLI tools
│   └── vp-tools.cjs
├── docs/             # Documentation
└── .viepilot/        # Self-managed artifacts
```

## File Headers

### Markdown Files
```markdown
# {Title}

> ViePilot - {description}
> Author: Trần Thành Nhân
> License: MIT
```

### JavaScript/Node.js Files
```javascript
/**
 * {Description}
 * 
 * @package viepilot
 * @author Trần Thành Nhân
 * @license MIT
 * @version 0.1.0
 */
```

### Shell Scripts
```bash
#!/bin/bash

# {Description}
# 
# ViePilot - Autonomous Vibe Coding Framework
# Author: Trần Thành Nhân
# License: MIT
```

## Standards Applied

| Standard | Specification | Applied To |
|----------|---------------|------------|
| Semantic Versioning | semver.org | Versions |
| Conventional Commits | conventionalcommits.org | Git commits |
| Keep a Changelog | keepachangelog.com | CHANGELOG.md |
| Good Comments | Self-defined | Code documentation |

## Version Convention

```
{MAJOR}.{MINOR}.{PATCH}[-{prerelease}]

Examples:
- 0.1.0       : Initial development
- 0.2.0       : New skill added
- 0.2.1       : Bug fix
- 1.0.0       : Production ready
- 1.0.0-beta  : Beta release
```

## Commit Convention

```
{type}({scope}): {description}

Types: feat, fix, docs, style, refactor, test, chore
Scopes: skill, workflow, template, cli, docs

Examples:
- feat(skill): add vp-debug for systematic debugging
- fix(workflow): correct autonomous state tracking
- docs(readme): update installation instructions
```
