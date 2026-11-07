# Phase 179 Spec — BUG-037: first live panel run fixes

## Goal
The panel engine label is derived from how messages actually flowed, replyTo accepts message or panelist ids, the strongest skeptics always get a seat, before/after uses each panelist's own stance, the presenter respects the word cap, card text is vertically centred, and proposal diff compares the latest two versions.

## Requests
`.viepilot/requests/BUG-037.md`

## Design decisions
- Engine is computed, never declared: teams only when the transcript holds peer-to-peer panelist messages.
- Skeptic-first selection: wouldAct=false with the most objections (asked + unanswered) beats "most negative primary".

## Constraints
- English only in workflows/ and skills/ (enh031 test).
- Tests resilient: `>=` for counts that may grow, no pinned version literals.
- Never touch the real `~/.claude/settings.json` in tests (temp HOME); hook/settings writes are consent-gated with `--dry-run`.
- Follow the ENH-125 tool policy once Phase 170 ships (Read/Grep/Edit/Write/Task/TodoWrite).
- Regression tests named `phase179-*`, using the v2 run-1 panel data shape as fixtures.

## Target Version
3.23.1 (PATCH)

## Tasks
| Task | Description | Complexity |
|------|-------------|------------|
| 179.1 | Panel lib: computed engine, replyTo resolution, skeptic-first selection, stance before/after | M |
| 179.2 | Report shows stance/conditions; proposal diff latest-two; card text centring guidance | S |
| 179.3 | Tests + CHANGELOG 3.23.1 + resolve BUG-037 | S |

## Verification
- [ ] `npm test` → full suite green
- [ ] `node bin/vp-tools.cjs todo check --phase 179 --phase-complete` → exit 0
- [ ] version = 3.23.1
