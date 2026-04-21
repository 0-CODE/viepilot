# ViePilot (framework repo) - Tracker

## Current State
- **Milestone**: M1.37
- **Current Phase**: —
- **Last Completed Phase**: **94** — ✅ Complete (**FEAT-020 Phase 5** → **2.30.0**)
- **Current Task**: —
- **Last Activity**: 2026-04-20 — Phase 94 shipped: FEAT-020 fully complete (Phases 90–94, Skill Registry System) → 2.30.0

## Progress Overview
```
Framework release     [██████████] npm **1.18.0**
Phase 34 (FEAT-001)   [██████████] done
Phase 35 (ENH-022)    [██████████] done
─────────────────────────────────────────────
```

## Version Info

### Current Version
```
2.17.0 (released — ENH-050 git tag branch+version enrichment)
```


## Decision Log

| Date | Decision | Rationale | Phase |
|------|----------|-----------|-------|
| 2026-04-02 | Log FEAT-001 for Claude Code parity | User request via /vp-request | Backlog |
| 2026-04-02 | Phase 34 planned (docs + Jest contracts), target ship **1.9.3** | `/vp-evolve` Add Feature | M1.29 |
| 2026-04-02 | Phase 34 shipped: Claude Code setup doc + contracts + **1.9.3** | `/vp-auto` | M1.29 |
| 2026-04-02 | Phase 35 planned: ENH-022 `.viepilot/architecture/*.mermaid` + contracts | `/vp-evolve` | M1.29 |
| 2026-04-02 | Phase 35 shipped: crystallize sidecars + template + skills + Jest — **1.9.5** | `/vp-auto` | M1.29 |
| 2026-04-02 | Phase 36 shipped: ENH-023 fix autonomous.md Step 3 PASS + ROADMAP.md — **1.9.6** | `/vp-auto` | M1.29 |
| 2026-04-02 | Phase 37 shipped: ENH-024 ui-direction context forward (crystallize + autonomous + template) — **1.9.7** | `/vp-auto` | M1.29 |
| 2026-04-02 | Phase 38 shipped: BUG-005 claude-code install mirrors ~/.claude/viepilot/ + path rewrite — **1.9.8** | `/vp-auto` | M1.29 |
| 2026-04-02 | Phase 39 planned: ENH-025 ui-direction source of truth guard (3 workflows), target **1.9.9** | `/vp-evolve` | M1.29 |
| 2026-04-02 | Phase 39 shipped: ENH-025 READ-ONLY guard autonomous + crystallize + request — **1.9.9** | `/vp-auto` | M1.29 |
| 2026-04-02 | Phase 40 planned: BUG-006 claude-code install missing lib files, target **1.9.10** | `/vp-evolve` | M1.29 |
| 2026-04-02 | Phase 40 shipped: BUG-006 all targets copy full lib (cursor + claude-code) — **1.9.10** | `/vp-auto` | M1.29 |
| 2026-04-02 | Phase 41 planned: BUG-007 install script missing package.json for claude-code, target **1.9.11** | `/vp-evolve` | M1.29 |
| 2026-04-02 | Phase 41 shipped: BUG-007 claude-code install now copies package.json — **1.9.11** | `/vp-auto` | M1.29 |
| 2026-04-04 | ENH-026 logged: brainstorm UI background extraction + crystallize hard gate | `/vp-request` | Backlog |
| 2026-04-04 | FEAT-011 logged: Architect Design Mode with HTML generation + crystallize Step 1C | `/vp-request` | Backlog |
| 2026-04-04 | Phase 42 planned: ENH-026 (6 tasks), target **1.10.0** | `/vp-evolve` | M1.29 |
| 2026-04-04 | Phase 43 planned: FEAT-011 (8 tasks), target **1.11.0** | `/vp-evolve` | M1.29 |
| 2026-04-04 | Phase 42 shipped: ENH-026 background UI extraction + crystallize hard gate — **1.10.0** | `/vp-auto` | M1.29 |
| 2026-04-04 | Phase 43 shipped: FEAT-011 Architect Design Mode (HTML workspace + crystallize Step 1D) — **1.11.0** | `/vp-auto` | M1.29 |
| 2026-04-04 | ENH-027 logged: Architect ERD page — Database Entity & Relationship diagram | `/vp-request` | Backlog |
| 2026-04-04 | Phase 44 planned: ENH-027 (7 tasks), target **1.12.0** | `/vp-evolve` | M1.29 |
| 2026-04-04 | ENH-028 logged: Architect User Use Cases page — merged vào Phase 44 | `/vp-request` | Backlog |
| 2026-04-04 | Phase 44 expanded: + ENH-028 (9 tasks total) | `/vp-request` | M1.29 |
| 2026-04-04 | ENH-029 logged: Architect C4/Sequence/Deployment/APIs — Phase 45 | `/vp-request` | Backlog |
| 2026-04-04 | Phase 45 planned: ENH-029 (11 tasks), target **1.13.0** | `/vp-evolve` | M1.29 |
| 2026-04-04 | Phase 44 shipped: ENH-027 + ENH-028 (erd.html + user-use-cases.html + 9 nav updates + crystallize + tests) — **1.12.0** | `/vp-auto` | M1.29 |
| 2026-04-04 | Phase 45 shipped: ENH-029 (sequence-diagram.html + deployment.html + apis.html + 12-page nav + style.css badges + brainstorm/crystallize/SKILL.md + tests) — **1.13.0** | `/vp-auto` | M1.29 |
| 2026-04-06 | Phase 46 shipped: ENH-030 (remove MVP/Post-MVP concept — brainstorm/crystallize/templates/skills updated — phases+tasks only) — **1.14.0** | `/vp-auto` | M1.29 |
| 2026-04-06 | ENH-031 logged: Standardize framework language to English-primary (Option B) | `/vp-request` | Backlog |
| 2026-04-06 | ENH-032 logged: Language configuration system — installer setup + crystallize/brainstorm runtime awareness | `/vp-request` | Backlog |
| 2026-04-06 | BUG-009 logged: vp-evolve generates task Paths with installed paths instead of repo-relative — HIGH severity | `/vp-request` | Backlog |
| 2026-04-06 | Phase 47 planned: BUG-009 (4 tasks) — path guard in evolve + autonomous, target **1.15.0** | `/vp-evolve` | M1.29 |
| 2026-04-06 | ENH-031 → Phase 48 (renumbered from 47), ENH-032 → Phase 49 (renumbered from 48) | `/vp-evolve` | M1.29 |
| 2026-04-06 | Phase 47 shipped: BUG-009 (path guard in evolve.md + autonomous.md + SKILL.md docs + 13 tests) — **1.15.0** | `/vp-auto` | M1.29 |
| 2026-04-06 | Phase 48 shipped: ENH-031 (English-primary language standardization — all 12 workflows + 16 skills + AI-GUIDE template + 63 contract tests) — **1.16.0** | `/vp-auto` | M1.29 |
| 2026-04-06 | Phase 49 shipped: ENH-032 (language config system — viepilot-config.cjs + vp-tools config + install prompt + 3 workflow steps + 3 SKILL.md docs + 18 contract tests) — **1.17.0** | `/vp-auto` | M1.29 |
| 2026-04-07 | ENH-033 logged: Architect HTML item IDs + Approve/Edit prompt-copy buttons — isolation rule: per-item per-page, no cross-page cascade | `/vp-request` | Backlog |
| 2026-04-07 | Phase 50 planned: ENH-033 (9 tasks), target **1.18.0** | `/vp-evolve` | M1.29 |
| 2026-04-07 | Phase 50 shipped: ENH-033 (architect-actions.js + style.css + 11 templates + brainstorm.md isolation rule + 50 contract tests) — **1.18.0** | `/vp-auto` | M1.29 |
| 2026-04-07 | BUG-010 logged: ENH-033 diagram cards missing data-arch-id (6 pages, 9 diagrams) | `/vp-request` | Backlog |
| 2026-04-07 | Phase 51 planned: BUG-010 (3 tasks), patch target **1.18.1** | `/vp-evolve` | M1.29 |
| 2026-04-07 | Phase 51 shipped: BUG-010 (9 diagram card data-arch-id attrs across 6 templates + 9 contract tests) — **1.18.1** | `/vp-auto` | M1.29 |
| 2026-04-08 | ENH-034 logged: vp-brainstorm UI sync architect HTML templates when gaps/changes identified | `/vp-request` | Backlog |
| 2026-04-08 | Phase 52 planned: ENH-034 Option B (4 tasks — delta sync step + .arch-stale CSS + markStale JS + tests), target **1.19.0** | `/vp-evolve` | M1.29 |
| 2026-04-08 | Phase 52 shipped: ENH-034 (architect_delta_sync step + /sync-arch command + .arch-gap-badge CSS + markStale JS + 14 contract tests) — **1.19.0** | `/vp-auto` | M1.29 |
| 2026-04-08 | FEAT-012 logged: vp-brainstorm post-exchange staleness hook (Claude Code Stop event) | `/vp-request` | Backlog |
| 2026-04-08 | FEAT-013 logged: Dynamic agent adapter system — multi-platform (revised from pivot) | `/vp-request` | Backlog |
| 2026-04-08 | Phase 53 planned: FEAT-013 (5 tasks — adapters + install refactor + CLI + hooks scaffold + tests), target **2.0.0** | `/vp-evolve` | M1.29 |
| 2026-04-08 | Phase 53 shipped: FEAT-013 (lib/adapters/ registry + install refactor + viepilot.cjs/dev-install.sh + hooks scaffold + 19 tests) — **2.0.0** | `/vp-auto` | M1.29 |
| 2026-04-08 | Phase 54 planned: FEAT-012 (4 tasks — staleness hook + install cmd + docs + tests), target **2.1.0** | `/vp-evolve` | M1.29 |
| 2026-04-08 | Phase 54 shipped: FEAT-012 (brainstorm-staleness.cjs + hooks install + docs + 20 tests) — **2.1.0** | `/vp-auto` | M1.29 |
| 2026-04-10 | BUG-011 logged: ui-direction path ambiguity — workflows read `{root}/ui-direction/` instead of `{root}/.viepilot/ui-direction/` | `/vp-request` | Backlog |
| 2026-04-10 | Phase 55 planned: BUG-011 (3 tasks — brainstorm dialogue fix + crystallize PATH GUARD + 3 tests), target **2.1.1** | `/vp-evolve` | M1.29 |
| 2026-04-10 | BUG-012 logged: vp-auto edits production (~/.claude/) instead of codebase — CRITICAL, blocks Phase 55 | `/vp-request` | Backlog |
| 2026-04-10 | Phase 56 planned: BUG-012 (3 tasks — PATH RESOLUTION RULE in autonomous.md + evolve.md + tests), target **2.1.1** | `/vp-evolve` | M1.29 |
| 2026-04-10 | Phase 55 version target revised: 2.1.1 → **2.1.2** (blocked by BUG-012/Phase 56) | `/vp-evolve` | M1.29 |
| 2026-04-10 | Phase 56 shipped: BUG-012 (PATH RESOLUTION RULE in autonomous.md + evolve.md cwd note + 3 contract tests) — **2.1.1** | `/vp-auto` | M1.29 |
| 2026-04-10 | BUG-013 logged: .viepilot/ tracked by git despite .gitignore — vp-auto repeatedly stages & pushes it (recurring) | `/vp-request` | Backlog |
| 2026-04-10 | Phase 57 planned: BUG-013 (3 tasks — git rm --cached + staging rule + tests), target **2.1.2** | `/vp-evolve` | M1.29 |
| 2026-04-10 | Phase 55 version target revised: 2.1.2 → **2.1.3** (blocked by BUG-013/Phase 57) | `/vp-evolve` | M1.29 |
| 2026-04-10 | FEAT-014 logged: Antigravity adapter — vp-* skills work in Google Antigravity IDE | `/vp-request` | Backlog |
| 2026-04-10 | ENH-035 logged: Replace hardcoded .cursor/viepilot with {envToolDir} template variable in skill source files | `/vp-request` | Backlog |
| 2026-04-10 | Phase 58 planned: ENH-035 (4 tasks — 14 SKILL.md + install.cjs + adapters cleanup + tests), target **2.2.0** | `/vp-evolve` | M1.29 |
| 2026-04-10 | Phase 58 shipped: ENH-035 ({envToolDir} in 14 SKILL.md + install.cjs + adapter cleanup + 4 tests updated) — **2.2.0** | `/vp-auto` | M1.29 |
| 2026-04-10 | Phase 59 planned: FEAT-014 (6 tasks — adapter + index + dev-install.sh + viepilot.cjs + tests + docs), target **2.3.0** | `/vp-evolve` | M1.29 |
| 2026-04-10 | Phase 59 shipped: FEAT-014 (antigravity adapter + registry + dev-install.sh + viepilot.cjs + 12 tests + docs) — **2.3.0** | `/vp-auto` | M1.29 |
| 2026-04-10 | ENH-036 logged: Remove install.sh + dev-install.sh — both redundant since Node installer covers all functionality | `/vp-request` | Backlog |
| 2026-04-10 | Phase 60 planned: ENH-036 (3 tasks — delete scripts + package.json + README + 4 tests removed), target **2.3.1** | `/vp-evolve` | M1.29 |
| 2026-04-10 | Phase 60 shipped: ENH-036 (install.sh + dev-install.sh deleted + package.json + README + 5 tests removed) — **2.3.1** | `/vp-auto` | M1.29 |

| 2026-04-10 | ENH-037 logged: Post-install "Next actions" block missing Antigravity — hardcoded Cursor+Claude Code only | `/vp-request` | Backlog |
| 2026-04-10 | Phase 61 planned: ENH-037 (3 tasks — postInstallHint on adapters + CLI loop + 4 tests), target **2.3.2** | `/vp-evolve` | M1.29 |
| 2026-04-10 | Phase 61 shipped: ENH-037 (postInstallHint on 3 adapters + CLI adapter loop + 4 new assertions + 1 test) — **2.3.2** | `/vp-auto` | M1.29 |

| 2026-04-10 | FEAT-015 logged: OpenAI Codex CLI adapter — `~/.codex/` home, same pattern as Antigravity | `/vp-request` | Backlog |
| 2026-04-10 | Phase 62 planned: FEAT-015 (4 tasks — codex adapter + registry + 10 tests + docs), target **2.4.0** | `/vp-evolve` | M1.29 |
| 2026-04-10 | Phase 62 shipped: FEAT-015 (codex adapter + registry + viepilot.cjs + 11 tests + docs) — **2.4.0** | `/vp-auto` | M1.29 |
| 2026-04-13 | FEAT-018 logged: vp-crystallize Brownfield Mode — bootstrap project context from existing codebase (critical adoption blocker for brownfield projects) | `/vp-request` | Backlog |
| 2026-04-13 | Phase 75 planned: FEAT-018 (4 tasks — crystallize brownfield scanner + gap rules + skill docs + tests), target **2.12.0** | `/vp-evolve` | M1.37 |
| 2026-04-13 | Phase 74 shipped: ENH-045 (PALETTES + 3 rich layouts + 3 PPTX variants + getDesignConfig + 31 tests) — **2.11.0** | `/vp-auto` | M1.37 |
| 2026-04-13 | Phase 75 shipped: FEAT-018 (12-cat scanner + Gap Rules + brainstorm stub + audit compat + 41 tests) — **2.12.0** | `/vp-auto` | M1.37 |
| 2026-04-13 | Phase 76 planned: ENH-046 (git forge agnostic URL parser, 2 tasks), target **2.13.0** | `/vp-evolve` | M1.37 |
| 2026-04-13 | Phase 76 shipped: ENH-046 (forge-agnostic parser + crystallize label + vp-docs SKILL + 13 tests) — **2.13.0** | `/vp-auto` | M1.37 |
| 2026-04-13 | Phase 77 planned: ENH-047 Gaps A+B+C (multi-repo, submodule, per-module gap — 4 tasks), target **2.14.0** | `/vp-evolve` | M1.37 |
| 2026-04-13 | Phase 77 shipped: ENH-047 (submodule detect + polyrepo hints + per-module gap_tier + 32 tests) — **2.14.0** | `/vp-auto` | M1.37 |
| 2026-04-13 | ENH-048 logged: AskUserQuestion integration — structured interactive prompting across all vp-* skills, adapter-aware fallback | `/vp-request` | Backlog |
| 2026-04-13 | Phase 78 planned: ENH-048 (5 tasks — crystallize + brainstorm + request + evolve workflows + 3 SKILL.md + tests), target **2.15.0** | `/vp-evolve` | M1.37 |
| 2026-04-13 | Phase 78 shipped: ENH-048 (AskUserQuestion adapter-aware prompts in 4 workflows + 3 SKILL.md + 33 contract tests) — **2.15.0** | `/vp-auto` | M1.37 |
| 2026-04-17 | ENH-049 logged: vp-audit Tier 4 silent mode — suppress output when passing/skipped, show only on issues | `/vp-request` | Backlog |
| 2026-04-17 | Phase 79 planned: ENH-049 (3 tasks — audit.md patches + SKILL.md + tests), target **2.16.0** | `/vp-evolve` | M1.37 |
| 2026-04-17 | Phase 79 shipped: ENH-049 (Tier 4 silent mode + 13 contract tests) — **2.16.0** | `/vp-auto` | M1.37 |
| 2026-04-17 | ENH-050 logged: git tag format — branch + version enrichment across autonomous/audit/rollback | `/vp-request` | Backlog |
| 2026-04-17 | Phase 80 planned: ENH-050 (3 tasks — autonomous.md + audit/rollback regex + tests), target **2.17.0** | `/vp-evolve` | M1.37 |
| 2026-04-17 | Phase 80 shipped: ENH-050 (enriched tag format + regex compat + 16 tests) — **2.17.0** | `/vp-auto` | M1.37 |
| 2026-04-18 | FEAT-019 logged: GitHub Copilot adapter — research confirms HIGH feasibility via Copilot SDK + `.agent.md` custom agents | `/vp-request` | Backlog |
| 2026-04-18 | ENH-057 logged: ViePilot Agents System — 6 dedicated agents (tracker, research, file-scanner, changelog, test-gen, doc-sync) | `/vp-request` | Backlog |
| 2026-04-18 | Phase 83 planned: ENH-057 (5 tasks — 6 agent files + autonomous.md + request.md wiring + tests), target **2.20.0** | `/vp-evolve` | M1.37 |
| 2026-04-18 | Phase 84 planned: FEAT-019 (5 tasks — copilot.cjs + installer + 17 SKILL.md + docs + tests), target **2.21.0** | `/vp-evolve` | M1.37 |
| 2026-04-18 | ENH-058 logged: AUQ continuation prompt at vp-evolve/vp-request end — eliminate manual re-type of next command | `/vp-request` | Backlog |
| 2026-04-18 | Phase 85 planned: ENH-058 (2 tasks — AUQ in evolve.md+request.md + tests), target **2.22.0** | `/vp-evolve` | M1.37 |
| 2026-04-18 | BUG-015 logged: copilot adapter missing from bin/viepilot.cjs TARGETS + --list-targets | `/vp-request` | Backlog |
| 2026-04-18 | Phase 86 planned: BUG-015 (2 tasks — TARGETS fix + test), target **2.22.1** | `/vp-evolve` | M1.37 |
| 2026-04-18 | ENH-059 logged: AUQ ToolSearch preload — model must call ToolSearch before AUQ on Claude Code | `/vp-request` | Backlog |
| 2026-04-18 | Phase 87 planned: ENH-059 (3 tasks — 5 SKILL.md + 3 workflows + tests), target **2.23.0** | `/vp-evolve` | M1.37 |
| 2026-04-18 | Phase 87 shipped: ENH-059 (AUQ ToolSearch preload in 5 SKILL.md + 3 workflows + 10 tests) — **2.23.0** | `/vp-auto` | M1.37 |
| 2026-04-18 | ENH-060 logged: vp-brainstorm UI Direction Mode proactive suggestion parity with Architect Design | `/vp-request` | Backlog |
| 2026-04-18 | Phase 88 planned: ENH-060 (3 tasks — brainstorm.md thresholds+banner + SKILL.md + tests), target **2.24.0** | `/vp-evolve` | M1.37 |
| 2026-04-18 | Phase 88 shipped: ENH-060 (early-session detection + 🎨 banner + lower thresholds + 8 tests) — **2.24.0** | `/vp-auto` | M1.37 |
| 2026-04-18 | ENH-061 logged: brainstorm breakdown loop — coverage matrix + arch_to_ui_sync + completeness gate | `/vp-request` | Backlog |
| 2026-04-18 | Phase 89 planned: ENH-061 (5 tasks — breakdown ordering + coverage + reverse sync + gate + tests), target **2.25.0** | `/vp-evolve` | M1.37 |
| 2026-04-18 | Phase 89 shipped: ENH-061 (breakdown ordering + coverage matrix + arch_to_ui_sync + CHECK 4 + 11 tests) — **2.25.0** | `/vp-auto` | M1.37 |
| 2026-04-20 | FEAT-020 logged: Skill Registry System — scan-skills + install-skill + brainstorm/crystallize/auto gates (5 phases, v2.26.0–2.30.0) | `/vp-request` | Backlog |
| 2026-04-20 | Phase 90 planned: FEAT-020 Phase 1 Skill Registry Foundation (4 tasks — skill-registry.cjs + CLI + docs + 15 tests), target **2.26.0** | `/vp-evolve` | M1.37 |
| 2026-04-20 | Phase 90 shipped: FEAT-020 Phase 1 (skill-registry.cjs + scan-skills/list-skills CLI + docs + 22 tests) — **2.26.0** | `/vp-auto` | M1.37 |
| 2026-04-20 | Phase 91 planned: FEAT-020 Phase 2 install-skill multi-channel (3 tasks), target **2.27.0** | `/vp-evolve` | M1.37 |
| 2026-04-20 | Phase 92 planned: FEAT-020 Phase 3 brainstorm UI-Direction skill integration (3 tasks), target **2.28.0** | `/vp-evolve` | M1.37 |
| 2026-04-20 | Phase 93 planned: FEAT-020 Phase 4 crystallize skill decision gate (4 tasks), target **2.29.0** | `/vp-evolve` | M1.37 |
| 2026-04-20 | Phase 94 planned: FEAT-020 Phase 5 vp-auto silent skill execution (3 tasks), target **2.30.0** | `/vp-evolve` | M1.37 |

## Blockers
_None currently_

## Next Action
_Phase 89 complete (ENH-061 → 2.25.0). Ready for next request or publish._

## Backlog

### Pending Requests
| ID | Type | Title | Priority | Status |
|----|------|-------|----------|--------|
| ENH-062 | 🔧 | `/vp-skills` slash command — agent-native global skill registry management (scan/install/list cross-project) | high | new |
| BUG-016 | 🐛 | Workflow skill context steps dùng JS function call không executable — cần thay bằng shell command | high | new |
| FEAT-020 | ✨ | Skill Registry System — scan-skills + install-skill + brainstorm/crystallize/auto integration (5 phases) | high | ✅ done (Phase 90–94 → 2.26.0–2.30.0) |
| ENH-061 | 🔧 | vp-brainstorm idea-to-architecture breakdown loop — coverage matrix + reverse sync + completeness gate | high | new |
| ENH-060 | 🔧 | vp-brainstorm UI Direction Mode — proactive suggestion parity with Architect Design | high | triaged (→ Phase 88) |
| ENH-059 | 🔧 | AskUserQuestion ToolSearch preload — prevent deferred-tool fallback on skill init | high | triaged (→ Phase 87) |
| BUG-015 | 🐛 | Copilot adapter missing from `bin/viepilot.cjs` TARGETS + --list-targets | high | triaged (→ Phase 86) |
| ENH-058 | 🔧 | Workflow continuation prompt — AskUserQuestion at vp-evolve/vp-request end | high | triaged (→ Phase 85) |
| FEAT-019 | ✨ | GitHub Copilot adapter — vp-* skills in Copilot Chat / Copilot CLI | high | triaged (→ Phase 84) |
| ENH-057 | 🔧 | ViePilot Agents System — dedicated agents for repetitive skill tasks | high | triaged (→ Phase 83) |
| ENH-056 | 🔧 | Skill invocation greeting banner with version number | medium | triaged (→ Phase 82) |
| ENH-055 | 🔧 | AskUserQuestion enforcement — REQUIRED on Claude Code, not optional | high | triaged (→ Phase 81) |
| BUG-014 | 🐛 | rollback.md Step 7 — enriched tag format not parsed for state restoration | high | triaged (→ Phase 81) |
| ENH-054 | 🔧 | audit.md post-phase auto-hook — provide exact integration point in autonomous.md | medium | triaged (→ Phase 81) |
| ENH-053 | 🔧 | Unify version bump orchestration — autonomous.md + evolve.md conflict | medium | triaged (→ Phase 81) |
| ENH-052 | 🔧 | brainstorm.md pre-save phase assignment validation gate | high | triaged (→ Phase 81) |
| ENH-051 | 🔧 | crystallize.md brownfield execution path — clarify Steps 1/1A–1D skip rules | high | triaged (→ Phase 81) |
| ENH-050 | 🔧 | Git tag format — include branch + version: `{prefix}-{branch}-{version}-vp-p{n}-t{n}` | medium | ✅ done (Phase 80 → 2.17.0) |
| ENH-049 | 🔧 | vp-audit Tier 4 silent mode — show only when issues found, silent on pass/skip | medium | ✅ done (Phase 79 → 2.16.0) |
| ENH-048 | 🔧 | AskUserQuestion integration — structured interactive prompting across all vp-* skills | high | ✅ done (Phase 78 → 2.15.0) |
| ENH-047 | 🔧 | Brownfield scanner — multi-repo / polyrepo + git submodules + per-module gap detection | medium | ✅ done (Phase 77 → 2.14.0) |
| ENH-046 | 🔧 | Git forge agnostic — generalize remote URL parsing (GitHub-only → multi-forge) | medium | ✅ done (Phase 76 → 2.13.0) |
| FEAT-018 | ✨ | vp-crystallize Brownfield Mode — bootstrap context from existing codebase | high | ✅ done (Phase 75 → 2.12.0) |
| ENH-045 | 🔧 | vp-proposal PPTX — dynamic slide count + AI-driven visual design | high | ✅ done (Phase 74 → 2.11.0) |
| ENH-044 | 🔧 | vp-proposal — enforce mandatory visual embedding when artifacts exist | high | ✅ done (2.10.1) |
| ENH-043 | 🔧 | vp-proposal docx — embed HTML screenshots + rendered Mermaid PNG images | medium | ✅ done (2.10.0) |
| ENH-042 | 🔧 | vp-proposal PPTX visual imagery from ui-direction & architect HTML screenshots | medium | ✅ done (2.9.0) |
| FEAT-015 | ✨ | OpenAI Codex CLI adapter (`~/.codex/`) | high | ✅ done (Phase 62 → 2.4.0) |
| ENH-037 | 🔧 | Post-install "Next actions" missing Antigravity — make adapter-driven | low | ✅ done (**2.3.2**) |
| ENH-035 | 🔧 | Replace `.cursor/viepilot` with `{envToolDir}` template in skill source files | high | ✅ done (**2.2.0**) |
| FEAT-014 | ✨ | Antigravity adapter — vp-* skills in Google Antigravity IDE | high | ✅ done (**2.3.0**) |
| BUG-013 | 🐛 | `.viepilot/` tracked by git despite `.gitignore` — vp-auto repeatedly stages & pushes it | high | ✅ done (**2.1.2**) |
| BUG-012 | 🐛 | vp-auto edits production `~/.claude/` instead of codebase `{repo}/` | critical | ✅ done (**2.1.1**) |
| BUG-011 | 🐛 | ui-direction path ambiguity — LLM reads `{root}/ui-direction/` instead of `{root}/.viepilot/ui-direction/` | high | ✅ done (**2.1.3**) |
| FEAT-013 | ✨ | Dynamic agent adapter system — multi-platform (Claude Code, Cursor, Antigravity, Codex, …) | critical | ✅ done (**2.0.0**) |
| FEAT-012 | ✨ | vp-brainstorm post-exchange staleness hook — auto-detect stale architect/ui-direction content | high | ✅ done (**2.1.0**) |
| ENH-034 | 🔧 | vp-brainstorm UI: sync architect HTML templates when gaps/changes identified | high | ✅ done (**1.19.0**) |
| BUG-010 | 🐛 | ENH-033: Approve/Edit buttons missing on Mermaid diagram cards (6 pages, ~9 diagrams) | high | ✅ done (**1.18.1**) |
| ENH-033 | 🔧 | Architect HTML: item IDs + Approve/Edit prompt-copy buttons (12 pages) | high | ✅ done (**1.18.0**) |
| BUG-009 | 🐛 | vp-evolve generates task Paths with installed paths instead of repo-relative paths | high | ✅ done (**1.15.0**) |
| ENH-032 | 🔧 | Language configuration system — installer setup + crystallize/brainstorm runtime awareness | high | ✅ done (**1.17.0**) |
| ENH-031 | 🔧 | Standardize framework language to English-primary (Option B from audit) | high | new |
| ENH-030 | 🔧 | Remove MVP/Post-MVP concept — crystallize to complete project with phases+tasks only | high | ✅ done (**1.14.0**) |
| ENH-029 | 🔧 | Architect: System C4 + Sequence + Deployment + APIs pages | high | ✅ done (**1.13.0**) |
| ENH-028 | 🔧 | Architect Design Mode: User Use Cases page | high | new (→ Phase 44) |
| ENH-027 | 🔧 | Architect Design Mode: ERD page cho Database Entity & Relationship | high | new (→ Phase 44) |
| FEAT-011 | ✨ | Architect Design Mode: collaborative arch brainstorm + HTML generation + crystallize integration | high | ✅ done (**1.11.0**) |
| ENH-026 | 🔧 | vp-brainstorm UI mode background extraction + crystallize ui-direction hard gate | high | ✅ done (**1.10.0**) |
| BUG-007 | 🐛 | install script missing package.json copy for claude-code target | high | ✅ done (**1.9.11**) |
| BUG-006 | 🐛 | tất cả install targets thiếu lib/viepilot-info.cjs, viepilot-update.cjs, viepilot-install.cjs | high | ✅ done (**1.9.10**) |
| ENH-025 | 🔧 | ui-direction source of truth guard — READ-ONLY prohibition trong autonomous/crystallize/request | high | ✅ done (**1.9.9**) |
| BUG-005 | 🐛 | vp-* skills hardcode ~/.cursor path, broken trên Claude Code standalone | high | ✅ done (**1.9.8**) |
| ENH-024 | 🔧 | ui-direction không được forward qua crystallize → vp-auto | high | ✅ done (**1.9.7**) |
| ENH-023 | 🔧 | vp-auto Step 3 PASS thiếu ROADMAP.md update | high | ✅ done (**1.9.6**) |
| ENH-022 | 🔧 | vp-crystallize: lưu architecture diagrams vào `.viepilot/architecture/*.mermaid` | should-have | ✅ done (**1.9.5**) |
| FEAT-001 | ✨ | ViePilot dev environment for Claude Code | should-have | ✅ done (v1.9.3) |
