# Task 13.3: AI-GUIDE template + autonomous-mode.md — delegate merge checklist

## Meta
- **Phase**: 13-agent-orchestration-tier-ab
- **Status**: complete
- **Complexity**: S
- **Dependencies**: 13.2
- **Git Tag**: `viepilot-vp-p13-t13.3`

## Task Metadata

```yaml
type: docs
complexity: S
write_scope:
  - templates/project/AI-GUIDE.md
  - docs/user/features/autonomous-mode.md
recovery_budget: S
can_parallel_with: []
recovery_overrides:
  L1: { block: false }
  L2: { block: false }
  L3: { block: false, reason: "" }
```

## Objective
Document for consumer projects: how **main** agent merges delegate results — read `delegates/done/{id}.json` only; default delegates are **read-only**; writes require subset `write_scope` + post-merge `git diff` vs envelope; do not paste long worker transcripts into task context.

## Paths
```yaml
files_to_create: []
files_to_modify:
  - templates/project/AI-GUIDE.md
  - docs/user/features/autonomous-mode.md
```

## Acceptance Criteria
- [x] AI-GUIDE template contains a **Delegate handoff (Tier B)** subsection.
- [x] autonomous-mode.md cross-links templates and vp-auto behavior.

## Verification
```yaml
manual:
  - description: "Grep Delegate|delegates in both files"
    required: true
```

## State Update Checklist
- [x] PHASE-STATE / TRACKER / HANDOFF per protocol

## Implementation Notes
- `AI-GUIDE.md`: Quick Lookup row → `.viepilot/delegates/README.md`; new subsection after Dynamic boundary with merge rules + transcript hygiene.
- `autonomous-mode.md`: New § **Delegate handoff (Tier B — Phase 13)** before Diagram profiles; links `templates/project/delegates/README.md`, crystallize Step 9, Tier A re-hydrate.

## Post-Completion
- Covered by `tests/unit/vp-phase13-orchestration-contracts.test.js` string guards.
