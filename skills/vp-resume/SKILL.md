---
name: vp-resume
description: "Resume work từ previous session với full context restoration"
version: 0.1.0
---

<cursor_skill_adapter>
## A. Skill Invocation
- Skill được gọi khi user mention `vp-resume`, `/vp-resume`, "resume", "tiếp tục", "where was i"
- Treat all user text after the skill mention as `{{VP_ARGS}}`

## B. User Prompting
Prompt user conversationally với options.

## C. Tool Usage
Use Cursor tools: `Shell`, `StrReplace`, `Read`, `Write`, `Glob`, `Grep`
</cursor_skill_adapter>

<objective>
Restore complete project context và resume work seamlessly.

**Reads:**
- `.viepilot/HANDOFF.json`
- `.viepilot/TRACKER.md`
- `.viepilot/phases/{phase}/.continue-here.md`

**After:** Context restored, ready to continue or route to appropriate action.
</objective>

<execution_context>
@$HOME/.cursor/viepilot/workflows/resume-work.md
</execution_context>

<process>
Execute workflow from `@$HOME/.cursor/viepilot/workflows/resume-work.md`

### Step 1: Check Project Exists
```bash
ls .viepilot/TRACKER.md
```
If not exists → Error: "No ViePilot project found. Run `/vp-crystallize` first."

### Step 2: Load State

**Try HANDOFF.json first (preferred):**
```bash
cat .viepilot/HANDOFF.json
```
Parse: phase, task, status, next_action, context_notes

**Fallback to TRACKER.md:**
```bash
cat .viepilot/TRACKER.md
```
Extract current state from Progress Overview section.

**Load .continue-here.md if exists:**
```bash
cat .viepilot/phases/{phase}/.continue-here.md
```

### Step 3: Check Uncommitted Changes
```bash
git status --porcelain
```
If changes exist, warn user and ask how to proceed.

### Step 4: Rebuild Context
Following AI-GUIDE.md strategy:
```yaml
minimal_load:
  - AI-GUIDE.md
  - TRACKER.md
  - PHASE-STATE.md (current phase)

task_load:
  - tasks/{current_task}.md
  - context_required files from task
```

### Step 5: Display State Summary
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► RESUME
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Project: {project_name}
 Last Activity: {timestamp}

 Current State:
 ├── Phase: {phase_number} - {phase_name}
 ├── Task: {task_number}/{total} - {task_name}
 ├── Status: {status}
 └── Progress: [████████░░] {percent}%

 Context Notes:
 {context_notes from HANDOFF.json}

 Next Action:
 {next_action from HANDOFF.json}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 6: Offer Options
Prompt user:
```
How would you like to proceed?

1. Continue from task {task} (recommended)
2. Restart current task
3. Skip to next task
4. View task details
5. Run /vp-status for full overview
6. Start /vp-auto for autonomous mode
```

### Step 7: Route to Action
Based on user choice:
- **Continue** → Load task context, start working
- **Restart** → Reset task state, start fresh
- **Skip** → Mark task skipped, move to next
- **View** → Display task file content
- **Status** → `Skill(skill="vp-status")`
- **Auto** → `Skill(skill="vp-auto", args="--from {phase}")`

### Step 8: Update Session
```bash
# Update TRACKER.md with session info
# Clear HANDOFF.json (now active)
```
</process>

<success_criteria>
- [ ] HANDOFF.json or TRACKER.md loaded
- [ ] Context rebuilt efficiently
- [ ] State summary displayed clearly
- [ ] User offered appropriate options
- [ ] Routed to correct next action
- [ ] Session continuity maintained
</success_criteria>
