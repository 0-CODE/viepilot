# Phase 77 — ENH-047 Gaps A+B+C: Brownfield Multi-Repo, Submodules & Per-Module Gap Detection

## Goal
Extend the Phase 75 brownfield scanner to handle three previously missing scenarios:

**Gap A — Git submodule detection**
Read `.gitmodules`, enumerate submodule paths + URLs, run Signal Cat 1–4 per submodule,
record `type: submodule` + `initialized` flag in `modules[]`.

**Gap B — Polyrepo / multi-repo detection**
Detect signals that the current repo is part of a larger multi-repo system:
docker-compose relative `build:`/`context:` paths, `file:../` deps, CI cross-repo clones,
README external repo links. Output `polyrepo_hints[]` + fire an optional user prompt to
supply `related_repos[]`.

**Gap C — Per-module gap detection**
Every `modules[]` entry must carry its own `gap_tier` (DETECTED/ASSUMED/MISSING),
`must_detect_status{}` (evidence per MUST-DETECT field), and `open_questions[]`.
Root gap tier = worst tier across all modules. MISSING module → pause-and-ask.

## Version
2.13.0 → **2.14.0**

## Dependencies
Phase 75 ✅ (FEAT-018 — base brownfield scanner)
Phase 76 ✅ (ENH-046 — forge-agnostic parser)

## Affected Files
- `workflows/crystallize.md` (all 3 tasks)
- `skills/vp-crystallize/SKILL.md` (Task 77.3)
- `tests/unit/vp-enh047-multi-repo.test.js` (Task 77.4 — new)
- `CHANGELOG.md` (Task 77.4)
- `package.json` (Task 77.4)

## Tasks

### Task 77.1 — Gap A: Git Submodule Detection
Extend Signal Category 1 monorepo section: add `.gitmodules` parsing block + submodule
scan loop. Extend Scan Report schema: `type` field on module entries; `submodule_url`;
`initialized` flag. Safety rule: read-only, no `git submodule update`.

### Task 77.2 — Gap B: Polyrepo Hints + Prompt
After Signal Cat 1 runs: add a new **Polyrepo Detection** subsection. Define the 6 signal
sources (docker-compose, package.json `file:../`, CI workflows, README/CONTRIBUTING,
Makefile). Output `polyrepo_hints[]` + `related_repos[]` in schema. Define the interactive
prompt rule and the gap-fill fallback (ASSUMED when hints exist but user skips).

### Task 77.3 — Gap C: Per-Module Gap Detection + SKILL.md
Replace the flat `modules[]` aggregate with entries that each carry:
- `gap_tier: DETECTED | ASSUMED | MISSING`
- `must_detect_status: { field: { value, source, tier } }`
- `open_questions: []`

Add root rollup rule: `root gap_tier = max(module gap_tiers)`.
Add pause-and-ask rule: any module with `gap_tier: MISSING` blocks artifact generation.
Update `skills/vp-crystallize/SKILL.md` to document the new per-module fields.

### Task 77.4 — Tests + CHANGELOG 2.14.0
Write `tests/unit/vp-enh047-multi-repo.test.js` with ≥8 tests across Gaps A, B, C.
Update `CHANGELOG.md` with `[2.14.0]` section. Bump `package.json` to `2.14.0`.

## Acceptance Criteria (Phase-level)
- [ ] `.gitmodules` parsing documented; submodule entries in `modules[]` with `type: submodule`
- [ ] Safety: "never run `git submodule update`" explicitly stated
- [ ] `polyrepo_hints[]` field in Scan Report schema with 6 signal sources documented
- [ ] Interactive prompt rule for polyrepo defined
- [ ] Every `modules[]` entry has `gap_tier`, `must_detect_status{}`, `open_questions[]`
- [ ] Root gap tier rollup rule documented
- [ ] Per-module MISSING → pause-and-ask rule documented
- [ ] `skills/vp-crystallize/SKILL.md` reflects Gaps A+B+C
- [ ] ≥8 tests passing
- [ ] CHANGELOG `[2.14.0]` present; `package.json` = `"2.14.0"`
