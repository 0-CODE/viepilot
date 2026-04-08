# Phase 54 Summary — FEAT-012: Brainstorm Staleness Hook → v2.1.0

**Status**: ✅ Complete  
**Version shipped**: 2.1.0 (MINOR)  
**Completed**: 2026-04-08

## What was done

### Task 54.1 — lib/hooks/brainstorm-staleness.cjs
Created the ViePilot Claude Code `Stop` event hook:
- Reads stdin JSON (`{cwd, session_id, ...}`) from Claude Code hook system
- `findActiveSession(cwd)` — scans `.viepilot/ui-direction/{id}/notes.md` and `docs/brainstorm/session-*.md`; returns most recently modified
- `detectStaleItems(content, architectDir)` — keyword-based detection against 8 architect pages (C4/architecture, data-flow, ERD, use-cases, sequence, deployment, APIs, ui-design)
- `markStaleInFile(htmlPath, reason)` — idempotent attr patch: adds `data-arch-stale="true"` + `data-arch-stale-note` to all `[data-arch-id]` elements missing the attr
- Entry point guarded with `require.main === module` so tests can import without triggering stdin listeners
- Non-blocking: always exits 0; errors go to stderr only
- Exports: `{ findActiveSession, detectStaleItems, markStaleInFile }` for testing

### Task 54.2 — bin/vp-tools.cjs hooks install
Extended the `hooks` command with an `install` subcommand:
- Resolves adapter via `getAdapter(adapterId)` (default: claude-code)
- Reads existing `~/.claude/settings.json` (creates if missing)
- Merges ViePilot hook entry into `hooks.Stop[]` — idempotent check prevents duplicates
- Prints clear success/already-installed message
- Cursor adapters: prints "does not support" message, exits 0

### Task 54.3 — docs/user/features/hooks.md + workflows/brainstorm.md
- Created `docs/user/features/hooks.md`: install instructions, scaffold command, troubleshooting, adapter table, custom hooks guidance
- Updated `workflows/brainstorm.md`: architect_delta_sync step now has "Automatic mode (FEAT-012)" note; `/hooks-install` command added to commands section; FEAT-012 added to success_criteria

### Task 54.4 — Tests (20 tests)
4 groups: session discovery (5), staleness detection (5), HTML patching (5), install command (5)

## Acceptance criteria
- ✅ Hook script reads stdin, exits 0 always
- ✅ `findActiveSession` finds most recent notes.md; falls back to brainstorm session files
- ✅ `detectStaleItems` returns correct pages for known keywords; case-insensitive
- ✅ `markStaleInFile` patches HTML idempotently; returns changed/unchanged bool
- ✅ `vp-tools hooks install` writes Stop entry; re-run is idempotent
- ✅ 578 tests pass (was 558 + 20 new)
