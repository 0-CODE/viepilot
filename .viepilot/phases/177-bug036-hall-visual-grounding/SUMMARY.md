# Phase 177 Summary — BUG-036: Rehearsal Hall listeners see the slides; honest quote guard (v3.22.3)

## Result
All 5 tasks done. Full suite: 3259 passed. Release commit: ab44a28.

## What changed
- 177.1 listener prompt: open every slide image first; `slidesSeen` + `visualNotes`; quote only the words that caused a reaction; numbers are estimates.
- 177.2 `parseListener`: selective-quote citations (≤ 60% of the segment unless ≤ 6 words), `quoteQuality: mechanical`, visual fields; `verifyVisual(transcript, imagePaths)`.
- 177.3 summary `visualCoverage` + `mechanicalQuotes`, grounding line + warning, model-estimate labels; deltas from data.json.
- 177.4 slide images embedded (`embedSlideImages`, `writeRun({ slideImages })`), drawn on the 3D screen and in the 2D view.
- 177.5 session `currentVersion` backfill; CHANGELOG 3.22.3.

## Evidence
Re-parsing run-3 with the new parser: 15/16 listeners mechanical, 114 uncited negative reactions dropped, 0 listeners with slidesSeen.

## Follow-up
Reinstall 3.22.3 and run the hall as run-4 (with transcript verification) to compare with run-3.
