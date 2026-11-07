# Phase 177 Spec — BUG-036: Rehearsal Hall listeners see the slides; quote guard and labels made honest

## Goal
Listeners must view every slide image and report what they saw; quotes must be selective (a full-segment copy is not evidence); per-segment metrics are labelled as model estimates with visual coverage and quote quality in the report; the hall screen shows the slide images; run-over-run deltas work from a data.json; old sessions get currentVersion backfilled.

## Requests
`.viepilot/requests/BUG-036.md`

## Design decisions
- Visual grounding is checked twice: the listener reports `slidesSeen` + one `visualNotes` entry per slide, and the orchestrator verifies against the subagent tool-use record when it can (Claude Code transcript) — unverified listeners are marked, not trusted.
- A quote is selective when it is at most 60% of the segment (or ≤ 20 words for long segments) — exact copy of the whole segment never counts as citing it.
- Labels over silence: the report keeps the numbers but states "model estimate" next to them and shows visual coverage / quote quality in the summary.

## Constraints
- English only in workflows/ and skills/ (enh031 test).
- Tests resilient: `>=` for counts that may grow, no pinned version literals.
- Never touch the real `~/.claude/settings.json` in tests (temp HOME); hook/settings writes are consent-gated with `--dry-run`.
- Follow the ENH-125 tool policy once Phase 170 ships (Read/Grep/Edit/Write/Task/TodoWrite).
- Regression tests named `phase177-*`; fixtures reproduce the run-3 patterns (full-segment quotes, no image reads).

## Target Version
3.22.3 (PATCH)

## Tasks
| Task | Description | Complexity |
|------|-------------|------------|
| 177.1 | Listener prompt: must view slides, selective quotes, slidesSeen + visualNotes | S |
| 177.2 | parseListener: selective quotes, mechanical-quote flag, visual fields; verifyVisual | M |
| 177.3 | Aggregate + report: coverage, quote quality, model-estimate labels, deltas from data.json | M |
| 177.4 | Hall replay shows slide images | M |
| 177.5 | Session backfill + tests + CHANGELOG 3.22.3 + resolve BUG-036 | S |

## Verification
- [ ] `npm test` → full suite green
- [ ] `node bin/vp-tools.cjs todo check --phase 177 --phase-complete` → exit 0
- [ ] version = 3.22.3
