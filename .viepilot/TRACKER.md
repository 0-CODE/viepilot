# ViePilot (framework repo) - Tracker

## Current State
- **Milestone**: M1.29
- **Current Phase**: **49** — ✅ Complete (**ENH-032** → **1.17.0**)
- **Last Completed Phase**: **49** — ✅ Complete (**ENH-032** → **1.17.0**)
- **Current Task**: —
- **Last Activity**: 2026-04-06 — Phase 49 shipped (ENH-032 — language configuration system → 1.17.0)

## Progress Overview
```
Framework release     [██████████] npm **1.17.0**
Phase 34 (FEAT-001)   [██████████] done
Phase 35 (ENH-022)    [██████████] done
─────────────────────────────────────────────
```

## Version Info

### Current Version
```
1.9.5
```

### Next Version
```
Pending changes in [Unreleased]:
- See CHANGELOG.md [Unreleased]

Suggested next version: per release checklist
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

## Blockers
_None currently_

## Next Action
All planned phases complete. Run `/vp-evolve` to plan new features or `/vp-docs` to generate documentation.

## Backlog

### Pending Requests
| ID | Type | Title | Priority | Status |
|----|------|-------|----------|--------|
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
