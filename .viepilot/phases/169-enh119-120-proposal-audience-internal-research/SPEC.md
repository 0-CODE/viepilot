# Phase 169 Spec — ENH-119 + ENH-120: Purpose consult, audience intake, internal & research types

## Goal
vp-proposal starts by letting the user describe the purpose in their own words, reads it, says what
it understood and advises (type/variant, outline, duration, watch-outs), then asks only what is still
missing about the audience. From the audience profile it recommends a type + variant with a reason and
1–2 alternatives; the user confirms. Two new types run on a shared variant framework:
`internal-presentation` (5 variants) and `research-proposal` (5 variants). The profile also feeds
voice suggestion, duration default and persona selection; internal (21–25) and academic (26–30)
personas join the council, and research decks get extra criteria.

## Requests
- `.viepilot/requests/ENH-119.md` — internal type + audience intake + recommend/confirm + internal personas
- `.viepilot/requests/ENH-120.md` — free-text purpose consult + research type + academic personas/criteria

## Design decisions (user, via AUQ 2026-11-07)
- One type + variants per family (not separate types).
  - internal-presentation: `team-intro`, `leadership-report`, `feature-demo`, `training`, `all-hands`
  - research-proposal: `grant-proposal`, `kickoff`, `progress-report`, `defense`, `tech-transfer`
- Free text first → consult → AUQ only for missing groups (roles, decision maker, knowledge & size, format & goal).
- Recommend + user confirms; `--type` skips the recommendation but intake still feeds personas.
- Add internal and academic personas beyond the 20; #20 Humanity editor always runs; quick mode stays 6–8.
- Research criteria (novelty, rigor, feasibility/reproducibility) apply only to research-proposal.
- ENH-120 merged into this phase (same intake/recommend code path).

## Constraints
- Existing 4 types, `--type`, persona ids 1–20, RUBRIC and gate results for existing types unchanged.
- Workflow/SKILL text English-only (enh031 test). templates/ are shipped by the 3.16.1 installer.
- Free-text understanding is the LLM's job; code provides deterministic hints + gap detection only.
- Tests resilient: `>=` counts, no pinned version literals.

## Target Version
3.17.0 (MINOR)

## Tasks
| Task | Description | Complexity |
|------|-------------|------------|
| 169.1 | Variant framework + `internal-presentation` (5 variants) + `validateVariant` + stock template fallback | M |
| 169.2 | `research-proposal` type + 5 variants (incl. kickoff) on the framework | M |
| 169.3 | `lib/proposal-audience.cjs` (profile, recommend, voice/duration, `extractAudienceHints`, `findIntakeGaps`) + `purpose-consult-prompt.md` | L |
| 169.4 | Personas 21–25 (internal) + 26–30 (academic), research rubric R1–R3 + blocker, variant/role mapping in `selectPersonas` | M |
| 169.5 | Workflow purpose consult → gap-only intake → recommend/confirm; variant docs; flags; SKILL 0.4.0 | L |
| 169.6 | Resilient tests + CHANGELOG `[3.17.0]` + resolve ENH-119/120 | M |

## Dependencies
- Phase 165 (voice levels, DURATIONS), Phase 167 (persona council), hotfix 3.16.1 (installer ships templates/).

## Paths (planned)
- `lib/proposal-generator.cjs`
- `lib/proposal-audience.cjs` (new)
- `lib/proposal-review.cjs`
- `templates/proposal/review-personas.md`
- `templates/proposal/purpose-consult-prompt.md` (new)
- `workflows/proposal.md`
- `skills/vp-proposal/SKILL.md`
- `tests/unit/phase169-enh119-120-proposal-audience.test.js` (new)
- `tests/unit/phase167-enh117c-persona-review.test.js` (persona-count assert → `>=`)
- `CHANGELOG.md`, `package.json`, `package-lock.json`, `.viepilot/requests/ENH-119.md`, `.viepilot/requests/ENH-120.md`

## Verification
- [ ] `npx jest tests/unit/phase169-enh119-120-proposal-audience.test.js --no-coverage` → pass
- [ ] `npm test` → full suite green
- [ ] `node -e "const g=require('./lib/proposal-generator.cjs');['internal-presentation','research-proposal'].forEach(g.validateType)"`
- [ ] `node bin/vp-tools.cjs todo check --phase 169 --phase-complete` → exit 0
- [ ] version = 3.17.0
