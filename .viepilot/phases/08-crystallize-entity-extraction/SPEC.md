# Phase 08: ENH-022 — Crystallize Domain Entity Extraction

## Goal
Add explicit domain entity extraction step (Fix A) and dependency validation step (Fix C) to crystallize.md. Prevent crystallize from skipping CRUD management service phases when a project has domain entities in brainstorm.

## Background
Crystallize over-indexes on event-driven/streaming architecture patterns from brainstorm and skips the implicit CRUD management layer (e.g., TenantService, UserService, VehicleService). The management APIs are required by later phases (e.g., TAP ingest task "resolve tenant/device") but no service phase is generated.

## Tasks

| # | Task | Complexity | File(s) |
|---|------|------------|---------|
| 8.1 | Domain Entity Extraction step (Fix A) in crystallize.md | M | `workflows/crystallize.md` |
| 8.2 | Dependency Validation step (Fix C) in crystallize.md | M | `workflows/crystallize.md` |
| 8.3 | Entity manifest output format in SPEC.md template | S | `templates/project/SPEC.md` (if exists) or crystallize.md doc |
| 8.4 | Version bump 2.0.3 → 2.1.0 + CHANGELOG | S | `package.json`, `CHANGELOG.md`, `.viepilot/TRACKER.md` |

## Execution Order
8.1 → 8.2 → 8.3 → 8.4

## Acceptance Criteria
- [ ] `grep -n 'Domain Entity Extraction' workflows/crystallize.md` → match found
- [ ] `grep -n 'Dependency Validation' workflows/crystallize.md` → match found
- [ ] crystallize generates entity manifest table in SPEC.md output
- [ ] `node -p "require('./package.json').version"` → `2.1.0`

## Dependencies
- Phase 7 (BUG-007 fix should be in before first MINOR bump)

## Notes
Scaffolded by `/vp-evolve` on 2026-04-03.
Fixes ENH-022 logged in `.viepilot/requests/ENH-022.md`.
First feature of v2.1 milestone → version bump to 2.1.0 on completion.
