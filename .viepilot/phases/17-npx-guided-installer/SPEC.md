# Phase 17 Specification — Guided NPX installer (FEAT-003)

## Metadata
- **Phase**: 17
- **Milestone**: M1.14
- **Request**: FEAT-003
- **Priority**: high
- **Status**: complete

## Objective
Enable user-friendly installation through `npx viepilot install` with guided target selection and profile-specific setup for Claude Code, Cursor Agent, and Cursor IDE.

## Scope
1. Add npm CLI entrypoint so `npx viepilot` works as expected.
2. Implement guided install flow with interactive target menu.
3. Provide non-interactive flags for automation.
4. Integrate with existing shell installers without breaking current behavior.
5. Document the new onboarding flow.

## Out of Scope
- Replacing every legacy script path in one step.
- Cloud installer service or remote provisioning.

## Success Criteria
- [x] `npx viepilot install` available and documented.
- [x] Guided target selection for Claude Code, Cursor Agent, Cursor IDE.
- [x] Profile-specific setup logic and validation checks.
- [x] Non-interactive mode works for scripted installs.
- [x] Backward compatibility with existing install scripts.
