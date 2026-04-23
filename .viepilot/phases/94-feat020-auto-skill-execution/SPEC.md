# Phase 94 — FEAT-020 vp-auto Silent Skill Execution

## Goal
Update `workflows/autonomous.md` to read `## Skills` from `PROJECT-CONTEXT.md` at session start and inject skill best practices per task context — silently, without prompting user. Tests + v2.30.0.

## Feature
**FEAT-020 Phase 5** — Skill Registry System

## Version Target
**2.30.0** (MINOR bump from 2.29.0)

## Tasks

| Task | File | Description | Complexity |
|------|------|-------------|------------|
| 94.1 | `workflows/autonomous.md` | Add skill context load step at init + per-task skill context injection rule | M |
| 94.2 | `skills/vp-auto/SKILL.md` | Document silent skill execution (reads PROJECT-CONTEXT.md ## Skills, no re-ask) | S |
| 94.3 | `tests/unit/autonomous-skill-execution.test.js` + CHANGELOG + version bump | ≥8 contract tests; [2.30.0] in CHANGELOG; package.json = "2.30.0" | S |

## Dependencies
- Phase 93 ✅ (`PROJECT-CONTEXT.md ## Skills` lock from crystallize)
- Phase 90 ✅ (`lib/skill-registry.cjs` — `loadRegistry()` for best practices lookup)

## Key Behavior
- **Init step** (after loading TRACKER/ROADMAP): read `PROJECT-CONTEXT.md ## Skills`
  - If section absent → silent no-op; no error
  - If present → build `SKILL_CONTEXT_MAP`: `{ required: [{id, phases, best_practices}], optional: [...] }`
- **Per-task injection rule** (before executing each task):
  - Check if task's phase number matches any skill's `phases` field
  - For matching required skills: prepend best_practices block to execution context
  - For optional skills: include only if capabilities match task signals
  - **Never prompt user** — all decisions came from crystallize lock
- **Output**: task output records `skills_applied: [id@version, ...]`

## Acceptance Criteria
- [ ] `workflows/autonomous.md` has skill context load step at initialization
- [ ] Per-task skill injection rule documented (phase match + silent apply)
- [ ] Absent `## Skills` section → graceful no-op (no crash, no warning)
- [ ] `skills/vp-auto/SKILL.md` updated with FEAT-020 execution docs
- [ ] `npm test` passes with ≥8 new tests green
- [ ] FEAT-020 fully complete across all 5 phases (90–94)
