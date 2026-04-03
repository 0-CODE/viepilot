# ViePilot — Tracker

## Current State
- **Milestone**: v2.1 Post-MVP Core
- **Phase**: 13 — Agent Orchestration — Tier A + B (next)
- **Task**: 13.1 — autonomous task-boundary re-hydrate (see ROADMAP)
- **Version**: 2.2.0
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
| 08 | ENH-022 — Crystallize Domain Entity Extraction | 4 | complete ✅ |
| 09 | Brainstorm Artifact Manifest | 7 | complete ✅ |
| 10 | Gap E + Gap G Extended + Token Budget Awareness | 6 | complete ✅ |
| 11 | Diagram Profile System | 5 | complete ✅ |
| 12 | Verification + Docs + v2.2.0 Release | 5 | complete ✅ |
| 13 | Agent Orchestration — Tier A + B | 4 | not started 🔲 |
| 14 | ENH-027 — vp-tools ask | 1 | not started 🔲 |
| 15 | ENH-023 — handoff-sync + hooks | 1 | not started 🔲 |
| 16 | ENH-028 — crystallize Review Gate | 1 | not started 🔲 |
| 17 | ENH-026 — Plan mode doc-first | 1 | not started 🔲 |
| 18 | ENH-024 — Fork state background | 1 | not started 🔲 |
| 19 | ENH-025 — Worktree L/XL | 1 | not started 🔲 |
| 20 | ENH-031 — cold start token reduction | 3 | not started 🔲 |

**v2 MVP (archived)**: 44 / 44 tasks (100%) ✅
**v2.1 milestone**: 32 / 43 tasks (~74%) _(Phase 12 complete **v2.2.0** 2026-04-03; Phase 20 ENH-031)_

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
| [ENH-023](.viepilot/requests/ENH-023.md) | ✨ Enhancement | Hooks system — PostToolUse auto state sync (vp-tools handoff-sync) | high | → Phase 15 |
| [ENH-024](.viepilot/requests/ENH-024.md) | ✨ Enhancement | run_in_background Fork State Updates — fire-and-forget state writes after task PASS | high | → Phase 18 |
| [ENH-025](.viepilot/requests/ENH-025.md) | ✨ Enhancement | Worktree isolation for L/XL tasks — Agent isolation: worktree for risky phases | medium | → Phase 19 |
| [ENH-026](.viepilot/requests/ENH-026.md) | ✨ Enhancement | Plan Mode in vp-auto doc-first gate — structural enforcement via Claude Code plan mode | medium | → Phase 17 |
| [ENH-027](.viepilot/requests/ENH-027.md) | ✨ Enhancement | vp-tools ask — interactive TUI Q&A command with @clack/prompts arrow-key selection | medium | → Phase 14 |
| [ENH-028](.viepilot/requests/ENH-028.md) | ✨ Enhancement | crystallize Review Gate — extraction phase + per-section approval before generation | high | → Phase 16 |
| [ENH-029](.viepilot/requests/ENH-029.md) | ✨ Enhancement | Remove MVP concept — full-arc ROADMAP with priority + release_target fields | high | new |
| [ENH-030](.viepilot/requests/ENH-030.md) | ✨ Enhancement | Artifact Manifest — add domain_entities + tech_stack artifact types (required: true) | high | → Phase 09 |
| [ENH-031](.viepilot/requests/ENH-031.md) | ✨ Enhancement | Giảm token cold start `/vp-auto` sau clear context — điều tra >13K tokens | high | → Phase 20 |

## Next Action

Phase **12** **complete** — shipped **v2.2.0** (CHANGELOG + tags `viepilot-vp-p12-complete`, `viepilot-vp-v2.2.0`). Next: **Phase 13** — Agent orchestration Tier A + B.

- Phase directory: `.viepilot/phases/13-agent-orchestration-tier-ab/`
- Current task: **13.1** — task-boundary re-hydrate (`autonomous.md`)
- Last done: Phase 12 task **12.5** — CHANGELOG **[2.2.0]** + release tags

**Phase 13 (planned)**: `.viepilot/phases/13-agent-orchestration-tier-ab/` — Agent orchestration Tier A+B; chạy sau khi ổn định Phase 10 (tránh xung đột `autonomous.md`). Sau đó: `/vp-auto --phase 13` hoặc `--from 13`.

**Phases 14–19 (planned, theo dependency)**: `14-enh-027` → `15-enh-023` → `16-enh-028` (sau 14) → `17-enh-026` → `18-enh-024` → `19-enh-025`. Xem graph trong `ROADMAP.md`. `/vp-auto --phase 14` … `--phase 19`.

**Phase 20 (planned)**: `.viepilot/phases/20-enh-031-cold-start-tokens/` — ENH-031 cold-start token reduction; khuyến nghị sau Phase 12, tránh xung đột chỉnh `autonomous.md` với 13–19. `/vp-auto --phase 20`.
