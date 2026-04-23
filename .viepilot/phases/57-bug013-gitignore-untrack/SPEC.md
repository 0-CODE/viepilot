# Phase 57 SPEC — Untrack .viepilot/ + Gitignore-Aware Staging Guard (BUG-013)

## Goal
Fix the recurring issue where `.viepilot/` files are tracked by git despite being in `.gitignore`. This causes `git status --porcelain` to always show dirty state and `vp-auto` to repeatedly stage/push internal state files.

## Problem Summary
`.viepilot/` was committed before the `.gitignore` rule was added. Git never stops tracking already-tracked files just because they appear in `.gitignore`. Every vp-auto session:
1. Modifies `.viepilot/TRACKER.md`, `HANDOFF.json`, etc.
2. Those show as modified in `git status --porcelain`
3. vp-auto stages them with `git add .viepilot/...`
4. They get committed and pushed to the repo

## Target Version
`2.1.2` (PATCH — recurring bug fix; ships before Phase 55/BUG-011 which becomes 2.1.3)

## Ordering
- Phase 57 (BUG-013) → ships **2.1.2**
- Phase 55 (BUG-011) → executes after Phase 57 → ships **2.1.3**

## Tasks

| Task | Title | Complexity |
|------|-------|------------|
| 57.1 | `git rm -r --cached .viepilot/` — untrack all .viepilot files from git index | S |
| 57.2 | Add GITIGNORE-AWARE STAGING RULE to `workflows/autonomous.md` | S |
| 57.3 | Contract tests — BUG-013 rule assertions | S |

## Acceptance Criteria
- [ ] `git rm -r --cached .viepilot/` run; `.viepilot/` no longer in `git ls-files`
- [ ] Committed with message `chore: untrack .viepilot/ (gitignored internal state)`
- [ ] `autonomous.md` has `⛔ GITIGNORE-AWARE STAGING RULE (BUG-013)` block:
  - Never `git add` a file that `git check-ignore -q` reports as ignored
  - `.viepilot/` is always gitignored → never stage it
  - Git-persistence porcelain check ignores `??` lines (untracked-only is clean)
- [ ] 3+ contract tests verify rule text exists in `autonomous.md`
- [ ] `npm test` green (no regression)

## Related
- BUG-013 request: `.viepilot/requests/BUG-013.md`
- BUG-012 (path resolution rule — 2.1.1): companion guard in same section of autonomous.md
- Incident: every /vp-auto session since .viepilot/ was first committed
