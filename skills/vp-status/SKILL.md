---
name: vp-status
description: "Hiển thị progress dashboard, control point detection, và recovery stats"
version: 2.0.0
paths: [".viepilot/TRACKER.md"]
---

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

- **Read-only / dashboard** — không implement shipping; **`/vp-evolve`** → **`/vp-auto`**. Xem `workflows/request.md`.
</implementation_routing_guard>


<objective>
Hiển thị visual progress dashboard với actionable insights.
Detects control point state và recovery activity từ HANDOFF.json.

**Reads (batch in 1 turn):**
- `.viepilot/HANDOFF.json` — control_point + recovery stats (always first)
- `.viepilot/TRACKER.md`
- `.viepilot/ROADMAP.md`

**Conditional:**
- `.viepilot/phases/{current_phase}/PHASE-STATE.md` (when phase in progress)

**Output:** Control point banner (if active) + dashboard display + next action suggestions.
</objective>

<process>

### Step 1: Load State (batch — call all Read tools simultaneously)
```bash
cat .viepilot/HANDOFF.json    # FIRST — control point check
cat .viepilot/TRACKER.md
cat .viepilot/ROADMAP.md
```

### Step 1b: Control Point Detection

**Check HANDOFF.json.control_point.active BEFORE rendering dashboard.**

If `control_point.active == true`, display prominently:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ⚠ CONTROL POINT ACTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Task: {position.task}
 Reason: {control_point.reason}
 Since: {control_point.ts}

 Run /vp-auto to resolve
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

If `control_point.active == false` (or absent): skip banner, continue to dashboard.

### Step 1c: Recovery Stats (from HANDOFF.json.recovery.*)

Only show when any attempt count > 0 (don't clutter clean runs):
```
Recovery Activity:
  L1 (lint/format):  {l1_attempts} attempts
  L2 (test fix):     {l2_attempts} attempts
  L3 (scope reduce): {l3_attempts} attempts
```
Display this section just below CURRENT STATE in dashboard.

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
- [ ] HANDOFF.json read first (before dashboard render)
- [ ] control_point.active == true → banner displayed prominently, before all other output
- [ ] control_point.active == false → no banner (no clutter)
- [ ] Recovery stats shown when any l1/l2/l3_attempts > 0
- [ ] Recovery stats NOT shown on clean runs (all counts = 0)
- [ ] All progress calculated correctly
- [ ] Visual dashboard displayed
- [ ] Current state clearly shown
- [ ] Actionable next steps suggested
</success_criteria>
