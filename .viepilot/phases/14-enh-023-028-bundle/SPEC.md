# Phase 14: ENH-023–028 Bundle

## Goal
Ship six linked enhancements from `.viepilot/requests/`: state reliability hooks (023), interactive Q&A (027), crystallize review gate (028), Plan mode guidance (026), async state fork (024), worktree escalation (025).

## Execution order
`14.1` ENH-027 → `14.2` ENH-023 → `14.3` ENH-028 → `14.4` ENH-026 → `14.5` ENH-024 → `14.6` ENH-025

**Rationale**: 028 depends on 027 (`vp-tools ask`). 023 adds `vp-tools` subcommand used before heavy 028. 026/024/025 all touch `autonomous.md` — batch after crystallize churn from 028.

## Dependencies
- Phase 8+ baseline.
- Recommend Phase 10 complete before starting 14.x to limit `autonomous.md` merge pain (overlaps token budget, Gap G, Phase 13 Tier A).

## Acceptance
See per-task files and request acceptance criteria in ENH-023 … ENH-028.

## Notes
Scaffolded by `/vp-evolve --feature` on 2026-04-03.
