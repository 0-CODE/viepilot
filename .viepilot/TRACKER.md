# ViePilot — Tracker

## Current State
- **Milestone**: v2.1 Post-MVP Core
- **Phase**: 08-crystallize-entity-extraction (next)
- **Task**: 8.3 — crystallize.md Entity manifest output format
- **Version**: 2.0.3 (→ 2.1.0 after Phase 08)
- **Last Update**: 2026-04-03

## Progress

| Phase | Name | Tasks | Status |
|-------|------|-------|--------|
| 01 | Foundation — Templates & State Machine | 6 | complete ✅ |
| 02 | Execution Engine — vp-auto Rewrite | 9 | complete ✅ |
| 03 | Workflow Integration — Skills & Commands | 8 | complete ✅ |
| 04 | Verification & Documentation | 11 | complete ✅ |
| 05 | Hotfix — Install Path Convention + Logic Gaps | 5 | complete ✅ |
| 06 | Hotfix — State Update + Tag Prefix (BUG-005 + BUG-006) | 5 | complete ✅ |
| 07 | Hotfix — Working Directory Guard (BUG-007) | 3 | complete ✅ |
| 08 | ENH-022 — Crystallize Domain Entity Extraction | 4 | in progress 🔄 |
| 09 | Brainstorm Artifact Manifest | 7 | not started 🔲 |
| 10 | Gap E + Gap G Extended + Token Budget Awareness | 6 | not started 🔲 |
| 11 | Diagram Profile System | 5 | not started 🔲 |
| 12 | Verification + Docs + v2.1.0 Release | 5 | not started 🔲 |

**v2 MVP (archived)**: 44 / 44 tasks (100%) ✅
**v2.1 milestone**: 5 / 30 tasks (16%)

## Logs (on-demand)
- Decisions → `logs/decisions.md`
- Blockers → `logs/blockers.md`
- Version history → `logs/version-history.md`

## Backlog

### Pending Requests

| ID | Type | Title | Priority | Status |
|----|------|-------|----------|--------|
| [BUG-005](.viepilot/requests/BUG-005.md) | 🐛 Bug | vp-auto không update PHASE-STATE, task files, checklist sau mỗi task | high | ✅ done |
| [BUG-006](.viepilot/requests/BUG-006.md) | 🐛 Bug | Git tags thiếu project prefix — collision khi chạy nhiều dự án | high | ✅ done |
| [BUG-007](.viepilot/requests/BUG-007.md) | 🐛 Bug | vp-auto edit install path (~/.claude/viepilot/) thay vì codebase source | high | ✅ done |
| [ENH-022](.viepilot/requests/ENH-022.md) | ✨ Enhancement | Crystallize bỏ sót core CRUD service phases — thiếu domain entity extraction step | high | → Phase 08 |
| [ENH-023](.viepilot/requests/ENH-023.md) | ✨ Enhancement | Hooks system — PostToolUse auto state sync (vp-tools handoff-sync) | high | new |
| [ENH-024](.viepilot/requests/ENH-024.md) | ✨ Enhancement | run_in_background Fork State Updates — fire-and-forget state writes after task PASS | high | new |
| [ENH-025](.viepilot/requests/ENH-025.md) | ✨ Enhancement | Worktree isolation for L/XL tasks — Agent isolation: worktree for risky phases | medium | new |
| [ENH-026](.viepilot/requests/ENH-026.md) | ✨ Enhancement | Plan Mode in vp-auto doc-first gate — structural enforcement via Claude Code plan mode | medium | new |
| [ENH-027](.viepilot/requests/ENH-027.md) | ✨ Enhancement | vp-tools ask — interactive TUI Q&A command with @clack/prompts arrow-key selection | medium | new |
| [ENH-028](.viepilot/requests/ENH-028.md) | ✨ Enhancement | crystallize Review Gate — extraction phase + per-section approval before generation | high | new |
| [ENH-029](.viepilot/requests/ENH-029.md) | ✨ Enhancement | Remove MVP concept — full-arc ROADMAP with priority + release_target fields | high | new |

## Next Action

Phase 08 in progress (ENH-022). Tasks 8.1 + 8.2 done. Current: **8.3** → 8.4.

- Phase directory: `.viepilot/phases/08-crystallize-entity-extraction/`
- Current task: **8.3** — crystallize.md Entity manifest output format (S)
- Execution order: ~~8.1~~ ~~8.2~~ → **8.3** → 8.4
