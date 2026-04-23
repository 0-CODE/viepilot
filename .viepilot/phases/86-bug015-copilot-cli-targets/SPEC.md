# Phase 86 SPEC — BUG-015: Copilot adapter missing from CLI TARGETS

## Goal
Fix `bin/viepilot.cjs` so that the `copilot` adapter appears in `--list-targets` output and is accepted as a valid `--target` value. Also update the hardcoded help text to list copilot alongside the other adapters.

## Problem
Phase 84 (FEAT-019) added `lib/adapters/copilot.cjs` and registered it in `lib/adapters/index.cjs`, but did not update `bin/viepilot.cjs`:

1. `TARGETS` array (line ~20) — hardcoded list of `{ id, label }` objects; copilot never added
2. `printHelp()` string (line ~39) — `--target` description lists adapters explicitly; copilot not mentioned

Result: `viepilot --list-targets` omits copilot; `viepilot install --target copilot` fails.

## Version Target
2.22.0 → **2.22.1** (PATCH — bug fix only)

## Tasks

| ID | Title | Complexity |
|----|-------|------------|
| 86.1 | Fix `bin/viepilot.cjs` TARGETS + help text | S |
| 86.2 | Contract test + CHANGELOG + version 2.22.1 | S |

## Acceptance Criteria
- [ ] `viepilot --list-targets` includes `copilot` row
- [ ] `viepilot install --target copilot --dry-run` runs without error
- [ ] Help text `--target` description includes `copilot`
- [ ] Contract test verifies `--list-targets` copilot row
- [ ] package.json = "2.22.1"
- [ ] `npm test` all pass
