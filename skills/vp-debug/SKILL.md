---
name: vp-debug
description: "Systematic debugging with persistent state tracking across sessions"
version: 0.2.0
---

<greeting>
## Invocation Banner

Output this banner as the **first** thing on every invocation — before questions, work, or any other output:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► VP-DEBUG  v0.2.0 (fw 2.19.0)
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
- Skill được gọi khi user mention `vp-debug`, `/vp-debug`, "debug", "gỡ lỗi"
- Treat all user text after the skill mention as `{{VP_ARGS}}`

## B. User Prompting
Prompt user conversationally. Guide through systematic debugging steps.

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

- **Investigate + log** session; does **not** merge default shipping fixes until user **explicit** (*fix now*, *hotfix*) or routes **`/vp-request` → `/vp-evolve` → `/vp-auto`**. Small patches only to **reproduce** are OK if the user agrees. See `workflows/debug.md`.
</implementation_routing_guard>


<objective>
Systematic debugging with persistent state tracking. Helps track issues across multiple sessions.

**Creates/Updates:**
- `.viepilot/debug/session-{id}.json` - Debug session state
- `.viepilot/debug/CURRENT.json` - Active session pointer

**Modes:**
- `new` - Start new debug session
- `continue` - Continue current session
- `list` - List all sessions
- `close` - Close current session with resolution

**Architecture diagram intake (ENH-018):**
- If `.viepilot/ARCHITECTURE.md` has diagram applicability matrix, consume it before deep debugging.
- Prioritize investigation context from diagrams marked `required`.
- For `optional` diagrams: use when available; do not block debug flow if missing.
- For `N/A` diagrams: respect rationale and avoid forcing diagram creation during debug.
</objective>

<execution_context>
@$HOME/{envToolDir}/workflows/debug.md
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
Execute workflow from `@$HOME/{envToolDir}/workflows/debug.md`

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
2. **Load Architecture Context**: Read `.viepilot/ARCHITECTURE.md` matrix status (`required|optional|N/A`) and relevant Mermaid diagrams if present
3. **Hypothesize**: Generate possible causes
4. **Test**: Run tests to confirm/reject hypotheses
5. **Track**: Log all findings
6. **Resolve**: Document fix and root cause
7. **Close**: Mark session complete
</process>

<success_criteria>
- [ ] Session created with problem description
- [ ] Hypotheses tracked with status
- [ ] Tests logged with outputs
- [ ] Findings documented
- [ ] Resolution recorded (if resolved)
- [ ] State persists across sessions
</success_criteria>
