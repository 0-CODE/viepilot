---
name: vp-auto
description: "Autonomous execution loop với control points và recovery"
version: 0.1.0
---

<cursor_skill_adapter>
## A. Skill Invocation
- Skill được gọi khi user mention `vp-auto`, `/vp-auto`, "auto", "vibe", "chạy tự động"
- Treat all user text after the skill mention as `{{VP_ARGS}}`

## B. User Prompting
Prompt user conversationally với numbered list options tại control points.

## C. Tool Usage
Use Cursor tools: `Shell`, `StrReplace`, `Read`, `Write`, `Glob`, `Grep`, `Task`

## D. Subagent Spawning
Use `Task(subagent_type="generalPurpose", ...)` for parallel execution.
</cursor_skill_adapter>

<objective>
Autonomous execution của project phases. Cho mỗi phase: analyze → plan → execute → verify → iterate.

Pauses at control points:
- Conflicts detected
- Quality gate failures
- User decision needed
- Blockers encountered

**Updates:**
- `.viepilot/TRACKER.md`
- `.viepilot/phases/*/PHASE-STATE.md`
- `.viepilot/HANDOFF.json`

**After:** Project built, or paused for user intervention.
</objective>

<execution_context>
@$HOME/.cursor/viepilot/workflows/autonomous.md
</execution_context>

<context>
Optional flags:
- `--from N` : Start từ phase N
- `--phase N` : Chỉ chạy phase N
- `--fast` : Skip optional verifications
- `--dry-run` : Plan only, no execution
</context>

<process>
Execute workflow from `@$HOME/.cursor/viepilot/workflows/autonomous.md`

### 1. Initialize
```bash
# Load context
Read AI-GUIDE.md → minimal context strategy
Read TRACKER.md → current state
Read ROADMAP.md → phases list
```

Display startup banner:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► AUTONOMOUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Project: {project_name}
 Phase: {current_phase}/{total_phases}
 Progress: [████░░░░░░] {percent}%
```

### 2. Select Phase
- Find first incomplete phase
- Or resume in_progress phase
- Check dependencies met

### 3. Execute Phase Loop

For each task in phase:

#### 3a. Load Task Context
```yaml
Read:
- AI-GUIDE.md (always)
- TRACKER.md (always)
- PHASE-STATE.md (current phase)
- tasks/{task}.md (current task)
- context_required files (from task)
```

Create git tag: `vp-p{phase}-t{task}`

#### 3b. Execute Task
- Implement according to objective
- Follow acceptance criteria
- Write tests if required
- Atomic commits per sub-task
- Log notes in task file

#### 3c. Verify Task
```yaml
automated:
  - Run defined commands
  - Check expected outputs
manual:
  - Present if defined
  - Ask user if required
quality_gate:
  - All acceptance criteria checked
  - Automated tests pass
  - No lint errors
```

#### 3d. Handle Result
- **PASS** → Mark task done, create tag `-done`, next task
- **PARTIAL** → Retry with fix
- **FAIL** → Control point (retry/skip/rollback/stop)

### 4. Update State
After each task:
- Update PHASE-STATE.md
- Update TRACKER.md
- Update HANDOFF.json
- Update CHANGELOG.md (if feature/fix)

### 5. Phase Complete
When all tasks done:
- Run phase verification
- Check phase quality gate
- Write SUMMARY.md
- Create git tag: `vp-p{phase}-complete`
- Increment version if needed

### 6. Iterate
- More phases? → Loop to step 2
- All complete? → Suggest `/vp-docs`

### 7. Handle Blockers
At any control point, offer:
1. Fix and retry
2. Skip (with reason)
3. Rollback
4. Stop autonomous mode

Display progress summary on stop.
</process>

<success_criteria>
- [ ] Phases executed in dependency order
- [ ] Tasks tracked with git tags
- [ ] Quality gates enforced
- [ ] State updated after each task
- [ ] Checkpoints created for recovery
- [ ] CHANGELOG updated for features/fixes
- [ ] Clean stop with summary on pause/error
</success_criteria>
