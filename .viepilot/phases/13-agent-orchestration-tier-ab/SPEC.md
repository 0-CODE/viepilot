# Phase 13: Agent Orchestration — Tier A + Tier B

## Goal
Mitigate **context rot** in monolithic `/vp-auto` runs by (1) **mandatory file re-hydrate at task boundaries** and (2) a **file-based delegate contract** under `.viepilot/delegates/` for isolated worker handoff — aligned with `docs/brainstorm/session-2026-04-03.md` Part 5 (Topics 19–20).

## Non-goals (this phase)
- Host-native subagent fork (Tier C) — defer; map to Claude Code later.
- Async background merge (Tier D) — defer to ENH-024 + policy.
- Changing SKILL.md invocation UX beyond documentation.

## Tasks

| # | Task | Complexity | Primary paths |
|---|------|------------|---------------|
| 13.1 | Task-boundary re-hydrate in `autonomous.md` | M | `workflows/autonomous.md` |
| 13.2 | Delegate envelope templates | M | `templates/project/delegates/` |
| 13.3 | AI-GUIDE + user docs — merge checklist | S | `templates/project/AI-GUIDE.md`, `docs/user/features/autonomous-mode.md` |
| 13.4 | Contract tests | S | `tests/unit/` |

## Execution Order
13.1 → 13.2 → 13.3 → 13.4

## Dependencies
- Phase 8 (stable vp-auto baseline).
- **Recommended**: complete Phase 10 before 13.1 to reduce merge conflicts on `workflows/autonomous.md`.

## Acceptance Criteria
- [ ] Tier A: workflow explicitly requires re-read of current task + HANDOFF + PHASE-STATE slice before executing each task (or immediately after prior PASS).
- [ ] Tier B: template path `templates/project/delegates/` with `pending` / `done` samples and field contract documented.
- [ ] Docs: main agent merge rules from `done/*.json` only; default delegate read-only.
- [ ] Tests PASS.

## Notes
Scaffolded by `/vp-evolve --feature` on 2026-04-03 (inferred from brainstorm orchestration thread).
