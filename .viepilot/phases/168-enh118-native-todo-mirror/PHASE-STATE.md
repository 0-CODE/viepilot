# PHASE-STATE — Phase 168

## Phase
168 — ENH-118: Native todo mirror (mandatory) (v3.14.0)

## Status
done ✅

## Tasks
| Task | Status | Notes |
|------|--------|-------|
| 168.1 | done ✅ | todo capability ×5 (claude/antigravity/codex verified; cursor/copilot not) + getTodoCapability — a908a4f, a979a75 |
| 168.2 | done ✅ | lib/todo-mirror.cjs + vp-tools todo list/payload/sync/check; no parent-cycle deps — 091e3c2, bc0ec5c |
| 168.3 | done ✅ | MUST gates in evolve/autonomous/resume-work + tracker-agent sync; adapter-agnostic VP_TOOLS resolver — 5369fba, fc4b7a2, 598dfa6 |
| 168.4 | done ✅ | vp-tools todo enable (consent-gated, dry-run, idempotent, preserves keys); install hint only — 81bbb4e |
| 168.5 | done ✅ | 28 tests (fixtures + temp HOME) — b2df9de; release 3.14.0 — 7ef8ed6 |

## Dependencies
- Phase 165 ✅

## Execution order
168 → 166 → 167 (branch from-3.12.2)

## Version Target
3.14.0 (MINOR)

## Source
.viepilot/requests/ENH-118.md

## Completed
2026-11-07

## Git
- Release commit: 7ef8ed6 chore(release) 3.14.0
- Tag: vp-p168-complete
- Pushed: yes
- Full suite: 2392/2392 green

## Todo
- [x] [vp] 168.1 — Adapter todo capability (5 adapters, verified flags)
- [x] [vp] 168.2 — lib/todo-mirror.cjs + `vp-tools todo`
- [x] [vp] 168.3 — Mandatory gates in workflows, skills and tracker-agent
- [x] [vp] 168.4 — `vp-tools todo enable` (consent-gated)
- [x] [vp] 168.5 — Tests + CHANGELOG 3.14.0
