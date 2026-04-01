# Changelog

All notable changes to ViePilot will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned

- **M1.25 / Phase 29 (ENH-018)** — **Crystallize + ARCHITECTURE**: Mermaid diagrams **complexity-gated** from brainstorm; six diagram kinds with required/optional/N/A; vp-audit / vp-auto / vp-debug alignment; target **1.8.0** on complete.

## [1.7.0] - 2026-04-01

### Added

- **M1.24 / Phase 28 (ENH-017) completed** — Node-native installer flow shipped: `lib/viepilot-install.cjs` (`buildInstallPlan`/`applyInstallPlan`), `bin/viepilot.cjs install` no longer spawns `bash`, `install.sh` now thin wrapper to Node, and Jest coverage for dry-run/apply/wrapper paths.

### Documentation

- `docs/troubleshooting.md`, `docs/dev/deployment.md` — updated install engine behavior (`npx viepilot install` Node-native, `install.sh` wrapper), Windows guidance, and reinstall semantics with `dev-install.sh`.

## [1.6.1] - 2026-04-01

### Enhanced

- **ENH-015** — `dev-install.sh` và `install.sh` hỗ trợ **`VIEPILOT_SYMLINK_SKILLS=1`**: cài skills vào `~/.cursor/skills/` bằng symlink tuyệt đối tới repo (mặc định vẫn copy-first); `docs/dev/contributing.md` documents the flag.

## [1.6.0] - 2026-04-01

### Added

- **M1.23 / Phase 27 (FEAT-008)** — `vp-tools info` and `vp-tools info --json` with `lib/viepilot-info.cjs` (resolve `viepilot` package root without `.viepilot/`, npm latest, skills + workflows inventory); `vp-tools update` with `--dry-run`, `--yes`, `--global` and `lib/viepilot-update.cjs` (local vs global install classification, semver no-op when up to date); Cursor skills `skills/vp-info/SKILL.md` and `skills/vp-update/SKILL.md`; documentation in `docs/skills-reference.md`, `docs/dev/cli-reference.md`, `docs/user/quick-start.md`, and README metrics (16 skills, 18 CLI surface / 17 `vp-tools` subcommands); unit tests `tests/unit/viepilot-info.test.js` and `tests/unit/viepilot-update.test.js`.

## [1.5.1] - 2026-04-01

### Added

- **M1.22 — ENH-001 ~ ENH-005 backlog closed (verification)** — Các enhancement doc-sync + audit drift đã được implement trong các milestone trước (`workflows/autonomous.md`, `workflows/documentation.md`, `workflows/audit.md`, skills `vp-auto` / `vp-docs` / `vp-audit`). Thêm `tests/unit/enh-backlog-workflow-contracts.test.js` để regression-guard contract.

### Enhanced

- **M1.21 / Phase 25 — task 25.5** — `docs/user/features/product-horizon.md` (end-to-end horizon handoff); `templates/project/AI-GUIDE.md` states **load order**: `<product_vision>` + `ROADMAP` horizon before deep implementation; `workflows/crystallize.md` Step 2 reminds to preserve that ordering; `docs/user/quick-start.md`, `docs/README.md`, `docs/skills-reference.md` cross-links.
- **M1.21 / Phase 25 — task 25.4** — `skills/vp-brainstorm` and `skills/vp-crystallize` bumped to **0.4.0**; objectives/process/success criteria mirror ENH-014 horizon + crystallize gates; `docs/skills-reference.md` documents horizon output and crystallize intake.
- **M1.21 / Phase 25 — task 25.3** — `templates/project/ROADMAP.md` adds mandatory **Post-MVP / Product horizon** with placeholders (`HORIZON_MODE_LINE`, epic lists, deferred/non-goals); `templates/project/PROJECT-CONTEXT.md` adds `<product_vision>` (**Product vision & phased scope**) aligned with MVP / Post-MVP / Future terminology.
- **M1.21 / Phase 25 — task 25.2** — `workflows/crystallize.md` Step 1 now **extracts and validates** brainstorm product horizon (inventory, single-release mode, tier conflicts); Step 7 always emits **MVP phases** plus a mandatory **Post-MVP / horizon** block with a **no silent omission** gate before finalizing `ROADMAP.md`; success criteria updated.
- **M1.21 / Phase 25 — task 25.1** — `workflows/brainstorm.md` now mandates **`## Product horizon`** (MVP / Post-MVP / Future tags, non-goals, deferred capabilities, single-release escape hatch), merge rules when continuing sessions, and user doc `docs/user/features/brainstorm.md` (+ docs index link).

### Enhanced

- **M1.20 / Phase 24 (FEAT-007) completed** — multi-page UI Direction (`pages/*.html` + hub `index.html`), mandatory `## Pages inventory` in `notes.md` when `pages/` exists, crystallize workflow/skill reads every page + inventory for full site-map architecture, `npm run verify:ui-direction` helper, and docs refresh.
- **M1.17 / Phase 21 (ENH-013) completed** — realigned README metrics (`npm run readme:sync` with `cloc`) and moved `.viepilot` to local-only (`.gitignore` + untracked index).
- **M1.15 / Phase 18 (FEAT-004) completed** — npm distribution flow is now fully closed: publish pipeline passes and package released to npm as `viepilot@1.0.1`.
- **M1.15 / Phase 19 (FEAT-005) completed** — installer now supports keyboard selector UX (arrow/space/enter), added `viepilot uninstall` command (`--target`, `--yes`, `--dry-run`), and switched dev installer to copy-first flow to avoid symlink-based skill discovery failures.
- **M1.16 / Phase 20 (FEAT-006) completed** — added README LOC auto-sync command (`npm run readme:sync`) driven by `cloc` with non-blocking fallback, installer `cloc` dependency checks/guidance, and a donate section in README with PayPal/MOMO links.

### Fixed

- **M1.19 / Phase 23 (BUG-003) completed** — enforced deterministic git persistence gates for `/vp-auto`: PASS transitions now require clean worktree, configured upstream, and zero unpushed commits (via `vp-tools git-persistence --strict` in workflow).
- **M1.18 / Phase 22 (BUG-002) completed** — introduced project-scoped checkpoint tags (`{project}-vp-p...`) and kept backward compatibility with legacy `vp-p...` tags for list/rollback flows.
- **CI coverage** — Jest chỉ instrument process hiện tại; test CLI qua `spawnSync` khiến `bin/vp-tools.cjs` báo **0%**. Đã tách `lib/cli-shared.cjs` (validators, `findProjectRoot`, Levenshtein) và đặt `collectCoverageFrom` trên file đó; bổ sung test in-process + `require.main === module` gate cho CLI; `install.sh` / `dev-install.sh` cài kèm `lib/`.

### Documentation

- `README.md`, `docs/README.md` — refreshed framework version, skills/commands/test counts, and index notes after M1.18 checkpoint-tag rollout.
- `workflows/autonomous.md`, `skills/vp-auto/SKILL.md`, `docs/user/features/autonomous-mode.md`, `docs/skills-reference.md` — documented and standardized git persistence gate behavior for `/vp-auto`.
- `README.md`, `docs/user/quick-start.md` — updated install wizard controls and uninstall command examples.
- `README.md`, `docs/troubleshooting.md`, `docs/user/quick-start.md` — documented README metric sync flow, `cloc` fallback/install guidance, and maintainer usage.
- `docs/troubleshooting.md` — added selector TTY fallback guidance and uninstall/reinstall recovery flow for legacy symlink installs.
- `README.md` — Project Scale LOC + M1.11 completion banner; Documentation row includes `api/`
- `.viepilot/audit-report.md` — PASS after README metric sync (`/vp-audit`)
- `docs/api/*` — added framework-appropriate API index (no HTTP surface; points to CLI/file model)
- `docs/dev/getting-started.md` — dev entry linking to canonical getting-started
- `docs/README.md`, root `README.md` — index and `docs/` tree synced with `api/`
- `README.md`, `docs/user/features/autonomous-mode.md`, `docs/skills-reference.md`, `docs/user/quick-start.md`, `docs/troubleshooting.md` — clarified `/vp-auto` with no extra args vs `--fast`, control points, and typical one-task-per-chat-turn behavior

## [0.10.0] - 2026-03-31 — M1.14 Guided NPX Installer (FEAT-003)

### Added

- `bin/viepilot.cjs` — new CLI entrypoint for guided install flow.
- `tests/unit/guided-installer.test.js` — parser and CLI behavior tests for installer modes.
- `.viepilot/phases/17-npx-guided-installer/` — phase artifacts, tasks, and summary.

### Enhanced

- `package.json` — `bin.viepilot` mapping for `npx viepilot`.
- `install.sh`, `dev-install.sh` — support automation env vars (`VIEPILOT_AUTO_YES`, install profiles), install `viepilot.cjs`.
- `README.md`, `docs/user/quick-start.md`, `docs/troubleshooting.md` — guided NPX onboarding and fallback instructions.
- `.viepilot/TRACKER.md`, `.viepilot/ROADMAP.md`, `.viepilot/HANDOFF.json`, `.viepilot/requests/FEAT-003.md` — state/release synchronization for M1.14 completion.

## [0.8.2] - 2026-03-31 — M1.12 Doc-first execution gates (BUG-001)

## [0.9.0] - 2026-03-31 — M1.13 UI direction + component curation (FEAT-002)

### Added

- `workflows/ui-components.md` — component curation pipeline (global/local stores, metadata contract, index sync)
- `skills/vp-ui-components/SKILL.md` — new skill to ingest/classify/store reusable UI components
- `docs/user/features/ui-direction.md` — user guide for `/vp-brainstorm --ui`
- `docs/dev/ui-components-library.md` — developer guide for curation taxonomy and artifact contract
- `ui-components/` — baseline stock components bundled with the repo

### Enhanced

- `workflows/brainstorm.md`, `skills/vp-brainstorm/SKILL.md` — UI Direction mode with live `index.html`/`style.css`/`notes.md` artifact loop
- `workflows/crystallize.md`, `skills/vp-crystallize/SKILL.md` — consume UI direction artifacts and map them into implementation plans
- `install.sh`, `dev-install.sh` — install/symlink `ui-components` stock library
- `README.md`, `docs/README.md`, `docs/skills-reference.md`, `docs/user/quick-start.md`, `docs/dev/architecture.md` — synced with new skill/workflow and UI-first flow

### Fixed

- `workflows/autonomous.md` — **Pre-execution documentation gate** before implementation; task start checkpoint only after contract + gate + stack preflight
- `skills/vp-auto/SKILL.md` — doc-first rule + checkpoint order (skill metadata **0.2.1**)
- `templates/phase/TASK.md` — Pre-execution gate checklist (BUG-001)
- `workflows/audit.md` — Tier **1f** heuristic for execute-first / docs-later (report row in **1g**)

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

[Unreleased]: https://github.com/0-CODE/viepilot/compare/v0.10.0...HEAD
[0.10.0]: https://github.com/0-CODE/viepilot/compare/v0.9.0...v0.10.0
[0.9.0]: https://github.com/0-CODE/viepilot/compare/v0.8.2...v0.9.0
[0.8.2]: https://github.com/0-CODE/viepilot/compare/v0.8.1...v0.8.2
[0.8.1]: https://github.com/0-CODE/viepilot/compare/v0.8.0...v0.8.1
[0.8.0]: https://github.com/0-CODE/viepilot/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/0-CODE/viepilot/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/0-CODE/viepilot/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/0-CODE/viepilot/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/0-CODE/viepilot/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/0-CODE/viepilot/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/0-CODE/viepilot/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/0-CODE/viepilot/releases/tag/v0.1.0
