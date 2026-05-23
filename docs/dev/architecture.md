# Architecture

ViePilot là một Markdown-native autonomous coding framework. Không có server, không có database — chỉ có files, git, và AI.

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              USER INTERFACE                             │
│                      (Cursor / Claude / AI Assistant)                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            SKILLS LAYER (14)                            │
│  brainstorm │ crystallize │ auto │ pause │ resume │ status │ request    │
│  evolve │ docs │ task │ debug │ rollback │ audit │ ui-components        │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          WORKFLOWS LAYER (12)                           │
│  brainstorm.md │ crystallize.md │ autonomous.md │ pause-work.md        │
│  resume-work.md │ request.md │ evolve.md │ documentation.md            │
│  debug.md │ rollback.md │ audit.md │ ui-components.md                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          TEMPLATES LAYER (16)                           │
│  Project Templates (11): AI-GUIDE, ARCHITECTURE, PROJECT-META, ...     │
│  Phase Templates (5): SPEC, PHASE-STATE, TASK, VERIFICATION, SUMMARY   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            CLI LAYER                                    │
│                         vp-tools.cjs (13 commands)                      │
│  init │ current-timestamp │ phase-info │ task-status │ commit          │
│  progress │ version │ reset │ clean │ checkpoints │ conflicts          │
│  save-state │ help                                                      │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            STATE LAYER                                  │
│  HANDOFF.json (machine state) │ TRACKER.md (human) │ Git Tags          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Skills | Markdown + YAML frontmatter | Skill definitions with metadata |
| Workflows | Markdown + XML-like tags | Step-by-step process definitions |
| Templates | Markdown with `{{PLACEHOLDER}}` | Reusable document templates |
| CLI | Node.js (CommonJS, no deps) | State management, progress tracking |
| State | JSON + Markdown | Machine + human readable state |
| VCS | Git with tags | Checkpoints and versioning |

## Skills Layer

Skills sống tại `skills/vp-{name}/SKILL.md` (installed: `~/.cursor/skills/`).

### Skill Structure

```
skills/vp-{name}/SKILL.md
├── YAML Frontmatter (name, description, version)
├── <cursor_skill_adapter>  ← Cursor AI invocation rules
├── <objective>             ← What it does
├── <execution_context>     ← Workflow reference (or inline <process>)
├── <context>               ← Flags and options
├── <process>               ← Execution steps
└── <success_criteria>      ← Completion checks
```

### Skill Categories

| Category | Skills | Purpose |
|----------|--------|---------|
| Setup | brainstorm, crystallize | Project initialization |
| Execute | auto, task | Development execution |
| Control | pause, resume | Session management |
| Monitor | status | Progress tracking |
| Develop | request, evolve | Ongoing development |
| Debug | debug | Systematic debugging |
| Recovery | rollback | Checkpoint recovery |
| Quality | audit | Documentation sync |
| Finalize | docs | Documentation generation |

## Workflows Layer

Workflows sống tại `workflows/*.md` (installed: `~/.cursor/viepilot/workflows/`).

### Workflow Structure

```xml
<purpose>Brief description</purpose>

<process>
  <step name="step_name">
    ## Step Title
    Instructions...
  </step>
</process>

<success_criteria>
  - [ ] Criteria
</success_criteria>
```

### Workflow Flow

```
brainstorm.md → crystallize.md → autonomous.md
                                       │
pause-work.md ←→ resume-work.md        ▼
                                 documentation.md
request.md ──────────────────────────────────────┘
evolve.md ───────────────────────────────────────┘

Debug & Recovery (anytime):
debug.md ──────► Track issues across sessions
rollback.md ───► Recover to any checkpoint

Quality:
audit.md ──────► Sync docs with implementation
```

## State Layer

### HANDOFF.json (Machine State)

```json
{
  "milestone": "M1",
  "phase": 3,
  "task": 2,
  "status": "in_progress",
  "last_activity": "2026-03-30T14:00:00Z",
  "git": {
    "head": "abc1234",
    "branch": "main"
  },
  "context": {
    "files_touched": ["..."],
    "decisions": ["..."],
    "blockers": []
  }
}
```

### TRACKER.md (Human State)

```markdown
## Current State
- Milestone: M1
- Phase: 3

## Progress Overview
Phase 1: [██████████] 100% ✅
Phase 2: [████████░░]  80% 🔄
```

### Git Tags (Checkpoints)

```
vp-p{N}-t{T}        ← Starting task T in phase N
vp-p{N}-t{T}-done   ← Completed task T
vp-p{N}-complete    ← Completed phase N
v{semver}           ← Release tag
```

## Data Flow

```
User Request
     │
     ▼
┌─────────────┐
│   Skill     │──── Parses VP_ARGS, loads context
└─────────────┘
     │
     ▼
┌─────────────┐
│  Workflow   │──── Executes step-by-step process
└─────────────┘
     │
     ▼
┌─────────────┐
│  Templates  │──── Generates/updates artifacts
└─────────────┘
     │
     ▼
┌─────────────┐
│   State     │──── Updates HANDOFF.json, TRACKER.md
└─────────────┘
     │
     ▼
┌─────────────┐
│    Git      │──── Commits, tags for checkpoints
└─────────────┘
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Markdown-based skills | AI-native, human-readable, versionable |
| Separate state files | Machine (JSON) vs Human (Markdown) readability |
| Git tags for checkpoints | Reliable recovery, no external dependencies |
| Template `{{PLACEHOLDER}}` | Customization without code changes |
| Workflow XML-like tags | Clear step boundaries, parseable |
| No external runtime | Works with any AI assistant |
| CommonJS (no ESM) | Maximum Node.js compatibility |

## Agent Orchestration Model (ENH-096/097)

As of v3.7.2, the vp-auto orchestrator is **read + spawn only**. It never calls Edit, Write, or Bash for any write operation. All work is delegated to specialized subagents:

| Agent | Role | Tools Permitted |
|-------|------|-----------------|
| vp-auto orchestrator | Read state, spawn workers, gate phase transitions | Read, Bash (read-only git only), Agent |
| vp-task-executor | All implementation — code, docs, config edits | Read, Edit, Write, MultiEdit, Bash, Glob, Grep, LS |
| vp-quality-gate | Run verification commands, report PASS/FAIL | Read, Bash, Grep, Glob, LS |
| vp-phase-planner | Build dependency graph, identify parallel task clusters | Read, Glob, Grep, LS |
| tracker-agent | Write state files: PHASE-STATE.md, TRACKER.md, HANDOFF.json, ROADMAP.md | Read, Edit, Write |
| vp-git-agent | Git operations: create-tag, push-branch, push-tags, push-all, git-status | Bash only |
| changelog-agent | Write CHANGELOG.md entries for features and fixes | Read, Edit, Write |

**Result formats:**
- `TASK_RESULT: PASS | FAIL | PARTIAL` — returned by vp-task-executor and vp-quality-gate
- `GIT_RESULT: PASS | FAIL | SKIP` — returned by vp-git-agent

**Orchestration flow:**
1. Orchestrator reads PHASE-STATE.md + task contracts
2. Spawns tracker-agent → set tasks `in_progress`
3. Spawns vp-task-executor(s) — parallel fan-out for independent tasks
4. Spawns vp-quality-gate for each completed task
5. On PASS: spawns tracker-agent → mark task done, update HANDOFF.json
6. On phase complete: spawns vp-git-agent (tag + push), tracker-agent (ROADMAP update), changelog-agent

## Extension Points

| Point | How to Extend |
|-------|---------------|
| New Skill | Add `skills/vp-{name}/SKILL.md` |
| New Workflow | Add `workflows/{name}.md` |
| New Template | Add to `templates/project/` or `templates/phase/` |
| CLI Command | Add to `bin/vp-tools.cjs` |
