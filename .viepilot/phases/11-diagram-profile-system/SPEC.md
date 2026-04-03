# Phase 11: Diagram Profile System

## Goal
Stack-aware architecture diagram generation. crystallize detects project stacks → selects diagram profile → generates applicability matrix + folder structure. vp-auto updates stale diagrams at phase complete (not per task).

## Background
Current crystallize generates flat diagram templates regardless of stack. Complex projects (microservice + Kafka + SPA) need ~15 different diagram types organized by layer; simple REST monoliths need ~5. A profile system maps stack combinations to required diagram types.

## Tasks

| # | Task | Complexity | File(s) |
|---|------|------------|---------|
| 11.1 | crystallize.md — Stack detection → diagram profile selection | M | `workflows/crystallize.md` |
| 11.2 | crystallize.md — Generate diagram applicability matrix in SPEC.md | M | `workflows/crystallize.md` |
| 11.3 | crystallize.md — Create architecture folder structure per profile | S | `workflows/crystallize.md` |
| 11.4 | autonomous.md — Stale diagram detection + update trigger at phase complete | M | `workflows/autonomous.md` |
| 11.5 | Version bump 2.1.2 → 2.1.3 + CHANGELOG | S | `package.json`, `CHANGELOG.md`, `.viepilot/TRACKER.md` |

## Execution Order
11.1 → 11.2 → 11.3 → 11.4 → 11.5

## Architecture Folder Structure
```
architecture/
  cross/           system-overview, data-flow, service-boundaries
  backend/         api-routes, kafka-topics, database-er, state-machines/
  frontend/        component-hierarchy, page-flow
  sequences/       auth-flow, ingest-flow, command-flow
```

## Stack Detection Matrix
| Stack | Adds Diagrams |
|-------|--------------|
| Microservices | service-boundaries, api-routes per service |
| Kafka/MQ | kafka-topics, data-flow |
| SQL DB | database-er (detailed) |
| SPA frontend | component-hierarchy, page-flow |
| Auth module | sequences/auth-flow |
| State-heavy entities | state-machines/{entity} |

## Acceptance Criteria
- [ ] crystallize on microservice + Kafka project → architecture/cross/ + architecture/backend/ dirs created
- [ ] SPEC.md has diagram applicability matrix table
- [ ] `grep -n 'stale diagram' workflows/autonomous.md` → match in phase complete section
- [ ] `node -p "require('./package.json').version"` → `2.1.3`

## Dependencies
- Phase 8 (ENH-022) complete — entity extraction may inform state-machines/ diagram list

## Notes
Scaffolded by `/vp-evolve` on 2026-04-03.
Tasks 11.1-11.3 all touch `workflows/crystallize.md` — sequential.
