# Contributing to ViePilot / Đóng góp cho ViePilot

Cảm ơn bạn đã quan tâm đến việc đóng góp! / Thank you for your interest in contributing!

## Table of Contents / Mục lục

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Recognition](#recognition)

---

## Code of Conduct

We are committed to providing a welcoming environment. Please be respectful and constructive.

Chúng tôi cam kết tạo môi trường thân thiện. Hãy tôn trọng và xây dựng.

---

## Getting Started

### Prerequisites / Yêu cầu

- Git
- Node.js 18+ (for CLI tools)
- Cursor IDE hoặc editor hỗ trợ skills

### Clone Repository

```bash
git clone https://github.com/0-CODE/viepilot.git
cd viepilot
```

---

## Development Setup

### Install Locally

```bash
# Install to test (delegates to node bin/viepilot.cjs)
make install

# Or explicitly:
# node bin/viepilot.cjs install --target cursor-agent --yes
```

### Validate Structure

```bash
make validate
```

### View Statistics

```bash
make stats
```

---

## Project Structure

```
viepilot/
├── skills/           # Skill definitions (SKILL.md)
├── workflows/        # Workflow files (step-by-step)
├── templates/        # Project and phase templates
├── bin/              # CLI tools
├── docs/             # Documentation
├── Makefile          # Developer commands
└── README.md
```

### Adding a New Skill

1. Create directory: `skills/vp-{name}/`
2. Create `SKILL.md` with this structure:

```markdown
---
name: vp-{name}
description: "Brief description"
version: 0.1.0
---

<cursor_skill_adapter>
## A. Skill Invocation
...
</cursor_skill_adapter>

<objective>
...
</objective>

<execution_context>
@$HOME/.cursor/viepilot/workflows/{name}.md
</execution_context>

<process>
...
</process>

<success_criteria>
- [ ] Criteria 1
- [ ] Criteria 2
</success_criteria>
```

### Adding a New Workflow

1. Create file: `workflows/{name}.md`
2. Structure with `<purpose>`, `<process>`, `<success_criteria>`

### Adding a New Template

1. Project templates: `templates/project/`
2. Phase templates: `templates/phase/`
3. Use `{{PLACEHOLDER}}` for variables

---

## How to Contribute

### Types of Contributions

| Type | Description | Label |
|------|-------------|-------|
| 🐛 Bug Fix | Fix issues | `bug` |
| ✨ Feature | New skill/workflow | `enhancement` |
| 📖 Docs | Documentation | `documentation` |
| 🔧 Improve | Enhance existing | `improvement` |
| 🧪 Test | Add tests | `test` |

### Process

1. **Check existing issues** - Avoid duplicates
2. **Create issue** - Describe what you want to do
3. **Get approval** - Wait for maintainer feedback
4. **Fork & branch** - Create feature branch
5. **Implement** - Follow coding standards
6. **Test** - Validate your changes
7. **PR** - Create pull request

---

## Coding Standards

### Skill Files (SKILL.md)

- Use YAML frontmatter for metadata
- Include all required sections
- Clear success criteria
- Trigger words in description

### Workflow Files

- Step-by-step with `<step name="">` tags
- Include bash examples where applicable
- Success criteria at end

### Templates

- Use `{{PLACEHOLDER}}` for variables
- Include comments explaining sections
- Maintain consistent formatting

### CLI Tools (JavaScript)

- ESLint compatible
- JSDoc comments for functions
- JSON output for machine parsing

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

### Scopes

| Scope | Description |
|-------|-------------|
| `skill` | Skill files |
| `workflow` | Workflow files |
| `template` | Templates |
| `cli` | CLI tools |
| `docs` | Documentation |

### Examples

```bash
# New skill
feat(skill): add vp-analyze for code analysis

# Fix workflow
fix(workflow): correct step ordering in crystallize

# Update template
docs(template): improve SYSTEM-RULES comment examples

# CLI improvement
feat(cli): add progress command to vp-tools
```

---

## Pull Request Process

### PR Title

Same format as commits: `<type>(<scope>): <description>`

### PR Template

```markdown
## Summary
Brief description of changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation
- [ ] Improvement

## Changes Made
- Change 1
- Change 2

## Testing
- [ ] Tested with `make validate`
- [ ] Tested with `make install`
- [ ] Manual testing done

## Checklist
- [ ] Follows coding standards
- [ ] Self-reviewed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### Review Process

1. Automated checks (if any)
2. Maintainer review
3. Address feedback
4. Approval and merge

---

## Recognition

### Contributors File

All contributors are listed in [CONTRIBUTORS.md](CONTRIBUTORS.md).

### Contribution Types

| Emoji | Type |
|-------|------|
| 💻 | Code |
| 📖 | Documentation |
| 🐛 | Bug Reports |
| 💡 | Ideas |
| 🔍 | Review |
| 🧪 | Testing |
| 🎨 | Design |

### Adding Yourself

After your PR is merged, add yourself to CONTRIBUTORS.md:

```markdown
| Your Name | @github_handle | 💻 📖 |
```

---

## Questions?

- **Issues**: For bugs and features
- **Discussions**: For questions and ideas
- **Email**: For sensitive matters

---

Cảm ơn bạn đã đóng góp! / Thank you for contributing! 🙏
