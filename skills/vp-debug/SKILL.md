---
name: vp-debug
description: "Systematic debugging with persistent state tracking across sessions"
version: 0.1.0
---

<cursor_skill_adapter>
## A. Skill Invocation
- Skill được gọi khi user mention `vp-debug`, `/vp-debug`, "debug", "gỡ lỗi"
- Treat all user text after the skill mention as `{{VP_ARGS}}`

## B. User Prompting
Prompt user conversationally. Guide through systematic debugging steps.

## C. Tool Usage
Use Cursor tools: `Shell`, `ReadFile`, `Glob`, `rg`, `ApplyPatch`, `WebSearch`, `WebFetch`, `Subagent`
</cursor_skill_adapter>

<objective>
Systematic debugging với persistent state tracking. Giúp track vấn đề qua nhiều sessions.

**Creates/Updates:**
- `.viepilot/debug/session-{id}.json` - Debug session state
- `.viepilot/debug/CURRENT.json` - Active session pointer

**Modes:**
- `new` - Start new debug session
- `continue` - Continue current session
- `list` - List all sessions
- `close` - Close current session with resolution
</objective>

<execution_context>
@$HOME/.cursor/viepilot/workflows/debug.md
</execution_context>

<context>
Optional flags:
- `--new` : Force new session
- `--continue` : Continue current session
- `--list` : List all sessions
- `--close [resolved|unresolved|wontfix]` : Close session
- `--id <session_id>` : Work with specific session
</context>

<process>
Execute workflow from `@$HOME/.cursor/viepilot/workflows/debug.md`

### Debug Session Structure
```json
{
  "id": "debug-{timestamp}",
  "status": "active|resolved|unresolved|wontfix",
  "created_at": "ISO timestamp",
  "updated_at": "ISO timestamp",
  "problem": {
    "description": "User's problem description",
    "symptoms": ["symptom1", "symptom2"],
    "error_messages": ["error1"],
    "affected_files": ["file1.js"]
  },
  "investigation": {
    "hypotheses": [
      {"id": 1, "description": "...", "status": "testing|confirmed|rejected"}
    ],
    "tests_run": [
      {"command": "...", "output": "...", "timestamp": "..."}
    ],
    "findings": ["finding1", "finding2"]
  },
  "resolution": {
    "root_cause": "Description of root cause",
    "fix_applied": "Description of fix",
    "files_changed": ["file1.js"],
    "verification": "How it was verified"
  }
}
```

### Key Steps
1. **Start Session**: Gather problem description
2. **Hypothesize**: Generate possible causes
3. **Test**: Run tests to confirm/reject hypotheses
4. **Track**: Log all findings
5. **Resolve**: Document fix and root cause
6. **Close**: Mark session complete
</process>

<success_criteria>
- [ ] Session created with problem description
- [ ] Hypotheses tracked with status
- [ ] Tests logged with outputs
- [ ] Findings documented
- [ ] Resolution recorded (if resolved)
- [ ] State persists across sessions
</success_criteria>
