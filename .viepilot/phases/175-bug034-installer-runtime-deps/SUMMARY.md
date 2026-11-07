# Phase 175 Summary — BUG-034 (v3.22.1)

## Delivered
- `lib/viepilot-install.cjs`: copies `package-lock.json`; `deps_install` step per installed ViePilot dir (`npm ci --omit=dev --no-audit --no-fund`, `npm install` without a lock); `--skip-deps` / `VIEPILOT_SKIP_DEPS=1` → note with the manual command; injectable `runCommand`; failures are warnings with the manual command, the install stays ok.
- `bin/viepilot.cjs`: `--skip-deps` flag and help text.
- `tests/setup-env.cjs` (jest `setupFiles`): tests never install npm packages.
- Docs: quick start, Claude Code setup, troubleshooting entry.

## Verification
- Full suite 3184 passed + 1 skipped; `install --dry-run` shows the lock copy and the exact `npm ci` command.

## Not verified here
- A real `npm ci` into `~/.claude/viepilot` was not run in this phase (needs network and touches the live install; it happens on the next real install).
