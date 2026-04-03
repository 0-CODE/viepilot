# ViePilot — Architecture

## System Overview

ViePilot là file-based AI framework — không có server, database, hay network service. Toàn bộ state được lưu trong Git-tracked files. Core loop: **brainstorm → crystallize → auto execution** với human control points.

**Diagram source:** `.viepilot/architecture/system-overview.mermaid`

```mermaid
flowchart LR
  User([Solo Dev]) --> BS["/vp-brainstorm\nsession-*.md"]
  BS --> CRY["/vp-crystallize\n.viepilot/ artifacts"]
  CRY --> AUTO["/vp-auto\nautonomous loop"]
  AUTO --> PASS{Task result}
  PASS -->|PASS| NEXT[Next Task\nHANDOFF update]
  NEXT --> AUTO
  PASS -->|fail| REC["Recovery Layers\nL1→L2→L3 (silent)"]
  REC --> AUTO
  PASS -->|exhausted| CP["Control Point\nuser input"]
  CP --> AUTO
  AUTO --> DONE["Phase Complete\ngit tag"]
  DONE --> NEW["Next Phase\nor /vp-evolve"]
```

*No ViePilot global profile bound — organization context comes from Step 0 only.*

## Architecture Diagram Applicability

- **Complexity**: moderate (file-based, no distributed services)
- **Services/Modules signal**: 5 logical modules (skills, workflows, templates, lib, .viepilot state)
- **Event-driven signal**: none (synchronous skill invocation; Post-MVP: background fork)
- **Deployment signal**: none (distributed as Claude Code skills, no server)
- **User-flow signal**: moderate (3-step user journey with recovery + control points)
- **Integration signal**: low (only Claude Code tool API)

| Diagram type | Status | Reason |
|---|---|---|
| system-overview | required | Core loop has 3 major components + recovery branching |
| data-flow | required | Task execution pipeline is central to v2 (recovery, validation, HANDOFF) |
| event-flows | N/A | No async events in MVP; Post-MVP fork is background only |
| module-dependencies | required | 5 modules with clear dependency direction (skills→workflows→templates→artifacts) |
| deployment | N/A | No server deployment; distributed as Claude Code skills files |
| user-use-case | optional | Covered adequately by system-overview; user journey simple |

## Module Architecture

ViePilot consists of 5 logical modules:

### vp-skills (`skills/vp-*/`)
- **Purpose**: Entry point cho Claude Code — defines skill metadata + invocation
- **Inputs**: User invocation (`/vp-*`), optional args `{{VP_ARGS}}`
- **Outputs**: Routes to workflow via `@workflow` reference
- **Dependencies**: workflows/ (references), Claude Code tool API
- **Format**: SKILL.md with frontmatter (name, description, optional paths:)
- **Constraint**: SKILL.md format giữ nguyên giữa v1→v2 (non-goal breaking change)

### vp-workflows (`workflows/`)
- **Purpose**: Process definitions — step-by-step instructions cho AI
- **Inputs**: Context từ skill invocation + `.viepilot/` state files
- **Outputs**: File mutations, git commits, user prompts
- **Dependencies**: templates/ (for crystallize), `.viepilot/` artifacts (for auto)
- **Key files**: autonomous.md, crystallize.md, brainstorm.md, request.md, evolve.md

### vp-templates (`templates/`)
- **Purpose**: Artifact scaffolding — populated by crystallize/evolve
- **Inputs**: Project metadata từ Step 0 interviews
- **Outputs**: `.viepilot/` files per project
- **Structure**: `templates/project/` (project-level), `templates/phase/` (phase/task level)

### vp-lib (`lib/`, `bin/`)
- **Purpose**: Shell utilities — tag prefix, version bump, git helpers
- **Inputs**: Shell environment
- **Outputs**: stdout, git operations
- **Key tool**: `bin/vp-tools` (tag-prefix, version bump)

### vp-state (`.viepilot/` per project)
- **Purpose**: Runtime state — all project-specific artifacts live here
- **Inputs**: crystallize (initial creation), vp-auto (continuous updates)
- **Outputs**: HANDOFF.json (position), HANDOFF.log (audit), PHASE-STATE.md (progress)
- **Critical files**: TRACKER.md, HANDOFF.json, HANDOFF.log, phases/*/PHASE-STATE.md

## Data Flow — Task Execution Pipeline

**Diagram source:** `.viepilot/architecture/data-flow.mermaid`

```mermaid
flowchart TD
  START([Task Start]) --> LOAD["Batch Context Load\nTRACKER + HANDOFF + PHASE-STATE + TASK\n(parallel, 1 turn)"]
  LOAD --> STATIC["Static Context\nAI-GUIDE + SYSTEM-RULES\n(cached after first read)"]
  STATIC --> CONTRACT["Scope Contract\nwrite_scope lock + type check"]
  CONTRACT --> EXEC["Execute Sub-tasks\n(AI generates + applies changes)"]
  EXEC --> VALID["3-Tier Validation\n1. contract check\n2. write_scope lock verify\n3. git gate"]
  VALID -->|pass| HANDOFF["Update State\nHANDOFF.json + PHASE-STATE.md"]
  VALID -->|fail L1| L1["L1: Lint/Format\n(silent, max attempts per budget)"]
  L1 --> VALID
  VALID -->|fail L2| L2["L2: Targeted Test Fix\n(silent, max attempts per budget)"]
  L2 --> VALID
  VALID -->|fail L3| L3["L3: Scope Reduce\n(silent, 1 attempt)\nBlocked if recovery_overrides.L3.block=true"]
  L3 --> VALID
  VALID -->|budget exhausted| CP["Control Point\n(first user-visible failure)"]
  HANDOFF --> LOG["HANDOFF.log\nappend event\n(non-blocking)"]
  LOG --> DONE([Task PASS])
```

### Event Flows
- **Status**: N/A
- Not applicable: No async message queues or webhooks in MVP. Post-MVP background fork for TRACKER/CHANGELOG updates will be fire-and-forget (not event-driven architecture).

## Module Dependencies

**Diagram source:** `.viepilot/architecture/module-dependencies.mermaid`

```mermaid
flowchart LR
  subgraph Skills ["skills/vp-*/"]
    S1[vp-brainstorm]
    S2[vp-crystallize]
    S3[vp-auto]
    S4[vp-resume]
    S5[vp-request]
    S6[vp-evolve]
  end
  subgraph Workflows ["workflows/"]
    W1[brainstorm.md]
    W2[crystallize.md]
    W3[autonomous.md]
    W4[resume.md]
    W5[request.md]
    W6[evolve.md]
  end
  subgraph Templates ["templates/"]
    T1[project/]
    T2[phase/]
  end
  subgraph State [".viepilot/ per project"]
    A1[TRACKER.md\nROADMAP.md\nAI-GUIDE.md]
    A2[HANDOFF.json\nHANDOFF.log]
    A3[phases/*/\nPHASE-STATE.md\ntasks/*.md]
  end
  subgraph Lib ["lib/ + bin/"]
    L1[vp-tools\nshell helpers]
  end
  Skills --> Workflows
  W2 --> Templates
  W2 --> State
  W3 --> State
  W4 --> State
  W6 --> Templates
  W6 --> State
  W3 --> Lib
  State --> State
```

### User Use-Case Flows
- **Status**: optional
- Covered adequately by system-overview diagram. Solo dev is the single actor; all flows reduce to the brainstorm→crystallize→auto loop.

## Technology Decisions

| Decision | Choice | Rationale | Alternatives Considered |
|----------|--------|-----------|------------------------|
| State format | JSON (HANDOFF.json) + Markdown (.md) | Human-readable + git-diffable | SQLite (not portable), pure YAML (less tooling) |
| Audit log | Append-only JSONL (HANDOFF.log) | Crash-safe, no rewrite needed | JSON array (requires full rewrite on append) |
| Skill format | Markdown (SKILL.md) | Claude Code native format | TypeScript LocalCommand (overkill for prompt skills) |
| Workflow format | Markdown with XML process tags | AI-readable, structured | Pure prose (loses structure), YAML (verbose) |
| Recovery tracking | Budget table in TASK.md | Per-task customizable | Global config (too rigid) |
| Version control | Git tags per task | Atomic rollback unit | Branch per task (too many branches) |

## Deployment Architecture

- **Status**: N/A
- Not applicable: ViePilot is distributed as Claude Code skill files (copied to `~/.claude/skills/` or project `.claude/skills/`). No server, no container, no network deployment. Install = file copy.

## Monitoring & Observability

- **Logging**: HANDOFF.log (append-only JSONL, per-project, phase-rotated)
- **Progress**: TRACKER.md + PHASE-STATE.md (human-readable)
- **Audit**: git log + git tags (per-task commit trail)
- **Alerting**: control point mechanism (AI surfaces to user only on exhausted recovery)
