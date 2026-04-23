# Phase 60 — Summary: Remove shell installers (ENH-036) → 2.3.1

## What shipped
- Deleted `install.sh` (125 lines) — bash wrapper that called `bin/viepilot.cjs`; contained outdated hardcoded `.cursor/` paths
- Deleted `dev-install.sh` (176 lines) — bash adapter routing that duplicated `lib/adapters/`
- `package.json` `files` array: removed both entries — `npm pack` no longer includes them
- `README.md`: updated installation table (line 72) to reference `bin/viepilot.cjs install`; removed `install.sh` from project structure (line 422)
- Removed 5 tests across 3 test files that only verified shell script content:
  - `viepilot-install.test.js`: `install.sh wrapper (28.4)` describe block (1 test)
  - `viepilot-adapters.test.js`: Group 4 `dev-install.sh adapter variable` (2 tests)
  - `vp-adapter-antigravity.test.js`: Group 4 `dev-install.sh antigravity target` (2 tests)

## Test count
600 → 595 (−5)

## Why safe to remove
- `install.sh` self-described itself as "thin wrapper around the Node installer"
- `dev-install.sh` adapter routing (`claude-code / cursor / antigravity → SKILLS_DIR/VIEPILOT_DIR`) is fully covered by `lib/adapters/` + `bin/viepilot.cjs install --target <adapter>`
- No other shell scripts or CI config referenced either file
