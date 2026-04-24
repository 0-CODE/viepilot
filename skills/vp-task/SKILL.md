---
name: vp-task
description: "Manual control over individual tasks"
version: 0.2.0
---

<greeting>
## Invocation Banner

Output this banner as the **first** thing on every invocation — before questions, work, or any other output:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► VP-TASK  v0.2.0 (fw 2.19.0)
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
- Skill được gọi khi user mention `vp-task`, `/vp-task`
- Treat all user text after the skill mention as `{{VP_ARGS}}`

## B. Tool Usage
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

- This skill **only** manages **state/tag/task** in `.viepilot/` — does **not** replace **`/vp-auto`** for implementing shipping code. To implement: use **`/vp-auto`** or user **explicit** override. Plan chain: **`/vp-evolve`** first. See `workflows/request.md`.
</implementation_routing_guard>


<objective>
Manual control over tasks when fine-grained management is needed.

**Commands:**
- `list` - List tasks in current phase
- `show N` - Show task N details
- `start N` - Manually start task N
- `done N` - Mark task N as done
- `skip N` - Skip task N with reason
- `retry N` - Retry failed task N
- `rollback N` - Rollback task N
</objective>

<process>

### Parse Command
```
/vp-task {command} {args}

Commands:
- /vp-task list
- /vp-task show 3
- /vp-task start 3
- /vp-task done 3
- /vp-task skip 3 --reason "Not needed for Phase 1"
- /vp-task retry 3
- /vp-task rollback 3
```

### Command: list
```bash
# Read current phase
cat .viepilot/TRACKER.md → current_phase
cat .viepilot/phases/{phase}/PHASE-STATE.md
```

Display:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Phase {N}: {Name} - Tasks
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 # │ Task                      │ Status      │ Tag
───┼───────────────────────────┼─────────────┼─────────────
 1 │ Create parent pom.xml     │ ✅ done     │ vp-p1-t1-done
 2 │ Create common module      │ ✅ done     │ vp-p1-t2-done
 3 │ Create tap-service        │ 🔄 progress │ vp-p1-t3
 4 │ Create location-service   │ ⏳ pending  │ -
 5 │ Docker Compose setup      │ ⏳ pending  │ -

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Command: show N
```bash
cat .viepilot/phases/{phase}/tasks/{N}-*.md
```

Display task file content with syntax highlighting.

### Command: start N
```yaml
actions:
  1. Check task not already started
  2. Check dependencies met
  3. Create git tag: vp-p{phase}-t{N}
  4. Update PHASE-STATE.md: status → in_progress
  5. Update TRACKER.md
  6. Display task objective and acceptance criteria
```

### Command: done N
```yaml
actions:
  1. Verify task exists and is in_progress
  2. Ask: "Skip verification? (not recommended)"
  3. If no skip:
     - Run automated checks
     - Check acceptance criteria
  4. Create git tag: vp-p{phase}-t{N}-done
  5. Update PHASE-STATE.md
  6. Update TRACKER.md
  7. Update CHANGELOG.md if feature/fix
```

### Command: skip N
```yaml
actions:
  1. Ask for skip reason (required)
  2. Update task status → skipped
  3. Log skip reason in PHASE-STATE.md
  4. Update TRACKER.md
  5. Move to next task or phase
```

### Command: retry N
```yaml
actions:
  1. Check task is failed or blocked
  2. Reset task status → in_progress
  3. Clear previous error state
  4. Display: "Task {N} reset. Continue with /vp-auto or manual work."
```

### Command: rollback N
```yaml
actions:
  1. Check task has been started (has tag)
  2. Confirm with user: "This will undo all changes from task {N}. Continue?"
  3. Git revert to task start tag:
     git revert --no-commit $(git rev-list vp-p{phase}-t{N}..HEAD)
  4. Reset task status → not_started
  5. Update PHASE-STATE.md
  6. Display rollback summary
```
</process>

<success_criteria>
- [ ] Command parsed correctly
- [ ] Appropriate action taken
- [ ] State files updated
- [ ] Git tags managed
- [ ] User feedback provided
</success_criteria>
