# Phase 175 Spec — BUG-034: Installer installs runtime dependencies in the installed copy

## Goal
After copying files, `viepilot install` installs production dependencies inside every installed ViePilot
directory (e.g. `~/.claude/viepilot`), so features that need runtime packages (pptxgenjs, docx, jszip, three, …)
work on a fresh machine and stay in sync with `package-lock.json`.

## Request
- `.viepilot/requests/BUG-034.md`

## Design decisions
- Copy `package-lock.json` next to the installed `package.json`; run `npm ci --omit=dev --no-audit --no-fund`
  when the lock file is present, otherwise `npm install --omit=dev --no-audit --no-fund`.
- New plan step kind `deps_install` (one per installed dir, after the file copies) — visible in `--dry-run`.
- `--skip-deps` flag (and env `VIEPILOT_SKIP_DEPS=1`) for offline installs; the plan shows a `note` instead.
- Failure is a warning, never a failed install: print the manual command (`cd <dir> && npm ci --omit=dev`).
- The command runner is injectable (`applyInstallPlan(plan, { runCommand })`) so tests never touch the network.
- Symlinked dev installs (`symlinkSkills`) are unaffected; the step still runs for the copied viepilot dir.

## Constraints
- English only in docs/skills; resilient tests; temp HOME in tests; follow the ENH-125 tool policy.

## Target Version
3.22.1 (PATCH)

## Tasks
| Task | Description | Complexity |
|------|-------------|------------|
| 175.1 | Plan: copy `package-lock.json`, `deps_install` step per installed dir, `--skip-deps` / `VIEPILOT_SKIP_DEPS`; apply with injectable runner, `npm ci` vs `npm install`, warning on failure | M |
| 175.2 | Tests (stub runner, dry-run, skip, failure path) + docs (install guides) + CHANGELOG 3.22.1 + resolve BUG-034 | S |

## Verification
- [ ] `npm test` → full suite green
- [ ] `node bin/viepilot.cjs install --target claude-code --dry-run --yes` lists `deps_install`
- [ ] `node bin/vp-tools.cjs todo check --phase 175 --phase-complete` → exit 0
- [ ] version = 3.22.1
