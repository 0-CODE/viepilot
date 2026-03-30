<purpose>
Autonomous execution của project phases. Cho mỗi phase: analyze → execute tasks → verify → iterate.
Pauses at control points cho user decisions.
</purpose>

<process>

<step name="initialize">
## 1. Initialize

Parse `{{VP_ARGS}}` for flags:
- `--from N` : Start từ phase N
- `--phase N` : Chỉ chạy phase N
- `--fast` : Skip optional verifications
- `--dry-run` : Plan only

Load context:
```bash
cat .viepilot/AI-GUIDE.md
cat .viepilot/TRACKER.md
cat .viepilot/ROADMAP.md
```

Display startup banner:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► AUTONOMOUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Project: {project_name}
 Milestone: {milestone}
 Phases: {total} total, {completed} complete
```
</step>

<step name="discover_phases">
## 2. Discover Phases

Parse ROADMAP.md for phases.

Filter to incomplete phases:
- Status != "complete"
- Apply --from filter if provided
- Sort by phase number

If no incomplete phases:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► COMPLETE 🎉
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 All phases complete! 

 Next steps:
 - /vp-docs to generate documentation
 - /vp-evolve to add more features
```
Exit cleanly.
</step>

<step name="execute_phase">
## 3. Execute Phase

Display progress:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► Phase {N}/{T}: {Name} [████░░░░] {P}%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 3a. Load Phase Context
```bash
cat .viepilot/phases/{phase}/SPEC.md
cat .viepilot/phases/{phase}/PHASE-STATE.md
```

Check if phase already has completed tasks → resume from next task.

### 3b. Execute Tasks Loop

For each task in phase:

#### Load Task Context
```yaml
read:
  - .viepilot/AI-GUIDE.md
  - .viepilot/TRACKER.md
  - .viepilot/phases/{phase}/PHASE-STATE.md
  - .viepilot/phases/{phase}/tasks/{task}.md
  - context_required files from task file
```

Create git tag: `vp-p{phase}-t{task}`
Update PHASE-STATE.md: task → in_progress

#### Execute Task
1. Read task objective and acceptance criteria
2. Read SYSTEM-RULES.md for coding standards
3. Load any required schemas
4. Implement according to task specification
5. Atomic commits per logical unit:
   ```bash
   git commit -m "{type}({scope}): {description}"
   ```
6. Log notes in task file if needed

#### Verify Task
```yaml
automated:
  - Run commands from task verification section
  - Check expected outputs

manual:
  - Present to user if defined
  - Ask for confirmation

quality_gate:
  - acceptance_criteria_met: true
  - automated_tests_pass: true
  - no_lint_errors: true
```

#### Handle Result

**PASS:**
- Create git tag: `vp-p{phase}-t{task}-done`
- Update PHASE-STATE.md: task → done
- Update TRACKER.md
- Update CHANGELOG.md if feature/fix
- Move to next task

**PARTIAL (some checks fail):**
- Attempt auto-fix
- Re-verify
- If still fail → control point

**FAIL:**
→ Go to handle_blocker
</step>

<step name="update_state">
## 4. Update State

After each task:
```yaml
update:
  - PHASE-STATE.md: task status, timestamp
  - TRACKER.md: current state, progress
  - HANDOFF.json: latest position
  - CHANGELOG.md: if feature/fix completed
```
</step>

<step name="phase_complete">
## 5. Phase Complete

When all tasks in phase are done/skipped:

1. Run phase-level verification
2. Check phase quality gate
3. Write SUMMARY.md:
   ```markdown
   # Phase {N}: {Name} - Summary
   
   ## Completed
   - Task 1: {description}
   - Task 2: {description}
   
   ## Skipped
   - Task 3: {reason}
   
   ## Key Decisions
   - {decision}
   
   ## Files Changed
   - {file list}
   
   ## Notes
   - {any notes}
   ```
4. Create git tag: `vp-p{phase}-complete`
5. Check version bump needed:
   - Features added → MINOR
   - Fixes only → PATCH
6. Update TRACKER.md
</step>

<step name="iterate">
## 6. Iterate

After phase complete:
1. Re-read ROADMAP.md (catch inserted phases)
2. Check TRACKER.md for blockers
3. If more phases → loop to step 3
4. If all complete → milestone complete

Milestone complete:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► MILESTONE COMPLETE 🎉
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Milestone: {name}
 Phases: {count} complete
 Version: {version}

 Next steps:
 - /vp-docs to generate documentation
 - /vp-evolve to start next milestone
```
</step>

<step name="handle_blocker">
## 7. Handle Blocker

At any control point:
```
⚠ Phase {N} ({Name}): Issue Encountered

{description of issue}

Options:
1. Fix and retry - Attempt to fix the issue
2. Skip task - Mark as skipped and continue
3. Rollback task - Undo changes from this task
4. Stop autonomous - Exit with progress summary
```

**Fix and retry:**
- Re-attempt the failed step
- If still fails → re-present options

**Skip task:**
- Ask for skip reason
- Log in PHASE-STATE.md
- Continue to next task

**Rollback:**
```bash
git revert --no-commit $(git rev-list vp-p{phase}-t{task}..HEAD)
```
- Reset task → not_started
- Continue or stop

**Stop:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► STOPPED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Progress saved.
 
 Completed: {list}
 Skipped: {list}
 Remaining: {list}

 Resume with: /vp-resume
 Or continue: /vp-auto --from {next_phase}
```
</step>

</process>

<success_criteria>
- [ ] Phases executed in order
- [ ] Tasks tracked with git tags
- [ ] State updated after each task
- [ ] Quality gates enforced
- [ ] CHANGELOG updated for features/fixes
- [ ] Checkpoints created for recovery
- [ ] Clean stop with summary on pause/error
</success_criteria>
