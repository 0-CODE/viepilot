# Phase 166 Spec — ENH-117b: Mandatory slide animation

## Goal
Every generated deck has animation (user decision: **animation is mandatory**). Each slide gets a
transition; every content slide gets click-by-click builds aligned with the `[click]` cues in the
spoken notes (Phase 165). Animation stays restrained and serves the story.

## Request
- `.viepilot/requests/ENH-117.md` (part b of 3)

## Constraint discovered
`pptxgenjs` 3.12.0 has no transition/animation API. Animation is injected by post-processing the
.pptx: unzip with `jszip`, add `<p:transition>` and `<p:timing>` into `ppt/slides/slideN.xml`, re-zip.
`jszip` is today only a transitive dependency of pptxgenjs → declare it directly in `package.json`.

## Target Version
3.15.0 (MINOR)

## Tasks
| Task | Description | Complexity |
|------|-------------|------------|
| 166.1 | `lib/pptx-animate.cjs` (new): presets, `applyAnimations()`, `validatePptxAnimations()`; add `jszip` to dependencies | L |
| 166.2 | Manifest `animation` schema + mandatory Animation step in `workflows/proposal.md` (fail loudly, never skip) + `[click]` alignment with notes | M |
| 166.3 | Tests that build a real pptx with pptxgenjs → animate → unzip and assert XML; optional LibreOffice open check; CHANGELOG `[3.15.0]` | M |

## Dependencies
- Phase 165 ✅ (spoken notes with `[click]` cues).
- Phase 168 (ENH-118 todo mirror) — executed before this phase; run under its gates.

## Paths (planned)
- `lib/pptx-animate.cjs` (new)
- `workflows/proposal.md`
- `package.json` (dependency `jszip`, version)
- `tests/unit/phase166-enh117b-pptx-animation.test.js` (new)
- `CHANGELOG.md`

## Verification
- [ ] `npx jest tests/unit/phase166-enh117b-pptx-animation.test.js --no-coverage` → pass
- [ ] `npm test` → full suite green
- [ ] `node -p 'require("./package.json").dependencies.jszip'` → defined
