# Changelog

All notable changes to ViePilot will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.35.0] - 2026-04-22

### Added (ENH-067)
- `workflows/brainstorm.md`: Session template adds `workflow_version` + `upgrade_supplement_version` fields to `## Session Info`; **Step 3B: Upgrade Gap Detection** — on `--continue`, compares session `workflow_version` vs. current Topics Template using version threshold table (ENH-063 v2.32, ENH-065 v2.33, ENH-066 v2.34) with false-positive cross-check; shows 🔄 upgrade banner (AUQ: discuss now / remind at /save / skip); runs inline Q&A for missing topics; appends `## Upgrade supplement (vX → vY)` section; stamps `upgrade_supplement_version` for idempotency; suggests `/vp-crystallize --upgrade`
- `workflows/crystallize.md`: **Step 0-B: Upgrade Re-scan Mode** (`--upgrade` flag + auto-detect from `crystallize_version` stamp); delta computation from version threshold table; AUQ menu — **Patch** (non-destructive: reads architect YAML → appends missing sections, re-stamps version) / **Full re-generate** (backup `.viepilot/backup-pre-regen-{ts}/` → pre-fill Step 0 → overwrite artifacts) / **Skip**; brainstorm supplement integration (folds `## Upgrade supplement` content automatically); soft warn when architect `notes.md` YAML missing; Step 5 writes `<!-- crystallize_version: {semver} -->` as first line of `PROJECT-CONTEXT.md`; `HANDOFF.json` records `crystallize_version` + `crystallized_at`
- `skills/vp-brainstorm/SKILL.md`: Workflow version stamps + Upgrade gap detection bullets (ENH-067)
- `skills/vp-crystallize/SKILL.md`: Crystallize version stamps + Upgrade re-scan mode bullets (ENH-067)

## [2.34.0] - 2026-04-21

### Added (ENH-066)
- `workflows/brainstorm.md`: Topic 8 "User Data Management" in brainstorm Topics Template (10 sub-questions: profile management, notification preferences, privacy/GDPR controls, activity history, connected OAuth accounts, session/device management, 2FA, consent management, data retention); proactive 👤 heuristic (≥1 user-data keyword at session start, ≥2 during session); user data coverage gate before /save for B2C/SaaS/GDPR projects; `user-data.html` page in Architect workspace; `notes.md ## user_data` YAML schema; Phase assignment renumbered to Topic 9
- `workflows/crystallize.md`: Step 1D extended — exports `notes.md ## user_data` → `## User Data Management` capabilities table in `PROJECT-CONTEXT.md`; `user-data.html` added to MANDATORY READ GATE list as item 14
- `templates/project/PROJECT-CONTEXT.md`: `## User Data Management` section with placeholder capability table (8 rows: profile editing, notification prefs, privacy settings, data export, right to erasure, connected accounts, session management, 2FA)
- `skills/vp-brainstorm/SKILL.md`, `skills/vp-crystallize/SKILL.md`: ENH-066 documented

## [2.33.0] - 2026-04-21

### Added (ENH-065)
- `workflows/brainstorm.md`: Topic 7 "Content Management" in brainstorm Topics Template (10 sub-questions: content types, lifecycle, WYSIWYG/markdown, media, taxonomy, localization, search, versioning, SEO); proactive 🗂️ heuristic (≥1 content keyword at session start, ≥2 during session); content coverage gate before /save; `content.html` page in Architect workspace + Page Boundary Rules; `notes.md ## content` YAML schema; Phase assignment renumbered to Topic 8
- `workflows/crystallize.md`: Step 1D extended — exports `notes.md ## content` → `## Content Management` table (content types, media/storage, localization) in `PROJECT-CONTEXT.md`; `content.html` added to MANDATORY READ GATE list
- `templates/project/PROJECT-CONTEXT.md`: `## Content Management` section with Content Type, Media & Storage, and Localization placeholder tables
- `skills/vp-brainstorm/SKILL.md`, `skills/vp-crystallize/SKILL.md`: ENH-065 documented

## [2.32.0] - 2026-04-21

### Fixed (BUG-018)
- `workflows/brainstorm.md`: added unified workspace mode-selection AUQ prompt (Step 2B) after scope lock — user now chooses Both / Architect only / UI Direction only / Neither; Architect auto-activate heuristic deferred until after this selection; suppressed when user selects "Neither" or "UI Direction only"
- `skills/vp-brainstorm/SKILL.md`: objective updated with BUG-018 mode selection reference

### Added (ENH-063)
- `workflows/brainstorm.md`: Topic 6 "Admin & Governance" in brainstorm Topics Template; proactive 🔐 heuristic (≥1 admin keyword at session start, ≥2 during session); admin coverage gate before /save for multi-user/SaaS/compliance projects; `admin.html` page in Architect workspace; `notes.md ## admin` YAML schema
- `workflows/crystallize.md`: Step 1D extended — exports `notes.md ## admin` → `## Admin & Governance` table (capabilities + personas) in `PROJECT-CONTEXT.md`
- `templates/project/PROJECT-CONTEXT.md`: `## Admin & Governance` section with placeholder table
- `skills/vp-brainstorm/SKILL.md`, `skills/vp-crystallize/SKILL.md`: ENH-063 documented

### Added (ENH-064)
- `workflows/brainstorm.md`: cross-workspace HUB links — Architect `index.html` ↔ UI Direction `index.html` when both workspaces active in same session; triggered by arch_to_ui_sync, BUG-018 "Both" selection, or `/sync-links`
- `workflows/crystallize.md`: Step 1D MANDATORY READ GATE — if architect workspace exists, reads ALL 12 pages front-to-back before extraction; `architect_read_complete: true` required; `notes.md` missing → STOP
- `workflows/crystallize.md`: Step 1A strengthened — if ui-direction exists, reads ALL pages/*.html + ALL notes.md sections; `ui_direction_read_complete: true` required; pages inventory mismatch → STOP
- `workflows/crystallize.md`: Step 1F Cross-Reference Gate — validates `## Coverage` matrix when both workspaces present; warns on Phase 1 features with no architect OR UI coverage
- `skills/vp-crystallize/SKILL.md`: mandatory workspace read gates documented

## [2.31.0] - 2026-04-21

### Added (ENH-062)
- `skills/vp-skills/SKILL.md`: new `/vp-skills` slash command — agent-native global skill registry management from any project; commands: scan, list, install, uninstall, update, info; uses installed vp-tools path (`~/.claude/viepilot/bin/vp-tools.cjs`)
- `bin/vp-tools.cjs`: new `get-registry [--id <id>]` subcommand — outputs registry JSON to stdout; enables workflow shell integration

### Fixed (BUG-016)
- `workflows/autonomous.md`: replaced non-executable `Call loadRegistry()` with `node ~/.claude/viepilot/bin/vp-tools.cjs get-registry --id {id}` shell command
- `workflows/brainstorm.md`: replaced `Call loadRegistry()` with `node ~/.claude/viepilot/bin/vp-tools.cjs get-registry` shell command + cat fallback

### Fixed (BUG-017)
- `skills/vp-evolve/SKILL.md`: added explicit AUQ call in Step 5 `<process>` body — workflow continuation prompt (Execute /vp-auto / Create request / Done)
- `skills/vp-request/SKILL.md`: added explicit AUQ call in Step 6 `<process>` body — workflow continuation prompt (Plan /vp-evolve / Create request / Done)

## [2.30.0] - 2026-04-20

### Changed (FEAT-020 Phase 5 — complete)
- `workflows/autonomous.md`: Added **Skill Context Load** step at init — reads `PROJECT-CONTEXT.md ## Skills`, builds `SKILL_CONTEXT_MAP`; absent section → silent no-op
- `workflows/autonomous.md`: Added **Skill Context Injection** per-task rule — required skills whose phases match are prepended silently to execution context; records `skills_applied` in task output; never prompts user
- `skills/vp-auto/SKILL.md`: FEAT-020 silent skill execution docs
- **FEAT-020 fully complete** (Phases 90–94): Skill Registry System — scanner + installer + brainstorm integration + crystallize gate + vp-auto execution

## [2.29.0] - 2026-04-20

### Changed (FEAT-020 Phase 4)
- `workflows/crystallize.md`: Added **Step 1E — Skill Decision Gate** — reads `## skills_used` from brainstorm notes.md; AUQ confirm required/optional/exclude; writes `## Skills` to PROJECT-CONTEXT.md; silently skipped when no skills_used present
- `templates/project/PROJECT-CONTEXT.md`: Added `## Skills` template section
- `skills/vp-crystallize/SKILL.md`: FEAT-020 skill gate docs — AUQ flow, lock semantics, cross-references

## [2.28.0] - 2026-04-20

### Changed (FEAT-020 Phase 3)
- `workflows/brainstorm.md`: Added **Skill Registry Integration** step in UI Direction Mode — when active, loads `~/.viepilot/skill-registry.json`, matches skills by `capabilities` to UI signals, silently applies `best_practices` to HTML generation, records matched skills in `notes.md ## skills_used`
- `skills/vp-brainstorm/SKILL.md`: FEAT-020 skill integration docs — silent apply, crystallize lock reference

## [2.27.0] - 2026-04-20

### Added (FEAT-020 Phase 2 — Skill Installer)
- `lib/skill-installer.cjs`: new `installSkill(source, home?)`, `uninstallSkill(id, home?)`, `updateSkill(id, home?)` — multi-channel installer (npm / GitHub / local); writes `skill-meta.json` post-install; auto-runs `scanSkills()`
- `bin/viepilot.cjs`: new `install-skill`, `uninstall-skill`, `update-skill` subcommands

## [2.26.0] - 2026-04-20

### Added (FEAT-020 Phase 1 — Skill Registry Foundation)
- `lib/skill-registry.cjs`: new `scanSkills(home?)` — traverses all adapter `skillsDir` paths, parses SKILL.md (extended + legacy), deduplicates by id, writes `~/.viepilot/skill-registry.json`
- `lib/skill-registry.cjs`: new `loadRegistry(home?)` — reads and returns registry JSON (null if absent)
- `bin/viepilot.cjs`: new `scan-skills` subcommand — runs scanner, prints per-adapter summary + total unique skills
- `bin/viepilot.cjs`: new `list-skills` subcommand — displays indexed skills table from registry
- `docs/user/features/skill-registry.md`: extended SKILL.md format spec (`## Capabilities`, `## Tags`, `## Best Practices`), scanner behavior, registry JSON schema, commands table
- Extended SKILL.md format: optional metadata sections — backward compatible (legacy SKILL.md without sections indexed with `[]` fields)

## [2.25.0] - 2026-04-18

### Changed (ENH-061)
- `workflows/brainstorm.md`: Added **Recommended Breakdown Ordering** — 8-step idea→architect+UI flow (free collection → scope lock → coverage mapping → architect design → arch→UI sync → UI direction → completeness gate → save)
- `workflows/brainstorm.md`: Added **Feature → Coverage Mapping** step — after scope lock, maps each Phase 1 feature to an architect page + UI screen; outputs `## Coverage` matrix in `notes.md`; warns on features with no coverage in either mode (non-blocking)
- `workflows/brainstorm.md`: Added **Section 6C — Architect → UI Direction Sync** (`arch_to_ui_sync`) — reverse sync from Architect workspace to UI Direction; surfaces UI implications of architectural decisions (async flows, auth roles, error codes, constraints); `/sync-ui` command; records `## arch_to_ui_sync` in `notes.md`
- `workflows/brainstorm.md`: Expanded pre-save completeness gate with **CHECK 4** — non-blocking warning when both workspaces are active but Phase 1 features have no coverage in either mode
- `skills/vp-brainstorm/SKILL.md`: Breakdown loop documented (coverage matrix, `arch_to_ui_sync` reverse sync, completeness gate, recommended ordering)

## [2.24.0] - 2026-04-18

### Changed (ENH-060)
- **`workflows/brainstorm.md`**: UI Direction Mode now proactively suggests itself when ≥1 UI keyword is found in the initial message (early-session detection), matching Architect Design Mode behavior — shows a 🎨 banner before topic selection
- **`workflows/brainstorm.md`**: Lowered accumulation threshold from ≥3 to ≥1 signal; surface threshold lowered from ≥5 to ≥2 unique signals
- **`workflows/brainstorm.md`**: Confirmation dialogue updated with 🎨 banner (was plain 💡), wording mirrors the Architect 🏗️ banner style
- **`skills/vp-brainstorm/SKILL.md`**: Updated Background UI extraction docs — auto-suggestion, lower thresholds, 🎨 banner reference, ENH-060 tagged

## [2.23.0] - 2026-04-18

### Added
- **ENH-059**: AskUserQuestion ToolSearch preload — all vp-* skills and workflow files on Claude Code adapter now instruct the model to call `ToolSearch { query: "select:AskUserQuestion" }` before the first interactive prompt, preventing deferred-tool fallback to text menus
  - 5 SKILL.md files updated: `vp-request`, `vp-evolve`, `vp-auto`, `vp-brainstorm`, `vp-crystallize`
  - 3 workflow files updated: `workflows/request.md`, `workflows/evolve.md`, `workflows/autonomous.md`
  - `vp-auto/SKILL.md` now has a full AUQ adapter compatibility section

## [2.22.1] - 2026-04-18

### Fixed
- **BUG-015**: `copilot` adapter missing from `bin/viepilot.cjs` CLI — `TARGETS` array and `printHelp()` text now include `copilot`; `viepilot --list-targets` shows GitHub Copilot; `viepilot install --target copilot` no longer fails with "Unknown target"

## [2.22.0] - 2026-04-18

### Added
- **ENH-058**: Workflow continuation prompt — AskUserQuestion at vp-evolve and vp-request completion
  - `workflows/evolve.md` Step 5: AUQ asks "Execute now / Create request / Done" — selecting Execute invokes `/vp-auto` immediately
  - `workflows/request.md` Step 7: AUQ asks "Plan phase / Create another / Done" — selecting Plan invokes `/vp-evolve` immediately
  - Text fallback for Cursor / Codex / Copilot / Antigravity adapters (static list preserved)
  - `skills/vp-evolve/SKILL.md` + `skills/vp-request/SKILL.md` AUQ prompt tables updated

## [2.21.0] - 2026-04-18

### Added
- **FEAT-019: GitHub Copilot Adapter** — install and run vp-* skills inside VS Code Copilot Chat and GitHub Copilot CLI
  - `lib/adapters/copilot.cjs` — adapter definition with `~/.config/gh-copilot/` config home
  - Auto-detect via `~/.config/gh-copilot/` directory or `gh` CLI binary presence
  - Skill invocation: `/vp-status`, `/vp-auto`, etc. (same slash syntax as Claude Code / Cursor)
  - Install command: `viepilot install --target copilot`
  - 4 adapter-table SKILL.md files updated with GitHub Copilot row
  - `docs/user/features/adapters.md` — Copilot section with surface matrix, prerequisites, limitations

## [2.20.0] - 2026-04-18

### Added
- **ENH-057: ViePilot Agents System** — 6 dedicated sub-agents for repetitive/parallelizable skill tasks:
  - `tracker-agent`: TRACKER.md read/write delegation (phase status, task status, decision log)
  - `research-agent`: WebSearch + WebFetch feasibility studies (auto-triggered in request.md Step 2B)
  - `file-scanner-agent`: Glob + Grep repo-wide scanning (Explore subagent on Claude Code)
  - `changelog-agent`: atomic CHANGELOG + version bump — single authority (resolves ENH-053)
  - `test-generator-agent`: contract test scaffolding + run from acceptance criteria
  - `doc-sync-agent`: bulk multi-file `.md` updates (≥5 files → 1 agent call)
- `agents/` directory with 6 agent definition files (`agents/*-agent.md`)
- Research-agent feasibility gate in `workflows/request.md` Step 2B — auto-triggered for Feature/platform requests
- Bulk-edit task detection in `workflows/autonomous.md` — doc-sync-agent invoked when ≥5 identical file types in task Paths
- Agent delegation table + invoke-agent patterns in `workflows/autonomous.md`
- `docs/dev/agents.md` — developer reference for agents layer architecture and invocation

### Fixed
- **ENH-053**: Version bump authority unified in `changelog-agent` — `autonomous.md` and `evolve.md` both invoke it; no more inline duplication

## [2.19.0] - 2026-04-18

### Added
- **ENH-056: Skill invocation greeting banner** — all 17 `vp-*` skills now output
  a version banner as the very first output on invocation:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   VIEPILOT ► VP-AUTO  v0.2.2 (fw 2.19.0)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```
  Addresses Claude Code UI change where skill-load indicators are no longer shown;
  users can now confirm which skill version is running. 119 contract tests added.

## [2.18.0] - 2026-04-18

### Fixed
- **vp-rollback** (BUG-014): `rollback.md` Step 7 now parses enriched tag format
  `{project}-{branch}-{version}-vp-p{N}-t{M}` introduced by ENH-050. Rollback to
  any Phase 57+ checkpoint correctly restores HANDOFF.json phase/task state.
  All 3 formats (legacy, project-scoped, enriched) handled via `grep -oE vp-p[0-9]+`.

### Changed
- **vp-crystallize** (ENH-051): Added "Brownfield Execution Path" table clarifying
  which sub-steps (1A–1D) run, skip, or are conditional in brownfield mode.
  Steps 1A/1B CONDITIONAL; Steps 1C/1D SKIP with rationale.
- **vp-brainstorm** (ENH-052): Step 6 now validates phase assignment before saving.
  Scope-locked sessions with features but no phase assignments are blocked with
  actionable message. Exploratory sessions and brownfield stubs bypass the gate.
- **Version bump rules** (ENH-053): Consolidated into `.viepilot/SYSTEM-RULES.md`
  as single canonical table with precedence rule (MAJOR > MINOR > PATCH) and
  mixed-phase handling. `evolve.md` and `autonomous.md` reference this table
  instead of defining rules inline.
- **vp-audit post-phase hook** (ENH-054): Auto-hook integration upgraded from
  conceptual note to concrete `<step name="post_phase_audit">` block in
  `autonomous.md`. Runs 3 fast Tier 1+2 checks after every phase-complete event;
  completely silent when no issues found; y/n prompt when issues detected.
- **AskUserQuestion enforcement** (ENH-055): All 13 AUQ prompt blocks across 4
  workflows (evolve, request, brainstorm, crystallize) now explicitly mark Claude
  Code adapter as REQUIRED. Plain-text menus remain as fallback for non-Claude-Code
  adapters only. `vp-evolve/SKILL.md` gains new Adapter Compatibility section.

### Files
- `workflows/rollback.md` — Step 7: 3-format tag parse with `grep -oE`
- `workflows/crystallize.md` — Brownfield Execution Path table (Step 0-C → Step 1)
- `workflows/brainstorm.md` — Pre-save phase validation gate in Step 6
- `.viepilot/SYSTEM-RULES.md` — Canonical Version Bump Rules table
- `workflows/evolve.md` — Version bump ref → SYSTEM-RULES.md; AUQ REQUIRED
- `workflows/autonomous.md` — Version bump ref + `post_phase_audit` step (5c)
- `workflows/audit.md` — Auto-hook: concrete integration spec replaces conceptual note
- `workflows/request.md`, `brainstorm.md`, `crystallize.md` — AUQ REQUIRED
- `skills/vp-evolve/SKILL.md` — New Adapter Compatibility section
- `skills/vp-request`, `vp-brainstorm`, `vp-crystallize` SKILL.md — AUQ REQUIRED
- `tests/unit/vp-workflow-consistency.test.js` — 35 contract tests

## [2.17.0] - 2026-04-17

### Changed
- **vp-auto** git tags now include active branch and package version for full
  traceability. New format: `{prefix}-{branch}-{version}-vp-p{n}-t{n}`. (ENH-050)
  - Branch resolved via `git rev-parse --abbrev-ref HEAD` (sanitized: `/` → `-`)
  - Version resolved from `package.json` (fallback: `0.0.0`)
  - Legacy tags (`{prefix}-vp-p{n}-*`) continue to be recognized by audit + rollback

### Files
- `workflows/autonomous.md` — `TAG_PREFIX` resolution block (BRANCH_SAFE + VERSION);
  task start, task done, and phase complete tag patterns updated to enriched format
- `workflows/audit.md` — `COMPLETE_TAGS` regex: added third alternative for enriched
  format; `PREV_TAG` grep: extended char class to include `.` for version strings
- `workflows/rollback.md` — tag grep char class extended to include `.` for version strings
- `tests/unit/vp-enh050-git-tag-format.test.js` — 16 contract tests

## [2.16.0] - 2026-04-17

### Changed
- **vp-audit** Tier 4 (Framework Integrity) now runs silently — output is suppressed
  when the check passes (✅) or is skipped (non-framework repo). Tier 4 is only
  surfaced in the audit report when issues (⚠️) are found. (ENH-049)

### Files
- `workflows/audit.md` — Step 4 skip: removed `echo "→ Tier 4 skipped"` message;
  Step 4f report block wrapped in `TIER4_ISSUES > 0` guard; All Clear banner Tier 4
  line removed; Issues Found banner Tier 4 line rendered only when `TIER4_ISSUES > 0`
- `skills/vp-audit/SKILL.md` — documented silent-by-default Tier 4 behavior (ENH-049)
- `tests/unit/vp-enh049-audit-tier4-silent.test.js` — 13 contract tests

## [2.15.0] - 2026-04-13

### Changed (ENH-048 — Phase 78: AskUserQuestion Adapter-Aware Integration)

All `vp-*` workflows that ask users questions now include adapter-aware interactive prompts.
Claude Code (terminal) receives a structured click-to-select UI via `AskUserQuestion` tool.
All other adapters (Cursor Agent/Skills, Codex CLI, Antigravity native) automatically fall back
to the existing plain-text numbered lists — no configuration required.

**Research findings (adapter compatibility):**
- Claude Code terminal: ✅ `AskUserQuestion` fully supported (native tool)
- Cursor Agent/Skills Mode: ❌ `AskQuestion` only available in Plan Mode (community feature request)
- Codex CLI: ❌ not native (community MCP `ask-user-questions-mcp` exists separately)
- Antigravity native agent: ❌ uses Artifact model, no raw tool calls

**`workflows/crystallize.md`:**
- Added `Adapter Compatibility` table near top
- License selection (Step 0): AUQ spec with MIT/Apache-2.0/GPL-3.0/Proprietary options
- Brownfield overwrite confirmation (Step 0-B): AUQ Yes/No prompt
- Polyrepo related-repos prompt (Step 0-B): AUQ Yes supply/Skip options
- UI direction gate (Step 1A): AUQ Return-to-brainstorm / Continue-with-assumptions options
- Architect mode suggestion (Step 1D): AUQ Yes/No architect mode routing

**`workflows/brainstorm.md`:**
- Added `Adapter Compatibility` table near top
- Session intent (Step 2): AUQ Continue-recent / Review-specific / New-session options
- Landing page layout (Step 4): AUQ Layout A/B/C/D with descriptions (4-option fit)

**`workflows/request.md`:**
- Added `Adapter Compatibility` table near top
- Request type detection (Step 2): AUQ Bug/Feature/Enhancement/Tech-Debt (Brainstorm+List remain text)
- Bug severity (Step 4A): AUQ Critical/High/Medium/Low options
- Feature priority (Step 4B): AUQ Must-have/Should-have/Nice-to-have options

**`workflows/evolve.md`:**
- Added `Adapter Compatibility` table near top
- Intent detection (Step 2): AUQ Add-Feature/New-Milestone/Refactor options
- Complexity question (Step 3A): AUQ S/M/L/XL options
- Brainstorm routing (Step 3A): AUQ Yes-brainstorm/No-plan-directly options

**`skills/vp-crystallize/SKILL.md`, `skills/vp-brainstorm/SKILL.md`, `skills/vp-request/SKILL.md`:**
- Added `## Adapter Compatibility` section with 6-row adapter support table
- Listed prompts using AskUserQuestion per skill

### Added
- `tests/unit/vp-enh048-askuserquestion.test.js` — 33 contract tests verifying AUQ specs + text fallback preservation across all affected files

## [2.14.0] - 2026-04-13

### Added (ENH-047 — Phase 77: Brownfield Multi-Repo, Submodules & Per-Module Gap Detection)

**Gap A — Git Submodule Detection:**
- `workflows/crystallize.md`: Signal Category 1 now reads `.gitmodules` → parses all `[submodule]` blocks (name, path, url); runs Signal Cat 1+2+4 on each initialized submodule path; records uninitialized paths with `initialized: false` + `primary_language: MISSING`
- Scan Report `modules[]`: new fields `type` (submodule/workspace/root), `submodule_url`, `initialized`
- Safety rule: scanner never runs `git submodule update` — local filesystem read-only

**Gap B — Polyrepo / Multi-Repo Detection:**
- `workflows/crystallize.md`: new Polyrepo Detection subsection in Signal Category 1 with 6 signal sources (docker-compose `../` build contexts, `file:../` package.json deps, CI cross-repo clones, README external repo links, Makefile `cd ../` targets)
- Scan Report: `polyrepo_hints[]` + `related_repos[]` fields (omitted entirely when empty — no empty arrays in clean single-repo reports)
- Interactive prompt fires when polyrepo signals detected; user can supply related repo URLs with optional role label
- Gap-fill rule: polyrepo hints without `related_repos` → system-level context fields = ASSUMED tier

**Gap C — Per-Module Gap Detection:**
- `workflows/crystallize.md`: new Per-Module Gap Detection section with MUST-DETECT table (primary_language, framework, module_purpose, entry_point) including source signals and tier-if-absent rules
- `must_detect_status{}` per module: records `{ value, source, tier }` per MUST-DETECT field; source conventions: `"tsconfig.json"` (file), `"inferred"` (ASSUMED), `"absent"` (MISSING), `"user"` (gap-filled)
- Root gap tier rollup: worst tier across all modules (MISSING > ASSUMED > DETECTED)
- Module with `gap_tier: MISSING` blocks artifact generation with targeted per-field user prompt
- Per-module `open_questions[]` rolled up into root `open_questions[]`
- Scan summary printout table (module | path | language | framework | gap tier)
- `skills/vp-crystallize/SKILL.md`: Brownfield Mode section updated with Gaps A+B+C, Scan Report contents list, per-module MUST-DETECT fields

## [2.13.0] - 2026-04-13

### Changed (ENH-046 — Phase 76)
- **`workflows/documentation.md`**: replaced GitHub-only URL parser with a forge-agnostic extractor supporting GitHub (SSH/HTTPS), GitLab (SSH/HTTPS), Bitbucket, Azure DevOps (`dev.azure.com`), Gitea, and any self-hosted remote
  - Variables renamed: `GITHUB_OWNER`/`GITHUB_REPO` → `GIT_OWNER`/`GIT_REPO`; added `GIT_HOST`
- **`skills/vp-docs/SKILL.md`**: Step 0 shell block updated to match — same forge-agnostic parser, same variable names
- **`workflows/crystallize.md`**: Step 0 prompt label generalized from "GitHub username? (optional)" → "Git remote host / username? (optional — e.g. github.com/johndoe, gitlab.com/org)"

## [2.12.0] - 2026-04-13

### Added (FEAT-018 — Phase 75)
- **`vp-crystallize --brownfield`**: Brownfield Mode — bootstrap `.viepilot/` project context from an existing codebase without a brainstorm session
  - 12-category codebase scanner: build manifests (11 platforms), framework detection (40+ dep patterns), architecture layer inference (18 directory patterns), database schema signals, API contract detection, infrastructure config, environment config shape, test coverage, code quality tools, documentation files, git history, file extension survey
  - Structured Scan Report (YAML) with DETECTED / ASSUMED / MISSING gap classification
  - MUST-DETECT gap tier: blocks artifact generation until user fills interactively
  - Synthetic brainstorm stub (`docs/brainstorm/session-brownfield-import.md`) for `vp-audit` compatibility
  - Safety rules: never reads `.env`; skips `node_modules/`, `.git/`, `target/`, `build/`, `dist/`, `__pycache__/`, `.venv/`, `vendor/`
  - `vp-audit` updated to accept brownfield stub as valid brainstorm source (no false-positive errors)
  - `TRACKER.md` annotated with `## Brownfield Import` block on first-time bootstrap

## [2.11.0] - 2026-04-13

### Added (ENH-045 — Phase 74)
- **`lib/proposal-generator.cjs`**: `getDesignConfig(projectContext)` helper + `DESIGN_CONFIGS` map (3 styles: modern-tech, enterprise, creative) — auto-selects palette from sector/audience/tone context
- **`scripts/gen-proposal-pptx.cjs`**: `PALETTES` map with 3 colour schemes + 3 rich slide layouts (timeline-gantt, team-card, investment-visual) + generates `project-proposal-{modern-tech,enterprise,creative}.pptx` variants
- **`workflows/proposal.md`**: dynamic slide count (no hard cap) + `designConfig` field in manifest + content-aware split rules (technicalNarrative > 4 → 2 slides; team > 4 → 2 slides; phases > 4 → 2 timeline slides) + DESIGN SELECTION AI prompt block
- 31 contract tests in `vp-enh045-dynamic-slides.test.js`

## [2.10.1] - 2026-04-11

### Changed (ENH-044 — Phase 73)
- **`lib/screenshot-artifact.cjs`**: `warnMissingTool(tool, installCmd)` — standardized stderr `⚠` warning when visual tool absent but artifacts exist; exports alongside existing helpers
- **`workflows/proposal.md` Step 4c**: mandatory enforcement — `visualSlides[]` MUST be non-empty when artifacts exist; puppeteer absent → `warnMissingTool('puppeteer', ...)` + `addPlaceholderVisual()` (no more silent skip)
- **`workflows/proposal.md` Step 7**: mandatory enforcement — Mermaid + ui/arch sections MUST be added when diagrams/artifacts exist; mmdc absent → text fallback + `warnMissingTool('mmdc', ...)`; puppeteer absent → placeholder paragraph + `warnMissingTool('puppeteer', ...)`
- `warnMissingTool()` called once per missing tool per generation run (not per-diagram)
- 16 tests in `vp-enh044-visual-enforce.test.js`

## [2.10.0] - 2026-04-11

### Added (ENH-043 — Phase 72)
- **`lib/screenshot-artifact.cjs`**: `isMmdcAvailable()` — boolean guard for `mmdc` CLI on PATH; `renderMermaidToPng(source, outPath)` — renders Mermaid source string → PNG via `mmdc` CLI; returns null when mmdc absent (no crash)
- **`scripts/gen-proposal-docx.cjs`**: `imageRunFromPng(pngPath, widthEmu, heightEmu)` → `ImageRun` (docx package) for embedding PNG as inline image; requires `screenshot-artifact.cjs` + `proposal-generator.cjs`; runtime visual embedding comment block documenting three injection points: Mermaid diagrams (renderMermaidToPng → ImageRun), UI prototype screenshot (before Executive Summary), architecture screenshot (after Technical Approach)
- **`workflows/proposal.md` Step 7**: Diagram Reference updated to render `mermaidSource` → PNG via `renderMermaidToPng()`; documents `screenshotArtifact` for ui-direction + architect injection; all paths use `cleanupScreenshot()`; graceful fallback when mmdc/puppeteer absent
- 19 tests in `vp-enh043-docx-visuals.test.js`; contracts +2 (769/769 total)

## [2.9.0] - 2026-04-11

### Added (ENH-042 — Phase 71)
- **`lib/proposal-generator.cjs`**: `detectVisualArtifacts(sessionDir)` — auto-scans `.viepilot/ui-direction/{latest-session}/` for ui-direction pages (`index.html`, `pages/*.html`) and 10 architect workspace page types (`architecture.html`, `erd.html`, `sequence-diagram.html`, etc.)
- **`lib/screenshot-artifact.cjs`** (new): `screenshotArtifact(htmlPath)` via optional puppeteer (headless Chrome) — returns `null` gracefully when puppeteer not installed; `isPuppeteerAvailable()` boolean guard; `cleanupScreenshot()` temp-file cleanup
- **`workflows/proposal.md` Step 4c `detect_visual_artifacts`**: AI maps slide topics to HTML artifact files, produces `visualSlides[]` array with `slideIndex`, `artifactType`, `htmlPath`, `label` fields
- **`scripts/gen-proposal-pptx.cjs`**: `addPlaceholderVisual(slide, label)` — styled navy+accent placeholder shape for when screenshots are unavailable; runtime integration comment block documenting the `screenshotArtifact` → `addImage` → `cleanupScreenshot` pattern
- Zero breaking change: all proposal generation works without puppeteer; visuals are additive

## [2.8.0] - 2026-04-11

### Added (ENH-041 — Phase 70)
- **`workflows/proposal.md` Step 4b `generate_docx_content`**: dedicated AI pass for deep `.docx` content, independent of the slide manifest — richer prose, risk analysis, diagrams
- **`docxContent` JSON schema**: `executiveSummary[]`, `problemStatement[]`, `solutionNarrative[]`, `technicalNarrative[]`, `riskRegister[]`, `glossary[]`, `diagrams[]` (with `mermaidSource`)
- **Step 7 updated**: `.docx` generator consumes `docxContent` for narrative paragraphs; new Risk Register and Glossary sections fed from `docxContent`
- **Step 8 updated**: `.md` companion embeds Mermaid fenced code blocks (` ```flowchart `, ` ```sequenceDiagram `, etc.) for each diagram in `docxContent.diagrams[]`
- **`getDiagramTypes(typeId)` helper** in `lib/proposal-generator.cjs`: maps proposal type to diagram array (`project-proposal` → `[flowchart, gantt]`, `tech-architecture` → `[flowchart, sequenceDiagram, classDiagram]`, etc.)
- **`.docx` Risk Register table**: Risk | Probability | Impact | Mitigation (5 placeholder rows)
- **`.docx` Glossary table**: Term | Definition (4 placeholder rows)
- `project-detail.docx` regenerated — 12 sections (added §8 Risk Register, §11 Glossary; previous §8–10 renumbered §9–12)
- 17 new tests in `tests/unit/vp-enh041-proposal-docx-ai.test.js`; `vp-proposal-contracts.test.js` updated (+5 ENH-041 assertions)

## [2.7.0] - 2026-04-10

### Added (ENH-040 — Phase 69)
- **`workflows/proposal.md` Step 2C Quality Brief**: 4 focused questions before AI generation — CTA, budget range, timeline constraint, decision-maker — stored in manifest `meta` field
- **Manifest `meta` schema**: `cta`, `budget`, `timeline`, `decisionMaker` fields drive tone and content specificity
- **AI Prompt Contract** in manifest_generation step: 8–15 word outcome-oriented bullets, 3–5 sentence speaker notes, concrete CTA on closing slide, avoids filler phrases
- **`.pptx` templates: 5 distinct layouts** (ENH-040 Layer 1):
  - `cover` — split panel (left charcoal + ViePilot mark, right title/subtitle/meta)
  - `section` — left accent sidebar + heading bar + bullets
  - `two-column` — heading + dual column content (comparisons, scope, competitive)
  - `data` — heading + up to 3 metric callout boxes (large value + label + note)
  - `closing` — full charcoal, prominent CTA text, accent bars top/bottom
- **`.docx` template: structured tables + narrative** (ENH-040 Layer 3):
  - **Timeline table**: Phase | Milestone/Deliverable | Duration | Dependencies (6 rows)
  - **Budget/Investment table**: Line Item | Estimate | Notes (with TOTAL row)
  - **Team table**: Role | Name/Background | Responsibility
  - Narrative paragraphs for Executive Summary, Problem & Opportunity, Why Choose Us
  - 10 sections + explicit `{{placeholder}}` instructions for AI to fill
- All 4 `.pptx` stock templates regenerated (137–151 KB; prev 97–126 KB)
- `project-detail.docx` regenerated (12 KB; prev 10 KB)

### Tests
- Added `tests/unit/vp-enh040-proposal-quality.test.js` (27 tests — workflow contracts, pptx layout coverage, docx structure)
- Updated `tests/unit/vp-proposal-contracts.test.js` (+2 tests — quality brief + outcome-oriented rules)
- Total: **660 → 689 tests**

## [2.6.0] - 2026-04-10

### Added (ENH-039 — Phase 68)
- **`/vp-proposal --lang <code>`**: language selection for AI-generated content (ISO 639-1; e.g. `vi`, `en`, `ja`, `fr`, `zh`)
  - If omitted: prompted with MRU suggestions from `~/.viepilot/config.json → proposal.recentLangs`
  - Language is saved to MRU after each successful generation
- **`/vp-proposal --lang-content-only`**: translate bullets, notes, and paragraphs; keep structural labels / section names in English
- **MRU language history**: `~/.viepilot/config.json → proposal.recentLangs` (max 5, most recent first, deduped)
- **`lib/viepilot-config.cjs`**: `getProposalLang()` + `recordProposalLang()` helpers; `DEFAULTS` extended with `proposal.recentLangs` + `proposal.defaultLang`
- **`lib/proposal-generator.cjs`**: `buildLangInstruction(lang, contentOnly)` — builds AI prompt language instruction; no-op for English
- **`workflows/proposal.md`**: Step 3b Language Selection (MRU prompt); `langInstruction` injection in manifest generation; `recordProposalLang` after confirm output
- **`skills/vp-proposal/SKILL.md`**: `--lang` + `--lang-content-only` flags documented

### Tests
- Added `tests/unit/vp-enh039-proposal-lang.test.js` (13 tests — config helpers, buildLangInstruction, SKILL.md/workflow contracts)
- Updated `tests/unit/vp-proposal-contracts.test.js` (+2 tests — --lang and --lang-content-only flag documentation)
- Total: **645 → 660 tests**

## [2.5.0] - 2026-04-11

### Added (FEAT-016 — Phases 63–67)
- **`/vp-proposal` skill**: convert brainstorm session (or direct brief) → professional proposal package
  - `.pptx` presentation (ViePilot branded, dark navy/charcoal)
  - `.docx` detailed document (10 sections: executive summary → appendix)
  - `.md` Markdown source of truth
  - Optional `.txt` Google Slides URL (`--slides` flag)
- **4 proposal types**: `project-proposal` (10 slides), `tech-architecture` (12), `product-pitch` (12), `general` (8)
- **`lib/proposal-generator.cjs`**: 2-tier template resolution (project `.viepilot/proposal-templates/` override → ViePilot stock fallback), context detection, type validation, output path builder
- **`lib/google-slides-exporter.cjs`**: service account auth; lazy-loads `@googleapis/slides`; graceful error when package or credentials absent
- **Stock templates**: `templates/proposal/pptx/` (4 files, dark navy `#1a1f36`/charcoal `#2d3142`, ViePilot branded) + `templates/proposal/docx/project-detail.docx`
- **`scripts/gen-proposal-pptx.cjs`** + **`scripts/gen-proposal-docx.cjs`**: template generation scripts
- **`skills/vp-proposal/SKILL.md`**: full skill definition; `--type`, `--from`, `--slides`, `--dry-run` flags
- **`workflows/proposal.md`**: 10-step workflow; slide manifest schema; 4 proposal type structures; error handling
- **`docs/user/features/proposal.md`**: full user guide with Google Slides 5-step setup guide
- **`@googleapis/slides`** added as `optionalDependencies` (install not required unless using `--slides`)
- **`pptxgenjs` + `docx`** added as runtime `dependencies`

### Tests
- Added `tests/unit/vp-proposal-contracts.test.js` (25 tests — skill/workflow files, generator exports, stock templates, graceful degradation)
- Added `tests/unit/vp-proposal-core.test.js` (15 tests — resolveTemplate, validateType, detectBrainstormSession)
- Total: 607 → **647 tests**

## [2.4.0] - 2026-04-10

### Added (FEAT-015 — Phase 62)
- **Codex adapter**: `lib/adapters/codex.cjs` — OpenAI Codex CLI is now a first-class install target; skills install to `~/.codex/skills/`, viepilot bundle to `~/.codex/viepilot/`
- `lib/adapters/index.cjs`: `codex` registered; `listAdapters()` now returns 4 unique adapters
- `bin/viepilot.cjs`: Codex added to interactive installer TARGETS list and help text
- `docs/user/features/adapters.md`: Codex row added; `$skill-name` invocation note; removed stale `dev-install.sh` reference

### Notes
- Codex uses `$vp-status` syntax (not `/vp-status`) — SKILL.md format is fully compatible, invocation prefix differs

### Tests
- Added `tests/unit/vp-adapter-codex.test.js` (11 tests)
- Updated `tests/unit/vp-adapter-antigravity.test.js`: `listAdapters()` now expects 4
- Updated `tests/unit/viepilot-adapters.test.js`: count 3 → 4
- Updated `tests/unit/guided-installer.test.js`: `normalizeTargets('all')` includes codex
- Total: 607 tests (was 596)

## [2.3.2] - 2026-04-10

### Changed (ENH-037 — Phase 61)
- Post-install "Next actions" block is now adapter-driven: each adapter carries a `postInstallHint` string; CLI prints one hint per unique installed target — Antigravity now appears when installed
- `lib/adapters/claude-code.cjs`, `cursor.cjs`, `antigravity.cjs`: added `postInstallHint` field

## [2.3.1] - 2026-04-10

### Removed (ENH-036 — Phase 60)
- `install.sh` — bash wrapper was redundant; `bin/viepilot.cjs install` covers all install functionality
- `dev-install.sh` — bash adapter routing duplicated `lib/adapters/`; `bin/viepilot.cjs install --target <adapter>` is the canonical path
- Removed 5 tests that only verified shell script content (viepilot-install.test.js, viepilot-adapters.test.js, vp-adapter-antigravity.test.js)

## [2.3.0] - 2026-04-10

### Added (FEAT-014 — Phase 59)
- **Antigravity adapter**: `lib/adapters/antigravity.cjs` — Google Antigravity IDE is now a first-class install target; skills install to `~/.antigravity/skills/`, viepilot bundle to `~/.antigravity/viepilot/`
- `lib/adapters/index.cjs`: `antigravity` registered; `listAdapters()` now returns 3 unique adapters
- `dev-install.sh`: `VIEPILOT_ADAPTER=antigravity` supported
- `bin/viepilot.cjs`: Antigravity added to interactive installer TARGETS list and help text
- `docs/user/features/adapters.md`: new doc — supported platforms table, install examples, guide for adding new adapters

### Tests
- Added `tests/unit/vp-adapter-antigravity.test.js` (12 tests)
- Updated `tests/unit/viepilot-adapters.test.js`: `listAdapters()` now expects 3
- Updated `tests/unit/guided-installer.test.js`: `normalizeTargets('all')` includes antigravity
- Total: 600 tests (was 588)

## [2.2.0] - 2026-04-10

### Changed (ENH-035 — Phase 58)
- **{envToolDir} template variable**: all 14 `skills/*/SKILL.md` source files now use `$HOME/{envToolDir}/` instead of hardcoded `$HOME/.cursor/viepilot/` — skill sources are platform-neutral
- **`lib/viepilot-install.cjs`**: path substitution now unconditionally replaces `{envToolDir}` → `adapter.executionContextBase` for every adapter (Cursor → `.cursor/viepilot`, Claude Code → `.claude/viepilot`, future adapters just set `executionContextBase`)
- **`lib/adapters/claude-code.cjs`**: removed `pathRewrite` field — no longer needed
- **`lib/adapters/cursor.cjs`**: removed `pathRewrite: null` field — no longer needed
- Adding a new adapter now requires only `executionContextBase` — no `pathRewrite` definition

### Tests
- Updated `tests/unit/viepilot-adapters.test.js`: removed `pathRewrite` assertion; rewrite step tests now check `from: '{envToolDir}'`; added cursor-target substitution test
- Updated `tests/unit/viepilot-install.test.js`: 2 tests updated for ENH-035 behavior
- Total: 588 tests (was 587)

## [2.1.3] - 2026-04-10

### Fixed (BUG-011 — Phase 55)
- **brainstorm.md dialogue path**: confirmation option 1 now shows `.viepilot/ui-direction/{session-id}/notes.md` instead of bare `ui-direction/notes.md` — eliminates ambiguity with user-managed `{root}/ui-direction/` folders
- **crystallize.md PATH GUARD**: `consume_ui_direction` step now opens with `⛔ PATH GUARD (BUG-011)` — explicitly instructs LLM to ignore any `{root}/ui-direction/` folder and read only from `.viepilot/ui-direction/`

### Tests
- Added `tests/unit/vp-bug011-ui-direction-path-guard.test.js` (3 tests)
- Total: 587 tests (was 584)

## [2.1.2] - 2026-04-10

### Fixed (BUG-013 — Phase 57)
- **Untrack .viepilot/ from git**: `git rm -r --cached .viepilot/` — removes all 27 previously-tracked internal state files from the git index; `.viepilot/` now correctly treated as gitignored on disk only, never staged or pushed
- **GITIGNORE-AWARE STAGING RULE**: `workflows/autonomous.md` commit block now has `⛔ GITIGNORE-AWARE STAGING RULE (BUG-013)` — instructs vp-auto to check `git check-ignore -q` before staging, and explicitly forbids `git add .viepilot/`
- **Git persistence gate note**: porcelain check section clarified — `??` (untracked-only) lines are CLEAN, not dirty state; prevents false gate failures after BUG-013 fix

### Tests
- Added `tests/unit/vp-bug013-gitignore-staging-rule.test.js` (3 tests)
- Total: 584 tests (was 581)
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
