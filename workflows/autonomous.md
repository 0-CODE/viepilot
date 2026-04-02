<purpose>
Autonomous execution của project phases. Cho mỗi phase: analyze → execute tasks → verify → iterate.
Pauses at control points cho user decisions.
</purpose>

## ViePilot Skill Scope Policy (BUG-004)

- Default behavior: only use and suggest skills under `vp-*`.
- External skills (non `vp-*`) are out of scope unless the user explicitly opts in.
- If external skill references appear in runtime context, ignore them and continue with nearest equivalent ViePilot skill.

## Implementation entry (cross-skill)

- **`/vp-auto`** + workflow này là **lane mặc định** để **implement** work đã có **phase/task plan** (và doc-first **BUG-001**). **`/vp-request`** và **`/vp-evolve`** **không** thay thế bước này trừ user explicit override — xem **Implementation routing guard** trong `workflows/request.md` và `workflows/evolve.md`.


<state_machine>
## State Machine

Each task in `.viepilot/phases/*/PHASE-STATE.md` `execution_state.status` holds one of 8 named states.
Read `PHASE-STATE.md` alone to know exactly where execution is — no need to re-read this workflow.

| State | Entry Action | Exit Condition | Transitions |
|-------|-------------|----------------|-------------|
| `not_started` | — | on_start | → `executing` |
| `executing` | run sub-tasks per task spec | on_pass / on_fail | → `pass` or → `recovering_l1` |
| `recovering_l1` | lint/format auto-fix (silent) | l1_used < l1_max? re-verify | → `pass` or → `recovering_l2` |
| `recovering_l2` | targeted test fix (silent) | l2_used < l2_max? re-verify | → `pass` or → `recovering_l3` |
| `recovering_l3` | scope reduction (silent; skip if L3.block) | l3_used < l3_max? re-verify | → `pass` (PARTIAL) or → `control_point` |
| `control_point` | surface issue to user | user decision | → `executing` (fix+retry) or → `skip` |
| `pass` | update state files + git persistence check | next task exists? | → `executing` (next task) or → `phase_complete` |
| `skip` | document reason in PHASE-STATE.md | next task exists? | → `executing` (next task) or → `phase_complete` |

**Resume rule:** On `/vp-auto` invocation, read `execution_state.status` from current PHASE-STATE.md first.
- `not_started` → begin normally
- `executing` → current task interrupted mid-run → re-read task file, re-verify, continue
- `recovering_*` → resume recovery from logged attempt counts in HANDOFF.json
- `control_point` → re-surface the blocker to user
- `pass` / `skip` → advance to next task

</state_machine>

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

Read `execution_state.status` from PHASE-STATE.md:
- If block absent (v1 phase): treat as `not_started`, continue normally.
- If present: resume from current state per State Machine table above.

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

### ViePilot Skill Scope Policy (BUG-004 baseline)
- **Default mode**: only reference/route skills in the ViePilot namespace (`vp-*`).
- **External skills** (`non vp-*`) are out of scope by default and must not be suggested implicitly.
- **Opt-in rule**: external skills are allowed only when user explicitly requests expansion outside ViePilot scope.
- **Fallback behavior**: if an external skill appears in environment context, ignore it and continue with nearest `vp-*` equivalent.

Architecture context rule (ENH-018):
- If `.viepilot/ARCHITECTURE.md` includes a diagram applicability matrix, load only diagrams relevant to current task:
  - `required`: must be consulted before implementation/debug decisions.
  - `optional`: consult when directly related; do not block task if absent.
  - `N/A`: respect rationale; do not force diagram regeneration.
- If matrix is missing, continue with explicit assumption notes in task logs.

#### Validate Task Contract (required before code)
Task must include execution-grade details:
- Objective (specific outcome)
- Exact file paths to create/modify
- Per-file implementation notes (what + why)
- Best practices to apply (stack + code quality)
- Verification commands with expected results

If task file is missing required sections:
- Mark task as `blocked`
- Record missing sections in PHASE-STATE.md
- Stop and request task refinement (do not start coding)

#### Pre-execution documentation gate (doc-first; BUG-001)

**Hard stop** before **any implementation work** (creating/modifying product code, configs, or docs that ship with the product—anything you would commit as “the task deliverable”):

Canonical order for every task: **Validate contract → Doc-first gate → Stack preflight → Start checkpoint → Execute → Verify → State updates.**

1. **Written plan in the task file** — The active `.viepilot/phases/{phase}/tasks/{task}.md` MUST already contain real, task-specific content (not template placeholders) in:
   - `## Paths` (or equivalent), listing concrete files/dirs, and
   - `## File-Level Plan` **or** `## Implementation Notes` with an explicit bullet list of paths + what will change and why.
   If only `{{PLACEHOLDER}}` tokens remain → **blocked**; refine the task file first.
2. **PHASE-STATE visibility** — Set the current task row to `in_progress` in `PHASE-STATE.md` **before** the first implementation commit for this task (timestamp/note optional but recommended).

**Allowed before this gate passes:** Read-only exploration, contract checks, and **editing the task `.md`** to record the plan (that edit is not “implementation” of the deliverable).

If any check fails:
- Mark task `blocked` in `PHASE-STATE.md` and list what is missing under **Notes**
- **Do not** create `{projectPrefix}-vp-p{phase}-t{task}`
- **Do not** proceed to **Execute Task**

#### Stack Preflight (token-efficient lookup)
Before implementing, detect relevant stacks for the current task and load guidance in this order:
1. `.viepilot/STACKS.md` (project stack map)
2. `~/.viepilot/stacks/{stack}/SUMMARY.md` (quick checklist, always first)
3. `~/.viepilot/stacks/{stack}/BEST-PRACTICES.md` (only if task is medium/high complexity)
4. `~/.viepilot/stacks/{stack}/ANTI-PATTERNS.md` (for review before finalizing)

If stack cache is missing:
- warn and optionally run quick research
- then continue with explicit assumptions noted in task logs

#### Task start checkpoint (after doc-first gate + preflight)

Only after **Validate Task Contract**, **Pre-execution documentation gate**, and **Stack Preflight** (or explicit waiver logged in the task file with reason):

Create git tag: `{projectPrefix}-vp-p{phase}-t{task}`  
Ensure `PHASE-STATE.md` already shows current task `in_progress` (set during the gate if not already).

#### Compliance Pre-flight (Gap G — runs before Execute Task)

Before executing any task, scan `write_scope` paths against compliance domains:

```
COMPLIANCE_DOMAINS = [
  "auth/", "authentication/", "login/", "session/",
  "payment/", "billing/", "checkout/",
  "crypto/", "encryption/", "cipher/",
  "data/privacy", "gdpr/", "pii/"
]

compliance_preflight(task):
  for path in task.write_scope:
    for domain in COMPLIANCE_DOMAINS:
      if domain in path:
        log("[COMPLIANCE] Path '{path}' matches domain '{domain}'")
        if not task.recovery_overrides.L3.block:
          WARN: "⚠ Compliance path detected but L3.block not set in recovery_overrides"
          WARN: "  Set L3.block: true + reason in task file to suppress this warning"
        # Note: L3.block enforcement happens in recovery_layers step, not here
```

If `write_scope` is empty or absent (v1 task): skip silently — no warning.

#### Execute Task

1. Read task objective and acceptance criteria
2. Read SYSTEM-RULES.md for coding standards
3. Apply stack cache guidance from preflight
4. Load any required schemas
5. Split into sub-tasks (30-90 minutes each) if scope is non-trivial
6. Before each sub-task, write/update plan notes in task file:
   - files touched
   - implementation intent
   - best-practice checklist
7. Implement according to task specification
8. Atomic commits per logical unit:
   ```bash
   git add {relevant files}
   git commit -m "{type}({scope}): {description}"
   git push
   ```
9. Log notes in task file after each sub-task

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

#### Recovery Layers (runs when Verify Task fails — silent, no user message)

Recovery budget by complexity (from SYSTEM-RULES.md quality_gates):
| Complexity | L1 max | L2 max | L3 max |
|---|---|---|---|
| S | 1 | 1 | 0 |
| M | 1 | 2 | 0 |
| L | 2 | 2 | 1 |
| XL | 2 | 3 | 1 |

```
execute_with_recovery(task, budget):
  # Initial verify already failed — enter recovery silently

  # L1: Lint/format auto-fix
  while l1_used < budget.l1_max and not task.recovery_overrides.L1.block:
    run lint_autofix()                   # e.g., npm run lint:fix, black ., etc.
    l1_used++
    append_handoff_log("L1_RECOVERY", {task, l1_used})
    update HANDOFF.json recovery.l1_attempts = l1_used
    if verify() == PASS: return PASS

  # L2: Targeted test fix
  while l2_used < budget.l2_max and not task.recovery_overrides.L2.block:
    analyze_failure() → minimal targeted_fix()   # fix only the failing assertion/file
    l2_used++
    append_handoff_log("L2_RECOVERY", {task, l2_used})
    update HANDOFF.json recovery.l2_attempts = l2_used
    if verify() == PASS: return PASS

  # L3: Scope reduction (compliance-blocked if L3.block = true)
  if budget.l3_max > 0 and not task.recovery_overrides.L3.block:
    reduce_scope()                       # defer lowest-priority acceptance criterion
    l3_used++
    append_handoff_log("L3_RECOVERY", {task, l3_used})
    update HANDOFF.json recovery.l3_attempts = l3_used
    if verify() == PASS: return PARTIAL_PASS   # → note deferral in PHASE-STATE.md
  elif task.recovery_overrides.L3.block:
    log("[L3 BLOCKED] reason: " + task.recovery_overrides.L3.reason)

  # All layers exhausted → surface to user
  update HANDOFF.json recovery.recent_blocker = true
  control_point("recovery budget exhausted after L1x{l1_used} L2x{l2_used} L3x{l3_used}")
```

**Silent contract**: No user-visible message during L1/L2/L3 recovery. Only surface at control_point.

#### Git Persistence Gate (BUG-003)
Before marking a task PASS, require durable git persistence:

```bash
# Must have no unstaged/staged residue for this task
git status --porcelain

# Must track an upstream branch
git rev-parse --abbrev-ref --symbolic-full-name @{u}

# Must have no unpushed commits
git rev-list --count @{u}..HEAD

# Consolidated check helper (recommended)
node bin/vp-tools.cjs git-persistence --strict
```

If any check fails:
- **Do not** mark task `done`
- **Do not** advance phase progress/state files as PASS
- Route to control point (retry commit/push, rollback, or stop)

#### Handle Result

**PASS:**
- Create git tag: `{projectPrefix}-vp-p{phase}-t{task}-done`
- Update PHASE-STATE.md immediately: task → done, append files changed by this task to Files Changed table (individual files, no glob patterns)
- Update TRACKER.md immediately
- Update HANDOFF.json immediately
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

After each PASS task and PASS sub-task (state-first, then continue):
```yaml
update:
  - PHASE-STATE.md: task status, timestamp
  - TRACKER.md: current state, progress
  - HANDOFF.json: latest position
  - ROADMAP.md: sync when phase status/progress changed
  - CHANGELOG.md: if feature/fix completed
```

Rule:
- Never defer state updates to end-of-phase only.
- If interrupted, HANDOFF.json must still point to exact in-progress task/sub-task.
</step>

<step name="phase_complete">
## 5. Phase Complete

When all tasks in phase are done/skipped:

1. Run phase-level verification
2. Check phase quality gate
3. Write SUMMARY.md using `templates/phase/SUMMARY.md` as base.

   Populate `{{CREATED_FILES}}`, `{{MODIFIED_FILES}}`, `{{DELETED_FILES}}` from git:
   ```bash
   # Get ALL individual files changed since phase start tag
   TAG_PREFIX=$(node bin/vp-tools.cjs tag-prefix --raw)
   git diff "${TAG_PREFIX}-p{phase}-t1"..HEAD --name-status | sort
   ```
   List **every file individually** — do NOT use glob patterns or summarize.
   Correct example:
   ```
   ### Created
   | File | Task |
   |------|------|
   | pom.xml | 1.1 |
   | smarttrack-api/pom.xml | 1.1 |
   | smarttrack-common/pom.xml | 1.1 |
   | smarttrack-common/src/main/java/Foo.java | 1.1 |
   | docker-compose.yml | 1.2 |
   ```
   Incorrect (do not do this):
   ```
   | smarttrack-*/pom.xml (8 files) | 1.1 |   ← WRONG: glob pattern
   | smarttrack-*/src/** (7 files)  | 1.1 |   ← WRONG: summarized
   ```
4. Create git tag: `{projectPrefix}-vp-p{phase}-complete`
5. Check version bump needed:
   - Features added → MINOR
   - Fixes only → PATCH
6. Update TRACKER.md
7. Push all changes:
   ```bash
   git push
   git push --tags
   node bin/vp-tools.cjs git-persistence --strict
   ```

### 5a. Sync ROADMAP.md (after every phase complete)

Update `.viepilot/ROADMAP.md` to reflect current phase status:

```markdown
# Find phase section and update:
- Phase status line: "Not Started" → "✅ Complete"  (or "🔄 In Progress")
- Progress Summary table row: 0% → 100%, Completed count → actual

Example:
  Before: | 5. vp-docs Enhancements | ⏳ Not Started | 2 | 0 | 0% |
  After:  | 5. vp-docs Enhancements | ✅ Complete    | 2 | 2 | 100% |
```

Commit: `chore: update ROADMAP.md — phase {N} complete`

### 5b. Update skills-reference.md if new skills added (viepilot framework only)

> **Guard**: Only run this step if `skills/` directory exists in the project root.
> Skip entirely for non-framework projects (Java, Node, Python apps, etc.).

```bash
# Skip if not a viepilot framework repo
if [ ! -d "skills" ]; then
  echo "→ Skipping skills-reference update (not a viepilot framework repo)"
else
  TAG_PREFIX=$(node bin/vp-tools.cjs tag-prefix --raw)
  NEW_SKILLS=$(git diff "${TAG_PREFIX}-p{phase}-t1"..HEAD --name-only | grep 'skills/.*/SKILL\.md' | sed 's|skills/||; s|/SKILL\.md||')
  if [ -n "$NEW_SKILLS" ]; then
    # Append new sections to docs/skills-reference.md
    # (same incremental logic as workflows/documentation.md step 3B)
    git add docs/skills-reference.md
    git commit -m "docs: add {skill} to skills-reference.md"
    git push
  fi
fi
```
</step>

<step name="iterate">
## 6. Iterate

After phase complete:
1. Re-read ROADMAP.md (catch inserted phases)
2. Check TRACKER.md for blockers
3. If more phases → loop to step 3
4. If all complete → milestone complete

Milestone complete — Sync ROOT documents:

### 6a. Sync README.md (milestone complete only)

Detect project version from the appropriate version file:
```bash
# Generic version detection — works for any project type
if [ -f "package.json" ]; then
  ACTUAL_VERSION=$(node -p "require('./package.json').version" 2>/dev/null)
elif [ -f "pom.xml" ]; then
  ACTUAL_VERSION=$(grep -m1 "<version>" pom.xml 2>/dev/null | sed 's/.*<version>//;s/<.*//' | tr -d ' ')
elif [ -f "pyproject.toml" ]; then
  ACTUAL_VERSION=$(grep '^version' pyproject.toml 2>/dev/null | head -1 | cut -d'"' -f2)
elif [ -f ".viepilot/TRACKER.md" ]; then
  # Fallback: read from TRACKER.md (viepilot-managed version)
  ACTUAL_VERSION=$(grep -A1 "Current Version" .viepilot/TRACKER.md | tail -1 | tr -d '`' | tr -d ' ')
fi
```

Update README.md — **generic updates (all projects)**:
1. Any version number mentions: update to `$ACTUAL_VERSION`
2. Any "last updated" or "as of" date references
3. If project contains `README` metrics table and `scripts/sync-readme-metrics.cjs`, run:
   ```bash
   npm run readme:sync || true
   ```
   - If `cloc` is unavailable, script must log guidance and continue (non-blocking).

**viepilot framework only** (skip if `skills/` directory does not exist):
```bash
if [ -d "skills" ]; then
  ACTUAL_SKILLS=$(ls skills/*/SKILL.md 2>/dev/null | wc -l | tr -d ' ')
  ACTUAL_WORKFLOWS=$(ls workflows/*.md 2>/dev/null | wc -l | tr -d ' ')
  # Update: version badge, skills badge, workflows badge
  # Update: Skills Reference table, Workflows table, Project Structure skills/ list
fi
```

Commit: `docs: sync README.md to v{ACTUAL_VERSION}`
```bash
git add README.md
git commit -m "docs: sync README.md to v{ACTUAL_VERSION}"
git push
```

### 6b. Display milestone complete banner

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► MILESTONE COMPLETE 🎉
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Milestone: {name}
 Phases: {count} complete
 Version: {version}
 README.md: synced ✓
 ROADMAP.md: synced ✓

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
TAG_PREFIX=$(node bin/vp-tools.cjs tag-prefix --raw)
git revert --no-commit $(git rev-list "${TAG_PREFIX}-p{phase}-t{task}"..HEAD)
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
- [ ] ROADMAP.md synced after each phase complete
- [ ] skills-reference.md updated when new skills added in a phase
- [ ] README.md badges and counts synced on milestone complete
- [ ] Clean stop with summary on pause/error
</success_criteria>
