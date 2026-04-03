# Task 13.4: Unit tests — orchestration Tier A/B contract

## Meta
- **Phase**: 13-agent-orchestration-tier-ab
- **Status**: complete
- **Complexity**: S
- **Dependencies**: 13.1, 13.2, 13.3
- **Git Tag**: `viepilot-vp-p13-t13.4`

## Task Metadata

```yaml
type: test
complexity: S
write_scope:
  - tests/unit/
recovery_budget: S
can_parallel_with: []
recovery_overrides:
  L1: { block: false }
  L2: { block: false }
  L3: { block: false, reason: "" }
```

## Objective
Add Jest (or existing runner) tests that guard shipped contracts: e.g. `autonomous.md` contains task-boundary re-hydrate instructions; `templates/project/delegates/examples/*.json` parse and include required keys.

## Paths
```yaml
files_to_create:
  - tests/unit/vp-phase13-orchestration-contracts.test.js
files_to_modify: []
```

## Acceptance Criteria
- [x] `npm test` passes including new file.
- [x] Test failures give clear message if Tier A/B docs regressed.

## Verification
```yaml
automated:
  - command: "npm test -- tests/unit/vp-phase13-orchestration-contracts.test.js"
    expected: "PASS"
```

## State Update Checklist
- [x] PHASE-STATE / TRACKER / HANDOFF per protocol

## Implementation Notes
- Single describe block: Tier A heading + HANDOFF/PHASE-STATE/files_to_read mentions in `autonomous.md`; crystallize Tier B seed section; JSON parse + required keys; README merge rule; AI-GUIDE + autonomous-mode subsections.

## Post-Completion
- Full suite: **340** tests, **19** suites.
