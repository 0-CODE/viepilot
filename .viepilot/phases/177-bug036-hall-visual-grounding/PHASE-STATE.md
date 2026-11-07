# PHASE-STATE — Phase 177

## Phase
177 — BUG-036: Rehearsal Hall listeners see the slides; quote guard and labels made honest (v3.22.3)

## Status
in_progress

## Tasks
| Task | Status | Notes |
|------|--------|-------|
| 177.1 | done ✅ | prompt precondition + quote rule |
| 177.2 | done ✅ | cites selective + mechanical + visual fields + verifyVisual |
| 177.3 | done ✅ | grounding + labels + deltas |
| 177.4 | done ✅ | slide images embedded + drawn |
| 177.5 | pending | Session backfill + tests + CHANGELOG 3.22.3 + resolve BUG-036 |

## Dependencies
- Phase 176 ✅

## Version Target
3.22.3 (PATCH)

## Sources
.viepilot/requests/BUG-036.md

## Todo
- [x] [vp] 177.1 — Listener prompt: must view slides, selective quotes, slidesSeen + visualNotes
- [x] [vp] 177.2 — parseListener: selective quotes, mechanical-quote flag, visual fields; verifyVisual
- [x] [vp] 177.3 — Aggregate + report: coverage, quote quality, model-estimate labels, deltas from data.json
- [x] [vp] 177.4 — Hall replay shows slide images
- [ ] [vp] 177.5 — Session backfill + tests + CHANGELOG 3.22.3 + resolve BUG-036
