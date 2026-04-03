# Task 13.1: autonomous.md — task-boundary re-hydrate (Tier A)

## Meta
- **Phase**: 13-agent-orchestration-tier-ab
- **Status**: complete
- **Complexity**: M
- **Dependencies**: none
- **Git Tag**: `viepilot-vp-p13-t13.1`

## Task Metadata

```yaml
type: build
complexity: M
write_scope:
  - workflows/autonomous.md
recovery_budget: M
can_parallel_with: []
recovery_overrides:
  L1: { block: false }
  L2: { block: false }
  L3: { block: false, reason: "" }
```

## Objective
Add an explicit **task-boundary context re-hydrate** step to `workflows/autonomous.md`: before starting each task (or immediately after the previous task PASS, before the next task body), the executor must **batch-read** at minimum: current `TASK.md`, relevant rows from `PHASE-STATE.md`, `HANDOFF.json`, and `context_required` / `files_to_read` from the task — so long autonomous runs do not rely on stale conversation memory.

## Pre-execution documentation gate (doc-first; BUG-001)

- [x] Plan references exact `autonomous.md` section/anchor to insert or extend (e.g. after Discover Phases or start of Execute Task).
- [x] No conflict with Working Directory Guard or token budget blocks.

## Paths
```yaml
files_to_create: []
files_to_modify:
  - workflows/autonomous.md
```

## File-Level Plan
- `workflows/autonomous.md`: New step or subsection **Task-boundary context load** with mandatory parallel read list; state that Initialize-time load is insufficient for multi-task runs.

## Context Required
```yaml
files_to_read:
  - .viepilot/ARCHITECTURE.md
  - docs/brainstorm/session-2026-04-03.md
  - workflows/autonomous.md
```

## Acceptance Criteria
- [x] Workflow text requires re-read of current task file + HANDOFF + PHASE-STATE slice each task boundary.
- [x] Wording consistent with existing Initialize batch-read pattern.
- [x] No regression to install-path guard semantics.

## Verification
```yaml
automated:
  - command: "rg -n 're-hydrate|rehydrate|task-boundary|Task-boundary' workflows/autonomous.md || true"
    expected: "at least one match after implementation"
manual:
  - description: "Skim autonomous.md flow: each task entry re-loads file state"
    required: true
```

## State Update Checklist
- [x] PHASE-STATE.md / TRACKER / HANDOFF per vp-auto PASS protocol

## Implementation Notes
- After `For each task in phase:` in `workflows/autonomous.md` §3b, add **`#### Task-boundary context re-hydrate (Tier A — mandatory)`** before the existing **Load Task Context** subsection.
- New text: require a **parallel batch read** each task boundary of `.viepilot/TRACKER.md`, `.viepilot/HANDOFF.json`, current phase `PHASE-STATE.md` (at least `execution_state` + **Task Status** table), current `tasks/{task}.md`, plus every path under the task file’s `## Context Required` / `files_to_read`.
- State explicitly that **Initialize** (§1) batch-read does **not** replace this step for multi-task runs (anti–context-rot).
- Restate **Working Directory Guard**: all targets stay under `{project_cwd}`; install bundles remain read-only (no regression vs BUG-007).
- Add one line under **Load Task Context** pointing back to Tier A as the mandatory first step of the per-task load.

## Post-Completion
- Shipped **Tier A** subsection in `workflows/autonomous.md` §3b (`Task-boundary context re-hydrate`) plus **Load Task Context** preamble cross-reference.
- Git: `viepilot-vp-p13-t13.1` (start), `viepilot-vp-p13-t13.1-done` (PASS).
