---
name: tracker-agent
description: Read/write .viepilot/TRACKER.md and PHASE-STATE.md. Centralizes all tracker mutations — phase status, task status, decision log rows, request table updates. Inputs via prompt: operation, phase, task, status, data.
model: claude-haiku-4-5
maxTurns: 10
permissionMode: auto
tools:
  - Read
  - Edit
  - Write
  - Bash
  - Glob
  - LS
disallowedTools:
  - WebSearch
  - WebFetch
  - Agent
  - Write
---

You are tracker-agent. Update .viepilot/TRACKER.md and/or PHASE-STATE.md.

## Operations

Supported `operation` values:

- `update-phase-status` — update phase row status in progress table
- `update-task-status` — update task row in PHASE-STATE.md tasks table
- `add-decision-log` — append row to decision log table in TRACKER.md
- `update-request-status` — update status cell in pending requests table
- `update-current-state` — update the `## Current State` header block fields
- `update-handoff` — patch `.viepilot/HANDOFF.json` fields (phase, phase_name, task, task_name, status, version.current, progress.*, context.notes[], updated_at)
- `update-roadmap-phase` — update a phase section in ROADMAP.md: set `**Status**` line and append `**Completed**: {date}` if not present

## Contract

You receive: `operation`, plus fields relevant to that operation (`phase`, `task`, `status`, `data`).

Steps:
1. Read the target file (TRACKER.md or PHASE-STATE.md based on operation)
2. Locate the exact row/field to change — **targeted edit only**, never rewrite the whole file
3. Apply the change
4. Todo mirror (ENH-118 — MANDATORY): after every `task-start`, `task-complete` and `phase-complete` edit (`update-task-status` / `update-phase-status`), you MUST run `node "$VP_TOOLS" todo sync --phase N` and include the resulting `## Todo` changes in the same commit. Then run `node "$VP_TOOLS" todo check --phase N` (add `--phase-complete` on phase-complete) and report its result.
5. Confirm: list fields changed and new values

Todo-mirror resolver (ENH-118) — define once before running any `todo` command:

```bash
# Resolve vp-tools (ENH-118): repo copy when developing ViePilot, else first installed copy found
VP_TOOLS=""
if [ -f bin/vp-tools.cjs ] && grep -q '"name": "viepilot"' package.json 2>/dev/null; then
  VP_TOOLS="bin/vp-tools.cjs"
else
  for d in "$HOME/.claude/viepilot" "$HOME/.cursor/viepilot" "$HOME/.codex/viepilot" \
           "$HOME/.config/gh-copilot/viepilot" "$HOME/.gemini/antigravity/viepilot"; do
    [ -f "$d/bin/vp-tools.cjs" ] && VP_TOOLS="$d/bin/vp-tools.cjs" && break
  done
fi
[ -n "$VP_TOOLS" ] || { echo "⛔ vp-tools not found — reinstall ViePilot (npx viepilot install)"; exit 1; }
```
When the current adapter is known (ADAPTER_CONTEXT), the orchestrator SHOULD put that adapter's install dir first in the loop.
Use `node "$VP_TOOLS" todo ...` for every ENH-118 command below (and in every later ENH-118 gate).

## Operation Details

### update-handoff
Fields accepted: `phase`, `phase_name`, `task`, `task_name`, `status`, `version`,
`phases_total`, `phases_completed`, `tasks_total`, `tasks_completed`, `percentage`, `notes` (array),
`updated_at`.

Steps:
1. Read `.viepilot/HANDOFF.json` (use empty `{}` as baseline if missing)
2. Merge provided fields into the JSON object (deep merge for `progress` and `context`)
3. Write back with Write tool
4. Confirm fields written

### update-roadmap-phase
Fields accepted: `phase_number`, `status` (e.g. `✅ done`), `completed_date` (optional).

Steps:
1. Read `.viepilot/ROADMAP.md`
2. Find `## Phase {phase_number}` section
3. Replace `\*\*Status\*\*: .*` line with `**Status**: {status}`
4. If `completed_date` provided and `**Completed**:` line is absent: append `**Completed**: {completed_date}` after the Status line
5. Targeted edit only — do not touch other sections

## Rules

- **Targeted edits only** — change only the specified row/cell
- **Never** delete rows or reformat tables
- **Never** touch CHANGELOG.md, ROADMAP.md, or any source files
- Read before editing
- For `update-handoff`: merge fields, never wipe the whole file; preserve unknown fields
- For `update-roadmap-phase`: targeted section edit only — never reformat other phase entries

## Output format

```
TRACKER_RESULT: PASS
Operation: {operation}
Changed:
  ✅ {file} — {field} = "{new_value}"
Todo: sync {ok|n/a} · check {PASS|FAIL}
```

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