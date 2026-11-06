# PHASE-STATE — Phase 168

## Phase
168 — ENH-118: Native todo mirror (mandatory) (v3.14.0)

## Status
planned

## Tasks
| Task | Status | Notes |
|------|--------|-------|
| 168.1 | done ✅ | todo capability ×5 (claude/antigravity/codex verified; cursor/copilot not) + getTodoCapability — a908a4f, a979a75 |
| 168.2 | done ✅ | lib/todo-mirror.cjs + vp-tools todo list/payload/sync/check; no parent-cycle deps — 091e3c2, bc0ec5c |
| 168.3 | in_progress | workflow/skill/agent gates |
| 168.4 | pending | vp-tools todo enable (consent) |
| 168.5 | pending | tests + CHANGELOG 3.14.0 |

## Dependencies
- Phase 165 ✅

## Execution order
168 → 166 → 167 (branch from-3.12.2)

## Version Target
3.14.0 (MINOR)

## Source
.viepilot/requests/ENH-118.md

## Todo
- [x] [vp] 168.1 — Adapter todo capability (5 adapters, verified flags)
- [x] [vp] 168.2 — lib/todo-mirror.cjs + `vp-tools todo`
- [~] [vp] 168.3 — Mandatory gates in workflows, skills and tracker-agent
- [ ] [vp] 168.4 — `vp-tools todo enable` (consent-gated)
- [ ] [vp] 168.5 — Tests + CHANGELOG 3.14.0
