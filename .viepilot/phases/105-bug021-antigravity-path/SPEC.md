# Phase 105 Spec — BUG-021: Antigravity Adapter Path Update

## Goal
Update the Antigravity adapter and related files to use the new `~/.gemini/antigravity/` discovery path after the Google Gemini ecosystem rebrand. After this fix, `vp-tools install --target antigravity` will install skills to `~/.gemini/antigravity/skills/` so Antigravity IDE discovers them without manual copying.

## Version
2.39.0 → **2.39.1** (patch)

## Request
BUG-021

## Tasks

| Task | Description | Complexity |
|------|-------------|------------|
| 105.1 | `lib/adapters/antigravity.cjs` — update 4 path fields | S |
| 105.2 | `bin/viepilot.cjs` uninstall help + docs paths | S |
| 105.3 | `tests/unit/vp-adapter-antigravity.test.js` — update assertions; CHANGELOG + version bump | S |

## Acceptance Criteria
- [ ] `lib/adapters/antigravity.cjs` → `skillsDir` returns `~/.gemini/antigravity/skills`
- [ ] `lib/adapters/antigravity.cjs` → `viepilotDir` returns `~/.gemini/antigravity/viepilot`
- [ ] `lib/adapters/antigravity.cjs` → `executionContextBase` = `.gemini/antigravity/viepilot`
- [ ] `lib/adapters/antigravity.cjs` → `isAvailable` checks `.gemini/antigravity/` with `.antigravity/` fallback
- [ ] `bin/viepilot.cjs` uninstall help updated to `~/.gemini/antigravity/skills/vp-*`
- [ ] `docs/user/features/adapters.md` Antigravity row paths updated
- [ ] `docs/user/features/skill-registry.md` Antigravity row path updated
- [ ] `tests/unit/vp-adapter-antigravity.test.js` assertions match new paths
- [ ] `npm test` all pass
- [ ] `package.json` version = `2.39.1`
