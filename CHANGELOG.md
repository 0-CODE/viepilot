# Changelog

All notable changes to ViePilot will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Enhanced

#### Brainstorm UX
- `workflows/brainstorm.md` — added Landing Page deep-dive flow with explicit layout selection (A/B/C/D/custom), follow-up questions, and structure decisions capture
- `workflows/brainstorm.md` — added in-session research mode so users can request research without leaving brainstorm
- `workflows/brainstorm.md` — added `21st.dev` reference path for selecting suitable landing page sections/components
- `skills/vp-brainstorm/SKILL.md` — updated objective and flags (`--landing`, `--research`) for landing-first and research-heavy brainstorm sessions

#### Evolve Routing
- `workflows/evolve.md` — add smart routing to enhanced brainstorm flow for landing page / research-heavy requests
- `skills/vp-evolve/SKILL.md` — update process to route via `/vp-brainstorm --new --landing --research` when relevant

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

[Unreleased]: https://github.com/0-CODE/viepilot/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/0-CODE/viepilot/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/0-CODE/viepilot/releases/tag/v0.1.0
