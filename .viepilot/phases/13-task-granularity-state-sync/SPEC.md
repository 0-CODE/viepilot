# Phase 13 Specification - Detailed Task Decomposition + Real-time State Sync

## Metadata
- **Phase**: 13
- **Milestone**: M1.10 - Execution Trace Reliability
- **Request**: ENH-010
- **Priority**: critical
- **Status**: planned

## Objective
Harden implementation workflows so tasks are decomposed with execution-grade detail and project state is updated immediately per task/sub-task to preserve traceability during interruptions.

## Scope
1. Enforce detailed task contract in `workflows/autonomous.md`.
2. Enforce per-task/per-sub-task state sync (`PHASE-STATE`, `TRACKER`, `HANDOFF`, and `ROADMAP` when relevant).
3. Add/upgrade reusable task template for implementation-heavy work.
4. Extend `workflows/audit.md` to detect delayed batch-only state updates.

## Out of Scope
- Rewriting old historical phases to new template.
- Full automation of every state repair scenario from legacy projects.

## Tasks

### 13.1 Detailed task contract
- Require task objective, exact file paths, per-file description, best-practice checklist, and verification steps before implementation starts.
- Reject vague task definitions in autonomous flow.

### 13.2 Incremental state sync contract
- After each PASS task/sub-task, update:
  - `.viepilot/phases/*/PHASE-STATE.md`
  - `.viepilot/TRACKER.md`
  - `.viepilot/HANDOFF.json`
  - `.viepilot/ROADMAP.md` when progress status changes
- Add "state-first then continue" rule.

### 13.3 Reusable implementation task template
- Update/add template section with:
  - Paths
  - Implementation Notes
  - Best Practices to Apply
  - Do/Don't
  - Verification Commands + Expected Output
  - State Update Checklist

### 13.4 Audit anti-pattern detection
- Add checks for:
  - missing per-task progress updates
  - state files only updated at phase end
  - absent checkpoint evidence for long-running tasks

## Acceptance Criteria
- [ ] Autonomous workflow blocks execution when task spec lacks required details.
- [ ] State files are updated after each PASS task/sub-task, not only at phase end.
- [ ] Implementation template is available and referenced by execution workflows.
- [ ] Audit can flag delayed/batch-only state updates.

## Verification Plan
- Simulate one phase run with 2+ sub-tasks and validate incremental state updates.
- Interrupt mid-task and verify resume accuracy from `HANDOFF.json`.
- Run `/vp-audit --report` and confirm anti-pattern checks appear when applicable.

## Risks
- Increased process overhead if template is too verbose.
- False positives in audit for small quick fixes.

## Mitigations
- Keep template concise but mandatory for implementation tasks.
- Add threshold-based heuristics in audit (skip strict checks for trivial one-file micro-tasks).
