# Phase 178 Summary — ENH-128: Rehearsal Hall panel (v3.23.0)

## Result
All 5 tasks done. Full suite: 3270 passed. Release commit: a78dbad.

## What changed
- 178.1 `lib/proposal-panel.cjs`: selectPanel (negative primary, lowest attention, most unanswered objections, #20, decision-maker; 4–6), message protocol + caps (3 rounds, ≤ 2 msgs/round, ≤ 80 words), presenter citation checks, buildTranscript, unansweredQuestions, beforeAfter.
- 178.2 presenter-prompt.md (answers only from cited material, noAnswer) and panel-prompt.md (3 rounds).
- 178.3 workflow Step 10c with gates; engines relay (default, every host) and agent teams (opt-in, experimental); `--panel`; `deckMaterial` ids; buildBackstage accepts contentMap arrays.
- 178.4 report "Panel Q&A" section (chat transcript, unanswered, before/after) + summary.md + data.json.
- 178.5 docs + CHANGELOG 3.23.0.

## Follow-up
Reinstall 3.23.0 and run a live panel on viepilot-team-intro v2.
