# Phase 27 Summary — vp-info + vp-update (FEAT-008)

## Result
Shipped **`viepilot@1.6.0`**: `vp-tools info` / `info --json`, `vp-tools update` with controlled npm upgrade paths, Cursor skills `vp-info` and `vp-update`, docs sweep, and Jest coverage for `viepilot-info` / `viepilot-update` libs.

## Key files
- `lib/viepilot-info.cjs`, `lib/viepilot-update.cjs`, `bin/vp-tools.cjs`
- `skills/vp-info/SKILL.md`, `skills/vp-update/SKILL.md`
- `tests/unit/viepilot-info.test.js`, `tests/unit/viepilot-update.test.js`
- `docs/skills-reference.md`, `docs/dev/cli-reference.md`, `docs/user/quick-start.md`, `README.md`, `CHANGELOG.md`

## Verification
- `npm run verify:release`
- `node bin/vp-tools.cjs info --json`

## Tags
- `viepilot-vp-p27-t1-done` … `viepilot-vp-p27-t5-done`, `viepilot-vp-p27-complete`, `v1.6.0`
