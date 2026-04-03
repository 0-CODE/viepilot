# Task 20.1: ENH-031 — Cold-start manifest and measurement

## Meta
- **Phase**: 20-enh-031-cold-start-tokens
- **Status**: not_started
- **Complexity**: S
- **Git Tag**: `viepilot-vp-p20-t20.1`

## Task Metadata
```yaml
type: docs
complexity: S
write_scope:
  - docs/user/features/autonomous-mode.md
  - .viepilot/ (optional manifest doc if colocated)
recovery_budget: S
```

## Objective
Document which files are read on cold start, in order, with byte estimates (script or manual table). Set user expectations per ENH-031 direction **E**.

## Context Required
```yaml
files_to_read:
  - .viepilot/requests/ENH-031.md
  - workflows/autonomous.md
```

## Acceptance Criteria
- [ ] Manifest list + size estimates reproducible (doc and/or small script under `scripts/` if added in `/vp-auto`)
- [ ] `autonomous-mode.md` states expected cold-start budget and caveats

## State Update Checklist
- [ ] PHASE-STATE / TRACKER / HANDOFF per protocol
