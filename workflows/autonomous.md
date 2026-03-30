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

#### Stack Preflight (token-efficient lookup)
Before implementing, detect relevant stacks for the current task and load guidance in this order:
1. `.viepilot/STACKS.md` (project stack map)
2. `~/.viepilot/stacks/{stack}/SUMMARY.md` (quick checklist, always first)
3. `~/.viepilot/stacks/{stack}/BEST-PRACTICES.md` (only if task is medium/high complexity)
4. `~/.viepilot/stacks/{stack}/ANTI-PATTERNS.md` (for review before finalizing)

If stack cache is missing:
- warn and optionally run quick research
- then continue with explicit assumptions noted in task logs

Create git tag: `vp-p{phase}-t{task}`
Update PHASE-STATE.md: task → in_progress

#### Execute Task
1. Read task objective and acceptance criteria
2. Read SYSTEM-RULES.md for coding standards
3. Apply stack cache guidance from preflight
4. Load any required schemas
5. Implement according to task specification
6. Atomic commits per logical unit:
   ```bash
   git add {relevant files}
   git commit -m "{type}({scope}): {description}"
   git push
   ```
7. Log notes in task file if needed

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
- Update PHASE-STATE.md: task → done, append files changed by this task to Files Changed table (individual files, no glob patterns)
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
3. Write SUMMARY.md using `templates/phase/SUMMARY.md` as base.

   Populate `{{CREATED_FILES}}`, `{{MODIFIED_FILES}}`, `{{DELETED_FILES}}` from git:
   ```bash
   # Get ALL individual files changed since phase start tag
   git diff vp-p{phase}-t1..HEAD --name-status | sort
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
4. Create git tag: `vp-p{phase}-complete`
5. Check version bump needed:
   - Features added → MINOR
   - Fixes only → PATCH
6. Update TRACKER.md
7. Push all changes:
   ```bash
   git push
   git push --tags
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
  NEW_SKILLS=$(git diff vp-p{phase}-t1..HEAD --name-only | grep 'skills/.*/SKILL\.md' | sed 's|skills/||; s|/SKILL\.md||')
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
- [ ] ROADMAP.md synced after each phase complete
- [ ] skills-reference.md updated when new skills added in a phase
- [ ] README.md badges and counts synced on milestone complete
- [ ] Clean stop with summary on pause/error
</success_criteria>
