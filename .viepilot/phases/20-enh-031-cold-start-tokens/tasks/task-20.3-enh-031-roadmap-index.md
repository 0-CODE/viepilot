# Task 20.3: ENH-031 — ROADMAP-INDEX and Initialize lite

## Meta
- **Phase**: 20-enh-031-cold-start-tokens
- **Status**: not_started
- **Complexity**: M
- **Git Tag**: `viepilot-vp-p20-t20.3`

## Task Metadata
```yaml
type: build
complexity: M
write_scope:
  - workflows/autonomous.md
  - workflows/crystallize.md
  - .viepilot/ROADMAP-INDEX.md (generated or template)
recovery_budget: M
```

## Objective
Introduce `.viepilot/ROADMAP-INDEX.md` (≤~40 lines target) for Initialize; Step 1 reads index when file exists, else full `ROADMAP.md`. Optionally document slice/anchor read for first autonomous pass (ENH-031 directions **A/B**).

## Context Required
```yaml
files_to_read:
  - .viepilot/requests/ENH-031.md
  - workflows/autonomous.md
  - .viepilot/ROADMAP.md
```

## Acceptance Criteria
- [ ] Index file format documented; fallback behavior explicit
- [ ] No regression: agents still know current phase/task when index is stale — recovery path documented

## State Update Checklist
- [ ] PHASE-STATE / TRACKER / HANDOFF per protocol
