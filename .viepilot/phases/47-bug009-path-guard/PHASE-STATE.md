# Phase 47 State

## Status: complete

## Tasks
- [x] 47.1 workflows/evolve.md — add TASK PATH RULE guard (BUG-009) to task generation step
- [x] 47.2 workflows/autonomous.md — add preflight path validation (reject ~/  and absolute paths in ## Paths)
- [x] 47.3 skills/vp-evolve/SKILL.md + skills/vp-auto/SKILL.md — document path convention in <context>
- [x] 47.4 Jest contract tests: vp-bug009-path-guard.test.js

## Blockers
_None_

## Notes
- Planned: 2026-04-06
- Completed: 2026-04-06
- Version target: 1.15.0 (patch bump — guard/doc only, no behavior change for correct usage)
- Prerequisite for: Phase 48 (ENH-031), Phase 49 (ENH-032)
- Severity: HIGH — without this fix, vp-auto can silently edit live install instead of source
