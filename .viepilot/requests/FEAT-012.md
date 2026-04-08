# FEAT-012: vp-brainstorm post-exchange staleness hook — auto-detect and update stale content

## Meta
- **ID**: FEAT-012
- **Type**: Feature
- **Status**: new
- **Priority**: high
- **Created**: 2026-04-08
- **Reporter**: User
- **Assignee**: AI

## Summary
Add a Claude Code hook (`.claude/settings.json` — `Stop` event) that fires automatically
after each AI response in a brainstorm session. The hook inspects the current session
state and detects content in both `architect/` and `ui-direction/` that has become stale
relative to what was just discussed, then flags or auto-updates those items.

This is the first hook ViePilot will ship — requires FEAT-013 (Claude Code platform pivot)
to be planned concurrently since the hook mechanism is Claude Code-native.

## Details
### Current behavior
- Staleness detection is manual: user must type `/sync-arch` (ENH-034) or notice gaps
  themselves. No automatic detection after each message exchange.
- No hooks mechanism exists in ViePilot today.

### Desired behavior
After every AI response during a `vp-brainstorm` session:
1. A `Stop` hook fires automatically (shell script or agent hook).
2. The hook reads the latest session file (docs/brainstorm/session-*.md or
   .viepilot/ui-direction/{id}/notes.md) and the current architect workspace.
3. It compares recent session content against the architect/ui-direction HTML files
   using a lightweight keyword/diff approach.
4. If stale items are detected:
   - Option A (flag-only): write `data-arch-stale="true"` onto the relevant HTML elements
     + output a compact "⚠ Stale items detected" notice to Claude context
   - Option B (auto-update): trigger `architect_delta_sync` logic to immediately update
     HTML content (full sync)
5. The hook is non-blocking: if it fails or times out, the session continues normally.

### Hook implementation notes (from Claude Code research)
- **Event**: `Stop` — fires after Claude finishes responding each turn
- **Handler type**: `command` (shell script) for reliability; falls back gracefully
- **Config location**: `.claude/settings.json` (project-level) OR
  `~/.claude/settings.json` (global, preferred for ViePilot framework)
- **Input format**: JSON on stdin with `session_id`, `cwd`, hook event data
- **No blocking**: hook returns exit 0 always (informational only for staleness detection)
- **Example config**:
  ```json
  {
    "hooks": {
      "Stop": [{
        "matcher": {},
        "hooks": [{
          "type": "command",
          "command": "node ~/.viepilot/hooks/brainstorm-staleness.cjs"
        }]
      }]
    }
  }
  ```

### Files affected
- `lib/hooks/brainstorm-staleness.cjs` — new hook script (reads stdin JSON,
  detects stale architect/ui-direction content, outputs additionalContext)
- `~/.claude/settings.json` or `.viepilot/hooks/install-hooks.cjs` — hook registration
- `docs/user/features/hooks.md` — new user doc for hooks system
- `workflows/brainstorm.md` — reference to hook behavior (already detects; hook just automates)

## Acceptance Criteria
- [ ] `lib/hooks/brainstorm-staleness.cjs` exists and handles stdin JSON from Claude Code Stop event
- [ ] Hook detects stale architect items and writes `data-arch-stale="true"` to relevant HTML
- [ ] Hook is non-blocking (exit 0 always; errors are logged not thrown)
- [ ] Install mechanism registers hook in `~/.claude/settings.json` (via `vp-tools` or install step)
- [ ] Hook respects isolation rule (ENH-033) — per-item, no cross-page cascade
- [ ] Contract tests verify hook script parsing + stale detection logic

## Related
- Phase: TBD (→ Phase 53 candidate, depends on FEAT-013)
- Files:
  - `lib/hooks/brainstorm-staleness.cjs` (new)
  - `~/.claude/settings.json` (hook registration)
  - `docs/user/features/hooks.md` (new)
  - `workflows/brainstorm.md` (reference)
- Dependencies:
  - ENH-034 (architect_delta_sync logic) ✅ done (1.19.0) — hook reuses this logic
  - FEAT-013 (Claude Code platform pivot) — hook registration needs Claude Code install path

## Discussion
Claude Code `Stop` hook is the correct event — it fires after each AI response (= after
each exchange with user). No direct "after each message" Cursor equivalent exists in Claude
Code. The `Stop` event is the closest and fires once per completed AI turn.

The hook script receives full JSON context via stdin including session_id and cwd.
The script can read the latest brainstorm session file from cwd and compare against
architect workspace to detect divergence. Flag-only (Option A) is recommended for v1 —
auto-update (Option B) risks unintended HTML changes.
