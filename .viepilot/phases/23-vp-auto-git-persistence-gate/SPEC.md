# Phase 23 Specification — `/vp-auto` git persistence gate (BUG-003)

## Metadata
- **Phase**: 23
- **Milestone**: M1.19
- **Request**: BUG-003
- **Priority**: high
- **Status**: complete

## Objective
Enforce consistent commit/push guarantees in `/vp-auto` so task/phase completion cannot proceed without durable git persistence.

## Scope
1. Define mandatory git persistence checkpoints for PASS task and phase completion.
2. Add explicit fail-fast behavior when commit/push fails.
3. Ensure state files (`PHASE-STATE`, `TRACKER`, `HANDOFF`) cannot drift ahead of git persistence.
4. Update docs/skill instructions for commit/push guarantees.
5. Add tests or verification hooks for persistence gate behavior.

## Out of Scope
- Rewriting historical runs that already missed commits.
- Changing repository-level branch protection settings.

## Success Criteria
- [x] PASS task cannot be marked done if required commit/push has not succeeded.
- [x] Phase complete cannot be marked without expected git persistence checks.
- [x] Clear control-point path exists for commit/push failures.
- [x] Documentation reflects deterministic commit/push behavior.
