<purpose>
Resume work từ previous session với tiered context restore.
Tier is determined by gap since last HANDOFF.json write — not hardcoded.
</purpose>

<process>

<step name="check_project">
## 1. Check Project Exists

```bash
ls .viepilot/TRACKER.md .viepilot/HANDOFF.json
```
If not exists → Error: "No ViePilot project found. Run `/vp-crystallize` first."
</step>

<step name="detect_tier">
## 2. Detect Restore Tier

Read `.viepilot/HANDOFF.json` → check `meta.last_written`.

```
gap = now() - meta.last_written

if meta.last_written is null:
  → FULL restore (first session or corrupted state)

elif gap < 30 minutes:
  → QUICK restore

elif gap < 4 hours:
  → STANDARD restore

else:
  → FULL restore
```

Also check: if `control_point.active == true` → display control point banner first (regardless of tier).
</step>

<step name="quick_restore">
## 3a. QUICK Restore (gap < 30 min)

Batch read in 1 turn:
- `.viepilot/HANDOFF.json`
- `.viepilot/phases/{position.phase}/PHASE-STATE.md`

Display:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► RESUME (Quick)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Task: {position.task} — {task_name}
 Sub-task: {position.sub_task or "not started"}
 Gap: {gap_minutes}min
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Resume immediately from `position.sub_task` if mid-task.
</step>

<step name="standard_restore">
## 3b. STANDARD Restore (30 min – 4 hours)

Batch read in 1 turn:
- `.viepilot/HANDOFF.json`
- `.viepilot/phases/{position.phase}/PHASE-STATE.md`
- `.viepilot/phases/{position.phase}/tasks/{position.task}.md`

Display:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► RESUME (Standard)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Phase: {position.phase}
 Task: {position.task} — {task_name}
 Status: {execution_state.status}
 Last decision: {context.last_decision or "—"}
 Gap: {gap_hours}h
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Resume. No user confirmation needed.
</step>

<step name="full_restore">
## 3c. FULL Restore (> 4 hours or null last_written)

Batch read in 1 turn:
- `.viepilot/HANDOFF.json`
- `.viepilot/TRACKER.md`
- `.viepilot/phases/{position.phase}/PHASE-STATE.md`
- `.viepilot/phases/{position.phase}/tasks/{position.task}.md`

Then load active stacks (if context.active_stacks non-empty):
- Read each `~/.viepilot/stacks/{stack}/SUMMARY.md`

Then read HANDOFF.log tail (if file exists — skip silently if absent):
- Read last 20 lines of `.viepilot/HANDOFF.log`

Display:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► RESUME (Full Context Restore)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Project: {project_name}
 Phase: {position.phase} — {phase_name}
 Task: {position.task} — {task_name}
 Status: {execution_state.status}
 Last decision: {context.last_decision or "—"}
 Active stacks: {context.active_stacks or "none"}
 Recovery activity: L1={l1_attempts} L2={l2_attempts} L3={l3_attempts}
 Gap: {gap_hours}h

 Recent events:
 {last 5 HANDOFF.log events, formatted}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Ask user before resuming:**
```
Ready to resume task {position.task}?
1. Yes — continue from current position
2. Restart task — reset to not_started
3. View task details — show task file
4. Run /vp-auto — switch to autonomous mode
```
</step>

<step name="control_point_banner">
## 4. Control Point Banner (if active)

If `HANDOFF.json.control_point.active == true`, display FIRST (any tier):
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
Then continue with tier-appropriate restore.
</step>

<step name="uncommitted_check">
## 5. Check Uncommitted Changes

```bash
git status --porcelain
```
If changes exist → warn user before resuming:
```
⚠ Uncommitted changes detected. Commit or stash before resuming?
1. Commit now (will prompt for message)
2. Stash changes
3. Resume anyway (risk: state mismatch)
```
</step>

</process>

<success_criteria>
- [ ] Tier detection from meta.last_written gap (not hardcoded)
- [ ] Quick restore: reads only 2 files in 1 batch turn
- [ ] Standard restore: reads 3 files in 1 batch turn
- [ ] Full restore: reads HANDOFF.log tail + active_stacks; user confirmation before resume
- [ ] Control point banner shown first if control_point.active == true
- [ ] Gracefully handles missing HANDOFF.log (first session)
- [ ] null last_written → FULL tier (safe default)
</success_criteria>
