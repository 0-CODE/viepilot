# Phase 07: Hotfix — Working Directory Guard (BUG-007)

## Goal
Prevent vp-auto from editing install paths (`~/.claude/viepilot/`, `~/.cursor/viepilot/`) instead of codebase source. Add explicit Working Directory Guard to autonomous.md and install path READ-ONLY note to AI-GUIDE.md template.

## Background
During the BUG-005/BUG-006 fix session, AI attempted to edit `~/.claude/viepilot/workflows/autonomous.md` (install path) instead of `/Users/.../viepilot/workflows/autonomous.md` (codebase). Root cause: autonomous.md has no working directory guard. AI infers edit target from where it reads the workflow file.

## Tasks

| # | Task | Complexity | File(s) |
|---|------|------------|---------|
| 7.1 | Working Directory Guard block in autonomous.md | M | `workflows/autonomous.md` |
| 7.2 | Install path READ-ONLY note in AI-GUIDE.md template | S | `templates/project/AI-GUIDE.md` |
| 7.3 | Version bump 2.0.2 → 2.0.3 + CHANGELOG | S | `package.json`, `CHANGELOG.md`, `.viepilot/TRACKER.md` |

## Execution Order
7.1 → 7.2 → 7.3

## Acceptance Criteria
- [ ] `grep -n 'Working Directory Guard' workflows/autonomous.md` → match found
- [ ] `grep -n 'READ-ONLY' templates/project/AI-GUIDE.md` → match in install path section
- [ ] `node -p "require('./package.json').version"` → `2.0.3`

## Dependencies
- None (critical safety fix — first phase)

## Notes
Scaffolded by `/vp-evolve` on 2026-04-03 for v2.1 milestone.
Fixes BUG-007 logged in `.viepilot/requests/BUG-007.md`.
