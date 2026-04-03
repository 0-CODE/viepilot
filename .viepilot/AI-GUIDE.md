# ViePilot - AI Navigation Guide

> Read this first. This crystallize run seeds the **v3 compiler-runtime refactor** while the published baseline remains **v2.2.3**.

## Quick Context

- ViePilot global profile: not bound (`.viepilot/META.md` missing)
- Baseline release: `2.2.3`
- Planning target: `3.0.0-alpha`
- Diagram profile: `default-monolith`
- Stack index: `.viepilot/STACKS.md`

## Quick Lookup

| Need | Read | Section |
|------|------|---------|
| Project purpose and constraints | `PROJECT-CONTEXT.md` | `<domain_knowledge>` |
| v3 thesis and phased scope | `PROJECT-CONTEXT.md` | `<product_vision>` |
| Near-term phases plus horizon | `ROADMAP.md` | milestone phases + horizon block |
| Current execution position | `TRACKER.md` | `## Current State` |
| Resume point | `HANDOFF.json` | `position`, `context` |
| Architecture and diagram inventory | `ARCHITECTURE.md` | overview + applicability matrix |
| Machine-readable diagram scope | `SPEC.md` | `## Diagram Applicability Matrix` |
| Runtime/logical schemas | `schemas/` | all files |
| Coding and process rules | `SYSTEM-RULES.md` | all rule blocks |
| Metadata and attribution | `PROJECT-META.md` | project/org/developer tables |
| Original rationale | `docs/brainstorm/session-2026-04-04.md` | thesis + horizon |

## Context Loading Strategy

> Load related files in one batch. Do not read them sequentially unless a previous read changes the next decision.

### Static boundary

- `SYSTEM-RULES.md`
- `ARCHITECTURE.md`
- `PROJECT-META.md`
- `.viepilot/STACKS.md`

### Dynamic boundary

- `TRACKER.md`
- `HANDOFF.json`
- current `PHASE-STATE.md`
- current task file

### Read before locking implementation decisions

1. `PROJECT-CONTEXT.md` `<product_vision>`
2. `ROADMAP.md` current phase + horizon
3. `ARCHITECTURE.md` relevant sections

This refactor specifically exists to remove runtime dependence on planning prose. Treat prose as rationale or projection unless a file is explicitly marked canonical.

### Stack cache lookup

1. Read `.viepilot/STACKS.md`
2. Read each stack `SUMMARY.md` first
3. Expand to `BEST-PRACTICES.md` and `ANTI-PATTERNS.md` only if the task changes that layer
4. Use `SOURCES.md` when a behavior decision needs official-doc verification

## Install Path Warning

`~/.claude/viepilot/`, `~/.cursor/viepilot/`, and `~/.codex/viepilot/` are read-only runtime mirrors. All edits must happen in this repository working tree.

## Minimal Read Sets

### Quick task

1. `AI-GUIDE.md`
2. `TRACKER.md`
3. target file

### Execution task

1. `AI-GUIDE.md`
2. `TRACKER.md`
3. `PROJECT-CONTEXT.md`
4. `ROADMAP.md`
5. current task file
6. `SYSTEM-RULES.md`

### Architecture or compiler task

1. `AI-GUIDE.md`
2. `PROJECT-CONTEXT.md`
3. `ROADMAP.md`
4. `ARCHITECTURE.md`
5. `SPEC.md`
6. `schemas/`
7. referenced stack cache entries

## Commands Reference

| Command | Use |
|---------|-----|
| `/vp-status` | Inspect progress and control points |
| `/vp-auto` | Start phases 21-24 |
| `/vp-pause` | Persist execution state |
| `/vp-resume` | Rehydrate current phase/task |
| `/vp-evolve` | Change milestone or add planning deltas |
| `/vp-docs` | Refresh public docs after milestone work |
