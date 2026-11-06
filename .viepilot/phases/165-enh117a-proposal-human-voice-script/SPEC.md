# Phase 165 Spec — ENH-117a: vp-proposal Human Voice + spoken script

## Goal
Make `/vp-proposal` output sound like a real product maker talking. Replace the prompt rules that
force robotic output, add a user-chosen **Voice Profile** (1–4) and a **Story Brief** of real material,
and make every deck ship with a **spoken script**. Speaker notes are full spoken words in spoken style:
short sentences, line breaks at breath points, **numbers kept as digits** (`96%`, never
"chín mươi sáu phần trăm"). A separate script file adds timing, transitions and Q&A, in 5, 15 and 30
minute versions.

## Request
- `.viepilot/requests/ENH-117.md` (part a of 3 — phases 165–167)

## Branch / numbering
- Branch `from-3.12.2` (parallel line from 3.12.2). Phases 165–167 chosen to avoid collision with
  main's phases 152–164 still on disk. Version line on this branch: 3.12.2 → 3.13.0.

## Root causes being fixed (from `workflows/proposal.md` prompt contract)
1. Rule `AVOID filler phrases: … "We believe" …` bans first-person maker voice.
2. Every bullet "8–15 words, starts with an action verb" → uniform, machine rhythm.
3. TONE is binary (`precise and data-driven` | `clear and persuasive`).
4. Quality brief gathers CTA/budget/timeline only — no human material, so the AI invents generic text.
5. Fixed slide skeleton with no narrative arc.
6. Speaker notes are a 4-part formula, not a script; no timing.
7. Step numbering out of order (Step 2C placed after 3b); skill banner `v0.1.0 (fw 2.19.0)`.

## Existing infrastructure to REUSE
- `lib/proposal-generator.cjs` — `PROPOSAL_TYPES`, `buildLangInstruction`, `selectDesignConfig`.
- `docx` + `pptxgenjs` (`slide.addNotes()` exists in pptxgenjs 3.12 types).
- Existing proposal tests (`tests/unit/vp-enh039…045*`, `vp-proposal-contracts.test.js`) — must stay green;
  update any assertion that pinned the removed "We believe" rule rather than deleting coverage.

## Target Version
3.13.0 (MINOR — additive behavior in vp-proposal)

## Tasks
| Task | Description | Complexity |
|------|-------------|------------|
| 165.1 | `templates/proposal/prompt-contract.md` (new) + `lib/proposal-generator.cjs`: `VOICE_LEVELS`, `AI_CLICHE_BLACKLIST` (vi+en), `buildVoiceInstruction()`, `detectCliches()`, `loadPromptContract()` | M |
| 165.2 | `workflows/proposal.md` restructure: sequential steps, Voice Profile + Story Brief steps (AUQ), new content rules, narrative arc per type, manifest `voice`/`story` fields | L |
| 165.3 | `lib/proposal-script.cjs` (new): spoken-notes validator + script builder (5/15/30 min) + workflow steps writing notes into .pptx and `-script.md`/`-script.docx` | M |
| 165.4 | `skills/vp-proposal/SKILL.md` flags `--voice`, `--duration` + banner/version; resilient contract tests; CHANGELOG `[3.13.0]` + version bump via changelog-agent | S |

## Dependencies
- Phase 151 ✅ (branch base). ENH-039/040/045 behavior preserved.
- Anchor: `feedback_resilient_page_count_asserts` — assert `>= N`, never `== N`; run full `npm test`.

## Paths (planned)
- `templates/proposal/prompt-contract.md` (new)
- `lib/proposal-generator.cjs`
- `lib/proposal-script.cjs` (new)
- `workflows/proposal.md`
- `skills/vp-proposal/SKILL.md`
- `tests/unit/phase165-enh117a-human-voice.test.js` (new)
- `CHANGELOG.md`, `package.json`

## Verification
- [ ] `npx jest tests/unit/phase165-enh117a-human-voice.test.js --no-coverage` → all pass
- [ ] `npm test` → full suite green (no new failures)
- [ ] `grep -c '"We believe"' workflows/proposal.md` → 0 as a banned phrase
- [ ] `node -p 'require("./package.json").version'` → `3.13.0`
