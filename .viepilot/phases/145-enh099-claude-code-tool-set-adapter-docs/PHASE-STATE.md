# Phase 145 State — ENH-099: Claude Code Tool Set — Adapter Docs + Autonomous Workflow Updates

## Status: pending

## Tasks
| ID | Title | Status |
|----|-------|--------|
| 145.1 | skills/vp-auto/SKILL.md — add 8 new Claude Code tools to adapter section | pending |
| 145.2 | workflows/autonomous.md — TodoWrite→TaskCreate + Monitor + PushNotification patterns | pending |
| 145.3 | docs/dev/agents.md — expand hooks (28 events) + Agent Teams experimental section | pending |
| 145.4 | Contract tests + CHANGELOG [3.9.0] + version bump | pending |

## Version Target
3.8.0 → **3.9.0**

## Resolves
- ENH-099: Claude Code full tool inventory — 40+ tools (only ~12 documented), 28 hook events (only ~3 documented)
- Fixes TodoWrite deprecation (disabled since v2.1.142) in workflows/autonomous.md

## Dependencies
- Phase 144 ✅ (ENH-098 stakeholder gate complete)
- ENH-099 research (2026-05-24 — WebSearch+WebFetch from code.claude.com/docs)

## Key Changes
- vp-auto SKILL.md: Monitor, CronCreate/Delete/List, EnterWorktree/ExitWorktree, LSP, PushNotification, EnterPlanMode/ExitPlanMode
- autonomous.md: TodoWrite→TaskCreate fix; Monitor quality-gate pattern; PushNotification phase-complete
- agents.md: full 28-event hooks table; Agent Teams (experimental) section

## Tasks Parallel Plan
- 145.1, 145.2, 145.3 independent → run in parallel
- 145.4 gates on all three

## Started: —
## Completed: —
