# Phase 20 Summary — README sync via cloc + donate section (FEAT-006)

## Outcome
Phase completed with all tasks delivered.

## Delivered
- Added README metric sync script: `scripts/sync-readme-metrics.cjs`.
- Added npm command: `npm run readme:sync`.
- Updated autonomous workflow/skill docs to include README metric sync step with non-blocking fallback.
- Added installer dependency checks for `cloc` in `install.sh` and `dev-install.sh` (guidance + best-effort option).
- Added donation section to `README.md` with provided PayPal/MOMO links.
- Added tests for README sync helper logic in `tests/unit/readme-metrics.test.js`.

## Verification
- `node --check scripts/sync-readme-metrics.cjs` ✅
- `npm test -- tests/unit/readme-metrics.test.js tests/unit/guided-installer.test.js` ✅
- `npm run readme:sync` ✅ (fallback behavior verified when `cloc` is unavailable)

## Notes
- Implementation intentionally avoids bundling `cloc` binaries into ViePilot to keep cross-platform compatibility.
