# Task 105.2 — bin/viepilot.cjs + docs: Update Antigravity Path References

## Objective
Update all user-visible path strings referencing the old `~/.antigravity/` location.

## Status: pending

## Paths
bin/viepilot.cjs
docs/user/features/adapters.md
docs/user/features/skill-registry.md

## File-Level Plan

### `bin/viepilot.cjs`
- Uninstall `--target` help text: `antigravity: ~/.antigravity/skills/vp-*` → `antigravity: ~/.gemini/antigravity/skills/vp-*`

### `docs/user/features/adapters.md`
- Row for `antigravity`: `~/.antigravity/skills/` → `~/.gemini/antigravity/skills/`; `~/.antigravity/viepilot/` → `~/.gemini/antigravity/viepilot/`
- `executionContextBase` example: `.antigravity/viepilot` → `.gemini/antigravity/viepilot`

### `docs/user/features/skill-registry.md`
- Antigravity row: `~/.antigravity/skills/` → `~/.gemini/antigravity/skills/`

## Acceptance Criteria
- [ ] `grep "\.antigravity" bin/viepilot.cjs` returns 0 help-text matches (only new path)
- [ ] `grep "\.antigravity" docs/user/features/adapters.md` returns 0 table/example matches
- [ ] `grep "\.antigravity" docs/user/features/skill-registry.md` returns 0 matches
