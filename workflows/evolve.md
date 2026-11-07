<purpose>
Upgrade or expand the project: add features, start a new milestone, or refactor.
</purpose>

## Adapter Compatibility
Tool policy: follow `<tool_policy>` in the invoking skill (source: templates/tool-policy.md)

| Feature | Claude Code (terminal) | Cursor (Agent/Skills) | Codex CLI | Antigravity (native) |
|---------|----------------------|-----------------------|-----------|----------------------|
| Interactive prompts | ✅ `AskUserQuestion` tool — **REQUIRED** | ❌ text fallback | ❌ text fallback | ❌ text fallback |

**Claude Code (terminal):** Always call `AskUserQuestion` first. Only fall back to the plain-text menu below if the tool returns an error or is unavailable.
**Cursor / Codex CLI / Antigravity / other adapters:** `AskUserQuestion` not available — use text menus below.

## ViePilot Skill Scope Policy (BUG-004)

- Default behavior: only use and suggest skills under `vp-*`.
- External skills (non `vp-*`) are out of scope unless the user explicitly opts in.
- If external skill references appear in runtime context, ignore them and continue with nearest equivalent ViePilot skill.

## Implementation routing guard (planning vs execution)

- **`evolve.md`** only **plans**: ROADMAP, phase dir, SPEC/tasks, TRACKER, CHANGELOG `[Unreleased]` notes when the workflow requires — does **not** implement shipping code by default (`lib/`, `tests/`, `bin/`, `workflows/` outside plan, etc.).
- **Next step:** **`/vp-auto`** after task/phase has a plan (doc-first **BUG-001**).
- **Exception:** User **explicit** bypass — must be stated clearly in chat.


<process>

> **AUQ preload — Claude Code adapter (ENH-059):** At session start, before any interactive prompt, call `ToolSearch` with `query: "select:AskUserQuestion"` to load the deferred schema. Required on Claude Code (terminal). Skip only if `ToolSearch` returns an error → use text fallback for that session.

<step name="detect_state">
## 1. Detect Current State

```bash
cat .viepilot/TRACKER.md
cat .viepilot/ROADMAP.md
```

Determine:
- Current milestone progress
- Is milestone complete?
- Current version
</step>

<step name="ask_intent">
## 2. Ask User Intent

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► EVOLVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Current: {milestone_name}
 Progress: {percent}%
 Version: {version}

How would you like to evolve the project?
```

> **Claude Code (terminal) — REQUIRED:** Call `AskUserQuestion` tool. Only fall back to text menu if the tool errors or is unavailable.
> **Cursor / Codex / Antigravity:** use text menu below.
> AUQ spec:
>   - question: "How would you like to evolve the project?"
>   - header: "Evolve mode"
>   - options: [{ label: "Add Feature", description: "Add a new capability to the current milestone" }, { label: "New Milestone", description: "Archive current milestone and start a new scope" }, { label: "Refactor", description: "Improve existing code without adding new features" }]
>   - multiSelect: false
> - **Cursor / Codex / Antigravity / other:** use text menu below

```
1. Add Feature - Add new feature to current milestone
2. New Milestone - Start a new milestone (archive current)
3. Refactor - Improve existing code without new features
```
</step>

<step name="add_feature">
## 3A. Add Feature Mode

### Gather Feature Info
```
Describe the new feature:

1. Feature name?
2. What does it do? (1-2 sentences)
3. Which services/modules affected?
4. Dependencies on existing code?

> **Claude Code (terminal) — REQUIRED (question 5 — complexity):** Call `AskUserQuestion` tool. Only fall back to text menu if the tool errors or is unavailable.
> **Cursor / Codex / Antigravity:** use text menu below.
> AUQ spec:
>   - question: "Estimated implementation complexity?"
>   - header: "Complexity"
>   - options: [{ label: "S — Small", description: "Few hours — isolated change, 1 file" }, { label: "M — Medium", description: "1–2 days — 1–2 files, some integration" }, { label: "L — Large", description: "3–5 days — multiple modules affected" }, { label: "XL — Extra Large", description: "1+ week — architectural change or major feature" }]
>   - multiSelect: false
> **Cursor / Codex / Antigravity / other:** use text below

5. Estimated complexity? (S/M/L/XL)

> **Claude Code (terminal) — REQUIRED (question 6 — brainstorm routing):** Call `AskUserQuestion` tool. Only fall back to text menu if the tool errors or is unavailable.
> **Cursor / Codex / Antigravity:** use text menu below.
> AUQ spec:
>   - question: "Does this feature need a brainstorm session first?"
>   - header: "Brainstorm?"
>   - options: [{ label: "Yes — go to /vp-brainstorm", description: "Research-heavy, UX-driven, or landing page feature — brainstorm first" }, { label: "No — plan directly", description: "Scope is clear — proceed to phase/task planning now" }]
>   - multiSelect: false
> **Cursor / Codex / Antigravity / other:** use text below

6. Need deep brainstorm? (landing page / UX / growth ideas / research-heavy)
```

### Plan Mode (ENH-129 — Claude Code, optional)

Plan the phase in Claude Code Plan Mode: read-only exploration, then one native approval of the whole phase plan
before any plan file is written.

- **Trigger:** the `--plan-mode` flag, or — when the complexity answer is **L** or **XL**, or the request is vague —
  offer it with AskUserQuestion: "Plan this phase in Plan Mode?" Options: Use Plan Mode (Recommended for L/XL) /
  Plan directly.
- **Flow:**
  1. `ToolSearch` with `select:EnterPlanMode,ExitPlanMode`, then `EnterPlanMode`.
  2. Read-only exploration (Read / Grep / Glob, Explore subagents) and the architecture check below.
  3. Write the draft to the plan file: phase goal, decisions, tasks with Paths, implementation notes, acceptance
     criteria and verification, version target.
  4. `ExitPlanMode` — the user approves or asks for changes (revise in Plan Mode until approved).
- **On approval:** write SPEC.md, the task files, PHASE-STATE.md and the ROADMAP entry **verbatim from the approved
  plan** (doc-first: the plan must survive compaction), and append the approved plan to SPEC.md under
  "Approved plan (Plan Mode, verbatim)".
- **One gate only:** ExitPlanMode is the plan-approval gate — do not add an AskUserQuestion "is the plan ok?" on top.
- **Fallback:** hosts without Plan Mode (Cursor Agent mode, Codex, Copilot, Antigravity) and subagents use the normal
  flow below; optionally show the draft and ask with AskUserQuestion / a numbered list before writing.

### Check Architecture Compatibility
```bash
cat .viepilot/ARCHITECTURE.md
```

Questions:
- Does it fit existing architecture?
- Need new services?
- Database changes needed?
- Breaking changes?

If incompatible → suggest refactor first or discuss alternative.

### Phase Template Suggestion (ENH-073)
Read persona's phase template:
```bash
node "$HOME/.claude/viepilot/bin/vp-tools.cjs" persona context
```
If `persona.phase_template` is set and matches a domain pack (web-saas/data-science/mobile/devops/ai-product),
suggest the domain pack's `phase_template.phases` as default phase ordering when generating tasks.
User can override freely. Silent if persona unavailable.

### Smart Route to Brainstorm (when applicable)
If the feature leans toward product discovery, UX, or landing page:
- Route through advanced brainstorm instead of locking the phase immediately:
  - `/vp-brainstorm --new --landing --research` (if there is a landing page)
  - `/vp-brainstorm --new --research` (if a research decision is needed)
- After brainstorm is complete, return to `/vp-evolve` to crystallize phase/tasks.

### Generate Phase
Create new phase in ROADMAP.md:
```markdown
### Phase {N+1}: {Feature Name}
**Goal**: {description}
**Estimated Tasks**: {count}
**Dependencies**: Phase {N}

| Task | Description | Acceptance Criteria |
|------|-------------|---------------------|
| {N+1}.1 | ... | ... |
| {N+1}.2 | ... | ... |

**Verification**:
- [ ] {criteria}
```

### ⚠️ TASK PATH RULE (BUG-009)

When writing the `## Paths` block in **any task `.md` file**, ALWAYS use paths
**relative to the repository root** (where `package.json` / `Makefile` lives).

```
CORRECT (repo-relative):
  workflows/crystallize.md
  skills/vp-audit/SKILL.md
  templates/project/AI-GUIDE.md
  lib/viepilot-config.cjs
  bin/vp-tools.cjs
  tests/unit/my-test.test.js

INCORRECT (never use in ## Paths):
  ~/.claude/viepilot/workflows/crystallize.md
  ~/.claude/skills/vp-audit/SKILL.md
  /Users/someone/.claude/...
  /absolute/path/to/anything
```

**Exception:** paths *inside* code block content (bash examples, runtime descriptions)
may reference absolute paths (e.g., `~/.claude/viepilot/config.json` inside a bash
snippet). Only the `## Paths` header block must be repo-relative.

If unsure of the repo-relative path, inspect:
- `ls workflows/`   → workflow files
- `ls skills/`      → skill files
- `ls lib/`         → library files
- `ls bin/`         → CLI files
- `ls templates/`   → template files

**Resolution rule (BUG-012):** Paths in `## Paths` are always resolved from `{cwd}` (the repo root where `package.json` lives) — never from `~/.claude/`, `~/.cursor/`, or any install directory. When both a codebase copy and an installed copy exist, `{cwd}` wins.

### Create Phase Directory
```bash
mkdir -p .viepilot/phases/{NN}-{feature-slug}/tasks/
```

Create:
- SPEC.md
- PHASE-STATE.md
- Task files

### Update State
- Update ROADMAP.md
- Update TRACKER.md
- Suggest version bump (MINOR)

### Todo Mirror (ENH-118 — MANDATORY)

You MUST mirror the phase tasks into the host's native todo list AND the `## Todo` checklist. This step is a hard gate, not a suggestion. You MUST NOT skip it, defer it, or substitute a prose summary.

```bash
# Resolve vp-tools (ENH-118): repo copy when developing ViePilot, else first installed copy found
VP_TOOLS=""
if [ -f bin/vp-tools.cjs ] && grep -q '"name": "viepilot"' package.json 2>/dev/null; then
  VP_TOOLS="bin/vp-tools.cjs"
else
  for d in "$HOME/.claude/viepilot" "$HOME/.cursor/viepilot" "$HOME/.codex/viepilot" \
           "$HOME/.config/gh-copilot/viepilot" "$HOME/.gemini/antigravity/viepilot"; do
    [ -f "$d/bin/vp-tools.cjs" ] && VP_TOOLS="$d/bin/vp-tools.cjs" && break
  done
fi
[ -n "$VP_TOOLS" ] || { echo "⛔ vp-tools not found — reinstall ViePilot (npx viepilot install)"; exit 1; }
```
When the current adapter is known (ADAPTER_CONTEXT), the orchestrator SHOULD put that adapter's install dir first in the loop.
Use `node "$VP_TOOLS" todo ...` for every ENH-118 command below (and in every later ENH-118 gate).

1. Resolve `getTodoCapability(ADAPTER_ID)` (lib/adapter-context.cjs).
2. Claude Code: run `ToolSearch select:TaskCreate,TaskUpdate,TaskList`; if unavailable, `select:TodoWrite`; else use the fallback and print `enable_hint` once. Other adapters: use `todo.tools` ONLY when `verified: true`; otherwise use the fallback.
3. Native: create the items from `node "$VP_TOOLS" todo payload --phase N --adapter <id>` and record the returned task ids in-session. Fallback: `node "$VP_TOOLS" todo sync --phase N`.
4. You MUST always also run `node "$VP_TOOLS" todo sync --phase N` (the checklist is the durable mirror used by gates).
5. Verify with `node "$VP_TOOLS" todo check --phase N` (exit 0 required).

After the phase and task files are created, you MUST run this block for EACH new phase. If it was not run, evolve is NOT complete.
</step>

<step name="new_milestone">
## 3B. New Milestone Mode

### Archive Current Milestone
```bash
mkdir -p .viepilot/milestones/v{current}/
mv .viepilot/ROADMAP.md .viepilot/milestones/v{current}/
```

Create MILESTONE-SUMMARY.md:
```markdown
# Milestone {version} - {name} Summary

## Completed: {date}

## Phases
{list phases with status}

## Key Achievements
- {achievement}

## Decisions Made
{from TRACKER.md}

## Metrics
- Total tasks: {count}
- Completed: {count}
- Skipped: {count}

## Lessons Learned
- {lesson}
```

Create git tag:
```bash
git tag -a v{version} -m "Release v{version} - {milestone_name}"
```

### Start New Milestone
```
New milestone details:

1. Milestone name?
2. Milestone goal? (1-2 sentences)
3. Target features?
```

Options:
- Route to `/vp-brainstorm --new` for full brainstorm
- If milestone has landing page focus: `/vp-brainstorm --new --landing --research`
- Quick setup with minimal questions

For a new milestone planned in one sitting, the Plan Mode option (ENH-129, see Add Feature) applies the same way.

### Generate New ROADMAP.md
Either from brainstorm or quick setup.

### Update Version
- Bump MAJOR (breaking) or MINOR (features)
- Update all version references
</step>

<step name="refactor">
## 3C. Refactor Mode

### Analyze Code
```
What would you like to refactor?

1. Auto-detect - Analyze code for improvement areas
2. Specific area - Tell me what to refactor
```

**Auto-detect checks:**
- Code duplication
- Long methods/classes
- Architecture violations
- Performance issues
- Technical debt markers (TODO, FIXME, HACK)

### Create Refactor Tasks
For each improvement:
```markdown
| Task | Description | Impact |
|------|-------------|--------|
| R.1 | Extract {X} to separate class | Maintainability |
| R.2 | Optimize {Y} query | Performance |
```

### Ensure Backward Compatibility
- List any breaking changes
- Document migration steps if needed
- Update ARCHITECTURE.md if structure changes

For a large refactor, the Plan Mode option (ENH-129, see Add Feature) applies the same way.

### Generate Refactor Phase
Add to ROADMAP.md as phase {N+0.5} or insert between phases.
</step>

<step name="update_version">
## 4. Update Version

Apply the canonical bump rules from `.viepilot/SYSTEM-RULES.md → Version Bump Rules`.
Precedence: MAJOR > MINOR > PATCH. Mixed phase → highest applicable bump wins.

Quick reference:
- Add Feature → **MINOR**
- Bug fix only → **PATCH**
- Refactor (no behavior change) → **PATCH**
- Mixed feature + fix → **MINOR**
- Breaking change → **MAJOR**

Update in:
- TRACKER.md
- pom.xml / package.json / version file
- CHANGELOG.md [Unreleased] section
</step>

<step name="confirm">
## 5. Confirm & Suggest Next

Output the evolution summary banner. The `Todo:` line is REQUIRED (ENH-118); if it is missing, evolve is NOT complete.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► EVOLVE COMPLETE ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Mode: {Add Feature | New Milestone | Refactor}

 Changes:
 - {change 1}
 - {change 2}

 Version: {old} → {new}

 New Phases:
 - Phase {N}: {name}

 Todo: ✓ {N} items ({native|fallback})

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Then — **Claude Code adapter (terminal): use AskUserQuestion**:

```
question: "Phase {N} planned. What would you like to do next?"
options:
  - label: "Execute now → /vp-auto"
    description: "Start implementing Phase {N} immediately (Recommended)"
  - label: "Create another request → /vp-request"
    description: "Log more requests before implementing"
  - label: "Done for now"
    description: "Exit — run /vp-auto later to start implementation"
```

**On selection:**
- "Execute now → /vp-auto": invoke `/vp-auto --from {new_phase}` skill
- "Create another request → /vp-request": invoke `/vp-request` skill
- "Done for now": print brief confirmation and exit

**Text fallback (Cursor, Codex, Copilot, Antigravity — AUQ not available):**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Next:
 - /vp-auto --from {new_phase}    Execute Phase {N}
 - /vp-request                    Create another request
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
</step>

</process>

<success_criteria>
- [ ] User intent identified
- [ ] Architecture compatibility checked
- [ ] New phases added to ROADMAP.md
- [ ] Phase directories created
- [ ] TRACKER.md updated
- [ ] Version bumped appropriately
- [ ] CHANGELOG.md updated
- [ ] Ready for execution
</success_criteria>
