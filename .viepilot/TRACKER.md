# ViePilot — Tracker

## Current State
- **Milestone**: v2.1 Post-MVP Core
- **Phase**: 07-working-dir-guard (next)
- **Task**: 7.2 — AI-GUIDE.md template Install path READ-ONLY note
- **Version**: 2.0.2 (→ 2.0.3 after Phase 07, → 2.1.0 after Phase 08)
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
| 07 | Hotfix — Working Directory Guard (BUG-007) | 3 | in progress 🔄 |
| 08 | ENH-022 — Crystallize Domain Entity Extraction | 4 | not started 🔲 |
| 09 | Brainstorm Artifact Manifest | 7 | not started 🔲 |
| 10 | Gap E + Gap G Extended + Token Budget Awareness | 6 | not started 🔲 |
| 11 | Diagram Profile System | 5 | not started 🔲 |
| 12 | Verification + Docs + v2.1.0 Release | 5 | not started 🔲 |

**v2 MVP (archived)**: 44 / 44 tasks (100%) ✅
**v2.1 milestone**: 1 / 30 tasks (3%)

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
| [BUG-007](.viepilot/requests/BUG-007.md) | 🐛 Bug | vp-auto edit install path (~/.claude/viepilot/) thay vì codebase source | high | → Phase 07 |
| [ENH-022](.viepilot/requests/ENH-022.md) | ✨ Enhancement | Crystallize bỏ sót core CRUD service phases — thiếu domain entity extraction step | high | → Phase 08 |

## Next Action

v2.1 milestone scaffolded. v2 MVP archived to `.viepilot/milestones/v2/`. Run `/vp-auto` to start Phase 07.

- Phase directory: `.viepilot/phases/07-working-dir-guard/`
- First task: **7.1** — autonomous.md Working Directory Guard block (M)
- Execution order: **7.1 → 7.2 → 7.3**
- All tasks 7.x touch different files — can run without sequential constraint (7.1 + 7.2 independent; 7.3 last)
