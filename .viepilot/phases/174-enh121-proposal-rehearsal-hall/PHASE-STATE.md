# PHASE-STATE — Phase 174

## Phase
174 — ENH-121: Rehearsal Hall — timeline simulation, analytics, 3D replay (v3.22.0)

## Status
in_progress

## Tasks
| Task | Status | Notes |
|------|--------|-------|
| 174.1 | done ✅ | buildTimeline + slideLoad |
| 174.2 | done ✅ | listener-prompt.md, parseListener, selectHall |
| 174.3 | done ✅ | proposal-sim-aggregate.cjs — 5 requested outputs + 4 chart groups + deltas |
| 174.4 | done ✅ | proposal-sim-report.cjs — HTML/MD/JSON, writeRun |
| 174.5 | done ✅ | hall3d.js + three inlined + 2D fallback; browser-verified |
| 174.6 | done ✅ | Step 10b + gates + --simulate + SKILL |
| 174.7 | in_progress 🔄 | CHANGELOG 3.22.0 + resolve ENH-121 |

## Dependencies
- Phase 173

## Version Target
3.22.0 (MINOR)

## Sources
.viepilot/requests/ENH-121.md

## Todo
- [x] [vp] 174.1 — Timeline builder + slide load metrics
- [x] [vp] 174.2 — Listener contract + hall audience
- [x] [vp] 174.3 — Aggregator: all metrics and chart data
- [x] [vp] 174.4 — Report: HTML (inline SVG) + summary.md + data.json
- [x] [vp] 174.5 — 3D hall replay + 2D fallback
- [x] [vp] 174.6 — Workflow: end-of-flow gate + --simulate re-run
- [~] [vp] 174.7 — Tests + CHANGELOG 3.22.0 + resolve ENH-121
