# Task 20.1: ENH-031 — Cold-start manifest and measurement

## Meta
- **Phase**: 20-enh-031-cold-start-tokens
- **Status**: in_progress
- **Complexity**: S
- **Git Tag**: `viepilot-vp-p20-t20.1`

## Task Metadata
```yaml
type: docs
complexity: S
write_scope:
  - docs/user/features/autonomous-mode.md
  - .viepilot/cold-start-manifest.json
  - scripts/cold-start-manifest.cjs
  - package.json
recovery_budget: S
recovery_overrides:
  L3:
    block: true
    reason: "Objective mentions token budget semantics (ENH-031), not auth/crypto work — Gap G keyword false positive"
```

## Objective
Document which files are read on cold `/vp-auto` start, in order, with byte estimates (script + committed JSON). Set user expectations per ENH-031 direction **E**.

## Paths
| Path | Action |
|------|--------|
| `scripts/cold-start-manifest.cjs` | Create — Node script: stat listed paths, write `.viepilot/cold-start-manifest.json`, print totals |
| `.viepilot/cold-start-manifest.json` | Create — generated data (regen via script) |
| `docs/user/features/autonomous-mode.md` | Edit — new section: cold-start read order, budget heuristic, manifest pointer |
| `package.json` | Edit — add `cold-start:manifest` npm script |

## File-Level Plan
- **`scripts/cold-start-manifest.cjs`**: Group paths into `initialize_batch`, `runtime_workflow`, `per_task_batch` aligned with `workflows/autonomous.md` + ENH-031 investigation; emit `deduped_union_bytes` and batch-sum; handle missing optional `ROADMAP-INDEX.md`.
- **`.viepilot/cold-start-manifest.json`**: Committed snapshot for diff/review; developers re-run script after large doc edits.
- **`autonomous-mode.md`**: User-facing caveats (heuristic tokens, double-read of `AI-GUIDE` in workflow batches, optional full `ROADMAP` when index stale).
- **`package.json`**: One-line script for CI/docs.

## Best Practices to Apply
- [x] Match existing `scripts/*.cjs` style (`#!/usr/bin/env node`, `"use strict"`).
- [x] No new dependencies; English comments in code.
- [x] Doc stays aligned with normative `workflows/autonomous.md` (cite Step 1 / task batch).

## Verification
```bash
node --check scripts/cold-start-manifest.cjs
node scripts/cold-start-manifest.cjs
node -e "JSON.parse(require('fs').readFileSync('.viepilot/cold-start-manifest.json','utf8'))"
grep -n 'Cold start context budget' docs/user/features/autonomous-mode.md
npm run cold-start:manifest
```
**Expected:** script exits 0; JSON parses; grep finds section heading; npm script runs same as direct node.

## Pre-execution documentation gate
- [x] Written plan in this file (`Paths` + `File-Level Plan`)
- [x] `PHASE-STATE.md` shows task `in_progress` before first implementation commit

## Context Required
```yaml
files_to_read:
  - .viepilot/requests/ENH-031.md
  - workflows/autonomous.md
```

## Acceptance Criteria
- [ ] Manifest list + size estimates reproducible (doc + script)
- [ ] `autonomous-mode.md` states expected cold-start budget and caveats

## State Update Checklist
- [ ] PHASE-STATE / TRACKER / HANDOFF per protocol
