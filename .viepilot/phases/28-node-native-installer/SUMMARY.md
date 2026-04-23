# Phase 28 Summary — Node-native installer (ENH-017)

## Result
Shipped **`viepilot@1.7.0`** installer engine migration: `npx viepilot install` now runs Node plan/apply logic, no longer depends on `bash install.sh` for primary path.

## Key files
- `lib/viepilot-install.cjs`
- `bin/viepilot.cjs`
- `install.sh`
- `tests/unit/viepilot-install.test.js`
- `docs/troubleshooting.md`, `docs/dev/deployment.md`, `CHANGELOG.md`

## Verification
- `npm run verify:release`
- `node bin/viepilot.cjs install --target cursor-agent --yes --dry-run`

## Tags
- `viepilot-vp-p28-t1-done`
- `viepilot-vp-p28-t2-done`
- `viepilot-vp-p28-t3-done`
- `viepilot-vp-p28-t4-done`
- `viepilot-vp-p28-complete`
- `v1.7.0`
