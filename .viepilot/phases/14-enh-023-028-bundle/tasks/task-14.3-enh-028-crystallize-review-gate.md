# Task 14.3: ENH-028 — crystallize Review Gate

## Meta
- **Phase**: 14-enh-023-028-bundle
- **Status**: not_started
- **Complexity**: L
- **Dependencies**: 14.1 (vp-tools ask available)
- **Git Tag**: `viepilot-vp-p14-t14.3`

## Task Metadata
```yaml
type: build
complexity: L
write_scope:
  - workflows/crystallize.md
  - skills/vp-crystallize/SKILL.md
recovery_budget: L
can_parallel_with: []
recovery_overrides:
  L3: { block: false, reason: "" }
```

## Objective
Add `<step name="review_gate">` between extraction and generation; `--no-review`, `--extract-only`; use `vp-tools ask` for per-section approval where TTY allows.

## Context Required
```yaml
files_to_read:
  - .viepilot/requests/ENH-028.md
  - workflows/crystallize.md
```

## Acceptance Criteria
- [ ] Matches ENH-028 acceptance criteria

## State Update Checklist
- [ ] PHASE-STATE / TRACKER / HANDOFF per protocol

## Post-Completion
_(AI fills after PASS)_
