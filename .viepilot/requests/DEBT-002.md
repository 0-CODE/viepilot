# DEBT-002: TRACKER.md unbounded growth — token limit breach

## Meta
- **ID**: DEBT-002
- **Type**: Technical Debt
- **Status**: triaged
- **Priority**: high
- **Created**: 2026-05-25
- **Reporter**: User
- **Assignee**: AI

## Summary
TRACKER.md grows unboundedly across phases, eventually exceeding the LLM read limit (25 000 tokens).
Observed: real project hit **31 459 tokens** — file unreadable in one shot. Root cause: `vp-auto`
**appends** new state lines on every phase complete instead of **replacing** the previous state block,
and no archiving or compaction mechanism exists.

## Details

### What happens today
1. Each phase completion appends 3-5 new lines to "Current State" (never overwrites previous entry).
2. Decision Log table accrues one row per decision with no cap or rotation.
3. Completed backlog entries stay inline, never pruned.
4. After 50–100+ phases the file is too large to read in one tool call → skills break silently.

### Observed failure
```
File content (31459 tokens) exceeds maximum allowed tokens (25000).
Use offset and limit parameters to read specific portions of the file,
or search for specific content instead of reading the whole file.
```

### Root cause
- `autonomous.md` + `vp-auto` orchestrator writes:
  `**Current Phase**: {N}` and `**Last Completed Phase**: {N} ✅ ...` as append-only stanzas.
- No compaction pass; TRACKER.md is designed as a log not a rolling summary.

## Proposed Solution

### Fix 1 — Rewrite-not-append (root cause fix)
Change `vp-auto` state update logic: on phase complete, **rewrite** the "Current State" block
(find + replace the existing block) rather than prepending/appending. TRACKER.md "Current State"
should always be ≤ 20 lines regardless of phase count.

Affected: `workflows/autonomous.md` → Step 4 / Step 5 state update instructions.

### Fix 2 — `vp-tools tracker compact` command
New subcommand: reads TRACKER.md, extracts entries older than N phases (default: keep last 5),
writes them to `TRACKER-HISTORY.md`, rewrites TRACKER.md to current-only summary.

```
node bin/vp-tools.cjs tracker compact [--keep N]
```

Files: `bin/vp-tools.cjs` (subcommand), `lib/tracker-compact.cjs` (logic).

### Fix 3 — Decision Log rotation
Cap Decision Log table at last 20 entries; older rows archived to `TRACKER-HISTORY.md`.
Applied by `tracker compact` and also triggered automatically in `vp-auto` when row count > 30.

### Fix 4 — Token size guard in `vp-auto`
Before reading TRACKER.md, check file size. If > 4 000 lines or > 20 KB:
- Print warning: `⚠️ TRACKER.md is large ({N} lines) — auto-compacting…`
- Run `vp-tools tracker compact --keep 5` silently
- Then read the compacted file

Affected: `workflows/autonomous.md` → Step 1 Initialize (preflight read).

## Acceptance Criteria
- [ ] After any phase complete, TRACKER.md "Current State" section stays ≤ 20 lines
- [ ] `node bin/vp-tools.cjs tracker compact` produces TRACKER.md < 200 lines and TRACKER-HISTORY.md with archived entries
- [ ] `vp-auto` auto-compacts when TRACKER.md exceeds threshold (20 KB / 4 000 lines)
- [ ] Decision Log capped at 20 rows; excess rows in TRACKER-HISTORY.md
- [ ] Existing tests pass; new contract tests for tracker compact added
- [ ] No data loss — all history preserved in TRACKER-HISTORY.md

## Related
- Phase: 149
- Files:
  - `workflows/autonomous.md` (rewrite-not-append logic + size guard)
  - `bin/vp-tools.cjs` (tracker compact subcommand)
  - `lib/tracker-compact.cjs` (new — compact logic)
  - `tests/unit/phase{N}-debt002-tracker-compact.test.js`
- Dependencies: none

## Discussion
Two-layer fix: Fix 1 stops future growth at the root (O(1) state size regardless of phase count).
Fix 2+3 rescue already-bloated files. Fix 4 is a safety net.
The fix to `workflows/autonomous.md` is the most impactful: it's a one-line instruction change
from "append new state lines" to "find-and-replace the Current State block".
No schema changes to TRACKER.md format — only the write strategy changes.

## Resolution
(filled when resolved)
