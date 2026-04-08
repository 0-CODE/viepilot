# ViePilot Hooks

ViePilot integrates with Claude Code's hook system to automate actions after each AI response. Hooks are shell commands that fire at specific Claude Code events — no manual typing required.

## Brainstorm Staleness Hook

**Event**: `Stop` (fires after each Claude response)  
**Script**: `~/.viepilot/hooks/brainstorm-staleness.cjs`  
**Config**: `~/.claude/settings.json`

### What it does

After each exchange in a `vp-brainstorm` session, the hook automatically:

1. Finds the most recently modified brainstorm session file (`notes.md` or `session-*.md`)
2. Scans session content for keywords that match architect HTML pages
3. Marks relevant architect items with `data-arch-stale="true"` — rendered as an amber "⚠ gap" badge in the browser
4. Exits cleanly — if it fails or finds nothing, your session continues normally

This is **flag-only** (Option A) — the hook does not rewrite architect HTML content, only marks items for review. Use `/sync-arch` to perform a full content sync.

### Install

Run once per machine:

```bash
node bin/vp-tools.cjs hooks install
# or if installed globally:
vp-tools hooks install
```

This writes the hook entry into `~/.claude/settings.json`. Running it again is safe (idempotent).

To verify the install:

```bash
cat ~/.claude/settings.json | grep brainstorm-staleness
```

### Preview (scaffold)

To see what will be written without installing:

```bash
node bin/vp-tools.cjs hooks scaffold
```

### Cursor users

Cursor does not support `settings.json` hook events. Use `/sync-arch` manually within the brainstorm session to trigger architect delta sync (ENH-034).

---

## Adapter support

Hook behavior is adapter-dependent:

| Adapter | Config file | Programmatic events |
|---------|-------------|---------------------|
| `claude-code` | `~/.claude/settings.json` | Stop, PreToolUse, PostToolUse, UserPromptSubmit, … |
| `cursor` | `.cursorrules` / MDC | None (no programmatic hook events) |

Check your adapter's supported events:

```bash
node bin/vp-tools.cjs hooks scaffold --adapter claude-code
```

---

## Adding custom hooks

1. Create your hook script in `~/.viepilot/hooks/` (or anywhere accessible)
2. Get the config format: `vp-tools hooks scaffold`
3. Add your command to the relevant event array in `~/.claude/settings.json`

Claude Code passes a JSON payload on stdin with `session_id`, `cwd`, `transcript_path`, and event-specific data. Your hook script should read from stdin and always exit 0.

---

## Troubleshooting

**Hook not firing**  
- Confirm `~/.claude/settings.json` has a `Stop` entry: `vp-tools hooks install` (idempotent)
- Restart your Claude Code session after modifying `settings.json`

**No stale badges appearing**  
- The hook only marks stale if session content matches architect keyword triggers
- Check that the brainstorm session notes file exists in `.viepilot/ui-direction/` or `docs/brainstorm/`
- The architect HTML files must exist at `templates/architect/` (repo) or `~/.claude/viepilot/templates/architect/` (installed)

**Hook error messages**  
Hook errors appear on stderr (not in Claude's response). Check terminal output or Claude Code logs.
