---
name: vp-auto
description: "Autonomous execution loop với control points và recovery"
version: 0.2.2
---

<cursor_skill_adapter>
## A. Skill Invocation
- Skill được gọi khi user mention `vp-auto`, `/vp-auto`, "auto", "vibe", "chạy tự động"
- Treat all user text after the skill mention as `{{VP_ARGS}}`

## B. User Prompting
Prompt user conversationally với numbered list options tại control points.

## C. Tool Usage
Use Cursor tools: `Shell`, `ReadFile`, `Glob`, `rg`, `ApplyPatch`, `WebSearch`, `WebFetch`, `Subagent`

## D. Subagent Spawning
Use `Task(subagent_type="generalPurpose", ...)` for parallel execution.
</cursor_skill_adapter>
<scope_policy>
## ViePilot Namespace Guard (BUG-004)
- Default mode: only use and reference `vp-*` skills in ViePilot workflows.
- External skills (`non vp-*`) are out of framework scope unless user explicitly opts in.
- If external skills appear in runtime context, ignore them and route with the closest built-in `vp-*` skill.
</scope_policy>

<implementation_routing_guard>
## Primary implementation lane (ENH-021)

- **`/vp-auto`** + `workflows/autonomous.md` là **lane mặc định** để **implement** work đã có **phase/task plan** (doc-first **BUG-001**, git persistence **BUG-003**). **`/vp-request`** và **`/vp-evolve`** **không** thay thế lane này trừ user **explicit** override.
</implementation_routing_guard>


<objective>
Autonomous execution của project phases. Cho mỗi phase: analyze → plan → execute → verify → iterate.

Pauses at control points:
- Conflicts detected
- Quality gate failures
- User decision needed
- Blockers encountered

**Updates after each task:**
- `.viepilot/TRACKER.md`
- `.viepilot/phases/*/PHASE-STATE.md`
- `.viepilot/HANDOFF.json`
- `CHANGELOG.md` (if feature/fix)
- `.viepilot/ROADMAP.md` when task completion changes phase progress/status

**Git persistence gate before PASS (BUG-003):**
- Task/phase cannot be marked PASS if git is not durably persisted.
- Required checks:
  - `git status --porcelain` must be empty
  - upstream branch must exist (`git rev-parse ... @{u}`)
  - no unpushed commits (`git rev-list --count @{u}..HEAD` equals `0`)
- Recommended single check: `node bin/vp-tools.cjs git-persistence --strict`
- On failure: route to control point (retry commit/push, rollback, or stop).

**Mandatory task decomposition before implementation:**
- Objective with concrete expected outcome
- Exact file paths to create/modify
- Per-file description (what + why)
- Best practices to apply (stack + coding conventions)
- Verification commands and expected output

If required task details are missing, do not implement until task contract is refined.

**Doc-first gate before implementation (BUG-001):**
- After contract validation and **before** any deliverable code/doc edits: the task `.md` MUST hold a real written plan (`Paths` + `File-Level Plan` or bullet **Implementation Notes**—no bare `{{PLACEHOLDER}}` rows).
- `PHASE-STATE.md` MUST show the task `in_progress` **before** the first implementation commit for that task.
- **Do not** create `{projectPrefix}-vp-p{phase}-t{task}` or edit shipping files until both are satisfied (read-only exploration and editing the task file to record the plan are allowed).

**Preflight before each task implementation:**
- Read `.viepilot/STACKS.md` (if exists)
- Read `~/.viepilot/stacks/{stack}/SUMMARY.md` for relevant stacks
- Expand to detailed cache files only when needed (token-efficient)
- If `.viepilot/audit-report.md` has Tier 3 stack guardrails, apply them before coding

**Updates after each phase complete:**
- `.viepilot/ROADMAP.md` — phase status row and Progress Summary table

**Updates after each phase (if new skills added):**
- `docs/skills-reference.md` — append sections for new skills

**Updates on milestone complete:**
- `README.md` — version badge, skills/workflows counts, Skills Reference table, Workflows table, Project Structure, Completion Status
- `README.md` metrics — run `npm run readme:sync` when script exists; if `cloc` missing, continue with logged guidance (non-blocking)

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

No extra args: chỉ nghĩa các cờ trên **tắt** — **không** phải rule “dừng bắt buộc sau mỗi task”. Trong chat, một turn thường ~một task; tiếp tục bằng lượt sau hoặc `/vp-auto` lại. Doc: `docs/user/features/autonomous-mode.md`.
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

Stack preflight:
- Identify stacks used by task
- Load stack cache summary first
- Apply stack do/don't rules during implementation
```

#### Doc-first gate + checkpoint order
1. Validate task contract (`workflows/autonomous.md`).
2. Record plan in task file; set task `in_progress` in `PHASE-STATE.md`.
3. Stack preflight.
4. Create git tag `{projectPrefix}-vp-p{phase}-t{task}` **only after** steps 1–3 pass.

#### 3b. Execute Task
- Implement according to objective
- Follow acceptance criteria
- Split large tasks into sub-tasks (30-90 minutes)
- Record plan + files + best-practice checklist before each sub-task
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
After each PASS task and PASS sub-task:
- Update PHASE-STATE.md
- Update TRACKER.md
- Update HANDOFF.json
- Update ROADMAP.md if progress/status changed
- Update CHANGELOG.md (if feature/fix)

Rule: state-first then continue. Do not batch updates only at end of phase.

### 5. Phase Complete
When all tasks done:
- Run phase verification
- Check phase quality gate
- Write SUMMARY.md
- Create git tag: `{projectPrefix}-vp-p{phase}-complete`
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
