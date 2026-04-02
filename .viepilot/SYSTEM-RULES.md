# ViePilot — System Rules

## Table of Contents
1. [Architecture Rules](#architecture_rules)
2. [Coding Rules](#coding_rules)
3. [Comment Standards](#comment_standards)
4. [Versioning](#versioning)
5. [Git Conventions](#git_conventions)
6. [Changelog Standards](#changelog_standards)
7. [Contributor Standards](#contributor_standards)
8. [Quality Gates](#quality_gates)
9. [Forbidden Patterns](#do_not)

---

<architecture_rules>
## Architecture Rules

### Module Layer Order
```
skills/vp-*/ → workflows/*.md → templates/ → .viepilot/ artifacts
```
- Skills reference workflows (never reverse)
- Workflows use templates for artifact generation (never reverse)
- Workflows read `.viepilot/` state files; only vp-auto/vp-crystallize write state
- lib/ is utility-only — no business logic

### Dependency Rules
- Skills → Workflows only (skills do not directly manipulate files)
- Workflows → Templates (for generation) + State (for reading/writing)
- No circular references between workflow files
- `vp-auto` (autonomous.md) is the only workflow that writes `.viepilot/phases/*/PHASE-STATE.md` during execution

### Service Boundaries
- Planning boundary: brainstorm.md, crystallize.md, evolve.md, request.md — read + plan only
- Execution boundary: autonomous.md — read + write + git
- Resume boundary: resume.md — read + restore only
- Each workflow must declare its write scope in the `<purpose>` tag
</architecture_rules>

<coding_rules>
## Coding Rules

### Markdown / Workflow Files
- Use XML process tags `<step name="...">` for structured steps in workflows
- Use `<purpose>` tag at top of each workflow file
- Every step must have a clear single responsibility
- Instruction language for parallel reads: "Load all context in one batch (call all Read tools simultaneously)" — never "then read..."
- Template variables: `{{UPPER_SNAKE_CASE}}` — no single braces

### YAML / Frontmatter
- Skill frontmatter: `name`, `description`, `(optional) paths`
- TASK.md metadata block: `type`, `complexity`, `write_scope`, `recovery_budget`, `recovery_overrides`
- Recovery budget values: `S | M | L | XL` (maps to attempt table in autonomous.md)
- No inline comments in YAML blocks that vp-auto will parse programmatically

### JSON (HANDOFF.json / HANDOFF.log)
- HANDOFF.json: always valid JSON, never append — rewrite fully after each sub-task
- HANDOFF.log: JSONL format (one JSON object per line), append-only, never rewrite
- All timestamps: ISO 8601 UTC (`2026-04-02T10:30:00Z`)
- Required fields in HANDOFF.json: `version`, `position`, `recovery`, `context`, `control_point`, `meta`

### Bash (lib/, bin/)
- ShellCheck compliance for all scripts
- Use `set -euo pipefail` at top of every script
- Function names: `snake_case`
- No hardcoded paths — use `$HOME` or relative paths

### Testing (Framework Verification)
- No automated test runner — verification is manual skill invocation
- Each task has a `## Verification` section with explicit manual checks
- Phase complete = all tasks PASS or SKIP with documented reason
- Integration tests (Phase 4) = end-to-end skill invocation with fresh project
</coding_rules>

<comment_standards>
## Comment Standards

### Philosophy
> "Code tells you HOW, comments tell you WHY"

### Good Comments ✅

#### Explain decision rationale in workflows
```markdown
<!-- Use 2-band confidence threshold (not 3-band) because:
     - <60% benefit from structured options, not free-form Q
     - ≥85% needs zero friction — inline confirm only
     - Middle band (60-84%) needs 1 targeted question max -->
```

#### Document recovery behavior
```yaml
recovery_overrides:
  L3:
    block: true
    reason: "auth domain — scope reduction creates security holes"
    # L3 scope reduction on auth = partial auth implementation = vulnerability
    # Always surface to control point instead
```

#### Warn about backward-compat constraints
```markdown
<!-- BACKWARD-COMPAT: v1 projects will have TASK.md without these fields.
     vp-auto must gracefully skip missing fields (default values apply).
     Do NOT make these fields required. -->
```

### Bad Comments ❌
- Restating what the step name already says
- Commented-out workflow steps (delete dead steps, use git history)
- Journal-style change history in files (use git log)
- Obvious template placeholder comments (`<!-- TODO: fill this in -->` without context)

### TODO/FIXME Format
```
# TODO(Nhan.TT): Brief description - BUG-XXX or ENH-XXX
# FIXME: Bug description - BUG-XXX
# HACK: Workaround — remove when X is fixed
# NOTE: Important context for future editors
```
</comment_standards>

<versioning>
## Semantic Versioning

Format: `MAJOR.MINOR.PATCH[-PRERELEASE]`

| Bump | When | Example |
|------|------|---------|
| MAJOR | Breaking change với v1 projects | 1.x.x → 2.0.0 |
| MINOR | New skill/workflow/feature (backward compatible) | 2.0.x → 2.1.0 |
| PATCH | Bug fix, docs update, minor tweak | 2.0.0 → 2.0.1 |

### Pre-release Labels
- `alpha` : Feature incomplete (current: 2.0.0-alpha)
- `beta` : Feature complete, testing in progress
- `rc` : Release candidate, final validation

### Version Files to Update
- `CHANGELOG.md` → `[Unreleased]` section
- `.viepilot/TRACKER.md` → `## Version Info`
- `README.md` → version badge (if present)

Reference: https://semver.org/
</versioning>

<git_conventions>
## Git Conventions

### Commit Message Format
```
<type>(<scope>): <subject> (version if applicable)

[optional body]

[optional footer]
```

### Types
| Type | Description | Version Bump |
|------|-------------|--------------|
| `feat` | New skill/workflow/feature | MINOR |
| `fix` | Bug fix | PATCH |
| `docs` | Documentation only | - |
| `refactor` | Code restructure, no behavior change | - |
| `style` | Formatting, whitespace | - |
| `test` | Verification additions | - |
| `chore` | Maintenance, deps | - |
| `release` | Version release commit | MAJOR/MINOR/PATCH |

### Scopes
| Scope | When |
|-------|------|
| `(workflows)` | Changes to `workflows/*.md` |
| `(templates)` | Changes to `templates/` |
| `(skills)` | Changes to `skills/vp-*/` |
| `(lib)` | Changes to `lib/` or `bin/` |
| `(install)` | Changes to install scripts |
| `(docs)` | Changes to `docs/` |
| `(project)` | Changes to `.viepilot/` project state |

### Breaking Changes
```
feat(workflows)!: refactor autonomous.md to typed state machine

BREAKING CHANGE: PHASE-STATE.md must now include execution_state block.
Run migration script or re-crystallize existing projects.
```

### Task Tags
```bash
# Tag after task complete:
git tag -a "{prefix}-p{N}-t{M}-done" -m "Task {N}.{M} complete"

# Tag before starting task (for rollback):
git tag -a "{prefix}-p{N}-t{M}" -m "Start Task {N}.{M}"
```

Reference: https://www.conventionalcommits.org/
</git_conventions>

<changelog_standards>
## Changelog Standards

Format: [Keep a Changelog](https://keepachangelog.com/)

### Categories (in order)
1. **Added** - New skills, workflows, templates
2. **Changed** - Changes in existing behavior
3. **Deprecated** - Soon-to-be removed features
4. **Removed** - Removed features
5. **Fixed** - Bug fixes (reference BUG-XXX)
6. **Security** - Security fixes

### Entry Format
```markdown
- Brief description ([BUG-001](https://github.com/0-CODE/viepilot/issues/X))
```

### Auto-update Mapping
```yaml
feat → Added
fix → Fixed
BREAKING CHANGE → Changed
refactor → Changed (if behavior changes)
```
</changelog_standards>

<contributor_standards>
## Contributor Standards

### Attribution
- All contributors listed in CONTRIBUTORS.md
- Co-author tags for AI-assisted commits: `Co-Authored-By: Claude <noreply@anthropic.com>`

### Contribution Types
| Type | Description |
|------|-------------|
| Workflow | New/updated workflow definitions |
| Template | New/updated project or phase templates |
| Skill | New/updated skill definitions |
| Bug Fix | Fix to existing behavior (reference BUG-XXX) |
| Enhancement | Improvement to existing feature (reference ENH-XXX) |
| Documentation | User or dev docs |
</contributor_standards>

<quality_gates>
## Quality Gates

### Task Completion (vp-auto verifies)
- [ ] All acceptance criteria met
- [ ] write_scope verified — no drift outside declared scope
- [ ] Manual verification step passed (skill invocation or file inspection)
- [ ] PHASE-STATE.md updated with task PASS + timestamp
- [ ] HANDOFF.json updated to next task position
- [ ] Git committed with conventional commit message

### Phase Completion
- [ ] All tasks PASS or SKIP (with documented reason in PHASE-STATE.md)
- [ ] Phase verification checklist in SPEC.md all green
- [ ] No active blockers in HANDOFF.json
- [ ] HANDOFF.log rotated to `logs/handoff-phase-{N}.log`
- [ ] Git tagged at phase boundary

### Milestone Completion (v2.0.0 release)
- [ ] All 4 phases complete
- [ ] Integration tests pass (Phase 4: 4.1a-4.1d)
- [ ] All docs updated (4.2-4.4)
- [ ] CHANGELOG.md finalized
- [ ] Stale reference audit clean (4.6a-4.6b)
- [ ] Version bumped to 2.0.0 (4.7)
- [ ] git tag v2.0.0

### Recovery Budget Reference
| Complexity | L1 attempts | L2 attempts | L3 attempts |
|---|---|---|---|
| S | 1 | 1 | 0 |
| M | 1 | 2 | 0 |
| L | 2 | 2 | 1 |
| XL | 2 | 3 | 1 |
</quality_gates>

<do_not>
## Forbidden Patterns

### Architecture
- ❌ Skills must NOT directly read/write `.viepilot/` state — route through workflows
- ❌ Workflows must NOT implement application code — planning/doc only (except autonomous.md)
- ❌ Do NOT create circular skill references
- ❌ Do NOT mix planning and execution in same workflow

### Backward Compatibility
- ❌ Do NOT make new TASK.md fields required (v1 projects will have old TASK.md)
- ❌ Do NOT change SKILL.md frontmatter schema
- ❌ Do NOT rename existing `.viepilot/` file paths that v1 workflows reference

### State Management
- ❌ Do NOT commit HANDOFF.log (must be gitignored)
- ❌ Do NOT commit HANDOFF.json (must be gitignored)
- ❌ Do NOT rewrite HANDOFF.log — always append
- ❌ Do NOT allow L3 scope reduction on compliance write_scope paths (auto-blocked)

### Code Quality
- ❌ Do NOT hardcode usernames, emails, or org names in templates (use `{{PLACEHOLDER}}`)
- ❌ Do NOT leave unfilled `{{PLACEHOLDER}}` in committed artifacts
- ❌ Do NOT create new skills outside `vp-*` namespace in ViePilot workflows
</do_not>
