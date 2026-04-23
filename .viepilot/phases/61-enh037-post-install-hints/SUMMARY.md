# Phase 61 — Summary: Adapter-driven post-install hints (ENH-037) → 2.3.2

## What shipped
- Added `postInstallHint` string field to all 3 adapter objects:
  - `claude-code.cjs`: `'Restart session so ~/.claude/skills/vp-* is picked up; then /vp-status'`
  - `cursor.cjs`: `'Open project and run /vp-status'`
  - `antigravity.cjs`: `'Open project and run /vp-status'`
- `bin/viepilot.cjs`: replaced 3 hardcoded lines with a `for (target of selectedTargets)` loop that reads `adapter.postInstallHint`; deduplicates cursor-agent/cursor-ide via `seenAdapters` Set
- Tests: added `postInstallHint` shape assertion to claude-code + cursor + antigravity adapter shape tests; added CLI output test asserting `- Antigravity:` appears in `--target antigravity --dry-run` output

## Test count
595 → 596 (+1 new test, +3 expect assertions embedded in existing shape tests)

## Output before → after
**Before** (always, regardless of target):
```
Next actions:
- Cursor: open project and run /vp-status
- Claude Code: restart session if needed so ~/.claude/skills/vp-* is picked up; then /vp-status
- If needed, run /vp-brainstorm then /vp-crystallize
```

**After** (`--target antigravity`):
```
Next actions:
- Antigravity: Open project and run /vp-status
- If needed, run /vp-brainstorm then /vp-crystallize
```

**After** (`--target all`):
```
Next actions:
- Claude Code: Restart session so ~/.claude/skills/vp-* is picked up; then /vp-status
- Cursor: Open project and run /vp-status
- Antigravity: Open project and run /vp-status
- If needed, run /vp-brainstorm then /vp-crystallize
```
