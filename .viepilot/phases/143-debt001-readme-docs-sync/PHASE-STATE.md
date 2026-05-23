# Phase 143 State — DEBT-001: README + Docs Drift Sync (v3.7.3)

## Status: done

## Tasks
| ID | Title | Status |
|----|-------|--------|
| 143.1 | README.md — badges + Project Scale + Completion Status + versioning note | ✅ done |
| 143.2 | docs/skills-reference.md — add vp-design, vp-intake, vp-persona sections | ✅ done |
| 143.3 | docs/dev/architecture.md — orchestration model update (ENH-096/097) | ✅ done |
| 143.4 | CHANGELOG [3.7.3] + version bump + tests | ✅ done |

## Version Target
3.7.2 → **3.7.3**

## Resolves
- DEBT-001: README + docs drifted since v3.1.1 — badges stale, 3 skills missing from skills-reference, architecture model outdated

## Dependencies
- Phase 142 ✅ (ENH-097 complete — delegates to be documented in arch)

## Key Design Decisions
- Tasks 143.1, 143.2, 143.3 are independent — run in parallel
- Task 143.4 gates on all three
- PATCH version bump (docs only, no behavior change)
- README version note: remove confusing "framework SemVer vs npm version" paragraph — there is only one version now (3.7.3)
- docs/skills-reference.md stubs: mirror existing skill entry format (trigger, flags, flow, output)
- architecture.md: update §Orchestration to describe read+spawn model from ENH-096/097

## Started: 2026-05-23
## Completed: 2026-05-23
