# ViePilot - System Rules

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

```text
skills/vp-* -> workflows/*.md -> compiler/planning artifacts -> runtime artifacts -> projections
```

- Skills reference workflows, never the reverse.
- Crystallize owns planning extraction and compile preparation.
- Runtime executor consumes structured artifacts, not brainstorm prose.
- Projections such as `TRACKER.md` and `ROADMAP.md` must be derivable from canonical state.

### Dependency Rules

- Semantic workflows stay host-agnostic.
- Compiler artifacts are canonical when runtime consumes them directly.
- Projection files are never allowed to become hidden runtime sources of truth.

### Service Boundaries

- Planning boundary: `brainstorm.md`, `crystallize.md`, `evolve.md`, `request.md`
- Execution boundary: `autonomous.md`
- Migration boundary: one-shot v2 -> v3 transformation must be explicit and auditable
- Host adapter boundary: Claude/Cursor specifics stay isolated from the semantic workflow contract
</architecture_rules>

<coding_rules>
## Coding Rules

### General

- Prefer machine-readable contracts before markdown explanations.
- Keep state ownership singular; if two files represent the same runtime fact, one must be marked as projection only.
- Preserve current CommonJS runtime unless a task explicitly scopes an ESM migration.

### Language Specific

- Node.js CLI code stays compatible with the current `"type": "commonjs"` setup.
- Jest remains the default test runner for repo-level verification.
- `@clack/prompts` usage must respect the currently pinned package line; do not assume latest behavior without checking official docs.

### Testing

- Add or update tests for behavior changes in `bin/`, `lib/`, workflow contracts, or generated artifact formats.
- Prefer contract tests for workflow/template invariants.
- Keep `npm test` green before milestone closeout.
- Minimum configured global coverage remains 80%.
</coding_rules>

<comment_standards>
## Comment Standards

### Philosophy

> "Code tells you HOW, comments tell you WHY"

### Good Comments

- Explain migration rationale, ownership boundaries, or non-obvious compatibility constraints.
- Document why a projection exists and which canonical file owns the truth.
- Call out host-specific caveats when they affect Claude Code or Cursor behavior.

### Bad Comments

- Restating file names or obvious assignments
- Leaving stale v2/v3 claims after an ownership change
- Journal-style history that belongs in git or changelog

### TODO/FIXME Format

```text
# TODO(Nhan.TT): Brief description - BUG-XXX or ENH-XXX
# FIXME: Bug description - BUG-XXX
# HACK: Workaround - remove when X is fixed
# NOTE: Important context for future editors
```
</comment_standards>

<versioning>
## Semantic Versioning

Format: `MAJOR.MINOR.PATCH[-PRERELEASE]`

| Bump | When | Example |
|------|------|---------|
| MAJOR | Breaking changes | 2.x.x -> 3.0.0 |
| MINOR | New backward-compatible features | 2.2.x -> 2.3.0 |
| PATCH | Bug fixes and compatible corrections | 2.2.2 -> 2.2.3 |

### Version Files to Update

- `package.json`
- `CHANGELOG.md`
- `.viepilot/TRACKER.md`
- README version references when they claim a shipped release
</versioning>

<git_conventions>
## Git Conventions

### Commit Message Format

```text
<type>(<scope>): <subject>
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New behavior |
| `fix` | Bug fix |
| `docs` | Documentation |
| `refactor` | Structural change without intended behavior change |
| `test` | Test changes |
| `chore` | Maintenance |

### Scopes

| Scope | When |
|-------|------|
| `(workflows)` | `workflows/*.md` |
| `(templates)` | `templates/` |
| `(skills)` | `skills/vp-*/` |
| `(lib)` | `lib/` or `bin/` |
| `(docs)` | `docs/` |
| `(project)` | `.viepilot/` or generated planning artifacts |
| `(tests)` | `tests/` |
</git_conventions>

<changelog_standards>
## Changelog Standards

- Follow Keep a Changelog categories.
- Record shipped behavior changes, not every planning artifact refresh.
- Note when a change affects the published baseline versus the next planning target.
</changelog_standards>

<contributor_standards>
## Contributor Standards

- Keep workflow, template, and generated artifact expectations synchronized.
- Do not update install mirrors directly.
- When changing generated project-state files, preserve the distinction between shipped baseline and next milestone planning.
</contributor_standards>

<quality_gates>
## Quality Gates

- Official-source check for stack-specific behavioral changes
- `HANDOFF.json` and manifest files must remain valid JSON
- Mermaid sidecars must match fenced diagram bodies in `ARCHITECTURE.md`
- Schema files must remain parseable or intentionally documented as logical-only references
</quality_gates>

<do_not>
## Forbidden Patterns

- Do not let runtime execution depend on re-reading brainstorm prose.
- Do not promote projections to canonical runtime truth.
- Do not widen write scope through undocumented host-specific behavior.
- Do not quietly migrate CommonJS entrypoints to ESM while the published package remains CommonJS.
</do_not>
