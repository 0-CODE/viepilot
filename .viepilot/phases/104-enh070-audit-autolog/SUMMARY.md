# Phase 104 Summary — ENH-070: vp-audit Auto-Log Gaps → Direct vp-evolve Routing

## Result
✅ Complete — v2.39.0

## What Was Done

Eliminated the manual `/vp-request` step between `vp-audit` and `/vp-evolve`. When `vp-audit` detects gaps, it now auto-logs them as request files and offers a direct `/vp-evolve` route.

**`workflows/audit.md`** — two additions:

1. **`## Auto-Log Gate (ENH-070)`** (new `<step name="autolog_gate">` block after the report step):
   - Tier → Request Type mapping table (Tier 1 → BUG medium, Tier 2 → BUG/ENH low, Tier 3 → BUG/ENH medium-high, Tier 4 → ENH high)
   - Duplicate detection: existing open requests with ≥70% title match or file overlap get a "Re-detected" note appended rather than a new file
   - Creates `.viepilot/requests/{TYPE}-{N}.md` with `Source: auto-logged by vp-audit Tier {N}`
   - Updates TRACKER.md Decision Log for each new request
   - Tracks `auto_logged_new` + `auto_logged_deduped` counters
   - `--no-autolog` skip condition at the top of the gate

2. **Post-Audit Routing Banner** (appended to the autolog_gate step):
   - Shows all logged request IDs with tier labels
   - AUQ prompt: "Plan fix phase → /vp-evolve (Recommended)" / "Auto-fix now → /vp-auto --fix" / "Skip — review later"
   - Text fallback for non-Claude Code adapters
   - Silent when no issues found; skipped when `--no-autolog` set

**`skills/vp-audit/SKILL.md`**:
- Added `--no-autolog` flag to the context flags list
- Added `### Auto-Log Behavior (ENH-070)` section documenting tier → request type mapping, duplicate detection, post-audit banner, and disable mechanism

## Test Results
1519 tests, 73 suites — all pass (18 new tests in phase104-enh070-audit-autolog.test.js)
