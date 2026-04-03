# ViePilot — Tracker

## Current State
- **Milestone**: v2 MVP
- **Phase**: 06-hotfix-state-updates (complete ✅)
- **Task**: — (all done)
- **Version**: 2.0.2
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

**Overall**: 44 / 44 tasks (100%) 🎉

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

## Next Action

v2.0.2 released. BUG-005 + BUG-006 fixed. Run `/vp-evolve` or `/vp-brainstorm` for next milestone.

- Phase directory: `.viepilot/phases/06-hotfix-state-updates/`
- First task: **6.1** — autonomous.md State Update Checklist block (M)
- Execution order: **6.1 → 6.2 → 6.3 → 6.5 → 6.4**
- Tasks 6.1 + 6.2 + 6.5 all touch `workflows/autonomous.md` — must be sequential
- Task 6.5 also fixes `crystallize.md`, `evolve.md` (BUG-006 git tag prefix)
- Task 6.4 runs last (version bump + CHANGELOG, closes BUG-005 + BUG-006)
