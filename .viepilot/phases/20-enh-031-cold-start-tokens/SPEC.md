# Phase 20: ENH-031 — Cold start token reduction for `/vp-auto`

## Goal
After **clear context**, a cold `/vp-auto` run should not force loading the full `autonomous.md` + long `ROADMAP.md` + duplicate skill prose in one shot when a slimmer path exists — per ENH-031 investigation.

## Dependencies
Recommend after **Phase 12** (stable verify). Coordinate with **Phases 13–19** if editing `workflows/autonomous.md` or `skills/vp-auto/SKILL.md` concurrently.

## Tasks
| # | Description |
|---|-------------|
| 20.1 | Cold-start manifest doc + byte/token estimate; update `docs/user/features/autonomous-mode.md` |
| 20.2 | Slim `skills/vp-auto/SKILL.md` — routing + pointer only; single source of truth in `autonomous.md` |
| 20.3 | `ROADMAP-INDEX.md` + `autonomous.md` Initialize Step 1 reads index when present; fallback full ROADMAP |

## Notes
Scaffold via `/vp-evolve --feature` 2026-04-03. Directions A–E in `.viepilot/requests/ENH-031.md`.
