<purpose>
Restore complete project context and resume work seamlessly from a previous session.
</purpose>

<process>

<step name="check_project">
## 1. Check Project Exists

```bash
if [ ! -f ".viepilot/TRACKER.md" ]; then
  echo "No ViePilot project found"
  exit 1
fi
```

If not exists → Error and suggest `/vp-crystallize`
</step>

<step name="load_state">
## 2. Load State

### Try HANDOFF.json first (preferred)
```bash
if [ -f ".viepilot/HANDOFF.json" ]; then
  cat .viepilot/HANDOFF.json
fi
```

Parse:
- phase, phase_name
- task, task_name, total_tasks
- status
- next_action
- context_notes
- blockers
- human_actions_pending

### Fallback to TRACKER.md
```bash
cat .viepilot/TRACKER.md
```
Extract current state from file.

### Load .continue-here.md if exists
```bash
phase_dir=$(cat .viepilot/HANDOFF.json | jq -r '.phase_dir')
if [ -f "${phase_dir}/.continue-here.md" ]; then
  cat "${phase_dir}/.continue-here.md"
fi
```
</step>

<step name="check_uncommitted">
## 3. Check Uncommitted Changes

```bash
git status --porcelain
```

If changes exist:
```
⚠ Uncommitted changes detected:
{list files}

Options:
1. Continue with changes
2. Stash changes first
3. Review changes
```
</step>

<step name="rebuild_context">
## 4. Rebuild Context

Following AI-GUIDE.md strategy:

### Minimal Load (always)
```bash
cat .viepilot/AI-GUIDE.md
cat .viepilot/TRACKER.md
```

### Phase Load
```bash
cat .viepilot/phases/{phase}/PHASE-STATE.md
cat .viepilot/phases/{phase}/SPEC.md
```

### Task Load
```bash
cat .viepilot/phases/{phase}/tasks/{task}-*.md
```

### Context Required
Read `context_required` section from task file.
Load referenced files.
</step>

<step name="display_summary">
## 5. Display State Summary

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► RESUME
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Project: {project_name}
 Last Activity: {timestamp from HANDOFF}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 CURRENT STATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Phase: {phase_number} - {phase_name}
 Task:  {task_number}/{total} - {task_name}
 Status: {status}

 Progress: [████████░░] {percent}%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 CONTEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 {context_notes from HANDOFF.json}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 NEXT ACTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 {next_action from HANDOFF.json}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

If blockers exist:
```
 ⚠ BLOCKERS
 - {blocker 1}
 - {blocker 2}
```

If human actions pending:
```
 📋 HUMAN ACTIONS NEEDED
 - {action 1}
 - {action 2}
```
</step>

<step name="offer_options">
## 6. Offer Options

```
How would you like to proceed?

1. Continue from task {task} (recommended)
2. Restart current task from beginning
3. Skip to next task
4. View current task details
5. Run /vp-status for full overview
6. Start /vp-auto for autonomous mode
```

Wait for user choice.
</step>

<step name="route_action">
## 7. Route to Action

Based on user choice:

**1. Continue:**
- Context already loaded
- Display task objective
- Start working

**2. Restart:**
- Reset task state in PHASE-STATE.md
- Rollback if needed
- Start fresh

**3. Skip:**
- Ask for skip reason
- Mark task skipped
- Move to next

**4. View details:**
```bash
cat .viepilot/phases/{phase}/tasks/{task}-*.md
```
Display with syntax highlighting
Return to options

**5. Status:**
```
Skill(skill="vp-status")
```

**6. Auto:**
```
Skill(skill="vp-auto", args="--from {phase}")
```
</step>

<step name="update_session">
## 8. Update Session

```bash
# Update TRACKER.md with session start
# Mark HANDOFF.json as active (or clear it)
```

Ready to work.
</step>

</process>

<success_criteria>
- [ ] HANDOFF.json or TRACKER.md loaded
- [ ] Context rebuilt efficiently
- [ ] State summary displayed clearly
- [ ] Blockers and human actions shown
- [ ] User offered appropriate options
- [ ] Routed to correct next action
</success_criteria>
