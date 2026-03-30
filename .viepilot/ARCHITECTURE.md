# ViePilot - Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              USER INTERFACE                             │
│                      (Cursor / Claude / AI Assistant)                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            SKILLS LAYER (12)                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │ brainstorm  │ │ crystallize │ │    auto     │ │   pause     │       │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │   resume    │ │   status    │ │   request   │ │   evolve    │       │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │    docs     │ │    task     │ │   debug     │ │  rollback   │       │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          WORKFLOWS LAYER (10)                           │
│  brainstorm.md │ crystallize.md │ autonomous.md │ pause-work.md        │
│  resume-work.md │ request.md │ evolve.md │ documentation.md            │
│  debug.md │ rollback.md                                                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          TEMPLATES LAYER (16)                           │
│  ┌──────────────────────────┐  ┌──────────────────────────┐            │
│  │    Project Templates     │  │     Phase Templates      │            │
│  │         (11)             │  │          (5)             │            │
│  │  AI-GUIDE, ARCHITECTURE  │  │  SPEC, PHASE-STATE       │            │
│  │  PROJECT-META, CONTEXT   │  │  TASK, VERIFICATION      │            │
│  │  SYSTEM-RULES, ROADMAP   │  │  SUMMARY                 │            │
│  │  TRACKER, CHANGELOG      │  │                          │            │
│  │  CONTRIBUTING, README    │  │                          │            │
│  │  CONTRIBUTORS            │  │                          │            │
│  └──────────────────────────┘  └──────────────────────────┘            │
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
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │  HANDOFF.json   │  │   TRACKER.md    │  │   Git Tags      │         │
│  │ (machine state) │  │ (human readable)│  │ (checkpoints)   │         │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Skills | Markdown + YAML frontmatter | Skill definitions with metadata |
| Workflows | Markdown + XML-like tags | Step-by-step process definitions |
| Templates | Markdown with placeholders | Reusable document templates |
| CLI | Node.js (CommonJS) | State management, progress tracking |
| State | JSON + Markdown | Machine + human readable state |
| VCS | Git with tags | Checkpoints and versioning |

## Skills Layer Detail

### Skill Structure
```
skills/vp-{name}/SKILL.md
├── YAML Frontmatter (name, description, version)
├── <cursor_skill_adapter> (invocation rules)
├── <objective> (what it does)
├── <execution_context> (workflow reference)
├── <context> (flags, options)
├── <process> (execution steps)
└── <success_criteria> (completion checks)
```

### Skill Categories

| Category | Skills | Purpose |
|----------|--------|---------|
| Setup | brainstorm, crystallize | Project initialization |
| Execute | auto, task | Development execution |
| Control | pause, resume | Session management |
| Monitor | status | Progress tracking |
| Develop | request, evolve | Ongoing development |
| Debug | debug | Systematic debugging with state tracking |
| Recovery | rollback | Checkpoint recovery and rollback |
| Finalize | docs | Documentation generation |

## Workflows Layer Detail

### Workflow Structure
```xml
<purpose>
  What this workflow accomplishes
</purpose>

<process>
  <step name="step_name">
    ## Step Title
    Details and instructions
  </step>
</process>

<success_criteria>
  - [ ] Completion checks
</success_criteria>
```

### Workflow Flow

```
brainstorm.md      → crystallize.md → autonomous.md
     │                                      │
     ▼                                      ▼
pause-work.md  ←→  resume-work.md      documentation.md
                                            ▲
request.md ────────────────────────────────┘
evolve.md ─────────────────────────────────┘

Debug & Recovery (can be invoked anytime):
debug.md ──────► Track issues across sessions
rollback.md ───► Recover to any checkpoint
```

## Templates Layer Detail

### Project Templates (11)
| Template | Purpose |
|----------|---------|
| AI-GUIDE.md | AI navigation and context loading |
| PROJECT-META.md | Project metadata and headers |
| ARCHITECTURE.md | System design documentation |
| PROJECT-CONTEXT.md | Domain knowledge |
| SYSTEM-RULES.md | Coding standards |
| ROADMAP.md | Development plan |
| TRACKER.md | Progress tracking |
| CHANGELOG.md | Version history |
| CONTRIBUTING.md | Contribution guidelines |
| CONTRIBUTORS.md | Attribution |
| README.md | Project overview |

### Phase Templates (5)
| Template | Purpose |
|----------|---------|
| SPEC.md | Phase specification |
| PHASE-STATE.md | Task status tracking |
| TASK.md | Task details |
| VERIFICATION.md | Quality checks |
| SUMMARY.md | Completion summary |

## State Management

### HANDOFF.json (Machine State)
```json
{
  "milestone": "M1",
  "phase": 3,
  "task": 2,
  "status": "in_progress",
  "last_activity": "2026-03-30T20:00:00Z",
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
- Task: 2

## Progress Overview
Phase 1: ████████████ 100%
Phase 2: ████████████ 100%
Phase 3: ██████░░░░░░  50%
```

### Git Tags (Checkpoints)
```
vp-p1-t1        # Starting task 1 in phase 1
vp-p1-t1-done   # Completed task 1 in phase 1
vp-p1-complete  # Completed phase 1
```

## Data Flow

```
User Request
     │
     ▼
┌─────────────┐
│   Skill     │──────► Parses VP_ARGS, loads context
└─────────────┘
     │
     ▼
┌─────────────┐
│  Workflow   │──────► Executes step-by-step process
└─────────────┘
     │
     ▼
┌─────────────┐
│  Templates  │──────► Generates/updates artifacts
└─────────────┘
     │
     ▼
┌─────────────┐
│   State     │──────► Updates HANDOFF.json, TRACKER.md
└─────────────┘
     │
     ▼
┌─────────────┐
│    Git      │──────► Commits, tags for checkpoints
└─────────────┘
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Markdown-based skills | AI-native, human-readable, versionable |
| Separate state files | Machine (JSON) vs Human (Markdown) readability |
| Git tags for checkpoints | Reliable recovery, no external dependencies |
| Template placeholders | Customization without code changes |
| Workflow XML-like tags | Clear step boundaries, parseable |
| No external runtime | Works with any AI assistant (Cursor, Claude CLI, etc.) |

## Extension Points

| Point | How to Extend |
|-------|---------------|
| New Skill | Add `skills/vp-{name}/SKILL.md` |
| New Workflow | Add `workflows/{name}.md` |
| New Template | Add to `templates/project/` or `templates/phase/` |
| CLI Command | Add to `bin/vp-tools.cjs` |
