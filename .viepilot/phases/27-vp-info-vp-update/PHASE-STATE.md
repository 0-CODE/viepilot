# Phase 27: vp-info + vp-update (FEAT-008)

## Overview
- **Started**: 2026-04-01
- **Status**: complete
- **Progress**: 5/5 tasks (100%)
- **Current Task**: —

## Task Status

| # | Task | Status | Started | Completed | Git Tag |
|---|------|--------|---------|-----------|---------|
| 27.1 | CLI `vp-tools info` + lib helpers | done | 2026-04-01 | 2026-04-01 | viepilot-vp-p27-t1-done |
| 27.2 | CLI `vp-tools update` | done | 2026-04-01 | 2026-04-01 | viepilot-vp-p27-t2-done |
| 27.3 | Skills `vp-info` + `vp-update` | done | 2026-04-01 | 2026-04-01 | viepilot-vp-p27-t3-done |
| 27.4 | Docs (skills-reference, cli-reference, quick-start, README) | done | 2026-04-01 | 2026-04-01 | viepilot-vp-p27-t4-done |
| 27.5 | Tests + FEAT-008 closure + version bump 1.6.0 | done | 2026-04-01 | 2026-04-01 | viepilot-vp-p27-t5-done |

## Notes
- Opened via `/vp-evolve --feature` after M1.22.
- **27.1 (2026-04-01):** `lib/viepilot-info.cjs`, `vp-tools info` / `--json`, unit tests; no `.viepilot/` required for `info`.
- **27.2 (2026-04-01):** `lib/viepilot-update.cjs`, `vp-tools update` (`--dry-run`, `--yes`, `--global`); non-interactive requires `--yes` unless dry-run.
- **27.3 (2026-04-01):** `skills/vp-info`, `skills/vp-update`; `docs/skills-reference.md` + README table; tags `viepilot-vp-p27-t3` / `viepilot-vp-p27-t3-done`.
- **27.4 (2026-04-01):** `docs/dev/cli-reference.md` (`info`/`update`), `docs/user/quick-start.md`, README CLI counts 18, `npm run readme:sync`, `docs/README.md`; tags `viepilot-vp-p27-t4` / `viepilot-vp-p27-t4-done`.
- **27.5 (2026-04-01):** `CHANGELOG` **[1.6.0]**, `package.json` 1.6.0, `npm run verify:release`, `v1.6.0`, `viepilot-vp-p27-complete`; `SUMMARY.md`; FEAT-008 **done**.
