# Phase 167 Spec — ENH-117c: Persona Review Council (20 personas, strict rubric)

## Goal
Before hand-off, every proposal is reviewed by a council of audience personas running as independent
subagents. A library of 20 fixed personas; each run picks 6–8 by context, and persona #20
"Biên tập viên Tính người" **always** runs — humanity is always scored. Strict rubric with blockers.
The orchestrator synthesizes feedback into Keep / Improve / Reject with reasons, rewrites only the
Improve slides, re-scores, **max 2 rounds**, then asks the user via AskUserQuestion.

## Request
- `.viepilot/requests/ENH-117.md` (part c of 3)

## Design decisions (user, via AUQ 2026-11-07)
- 20 fixed personas, 6–8 selected per run; #20 always included.
- Max 2 improvement rounds, then AUQ with the scoreboard.
- Persona prompts ship under `templates/` (agents/ is not in the npm `files` list on this branch).

## Rubric (scale 1–5, every score must cite a slide + quote; vague feedback is discarded)
| Code | Criterion | Pass threshold |
|---|---|---|
| H1 | Humanity — natural voice, first person, real moments, varied rhythm, 0 blacklisted clichés | avg ≥ 4.0 and no persona < 3 |
| H2 | Maker's voice & pride backed by evidence, matching chosen Voice level | avg ≥ 4.0 |
| C1 | Key message memorable after 24h (persona restates it in 1 sentence) | avg ≥ 4.0 |
| C2 | Fit to audience | avg ≥ 3.5 |
| C3 | Evidence & numbers sourced or labelled estimate | avg ≥ 4.0 |
| C4 | Narrative arc & structure | avg ≥ 3.5 |
| C5 | Concrete, doable CTA | avg ≥ 4.0 |
| C6 | Script speakable: fits duration aloud, spoken style, digits kept | avg ≥ 4.0 |
| C7 | Design & animation serve the content | avg ≥ 3.5 |
| C8 | Anticipates objections / hard questions | avg ≥ 3.5 |
Blockers (any persona → fail): false claim, fabricated anecdote without Story Brief material,
over-reaching legal/security promise, slide without script, slide without animation.

## Target Version
3.16.0 (MINOR)

## Tasks
| Task | Description | Complexity |
|------|-------------|------------|
| 167.1 | `templates/proposal/review-personas.md` (20 cards + audience mapping + rubric) + `lib/proposal-review.cjs` `loadPersonas`, `selectPersonas`, `RUBRIC`, `evaluateGate` | L |
| 167.2 | `templates/proposal/persona-review-prompt.md` (subagent contract, JSON output) + `synthesizeFeedback` (Keep/Improve/Reject, weights, #20 veto) + `buildReviewReport` | M |
| 167.3 | Workflow Review step: parallel subagents, ≤ 2 rounds, rewrite Improve slides only, AUQ scoreboard + final "does this sound like you" AUQ; `--review off|quick|full`; SKILL.md | L |
| 167.4 | Resilient tests + CHANGELOG `[3.16.0]` + ENH-117 resolution | S |

## Dependencies
- Phase 165 (voice, clichés, script validator), Phase 166 (animation validator for blockers).

## Paths (planned)
- `templates/proposal/review-personas.md` (new)
- `templates/proposal/persona-review-prompt.md` (new)
- `lib/proposal-review.cjs` (new)
- `workflows/proposal.md`
- `skills/vp-proposal/SKILL.md`
- `tests/unit/phase167-enh117c-persona-review.test.js` (new)
- `CHANGELOG.md`, `package.json`, `.viepilot/requests/ENH-117.md`

## Verification
- [ ] `npx jest tests/unit/phase167-enh117c-persona-review.test.js --no-coverage` → pass
- [ ] `npm test` → full suite green
- [ ] `node -e "const r=require('./lib/proposal-review.cjs');if(r.loadPersonas().length<20)process.exit(1)"`
