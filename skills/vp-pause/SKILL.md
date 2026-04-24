---
name: vp-pause
description: "Pause work with context preservation to resume later"
version: 0.1.1
---

<greeting>
## Invocation Banner

Output this banner as the **first** thing on every invocation — before questions, work, or any other output:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► VP-PAUSE  v0.1.1 (fw 2.19.0)
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


<cursor_skill_adapter>
## A. Skill Invocation
- Skill được gọi khi user mention `vp-pause`, `/vp-pause`, "pause", "dừng", "tạm nghỉ"
- Treat all user text after the skill mention as `{{VP_ARGS}}`

## B. User Prompting
Prompt user conversationally to gather state info.

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

- **Handoff state** — does not implement shipping; resume with **`/vp-resume`** then **`/vp-auto`** per plan. See `workflows/request.md`.
</implementation_routing_guard>


<objective>
Save complete work state so it can be resumed from any context.

**Creates/Updates:**
- `.viepilot/HANDOFF.json` - Machine-readable state
- `.viepilot/phases/{current}/.continue-here.md` - Human-readable context
- Git WIP commit

**After:** Safe to close session. Resume with `/vp-resume`
</objective>

<execution_context>
@$HOME/{envToolDir}/workflows/pause-work.md
</execution_context>

<process>
Execute workflow from `@$HOME/{envToolDir}/workflows/pause-work.md`

### Step 1: Detect Current Position
```bash
# Find current phase from TRACKER.md or recent files
Read TRACKER.md → current_phase, current_task
Check PHASE-STATE.md → task status
```

### Step 2: Gather State
Collect:
1. **Current position**: Phase, task, line
2. **Work completed**: What got done this session
3. **Work remaining**: What's left
4. **Decisions made**: Key decisions and rationale
5. **Blockers/issues**: Anything stuck
6. **Human actions pending**: Manual interventions needed
7. **Background processes**: Running servers/watchers
8. **Uncommitted files**: Changes not yet committed

Ask user for clarifications if needed.

### Step 3: Write HANDOFF.json
```json
{
  "version": "1.0",
  "timestamp": "{ISO8601}",
  "phase": "{phase_number}",
  "phase_name": "{phase_name}",
  "task": "{current_task}",
  "total_tasks": "{total}",
  "status": "paused",
  "completed_tasks": [...],
  "remaining_tasks": [...],
  "blockers": [...],
  "human_actions_pending": [...],
  "decisions": [...],
  "uncommitted_files": [...],
  "next_action": "{specific first action when resuming}",
  "context_notes": "{mental state, approach}"
}
```

### Step 4: Write .continue-here.md
```markdown
---
phase: {phase}
task: {task}
total_tasks: {total}
status: in_progress
last_updated: {timestamp}
---

<current_state>
[Where exactly are we? Immediate context]
</current_state>

<completed_work>
- Task 1: [name] - Done
- Task 2: [name] - In progress, [what's done]
</completed_work>

<remaining_work>
- Task 2: [what's left]
- Task 3: Not started
</remaining_work>

<decisions_made>
- Decided [X] because [reason]
</decisions_made>

<blockers>
- [Blocker]: [status/workaround]
</blockers>

<context>
[Mental state, what were you thinking]
</context>

<next_action>
Start with: [specific first action when resuming]
</next_action>
```

### Step 5: Git Commit
```bash
git add -A
git commit -m "wip({phase}): paused at task {task}/{total}"
```

### Step 6: Confirm
```
✓ Work paused successfully

Current state:
- Phase: {phase_name}
- Task: {task} of {total}
- Status: {status}
- Blockers: {count}

Files saved:
- .viepilot/HANDOFF.json
- .viepilot/phases/{phase}/.continue-here.md

To resume: /vp-resume
```
</process>

<success_criteria>
- [ ] HANDOFF.json created with complete state
- [ ] .continue-here.md created in phase directory
- [ ] All sections filled with specific content
- [ ] Uncommitted changes identified
- [ ] Git WIP commit created
- [ ] User knows how to resume
</success_criteria>
