# Phase 178 Spec — ENH-128: Rehearsal Hall panel — personas debate and cross-examine a presenter agent

## Goal
After independent listening, a 4–6 persona panel questions a presenter agent (answers only from the material, with citations) and debates in up to 3 capped rounds over real messages — relay engine by default, Claude Code agent teams opt-in — and the report shows the transcript, a chat replay, before/after per panelist and the unanswered questions as deck gaps.

## Requests
`.viepilot/requests/ENH-128.md`

## Design decisions
- Listening stays independent (no herding); the panel is a separate phase after aggregation.
- One message protocol {from, to, round, text, cites[]} for both engines; the lead enforces rounds and caps.
- Presenter answers without a citation from deck/notes/backstage/Content Map are flagged; "no answer in the material" is a valid, recorded answer.

## Constraints
- English only in workflows/ and skills/ (enh031 test).
- Tests resilient: `>=` for counts that may grow, no pinned version literals.
- Never touch the real `~/.claude/settings.json` in tests (temp HOME); hook/settings writes are consent-gated with `--dry-run`.
- Follow the ENH-125 tool policy once Phase 170 ships (Read/Grep/Edit/Write/Task/TodoWrite).
- Regression tests named `phase178-*`; never call real agent teams in tests (pure functions + fixtures).
- Agent teams stay opt-in (experimental env var); the relay engine must work on every host.

## Target Version
3.23.0 (MINOR)

## Tasks
| Task | Description | Complexity |
|------|-------------|------------|
| 178.1 | Panel selection + message protocol + caps (lib) | M |
| 178.2 | Presenter + panelist prompts | S |
| 178.3 | Engines: relay (default) and agent teams (opt-in) in the workflow | M |
| 178.4 | Report: debate section, chat replay, before/after, gaps | M |
| 178.5 | Tests + docs + CHANGELOG 3.23.0 + resolve ENH-128 | S |

## Verification
- [ ] `npm test` → full suite green
- [ ] `node bin/vp-tools.cjs todo check --phase 178 --phase-complete` → exit 0
- [ ] version = 3.23.0
