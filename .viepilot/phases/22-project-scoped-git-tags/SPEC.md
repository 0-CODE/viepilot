# Phase 22 Specification — Project-scoped checkpoint tag strategy (BUG-002)

## Metadata
- **Phase**: 22
- **Milestone**: M1.18
- **Request**: BUG-002
- **Priority**: high
- **Status**: planned

## Objective
Prevent checkpoint tag collisions across different projects by introducing deterministic project-scoped git tag prefixes while preserving compatibility with existing tags.

## Scope
1. Define a stable project slug source (repo name or normalized project root name).
2. Update tag creation flow to use project-scoped naming.
3. Update checkpoint listing/filtering and recovery flows to understand the new format.
4. Preserve backward compatibility with legacy `vp-*` tags.
5. Update docs and examples for new tag convention.

## Out of Scope
- Rewriting historical tags automatically.
- Cross-repo remote tag migration tooling.

## Success Criteria
- [ ] New tags include project prefix and avoid generic collisions.
- [ ] Checkpoint commands work with both old and new tag formats.
- [ ] Recovery/rollback docs reflect new naming strategy.
- [ ] No regression in `/vp-auto` checkpoint lifecycle.
