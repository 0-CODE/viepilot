# Changelog

All notable changes to ViePilot will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Enhanced

- _(none yet)_

### Documentation

- `README.md` — Project Scale LOC + M1.11 completion banner; Documentation row includes `api/`
- `.viepilot/audit-report.md` — PASS after README metric sync (`/vp-audit`)
- `docs/api/*` — added framework-appropriate API index (no HTTP surface; points to CLI/file model)
- `docs/dev/getting-started.md` — dev entry linking to canonical getting-started
- `docs/README.md`, root `README.md` — index and `docs/` tree synced with `api/`
- `README.md`, `docs/user/features/autonomous-mode.md`, `docs/skills-reference.md`, `docs/user/quick-start.md`, `docs/troubleshooting.md` — clarified `/vp-auto` with no extra args vs `--fast`, control points, and typical one-task-per-chat-turn behavior

## [0.8.1] - 2026-03-31 — ROOT documentation alignment (ENH-011)

### Fixed

- `README.md` — framework version badge aligned with TRACKER; documented framework SemVer vs npm `package.json` version
- `workflows/audit.md` — audit plan banner lists **4 tiers** (stack vs framework)
- `CHANGELOG.md` — consolidated shipped milestones under versioned sections below

## [0.8.0] - 2026-03-31 — M1.10 Execution Trace Reliability (ENH-010)

### Enhanced

- `workflows/autonomous.md` — mandatory task contract; state-first updates per PASS task/sub-task
- `skills/vp-auto/SKILL.md` — decomposition fields + incremental state sync
- `templates/phase/TASK.md` — Paths, File-Level Plan, Best Practices, Do/Don't, State Update Checklist
- `workflows/audit.md` — delayed/batch-only state-update anti-pattern guidance
- `.viepilot/phases/13-task-granularity-state-sync/` — phase planning + completion artifacts

## [0.7.0] - 2026-03-31 — M1.9 Stack-Aware Audit (ENH-009)

### Enhanced

- `workflows/audit.md` — stack + code-quality tier; framework tier; research fallback; vp-auto guardrails contract
- `skills/vp-audit/SKILL.md` — stack-aware audit (skill metadata version `0.3.0`)
- `skills/vp-auto/SKILL.md` — consume audit guardrails when report present
- `.viepilot/phases/12-audit-stack-compliance/` — phase artifacts

## [0.6.0] - 2026-03-30 — M1.8 Stack Intelligence (ENH-008)

### Enhanced

- `workflows/crystallize.md` — official stack research gate; global cache layout; `STACKS.md` integration
- `skills/vp-crystallize/SKILL.md` — research + cache requirements
- `workflows/autonomous.md` / `skills/vp-auto/SKILL.md` — stack preflight (summary-first)

## [0.5.0] - 2026-03-30 — M1.7 Brainstorm Intelligence

### Enhanced

- `workflows/brainstorm.md` — landing layout deep-dive; in-session research; `21st.dev` references
- `skills/vp-brainstorm/SKILL.md` — `--landing`, `--research`

## [0.4.0] - 2026-03-30 — M1.6 Generalize (ENH-006, ENH-007)

### Enhanced

- `workflows/autonomous.md`, `workflows/documentation.md` — fewer framework-only assumptions; generic version handling
- `workflows/audit.md`, `skills/vp-audit/SKILL.md` — project-agnostic audit baseline
- `workflows/evolve.md`, `skills/vp-evolve/SKILL.md` — enhanced brainstorm routing

## [0.3.0] - 2026-03-30 — M1.5 ENH Backlog: Drift Prevention

### Enhanced

#### vp-docs (ENH-004, ENH-005, ENH-002)

- `workflows/documentation.md` — new Step 0 resolves GitHub owner/repo from `git remote` before generating any file; eliminates hardcoded `your-org`/`YOUR_USERNAME` placeholders
- `workflows/documentation.md` — new Step 3B scans `skills/` directory to build `skills-reference.md` incrementally (append-only, preserves manual edits)
- `workflows/documentation.md` — Step 3 (create_index) now also updates root `README.md` Documentation table and Project Structure tree after generating docs
- `skills/vp-docs/SKILL.md` — Step 0 added, objective updated to declare all files updated including `skills-reference.md` and root `README.md`

#### vp-auto (ENH-001)

- `workflows/autonomous.md` — Step 5a: syncs `.viepilot/ROADMAP.md` phase status and Progress Summary after every phase completes
- `workflows/autonomous.md` — Step 5b: detects new skill files in phase diff and appends to `docs/skills-reference.md`
- `workflows/autonomous.md` — Step 6a: syncs `README.md` badges, counts, and tables on milestone complete
- `skills/vp-auto/SKILL.md` — objective now declares all files updated (ROADMAP.md per-phase, README.md on milestone)

#### vp-audit (ENH-003)

- `workflows/audit.md` — new Step 6 drift_check: detects README.md badge drift, README.md table drift, ROADMAP.md phase status drift, docs/skills-reference.md missing sections, and placeholder URLs in docs/
- `workflows/audit.md` — drift auto-fix option (option 1) updates all drifted files and commits
- `skills/vp-audit/SKILL.md` — objective, flags, and success_criteria updated to declare all drift check capabilities

## [0.2.0] - 2026-03-30 — M1 Foundation Enhancement

### Added

#### Testing

- Jest test suite with 194 tests across unit, integration, and AI compatibility categories
- `tests/unit/validators.test.js` — 30 CLI unit tests (all 13 commands)
- `tests/unit/ai-provider-compat.test.js` — 142 AI provider compatibility tests
- `tests/integration/workflow.test.js` — 22 end-to-end workflow tests

#### CI/CD

- GitHub Actions pipeline (`.github/workflows/ci.yml`)
  - Test job: Node.js 18/20/22 matrix
  - Coverage job: lcov report with >80% threshold
  - Lint job: syntax validation for CLI and test files

#### Documentation

- `docs/videos/` — 3 video tutorial scripts (installation, first project, autonomous mode)
- `docs/troubleshooting.md` — 15+ common issues with solutions
- `docs/advanced-usage.md` — Power user guide (all flags, debug, CI/CD, custom skills)
- `examples/` — 3 example projects (web-app, api-service, cli-tool)

## [0.1.0] - 2026-03-30

### Added

#### Skills

- `/vp-brainstorm` - Interactive brainstorm sessions with topic-based structure
- `/vp-crystallize` - Transform brainstorm into executable artifacts
- `/vp-auto` - Autonomous execution with control points
- `/vp-pause` - Save complete work state for later resume
- `/vp-resume` - Restore context and continue seamlessly
- `/vp-status` - Visual progress dashboard
- `/vp-evolve` - Add features, new milestones, or refactor
- `/vp-docs` - Generate comprehensive documentation
- `/vp-task` - Manual task management

#### Workflows

- `brainstorm.md` - Brainstorm session workflow
- `crystallize.md` - Artifact generation workflow
- `autonomous.md` - Autonomous execution workflow
- `pause-work.md` - State preservation workflow
- `resume-work.md` - Context restoration workflow
- `evolve.md` - Project evolution workflow
- `documentation.md` - Documentation generation workflow

#### Templates

- Project templates (AI-GUIDE, PROJECT-META, ARCHITECTURE, etc.)
- Phase templates (SPEC, PHASE-STATE, TASK, VERIFICATION, SUMMARY)

#### Standards

- Semantic Versioning (SemVer)
- Keep a Changelog format
- Conventional Commits for git messages
- Contributor recognition guidelines
- Code comment standards (good/bad examples)

#### Tools

- `vp-tools.cjs` - CLI helper for state management

#### Documentation

- Getting started guide
- Skills reference
- Installation script

---

[Unreleased]: https://github.com/0-CODE/viepilot/compare/v0.8.1...HEAD
[0.8.1]: https://github.com/0-CODE/viepilot/compare/v0.8.0...v0.8.1
[0.8.0]: https://github.com/0-CODE/viepilot/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/0-CODE/viepilot/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/0-CODE/viepilot/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/0-CODE/viepilot/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/0-CODE/viepilot/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/0-CODE/viepilot/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/0-CODE/viepilot/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/0-CODE/viepilot/releases/tag/v0.1.0
