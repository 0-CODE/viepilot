# Phase 22 Summary — project-prefixed git checkpoint tags + compatibility (BUG-002)

## Outcome
Phase completed. Checkpoint naming now supports deterministic project-scoped prefixes to avoid cross-project tag collisions while preserving legacy compatibility.

## Delivered
- Added shared helpers in `lib/cli-shared.cjs`:
  - `getProjectSlug`
  - `getCheckpointTagPrefix`
  - `isCheckpointTag`
- Added `vp-tools tag-prefix [--raw]` command in `bin/vp-tools.cjs`.
- Updated `vp-tools checkpoints` to list both legacy and project-scoped checkpoint tags.
- Updated workflow/docs/templates to reference project-scoped checkpoint naming.
- Added/extended unit tests for prefix generation and checkpoint tag compatibility.

## Verification
- `npm run lint:cli` ✅
- `npx jest tests/unit/validators.test.js --no-coverage` ✅
- `npx jest tests/unit/ --no-coverage` ✅
- `node bin/vp-tools.cjs tag-prefix --raw` → `viepilot-vp` ✅

## Notes
- Legacy tags (`vp-p...`, `vp-backup-...`) are still accepted to avoid breaking existing histories.
