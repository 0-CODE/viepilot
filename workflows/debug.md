<purpose>
Systematic debugging workflow với persistent state tracking.
Giúp organize debugging process và track progress qua nhiều sessions.
</purpose>

## ViePilot Skill Scope Policy (BUG-004)

- Default behavior: only use and suggest skills under `vp-*`.
- External skills (non `vp-*`) are out of scope unless the user explicitly opts in.
- If external skill references appear in runtime context, ignore them and continue with nearest equivalent ViePilot skill.


<process>

<step name="initialize">
## 1. Initialize Debug Environment

```bash
mkdir -p .viepilot/debug
```

Check for active session:
```bash
cat .viepilot/debug/CURRENT.json 2>/dev/null
```

Parse `{{VP_ARGS}}` for flags:
- `--new` : Force new session
- `--continue` : Continue current
- `--list` : List sessions
- `--close` : Close session
- `--id <id>` : Specific session
</step>

<step name="route_action">
## 2. Route Action

**If --list:**
```bash
ls -la .viepilot/debug/session-*.json
```
Display sessions with status and dates.

**If --close:**
Go to step 7 (Close Session).

**If --continue or active session exists:**
Load session and go to step 4 (Continue Investigation).

**If --new or no active session:**
Go to step 3 (New Session).
</step>

<step name="new_session">
## 3. New Debug Session

Ask user:
```
Mô tả vấn đề bạn đang gặp:
1. Vấn đề là gì?
2. Triệu chứng? (error messages, behavior)
3. Khi nào xảy ra? (điều kiện)
4. Files liên quan?
```

Create session:
```json
{
  "id": "debug-{YYYYMMDD-HHMMSS}",
  "status": "active",
  "created_at": "{ISO}",
  "updated_at": "{ISO}",
  "problem": {
    "description": "{user input}",
    "symptoms": [],
    "error_messages": [],
    "affected_files": []
  },
  "investigation": {
    "hypotheses": [],
    "tests_run": [],
    "findings": []
  },
  "resolution": null
}
```

Save to `.viepilot/debug/session-{id}.json`
Update `.viepilot/debug/CURRENT.json`:
```json
{"active_session": "debug-{id}"}
```
</step>

<step name="continue_investigation">
## 4. Continue Investigation

Load current session state.

Display status:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 DEBUG SESSION: {id}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Problem: {description}
 Status: {status}
 
 Hypotheses:
 {list with status}
 
 Findings:
 {list}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Offer actions:
1. Add hypothesis
2. Test hypothesis
3. Add finding
4. Mark hypothesis confirmed/rejected
5. Resolve issue
6. Close session
</step>

<step name="generate_hypotheses">
## 5. Generate/Add Hypotheses

If user requests, AI generates hypotheses based on:
- Problem description
- Error messages
- Affected files content
- Common patterns

Add to session:
```json
{
  "id": {next_id},
  "description": "Hypothesis description",
  "status": "pending",
  "created_at": "{ISO}"
}
```

Display updated hypotheses list.
</step>

<step name="test_hypothesis">
## 6. Test Hypothesis

For selected hypothesis:
1. Suggest test approach
2. Run test commands
3. Log results:

```json
{
  "hypothesis_id": {id},
  "command": "command run",
  "output": "output captured",
  "conclusion": "supports|contradicts|inconclusive",
  "timestamp": "{ISO}"
}
```

Update hypothesis status based on results.
</step>

<step name="close_session">
## 7. Close Session

Ask for resolution type:
1. **resolved** - Problem fixed
2. **unresolved** - Giving up for now
3. **wontfix** - Not going to fix

**If resolved:**
Ask for:
- Root cause
- Fix applied
- Files changed
- How verified

Update session:
```json
{
  "status": "resolved",
  "resolution": {
    "root_cause": "...",
    "fix_applied": "...",
    "files_changed": [...],
    "verification": "..."
  }
}
```

**If unresolved/wontfix:**
```json
{
  "status": "unresolved|wontfix",
  "resolution": {
    "notes": "Why closing without fix"
  }
}
```

Remove CURRENT.json pointer.

Display summary:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 DEBUG SESSION CLOSED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Session: {id}
 Status: {status}
 Duration: {time}
 
 Hypotheses tested: {count}
 Findings: {count}
 
 {Resolution summary if resolved}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
</step>

</process>

<commands>
User commands during debug session:

- `/hypothesis <description>` - Add new hypothesis
- `/test <hypothesis_id>` - Test specific hypothesis
- `/finding <description>` - Add finding
- `/confirm <hypothesis_id>` - Mark hypothesis confirmed
- `/reject <hypothesis_id>` - Mark hypothesis rejected
- `/resolve` - Start resolution process
- `/close` - Close session
- `/status` - Show current status
</commands>

<success_criteria>
- [ ] Session state persists across tool restarts
- [ ] Hypotheses tracked with status
- [ ] Tests logged with outputs
- [ ] Resolution documented
- [ ] Clean session lifecycle (create → investigate → close)
</success_criteria>
