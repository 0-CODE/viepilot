# Phase 55 SPEC — ui-direction Path Disambiguation Guard (BUG-011)

## Goal
Fix path ambiguity that causes LLM to read `{root}/ui-direction/` (user-managed reference dir) instead of `{root}/.viepilot/ui-direction/` (ViePilot source of truth) when workflows reference ui-direction artifacts.

## Problem Summary
Two locations exist in user projects:
- `{root}/ui-direction/` — user-managed reference material (ignored by ViePilot)
- `{root}/.viepilot/ui-direction/` — ViePilot's frozen design contract (SOT)

`brainstorm.md:416` uses `ui-direction/notes.md` (ambiguous, no `.viepilot/` prefix), and `crystallize.md` `consume_ui_direction` step lacks an explicit disambiguation guard. Result: LLM silently reads wrong directory.

## Target Version
`2.1.1` (patch — bug fix, no API change)

## Tasks

| Task | Title | Complexity |
|------|-------|------------|
| 55.1 | Fix brainstorm.md:416 ambiguous path in confirmation dialogue | S |
| 55.2 | Add PATH GUARD to crystallize.md consume_ui_direction step | S |
| 55.3 | Contract tests — BUG-011 path guard assertions | S |

## Acceptance Criteria
- [ ] `brainstorm.md` confirmation dialogue option 1 shows full path `.viepilot/ui-direction/{session-id}/notes.md`
- [ ] `crystallize.md` consume_ui_direction step begins with `⛔ PATH GUARD` block that explicitly forbids reading `{root}/ui-direction/`
- [ ] Contract tests pass: 3 tests covering guard text in brainstorm.md and crystallize.md
- [ ] Existing ENH-026 tests still pass (no regression on 6 existing tests)
- [ ] `npm test` green

## Related
- BUG-011 request: `.viepilot/requests/BUG-011.md`
- ENH-025 (READ-ONLY guard — 1.9.9): extends that guard with path disambiguation
- ENH-026 (ui-direction hard gate — 1.10.0): crystallize gate unchanged, guard is additive
