# Phase 150 State — DEBT-003: check-update OS session guard + version cache

## Status: pending

## Tasks
| ID | Title | Status |
|----|-------|--------|
| 150.1 | bin/vp-tools.cjs + lib/viepilot-update.cjs — OS session guard + 6h TTL | pending |
| 150.2 | Contract tests + CHANGELOG [3.12.1] + version bump | pending |

## Version Target
3.12.0 → **3.12.1**

## Resolves
- DEBT-003: `check-update --silent` costs 1 000–2 000 init tokens per skill invocation
  - Fix 1: OS session guard — `/tmp/vp-update-check-{today}.done` written after first check;
    subsequent calls in same OS session exit immediately with 0 stdout (0 tokens)
  - Fix 2: Reduce TTL from 24h → 6h so update notices are more timely
  - Fix 3: Guard file stores `{ updateAvailable, latest }` so fast-path returns correct exit code

## Parallel Clusters
- Single serial chain: 150.1 → 150.2

## Dependencies
- Phase 149 ✅

## Started: —
## Completed: —
