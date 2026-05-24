# Phase 149 State — DEBT-002: TRACKER.md compaction

## Status: pending

## Tasks
| ID | Title | Status |
|----|-------|--------|
| 149.1 | lib/tracker-compact.cjs — compact logic (extract history, rewrite TRACKER.md) | pending |
| 149.2 | bin/vp-tools.cjs — tracker compact [--keep N] subcommand | pending |
| 149.3 | workflows/autonomous.md — rewrite-not-append + size guard + Decision Log cap | pending |
| 149.4 | Contract tests + CHANGELOG [3.12.0] + version bump | pending |

## Version Target
3.11.0 → **3.12.0**

## Resolves
- DEBT-002: TRACKER.md grows unboundedly → 31 459 tokens in real project, exceeds 25 000 token read limit
  - Fix 1: vp-auto rewrites Current State block (not appends) — O(1) state size forever
  - Fix 2: `vp-tools tracker compact [--keep N]` — rescue command for already-bloated files
  - Fix 3: Decision Log capped at 20 rows in tracker-agent + compact
  - Fix 4: auto-compact guard in autonomous.md Step 1 when file > 400 lines

## Parallel Clusters
- Cluster A (parallel): 149.1 + 149.3
- Cluster B (serial): 149.2 (after 149.1)
- Cluster C (serial): 149.4 (after all)

## Dependencies
- Phase 148 ✅

## Started: —
## Completed: —
