# Phase 4: Verification & Documentation

## Overview
- **Goal**: Integration testing, user docs update, stale reference audit, version bump to 2.0.0
- **Dependencies**: Phase 1, 2, 3 (all complete)
- **Estimated Tasks**: 11

## Objective

Verify toàn bộ v2 features hoạt động end-to-end. Update tất cả user-facing docs để phản ánh v2 behavior. Clean up stale file references. Release v2.0.0.

## Scope

### In Scope
- Integration testing: 4 test scenarios
- User docs: autonomous-mode.md, quick-start.md, advanced-usage.md
- CHANGELOG.md v2.0.0 entry
- Stale reference audit: skills/ + workflows/
- Version bump: 2.0.0
- Git tag: v2.0.0

### Out of Scope
- New features (all deferred to Post-MVP or v2.1.x)
- Architecture changes

## Requirements

### Integration Test Scenarios

**4.1a — Small project (S/M)**:
- Create fresh test project with brainstorm → crystallize → auto
- At least 1 S task + 1 M task
- Force lint error on M task → verify silent L1 recovery fires
- Verify: user không thấy failure; task PASS; HANDOFF.log has l1_recovery event

**4.1b — Large project (L/XL)**:
- Multi-phase test project (2+ phases, 6+ tasks)
- Context reset simulation between phases
- Verify HANDOFF.json continuity (position correct after reset)
- Verify scope lock (attempt write outside write_scope → control_point)

**4.1c — Context reset**:
- Start task, kill session mid-task (simulate crash)
- `/vp-resume` → verify resume from exact sub-task position
- Tier: >30min gap → standard restore

**4.1d — Compliance domain**:
- Create task with `write_scope: ["src/auth/"]`
- Force L3 condition (scope reduce needed)
- Verify: L3 attempt count = 0 in HANDOFF.log; control_point triggered instead

### Documentation Requirements
- autonomous-mode.md: explain 3 recovery layers, control point protocol, scope contract
- quick-start.md: TASK.md v2 fields (type/write_scope/recovery_budget), TRACKER.md new structure
- advanced-usage.md: recovery_overrides examples, write_scope pattern examples, HANDOFF.log rotation

### Stale Reference Audit
- Check all `skills/vp-*/SKILL.md` files: no references to old file paths
- Check all `workflows/*.md` files: template paths still valid, .viepilot/ paths correct
- Automated: `grep -r "templates/" skills/ workflows/` → verify all paths exist

### Version Bump
- CHANGELOG.md: `[Unreleased]` → `[2.0.0] - {date}`
- TRACKER.md: Version 2.0.0-alpha → 2.0.0
- README.md: version reference if present
- git tag v2.0.0

## Acceptance Criteria
- [ ] 4.1a PASS: silent recovery fires (user không thấy failure)
- [ ] 4.1b PASS: HANDOFF continuity + scope lock verified
- [ ] 4.1c PASS: resume from exact sub-task position
- [ ] 4.1d PASS: compliance L3 block verified
- [ ] autonomous-mode.md updated
- [ ] quick-start.md updated (runnable by Day 1 user)
- [ ] advanced-usage.md updated
- [ ] CHANGELOG.md v2.0.0 complete
- [ ] Zero stale references
- [ ] git tag v2.0.0 created

## Technical Notes

### Test Project for 4.1a/4.1b
Create minimal test project in `tests/` or temp directory:
```bash
mkdir /tmp/viepilot-test && cd /tmp/viepilot-test && git init
# Run /vp-brainstorm → /vp-crystallize → /vp-auto
```

Do NOT create test files trong viepilot repo itself (tidak contaminate framework code).

## References
- Architecture: `.viepilot/ARCHITECTURE.md`
- All previous phase SPECs
- Brainstorm: `docs/brainstorm/session-2026-04-02.md` → Topic 17 (persona simulation findings)
