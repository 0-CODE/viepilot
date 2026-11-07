# Phase 174 Spec — ENH-121: Rehearsal Hall — timeline simulation, analytics, 3D replay

## Goal
After a proposal is complete the user can rehearse it in a simulated hall: personas listen along a real timeline (slides, script lines, click cues), and the run produces evaluations, improvements, tune-out moments, a retention curve, keyword and criteria effectiveness, four chart groups and a self-contained HTML report with a 3D hall replay.

## Requests
`.viepilot/requests/ENH-121.md`

## Design decisions
- three.js shipped as an npm dependency and inlined into the report so it opens offline; 2D SVG fallback without WebGL.
- Runs stored in `docs/proposals/{slug}/versions/vN/simulation/run-{n}/` (Phase 171 layout).
- Hall audience: by type + audienceProfile (~12–16), `--hall all` for the whole library, add/remove; #20 present; #31 observer.
- Speaking rate defaults: vi 150 wpm, en 140 wpm (configurable).

## Constraints
- English only in workflows/ and skills/ (enh031 test).
- Tests resilient: `>=` for counts that may grow, no pinned version literals.
- Never touch the real `~/.claude/settings.json` in tests (temp HOME); hook/settings writes are consent-gated with `--dry-run`.
- Follow the ENH-125 tool policy once Phase 170 ships (Read/Grep/Edit/Write/Task/TodoWrite).

## Target Version
3.22.0 (MINOR)

## Tasks
| Task | Description | Complexity |
|------|-------------|------------|
| 174.1 | Timeline builder + slide load metrics | M |
| 174.2 | Listener contract + hall audience | M |
| 174.3 | Aggregator: all metrics and chart data | L |
| 174.4 | Report: HTML (inline SVG) + summary.md + data.json | L |
| 174.5 | 3D hall replay + 2D fallback | L |
| 174.6 | Workflow: end-of-flow gate + --simulate re-run | M |
| 174.7 | Tests + CHANGELOG 3.22.0 + resolve ENH-121 | M |

## Verification
- [ ] `npm test` → full suite green
- [ ] `node bin/vp-tools.cjs todo check --phase 174 --phase-complete` → exit 0
- [ ] version = 3.22.0
