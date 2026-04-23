# Phase 101 Spec — BUG-019: vp-tools scan-skills CLI not implemented

## Goal
Add the missing `scan-skills` subcommand to `bin/vp-tools.cjs`. The underlying `scanSkills()` function already exists in `lib/skill-registry.cjs` (shipped in FEAT-020 Phase 1, v2.26.0). Only the CLI routing and help text are missing.

## Scope
- `bin/vp-tools.cjs` — add `scan-skills` handler (calls `scanSkills()`) + help entry + usage line
- `skills/vp-brainstorm/SKILL.md` — fix line 168 reference (already accurate but verify)
- `skills/vp-crystallize/SKILL.md` — fix line 349 reference (already accurate but verify)
- Tests covering CLI smoke + output structure
- CHANGELOG [2.36.1] + version bump

## Out of Scope
- Changes to `lib/skill-registry.cjs` (logic already correct)
- Changes to `install-skill` (separate scope, works already)

## Version
Patch bump: 2.36.0 → 2.36.1 (bug fix, no new features)

## Tasks
- 101.1: Add `scan-skills` subcommand to bin/vp-tools.cjs
- 101.2: Fix SKILL.md references + tests + CHANGELOG + version 2.36.1
