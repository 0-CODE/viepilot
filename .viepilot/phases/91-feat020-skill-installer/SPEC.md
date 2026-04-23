# Phase 91 — FEAT-020 Third-party Skill Installation

## Goal
Implement `vp-tools install-skill <source>` (npm + GitHub URL + local path), `uninstall-skill`, `update-skill` subcommands. Auto-runs `scan-skills` after install/uninstall/update. Tests + v2.27.0.

## Feature
**FEAT-020 Phase 2** — Skill Registry System

## Version Target
**2.27.0** (MINOR bump from 2.26.0)

## Tasks

| Task | File | Description | Complexity |
|------|------|-------------|------------|
| 91.1 | `lib/skill-installer.cjs` | Multi-channel installer: npm + github + local; installs to all active adapter skillsDirs | M |
| 91.2 | `bin/viepilot.cjs` | Add `install-skill`, `uninstall-skill`, `update-skill` subcommands | S |
| 91.3 | `tests/unit/vp-skill-installer.test.js` + CHANGELOG + version bump | ≥12 contract tests; [2.27.0] in CHANGELOG; package.json = "2.27.0" | S |

## Dependencies
- Phase 90 ✅ (`lib/skill-registry.cjs` — `scanSkills()` called post-install)
- `lib/adapters/index.cjs` → `listAdapters()` used to resolve install targets

## Acceptance Criteria
- [ ] `vp-tools install-skill <npm-pkg>` installs to all active adapter skillsDirs
- [ ] `vp-tools install-skill github:org/repo` clones skill
- [ ] `vp-tools install-skill ./local-path` copies skill
- [ ] Post-install: `scanSkills()` auto-called → registry updated
- [ ] `vp-tools uninstall-skill <id>` removes from all adapter dirs + re-scans
- [ ] `vp-tools update-skill <id>` re-installs from original source + re-scans
- [ ] `npm test` passes with ≥12 new tests green
