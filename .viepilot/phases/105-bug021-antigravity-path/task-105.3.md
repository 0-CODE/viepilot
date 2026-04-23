# Task 105.3 — Tests + CHANGELOG + Version Bump

## Objective
Update unit test assertions to match new `.gemini/antigravity/` paths, verify all tests pass, add CHANGELOG entry, and bump version to 2.39.1.

## Status: pending

## Paths
tests/unit/vp-adapter-antigravity.test.js
CHANGELOG.md
package.json

## File-Level Plan

### `tests/unit/vp-adapter-antigravity.test.js`
- `skillsDir` test: change `expect(dir).toContain('.antigravity')` → check for `.gemini/antigravity/skills`
- `viepilotDir` test: change `toContain(path.join('.antigravity', 'viepilot'))` → `.gemini/antigravity/viepilot`
- `executionContextBase` test: `'.antigravity/viepilot'` → `'.gemini/antigravity/viepilot'`
- `buildInstallPlan` test: `toContain('.antigravity')` → `toContain('.gemini')`
- `rewrite.to` test: `'.antigravity/viepilot'` → `'.gemini/antigravity/viepilot'`
- Add new `isAvailable` fallback test: creates `.antigravity/` tmpdir, expects `isAvailable` to return true
- Add new `isAvailable` new-path test: creates `.gemini/antigravity/` tmpdir, expects `isAvailable` to return true

### `CHANGELOG.md`
- Add `## [2.39.1] — 2026-04-23` section: `fix(antigravity): update adapter install path to ~/.gemini/antigravity/ (BUG-021)`

### `package.json`
- `"version": "2.39.0"` → `"version": "2.39.1"`

## Acceptance Criteria
- [ ] `npm test` — all test suites pass (0 failures)
- [ ] Updated tests reference `.gemini/antigravity` not `.antigravity`
- [ ] `package.json` version = `2.39.1`
- [ ] `CHANGELOG.md` has `[2.39.1]` entry
