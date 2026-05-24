# ViePilot (framework repo) - Tracker

## Current State
- **Milestone**: **v3.0** — Per-Adapter Intelligence Refactor (FEAT-021) — Phases 127–138 → v3.5.0
- **Current Phase**: ~~136~~ — all phases 136-138 ✅ done (v3.5.0)
- **Last Completed Phase**: **138** ✅ (ENH-088 intake schedule + --auto mode → v3.5.0)
- **Previous Milestone**: M1.37 archived → `.viepilot/milestones/M1.37-SUMMARY.md`
- **Milestone**: **v3.0** — Per-Adapter Intelligence Refactor (FEAT-021) — Phases 127–139 → v3.6.0
- **Current Phase**: ~~139~~ — all phases 136-139 ✅ done (v3.6.0)
- **Last Completed Phase**: **139** ✅ (ENH-090-093 browser agent suite → v3.6.0)
- **Next Phase**: — (all planned phases complete)
- **Current Task**: —
- **Current Phase**: ~~140~~ — ✅ done (v3.7.0)
- **Last Completed Phase**: **140** ✅ (ENH-095 AI-driven intake manifest + post-task write-back → v3.7.0)
- **Next Phase**: — (all planned phases complete)
- **Current Task**: —
- **Current Phase**: ~~141~~ — ✅ done (v3.7.1)
- **Last Completed Phase**: **141** ✅ (ENH-096 vp-auto orchestrator enforcement — hard delegate to vp-task-executor → v3.7.1)
- **Next Phase**: — (all planned phases complete)
- **Current Task**: —
- **Current Phase**: ~~142~~ — ✅ done (v3.7.2)
- **Last Completed Phase**: **142** ✅ (ENH-097 full orchestrator delegation — state + git via subagents → v3.7.2)
- **Current Phase**: ~~143~~ — ✅ done (v3.7.3)
- **Last Completed Phase**: **143** ✅ (DEBT-001 README + docs drift sync → v3.7.3)
- **Current Phase**: ~~144~~ — ✅ done (v3.8.0)
- **Last Completed Phase**: **144** ✅ (ENH-098 stakeholder agent gate → v3.8.0)
- **Current Phase**: **145** — ENH-099: Claude Code Tool Set — Adapter Docs + Autonomous Workflow Updates → v3.9.0
- **Next Phase**: 145 (pending — ready for /vp-auto)
- **Current Task**: —
- **Last Activity**: 2026-05-24 — Phase 145 planned: ENH-099 Claude Code tool set docs → v3.9.0

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
3.8.0 (released — ENH-098 stakeholder agent gate)
```


## Decision Log

| Date | Decision | Rationale | Phase |
|------|----------|-----------|-------|
| 2026-05-24 | Phase 145 planned: ENH-099 Claude Code tool set adapter docs (4 tasks) → v3.9.0 | vp-auto SKILL.md 8 new tools; autonomous.md TodoWrite fix + Monitor + Push; agents.md 28-event hooks + Agent Teams | 145 |
| 2026-05-24 | ENH-099 logged: Claude Code full tool inventory research — 40+ tools, 28 hook events; Monitor/Worktree/LSP/PlanMode/PushNotification gaps + TodoWrite deprecation impact | User: research request via /vp-request WebSearch+WebFetch | Backlog |
| 2026-05-24 | Phase 144 complete: ENH-098 stakeholder agent gate → v3.8.0 (2246 tests, 5 tasks PASS) | ENH-098: two-phase stakeholder gate — brainstorm generates agents, crystallize Step 1G runs parallel fan-out review | 144 |
| 2026-05-24 | Phase 143 complete: DEBT-001 README + docs drift sync → v3.7.3 | README/docs drifted since v3.1.1; synced badges, counts, skills-reference, architecture | 143 |
| 2026-05-23 | Phase 142 planned: ENH-097 full orchestrator delegation — state + git via subagents (4 tasks) → v3.7.2 | `/vp-evolve` Add Feature | M3.0 |
| 2026-05-23 | DEBT-001 logged: README + docs drifted since v3.1.1 — badges, counts, skills-reference 6 missing skills, architecture model outdated | User: drift accumulated across phases 130-142 | Backlog |
| 2026-05-23 | ENH-097 logged: state updates (TRACKER, HANDOFF, ROADMAP) and git (tag, push) still inline on main orchestrator | User: all stages must delegate — orchestrator = read + spawn only | Backlog |
| 2026-05-23 | Phase 141 planned: ENH-096 vp-auto orchestrator enforcement — hard delegate to vp-task-executor (2 tasks) → v3.7.1 | `/vp-evolve` Add Feature | M3.0 |
| 2026-05-23 | ENH-096 logged: vp-auto main agent still implements tasks inline instead of spawning vp-task-executor | User: dirty orchestrator context degrades multi-task phases | Backlog |
| 2026-05-23 | Phase 140 planned: ENH-095 AI-driven intake manifest + post-task write-back (5 tasks) → v3.7.0 | `/vp-evolve` Add Feature | M3.0 |
| 2026-05-23 | ENH-095 logged: AI-driven intake manifest + post-task write-back callback | User: replace HEADER_ALIASES hardcode with excel-intake-agent `analyze_structure` op + manifest TTL + write result back to source row | Backlog |
| 2026-05-23 | ENH-094 patch: sharepoint-xlsx pattern added to browser.cjs URL_PATTERNS + SKILL.md routing fix → v3.6.1 | Live test discovered gap: SharePoint sharing link fell through as generic-table | Post-139 |
| 2026-05-23 | Phase 139 planned: ENH-090-093 browser-agent suite (5 tasks) → v3.6.0 | `/vp-evolve` Add Feature | M3.0 |
| 2026-05-23 | ENH-093 logged: vp-request URL enrichment — auto-fill from GitHub/Jira/Notion/Trello URLs | User request | Backlog |
| 2026-05-23 | ENH-092 logged: research-agent upgrade — agent-browser for JS-rendered competitor research | User request | Backlog |
| 2026-05-23 | ENH-091 logged: browser-audit-agent — visual/functional audit of running dev server | User request | Backlog |
| 2026-05-23 | ENH-090 logged: browser-intake-agent (vercel-labs/agent-browser) for public link reading | User request — Google Sheets share, GitHub Issues, Jira, Trello, Notion | Backlog |
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
| 2026-04-22 | ENH-066 logged: User Data Management — Topic 9 in brainstorm, user-data.html, crystallize export | `/vp-request` | Backlog |
| 2026-04-22 | Phase 98 planned: ENH-066 User Data Management Coverage (3 tasks — brainstorm+crystallize+tests), target **2.34.0** | `/vp-evolve` | M1.37 |
| 2026-04-22 | Phase 98 shipped: ENH-066 (Topic 9, user-data.html, ## user_data YAML, crystallize export, 21 tests) — **2.34.0** | `/vp-auto` | M1.37 |
| 2026-04-22 | ENH-067 logged: Workflow Upgrade Awareness — brainstorm gap detection on --continue + crystallize --upgrade re-scan | `/vp-request` | Backlog |
| 2026-04-22 | Phase 99 planned: ENH-067 Workflow Upgrade Awareness (3 tasks — brainstorm gap detection + crystallize upgrade re-scan + tests), target **2.35.0** | `/vp-evolve` | M1.37 |
| 2026-04-22 | Phase 99 shipped: ENH-067 (workflow_version stamps + Step 3B gap detection + Step 0-B --upgrade re-scan + 21 tests) — **2.35.0** | `/vp-auto` | M1.37 |
| 2026-04-22 | ENH-068 logged: Admin Entity Management — Topic 7 in brainstorm, entity-mgmt.html, crystallize export | `/vp-request` | Backlog |
| 2026-04-22 | Phase 100 planned: ENH-068 Admin Entity Management (3 tasks — brainstorm+crystallize+tests), target **2.36.0** | `/vp-evolve` | M1.37 |
| 2026-04-22 | Phase 100 shipped: ENH-068 (Topic 7, entity-mgmt.html, ## entity_mgmt YAML, crystallize Step 1D item 10, 21 tests) — **2.36.0** | `/vp-auto` | M1.37 |
| 2026-04-22 | BUG-019 logged: vp-tools scan-skills not implemented — referenced in FEAT-020 docs but never in bin/vp-tools.cjs | `/vp-request` | Backlog |
| 2026-04-22 | Phase 101 planned: BUG-019 scan-skills CLI (2 tasks — CLI handler + tests), target **2.36.1** | `/vp-evolve` | M1.37 |
| 2026-04-22 | Phase 101 shipped: BUG-019 (scan-skills CLI handler + 10 tests) — **2.36.1** | `/vp-auto` | M1.37 |
| 2026-04-22 | BUG-020 logged: vp-auto ignores scaffold/create-project command — handcrafts framework files instead of running composer/npx/rails | `/vp-request` | Backlog |
| 2026-04-22 | Phase 102 planned: BUG-020 scaffold-first gate (3 tasks — autonomous.md gate + convention doc + tests), target **2.37.0** | `/vp-evolve` | M1.37 |
| 2026-04-22 | Phase 102 shipped: BUG-020 (scaffold-first gate in autonomous.md + 6 stack SUMMARY.md + docs + 23 tests) — **2.37.0** | `/vp-auto` | M1.37 |
| 2026-04-22 | ENH-069 logged: crystallize UI→Task binding gap — 10 specific gaps identified in crystallize + autonomous workflows + ui-direction notes.md | `/vp-request` | Backlog |
| 2026-04-22 | Phase 103 planned: ENH-069 UI→Task binding (10-gap fix — crystallize + autonomous + TASK.md template) → **2.38.0** | `/vp-evolve` | M1.37 |
| 2026-04-22 | Phase 103 shipped: ENH-069 (all 10 gaps fixed — crystallize.md + autonomous.md + TASK.md template + 33 tests) — **2.38.0** | `/vp-auto` | M1.37 |
| 2026-04-22 | ENH-070 logged: vp-audit auto-log gaps as requests + direct /vp-evolve routing (no manual /vp-request step needed) | `/vp-request` | Backlog |
| 2026-04-22 | Phase 104 planned: ENH-070 vp-audit auto-log gaps (Auto-Log Gate + post-audit banner + --no-autolog) → **2.39.0** | `/vp-evolve` | M1.37 |
| 2026-04-22 | Phase 104 shipped: ENH-070 (Auto-Log Gate + post-audit banner + --no-autolog + 18 tests) — **2.39.0** | `/vp-auto` | M1.37 |
| 2026-04-23 | BUG-021 logged: Antigravity adapter install path outdated — skills must go to `~/.gemini/antigravity/skills/` after Gemini ecosystem rebrand | `/vp-request` | Backlog |
| 2026-04-23 | Phase 105 planned: BUG-021 Antigravity path update (3 tasks — adapter + bin/docs + tests), target **2.39.1** | `/vp-evolve` | M1.37 |
| 2026-04-23 | Phase 105 shipped: BUG-021 (antigravity.cjs + bin + docs + 13 tests) — **2.39.1** | `/vp-auto` | M1.37 |
| 2026-04-23 | ENH-071 logged: vp-brainstorm Embedded Domain Mode — 10 gaps (hw-topology, pin-map, memory-layout, RTOS, protocol-matrix, power-budget, MCU toolchain probes, safety topic, UI-Direction suppression, firmware phase template) | `/vp-request` | Backlog |
| 2026-04-23 | Phase 106 planned: ENH-071 Embedded Domain Mode (5 tasks — brainstorm probes + UI suppression + 6 pages + crystallize exports + tests), target **2.40.0** | `/vp-evolve` | M1.37 |
| 2026-04-23 | Phase 106 shipped: ENH-071 (brainstorm.md Embedded Domain Mode + 6 pages + crystallize exports + 36 tests) — **2.40.0** | `/vp-auto` | M1.37 |
| 2026-04-23 | ENH-072 logged: vp-* skill invocation version update check — check-update CLI + `<version_check>` block in all vp-* SKILL.md + 24h npm registry cache | `/vp-request` | Backlog |
| 2026-04-24 | Phase 107 planned: ENH-072 version update check (4 tasks — checkLatestVersion + check-update CLI + SKILL.md blocks + tests), target **2.41.0** | `/vp-evolve` | M1.37 |
| 2026-04-24 | Phase 107 shipped: ENH-072 (checkLatestVersion + check-update CLI + 18 SKILL.md blocks + 16 tests) — **2.41.0** | `/vp-auto` | M1.37 |
| 2026-04-24 | ENH-073 logged: vp-persona — cross-project user identity, multi-persona switch+merge, domain packs (web-saas/data-science/mobile/devops/ai-product), persona-context.md injection | `/vp-brainstorm` + `/vp-request` | Backlog |
| 2026-04-24 | ENH-073 redesigned: full automation (no wizard) — inferPersona() from files+git, auto-switch $PWD, auto-merge multi-domain, team_size from git, 🟡 non-blocking calibration | `/vp-request` review | Backlog |
| 2026-04-24 | Phase 108 planned: ENH-073 vp-persona (5 tasks — inferPersona + auto-switch + domain packs + skill+workflow injections + calibration + tests), target **2.42.0** | `/vp-evolve` | M1.37 |
| 2026-04-24 | Phase 108 shipped: ENH-073 (inferPersona + autoSwitch + 5 domain packs + vp-persona skill + 19 skills injected + always-on calibration + 35 tests) — **2.42.0** | `/vp-auto` | M1.37 |
| 2026-04-24 | ENH-074 logged: centralize shared framework files to ~/.viepilot/ — eliminate per-adapter duplication + fix version drift on npm update | `/vp-request` | Backlog |
| 2026-04-24 | ENH-075 logged: vp-rollback AUQ checkpoint selection + show-more pagination + --limit flag | `/vp-request` | Backlog |
| 2026-04-24 | Phase 109 planned: ENH-075 (4 tasks — rollback.md AUQ Steps 1+2 + SKILL.md --limit + tests), target **2.43.0** | `/vp-evolve` | M1.37 |
| 2026-04-24 | Phase 109 shipped: ENH-075 (rollback.md AUQ + pagination + --limit + 20 tests) — **2.43.0** | `/vp-auto` | M1.37 |
| 2026-04-24 | BUG-022 logged: vp-brainstorm mid-session structured questions not using AUQ on Claude Code terminal | `/vp-request` | Backlog |
| 2026-04-24 | Phase 110 planned: BUG-022 (3 tasks — brainstorm.md rule + SKILL.md update + tests), target **2.43.1** | `/vp-evolve` | M1.37 |
| 2026-04-24 | Phase 110 shipped: BUG-022 (mid-session AUQ rule + SKILL.md + 14 tests) — **2.43.1** | `/vp-auto` | M1.37 |
| 2026-04-24 | BUG-023 logged: vp-brainstorm session transition prompt not using AUQ (distinct from BUG-022) | `/vp-request` | Backlog |
| 2026-04-24 | Phase 111 planned: BUG-023 (3 tasks — brainstorm.md transition rule + SKILL.md update + tests), target **2.43.2** | `/vp-evolve` | M1.37 |
| 2026-04-25 | Phase 111 shipped: BUG-023 (session-transition AUQ rule + SKILL.md + 15 tests) — **2.43.2** | `/vp-auto` | M1.37 |
| 2026-04-25 | ENH-076 logged: Design.MD full integration (brainstorm+crystallize+auto+vp-design+architect) — XL scope | `/vp-request` | Backlog |
| 2026-04-25 | Phases 112–115 planned: ENH-076 split into 4 phases (2.44.0 → 2.44.1 → 2.45.0 → 2.45.1) | `/vp-evolve` | M1.37 |
| 2026-04-25 | Phases 112–115 shipped: ENH-076 complete (Design.MD full integration) — **2.45.1** | `/vp-auto` | M1.37 |
| 2026-04-25 | ENH-077 logged: seamless handoff crystallize Step 1D.14 → vp-design --sync (AUQ after export) | `/vp-request` | Backlog |
| 2026-04-25 | Phase 116 planned: ENH-077 (2 tasks — crystallize handoff AUQ + tests), target **2.45.2** | `/vp-evolve` | M1.37 |
| 2026-04-25 | BUG-024 logged: install libFiles hard-coded — viepilot-persona.cjs + skill-registry.cjs missing from installed instances (Windows + all platforms) | `/vp-request` | Backlog |
| 2026-05-21 | ENH-085 logged: Mobile UI Direction breakdown quality — breakpoints/responsive variants/mobile-first strategy/component map all absent from workflow chain | `/vp-request` | Backlog |
| 2026-05-22 | Phase 126 planned: ENH-085 (7 tasks — design.md schema + brainstorm mobile sub-phase + per-breakpoint HTML + component map + Sub-scan A breakpoints + crystallize consumption), target **2.51.0** | `/vp-evolve` | M1.37 |
| 2026-05-22 | Phase 126 shipped: ENH-085 Mobile UI Direction (7 tasks, 27 tests) — **2.51.0** | `/vp-auto` | M1.37 |
| 2026-05-22 | FEAT-021 logged: v3 Milestone — Per-Adapter Intelligence Refactor (agent layer broken on Claude Code, workflow/agent disconnect, per-adapter logic, XL scope, research required) | `/vp-request` | v3 |
| 2026-05-22 | FEAT-021 brainstorm complete: 6 topics, 7 phases planned (127-133), orchestration topic added — vp-auto to use Agent/Task tool fan-out + Agent Teams; orchestration critical path added as Phase 133 | `/vp-brainstorm` | v3 |
| 2026-05-22 | M1.37 archived → `.viepilot/milestones/M1.37-SUMMARY.md` (Phases 53-126, v2.0.0-2.51.0) | `/vp-evolve --milestone` | M1.37 close |
| 2026-05-22 | v3 ROADMAP created: Phases 127-133, 31 tasks, target v3.0.0 + v3.1.0; CHANGELOG [Unreleased] updated | `/vp-evolve --milestone` | v3 |
| 2026-05-22 | Phase 127 shipped: lib/adapter-context.cjs (5 adapters, tool maps, orchestration caps) + vp-tools detect-adapter + validate + autonomous.md injection + 32 tests | `/vp-auto` | Phase 127 |

## Blockers
_None currently_

## Next Action
_v3 ROADMAP ready. Run `/vp-auto --from 127` to start Phase 127 (vp-tools detect-adapter + ADAPTER_CONTEXT + validate)._

## Backlog

### Pending Requests
| ID | Type | Title | Priority | Status |
|----|------|-------|----------|--------|
| DEBT-001 | 🧹 | README + Docs Drift — sync badges, counts, skills-reference to v3.7.2 | medium | new |
| ENH-089 | 🔧 | vp-intake: excel-intake-agent + sheets-intake-agent — isolated Graph API + OAuth R/W | medium | new |
| BUG-029 | 🐛 | vp-intake Excel M365 write-back stub — writeback.cjs task 123.4 never implemented | high | new |
| ENH-088 | 🔧 | vp-intake: scheduled auto-intake — CronCreate/CronDelete + full auto request creation | medium | new |
| ENH-087 | 🔧 | vp-intake: agent-based codebase validation before triage — parallel file-scanner fan-out | medium | new |
| ENH-086 | 🔧 | Promote 6 workflow agents to native Claude Code agent types — visible in /agents dialog | medium | ✅ done (**3.2.0**) |
| BUG-028 | 🐛 | test-generator-agent + file-scanner-agent not wired — ENH-057 Phase 83 incomplete | medium | new |
| BUG-027 | 🐛 | claudeAgentsDir not wired into install — vp-task-executor/planner/gate NOT copied to ~/.claude/agents/ | high | ✅ done (**3.1.1**) |
| FEAT-021 | ✨ | v3 Milestone: Per-Adapter Intelligence Refactor — 7 phases (127-133), adapter blocks + ADAPTER_CONTEXT + orchestration refactor → v3.1.0 | critical | ✅ done |
| ENH-085 | 🔧 | Mobile UI Direction breakdown quality — breakpoints, responsive variants, mobile-first strategy, component map | high | ✅ done (**2.51.0**) |
| ENH-084 | 🔧 | vp-intake: AUQ-driven channel config setup wizard | high | ✅ done (**2.50.0**) |
| ENH-083 | 🔧 | vp-intake: SharePoint sharing link + xlsx parser + BUG keyword "performance" | high | ✅ done (**2.49.0**) |
| ENH-082 | 🔧 | Ticket Intake Channels — Excel/M365 + Google Sheets + CSV + Triage Workflow + Write-back | high | ✅ done (**2.48.0**) |
| ENH-076 | 🔧 | Design.MD full integration across ViePilot workflow (XL) — Phases 112–115 | high | planned |
| BUG-023 | 🐛 | vp-brainstorm session transition prompt ("what to do next?") not using AUQ — separate from BUG-022 | medium | ✅ done (**2.43.2**) |
| BUG-022 | 🐛 | vp-brainstorm mid-session structured questions not using AUQ — plain text on Claude Code terminal | medium | ✅ done (**2.43.1**) |
| ENH-075 | 🔧 | vp-rollback AUQ checkpoint selection + Show more/older + --limit flag | medium | ✅ done (**2.43.0**) |
| ENH-074 | 🔧 | Centralize shared framework to ~/.viepilot/ — single install source, eliminate adapter version drift | high | ❌ wont_fix |
| ENH-073 | 🔧 | vp-persona — fully automated cross-project identity: inferPersona() from files+git, auto-switch, auto-merge, domain packs, adaptive calibration | high | ✅ done (**2.42.0**) |
| ENH-072 | 🔧 | vp-* skill invocation version update check — notice banner when new ViePilot version available (npm registry, 24h cache) | medium | ✅ done (**2.41.0**) |
| BUG-021 | 🐛 | Antigravity adapter install path outdated — skills not discovered after Gemini rebrand (`.antigravity/` → `.gemini/antigravity/`) | high | ✅ done (**2.39.1**) |
| ENH-071 | 🔧 | vp-brainstorm Embedded Domain Mode — 10 gaps (hw-topology, pin-map, memory-layout, RTOS, protocol-matrix, power-budget, MCU toolchain, safety, UI-Direction suppression, firmware phase template) | medium | triaged (→ Phase 106) |
| BUG-017 | 🐛 | vp-evolve/vp-request Step 5/6 thiếu AUQ call trong `<process>` body — `@` workflow ref không auto-expand | high | triaged (→ Phase 95) |
| ENH-062 | 🔧 | `/vp-skills` slash command — agent-native global skill registry management (scan/install/list cross-project) | high | triaged (→ Phase 95) |
| BUG-016 | 🐛 | Workflow skill context steps dùng JS function call không executable — cần thay bằng shell command | high | triaged (→ Phase 95) |
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
| ENH-064 | 🔧 | Unified HUB cho architect + ui-direction + crystallize mandatory read gates (no silent skip) | high | new |
| ENH-063 | 🔧 | vp-brainstorm thiếu Admin & Governance topic — không elicit admin panel/monitor/audit/billing → crystallize bỏ qua | high | new |
| ENH-069 | 🔧 | crystallize UI→Task binding gap — prototype pages/*.html read but not mapped to implementation tasks; stubs survive all phases | high | new |
| BUG-020 | 🐛 | vp-auto ignores scaffold/create-project best practice — handcrafts framework files (Laravel, Rails, Next.js, etc.) instead of running canonical init command | critical | ✅ done (**2.37.0**) |
| BUG-019 | 🐛 | `vp-tools scan-skills` command not implemented — referenced in FEAT-020 docs but never added to bin/vp-tools.cjs | medium | ✅ done (**2.36.1**) |
| BUG-018 | 🐛 | brainstorm thiếu unified mode-selection prompt — Architect auto-activates không offer UI Direction | high | new |
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
