# Phase 2: Execution Engine — vp-auto Rewrite

## Overview
- **Goal**: Refactor `workflows/autonomous.md` thành typed state machine với 3-layer recovery, continuous HANDOFF, parallel loading, và scope enforcement
- **Dependencies**: Phase 1 (v2 template schemas phải stable)
- **Estimated Tasks**: 9

## Objective

`workflows/autonomous.md` hiện tại là 468+ dòng prose — AI phải re-read toàn bộ mỗi lần, không có typed state machine, recovery là 1 tầng, context load sequential.

Phase này refactor autonomous.md thành:
- Typed state transitions với named states
- 3-layer silent recovery với budget enforcement
- Continuous HANDOFF.json + HANDOFF.log writes
- Parallel batch context loading
- Scope contract + drift detection
- 3-tier validation pipeline

## Scope

### In Scope
- `workflows/autonomous.md` (major rewrite)
- `workflows/autonomous.md` compliance domain pre-flight (Gap G partial)
- HANDOFF.log rotation hook (trong autonomous.md)

### Out of Scope
- Skill files vp-auto/SKILL.md (Phase 3)
- crystallize/evolve integration (Phase 3)
- vp-resume/vp-status updates (Phase 3)

## Requirements

### Functional
- **Recovery layers**: L1 (lint/format) → L2 (targeted test fix) → L3 (scope reduce) — silent until budget exhausted
- **Budget enforcement**: Parse `recovery_budget` từ TASK.md; default = M nếu missing; enforce caps
- **recovery_overrides**: Check TASK.md `recovery_overrides.L3.block`; skip L3 nếu true
- **Gap G pre-flight**: Before executing task, check write_scope paths; if compliance domain → log "[COMPLIANCE] L3 blocked"; if compliance but no block set → WARN
- **HANDOFF.json**: Write sau mỗi sub-task complete (không chỉ on session stop)
- **HANDOFF.log**: Append JSON event sau mỗi: task_start, l1_recovery, l2_recovery, l3_recovery, control_point, task_pass, task_skip
- **Parallel loading**: All context reads (TRACKER + HANDOFF + PHASE-STATE + TASK) in 1 batch turn
- **Static boundary**: AI-GUIDE + SYSTEM-RULES cached after first read; not re-read per task
- **Validation pipeline**: 1. contract check → 2. write_scope lock verify → 3. git gate (strict order)
- **Scope drift**: Post-task: verify AI writes vs declared write_scope; log violation; escalate to control_point
- **Control point**: Set HANDOFF.json.control_point.active = true when surfacing to user

### Non-Functional
- Existing vp-auto behavior preserved for v1 projects (no TASK.md new fields → defaults apply)
- autonomous.md vẫn là Markdown với XML process tags (không TypeScript)

## Acceptance Criteria
- [ ] All 9 tasks PASS
- [ ] Silent recovery fires on lint error (verified: user không thấy failure)
- [ ] HANDOFF.json written sau mỗi sub-task (verified: 3 sub-tasks = 3 writes)
- [ ] HANDOFF.log has events (verified: task_start + task_pass at minimum)
- [ ] Compliance path task: L3 attempt count = 0 (scope reduce never tried)
- [ ] Context load: all 4 files read in 1 turn (verified by tool call inspection)
- [ ] Scope drift: write outside write_scope → control_point (not silently allowed)

## Technical Notes

### State Transitions
```
not_started → executing → [recovering_l1] → [recovering_l2] → [recovering_l3] → pass
                        → [recovering_l1] → [recovering_l2] → control_point
                        → skip
```

### Recovery Budget Defaults (when TASK.md missing field)
```
default_budget: M  # 1 L1 attempt, 2 L2 attempts, 0 L3 attempts
```

## References
- Architecture: `.viepilot/ARCHITECTURE.md` (Data Flow diagram)
- Context: `.viepilot/PROJECT-CONTEXT.md` → Key Concepts
- Rules: `.viepilot/SYSTEM-RULES.md` → Quality Gates
- Brainstorm: `docs/brainstorm/session-2026-04-02.md` → Topics 2, 5, 8, 9, 10, 11, 16
