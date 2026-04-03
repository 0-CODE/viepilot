# Task 20.3: ENH-031 — ROADMAP-INDEX and Initialize lite

## Meta
- **Phase**: 20-enh-031-cold-start-tokens
- **Status**: done
- **Complexity**: M
- **Git Tag**: `viepilot-vp-p20-t20.3`

## Task Metadata
```yaml
type: build
complexity: M
write_scope:
  - workflows/autonomous.md
  - workflows/crystallize.md
  - .viepilot/ROADMAP-INDEX.md
recovery_budget: M
```

## Objective
Introduce `.viepilot/ROADMAP-INDEX.md` (≤~40 lines target) for Initialize; Step 1 reads index when file exists, else full `ROADMAP.md`. Document fallback when index is stale (ENH-031 directions **A/B**).

## Paths
| Path | Action |
|------|--------|
| `.viepilot/ROADMAP-INDEX.md` | Create — compact phase table + stale-recovery pointer |
| `workflows/autonomous.md` | Edit — Step 1 Initialize batch: INDEX vs full ROADMAP rules |
| `workflows/crystallize.md` | Edit — Step 7 item 6: refresh ROADMAP-INDEX after ROADMAP finalize |

## File-Level Plan
- **ROADMAP-INDEX:** Mirror Progress Summary rows for phases 13–20 + milestone line; English headings; explicit “execution truth = TRACKER + HANDOFF + PHASE-STATE”.
- **autonomous.md:** Single bullet list under Initialize; clarify “phase-discovery only” and explicit triggers for full ROADMAP.
- **crystallize.md:** Numbered step 6 after ROADMAP self-check; no change to earlier roadmap logic.

## Best Practices to Apply
- [x] Normative wording in English for workflow steps (match existing autonomous/crystallize style).
- [x] Keep INDEX under ~40 lines to preserve ENH-031 intent.

## Verification
```bash
wc -l .viepilot/ROADMAP-INDEX.md
grep -n 'ROADMAP-INDEX' workflows/autonomous.md | head -5
grep -n 'ROADMAP-INDEX.md' workflows/crystallize.md | head -3
npm run cold-start:manifest
npx jest 2>&1 | tail -5
```
**Expected:** INDEX line count ≤ 45; grep hits in both workflows; manifest shows non-null bytes for ROADMAP-INDEX; all tests pass.

## Pre-execution documentation gate
- [x] Written plan in this file
- [x] `PHASE-STATE.md` task 20.3 `in_progress` before first implementation commit

## Context Required
```yaml
files_to_read:
  - .viepilot/requests/ENH-031.md
  - workflows/autonomous.md
  - .viepilot/ROADMAP.md
```

## Acceptance Criteria
- [x] Index file format documented; fallback behavior explicit
- [x] No regression: agents still know current phase/task when index is stale — recovery path documented

## Implementation Notes
- Initialize reads `ROADMAP-INDEX.md` when present instead of full `ROADMAP.md` for phase-discovery; full `ROADMAP.md` required for horizon, `--phase` ambiguity, stale INDEX vs TRACKER/HANDOFF, and roadmap edits.
- Crystallize Step 7 §6 mandates refreshing INDEX after ROADMAP finalize.

## Files Changed
```text
M	.viepilot/HANDOFF.json
A	.viepilot/ROADMAP-INDEX.md
M	.viepilot/ROADMAP.md
M	.viepilot/TRACKER.md
M	.viepilot/cold-start-manifest.json
M	.viepilot/phases/20-enh-031-cold-start-tokens/PHASE-STATE.md
A	.viepilot/phases/20-enh-031-cold-start-tokens/SUMMARY.md
M	.viepilot/phases/20-enh-031-cold-start-tokens/tasks/task-20.3-enh-031-roadmap-index.md
M	.viepilot/requests/ENH-031.md
M	CHANGELOG.md
M	README.md
M	package.json
M	workflows/autonomous.md
M	workflows/crystallize.md
```

## State Update Checklist
- [x] PHASE-STATE / TRACKER / HANDOFF per protocol
