# Phase 90 — FEAT-020 Skill Registry Foundation

## Goal
Implement `vp-tools scan-skills` command + `~/.viepilot/skill-registry.json` schema + extended SKILL.md format spec + 15+ contract tests.

## Feature
**FEAT-020 Phase 1** — Skill Registry System

## Version Target
**2.26.0** (MINOR bump from 2.25.0)

## Tasks

| Task | File | Description | Complexity |
|------|------|-------------|------------|
| 90.1 | `lib/skill-registry.cjs` | Scanner: traverse all adapter skillsDirs, parse SKILL.md (extended + legacy), build registry JSON | M |
| 90.2 | `bin/viepilot.cjs` | Add `scan-skills` + `list-skills` subcommands to CLI | S |
| 90.3 | `docs/user/features/skill-registry.md` | Extended SKILL.md format spec + scanner behavior docs | S |
| 90.4 | `tests/unit/vp-skill-registry.test.js` + CHANGELOG + version bump | ≥15 contract tests; [2.26.0] in CHANGELOG; package.json = "2.26.0" | S |

## Dependencies
- Phase 59 ✅ (FEAT-014 antigravity — adapter pattern established)
- Phase 62 ✅ (FEAT-015 codex — all 5 adapters registered)
- `lib/adapters/index.cjs` → `listAdapters()` used by scanner

## Acceptance Criteria
- [ ] `lib/skill-registry.cjs` exports `scanSkills(home?)` and `loadRegistry()`
- [ ] `vp-tools scan-skills` outputs skill count + writes `~/.viepilot/skill-registry.json`
- [ ] `vp-tools list-skills` reads registry and displays table
- [ ] Extended SKILL.md format (Capabilities/Tags/Best Practices) documented
- [ ] Legacy SKILL.md (no extended sections) parsed without error
- [ ] `npm test` passes with ≥15 new tests green
