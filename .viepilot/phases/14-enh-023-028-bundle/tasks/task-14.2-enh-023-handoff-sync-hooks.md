# Task 14.2: ENH-023 — handoff-sync + hooks documentation

## Meta
- **Phase**: 14-enh-023-028-bundle
- **Status**: not_started
- **Complexity**: M
- **Dependencies**: none (parallel with 14.1 possible; sequential recommended)
- **Git Tag**: `viepilot-vp-p14-t14.2`

## Task Metadata
```yaml
type: build
complexity: M
write_scope:
  - bin/vp-tools.cjs
  - workflows/autonomous.md
  - templates/project/CLAUDE.md
  - workflows/crystallize.md
  - docs/
recovery_budget: M
can_parallel_with: []
recovery_overrides:
  L3: { block: false, reason: "" }
```

## Objective
Add `vp-tools handoff-sync --check|--force` per ENH-023; document hooks JSON example; optional note in crystallize install output.

## Context Required
```yaml
files_to_read:
  - .viepilot/requests/ENH-023.md
```

## Acceptance Criteria
- [ ] Matches ENH-023 acceptance criteria

## State Update Checklist
- [ ] PHASE-STATE / TRACKER / HANDOFF per protocol

## Post-Completion
_(AI fills after PASS)_
