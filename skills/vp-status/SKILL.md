---
name: vp-status
description: "Display progress dashboard and actionable insights"
version: 0.1.1
---

<greeting>
## Invocation Banner

Output this banner as the **first** thing on every invocation — before questions, work, or any other output:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► VP-STATUS  v0.1.1 (fw 2.19.0)
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
- Skill được gọi khi user mention `vp-status`, `/vp-status`, "status", "tiến độ", "đang ở đâu"
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

- **Read-only / dashboard** — does not implement shipping; **`/vp-evolve`** → **`/vp-auto`**. See `workflows/request.md`.
</implementation_routing_guard>


<objective>
Display a visual progress dashboard with actionable insights.

**Reads:**
- `.viepilot/TRACKER.md`
- `.viepilot/ROADMAP.md`
- `.viepilot/phases/*/PHASE-STATE.md`
- `CHANGELOG.md`

**Output:** Dashboard display with next action suggestions.
</objective>

<process>

### Step 1: Load State
```bash
cat .viepilot/TRACKER.md
cat .viepilot/ROADMAP.md
```

### Step 2: Calculate Progress
For each phase:
- Count total tasks
- Count completed tasks
- Calculate percentage

Overall:
- Total phases
- Completed phases
- Overall percentage

### Step 3: Display Dashboard
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Project: {project_name}
 Version: {current_version}
 Milestone: {milestone_name}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PHASE PROGRESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Phase 1: Project Setup       [██████████] 100% ✅
 Phase 2: Database Foundation [████████░░]  80% 🔄
 Phase 3: TAP Service Core    [░░░░░░░░░░]   0% ⏳
 Phase 4: Location Service    [░░░░░░░░░░]   0% ⏳
 Phase 5: API Gateway         [░░░░░░░░░░]   0% ⏳

 ─────────────────────────────────────────────────────────────────
 Overall Progress:            [████░░░░░░]  36%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 CURRENT STATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Current Phase: 02 - Database Foundation
 Current Task:  4/5 - Create TimescaleDB hypertables
 Task Status:   In Progress

 Last Activity: 2 hours ago
 Last Commit:   feat(db): create vehicle/device tables

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 QUALITY METRICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Tests:     45 pass, 2 fail ⚠️
 Coverage:  72%
 Lint:      0 errors, 3 warnings

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 DECISIONS & BLOCKERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Decisions Made: 24 total, 21 locked, 3 pending
 Blockers: 0 active

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 NEXT ACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Recommended: Fix 2 failing tests, then continue task 4

 Quick Actions:
 1. Continue current task    → /vp-auto --from 2
 2. View failing tests       → (show test output)
 3. View current task        → (show task file)
 4. Pause work              → /vp-pause

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 4: Offer Quick Actions
Based on state, offer relevant actions:

If tests failing:
- "Fix failing tests"
- "View test output"

If task in progress:
- "Continue task"
- "View task details"

If phase complete:
- "Start next phase"
- "Review phase summary"

If blockers:
- "View blockers"
- "Skip blocked task"
</process>

<success_criteria>
- [ ] All progress calculated correctly
- [ ] Visual dashboard displayed
- [ ] Current state clearly shown
- [ ] Quality metrics included
- [ ] Actionable next steps suggested
</success_criteria>
