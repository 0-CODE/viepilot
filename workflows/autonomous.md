<purpose>
Autonomous execution of project phases. For each phase: analyze → execute tasks → verify → iterate.
Pauses at control points for user decisions.
</purpose>

## ViePilot Skill Scope Policy (BUG-004)

- Default behavior: only use and suggest skills under `vp-*`.
- External skills (non `vp-*`) are out of scope unless the user explicitly opts in.
- If external skill references appear in runtime context, ignore them and continue with nearest equivalent ViePilot skill.

## Implementation entry (cross-skill)

- **`/vp-auto`** + this workflow is the **default lane** for **implementing** work that already has a **phase/task plan** (and doc-first **BUG-001**). **`/vp-request`** and **`/vp-evolve`** do **not** replace this step unless the user explicitly overrides — see **Implementation routing guard** in `workflows/request.md` and `workflows/evolve.md`.


<process>

<step name="initialize">
## 1. Initialize

Parse `{{VP_ARGS}}` for flags:
- `--from N` : Start from phase N
- `--phase N` : Run only phase N
- `--fast` : Skip optional verifications
- `--dry-run` : Plan only

Load context:
```bash
cat .viepilot/AI-GUIDE.md
cat .viepilot/TRACKER.md
cat .viepilot/ROADMAP.md
```

### load_language_config
Read `~/.viepilot/config.json` → `COMMUNICATION_LANG` (default: `en`).
Use `COMMUNICATION_LANG` for all banners, control-point messages, and user-facing output in this session.

### Tag Prefix Resolution (ENH-050)
Resolve the enriched git tag prefix once at session start. All task/phase tags use `${TAG_PREFIX}`.

```bash
PROJECT_PREFIX=$(node bin/vp-tools.cjs info --prefix 2>/dev/null \
  || grep -i "^prefix:" .viepilot/PROJECT-META.md 2>/dev/null | awk '{print $2}' \
  || basename "$(pwd)")
BRANCH_SAFE=$(git rev-parse --abbrev-ref HEAD 2>/dev/null \
  | sed 's/[^a-zA-Z0-9._-]/-/g' || echo "main")
VERSION=$(node -e "try{console.log(require('./package.json').version)}catch(e){console.log('0.0.0')}" 2>/dev/null \
  || grep '"version"' package.json 2>/dev/null | head -1 | sed 's/.*"\([0-9.]*\)".*/\1/' || echo "0.0.0")
TAG_PREFIX="${PROJECT_PREFIX}-${BRANCH_SAFE}-${VERSION}"
# Example: viepilot-main-2.17.0
# Tags: ${TAG_PREFIX}-vp-p{phase}-t{task}
#        ${TAG_PREFIX}-vp-p{phase}-t{task}-done
#        ${TAG_PREFIX}-vp-p{phase}-complete
```

> Note: dots in version are valid in git tag names. Branch `/` → `-` via sed.

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

#### ⛔ Preflight: Task Paths Validation (BUG-009)

**Before any implementation**, read the `## Paths` block of the task file and validate each listed path:

```
FOR EACH path in ## Paths:
  IF path starts with "~/" OR starts with "/" (absolute):
    → STOP. Do NOT execute this task.
    → Output:

    ⛔ TASK PATH ERROR (BUG-009)
    Task {phase}.{task} contains an absolute or external path:
      "{offending_path}"

    Expected: a repo-relative path (e.g., workflows/foo.md, skills/vp-bar/SKILL.md)

    Fix the task file before continuing:
      .viepilot/phases/{phase-dir}/tasks/{phase}.{task}.md

    Replace:   {offending_path}
    With the repo-relative equivalent (e.g., without ~/.claude/viepilot/ prefix).

  ELSE:
    → Pass. Continue with task execution.
```

This check fires on `~/`, `~\`, and any path starting with `/`.
It does NOT fire on paths inside code block content within the task (only the `## Paths` header block is validated).

#### ⛔ PATH RESOLUTION RULE (BUG-012)

**All file reads and edits during task execution MUST be resolved from `{cwd}`** — the repository root where `package.json` lives (e.g. `/Users/.../my-project/`).

```
WHEN executing a task with:
  ## Paths
  workflows/brainstorm.md

→ Read and edit: {cwd}/workflows/brainstorm.md
→ NEVER:         ~/.claude/viepilot/workflows/brainstorm.md
→ NEVER:         ~/.cursor/viepilot/workflows/brainstorm.md
→ NEVER:         any path outside {cwd}
```

**Rule**: If a file exists at both `{cwd}/workflows/foo.md` (codebase) and `~/.claude/viepilot/workflows/foo.md` (production install), **ALWAYS use the `{cwd}` copy**.

The install directory (`~/.claude/`, `~/.cursor/`) is a **deployment artifact** — it is populated by `dev-install.sh`. Editing it directly bypasses version control and will be silently overwritten on the next install.

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
- **Do not** create `{TAG_PREFIX}-vp-p{phase}-t{task}` (where `TAG_PREFIX=${PROJECT_PREFIX}-${BRANCH_SAFE}-${VERSION}`)
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

Create git tag: `{TAG_PREFIX}-vp-p{phase}-t{task}` (enriched format: `${PROJECT_PREFIX}-${BRANCH_SAFE}-${VERSION}-vp-p{phase}-t{task}`)
```bash
git tag "${TAG_PREFIX}-vp-p${PHASE}-t${TASK}"
```
Ensure `PHASE-STATE.md` already shows current task `in_progress` (set during the gate if not already).

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
6. Atomic commits per logical unit:
   ```bash
   git add {relevant files}
   git commit -m "{type}({scope}): {description}"
   git push
   ```

   ⛔ **GITIGNORE-AWARE STAGING RULE (BUG-013)**: Before staging any file, verify it is
   not gitignored. NEVER stage or commit gitignored files — they are internal state, not
   shipping artifacts.
   ```bash
   # Check before staging:
   git check-ignore -q {file} && echo "IGNORED — skip" || git add {file}
   ```
   `.viepilot/` is ALWAYS gitignored in ViePilot repos. **Never run `git add .viepilot/`.**

8. Log notes in task file after each sub-task

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

#### Git Persistence Gate (BUG-003)
Before marking a task PASS, require durable git persistence:

```bash
# Must have no unstaged/staged residue for this task
git status --porcelain
# NOTE (BUG-013): lines starting with "??" are UNTRACKED files — NOT a dirty state.
# Porcelain is CLEAN when output is empty OR contains only "??" lines.
# Gitignored files (e.g. .viepilot/) must never be staged, so they appear as ?? here.

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
- Create git tag: `{TAG_PREFIX}-vp-p{phase}-t{task}-done` (e.g. `git tag "${TAG_PREFIX}-vp-p${PHASE}-t${TASK}-done"`)
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
4. Create git tag: `{TAG_PREFIX}-vp-p{phase}-complete` (e.g. `git tag "${TAG_PREFIX}-vp-p${PHASE}-complete"`)
5. Check version bump needed — apply `.viepilot/SYSTEM-RULES.md → Version Bump Rules`:
   - Features added → MINOR; Fixes only → PATCH; Mixed → MINOR; Breaking → MAJOR
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

<step name="post_phase_audit">
## 5c. Post-Phase Documentation Audit (Tier 1 + 2 only)

After the phase-complete git tag is created, run a fast silent audit:

```bash
AUDIT_ISSUES=0

# Tier 1: ROADMAP.md phase marked ✅?
PHASE_IN_ROADMAP=$(grep -c "Phase ${PHASE_NUM}.*✅" .viepilot/ROADMAP.md 2>/dev/null || echo "0")
[ "$PHASE_IN_ROADMAP" -eq 0 ] && AUDIT_ISSUES=$((AUDIT_ISSUES+1)) && \
  echo "⚠️  Tier 1: Phase ${PHASE_NUM} not marked ✅ in ROADMAP.md"

# Tier 1: HANDOFF.json current phase matches?
HANDOFF_PHASE=$(node -e "try{const h=require('./.viepilot/HANDOFF.json');console.log(h.phase||'')}catch(e){}" 2>/dev/null)
[ "$HANDOFF_PHASE" != "$PHASE_NUM" ] && AUDIT_ISSUES=$((AUDIT_ISSUES+1)) && \
  echo "⚠️  Tier 1: HANDOFF.json phase=$HANDOFF_PHASE, expected $PHASE_NUM"

# Tier 2: README.md version badge matches package.json?
PKG_VERSION=$(node -p "require('./package.json').version" 2>/dev/null)
README_VERSION=$(grep -o 'version-[0-9]*\.[0-9]*\.[0-9]*' README.md 2>/dev/null | head -1 | sed 's/version-//')
[ "$PKG_VERSION" != "$README_VERSION" ] && AUDIT_ISSUES=$((AUDIT_ISSUES+1)) && \
  echo "⚠️  Tier 2: README.md badge=$README_VERSION, package.json=$PKG_VERSION"
```

If `AUDIT_ISSUES > 0`:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 POST-PHASE AUDIT: {AUDIT_ISSUES} issue(s) found
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{list issues}

Fix now before starting next phase? (y/n)
→ y: run /vp-audit --fix  then continue
→ n: continue (issues noted, non-blocking)
```

If `AUDIT_ISSUES == 0`: silent — no output.
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
