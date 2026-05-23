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

## Agent Delegation (ENH-057)

This workflow delegates heavy/repetitive operations to sub-agents defined in `agents/`.
Each agent is invoked via the pattern below rather than implemented inline.

| Agent | When invoked | Operation |
|-------|-------------|-----------|
| tracker-agent | Task start, task complete, phase complete | TRACKER.md status updates |
| changelog-agent | Post-phase last task (version bump) | CHANGELOG + package.json bump |
| test-generator-agent | Last task of each phase (contract tests) | Test file generation + run |
| doc-sync-agent | Bulk edits: ≥5 identical file types in Paths block | Multi-file .md updates |

**Invoke-agent pattern** (Claude Code adapter):
```
Agent({
  subagent_type: "general-purpose",
  description: "{agent-name}: {operation}",
  prompt: "Load agents/{agent-name}.md for full spec. Execute: {operation} with inputs: {inputs}"
})
```
**Non-Claude Code adapters**: execute the equivalent operation inline in the same session.

See `agents/` directory for full agent specifications.

## v3 Orchestration Agents (Phase 130 — FEAT-021)

On Claude Code adapter (when `ADAPTER_CONTEXT.orchestration.parallel == true`), three dedicated
subagent definitions in `agents/claude-code/` handle orchestrated execution:

| Agent | File | Model | Role |
|-------|------|-------|------|
| vp-task-executor | `agents/claude-code/vp-task-executor.md` | claude-haiku-4-5 | Implements a single task contract; fresh context window per task |
| vp-phase-planner | `agents/claude-code/vp-phase-planner.md` | claude-sonnet-4-6 | Reads phase, builds dependency graph, identifies parallel clusters |
| vp-quality-gate | `agents/claude-code/vp-quality-gate.md` | claude-sonnet-4-6 | Runs verification commands; reports PASS/FAIL/PARTIAL |

**Fan-out pattern** (implemented in Phase 133):
```
vp-phase-planner → clusters → Agent(vp-task-executor) × N (parallel) → Agent(vp-quality-gate)
```

**PreToolUse/PostToolUse hooks** (Claude Code only, registered via `vp-tools hooks install --adapter claude-code`):
- `PreToolUse` on `Write`/`Edit` in task scope: validates path is repo-relative (BUG-009 gate)
- `PostToolUse` on `Bash`: captures command output for quality-gate evidence log
- Hook config lives in `~/.claude/settings.json` → `hooks` array

<process>

> **AUQ preload — Claude Code adapter (ENH-059):** At session start, before any interactive prompt, call `ToolSearch` with `query: "select:AskUserQuestion"` to load the deferred schema. Required on Claude Code (terminal). Skip only if `ToolSearch` returns an error → use text fallback for that session.

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

### Persona Context (ENH-073)
After loading AI-GUIDE.md and TRACKER.md, run:
```bash
node "$HOME/.claude/viepilot/bin/vp-tools.cjs" persona auto-switch
node "$HOME/.claude/viepilot/bin/vp-tools.cjs" persona context
```
Inject output as `## User Persona` block into each task's execution context.
Use `persona.stacks` for stack preflight matching (prefer persona stacks over generic detection).
Silent if command unavailable or errors — do not fail the phase.

### Skill Context Load (FEAT-020)

After loading context files, load the project's skill decisions:

```bash
# Read PROJECT-CONTEXT.md ## Skills section
SKILL_CONTEXT=$(grep -A 100 "^## Skills" .viepilot/PROJECT-CONTEXT.md 2>/dev/null | \
  head -n $(grep -n "^## " .viepilot/PROJECT-CONTEXT.md | awk -F: 'NR==2{print $1}'))
```

Build `SKILL_CONTEXT_MAP` in session memory:
- Parse `## Skills` table rows
- For each row: extract `id`, `source`, `required` (yes/no), `phases` (comma list)
- Load best_practices[] for each skill from global registry:
  ```bash
  node ~/.claude/viepilot/bin/vp-tools.cjs get-registry --id {skill-id} 2>/dev/null \
    || node ~/.cursor/viepilot/bin/vp-tools.cjs get-registry --id {skill-id} 2>/dev/null
  ```
- Parse JSON output → extract `best_practices[]`
- If command absent or returns null: `best_practices = []` — silent no-op
- Structure: `{ required: [{id, phases: [1,2], best_practices: [...]}], optional: [...] }`

**If `## Skills` section absent or empty**: silent no-op — `SKILL_CONTEXT_MAP = { required: [], optional: [] }`.

### ADAPTER_CONTEXT Injection (FEAT-021 Phase 127)

Detect the active adapter and inject its capability map into session context. Skills use
ADAPTER_CONTEXT to select correct tool names and fallback chains — no inline compat tables.

```bash
ADAPTER_CONTEXT_JSON=$(node "$HOME/.claude/viepilot/bin/vp-tools.cjs" detect-adapter --json 2>/dev/null \
  || node "$(pwd)/bin/vp-tools.cjs" detect-adapter --json 2>/dev/null \
  || echo '{"adapter":"claude-code","interactive_mode":"AUQ","orchestration":{"parallel":true,"teams":true},"capabilities":["shell","read","write","edit","search","agent","interactive"]}')
```

Parse into session variables:
- `ADAPTER_ID` — e.g. `"claude-code"`
- `ADAPTER_INTERACTIVE` — `"AUQ"` | `"text"` | `"none"`
- `ADAPTER_PARALLEL` — `true` | `false` (orchestration.parallel)
- `ADAPTER_TOOLS` — tools{} map (use `ctx.tools.shell` → correct tool name)

**Shell tool resolution** (use `ADAPTER_TOOLS.shell` for all bash/cmd execution in tasks):
| Adapter | Shell tool |
|---|---|
| claude-code | `Bash` |
| cursor-agent | `run_terminal_cmd` |
| antigravity | `shell` |
| codex | `container.exec` |
| copilot | `runCommands` |

**Interactive fallback chain** (based on `ADAPTER_INTERACTIVE`):
1. `"AUQ"` → call `AskUserQuestion` (preload via ToolSearch first)
2. `"text"` → show numbered list in plain text
3. `"none"` → proceed with defaults (log decision)

Silent on error — do not fail the phase. Fallback: assume `claude-code` defaults.

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

### 3b. Orchestration Mode Selection (Phase 133 — FEAT-021)

> ⛔ **ORCHESTRATOR STOP — Implementation Delegation Rule (ENH-096)**
>
> On Claude Code adapter, the main orchestrator agent MUST NOT:
> - Call `Edit`, `Write`, or `MultiEdit` on implementation files (`lib/`, `bin/`, `tests/`, `agents/`, `skills/`, `workflows/` shipping content)
> - Run `Bash` commands that write source code (e.g. `cat >`, `tee`, compiler/bundler invocations for production output)
> - Implement features, fix bugs, or write tests inline in this context
>
> **Inline implementation is a framework violation.** It fills the orchestrator's context with
> implementation tokens (file diffs, test output, compile logs), degrading orchestration quality
> across subsequent tasks.
>
> The orchestrator is permitted ONLY to:
> - `Read` — read PHASE-STATE.md, TRACKER.md, HANDOFF.json, task files, ROADMAP.md (read-only)
> - `Bash` — read-only git checks ONLY: `git status --porcelain`, `git rev-list --count @{u}..HEAD`, `node bin/vp-tools.cjs git-persistence --strict`
> - `Agent` — spawn vp-task-executor, vp-quality-gate, vp-phase-planner, tracker-agent, vp-git-agent, changelog-agent
>
> The orchestrator MUST NOT call Edit, Write, or Bash for ANY writes — including state files.
> All writes and git operations go through subagents (ENH-097).
>
> All implementation (file edits, test runs for implementation, commits) MUST go through
> `vp-task-executor`. This applies even when there is only one task in the phase.

Before entering the task loop, check `ADAPTER_PARALLEL` (set in ADAPTER_CONTEXT Injection step):

```
IF ADAPTER_PARALLEL == true AND ADAPTER_ID == "claude-code":
  → ORCHESTRATOR MODE: fan-out dispatch via Agent tool (section 3b-orch)
ELSE:
  → SEQUENTIAL MODE: single-agent serial execution (section 3b-seq)
```

**Agent Teams mode** (when `ADAPTER_CONTEXT.orchestration.teams == true` AND pending task count ≥ 8):
- Set `TEAMS_MODE = true`
- Activate shared TodoWrite task list for teammate coordination
- Each Agent worker reads from the shared list rather than receiving an explicit task prompt

#### 3b-orch: Orchestrator Fan-out (Claude Code only)

When `ADAPTER_PARALLEL == true`:

**Step 1 — Dependency resolution** (via `vp-phase-planner` agent):
```
Agent(
  subagent_type: "vp-phase-planner",
  prompt: "Analyze phase {N} tasks in .viepilot/phases/{dir}/PHASE-STATE.md.
           Return JSON: { clusters: [ { tasks: [id,...], can_parallel: bool,
           sequential_fallback: [id,...] } ] }
           Only include incomplete tasks."
)
```

Parse `clusters` JSON from agent output. Each cluster is a set of independent tasks that can run in parallel.

**Step 2 — Fan-out dispatch** (parallel `Agent` calls per cluster):
```
FOR each cluster in clusters:
  IF cluster.can_parallel == true AND cluster.tasks.length > 1:
    → Dispatch tasks in parallel:
    FOR EACH task_id in cluster.tasks (simultaneously):
      Agent(
        subagent_type: "vp-task-executor",
        prompt: "Execute task {task_id} in phase {N}.
                 Task file: .viepilot/phases/{dir}/tasks/{task_id}.md
                 PHASE-STATE: .viepilot/phases/{dir}/PHASE-STATE.md
                 Repo root: {cwd}
                 Return: TASK_RESULT: PASS|FAIL|PARTIAL + summary"
      )
    Collect all TASK_RESULT outputs before advancing.
  ELSE:
    → Execute tasks in sequence (cluster.sequential_fallback order)
    Agent(vp-task-executor, single task)
```

**Spawn Template (copy-paste verbatim — do not paraphrase):**
```
Agent({
  subagent_type: "vp-task-executor",
  description: "Execute task {task_id} — phase {N}",
  prompt: `Execute ViePilot task {task_id} for phase {N}.

Task file: {task_path}
Phase state: {phase_dir}/PHASE-STATE.md
Repo root: {cwd}

Read the task file completely, implement all acceptance criteria, run verification
commands, commit with message format: {projectPrefix}-vp-p{N}-t{task_id}: <summary>,
then report:
TASK_RESULT: PASS|FAIL|PARTIAL
Committed: <sha> — <message>
Criteria: ✅/❌ per item`
})
```

Replace `{task_id}`, `{N}`, `{task_path}`, `{phase_dir}`, `{cwd}`, `{projectPrefix}` with actual values.
The orchestrator MUST NOT call Edit/Write/Bash for implementation — the subagent handles all of that.

**Model tiering** (`ADAPTER_CONTEXT.orchestration.model_override`):
- Worker agent (vp-task-executor): `claude-haiku-4-5` — routine file edits, low token cost
- Planner/gate agent (vp-phase-planner, vp-quality-gate): `claude-sonnet-4-6` — reasoning, dependency analysis
- Orchestrator (main agent): retains current model — coordination only, no implementation

**Step 3 — Quality gate** (after each cluster completes):
```
Agent(
  subagent_type: "vp-quality-gate",
  prompt: "Run verification for phase {N} cluster {C}.
           Tasks completed: {task_ids}
           Check: acceptance criteria, tests, lint.
           Return: QUALITY_GATE: PASS|FAIL|PARTIAL + findings"
)
```

On `QUALITY_GATE: FAIL` or `PARTIAL` → route to control point (retry cluster / skip / stop).
On `QUALITY_GATE: PASS` → update PHASE-STATE.md (all cluster tasks → done), update TRACKER.md, continue.

**Teams mode** (when `TEAMS_MODE == true`):
- Write all pending task IDs to shared `TodoWrite` list at phase start
- Each `Agent(vp-task-executor)` reads next available task from shared list
- Prevents duplicate execution when dispatching ≥ 8 tasks concurrently

#### 3b-seq: Sequential Mode (non-Claude Code adapters)

When `ADAPTER_PARALLEL == false` (Cursor / Antigravity / Codex / Copilot):

Execute tasks one at a time in the main agent context. No fan-out, no subagent dispatch.

### 3b. Execute Tasks Loop

For each task in phase (sequential mode) or per cluster (orchestrator mode):

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

#### Skill Context Injection (FEAT-020)

Before executing the task, check `SKILL_CONTEXT_MAP`:

1. Extract the current task's phase number
2. For each skill in `required`: check if current phase is in `skill.phases[]`
3. If match: prepend `skill.best_practices[]` to the task execution context as a silent checklist:

```
[Skill context: {skill-id}]
Best practices to apply:
- {practice 1}
- {practice 2}
```

4. Record in task output: `skills_applied: [{id}@{version}]`

**Rules:**
- **Never prompt the user** — decisions were locked at crystallize
- Optional skills: included only if task file explicitly mentions matching capability keywords
- No skill context available (empty map): continue normally — no warning

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

#### Preflight 5.5 — Design.MD Token Injection (ENH-076)

After Stack Preflight, if `design.md` exists at project root (or nearest parent directory):

**Step A — Build TOKEN_MAP** (parse YAML front matter):
- `TOKEN_MAP.colors.*` — primary, surface, accent, error, success, warning
- `TOKEN_MAP.typography.*` — fontFamily, fontSize, fontWeight, lineHeight
- `TOKEN_MAP.spacing.*` — base, scale
- `TOKEN_MAP.rounded.*` — sm, md, lg, full

**Step B — UI task detection** (check task title + file paths + objective text):
```
UI_KEYWORDS = [
  html, css, style, component, tailwind, layout, button, card,
  form, page, ui, frontend, color, font, typography, responsive, design
]
```
If NO UI_KEYWORDS matched → skip Design.MD injection entirely for this task.

**Step C — Injection levels (when UI task detected):**

- **Level 1 — Silent context injection (always):**
  Token map injected as implicit constraint in execution context.
  AI naturally applies brand tokens when generating HTML/CSS.
  No output shown to user.

- **Level 2 — Checklist items (when task has explicit UI acceptance criteria):**
  Auto-append to task checklist:
  ```
  - [ ] Primary color uses TOKEN_MAP.colors.primary (or var(--color-primary))
  - [ ] Font family matches TOKEN_MAP.typography.fontFamily
  - [ ] Spacing follows TOKEN_MAP.spacing.base unit
  ```

- **Level 3 — Post-task design audit (when task output includes .html or .css files):**
  After generating output: scan for token deviations.
  Auto-fix: obvious wrong fonts or exact hex mismatches.
  AUQ on Claude Code terminal when judgment call required.
  Report:
  ```
  🎨 Design.MD check: ✅ Colors  ✅ Typography  ⚠️ 1 spacing deviation (auto-fixed)
  ```

**Edge cases:**
- Backend-only task (no UI_KEYWORDS) → skip entirely
- design.md missing a token → inject only present tokens, no fail
- Monorepo → nearest `design.md` wins (task dir → parent → project root)
- Token conflict with Tailwind config → AUQ: Use design.md / Use Tailwind config / Update both

#### Scaffold-First Gate (BUG-020)

When the stack preflight identifies a **framework stack** AND the current task is a **project setup / init task** (keywords in title or objective: "set up", "initialize", "create project", "scaffold", "bootstrap", "new project", "install Laravel/Next/Nest/Rails/Django"):

**Step 1 — Check for existing scaffold**: look for a framework marker file in the project root:

| Framework | Marker file |
|-----------|-------------|
| Laravel | `artisan` |
| Next.js | `next.config.js` or `next.config.ts` |
| NestJS | `nest-cli.json` |
| Rails | `config/application.rb` |
| Django | `manage.py` |
| Spring Boot | `pom.xml` or `build.gradle` |
| Nuxt / Vue | `nuxt.config.ts` or `nuxt.config.js` |
| React (CRA) | `src/index.js` or `src/index.tsx` |
| Electron | `electron-builder.yml` |

**Step 2 — If marker NOT found (fresh project)**:

a. Read `## Scaffold` section from `~/.viepilot/stacks/{stack}/SUMMARY.md` — use `init_command:` and `marker_file:` fields if present (optional, takes priority over built-in table).

b. If SUMMARY.md has no `## Scaffold` section, use the built-in heuristic table:

| Stack | Scaffold command |
|-------|-----------------|
| laravel / laravel-php84 | `composer create-project laravel/laravel {name}` |
| nextjs / nextjs-* | `npx create-next-app@latest {name}` |
| nestjs | `npx @nestjs/cli new {name}` |
| rails | `rails new {name}` |
| django | `django-admin startproject {name} .` |
| spring-boot* | `spring init --dependencies=web,data-jpa,validation {name}` |
| nuxt / vuejs* | `npx nuxi@latest init {name}` |
| react | `npx create-react-app {name}` |
| electron | `npx create-electron-app {name}` |

c. **Run the scaffold command** — if it exits non-zero: stop, report the error, and offer user: (a) fix environment then retry, (b) confirm project already exists, (c) skip scaffold with explicit reason logged.

d. After scaffold succeeds: continue with configuration and customization tasks normally.

**Step 3 — If marker IS found** (project already scaffolded): skip scaffold entirely, proceed with the task.

**Never-handcraft block list** — NEVER create these files from scratch in a setup task without prior scaffold:
- `artisan`, `composer.json` (in a Laravel/PHP context)
- `next.config.js`, `next.config.ts`, `pages/_app.*`, `app/layout.*`
- `nest-cli.json`, combined `tsconfig.json` + `src/main.ts` in NestJS context
- `manage.py`, `wsgi.py`, `asgi.py`
- `config/application.rb`, `config/routes.rb`, `Gemfile`
- `pom.xml` or `build.gradle` with Spring Boot starters

If the task's `## Paths` block contains one of these AND no scaffold has run:
→ **⛔ Scaffold-First Gate**: "Cannot create `{file}` — run scaffold command first (BUG-020). See `docs/user/features/scaffold-first.md`."
→ Offer: (a) run scaffold then retry, (b) confirm project already scaffolded, (c) skip gate with explicit reason in task log.

#### UI Prototype Reference — populate for frontend tasks (ENH-069 Gap 3)

After contract validation and **before** execution, check if the task implements a frontend component:

1. Read `.viepilot/PROJECT-CONTEXT.md → ## UI Pages → Component Map` (written by crystallize Step 7)
2. If a row exists whose `Target component` matches the task's target file:
   - Populate the task file's `## UI Prototype Reference` section:
     ```markdown
     ## UI Prototype Reference
     - Prototype: .viepilot/ui-direction/{session-id}/pages/{slug}.html
     - Key sections: {sections extracted from the prototype during crystallize Step 1A}
     - Component target: {target_component_path}
     ```
   - Log: `"UI Prototype Reference populated from UI Pages → Component Map"`
3. During implementation: **READ the referenced prototype file BEFORE writing any component code**. The prototype is the design source — do not implement from task description alone when a prototype is bound.
4. If no binding found in the component map: leave `## UI Prototype Reference` blank (implement from task description).

#### Task start checkpoint (after doc-first gate + preflight)

Only after **Validate Task Contract**, **Pre-execution documentation gate**, and **Stack Preflight** (or explicit waiver logged in the task file with reason):

Create git tag: `{TAG_PREFIX}-vp-p{phase}-t{task}` (enriched format: `${PROJECT_PREFIX}-${BRANCH_SAFE}-${VERSION}-vp-p{phase}-t{task}`)
```bash
git tag "${TAG_PREFIX}-vp-p${PHASE}-t${TASK}"
```
Ensure `PHASE-STATE.md` already shows current task `in_progress` (set during the gate if not already).

#### Bulk-Edit Task Detection — doc-sync-agent (ENH-057)

**Before executing**, scan the `## Paths` block of the task:

```
IF (Paths block contains ≥5 files of the same type, e.g., skills/*/SKILL.md)
  OR (task description matches: "update all N files", "add row to all skills", "sync across N files")
→ Invoke doc-sync-agent instead of N sequential edits:

   Agent({ subagent_type: "doc-sync-agent",
     description: "doc-sync-agent: {change_mode} across {file_pattern}",
     prompt: "file_pattern: {glob}. change_mode: {change_mode}. anchor: {anchor}. content: {content}."
   })
   Non-Claude Code: apply changes sequentially inline.

   Example: Task 84.3 "Update all 17 SKILL.md — add Copilot adapter row"
   → Pattern: skills/*/SKILL.md | Mode: insert-row | Anchor: "| Codex CLI |" | Content: "| GitHub Copilot | ✅ ..."
   → 1 agent call replaces 17 sequential Edit calls.
```

If Paths block has < 5 files: proceed with sequential edits as normal.

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

#### Test Generation — test-generator-agent (ENH-057, BUG-028 fix)

**Trigger**: current task is the last task in the phase AND task.md contains `## Acceptance Criteria`

**Claude Code — invoke test-generator-agent:**
```
Agent({ subagent_type: "test-generator-agent",
  description: "test-generator-agent: generate + run contract tests for phase {phase}",
  prompt: "task_file: {task_md_path}. test_output_path: tests/unit/phase{phase}-{task}-contract.test.js. phase_number: {phase}. task_number: {task}."
})
```
Non-Claude Code: generate test file inline from acceptance criteria, then run `npm test`.

If test-generator-agent reports FAIL: **do NOT** mark task complete — fix failing criteria first.

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

**Post-PASS: Intake Write-back (ENH-095)**

After the above state updates, check the task `.md` for an `## Intake Source` block:
```
## Intake Source
- channel_id:    trip-tracking-bug
- sheet_name:    BUG
- source_row:    1
- manifest_path: .viepilot/intake/trip-tracking-bug-manifest.json
- channel_type:  excel_m365
- workbook_id:   {workbook_id or null}
- sharing_url:   {sharing_url or null}
```

If the block is present:
1. Parse the fields from the block
2. Load manifest from `manifest_path` via `lib/intake/manifest.cjs → loadManifest()`
3. Call `getWriteBackConfig(manifest, sheet_name)` → get `response_col`
4. Build `response = { status: 'Fixed ✓', phaseTask: 'vp-p{N}-t{M}', version: currentVersion, date: YYYY-MM-DD }`
5. Call `lib/intake/writeback.cjs → writebackIntakeResponse(channel, source_row, response, projectRoot, sheet_name, response_col)`
6. Log: `[vp-auto] Intake write-back: row {source_row} → col {response_col}: "{text}" — {success|failed}`
7. **Write-back failure is non-fatal** — log to stderr and continue to next task regardless

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
  - TRACKER.md: current state, progress   ← via tracker-agent (ENH-057)
  - HANDOFF.json: latest position
  - ROADMAP.md: sync when phase status/progress changed
  - CHANGELOG.md: if feature/fix completed  ← via changelog-agent at end of phase (ENH-057)
```

**State updates — spawn subagents (Claude Code, ENH-097):**

```
# Task status (PHASE-STATE.md + TRACKER.md current state):
Agent({ subagent_type: "tracker-agent",
  description: "Update task {N}.{task_id} → {status}",
  prompt: "operation: update-task-status. phase: {N}. task: {task_id}. status: {status}."
})

# HANDOFF.json update:
Agent({ subagent_type: "tracker-agent",
  description: "Update HANDOFF.json — phase {N} task {task_id}",
  prompt: "operation: update-handoff. phase: {N}. phase_name: {phase_name}. task: {task_id}. task_name: {task_name}. status: {status}. version: {version}. tasks_total: {T}. tasks_completed: {C}. notes: [\"{note}\"]."
})

# ROADMAP.md phase status sync (after phase complete):
Agent({ subagent_type: "tracker-agent",
  description: "Update ROADMAP.md — phase {N} done",
  prompt: "operation: update-roadmap-phase. phase_number: {N}. status: ✅ done. completed_date: {today}."
})
```
Non-Claude Code: update TRACKER.md, HANDOFF.json, ROADMAP.md inline as before.

Rule:
- Never defer state updates to end-of-phase only.
- If interrupted, HANDOFF.json must still point to exact in-progress task/sub-task.
</step>

<step name="phase_complete">
## 5. Phase Complete

When all tasks in phase are done/skipped:

#### UI Coverage Gate (ENH-069 Gap 4)

Before phase-level verification, run a UI stub check:

1. Read `.viepilot/PROJECT-CONTEXT.md → ## UI Pages → Component Map`
2. Filter rows where `Phase` = current phase AND `Source` is not `design_staleness` alone (i.e., rows with a real prototype file binding)
3. For each filtered row:
   - Check if the `Target component` file exists on disk
   - If the file exists, apply the stub heuristic:
     - File has fewer than 20 lines **AND** contains only routing/title markup (no real layout components, no template sections, no data fetching) → **STUB detected**
   - If file is **missing** OR **stub detected**:
     ```
     ⚠️ UI Coverage Warning: "{prototype}" → "{component}" is still a stub or missing.
     Phase cannot receive ✅ PASS with unimplemented prototype-bound components.
     Options:
       (a) Implement now from prototype (Recommended — continue in this phase)
       (b) Defer to next phase (update component map row status to "deferred-phase-{N+1}" + log reason)
       (c) Mark as design-only — no implementation required (update row status to "design-only" + log reason)
     ```
4. Phase PASS is **blocked** until all warnings are resolved via options (a), (b), or (c).
   - Option (a): implement the component, then re-run stub check
   - Option (b) or (c): clears the warning; phase may proceed to PASS

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
4. Create phase-complete git tag — spawn vp-git-agent:
   ```
   Agent({ subagent_type: "vp-git-agent",
     description: "Tag phase {N} complete",
     prompt: "operation: create-tag. tag_name: {TAG_PREFIX}-vp-p{N}-complete."
   })
   ```
5. Check version bump needed — apply `.viepilot/SYSTEM-RULES.md → Version Bump Rules`:
   - Features added → MINOR; Fixes only → PATCH; Mixed → MINOR; Breaking → MAJOR

   **Version bump — invoke changelog-agent (ENH-057, ENH-053 fix):**
   ```
   Agent({ subagent_type: "changelog-agent",
     description: "Bump to {version} + CHANGELOG [{version}]",
     prompt: "version: {version}. date: {today}. entries: {phase_summary_bullets}."
   })
   ```
   Non-Claude Code: update CHANGELOG.md + package.json inline as before.

   > changelog-agent is the **single authority** for version bumps. Both autonomous.md and
   > evolve.md invoke it — never do inline version bumps (resolves ENH-053).

6. Update TRACKER.md current state — spawn tracker-agent:
   ```
   Agent({ subagent_type: "tracker-agent",
     description: "Update TRACKER.md — phase {N} complete",
     prompt: "operation: update-current-state. data: Last completed phase {N} — {phase_name}. version: {version}."
   })
   ```
7. Push branch + tags — spawn vp-git-agent:
   ```
   Agent({ subagent_type: "vp-git-agent",
     description: "Push phase {N} complete",
     prompt: "operation: push-all."
   })
   ```
   Then verify persistence (orchestrator may call this read-only check directly):
   `node bin/vp-tools.cjs git-persistence --strict`

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
