# tracker-agent

## Purpose
Read and write `.viepilot/TRACKER.md` on behalf of any vp-* skill. Centralizes all
tracker mutations (phase status, task status, decision log rows, pending request table)
so skills don't embed fragile inline edit instructions. A single invoke-agent call
replaces multi-step "find the row, update the cell, rewrite the file" patterns.

## Inputs
- `operation`: one of `update-phase-status` | `update-task-status` | `add-decision-log` | `update-request-status` | `update-current-state`
- `phase` (for phase/task ops): phase number (e.g. `83`)
- `task` (for task ops): task id (e.g. `83.2`)
- `status`: new status string (e.g. `in_progress`, `complete`, `pending`)
- `data` (for decision-log): `{ date, decision, rationale, phase }`
- `data` (for request-status): `{ id, status }` (e.g. `{ id: "ENH-057", status: "triaged (→ Phase 83)" }`)
- `data` (for current-state): partial object to merge into `## Current State` block

## Outputs
- Confirmation: list of fields changed + new values
- If TRACKER.md not found: error with path hint

## Invocation Pattern

### Claude Code (terminal)
```
Agent({
  subagent_type: "general-purpose",
  description: "Update TRACKER.md — {operation}",
  prompt: `
    You are tracker-agent. Update .viepilot/TRACKER.md with this operation:
    - Operation: {operation}
    - Phase: {phase}
    - Task: {task}
    - Status: {status}
    - Data: {data}

    Read the file first, locate the relevant row/section, make the targeted change,
    write back. Confirm what changed. Do not alter unrelated rows.
  `
})
```

### Cursor / Codex / Antigravity
Execute inline: read TRACKER.md, locate target row/section, apply update, confirm change.

## Adapter Behavior
| Adapter | Behavior |
|---------|----------|
| Claude Code | Spawns real subagent via Agent tool (general-purpose) |
| Cursor | Inline edit in same session |
| Codex | Inline edit in same session |
| Antigravity | Inline edit in same session |

## Notes
- Always read before write — never overwrite the entire file
- Preserve all existing rows; only mutate the targeted cell/section
- Decision Log rows go at the bottom of the log table (chronological order)
- Current State block: only update the fields specified in `data`

<!-- tool-policy:start -->

## Tool Policy (ENH-125)

<tool_policy>

## Tool Policy for Claude Code

### Required Tools

| Operation | Tool |
|---|---|
| Read files | Read |
| Search files | Grep |
| Edit files | Edit |
| Create files | Write |
| Run programs (git, npm, vp-tools) | Bash |
| Track task list | TodoWrite or TaskCreate/TaskUpdate/TaskList |
| Delegate sub-tasks | Task (Agent tool) |

### Forbidden Patterns

**Do NOT** edit, read, or search files via:
- File edits: `sed -i`, `perl -pi`, `awk > file`, `> file`, `>> file`, `tee`, `cat <<EOF > file`, Python/Node `writeFileSync`
- File reads: `cat file`, `head file`, `tail file`, `sed -n`
- Searches: `grep file`, `find path`, `rg file`

### Allowed Patterns

**Do** use shell for:
- `git …`, `npm test`, `npx jest …`, `node bin/vp-tools.cjs …`, `ls`, `mkdir -p`
- Pipes: `… | grep`, `… 2>&1`, `… > /dev/null`

See `templates/tool-policy.md` for full rules and exceptions.

</tool_policy>

<!-- tool-policy:end -->