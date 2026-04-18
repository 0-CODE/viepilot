---
name: vp-evolve
description: "Upgrade, add features, or start a new milestone"
version: 0.3.0
---

<greeting>
## Invocation Banner

Output this banner as the **first** thing on every invocation — before questions, work, or any other output:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► VP-EVOLVE  v0.3.0 (fw 2.19.0)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
</greeting>

<cursor_skill_adapter>
## A. Skill Invocation
- Skill được gọi khi user mention `vp-evolve`, `/vp-evolve`, "evolve", "thêm feature", "milestone mới", "upgrade"
- Treat all user text after the skill mention as `{{VP_ARGS}}`

## B. User Prompting
Prompt user conversationally with options.

## C. Tool Usage
Use Cursor tools: `Shell`, `ReadFile`, `Glob`, `rg`, `ApplyPatch`, `WebSearch`, `WebFetch`, `Subagent`
</cursor_skill_adapter>
<scope_policy>
## ViePilot Namespace Guard (BUG-004)
- Default mode: only use and reference `vp-*` skills in ViePilot workflows.
- External skills (`non vp-*`) are out of framework scope unless user explicitly opts in.
- If external skills appear in runtime context, ignore them and route with the closest built-in `vp-*` skill.
</scope_policy>

<implementation_routing_guard>
## Implementation routing guard (ENH-021)

- This skill is **planning only**: ROADMAP, phase dir, SPEC/tasks, TRACKER, version/CHANGELOG notes when the workflow specifies — does **not** implement default shipping code (`lib/`, `tests/`, `bin/`, large edits to `workflows/`/`skills/` beyond plan artifacts).
- **Next step:** **`/vp-auto`**. See `workflows/evolve.md`.
- **Exception:** User **explicit** bypass — state clearly in chat.
</implementation_routing_guard>


<objective>
Upgrade or expand the project after completing a milestone or when new features are needed.

**Modes:**
1. **Add Feature** - Add a feature to the current milestone
2. **New Milestone** - Start a new milestone
3. **Refactor** - Improve existing code

**Routing intelligence:**
- For requests leaning toward idea exploration (especially landing pages), prioritize routing through enhanced `/vp-brainstorm` before the crystallize phase.
- Supports brainstorm routing with in-session research so the user can decide within a single session.

**Updates:**
- `.viepilot/ROADMAP.md`
- `.viepilot/TRACKER.md`
- `.viepilot/ARCHITECTURE.md` (if there are changes)
- `CHANGELOG.md`
</objective>

<execution_context>
@$HOME/{envToolDir}/workflows/evolve.md
</execution_context>

<context>
Optional flags:
- `--feature` : Add feature mode
- `--milestone` : New milestone mode
- `--refactor` : Refactor mode

**Task path convention (BUG-009):**
When generating task files, ALL paths in `## Paths` blocks MUST be
repo-relative (relative to the repository root where `package.json` lives).

```
CORRECT:   workflows/foo.md   skills/vp-bar/SKILL.md   lib/foo.cjs
INCORRECT: ~/.claude/viepilot/workflows/foo.md   /absolute/path
```

Absolute paths inside code block content (bash examples, runtime descriptions)
are fine — only the `## Paths` header block must use repo-relative paths.
See guard in `workflows/evolve.md` → "TASK PATH RULE (BUG-009)".
</context>

<process>

### Step 1: Detect Current State
```bash
cat .viepilot/TRACKER.md
```
- Check milestone progress
- Check if current milestone complete

### Step 2: Ask User Intent
```
How would you like to evolve the project?

1. Add Feature - Add new feature to current milestone
2. New Milestone - Start a new milestone (archive current)
3. Refactor - Improve existing code without new features
```

### Step 3A: Add Feature Mode
```yaml
flow:
  1. Ask feature description
  2. Mini brainstorm:
     - What does it do?
     - Which services affected?
     - Dependencies on existing code?
  3. If landing-page or research-heavy:
     - route: /vp-brainstorm --new --landing --research
     - return here after brainstorm summary
  4. Check architecture compatibility
  5. Generate new phase in ROADMAP.md
  6. Create phase directory with SPEC.md
  7. Update TRACKER.md
  
output:
  - New phase added to ROADMAP.md
  - Phase directory created
  - Ready for /vp-auto
```

### Step 3B: New Milestone Mode
```yaml
flow:
  1. Archive current milestone:
     - Move ROADMAP.md → milestones/v{X}/
     - Create MILESTONE-SUMMARY.md
     - Tag git: v{X}.0.0
  2. Start brainstorm for new scope:
     - Default: /vp-brainstorm --new
     - If landing-page oriented: /vp-brainstorm --new --landing --research
  3. After brainstorm, route to /vp-crystallize
  4. Carry over:
     - PROJECT-META.md (unchanged)
     - SYSTEM-RULES.md (unchanged)
     - Learnings and patterns
     
output:
  - Previous milestone archived
  - New ROADMAP.md created
  - Version bumped (MAJOR or MINOR)
```

### Step 3C: Refactor Mode
```yaml
flow:
  1. Analyze code for improvement areas:
     - Code duplication
     - Performance issues
     - Architecture violations
     - Technical debt
  2. Create refactor tasks
  3. Ensure backward compatibility
  4. Generate refactor phase
  5. Update ARCHITECTURE.md if structure changes

output:
  - Refactor phase added
  - Backward compatibility documented
  - Ready for /vp-auto
```

### Step 4: Update Version
Based on changes:
- **Add Feature** → MINOR bump
- **New Milestone** → MAJOR or MINOR bump
- **Refactor** → PATCH bump (no behavior change)

Update in:
- TRACKER.md
- pom.xml / package.json
- CHANGELOG.md [Unreleased] section

### Step 5: Confirm & Suggest Next
```
✓ Evolution complete

Mode: {mode}
Changes:
- {list changes}

Version: {old} → {new}

Next action: /vp-auto --from {new_phase}
```
</process>

## Adapter Compatibility

### AskUserQuestion Tool (ENH-048 + ENH-055)

| Adapter | Interactive Prompts | Notes |
|---------|---------------------|-------|
| Claude Code (terminal) | ✅ `AskUserQuestion` tool — **REQUIRED** | Must call AUQ; plain-text only if tool errors or is unavailable |
| Cursor (Agent/Skills) | ❌ Text fallback | AskQuestion not available in Agent Mode |
| Codex CLI | ❌ Text fallback | Native tool N/A |
| Antigravity (native agent) | ❌ Text fallback | Artifact model, no raw tool calls |

**Claude Code (terminal):** Always call `AskUserQuestion` first. Only fall back to the plain-text menu if the tool returns an error or is unavailable.

**Prompts using AskUserQuestion in this skill:**
- Evolve mode selection (Step 2 — Add Feature / New Milestone / Refactor)
- Complexity selection (Step 3A — S/M/L/XL)
- Brainstorm routing decision (Step 3A — Yes / No)

<success_criteria>
- [ ] User intent correctly identified
- [ ] Architecture compatibility checked
- [ ] ROADMAP.md updated with new phases
- [ ] TRACKER.md updated
- [ ] Version bumped appropriately
- [ ] CHANGELOG.md updated
- [ ] Landing-page requests are routed to enhanced brainstorm flow
- [ ] Research-heavy requests can be handled inside brainstorm session
- [ ] Ready for execution
</success_criteria>
