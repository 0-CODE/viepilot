# Phase 93 — FEAT-020 Crystallize Skill Decision Gate

## Goal
Add skill decision gate to `workflows/crystallize.md`: read `## skills_used` from brainstorm notes.md → AUQ confirm required vs optional → write `## Skills` section to `PROJECT-CONTEXT.md`. Tests + v2.29.0.

## Feature
**FEAT-020 Phase 4** — Skill Registry System

## Version Target
**2.29.0** (MINOR bump from 2.28.0)

## Tasks

| Task | File | Description | Complexity |
|------|------|-------------|------------|
| 93.1 | `workflows/crystallize.md` | Add skill gate step: read notes.md `## skills_used` → AUQ confirm → write `## Skills` to PROJECT-CONTEXT.md | M |
| 93.2 | `templates/project/PROJECT-CONTEXT.md` | Add `## Skills` section template with required/optional/phases/rationale columns | S |
| 93.3 | `skills/vp-crystallize/SKILL.md` | Document skill gate behavior (AUQ, lock semantics, PROJECT-CONTEXT.md ## Skills) | S |
| 93.4 | `tests/unit/crystallize-skill-gate.test.js` + CHANGELOG + version bump | ≥10 contract tests; [2.29.0] in CHANGELOG; package.json = "2.29.0" | S |

## Dependencies
- Phase 92 ✅ (`## skills_used` in brainstorm notes.md)
- ENH-048 ✅ (AUQ integration)
- ENH-059 ✅ (AUQ ToolSearch preload)

## Key Behavior
- New step in crystallize: **after scope lock, before SPEC generation**
- If no `## skills_used` in notes.md → step is silently skipped (no-op)
- If skills found → AUQ presents list: `required` | `optional` | `exclude`
- Decision written to `PROJECT-CONTEXT.md ## Skills`:

```markdown
## Skills

| Skill | Source | Required | Phases | Rationale |
|-------|--------|----------|--------|-----------|
| frontend-design | npm:@vp-skills/frontend-design | required | 1, 2 | UI-Direction HTML generation |
```

- **Lock semantics**: decision is final; vp-auto reads this and never re-asks

## Acceptance Criteria
- [ ] `workflows/crystallize.md` has skill gate step (after scope lock)
- [ ] Gate is silently skipped when no `## skills_used` in notes.md
- [ ] AUQ spec for required/optional/exclude selection documented
- [ ] `## Skills` table format documented
- [ ] `templates/project/PROJECT-CONTEXT.md` updated with `## Skills` template section
- [ ] `skills/vp-crystallize/SKILL.md` updated with FEAT-020 gate docs
- [ ] `npm test` passes with ≥10 new tests green
