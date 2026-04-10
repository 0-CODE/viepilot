# Changelog

All notable changes to ViePilot will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed (BUG-011 — Phase 55)
- **ui-direction path disambiguation**: `workflows/brainstorm.md` confirmation dialogue option 1 now shows full unambiguous path `.viepilot/ui-direction/{session-id}/notes.md` (was bare `ui-direction/notes.md`)
- **crystallize PATH GUARD**: `workflows/crystallize.md` `consume_ui_direction` step now opens with `⛔ PATH GUARD (BUG-011)` — explicitly instructs LLM to ignore any `{root}/ui-direction/` folder and read only from `.viepilot/ui-direction/`

## [2.1.1] - 2026-04-10

### Fixed (BUG-012 — Phase 56)
- **PATH RESOLUTION RULE**: `workflows/autonomous.md` now has `⛔ PATH RESOLUTION RULE (BUG-012)` block — explicitly states all file reads/edits during task execution resolve from `{cwd}` (repo root), never from `~/.claude/` or `~/.cursor/` install directories
- **evolve.md cwd note**: `workflows/evolve.md` TASK PATH RULE section now includes BUG-012 cwd-resolution clarification: repo-relative paths always anchor to `{cwd}`, not install paths

### Tests
- Added `tests/unit/vp-bug012-path-resolution-rule.test.js` (3 tests)
- Total: 581 tests (was 578)

## [2.1.0] - 2026-04-08

### Added (FEAT-012 — Phase 54)
- **Brainstorm staleness hook**: `lib/hooks/brainstorm-staleness.cjs` — Claude Code `Stop` event handler; fires after each AI response in a brainstorm session; detects stale architect HTML items via keyword matching; marks `data-arch-stale="true"` (amber badge, flag-only); non-blocking (exit 0 always)
- `bin/vp-tools.cjs`: `hooks install [--adapter <id>]` subcommand — merges ViePilot hook entry into `~/.claude/settings.json`; idempotent (re-run safe)
- `docs/user/features/hooks.md` — new user doc: install instructions, adapter table, troubleshooting
- `workflows/brainstorm.md`: `architect_delta_sync` step now references automatic hook mode; `/hooks-install` command added

### Tests
- Added `tests/unit/brainstorm-staleness-hook.test.js` (20 tests, 4 groups) — session discovery, keyword detection, HTML patching, install command
- Total: 578 tests (was 558)

## [2.0.0] - 2026-04-08

### Added (FEAT-013 — Phase 53)
- **Dynamic agent adapter system**: `lib/adapters/` module with `claude-code.cjs`, `cursor.cjs`, `index.cjs` registry — each platform is a self-contained adapter (skillsDir, viepilotDir, executionContextBase, hooks config, installSubdirs, isAvailable, pathRewrite)
- `lib/viepilot-install.cjs`: `buildInstallPlan()` now resolves all platform paths from adapter registry — no hardcoded `.cursor/` constants; single adapter loop replaces cursor + claude-code if-blocks
- `bin/viepilot.cjs`: TARGETS sourced from adapter registry; default non-interactive target = `claude-code`
- `dev-install.sh`: `VIEPILOT_ADAPTER` env var (default: `claude-code`); backward-compat `VIEPILOT_INSTALL_PROFILE` alias preserved
- `bin/vp-tools.cjs`: `hooks scaffold [--adapter <id>]` subcommand — prints `~/.claude/settings.json` hook registration snippet for Claude Code; Cursor: prints explanation

### BREAKING CHANGES
- Default install target changes from `cursor-ide` → `claude-code` (`~/.claude/`)
- Cursor users: set `VIEPILOT_ADAPTER=cursor-agent` (or `VIEPILOT_INSTALL_PROFILE=cursor-agent`) or pass `--target cursor-agent`
- `normalizeInstallEnv({})` default profile is now `claude-code` (was `cursor-ide`)

### Tests
- Added `tests/unit/viepilot-adapters.test.js` (19 tests, 4 groups) — adapter interface, registry, install plan, dev-install.sh
- Updated `tests/unit/viepilot-install.test.js` — 7 tests updated to reflect claude-code default; cursor-explicit tests use `VIEPILOT_INSTALL_PROFILE: 'cursor-ide'`
- Total: 558 tests (was 539)

## [1.19.0] - 2026-04-08

### Added (ENH-034 — Phase 52)
- **vp-brainstorm UI: Architect Delta Sync** — new `architect_delta_sync` step in `workflows/brainstorm.md`: bridges UI Direction Mode and Architect HTML workspace; when a UI session surfaces architect-related gaps, the step parses session for deltas, maps them to affected pages (using existing trigger keyword lists), updates `<tr>` / `<div class="card">` HTML content, marks changed items `data-updated="true"`, and records delta in `notes.md ## architect_sync`
- `/sync-arch` command: manual trigger for architect delta sync at any point in a brainstorm session
- `notes.md` YAML schema extended with `## architect_sync` section (synced_at, source_session, trigger, changes)
- `templates/architect/style.css`: `.arch-gap-badge` (amber) + `[data-arch-stale="true"]` amber left-border indicator — visually distinct from `.updated` (yellow = changed); light-mode overrides included
- `templates/architect/architect-actions.js`: `markStale(id, reason)` + `injectStaleBadges()` — auto-scans `[data-arch-stale="true"]` on DOMContentLoaded and injects amber "⚠ gap" badges; `window.vpMarkStale` exposed for browser console use

### Tests
- Added `tests/unit/vp-enh034-architect-delta-sync.test.js` (14 tests, 3 groups) — all pass (539 total)

## [1.18.1] - 2026-04-07

### Fixed (BUG-010 — Phase 51)
- **Approve/Edit buttons missing on Mermaid diagram cards:** added `data-arch-id` + `data-arch-title` to all 9 diagram cards across 6 pages (architecture ARCH-DIAG1/2, data-flow DF-DIAG1/2, erd ERD-DIAG1, use-cases UC-DIAG1, sequence SEQ-DIAG1/2, deployment DEP-DIAG1)

### Tests
- Added Test Group 5 to `tests/unit/vp-enh033-architect-item-actions.test.js` (9 new tests) — 525 total

## [1.18.0] - 2026-04-07

### Added (ENH-033 — Phase 50)
- **Architect HTML item actions:** stable `data-arch-id` IDs on every item across all 11 content pages (decisions D1–D2, architecture C1–C4, erd E1–E4, use-cases UC1–UC5, apis A1–A9, deployment DEP1–DEP7, data-flow DF1, sequence SEQ1–SEQ2, tech-stack TS1–TS6, tech-notes TN1, features F1–F3)
- `templates/architect/architect-actions.js` — new shared vanilla JS: `approvePrompt()`, `editPrompt()`, `copyText()` with clipboard API + execCommand fallback, button injection on DOMContentLoaded
- **✅ Approve button**: copies `[ARCH:{slug}:{id}] APPROVE — "{title}" on {slug} page. No changes needed.`
- **✏️ Edit button**: copies `[ARCH:{slug}:{id}] EDIT — "{title}" on {slug} page. Current: "{excerpt}". What should I change?`
- `templates/architect/style.css`: `.arch-id-badge`, `.arch-item-actions`, `.arch-btn`, `.arch-btn-approve`, `.arch-btn-edit`, `.arch-btn.copied`, `.arch-actions-cell` — hover-reveal pattern, light-mode overrides
- `workflows/brainstorm.md`: **Architect Item Actions (ENH-033)** section — isolation rule, APPROVE/EDIT prompt handling spec, cross-page cascade prohibition

### Tests
- Added `tests/unit/vp-enh033-architect-item-actions.test.js` (50 tests, 4 groups) — all pass (516 total)

## [1.17.0] - 2026-04-06

### Added (ENH-032 — Phase 49)
- **Language configuration system:** `~/.viepilot/config.json` stores `language.communication` and `language.document` (defaults: `en`/`en`)
- `lib/viepilot-config.cjs` — new module: `readConfig`, `writeConfig`, `resetConfig`, `getConfigPath`; deep-merge with defaults; missing-file safe
- `vp-tools config get/set/reset` — CLI commands to read and write language config
- `lib/viepilot-install.cjs`: `language_config_prompt` step writes config at end of install; `--yes` uses defaults without prompting
- `workflows/crystallize.md`: Step 0-A `load_language_config` — reads `DOCUMENT_LANG` + `COMMUNICATION_LANG` for file generation and session messages
- `workflows/brainstorm.md`: Step 0 `detect_session_language` — reads `BRAINSTORM_LANG` for file storage; user session language overrides config
- `workflows/autonomous.md`: `load_language_config` in Initialize — `COMMUNICATION_LANG` for banners and control-point messages
- `skills/vp-crystallize/SKILL.md`, `skills/vp-brainstorm/SKILL.md`, `skills/vp-auto/SKILL.md`: ENH-032 language config notes

### Tests
- Added `tests/unit/vp-enh032-language-config.test.js` (18 tests) — all pass (466 total)

## [1.16.0] - 2026-04-06

### Changed (ENH-031 — Phase 48)
- **Language standardization (English-primary):** all 12 workflows, all 16 skills, and `templates/project/AI-GUIDE.md` converted to English; Vietnamese retained only in `cursor_skill_adapter` invocation trigger keywords and UI scope signal detection patterns

### Tests
- Added `tests/unit/vp-enh031-language-standardization.test.js` (63 tests) — all pass (448 total)
- Updated `vp-fe010-ui-walkthrough-contracts.test.js` + `vp-enh026-ui-extraction-contracts.test.js` to match translated English strings

## [1.15.0] - 2026-04-06

### Fixed (BUG-009 — Phase 47)
- **Task path guard:** `workflows/evolve.md` now enforces repo-relative paths in task `## Paths` blocks (prevents generating `~/.claude/...` paths that would edit the live install instead of source)
- **Preflight validation:** `workflows/autonomous.md` aborts task execution if `## Paths` contains `~/` or absolute path — error message names offending path and task file
- `skills/vp-evolve/SKILL.md` + `skills/vp-auto/SKILL.md`: path convention documented in `<context>`

### Tests
- Added `tests/unit/vp-bug009-path-guard.test.js` (13 tests) — all pass (385 total)

## [1.14.0] - 2026-04-06

### Changed (ENH-030 — Phase 46)

- **Remove MVP/Post-MVP/Future concept** — all projects now use phase-based planning only:
  - `workflows/brainstorm.md`: replaced `## Product horizon` section + ENH-014 rule with Phase assignment rule (ENH-030) and `## Phases` session template
  - `workflows/crystallize.md`: replaced Horizon validation gate with Phase assignment gate; Step 7 ROADMAP generation now uses `phases_inventory` (no Post-MVP block)
  - `templates/architect/feature-map.html`: mindmap nodes + badge classes updated — MVP/Post-MVP/Future → Phase 1/Phase 2/Phase 3
  - `templates/architect/style.css`: `.badge-mvp/.badge-post-mvp/.badge-future` → `.badge-phase-1/.badge-phase-2/.badge-phase-3`
  - `templates/architect/user-use-cases.html`: Priority column → Phase; badge-mvp/post-mvp/future → badge-phase-1/2/3
  - `templates/architect/index.html`: feature map subtitle updated (no MVP/Post-MVP text)
  - `templates/project/PROJECT-CONTEXT.md`: MVP boundary + Post-MVP themes sections replaced with Project scope + Phase overview table
  - `templates/project/ROADMAP.md`: Post-MVP / Product horizon block removed; maintenance note updated
  - `templates/project/AI-GUIDE.md`: all MVP/horizon reading instructions replaced with phase-centric equivalents
  - `skills/vp-brainstorm/SKILL.md` v1.1.0: phase assignment rule replaces product horizon rule
  - `skills/vp-crystallize/SKILL.md` v0.8.0: phase assignment gate replaces horizon gate
  - `skills/vp-task/SKILL.md`: example updated (no MVP reference)

### Tests
- Added `tests/unit/vp-enh030-no-mvp-contracts.test.js` (10 tests) — all pass (372 total)

## [1.13.0] - 2026-04-04

### Added

- **ENH-029 — Architect Design Mode: C4/Sequence/Deployment/APIs pages (12-page workspace)**:
  - `templates/architect/architecture.html`: C4 Context diagram section (Mermaid `C4Context`) + External Systems table (6 columns: System/Type/Description/Integration method/Owned by/Notes).
  - `templates/architect/sequence-diagram.html` (new): per-scenario sequences — Scenario Index table, 2 placeholder `sequenceDiagram` blocks, differentiation note linking to data-flow.html.
  - `templates/architect/deployment.html` (new): infra `graph TD` with dev/staging/prod, Environments table, Infrastructure Components table, CI/CD `flowchart LR`.
  - `templates/architect/apis.html` (new): per-service endpoint tables (Method/Path/Auth?/Request Body/Response/Status codes/Notes), HTTP method badges, API Design Decisions table with style badges.
  - `templates/architect/style.css`: 5 HTTP method badge classes (`.method-get/post/put/delete/patch`).
  - All 12 architect pages updated with full 12-item sidebar nav (Sequence + Deployment + APIs items added to all existing pages).
  - `templates/architect/index.html`: 3 new hub cards (Sequence Diagram, Deployment, APIs); Architecture card subtitle updated.
  - `workflows/brainstorm.md`: Page Boundary Rules table; Sequence/Deployment/APIs trigger keyword sections; C4Context added to diagram types; `## apis` YAML schema section; 3 new pages in workspace layout.
  - `workflows/crystallize.md` Step 1D: steps 5–6 extract `deployment.html`/`notes.md ## deployment` → `## Deployment & Infrastructure` and `apis.html`/`notes.md ## apis` → `## API Design` in ARCHITECTURE.md; sequence-diagram.html explicitly excluded with rationale.
  - `skills/vp-brainstorm/SKILL.md`: ENH-029 capability note added.
  - `tests/unit/vp-enh029-architect-pages-contracts.test.js` (new): 11 contract tests — all pass (362 total).

## [1.12.0] - 2026-04-04

### Added

- **ENH-027 — Architect Design Mode: ERD page**:
  - `templates/architect/erd.html` (new): Mermaid `erDiagram` with sample entities (User/Order/OrderItem/Product), Entity List table (Entity/Attributes/PK/FK/Notes), Relationship Summary table.
  - `workflows/brainstorm.md`: ERD trigger keywords (entity, table, relationship, foreign key, schema, DB, database); `## erd` section in notes.md YAML schema; `erDiagram` added to supported Mermaid types.
  - `workflows/crystallize.md` Step 1D: step 3 — extracts `## erd` → `## Database Schema (from Architect ERD)` in ARCHITECTURE.md.
  - All 7 existing architect templates updated with `🗄️ ERD` sidebar nav link.
- **ENH-028 — Architect Design Mode: User Use Cases page**:
  - `templates/architect/user-use-cases.html` (new): Mermaid `flowchart LR` with Actors/Use Cases subgraphs, Use Case List table (ID/Actor/Priority), Actor Summary table.
  - `workflows/brainstorm.md`: Use Case trigger keywords (user story, actor, role, use case, scenario); `## use_cases` section in notes.md YAML schema.
  - `workflows/crystallize.md` Step 1D: step 4 — extracts `## use_cases` → `## User Stories & Use Cases (from Architect Mode)` in PROJECT-CONTEXT.md.
  - All architect templates updated with `👤 Use Cases` sidebar nav link; `index.html` adds 2 hub cards.
- **vp-brainstorm v1.0.0**: bumped from 0.9.0 with ENH-027 + ENH-028 capability notes.

## [1.11.0] - 2026-04-04

### Added

- **FEAT-011 — Architect Design Mode**:
  - `workflows/brainstorm.md`: new `### Architect Design Mode` section — activate via `--architect` flag or auto-heuristic (≥3 components OR ≥1 stack mention); generates HTML workspace with 7 sections (architecture, data-flow, decisions, tech-stack, tech-notes, feature-map, hub) + `notes.md` YAML schema; incremental updates per decision with `.updated` CSS highlight; `/review-arch` command for summary + open_questions review.
  - `templates/architect/`: 7 HTML templates + `style.css` — dark/light toggle, Mermaid.js diagrams, `.updated` diff indicator, responsive sidebar nav. Self-contained, open in browser.
  - `workflows/crystallize.md`: new Step 1D `consume_architect_artifacts` — reads `notes.md` YAML; imports `decisions[]` → ARCHITECTURE.md, uses `tech_stack{}` as authoritative, surfaces `open_questions[]` status=open; cross-references `feature-map.html` with Product Horizon; soft suggestion (not hard block) when architect dir missing.
  - `skills/vp-brainstorm/SKILL.md`: bumped to `0.9.0`, FEAT-011 listed in capabilities.
  - `skills/vp-crystallize/SKILL.md`: bumped to `0.7.0`, FEAT-011 listed in capabilities.
  - `docs/user/features/architect-design-mode.md`: new — 8 sections covering overview, activation, HTML artifacts, dialogue cadence, `/review-arch`, crystallize integration, notes.md schema, tips.
  - `tests/unit/vp-feat011-architect-design-mode-contracts.test.js`: 8 contract tests (333 total, all pass).

## [1.10.0] - 2026-04-04

### Added

- **ENH-026 — Background UI Extraction + Crystallize Hard Gate**:
  - `workflows/brainstorm.md`: new `### Background UI Extraction (silent mode)` section — auto-detects 35 UI signal keywords in any brainstorm session; silent `ui_idea_buffer[]` accumulation; surfaces 3-option confirmation dialogue (save to notes, activate UI Direction Mode, or keep buffer) at topic end / `/save` / ≥5 signals. Non-blocking.
  - `workflows/crystallize.md`: Step 1A upgraded to **hard gate** — scans brainstorm sessions for ≥3 UI signals; if `ui_scope_detected = true` and artifacts missing → STOP with 2-option dialogue; Option 2 bypass writes `## UI Direction Assumptions` to `.viepilot/ARCHITECTURE.md`.
  - `skills/vp-brainstorm/SKILL.md`: bumped to `0.8.0`, ENH-026 background extraction listed in capabilities.
  - `skills/vp-crystallize/SKILL.md`: bumped to `0.6.0`, ENH-026 hard gate listed in capabilities.
  - `docs/user/features/ui-direction.md`: new `## Background Extraction` and updated `## Crystallize Integration` sections with hard gate docs, dialogue examples, and diff table vs `--ui` mode.
  - `tests/unit/vp-enh026-ui-extraction-contracts.test.js`: 6 contract tests (325 total, all pass).

## [1.9.11] - 2026-04-02

### Fixed

- **BUG-007**: `vp-tools info` crash "Could not locate viepilot package root" khi CWD không phải viepilot source repo. Fix: `buildInstallPlan()` claude-code block nay copy `package.json` → `~/.claude/viepilot/package.json`, cho phép `resolveViepilotPackageRoot()` tìm thấy root ngay cả khi install từ `~/.claude/viepilot/`. (+2 tests, 319 total pass)

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
