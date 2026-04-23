# Phase 21 Specification — README metric realign + `.viepilot` repository hygiene (ENH-013)

## Metadata
- **Phase**: 21
- **Milestone**: M1.17
- **Request**: ENH-013
- **Priority**: high
- **Status**: planned

## Objective
Realign `README.md` project metrics to current source of truth and apply repository hygiene by ignoring `.viepilot` for future commits while untracking it from git index without deleting local data.

## Scope
1. Recompute and sync README metrics with the established project script/flow.
2. Add durable verification steps so metric updates remain repeatable.
3. Add ignore rule for `.viepilot` at repository level.
4. Remove `.viepilot` from tracked index while preserving local files.
5. Update docs/changelog/tracker references related to this change.

## Out of Scope
- Deleting local `.viepilot` artifacts.
- Changing historical commits that already contain `.viepilot`.

## Success Criteria
- [ ] `README.md` metrics reflect current project state after sync.
- [ ] Metric sync command/verification is documented and reusable.
- [ ] `.viepilot` is ignored for subsequent commits.
- [ ] `.viepilot` is no longer tracked in git index.
