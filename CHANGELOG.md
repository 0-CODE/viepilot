# Changelog

All notable changes to ViePilot will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned

- None.

## [2.0.2] - 2026-04-03

### Fixed

- **BUG-005 (vp-auto state updates)**: `autonomous.md` lacked explicit, verifiable instructions for state file updates after each task PASS. Added mandatory **State Update Checklist** block with 4 groups: (1) task file edits — `Meta.Status → done`, tick all checklist boxes, fill `Implementation Notes` + `Files Changed`; (2) PHASE-STATE.md — task row, `execution_state.status`, Files Changed table; (3) HANDOFF.json — 7 fields; (4) TRACKER.md current task line. Gate: control_point if any write fails before advancing. Also added HANDOFF.json schema detection note (v1 flat vs v2 nested) and `## Post-Completion` section to `templates/phase/TASK.md`.
- **BUG-006 (git tag prefix collision)**: `autonomous.md`, `crystallize.md`, `evolve.md` generated tags without project slug prefix (`vp-p{N}-t{N}` instead of `{slug}-vp-p{N}-t{N}`), causing collision when multiple projects run vp-auto simultaneously. All `{projectPrefix}` prose placeholders replaced with `TAG_PREFIX=$(node bin/vp-tools.cjs tag-prefix --raw)` bash resolution. `templates/phase/TASK.md` Git Tag field updated with runtime resolution note.

## [2.0.1] - 2026-04-03

### Fixed

- **BUG-A (install path convention)**: Tasks 4.6a/4.6b inadvertently reversed the source path convention by changing `.cursor/viepilot/` → `.claude/viepilot/` in source files. The install script (`lib/viepilot-install.cjs`) is designed with source=`.cursor/viepilot/` and only rewrites to `.claude/viepilot/` when installing the `claude-code` target. After the regression, all Cursor-only installs received `.claude/viepilot/` `execution_context` references pointing to non-existent paths. Fix: reverted all 14 `skills/vp-*/SKILL.md` files and `workflows/crystallize.md` (7 template refs) back to `.cursor/viepilot/` source convention. Cursor installs are now correct again; Claude Code installs rewrite as before.
- **BUG-B (install script missing workflow rewrite)**: `lib/viepilot-install.cjs` only applied `rewrite_paths_in_dir` to `~/.claude/skills/` when installing the `claude-code` target; `~/.claude/viepilot/workflows/` and `~/.claude/viepilot/templates/` were copied but never rewritten. Template and workflow path references in Claude Code installations retained stale `.cursor/viepilot/` references. Fix: added two additional `rewrite_paths_in_dir` steps targeting `claudeViepilotDir/workflows/` and `claudeViepilotDir/templates/`. New test validates all 3 rewrite steps are present for `claude-code` target.
- **HANDOFF.log event naming**: Standardized event format in `workflows/autonomous.md`: (1) recovery layer calls now use explicit JSON format (`l1_recovery`, `l2_recovery`, `l3_recovery`) instead of pseudo-code `append_handoff_log()`; (2) `control_point` event split into `control_point_enter` (on entry) + `control_point_exit` (on resolution) for lifecycle traceability; (3) `task_skip` event in handle_blocker Skip path now has explicit JSON emit instruction.

## [2.0.0] - 2026-04-02

### Added

- **v2 Execution Engine — 3-layer silent recovery**: L1 (lint/format auto-fix) → L2 (targeted test fix) → L3 (scope reduction). All layers run silently; control point surfaces only after budget exhaustion.
- **Recovery budget enforcement**: S/M/L/XL complexity maps to fixed L1/L2/L3 attempt caps. Budget parsed from `TASK.md` field `recovery_budget`.
- **`recovery_overrides` per task**: Block L1/L2/L3 individually with `block: true` + `reason`. `L3.block` auto-set to `true` for compliance paths (auth, payment, crypto, data/privacy) via Gap G detection.
- **Gap G compliance pre-flight**: `vp-auto` scans `write_scope` before execution; warns + auto-blocks L3 for compliance domains.
- **Typed state machine**: 8 states in `PHASE-STATE.md → execution_state` block — `not_started`, `executing`, `recovering_l1/l2/l3`, `control_point`, `pass`, `skip` — with declared `available_transitions`.
- **Continuous HANDOFF.json write**: Updated after every sub-task PASS, not just at task boundary. Schema v2: `version`, `position.sub_task`, `recovery.*_attempts`, `context.active_stacks`, `control_point.*`, `meta.last_written`.
- **HANDOFF.log**: Append-only JSONL audit trail at `.viepilot/HANDOFF.log`. Events: `task_start`, `l1/l2/l3_recovery`, `scope_drift`, `task_pass/skip`, `control_point_enter/exit`. Gitignored.
- **Phase-boundary HANDOFF.log rotation**: Archived to `logs/handoff-phase-N.log` at phase complete; live log reset.
- **Scope drift detection** (Tier 2 validation): `git diff --name-only HEAD` vs `write_scope` after each task execution. Violations → immediate control point + `scope_drift` HANDOFF.log event.
- **3-tier validation pipeline**: Tier 1 (task contract check) → Tier 2 (scope lock + drift detection) → Tier 3 (git persistence gate).
- **Control point state protocol**: `HANDOFF.json.control_point.active` set before prompting user; cleared on exit. `vp-status` can detect and display banner.
- **vp-resume tiered context restore**: Quick (<30 min, 2 files) / Standard (30 min–4 h, 3 files) / Full (>4 h, HANDOFF.log tail + active_stacks + user confirmation).
- **vp-status v2**: Control point banner shown before dashboard. Recovery stats (L1/L2/L3 attempt counts) shown when non-zero.
- **Gap A crystallize auto-populate**: `crystallize` + `vp-evolve` auto-fill `type` (from description keywords), `write_scope` (from task Paths section), `recovery_budget` (from complexity). No manual entry needed.
- **vp-request NLP intake rewrite**: Description-first flow with 2-band confidence routing (≥85% inline / 60–84% 1-question / <60% top-3 menu). Gap C UI direction route detection. Horizon-aware XL scope routing.
- **Parallel context loading**: All context files read in 1 batch turn. Static/dynamic/conditional boundary documented in AI-GUIDE.md.
- **`paths:` frontmatter for vp-* skills**: `vp-auto`, `vp-resume`, `vp-request`, `vp-evolve` declare `paths:` for conditional activation.
- **Sub-task tracking in PHASE-STATE.md**: Table updated after each sub-task PASS/FAIL; `execution_state.status` reflects current recovery layer.

### Changed

- **TRACKER.md template**: Refactored to index-only format (≤30 lines). Decision Log, Version History, Blockers moved to on-demand `logs/` files.
- **PHASE-STATE.md template**: Added `## Execution State` YAML block and `## Sub-task Tracking` table.
- **TASK.md template**: Added `## Task Metadata` section with `type`, `complexity`, `write_scope`, `recovery_budget`, `can_parallel_with`, `recovery_overrides`.
- **AI-GUIDE.md template**: Added static/dynamic/conditional context boundary labels and parallel batch instruction.
- **HANDOFF.json template**: Upgraded to schema v2 with full position, recovery, context, control_point, and meta fields.
- **`workflows/autonomous.md`**: Complete rewrite — typed state machine, 3-layer recovery, 3-tier validation, scope drift, continuous HANDOFF, control point protocol, compliance pre-flight.
- **`workflows/crystallize.md`**: Updated to generate v2 templates; Gap A auto-populate; Gap G compliance detection; HANDOFF.json v2 initialization; template path fixed (`.cursor` → `.claude`).
- **`workflows/evolve.md`**: Updated to generate v2 TASK.md with Gap A + Gap G auto-populate.
- **`workflows/resume.md`**: Complete rewrite as tiered context restore workflow.
- **`docs/user/features/autonomous-mode.md`**: Recovery layers, budget table, scope contract, HANDOFF.log, v2 control point format documented.
- **`docs/user/quick-start.md`**: Crystallize artifact list updated (TRACKER.md index format, logs/, HANDOFF.log rotation, v2 task metadata).
- **`docs/advanced-usage.md`**: New Section 2 — Task Configuration (v2) covering write_scope patterns, recovery_overrides, budget tuning, HANDOFF.log.

### Fixed

- **BUG-001 (doc-first gate)**: Task `.md` must hold a real written plan and `PHASE-STATE.md` must show `in_progress` before any implementation commit. Enforced in `autonomous.md`.
- **BUG-003 (git persistence gate)**: Task/phase cannot be marked PASS unless working tree is clean, upstream branch exists, and no unpushed commits.

## [1.9.10] - 2026-04-02

### Fixed

- **BUG-006**: Tất cả install targets (`cursor-ide`, `cursor-agent`, `claude-code`) thiếu 3 lib files trong `buildInstallPlan()`. Fix: cả 2 blocks (cursor `viepilotDir` và claude-code `claudeViepilotDir`) nay copy đủ 4 files: `cli-shared.cjs`, `viepilot-info.cjs`, `viepilot-update.cjs`, `viepilot-install.cjs`. Ngăn crash khi chạy `vp-tools info` / `vp-tools update` trên môi trường đã install. (+3 tests, 317 total pass)

### Added

- None yet.

### Changed

- None yet.

## [1.9.9] - 2026-04-02

### Fixed

- **ENH-025**: Thêm explicit READ-ONLY guard cho `.viepilot/ui-direction/` vào 3 workflows: `autonomous.md` (⛔ guard trong ENH-024 block), `crystallize.md` (Source of truth policy trong `consume_ui_direction` step), `request.md` (ui-direction guard redirect trong `brainstorm_continuation`). Design principle được enforce: ui-direction = frozen design contract — chỉ `vp-brainstorm` có quyền write; thay đổi ui-direction phải mở phiên brainstorm mới (session-id mới).

## [1.9.8] - 2026-04-02

### Fixed

- **BUG-005**: `claude-code` install target không mirror `workflows/`, `bin/`, `templates/` sang `~/.claude/viepilot/` dẫn đến tất cả skills bị broken trên máy không có Cursor. Fix: `buildInstallPlan` nay tạo `claudeViepilotDir = ~/.claude/viepilot/`, mirror toàn bộ artifacts, và thêm bước `rewrite_paths_in_dir` để replace `.cursor/viepilot` → `.claude/viepilot` trong SKILL.md files. Cursor targets không bị ảnh hưởng. (+6 tests, 314 total pass)

## [1.9.7] - 2026-04-02

### Fixed

- **ENH-024**: Fix chuỗi truyền tải ui-direction bị đứt qua crystallize → vp-auto:
  - `crystallize.md` Step 1A: đổi trigger thành hard check mandatory khi `.viepilot/ui-direction/` exists (không còn soft heuristic "if indicates").
  - `crystallize.md` Step 10: thêm "UI Direction context injection" — inject `context_required` trỏ vào `notes.md` + `style.css` + `pages/*.html` vào task files cho UI tasks.
  - `autonomous.md` Step 3a: thêm "UI Direction safety check" — warn + auto-load latest session nếu UI task thiếu ui-direction trong context_required.
  - `templates/project/AI-GUIDE.md`: thêm 2 rows ui-direction vào Quick Lookup table + footnote hướng dẫn resolve `{session}`.

## [1.9.6] - 2026-04-02

### Fixed

- **ENH-023**: `workflows/autonomous.md` Step 3 Handle Result PASS — thêm `Update ROADMAP.md: sync phase progress % và task count nếu phase status/progress thay đổi` vào danh sách update sau `CHANGELOG.md`. Trước đây ROADMAP.md chỉ được sync tại phase-complete (Step 5a), bỏ sót task-level progress.

## [1.9.5] - 2026-04-02

### Added

- **M1.29 / Phase 35 (ENH-022)** — Crystallize **Step 4** ghi thêm **`.viepilot/architecture/<diagram>.mermaid`** (raw Mermaid, mirror khối fenced trong `ARCHITECTURE.md`); bảng tên canonical + policy trong `workflows/crystallize.md`; template `templates/project/ARCHITECTURE.md` có **Diagram source files** và dòng path từng section; **vp-crystallize** 0.5.2, **vp-audit** 0.3.2; `docs/skills-reference.md`; `tests/unit/vp-enh022-crystallize-architecture-files-contracts.test.js` (**308** tests).

## [1.9.4] - 2026-04-02

### Fixed

- **Installer / Claude Code** — `npx viepilot install --target claude-code` giờ **copy** (hoặc symlink nếu `VIEPILOT_SYMLINK_SKILLS=1`) toàn bộ `skills/vp-*` vào **`~/.claude/skills/`**, không chỉ `~/.cursor/skills/`. `uninstall --target claude-code` gỡ `~/.claude/skills/vp-*`. (`lib/viepilot-install.cjs`, `bin/viepilot.cjs`; tests + `docs/user/claude-code-setup.md`, FAQ).

## [1.9.3] - 2026-04-02

### Added

- **M1.29 / Phase 34 (FEAT-001)** — Hướng dẫn ViePilot trên **Claude Code**: `docs/user/claude-code-setup.md` (installer `npx viepilot install --target claude-code`, map `vp-*` → `~/.claude/skills`, `vp-tools info`, chuỗi request → evolve → auto); cross-links trong `docs/getting-started.md`, `docs/user/quick-start.md`, `docs/user/faq.md`, `docs/README.md`; `tests/unit/vp-feat001-claude-code-docs-contracts.test.js`; README test metrics **299** / **15** suites.

## [1.9.2] - 2026-04-03

### Changed

- **ENH-019** — `/research-ui`: Phase 1 thêm **content stress pass** (copy dài, khối lượng, validation, viewport…) và **Stress findings**; log + designer pass cập nhật tương ứng (`workflows/brainstorm.md`, `vp-brainstorm` 0.6.1 → **0.6.3** theo bản ship).
- **ENH-020** — `/research-ui`: bảng **stress recipes theo archetype** (landing, SaaS admin, form/wizard, reader, commerce/booking) + hybrid.
- **ENH-021** — **Implementation routing guard**: `vp-request` / `vp-evolve` / `vp-debug` không implement shipping mặc định; chuỗi **`/vp-evolve` → `/vp-auto`**; cả **16** `skills/vp-*/SKILL.md` + `workflows/request.md`, `evolve.md`, `debug.md`, `autonomous.md`; `docs/skills-reference.md`; `tests/unit/vp-en021-implementation-routing-contracts.test.js`; README test metrics **297**.

## [1.9.1] - 2026-04-02

### Added

- **M1.28 / Phase 32 (FEAT-010)** — UI Direction **UX walkthrough**: slash **`/research-ui`** and **`/research ui`** in `workflows/brainstorm.md` (3 phases: end-user simulation → designer + web research → update `notes.md` **`## UX walkthrough log`** and HTML/CSS); `skills/vp-brainstorm` **0.6.0**; `docs/user/features/ui-direction.md`, `docs/skills-reference.md`; `tests/unit/vp-fe010-ui-walkthrough-contracts.test.js`.

## [1.9.0] - 2026-04-01

### Added

- **M1.27 / Phase 31 (FEAT-009) completed** — reusable global org context: `~/.viepilot/profiles/<slug>.md` + `~/.viepilot/profile-map.md`; project binding `.viepilot/META.md`; brainstorm **Project meta intake** after scope lock; Node installer seeds dirs/map; **crystallize** + **vp-docs** consume active profile for pre-fill and attribution.
- `docs/dev/global-profiles.md` — normative contract (paths, schema, resolution).
- `templates/project/VIEPILOT-META.md` — template for `.viepilot/META.md`.
- `workflows/brainstorm.md` + `skills/vp-brainstorm/SKILL.md` (0.5.0) — meta intake step 5 + session sections.
- `lib/viepilot-install.cjs` — `mkdir` `~/.viepilot/profiles` + `write_file_if_missing` for `profile-map.md`; plan paths `viepilotProfilesDir` / `viepilotProfileMapPath`.
- `workflows/crystallize.md` + `skills/vp-crystallize/SKILL.md` (0.5.0) — Step 0 profile load; ARCHITECTURE / PROJECT-CONTEXT / AI-GUIDE merge rules.
- `workflows/documentation.md` + `skills/vp-docs/SKILL.md` (0.2.0) — §0A profile resolution for generated docs.
- `docs/user/quick-start.md`, `docs/user/features/brainstorm.md`, `docs/skills-reference.md` — user-facing FEAT-009 notes.
- `tests/unit/vp-fe009-global-profiles-contracts.test.js` — regression tests for workflow/skill/installer/template contracts.

## [1.8.1] - 2026-04-01

### Fixed

- **M1.26 / Phase 30 (BUG-004) completed** — enforced vp-only namespace behavior across the framework: all `vp-*` skills include scope guard rules, core workflows default to `vp-*` routing only, and external skills are allowed only via explicit user opt-in.

### Added

- `tests/unit/vp-scope-policy-contracts.test.js` — regression tests to ensure all bundled skills/workflows retain the BUG-004 scope policy contract.

### Documentation

- `docs/skills-reference.md`, `docs/user/features/autonomous-mode.md`, `docs/user/features/debug-mode.md`, `docs/user/quick-start.md` — clarified default `vp-*` scope and added explicit opt-in examples for external skills.

## [1.8.0] - 2026-04-01

### Added

- **M1.25 / Phase 29 (ENH-018) completed** — complexity-gated Mermaid architecture contract shipped: brainstorm inputs + crystallize matrix (`required|optional|N/A`) for six diagram types, architecture template sections with N/A rationale policy, and skill/workflow alignment across `vp-crystallize`, `vp-audit`, `vp-debug`, and `autonomous`.

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

[Unreleased]: https://github.com/0-CODE/viepilot/compare/v1.9.2...HEAD
[1.9.2]: https://github.com/0-CODE/viepilot/compare/v1.9.1...v1.9.2
[1.9.1]: https://github.com/0-CODE/viepilot/compare/v1.9.0...v1.9.1
[1.9.0]: https://github.com/0-CODE/viepilot/compare/v1.8.1...v1.9.0
[1.8.1]: https://github.com/0-CODE/viepilot/compare/v1.8.0...v1.8.1
[1.8.0]: https://github.com/0-CODE/viepilot/compare/v1.7.0...v1.8.0
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
