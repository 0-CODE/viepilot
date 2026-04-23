# Phase 105 Summary — BUG-021: Antigravity Adapter Path Update

## Result
✅ Complete — v2.39.1

## What Was Done

Fixed the Antigravity adapter to install skills to `~/.gemini/antigravity/skills/` following the Google Gemini ecosystem rebrand. After this fix, `vp-tools install --target antigravity` installs directly to the new discovery path — no manual copy required.

**`lib/adapters/antigravity.cjs`** — 4 fields updated:
- `skillsDir`: `.antigravity/skills` → `.gemini/antigravity/skills`
- `viepilotDir`: `.antigravity/viepilot` → `.gemini/antigravity/viepilot`
- `executionContextBase`: `.antigravity/viepilot` → `.gemini/antigravity/viepilot`
- `isAvailable`: checks `.gemini/antigravity/` first, then falls back to `.antigravity/` for users who haven't updated Antigravity yet

**`bin/viepilot.cjs`** — uninstall `--target` help text updated to `~/.gemini/antigravity/skills/vp-*`

**`docs/user/features/adapters.md`** — Antigravity row and `executionContextBase` example updated

**`docs/user/features/skill-registry.md`** — Antigravity row path updated

**`tests/unit/vp-adapter-antigravity.test.js`** — 5 existing assertions updated + 3 new `isAvailable` tests (new path / old-path fallback / neither)

## Test Results
1522 tests, 73 suites — all pass (13 tests in vp-adapter-antigravity suite: 10 updated + 3 new)
