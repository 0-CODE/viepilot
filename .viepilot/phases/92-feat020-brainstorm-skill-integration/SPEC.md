# Phase 92 — FEAT-020 Brainstorm UI-Direction Skill Integration

## Goal
Update `workflows/brainstorm.md` to silently load skill registry, match skills by capabilities to UI signals, apply best practices to HTML generation, and record `## skills_used` in notes.md. Tests + v2.28.0.

## Feature
**FEAT-020 Phase 3** — Skill Registry System

## Version Target
**2.28.0** (MINOR bump from 2.27.0)

## Tasks

| Task | File | Description | Complexity |
|------|------|-------------|------------|
| 92.1 | `workflows/brainstorm.md` | Add skill registry load step + UI signal → capability matching + silent apply + `## skills_used` in notes.md | M |
| 92.2 | `skills/vp-brainstorm/SKILL.md` | Document skill integration behavior (silent apply, skills_used, FEAT-020) | S |
| 92.3 | `tests/unit/brainstorm-skill-integration.test.js` + CHANGELOG + version bump | ≥10 contract tests; [2.28.0] in CHANGELOG; package.json = "2.28.0" | S |

## Dependencies
- Phase 90 ✅ (`lib/skill-registry.cjs` — `loadRegistry()`)
- Phase 91 ✅ (skills can be installed and scanned)

## Key Behavior
- Triggered only when UI Direction Mode is active (UI signals present)
- Loads `~/.viepilot/skill-registry.json` via `loadRegistry()`
- Matches skills where `capabilities` intersects UI signal set (e.g., `ui-generation`, `component-design`)
- **Silent**: no banner, no prompt — best practices included automatically in HTML generation
- Records matched skills in `notes.md ## skills_used` (YAML format, same schema as FEAT-020 brainstorm session)

## Acceptance Criteria
- [ ] `workflows/brainstorm.md` has skill registry load step in UI Direction section
- [ ] Signal-to-capability matching logic documented
- [ ] `## skills_used` YAML schema in notes.md specified
- [ ] Silent apply rule explicit (no prompt to user)
- [ ] `skills/vp-brainstorm/SKILL.md` updated with FEAT-020 integration docs
- [ ] `npm test` passes with ≥10 new tests green
