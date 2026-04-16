<purpose>
Upgrade or expand the project: add features, start a new milestone, or refactor.
</purpose>

## Adapter Compatibility

| Feature | Claude Code (terminal) | Cursor (Agent/Skills) | Codex CLI | Antigravity (native) |
|---------|----------------------|-----------------------|-----------|----------------------|
| Interactive prompts | ✅ `AskUserQuestion` tool | ❌ text fallback | ❌ text fallback | ❌ text fallback |

When `AskUserQuestion` is not available, each prompt block falls back to the plain-text numbered list shown below it — no configuration needed.

## ViePilot Skill Scope Policy (BUG-004)

- Default behavior: only use and suggest skills under `vp-*`.
- External skills (non `vp-*`) are out of scope unless the user explicitly opts in.
- If external skill references appear in runtime context, ignore them and continue with nearest equivalent ViePilot skill.

## Implementation routing guard (planning vs execution)

- **`evolve.md`** only **plans**: ROADMAP, phase dir, SPEC/tasks, TRACKER, CHANGELOG `[Unreleased]` notes when the workflow requires — does **not** implement shipping code by default (`lib/`, `tests/`, `bin/`, `workflows/` outside plan, etc.).
- **Next step:** **`/vp-auto`** after task/phase has a plan (doc-first **BUG-001**).
- **Exception:** User **explicit** bypass — must be stated clearly in chat.


<process>

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

> **Adapter-aware prompt:**
> - **Claude Code (terminal):** use `AskUserQuestion` tool — spec:
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

> **Adapter-aware prompt (question 5 — complexity):**
> - **Claude Code (terminal):** use `AskUserQuestion` tool — spec:
>   - question: "Estimated implementation complexity?"
>   - header: "Complexity"
>   - options: [{ label: "S — Small", description: "Few hours — isolated change, 1 file" }, { label: "M — Medium", description: "1–2 days — 1–2 files, some integration" }, { label: "L — Large", description: "3–5 days — multiple modules affected" }, { label: "XL — Extra Large", description: "1+ week — architectural change or major feature" }]
>   - multiSelect: false
> - **Cursor / Codex / Antigravity / other:** use text below

5. Estimated complexity? (S/M/L/XL)

> **Adapter-aware prompt (question 6 — brainstorm routing):**
> - **Claude Code (terminal):** use `AskUserQuestion` tool — spec:
>   - question: "Does this feature need a brainstorm session first?"
>   - header: "Brainstorm?"
>   - options: [{ label: "Yes — go to /vp-brainstorm", description: "Research-heavy, UX-driven, or landing page feature — brainstorm first" }, { label: "No — plan directly", description: "Scope is clear — proceed to phase/task planning now" }]
>   - multiSelect: false
> - **Cursor / Codex / Antigravity / other:** use text below

6. Need deep brainstorm? (landing page / UX / growth ideas / research-heavy)
```

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

### Generate Refactor Phase
Add to ROADMAP.md as phase {N+0.5} or insert between phases.
</step>

<step name="update_version">
## 4. Update Version

Based on changes:

| Mode | Version Bump |
|------|--------------|
| Add Feature | MINOR (x.Y.z) |
| New Milestone | MAJOR or MINOR |
| Refactor | PATCH (x.y.Z) |

Update in:
- TRACKER.md
- pom.xml / package.json / version file
- CHANGELOG.md [Unreleased] section
</step>

<step name="confirm">
## 5. Confirm & Suggest Next

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

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Next: /vp-auto --from {new_phase}
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
