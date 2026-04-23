# Task 105.1 — lib/adapters/antigravity.cjs: Update Path Fields

## Objective
Update `lib/adapters/antigravity.cjs` to use the new `~/.gemini/antigravity/` discovery path. Change all 4 affected fields: `skillsDir`, `viepilotDir`, `executionContextBase`, `isAvailable`.

## Status: done

## Paths
lib/adapters/antigravity.cjs

## File-Level Plan

### `lib/adapters/antigravity.cjs`
- `skillsDir`: `path.join(home, '.antigravity', 'skills')` → `path.join(home, '.gemini', 'antigravity', 'skills')`
- `viepilotDir`: `path.join(home, '.antigravity', 'viepilot')` → `path.join(home, '.gemini', 'antigravity', 'viepilot')`
- `executionContextBase`: `'.antigravity/viepilot'` → `'.gemini/antigravity/viepilot'`
- `isAvailable`: check `.gemini/antigravity/` first; fallback to `.antigravity/` for old installs

## Acceptance Criteria
- [ ] `skillsDir('/fake/home')` returns a path containing `.gemini/antigravity/skills`
- [ ] `viepilotDir('/fake/home')` returns a path containing `.gemini/antigravity/viepilot`
- [ ] `executionContextBase === '.gemini/antigravity/viepilot'`
- [ ] `isAvailable` returns true for `.gemini/antigravity/` directory
- [ ] `isAvailable` also returns true for `.antigravity/` directory (backward compat)
