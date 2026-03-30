<purpose>
Save complete work state để có thể resume từ bất kỳ context nào.
Creates HANDOFF.json và .continue-here.md cho recovery.
</purpose>

<process>

<step name="detect">
## 1. Detect Current Position

```bash
# Read current state
cat .viepilot/TRACKER.md
```

Extract: current_phase, current_task

If unclear, find from recent files:
```bash
ls -lt .viepilot/phases/*/PHASE-STATE.md | head -1
```

If still unclear, ask user which phase/task they're on.
</step>

<step name="gather">
## 2. Gather State

Collect complete state:

### 1. Current Position
- Phase number and name
- Task number and name
- Line/function if applicable

### 2. Work Completed (this session)
```bash
git log --oneline --since="8 hours ago"
```
- List commits made
- Summarize changes

### 3. Work Remaining
- Read PHASE-STATE.md
- List incomplete tasks
- Estimate remaining effort

### 4. Decisions Made
- Check git commits for decisions
- Ask user for any unlisted decisions

### 5. Blockers/Issues
- Any errors encountered?
- Anything stuck?

### 6. Human Actions Pending
- Manual setup needed?
- API keys/credentials?
- External approvals?

### 7. Background Processes
- Dev servers running?
- Watchers active?

### 8. Uncommitted Files
```bash
git status --porcelain
```

Ask user for clarifications if needed.
</step>

<step name="write_handoff_json">
## 3. Write HANDOFF.json

```bash
timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
```

Create `.viepilot/HANDOFF.json`:
```json
{
  "version": "1.0",
  "timestamp": "{timestamp}",
  "phase": "{phase_number}",
  "phase_name": "{phase_name}",
  "phase_dir": ".viepilot/phases/{phase_slug}",
  "task": {task_number},
  "task_name": "{task_name}",
  "total_tasks": {total},
  "status": "paused",
  "completed_tasks": [
    {
      "id": 1,
      "name": "{name}",
      "status": "done",
      "commit": "{short_hash}"
    }
  ],
  "remaining_tasks": [
    {
      "id": 3,
      "name": "{name}",
      "status": "not_started"
    }
  ],
  "blockers": [
    {
      "description": "{description}",
      "type": "technical|human_action|external",
      "workaround": "{if any}"
    }
  ],
  "human_actions_pending": [
    {
      "action": "{what}",
      "context": "{why}",
      "blocking": true
    }
  ],
  "decisions": [
    {
      "decision": "{what}",
      "rationale": "{why}",
      "phase": "{phase}"
    }
  ],
  "uncommitted_files": ["{file1}", "{file2}"],
  "next_action": "{specific first action when resuming}",
  "context_notes": "{mental state, approach, what you were thinking}"
}
```
</step>

<step name="write_continue_here">
## 4. Write .continue-here.md

Create `.viepilot/phases/{phase}/.continue-here.md`:

```markdown
---
phase: {phase_slug}
task: {task_number}
total_tasks: {total}
status: in_progress
last_updated: {timestamp}
---

<current_state>
Phase {N}: {Phase Name}
Task {T}: {Task Name}

Currently working on: {specific detail}
</current_state>

<completed_work>
- Task 1: {name} - Done ✅
- Task 2: {name} - Done ✅
- Task 3: {name} - In progress (60%)
  - Completed: {what's done}
  - Remaining: {what's left}
</completed_work>

<remaining_work>
- Task 3: {what's left to do}
- Task 4: {name} - Not started
- Task 5: {name} - Not started
</remaining_work>

<decisions_made>
- Decided to use {X} because {reason}
- Chose {approach} over {alternative} because {reason}
</decisions_made>

<blockers>
- {Blocker 1}: {status/workaround}
- None currently
</blockers>

<human_actions>
- {Action needed}: {context}
- None pending
</human_actions>

<context>
Mental state: {what you were thinking}
Approach: {the plan you were following}
Notes: {any important notes}
</context>

<next_action>
Start with: {specific first action when resuming}

Commands to run:
1. {command}
2. {command}
</next_action>
```
</step>

<step name="commit">
## 5. Git Commit

```bash
git add -A
git commit -m "wip({phase}): paused at task {task}/{total}

State saved for resume:
- Phase: {phase_name}
- Task: {task_name}
- Status: {status}

Resume with: /vp-resume"
git push
```
</step>

<step name="confirm">
## 6. Confirm

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► PAUSED ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Work paused successfully.

 Current State:
 ├── Phase: {phase_name}
 ├── Task: {task} of {total}
 ├── Status: {status}
 └── Blockers: {count}

 Files Saved:
 ├── .viepilot/HANDOFF.json
 └── .viepilot/phases/{phase}/.continue-here.md

 Committed as WIP.

 ─────────────────────────────────────────────────
 To resume: /vp-resume
 ─────────────────────────────────────────────────
```
</step>

</process>

<success_criteria>
- [ ] HANDOFF.json created with complete state
- [ ] .continue-here.md created with human-readable context
- [ ] All sections filled with specific content
- [ ] Uncommitted changes identified
- [ ] Git WIP commit created
- [ ] User knows how to resume
</success_criteria>
