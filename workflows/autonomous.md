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

Load context (batch — call all Read tools simultaneously in 1 turn):
- `.viepilot/TRACKER.md` — current phase + progress
- **Phase list (ENH-031):** If `.viepilot/ROADMAP-INDEX.md` exists → read it **instead of** loading the full `.viepilot/ROADMAP.md` **for Initialize / phase-discovery only** (compact slice). If `ROADMAP-INDEX.md` is missing → read full `.viepilot/ROADMAP.md` as before.
- **Full ROADMAP still required when:** horizon / Post-MVP detail needed, `--phase` / `--from` ambiguity, reconciling progress, editing roadmap content, or **INDEX suspected stale** vs `.viepilot/TRACKER.md` or `.viepilot/HANDOFF.json` — batch-read `.viepilot/ROADMAP.md` (and prefer refreshing `ROADMAP-INDEX.md` from ROADMAP after substantive roadmap edits; see `workflows/crystallize.md` Step 7).
- `.viepilot/AI-GUIDE.md` — static (cache after first read; do NOT re-read per task)

Display startup banner:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► AUTONOMOUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Project: {project_name}
 Milestone: {milestone}
 Phases: {total} total, {completed} complete
```

#### Working Directory Guard (mandatory — evaluate before ANY file edit)

**Source of truth**: `{project_cwd}` = the current working directory where `.viepilot/TRACKER.md` lives. This is the ONLY directory you may write to.

**Read-only paths** (context only — NEVER write):
- `~/.claude/viepilot/` — installed skill/workflow runtime
- `~/.cursor/viepilot/` — installed skill/workflow runtime
- Any absolute path outside `{project_cwd}`

**Pre-edit check** — before EVERY file create/modify/delete:
1. Resolve the target path to absolute
2. Confirm it starts with `{project_cwd}/`
3. If target path is outside `{project_cwd}` → **HARD STOP** — do NOT proceed

**On violation**:
```
→ Do NOT write the file
→ Route to control_point immediately:
  reason: "Edit target '{path}' is outside project working directory '{project_cwd}'. Install paths are READ-ONLY."
→ Wait for user decision before continuing
```

**Examples**:
- `{project_cwd}/workflows/autonomous.md` → allowed (project source)
- `~/.claude/viepilot/workflows/autonomous.md` → BLOCKED (install path, read-only)
- `/tmp/scratch.md` → BLOCKED (outside project_cwd)

This guard applies to ALL ViePilot projects — not only framework self-development sessions.
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

#### Task-boundary context re-hydrate (Tier A — mandatory)

Before **Validate Task Contract** and any implementation work for this task iteration, reload authoritative state from disk. **Do not** rely on conversation memory alone across long `/vp-auto` runs.

The **Initialize** batch-read (§1 — `.viepilot/TRACKER.md`, `ROADMAP-INDEX.md` / `.viepilot/ROADMAP.md`, `.viepilot/AI-GUIDE.md`) establishes session orientation only; it **does not** replace per-task file truth. At **every task boundary** — immediately after the previous task PASS (before the next task body), or when entering this loop for the first task of the phase — run the following.

**Mandatory parallel batch (1 assistant turn — invoke all Read tools together):**
- `.viepilot/TRACKER.md`
- `.viepilot/HANDOFF.json`
- `.viepilot/phases/{phase}/PHASE-STATE.md` — at minimum the `execution_state` block and the **Task Status** table (current task row + transitions); use the full file when practical
- `.viepilot/phases/{phase}/tasks/{task}.md` — the active task file
- Every path listed in that task file under `## Context Required`, YAML `files_to_read`, or `context_required` (expand to concrete reads). If a listed file is missing, log the assumption in the task file / phase notes and continue only when the task spec allows.

**Working Directory Guard (no regression):** All paths above MUST resolve under `{project_cwd}` per §1. Bundles under `~/.cursor/viepilot/` and `~/.claude/viepilot/` stay **read-only** — never substitute them for project `.viepilot/` task artifacts.

#### Load Task Context (batch — call all Read tools simultaneously in 1 turn)

**After Tier A re-hydrate above**, complete context loading as follows.

Dynamic context (read every task):
- `.viepilot/TRACKER.md`
- `.viepilot/HANDOFF.json`
- `.viepilot/phases/{phase}/PHASE-STATE.md`
- `.viepilot/phases/{phase}/tasks/{task}.md`

Static context (cached after first read — do NOT re-read per task):
- `.viepilot/AI-GUIDE.md`
- `.viepilot/SYSTEM-RULES.md`

Conditional context (only when needed):
- `.viepilot/logs/blockers.md` → only if `HANDOFF.json.recovery.recent_blocker == true`
- `.viepilot/PROJECT-CONTEXT.md` → only if task involves architecture/scope decision
- Additional `context_required` files listed in task file

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
- **Do not** create the task start git tag (resolved at runtime: `TAG_PREFIX=$(node bin/vp-tools.cjs tag-prefix --raw)` → `${TAG_PREFIX}-p{phase}-t{task}`)
- **Do not** proceed to **Execute Task**

#### Recovery Budget Parse (from task file)

Parse `recovery_budget` and `recovery_overrides` from task file.
Default to `M` if field is absent (v1 backward compat).

```
Budget table:
  S:  {l1_max: 1, l2_max: 1, l3_max: 0}
  M:  {l1_max: 1, l2_max: 2, l3_max: 0}  ← default
  L:  {l1_max: 2, l2_max: 2, l3_max: 1}
  XL: {l1_max: 2, l2_max: 3, l3_max: 1}

Apply recovery_overrides (from TASK.md):
  if recovery_overrides.L1.block == true → l1_max = 0
  if recovery_overrides.L2.block == true → l2_max = 0
  if recovery_overrides.L3.block == true → l3_max = 0

Track attempts via HANDOFF.json.recovery.l1/l2/l3_attempts (persist after each attempt).
Do NOT increment before attempting — increment after.
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

#### Task start checkpoint (after doc-first gate + preflight)

Only after **Validate Task Contract**, **Pre-execution documentation gate**, and **Stack Preflight** (or explicit waiver logged in the task file with reason):

Create start git tag:
```bash
TAG_PREFIX=$(node bin/vp-tools.cjs tag-prefix --raw)
git tag "${TAG_PREFIX}-p{phase}-t{task}" -m "Start Task {task}"
```
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

#### Gap G Extended — keyword scan (task body text; Phase 10.5)

Run **after** path-based Compliance Pre-flight and **before** **Execute Task** step 0 (`task_start`).

```
COMPLIANCE_KEYWORDS_EXTENDED = [
  "password", "token", "session", "encrypt", "stripe", "payment",
  "bcrypt", "tls", "migration", "schema"
]

gap_g_extended_keyword_preflight(task):
  if task.recovery_overrides.L3.block == true:
    return OK  # already protected (path or prior edit)
  text = lowercase(concatenate these sections from the active task .md when present):
    ## Objective, ## Acceptance Criteria, ## File-Level Plan, ## Implementation Notes,
    ## Paths (yaml block), Task Metadata / description fields
  hits = unique list of kw in COMPLIANCE_KEYWORDS_EXTENDED where kw appears as substring in text
  if hits is empty:
    return OK
  log "[GAP-G-EXTENDED] task {task_id} keyword hits: {hits}"
  → control_point BEFORE Execute Task:
     Reason: "Gap G Extended: task text matches sensitive keywords but recovery_overrides.L3.block is not true"
     Show: hits + suggested YAML snippet for L3.block + reason
     Options:
       1. **Fix and retry** — user edits task file to set recovery_overrides.L3.block: true (and reason), then /vp-auto continues
       2. **Acknowledge risk** — user explicitly accepts continuing without L3.block; append JSONL to .viepilot/HANDOFF.log (non-blocking):
          {"ts":"<ISO8601>","event":"compliance_keyword_ack","task":"{task}","phase":"{phase}","hits":[...],"ack":"user_proceed_without_l3_block"}
          then clear control_point and proceed to Execute Task
       3. **Stop autonomous mode** — exit with progress summary
  Do not emit task_start or modify shipping files until option 1 (after re-entry) or 2 is resolved.
```

If the task file has **no** `recovery_overrides` block, treat `L3.block` as false/absent for this scan.

#### HANDOFF.json Schema Detection

> **Schema note (BUG-006 fix)**: Before writing any HANDOFF.json fields, detect which schema the project uses:
> - **v2** (nested): `version` field = `2` — use `position.task`, `position.status`, `recovery.l1_attempts`, `control_point.active`, `meta.last_written`
> - **v1** (flat): `version` absent or `1` — use `task`, `status`, `lastUpdated`, `blockers[]`
>
> New projects use v2 (from template). If a project has v1, update the equivalent flat fields.
> Recommend creating a `DEBT` request to migrate v1 → v2 before running vp-auto on that project.
> All field references in this workflow assume **v2 schema**.

#### Execute Task

0. Emit task_start event:
   ```
   Append to .viepilot/HANDOFF.log (non-blocking):
   {"ts":"<ISO8601>","event":"task_start","task":"{task}","phase":"{phase}","complexity":"{complexity}"}
   ```
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
9. After each sub-task PASS: update state immediately (non-blocking):
   - HANDOFF.json: `position.sub_task = "{sub_task_id}"`, `meta.last_written = "<ISO8601>"`
   - PHASE-STATE.md execution_state: `current = "{sub_task_id}"`, `status = executing`
   - PHASE-STATE.md sub-task table: mark sub-task `pass`, add completed timestamp

#### Token budget check (sub-task; `token_budget`)

Run **immediately after** Execute Task **step 9** state writes for each sub-task **PASS**, **before** step 10 and **before** starting the next sub-task.

1. **Estimate `used_pct`** (integer 0–100):
   - Prefer platform-provided context or token utilization when the runtime exposes it.
   - Otherwise apply a **conservative heuristic** (e.g. cumulative tool output volume, transcript depth, large file reads) and label the value an **estimate** in any user-visible banner.
1b. **If `used_pct > 70` (audit — non-blocking):** append one JSONL line to `.viepilot/HANDOFF.log` (do not block execution if append fails):
   ```
   {"ts":"<ISO8601>","event":"token_budget_warning","task":"{task}","phase":"{phase}","sub_task":"{sub_task_id}","used_pct":<used_pct>,"severity":"warn|critical"}
   ```
   Use `severity`: `"critical"` when `used_pct > 90`, otherwise `"warn"`. Omit `sub_task` or use `null` when no sub-task id applies.
2. **If `used_pct > 90` (critical — not skippable, ignores `--fast`):**
   - **Force pause**: do **not** continue to the next sub-task or advance Verify Task for remaining sub-tasks in this turn.
   - **HANDOFF.json** (mandatory): update per project schema (**v1/v2** per **HANDOFF.json Schema Detection** above). At minimum set `meta.last_written` to ISO8601 now; keep `position` aligned with the sub-task just completed and the **next** queued sub-task (or explicit next id). Add a short persistence note (e.g. v1 `context.last_decision`, or equivalent v2 field): `token_budget force pause: used_pct≈{used_pct}`.
   - Display stop banner + resume hint (`/vp-resume` or `/vp-auto`).
   - **Exit** autonomous execution for this session (hard stop after writes).
3. **Else if `used_pct > 70` (warn):**
   - If `{{VP_ARGS}}` contains **`--fast`**: omit the menu; continue to the next sub-task (or step 10+ as applicable).
   - Otherwise: show warning (include `used_pct`; mark *estimate* when heuristic), then numbered options:
     1. **Continue** — next sub-task.
     2. **Pause now** — `meta.last_written` + `position` sync as in (2), then stop.
     3. **Stop autonomous** — progress summary (same spirit as **handle_blocker** stop).
   - Wait for user choice before continuing.

10. On sub-task FAIL (before recovery): update PHASE-STATE.md `execution_state.status = recovering_l1`
11. On task PASS: update PHASE-STATE.md `execution_state.status = pass`; update task table row (status=done, git_tag=actual_tag)
12. Log notes in task file after each sub-task

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
    append to HANDOFF.log: {"ts":"<ISO8601>","event":"l1_recovery","task":"{task}","phase":"{phase}","attempt":{l1_used},"trigger":"lint_error"}
    update HANDOFF.json recovery.l1_attempts = l1_used
    if verify() == PASS: return PASS

  # L2: Targeted test fix
  while l2_used < budget.l2_max and not task.recovery_overrides.L2.block:
    analyze_failure() → minimal targeted_fix()   # fix only the failing assertion/file
    l2_used++
    append to HANDOFF.log: {"ts":"<ISO8601>","event":"l2_recovery","task":"{task}","phase":"{phase}","attempt":{l2_used},"trigger":"test_fail"}
    update HANDOFF.json recovery.l2_attempts = l2_used
    if verify() == PASS: return PASS

  # L3: Scope reduction (compliance-blocked if L3.block = true)
  if budget.l3_max > 0 and not task.recovery_overrides.L3.block:
    reduce_scope()                       # defer lowest-priority acceptance criterion
    l3_used++
    append to HANDOFF.log: {"ts":"<ISO8601>","event":"l3_recovery","task":"{task}","phase":"{phase}","attempt":{l3_used},"trigger":"scope_reduction"}
    update HANDOFF.json recovery.l3_attempts = l3_used
    if verify() == PASS: return PARTIAL_PASS   # → note deferral in PHASE-STATE.md
  elif task.recovery_overrides.L3.block:
    log("[L3 BLOCKED] reason: " + task.recovery_overrides.L3.reason)

  # All layers exhausted → surface to user
  update HANDOFF.json recovery.recent_blocker = true
  control_point("recovery budget exhausted after L1x{l1_used} L2x{l2_used} L3x{l3_used}")
```

**Silent contract**: No user-visible message during L1/L2/L3 recovery. Only surface at control_point.

#### Validation Pipeline (3 tiers — strict order, no skipping)

Run after execution completes, before marking PASS. Tier order: contract → scope → git.

**Tier 1 — Contract Check:**
- Verify AI output contains `RESULT: PASS|FAIL|BLOCKED — {reason}` (or equivalent structured result)
- Fail action: retry execution once (not recovery layer)
- Max 1 retry; still fails → control_point

**Tier 2 — Write Scope Lock (scope drift detection):**
- If `write_scope` is empty/absent (v1 task): skip silently (backward compat)
- Otherwise:
  ```
  modified_files = git diff --name-only HEAD
  violations = [f for f in modified_files if not any(f.startswith(s) for s in task.write_scope)]
  if violations:
    Append to HANDOFF.log: {"event":"scope_drift","task":"{task}","violations":[...]}
    → control_point immediately (NOT silent recovery)
  ```
- Tier 2 violation is always a control_point — never silently passed

**Tier 3 — Git Gate:**
- Verify commit message follows Conventional Commits format (`type(scope): description`)
- Verify `git status --porcelain` is empty (no unstaged changes)
- Fail action: AI fixes commit message and recommits (max 1 attempt)

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
- Create done git tag:
  ```bash
  TAG_PREFIX=$(node bin/vp-tools.cjs tag-prefix --raw)
  git tag "${TAG_PREFIX}-p{phase}-t{task}-done" -m "Task {task} complete"
  ```
- Append to HANDOFF.log (non-blocking):
  ```
  {"ts":"<ISO8601>","event":"task_pass","task":"{task}","phase":"{phase}"}
  ```
- Update CHANGELOG.md if feature/fix

#### State Update Checklist (mandatory — complete ALL before advancing to next task)

**Verify each item was written to disk. If any edit fails → `control_point("state update failed: {item}")`.**

**1. Task file** (`.viepilot/phases/{phase}/tasks/{task}.md`):
- Edit `## Meta → Status`: current value → `done`
- Tick `## Pre-execution documentation gate` boxes: all `[ ]` → `[x]`
- Tick `## Acceptance Criteria` boxes: each met criterion → `[x]`
- Tick `## Best Practices to Apply` boxes: all applied → `[x]`
- Tick `## State Update Checklist` boxes (if section present): all → `[x]`
- Fill `## Implementation Notes` with 2–5 bullet summary of what was built (replace placeholder)
- Fill `## Files Changed` (or `## Post-Completion → Files Changed`): run the command below and paste actual output (replace placeholder):
  ```bash
  TAG_PREFIX=$(node bin/vp-tools.cjs tag-prefix --raw)
  git diff "${TAG_PREFIX}-p{phase}-t{task}"..HEAD --name-status
  ```

**2. PHASE-STATE.md** (`.viepilot/phases/{phase}/PHASE-STATE.md`):
- Task row: `Status` → `done`, `Completed` → today's date, `Git Tag` → actual done-tag used
- `execution_state.current` → next task ID (or `"—"` if this was last task)
- `execution_state.status` → `executing` (more tasks remain) or `pass` (phase complete)
- Files Changed table: append each file from this task (use git diff output above, one row per file)

**3. HANDOFF.json** (`.viepilot/HANDOFF.json`):
- `position.task` → next task ID
- `position.sub_task` → null
- `position.status` → `"not_started"`
- `recovery.l1_attempts` → 0
- `recovery.l2_attempts` → 0
- `recovery.l3_attempts` → 0
- `meta.last_written` → ISO8601 timestamp now

**4. TRACKER.md** (`.viepilot/TRACKER.md`):
- Update current task/phase line to reflect next task

**Gate**: Do not advance to next task until all 4 groups above are verified written to disk.

- Move to next task

**SKIP:**
- Update PHASE-STATE.md: task → skipped, document reason
- Update HANDOFF.json: advance position.task
- Append to HANDOFF.log (non-blocking):
  ```
  {"ts":"<ISO8601>","event":"task_skip","task":"{task}","phase":"{phase}","reason":"{reason}"}
  ```

**PARTIAL (some checks fail):**
- Attempt auto-fix
- Re-verify
- If still fail → control point

**FAIL / control_point:**
- Update HANDOFF.json:
  ```json
  control_point.active = true
  control_point.reason = "{description}"
  control_point.ts = "<ISO8601>"
  recovery.recent_blocker = true
  ```
- Append to HANDOFF.log (non-blocking):
  ```
  {"ts":"<ISO8601>","event":"control_point_enter","task":"{task}","phase":"{phase}","reason":"{description}"}
  ```
- → Go to handle_blocker
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
2a. **Stale diagram detection + update trigger (Phase 11 — architecture profile)** — runs **only at phase complete**, not after each task.

   **Purpose:** If this phase changed architecture or diagram sources, reconcile diagram artifacts once before `SUMMARY.md` finalization so **stale diagram** drift does not accumulate across phases.

   **Diff since phase start (same scope as SUMMARY file inventory):**
   ```bash
   TAG_PREFIX=$(node bin/vp-tools.cjs tag-prefix --raw)
   ARCH_PHASE_PATHS=$(git diff "${TAG_PREFIX}-p{phase}-t1"..HEAD --name-only)
   ```

   **Touch detection:** If **any** changed path matches one of these prefixes (string prefix match on each line):
   - `architecture/` — repo-root profile folders from crystallize (Phase 11)
   - `.viepilot/architecture/` — ENH-022 mermaid sidecars
   - `.viepilot/ARCHITECTURE.md` — diagram applicability matrix + narrative

   **If no match:** Skip the remainder of this step silently (no extra `SUMMARY.md` subsection required).

   **If matched (stale diagram pass):**
   1. Read `.viepilot/ARCHITECTURE.md` and apply **ENH-018**: consult the diagram applicability matrix — for rows marked `required` or `optional` (not `N/A`), resolve canonical diagram sources (paths per matrix / ENH-022 `.viepilot/architecture/*.mermaid` / profile `architecture/**` stubs).
   2. **Reconcile:** Update existing mermaid or stub files minimally so they reflect phase deliverables; do not invent diagram types beyond the matrix. Skip rows explicitly `N/A`.
   3. **`SUMMARY.md`:** Add subsection **Stale diagram reconciliation** listing files reviewed or updated, or state explicitly that review concluded no edits were needed.
   4. **`HANDOFF.log` (non-blocking):**
      ```
      {"ts":"<ISO8601>","event":"stale_diagram_phase_complete","phase":"{phase}","architecture_touched":true,"paths_sample":["..."]}
      ```
      _(Truncate `paths_sample` if the list is large; full list may appear in `SUMMARY.md`.)_

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
4. Rotate HANDOFF.log (phase-boundary rotation):
   ```bash
   # Archive current log to logs/ directory
   if [ -f .viepilot/HANDOFF.log ]; then
     mv .viepilot/HANDOFF.log .viepilot/logs/handoff-phase-{N}.log
   fi
   # Create fresh empty log for next phase
   touch .viepilot/HANDOFF.log
   ```
   Update HANDOFF.json: `meta.last_archived = "handoff-phase-{N}.log"`
5. Create phase-complete git tag:
   ```bash
   TAG_PREFIX=$(node bin/vp-tools.cjs tag-prefix --raw)
   git tag "${TAG_PREFIX}-p{phase}-complete" -m "Phase {phase} complete"
   ```
6. Check version bump needed:
   - Features added → MINOR
   - Fixes only → PATCH
7. Update TRACKER.md
8. Push all changes:
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
## 7. Handle Blocker / Control Point

### Enter Control Point Protocol (Task 2.7)

**Before displaying to user — update HANDOFF.json first** (so vp-status can detect):
```json
control_point.active = true
control_point.reason = "{why: budget exhausted / scope drift / tier1 fail / other}"
control_point.ts = "<ISO8601>"
recovery.recent_blocker = true
```
Write HANDOFF.json. Then display:

```
━━━ CONTROL POINT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Task: {task_id} — {task_name}
 Reason: {reason}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Options:
1. Fix and retry - Attempt to fix the issue
2. Skip task - Mark as skipped and continue
3. Rollback task - Undo changes from this task
4. Stop autonomous - Exit with progress summary
```

### Exit Control Point Protocol

After user chooses option 1 (fix+retry) or 2 (skip):
```json
control_point.active = false
control_point.reason = null
control_point.ts = null
```
Append to HANDOFF.log (non-blocking):
```
{"ts":"<ISO8601>","event":"control_point_exit","task":"{task}","phase":"{phase}","resolution":"{retry|skip|rollback|stop}"}
```
Write HANDOFF.json. Then continue per user choice.

### Options Detail

**Fix and retry:**
- Re-attempt the failed step
- If still fails → re-present control point options

**Skip task:**
- Ask for skip reason
- Update PHASE-STATE.md: task → skipped, reason documented
- Clear control_point fields in HANDOFF.json
- Append to HANDOFF.log:
  ```
  {"ts":"<ISO8601>","event":"task_skip","task":"{task}","phase":"{phase}","reason":"user_skip"}
  ```
- Continue to next task

**Rollback:**
```bash
TAG_PREFIX=$(node bin/vp-tools.cjs tag-prefix --raw)
git revert --no-commit $(git rev-list "${TAG_PREFIX}-p{phase}-t{task}"..HEAD)
```
- Reset task → not_started in PHASE-STATE.md
- Clear control_point fields in HANDOFF.json
- Continue or stop

**Stop:**
- Clear control_point fields before exit
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
