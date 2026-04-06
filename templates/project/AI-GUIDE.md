# {{PROJECT_NAME}} - AI Navigation Guide

> **Read this file BEFORE starting any task**
> This file helps you find the right context without loading everything

## Quick Lookup

| I need to... | Read file | Section |
|--------------|-----------|---------|
| Understand what the project does | `PROJECT-CONTEXT.md` | `<domain_knowledge>` |
| Vision & phased scope | `PROJECT-CONTEXT.md` | `<product_vision>` |
| Roadmap phases (beyond current task) | `ROADMAP.md` | Phases after current phase |
| Know the tech stack | `ARCHITECTURE.md` | `## Technology Decisions` |
| See what each service does | `ARCHITECTURE.md` | `## Services` |
| Know current phase | `TRACKER.md` | `## Current State` |
| See next task | `ROADMAP.md` | Find phase marked `In Progress` |
| Coding conventions | `SYSTEM-RULES.md` | `<coding_rules>` |
| What NOT to do | `SYSTEM-RULES.md` | `<do_not>` |
| Database schema | `schemas/database-schema.sql` | - |
| API contracts | `schemas/api-contracts.yaml` | - |
| Past decisions | `TRACKER.md` | `## Decision Log` |
| Resume in-progress work | `HANDOFF.json` | - |
| Package structure | `PROJECT-META.md` | `## Package Structure` |
| File headers | `PROJECT-META.md` | `## File Headers` |

## Context Loading Strategy

### Minimal Context (for quick tasks)
```
Read only:
1. AI-GUIDE.md (this file)
2. TRACKER.md → Current State
3. The specific file related to the task
```

### Standard Context (for coding tasks)
```
Read in order:
1. AI-GUIDE.md (this file)
2. TRACKER.md → know where you are
3. PROJECT-CONTEXT.md → <product_vision> + phased scope (read BEFORE locking detailed design)
4. ROADMAP.md → skim phases after current phase, then current task
5. SYSTEM-RULES.md → coding rules
6. Schema file if needed
```

### Full Context (for architecture decisions)
```
Read in order:
1. AI-GUIDE.md + TRACKER.md
2. PROJECT-CONTEXT.md → domain + <product_vision> (complete)
3. ROADMAP.md → phases + tasks
4. ARCHITECTURE.md
5. SYSTEM-RULES.md
6. Original brainstorm session (if detailed rationale needed)
```

### Product vision & phase planning (before "locking" architecture)

- Before deep implementation tasks or major architecture decisions: read `<product_vision>` and phase goals in `ROADMAP.md` **together** with the current task.

## File Relationships

```
AI-GUIDE.md (read first)
     │
     ├── TRACKER.md (current state)
     │      └── points to → current phase in ROADMAP.md
     │
     ├── PROJECT-CONTEXT.md (domain + <product_vision> / phased scope)
     │      └── read early with → ROADMAP.md phases
     │
     ├── ROADMAP.md (phases + tasks)
     │      └── tasks reference → schemas/
     │
     ├── SYSTEM-RULES.md (how to code)
     │      └── rules reference → ARCHITECTURE.md
     │
     ├── ARCHITECTURE.md (system design)
     │      └── decisions from → PROJECT-CONTEXT.md
     │
     └── docs/brainstorm/ (session rationale)
```

## When Creating New Files

1. Read `PROJECT-META.md#file-headers` for correct header
2. Use package from `PROJECT-META.md#package-structure`
3. Add @author tag from `PROJECT-META.md#lead-developer`
4. Follow `SYSTEM-RULES.md#coding_rules`
5. Follow `SYSTEM-RULES.md#comment_standards`

## Comment Rules Quick Reference

| ✅ DO | ❌ DON'T |
|-------|----------|
| Explain WHY | State the obvious |
| Document business rules | Comment out dead code |
| Warn about side effects | Write misleading comments |
| Explain complex logic | Add noise comments |
| Add TODO with ticket | Write journal comments |

Full guidelines: `SYSTEM-RULES.md#comment_standards`

## When to Re-read

| Trigger | Refresh |
|---------|---------|
| Starting a new session | `TRACKER.md`, `HANDOFF.json` |
| Switching phases | `ROADMAP.md` section for the new phase |
| Encountering architecture issues | `ARCHITECTURE.md`, `SYSTEM-RULES.md` |
| Unclear business rule | `PROJECT-CONTEXT.md` |
| Need to make a new decision | `TRACKER.md` → Decision Log |

## Commands Reference

| Command | When to use |
|---------|-------------|
| `/vp-status` | Quick progress view |
| `/vp-auto` | Run autonomous execution |
| `/vp-pause` | Stop and save state |
| `/vp-resume` | Continue from pause |
| `/vp-evolve` | Add features / start new milestone |
| `/vp-docs` | Generate documentation |
| `/vp-task` | Manage tasks manually |
