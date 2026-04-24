# Phase 107 Summary — ENH-072: vp-* Skill Invocation Version Update Check

## Result: ✅ PASS → v2.41.0

## Deliverables

### 107.1 — `lib/viepilot-update.cjs`
- `checkLatestVersion(opts)` exported: reads installed version, checks 24h cache
  in `~/.viepilot/update-cache.json`, fetches `https://registry.npmjs.org/viepilot/latest`
  with 3s timeout; returns `{ upToDate, installed, latest }`
- Silent on all errors (network, timeout, parse, unreadable cache)
- `opts.force` — bypass cache; `opts.cacheFile` — testable cache path;
  `opts._fetchFn` — injectable fetch for unit tests

### 107.2 — `bin/vp-tools.cjs`
- `check-update` subcommand: `--silent` exits 1+stdout when update available;
  `--json` always exits 0 with JSON; `--force` bypasses cache
- Help entry + usage display updated

### 107.3 — All 18 `skills/vp-*/SKILL.md`
- `<version_check>` block inserted immediately after `</greeting>` in every skill
- Block: bash command, notice banner template, suppression rules
  (`--no-update-check`, `config.json update.check: false`, `update_check_done`)

### 107.4 — Tests + CHANGELOG + Version
- 16 unit tests in `tests/unit/phase107-enh072-version-update-check.test.js`
- Full suite: 1574 tests pass (0 failures)
- CHANGELOG [2.41.0] entry
- package.json: 2.40.0 → 2.41.0

## Verification
```
node -e "const u=require('./lib/viepilot-update.cjs'); console.log(typeof u.checkLatestVersion)"
# → function

node bin/vp-tools.cjs check-update --json
# → {"installed":"2.41.0","latest":"...","has_update":false}

grep -l "version_check" skills/vp-*/SKILL.md | wc -l
# → 18
```
