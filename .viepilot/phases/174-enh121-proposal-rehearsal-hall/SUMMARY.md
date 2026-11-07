# Phase 174 Summary — ENH-121 (v3.22.0)

## Delivered
- `lib/proposal-simulation.cjs`: `buildTimeline` (vi 150 / en 140 wpm, `[click]` cues, pauses, planned vs spoken, over/underrun), `slideLoad`, `parseListener` (negative reactions must quote their segment), `selectHall` (12–16 seats, type personas first, `--hall all`, #20 present, #31 observer, primary roles weighted).
- `templates/proposal/simulation/listener-prompt.md`: per-segment listener contract.
- `lib/proposal-sim-aggregate.cjs`: the five requested outputs (evaluations, improvements, tune-outs, retention, keyword/criteria effectiveness) and the four chart groups, plus run-over-run deltas.
- `lib/proposal-sim-report.cjs`: offline `report.html` (inline SVG, light/dark, phone width, AI-simulation label), `summary.md`, `data.json` in `simulation/run-{n}/`; never overwrites.
- `templates/proposal/simulation/hall3d.js`: 3D hall replay (three.js inlined via Blob import; orbit, zoom, seat details) with 2D SVG fallback; `three` added as a dependency.
- Workflow Step 10b Rehearsal Hall with input/output gates and `--simulate`; SKILL 0.7.0.

## Verification
- Full suite 3177 passed + 1 skipped; `lintWorkflowGates` → [].
- Browser check (Chrome, local server, 16-listener demo): WebGL canvas renders; seats recolour along the timeline; tuned-out seats dim; objection flags appear; scrubber and script line stay in sync; dark theme report renders all sections. Two defects found and fixed from that check: persona names missing in tables; JSON hall data had been HTML-escaped (would not parse).

## Known gaps
- BUG-034: the installer does not install dependencies in the installed copy, so installed users get the 2D hall until fixed.
- Not yet run end-to-end with real listener subagents on a real proposal; verified with synthetic listener data.
- Incident: the new installer bug was first written as BUG-033 and overwrote main's untracked BUG-033 file; renumbered to BUG-034 and BUG-033 reconstructed (untracked) from main's TRACKER + Phase 155 SPEC.
