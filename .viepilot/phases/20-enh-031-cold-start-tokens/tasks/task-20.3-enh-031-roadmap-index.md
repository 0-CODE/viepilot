# Task 20.3: ENH-031 — ROADMAP-INDEX and Initialize lite

## Meta
- **Phase**: 20-enh-031-cold-start-tokens
- **Status**: in_progress
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
- [ ] Index file format documented; fallback behavior explicit
- [ ] No regression: agents still know current phase/task when index is stale — recovery path documented

## Implementation Notes
_(post-completion)_

## Files Changed
_(post-completion)_

## State Update Checklist
- [ ] PHASE-STATE / TRACKER / HANDOFF per protocol
