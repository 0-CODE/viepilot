# Phase 107 Spec — ENH-072: vp-* Skill Invocation Version Update Check

## Goal
When any `vp-*` skill is invoked, check npm registry for a newer ViePilot version.
If one is available, display a non-blocking notice banner after the greeting banner.
The check is cached (24h TTL) so it never adds latency on every skill call.

## Version Target
`2.40.0` → **`2.41.0`** (MINOR — new feature)

## Tasks

| Task | File(s) | Description | Complexity |
|------|---------|-------------|------------|
| 107.1 | `lib/viepilot-update.cjs` | Add `checkLatestVersion()` + 24h cache in `~/.viepilot/update-cache.json` | M |
| 107.2 | `bin/vp-tools.cjs` | Add `check-update` subcommand (`--silent`, `--json`, `--force`) | M |
| 107.3 | All `skills/vp-*/SKILL.md` | Add `<version_check>` block after `<greeting>` in each skill | M |
| 107.4 | `tests/unit/`, `CHANGELOG.md`, `package.json` | ≥10 unit tests + CHANGELOG [2.41.0] + version bump | M |

## Acceptance Criteria
- [ ] `checkLatestVersion()` reads installed version, fetches npm registry, caches 24h in `~/.viepilot/update-cache.json`
- [ ] Cache TTL = 24h — fresh cache → no network call
- [ ] Network failure / timeout (>3s) → silent, return `{ upToDate: true }`
- [ ] `vp-tools check-update --silent` exits 0 when up-to-date, exits 1 + prints latest when update available
- [ ] `vp-tools check-update --json` prints `{ installed, latest, has_update }`
- [ ] `vp-tools check-update --force` bypasses 24h cache
- [ ] All `vp-*` SKILL.md files have `<version_check>` block after `<greeting>`
- [ ] Notice banner shown after greeting when update available
- [ ] Banner suppressed with `--no-update-check` flag
- [ ] Banner suppressed when `config.json update.check: false`
- [ ] Banner shown at most once per session (`update_check_done` guard)
- [ ] ≥10 unit tests covering cache logic, network failure, exit codes, banner text

## Dependencies
- ENH-056 ✅ (greeting banner with version)
- ENH-059 ✅ (AUQ preload)

## Affected Files
- `lib/viepilot-update.cjs` — extend with `checkLatestVersion()` + cache logic
- `bin/vp-tools.cjs` — add `check-update` subcommand
- `skills/vp-auto/SKILL.md`
- `skills/vp-brainstorm/SKILL.md`
- `skills/vp-request/SKILL.md`
- `skills/vp-evolve/SKILL.md`
- `skills/vp-audit/SKILL.md`
- `skills/vp-status/SKILL.md`
- `skills/vp-crystallize/SKILL.md`
- `skills/vp-docs/SKILL.md`
- `skills/vp-skills/SKILL.md`
- `skills/vp-proposal/SKILL.md`
- `skills/vp-update/SKILL.md`
- `skills/vp-debug/SKILL.md`
- `skills/vp-rollback/SKILL.md`
- `skills/vp-resume/SKILL.md`
- `skills/vp-pause/SKILL.md`
- `skills/vp-task/SKILL.md`
- `skills/vp-info/SKILL.md`
- `tests/unit/phase107-enh072-version-update-check.test.js`
- `CHANGELOG.md`
- `package.json`
