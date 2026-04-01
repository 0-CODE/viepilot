# Contributing to ViePilot

Hướng dẫn đóng góp cho ViePilot framework.

## Development Workflow

1. Fork repository trên GitHub
2. Clone fork của bạn:
   ```bash
   git clone https://github.com/0-CODE/viepilot
   cd viepilot
   ```
3. Cài đặt development mode:
   ```bash
   ./dev-install.sh
   ```
   Để **symlink** toàn bộ `skills/vp-*` về repo (sửa skill là Cursor thấy ngay), dùng:
   ```bash
   VIEPILOT_SYMLINK_SKILLS=1 ./dev-install.sh
   ```
4. Tạo branch cho feature/fix:
   ```bash
   git checkout -b feat/my-new-skill
   # hoặc
   git checkout -b fix/cli-validation-bug
   ```
5. Implement changes
6. Chạy tests:
   ```bash
   npm test
   ```
7. Commit theo Conventional Commits
8. Submit Pull Request

---

## Branching Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Stable releases |
| `develop` | Integration branch |
| `feat/{name}` | New features |
| `fix/{name}` | Bug fixes |
| `docs/{name}` | Documentation |

---

## Commit Message Format

ViePilot dùng **Conventional Commits**:

```
{type}({scope}): {description}

[optional body]

[optional footer]
```

### Types

| Type | When to Use |
|------|-------------|
| `feat` | New skill, workflow, command, template |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code change, no new feature/fix |
| `test` | Adding or updating tests |
| `chore` | Maintenance (CI, deps, etc.) |

### Scopes

| Scope | For |
|-------|-----|
| `skill` | `skills/` changes |
| `workflow` | `workflows/` changes |
| `template` | `templates/` changes |
| `cli` | `bin/` changes |
| `docs` | `docs/` changes |
| `test` | `tests/` changes |
| `ci` | `.github/` changes |

### Examples

```bash
feat(skill): add vp-notify for Slack notifications
fix(workflow): correct state tracking in autonomous mode
docs(readme): update installation instructions
test(cli): add unit tests for version command
chore(ci): add Node 22 to test matrix
```

---

## Adding a New Skill

1. Bắt đầu từ template:
   ```bash
   cp -r templates/skill-template skills/vp-myskill
   ```

2. Edit `skills/vp-myskill/SKILL.md`:
   ```yaml
   ---
   name: vp-myskill
   description: "Short description"
   version: 0.1.0
   ---
   ```

3. Tạo workflow tương ứng:
   ```bash
   cp templates/workflow-template.md workflows/myskill.md
   ```

4. Cập nhật `ARCHITECTURE.md` với skill mới

5. Chạy audit để verify:
   ```
   /vp-audit
   ```

6. Viết tests trong `tests/unit/ai-provider-compat.test.js` sẽ tự động pick up skill mới

---

## Adding a CLI Command

1. Mở `bin/vp-tools.cjs`

2. Thêm command vào `commands` object:
   ```javascript
   mycommand: (args) => {
     const projectCheck = validators.requireProjectRoot();
     validateArgs([projectCheck]);
     // implementation
     console.log(formatSuccess('Done'));
     console.log(JSON.stringify({ result: 'value' }));
   },
   ```

3. Thêm help entry vào `commandHelp` object trong `commands.help`

4. Viết unit tests trong `tests/unit/validators.test.js`

5. Cập nhật `ARCHITECTURE.md` CLI count

---

## Code Standards

### File Structure Rules

- Skills: YAML frontmatter + XML-like tags (xem [architecture.md](architecture.md))
- Workflows: `<purpose>`, `<process>`, `<step name="...">`, `<success_criteria>`
- Templates: `{{PLACEHOLDER}}` format (ALL_CAPS)
- CLI: CommonJS, no external dependencies

### Comment Standards

```javascript
// ✅ DO: Explain WHY
// Prevents race condition when multiple workers claim same job
async function claimJob(jobId) { ... }

// ❌ DON'T: State the obvious
const count = 0; // Initialize count to zero
```

### Quality Gates

Trước khi commit:
- [ ] No syntax errors (`node --check bin/vp-tools.cjs`)
- [ ] Tests pass (`npm test`)
- [ ] Follows file structure rules
- [ ] ARCHITECTURE.md updated nếu thêm skill/workflow/command

---

## Pull Request Process

1. Ensure tests pass: `npm test`
2. Update `CHANGELOG.md` nếu có feature/fix mới
3. Bump version nếu cần: `vp-tools version bump minor`
4. Submit PR với description rõ ràng
5. CI sẽ chạy tự động (Node 18/20/22 matrix)
6. Một reviewer sẽ review trong 48h

---

## Testing Requirements

- Unit tests cho mọi CLI command mới
- AI compatibility tests tự động chạy cho skills mới
- Coverage phải ≥ 80%

Xem [testing.md](testing.md) để biết chi tiết.
