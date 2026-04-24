---
name: vp-rollback
description: "Rollback to any checkpoint safely with state preservation"
version: 0.1.1
---

<greeting>
## Invocation Banner

Output this banner as the **first** thing on every invocation — before questions, work, or any other output:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► VP-ROLLBACK  v0.1.1 (fw 2.19.0)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
</greeting>
<version_check>
## Version Update Check (ENH-072)

After displaying the greeting banner, run:
```bash
node "$HOME/.claude/viepilot/bin/vp-tools.cjs" check-update --silent
```

**If exit code = 1** (update available — new version printed to stdout):
Display notice banner before any other output:
```
┌──────────────────────────────────────────────────────────────────┐
│ ✨ ViePilot {latest_version} available  (installed: {current})   │
│    npm i -g viepilot && vp-tools install --target {adapter_id}   │
└──────────────────────────────────────────────────────────────────┘
```
Replace `{latest_version}` with stdout from the command, `{current}` with the installed
version, `{adapter_id}` with the active adapter (claude-code / cursor / antigravity / codex / copilot).

**If exit code = 0 or command unavailable**: silent, continue.

**Suppression rules:**
- `--no-update-check` flag on skill invocation → skip this step entirely
- `config.json` → `update.check: false` → skip this step entirely
- Show at most once per session (`update_check_done` session guard)
</version_check>
<persona_context>
## Persona Context Injection (ENH-073)
At skill start, run:
```bash
node "$HOME/.claude/viepilot/bin/vp-tools.cjs" persona auto-switch
node "$HOME/.claude/viepilot/bin/vp-tools.cjs" persona context
```
Inject the output as `## User Persona` context before any task execution.
Silent if command unavailable or errors.
</persona_context>


<cursor_skill_adapter>
## A. Skill Invocation
- Skill được gọi khi user mention `vp-rollback`, `/vp-rollback`, "rollback", "quay lại"
- Treat all user text after the skill mention as `{{VP_ARGS}}`

## B. User Prompting
Show available checkpoints and confirm before rollback.

## C. Tool Usage
Use Cursor tools: `Shell`, `ReadFile`, `Glob`, `rg`, `ApplyPatch`, `WebSearch`, `WebFetch`, `Subagent`
</cursor_skill_adapter>
<scope_policy>
## ViePilot Namespace Guard (BUG-004)
- Default mode: only use and reference `vp-*` skills in ViePilot workflows.
- External skills (`non vp-*`) are out of framework scope unless user explicitly opts in.
- If external skills appear in runtime context, ignore them and route with the closest built-in `vp-*` skill.
</scope_policy>

<implementation_routing_guard>
## Implementation routing guard (ENH-021)

- **Checkpoint / revert** — does not replace **`/vp-auto`** for new work; after rollback use **`/vp-evolve`** / **`/vp-auto`** per workflow. See `workflows/request.md`.
</implementation_routing_guard>


<objective>
Rollback to any checkpoint safely, with backup and state preservation.

**Checkpoints:** Git tags with prefix `vp-`
- `vp-p{N}-t{M}` - Start of task M in phase N
- `vp-p{N}-t{M}-done` - Task M complete
- `vp-p{N}-complete` - Phase N complete

**Safety:**
- Backup current state before rollback
- Validate target checkpoint exists
- Update HANDOFF.json after rollback
</objective>

<execution_context>
@$HOME/{envToolDir}/workflows/rollback.md
</execution_context>

<context>
Optional flags:
- `--list` : List available checkpoints (plain-text table, no interactive prompt)
- `--to <tag>` : Rollback to specific tag
- `--latest` : Rollback to latest checkpoint
- `--force` : Skip confirmation
- `--dry-run` : Show what would happen
- `--limit N` : Checkpoints per page in interactive selection (default: 10). E.g. `--limit 30` shows 30 per page.
</context>

<process>

### 1. List Checkpoints
```bash
git tag -l "vp-*" --sort=-creatordate
```

Display with dates and descriptions:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 AVAILABLE CHECKPOINTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 TAG                    DATE         COMMIT
 vp-p1-complete         2026-03-30   Phase 1 done
 vp-p1-t1-done          2026-03-30   Task 1.1 done
 vp-p1-t1               2026-03-30   Start task 1.1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 2. Validate Target
- Check tag exists
- Show files that will change
- Show commits that will be undone

### 3. Backup Current State
```bash
# Backup HANDOFF.json
cp .viepilot/HANDOFF.json .viepilot/HANDOFF.backup.json

# Create safety tag
git tag vp-backup-{timestamp}
```

### 4. Execute Rollback
```bash
# Reset to checkpoint
git reset --hard {tag}

# Or soft reset (keep changes staged)
git reset --soft {tag}
```

### 5. Update State
Update HANDOFF.json to reflect rollback position.
Update TRACKER.md if needed.

### 6. Confirm Success
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ROLLBACK COMPLETE ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 From: {previous_commit}
 To:   {tag} ({commit})
 
 Backup tag: vp-backup-{timestamp}
 
 To undo this rollback:
   git reset --hard vp-backup-{timestamp}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
</process>

## Adapter Compatibility

### AskUserQuestion Tool (ENH-075)
Checkpoint selection uses `AskUserQuestion` on Claude Code (terminal).

| Adapter | Interactive Prompts | Notes |
|---------|---------------------|-------|
| Claude Code (terminal) | ✅ `AskUserQuestion` — REQUIRED at checkpoint selection | Preload schema via ToolSearch first |
| Cursor / Codex / Copilot / Antigravity | ❌ Text fallback | Plain numbered list; re-run with `--limit N` for more entries |

**Claude Code (terminal) — AUQ preload required (ENH-059):**
Before the checkpoint selection prompt, call `ToolSearch` with
`query: "select:AskUserQuestion"` to load the deferred tool schema.
If ToolSearch fails, fall back to plain-text numbered list.

**Prompts using AskUserQuestion in this skill:**
- Checkpoint selection (Step 1 — tag list + "Show N more →" pagination + "Enter manually")

<success_criteria>
- [ ] Checkpoints listed with dates
- [ ] AUQ checkpoint picker shown on Claude Code terminal (text fallback on other adapters)
- [ ] "Show N more →" pagination works; disappears when no more checkpoints
- [ ] `--limit N` controls page size (default: 10)
- [ ] `--list` flag outputs plain-text table and exits (no AUQ)
- [ ] Target validated before rollback
- [ ] Backup created before changes
- [ ] State files updated after rollback
- [ ] Undo instructions provided
</success_criteria>
