# Phase 10: Gap E + Gap G Extended + Token Budget Awareness

## Goal
Three Tier 1 Post-MVP epics bundled: cross-project status aggregation, compliance keyword scan extension, and context limit preemption with HANDOFF write.

## Tasks

| # | Task | Complexity | File(s) |
|---|------|------------|---------|
| 10.1 | project-registry.json schema + vp-crystallize auto-register | S | `~/.viepilot/project-registry.json` schema, `workflows/crystallize.md` |
| 10.2 | vp-status skill — `--all` flag aggregate from registry | M | `skills/vp-status/SKILL.md`, `workflows/status.md` (if exists) |
| 10.3 | autonomous.md — Token budget awareness sub-task check | M | `workflows/autonomous.md` |
| 10.4 | HANDOFF.log — token_budget_warning event | S | `workflows/autonomous.md` |
| 10.5 | crystallize.md + autonomous.md — Gap G Extended keyword scan | S | `workflows/crystallize.md`, `workflows/autonomous.md` |
| 10.6 | Version bump 2.1.1 → 2.1.2 + CHANGELOG | S | `package.json`, `CHANGELOG.md`, `.viepilot/TRACKER.md` |

## Execution Order
10.1 → 10.2 → 10.3 → 10.4 → 10.5 → 10.6

## Acceptance Criteria
- [ ] `cat ~/.viepilot/project-registry.json` → project entry after crystallize
- [ ] `/vp-status --all` → multi-project aggregate table
- [ ] `grep -n 'token_budget' workflows/autonomous.md` → match in sub-task section
- [ ] crystallize on task with "stripe payment" in description → L3.block suggestion
- [ ] `node -p "require('./package.json').version"` → `2.1.2`

## Dependencies
- Phase 9 (Artifact Manifest) complete for vp-status to show manifest status per project

## Notes
Scaffolded by `/vp-evolve` on 2026-04-03.
Tasks 10.3 + 10.4 + 10.5 all touch `workflows/autonomous.md` — must be sequential.
Tasks 10.1 + 10.5 touch `workflows/crystallize.md` — must be sequential with Phase 9 crystallize tasks.
