# Phase 20 Specification — README auto-sync + donate section (FEAT-006)

## Metadata
- **Phase**: 20
- **Milestone**: M1.16
- **Request**: FEAT-006
- **Priority**: high
- **Status**: planned

## Objective
Implement automation that refreshes README project metrics using `cloc` during workflow execution and add a concise donate section with PayPal and MOMO links.

## Scope
1. Add README metric sync mechanism in selected workflow path (primary: `vp-auto`).
2. Add `cloc` fallback behavior for environments without the tool.
3. Update README template/content with a small donate section.
4. Add verification/test coverage for metric sync behavior.
5. Update docs to explain auto-sync behavior and prerequisites.

## Out of Scope
- Analytics dashboard for donation conversion.
- Replacing README metric block with remote telemetry.

## Success Criteria
- [ ] README LOC values can be auto-updated through workflow execution.
- [ ] Fallback behavior is explicit when `cloc` is unavailable.
- [ ] Donate section appears in README with user-provided links.
- [ ] Tests or verification commands guard against metric drift.
