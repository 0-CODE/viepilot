# Phase 146 State — BUG-031: hooks install wrong path fix

## Status: done

## Tasks
| ID | Title | Status |
|----|-------|--------|
| 146.1 | bin/vp-tools.cjs — fix hook path + migration for stale entries | done |
| 146.2 | Contract tests + CHANGELOG [3.9.1] + version bump | done |

## Version Target
3.9.0 → **3.9.1**

## Resolves
- BUG-031: `vp-tools hooks install` writes `~/.viepilot/hooks/brainstorm-staleness.cjs`
  (hardcoded, never created) — Stop hook exits non-zero every turn

## Root Cause
`bin/vp-tools.cjs` lines 1010 and 1027 hardcode `path.join(home, '.viepilot', 'hooks', ...)`
instead of using `adapter.viepilotDir(home)`. For Claude Code: correct path is
`~/.claude/viepilot/lib/hooks/brainstorm-staleness.cjs`.

## Fix
- Lines 1010 + 1027: replace hardcoded path with `path.join(adapter.viepilotDir(home), 'lib', 'hooks', 'brainstorm-staleness.cjs')`
- idempotency check: must also detect old wrong-path entries and replace them (currently skips if any entry exists, leaving stale entries unrepaired)

## Started: 2026-05-25
## Completed: 2026-05-25
