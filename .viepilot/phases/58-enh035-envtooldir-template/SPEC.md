# Phase 58 SPEC — {envToolDir} template variable replaces .cursor/viepilot (ENH-035)

## Goal
Replace all hardcoded `.cursor/viepilot` references in `skills/*/SKILL.md` source files with the canonical placeholder `{envToolDir}`. The install step resolves `{envToolDir}` → `adapter.executionContextBase` for every adapter. Remove the `pathRewrite` field from adapters entirely.

## Problem
- 14 of 16 SKILL.md files contain `.cursor/viepilot` (28 occurrences total)
- Skills are Cursor-biased at the source level; every new adapter needs `pathRewrite: { from: '.cursor/viepilot', to: '...' }`
- Fragile, unprofessional — source files should be platform-neutral

## Solution
```
Before (in skills/vp-auto/SKILL.md):
  @$HOME/.cursor/viepilot/workflows/autonomous.md

After:
  @$HOME/{envToolDir}/workflows/autonomous.md

At install time (lib/viepilot-install.cjs):
  replace {envToolDir} → adapter.executionContextBase
  e.g. .cursor/viepilot | .claude/viepilot | .antigravity/viepilot
```

## Target Version
`2.2.0` (MINOR — adapter interface change; install behavior preserved)

## Tasks

| Task | Title | Complexity |
|------|-------|------------|
| 58.1 | Replace `.cursor/viepilot` with `{envToolDir}` in 14 `skills/*/SKILL.md` files | S |
| 58.2 | Update `lib/viepilot-install.cjs`: unconditional `{envToolDir}` substitution (remove pathRewrite gate) | S |
| 58.3 | Remove `pathRewrite` field from `lib/adapters/claude-code.cjs` and `cursor.cjs` | S |
| 58.4 | Update `tests/unit/viepilot-adapters.test.js`: remove pathRewrite assertions, update rewrite step test | S |

## Acceptance Criteria
- [ ] `grep -r '\.cursor/viepilot' skills/` returns 0 matches
- [ ] All 14 SKILL.md files contain `{envToolDir}` where the path was
- [ ] `lib/viepilot-install.cjs` uses `from: '{envToolDir}'` unconditionally
- [ ] `claude-code.cjs` has no `pathRewrite` field
- [ ] `cursor.cjs` has no `pathRewrite` field
- [ ] `npm test` green (no regression)
- [ ] FEAT-014 (antigravity) can be implemented after this without any `pathRewrite` needed

## Related
- FEAT-013 (adapter system — 2.0.0): introduced pathRewrite; this supersedes it
- FEAT-014 (Antigravity): benefits from clean adapter shape
- ENH-035 request: `.viepilot/requests/ENH-035.md`
