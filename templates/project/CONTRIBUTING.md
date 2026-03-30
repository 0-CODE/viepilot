# Contributing to {{PROJECT_NAME}}

Thank you for your interest in contributing! This document provides guidelines and standards for contributing to the project.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Code Standards](#code-standards)
- [Recognition](#recognition)

---

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please be respectful and constructive in all interactions.

---

## Getting Started

### Prerequisites
{{PREREQUISITES}}

### Setup
```bash
# Clone repository
git clone {{REPOSITORY_URL}}
cd {{ARTIFACT_ID}}

# Setup instructions
{{SETUP_INSTRUCTIONS}}
```

---

## Development Workflow

### Branch Naming
```
<type>/<short-description>

Examples:
- feat/user-authentication
- fix/login-bug
- docs/api-reference
```

### Workflow
1. Create branch from `main` or `develop`
2. Make changes with atomic commits
3. Write/update tests
4. Create Pull Request
5. Pass CI checks
6. Get review approval
7. Squash and merge

---

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/).

### Format
```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types
| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Formatting |
| `refactor` | Code refactoring |
| `test` | Tests |
| `chore` | Maintenance |

### Examples
```bash
feat(auth): add JWT token refresh
fix(api): resolve null pointer in user service
docs(readme): update installation steps
```

---

## Pull Request Process

### PR Title Format
Same as commit message: `<type>(<scope>): <description>`

### PR Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review performed
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No new warnings
- [ ] All tests pass

### Review Criteria
- Code quality and readability
- Test coverage
- Documentation
- Performance impact
- Security considerations

---

## Code Standards

Please refer to [SYSTEM-RULES.md](/.viepilot/SYSTEM-RULES.md) for complete coding standards including:

- Architecture rules
- Coding conventions
- Comment standards
- Testing requirements

---

## Recognition

### How We Recognize Contributors

1. **CONTRIBUTORS.md** - All contributors listed
2. **Commit Co-authors** - For pair programming
3. **Release Notes** - Credits for significant contributions

### Contribution Types
| Emoji | Type |
|-------|------|
| 💻 | Code |
| 📖 | Documentation |
| 🐛 | Bug Reports |
| 💡 | Ideas |
| 🔍 | Code Review |
| 🧪 | Testing |

---

## Questions?

- Open an issue for bugs/features
- Start a discussion for questions
- Contact: {{LEAD_DEVELOPER_EMAIL}}

Thank you for contributing! 🙏
