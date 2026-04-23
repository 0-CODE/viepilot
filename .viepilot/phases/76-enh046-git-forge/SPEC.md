# Phase 76 — ENH-046: Git Forge Agnostic Remote URL Parsing

## Goal
Generalize `workflows/documentation.md` and `workflows/crystallize.md` so ViePilot works with any Git forge — GitHub, GitLab, Bitbucket, Azure DevOps, Gitea, or self-hosted. Currently `workflows/documentation.md` hardcodes a `github.com` regex and uses `GITHUB_OWNER`/`GITHUB_REPO` variable names.

## Version
2.12.0 → **2.13.0**

## Dependencies
Phase 75 ✅ (FEAT-018)

## Scope
Two files require changes:
1. `workflows/documentation.md` — URL parser + variable rename
2. `workflows/crystallize.md` — Step 0 "GitHub username?" label → forge-agnostic

Plus: SKILL.md update for `vp-docs` if it documents the variables, and tests.

## Tasks

### Task 76.1 — `workflows/documentation.md` forge-agnostic parser
**Objective**: Replace the GitHub-only URL extraction shell block with a multi-forge parser. Rename `GITHUB_OWNER`/`GITHUB_REPO` to `GIT_OWNER`/`GIT_REPO` everywhere in the file. Add `GIT_HOST` detection.

**Deliverables**:
- `workflows/documentation.md` — updated URL parsing block + variable renames

### Task 76.2 — Crystallize label + SKILL.md + tests + CHANGELOG
**Objective**: Fix `workflows/crystallize.md` Step 0 "GitHub username" label. Update `skills/vp-docs/SKILL.md` if it references the old variable names. Write ≥5 tests. Update CHANGELOG 2.13.0.

**Deliverables**:
- `workflows/crystallize.md` — Step 0 label fix
- `skills/vp-docs/SKILL.md` — if variable names referenced
- `tests/unit/vp-enh046-git-forge.test.js` — ≥5 tests
- `CHANGELOG.md` — 2.13.0 entry
- `package.json` — version 2.13.0

## Acceptance Criteria
- [ ] `workflows/documentation.md` URL parser handles: `https://github.com/o/r.git`, `git@github.com:o/r.git`, `https://gitlab.com/o/r.git`, `git@gitlab.com:o/r.git`, `https://bitbucket.org/o/r.git`, `https://dev.azure.com/org/project/_git/repo`, `https://gitea.host/o/r.git`
- [ ] Variables `GITHUB_OWNER`/`GITHUB_REPO` removed; replaced by `GIT_OWNER`/`GIT_REPO` + `GIT_HOST`
- [ ] No literal `github.com` in the URL-parsing shell block
- [ ] `workflows/crystallize.md` Step 0 label is forge-agnostic
- [ ] ≥5 passing tests covering URL pattern parsing
- [ ] CHANGELOG 2.13.0 entry present
- [ ] `package.json` version = 2.13.0
