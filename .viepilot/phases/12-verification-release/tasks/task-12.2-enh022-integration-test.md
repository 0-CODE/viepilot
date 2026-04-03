# Task 12.2: Integration test — ENH-022 entity manifest + dependency validation

## Meta
- **Phase**: 12-verification-release
- **Status**: done
- **Complexity**: S
- **Dependencies**: Phase 08 (ENH-022 in `workflows/crystallize.md`)

## Objective

Automate verification that ENH-022 rules stay enforceable: parse `## Domain Entity Manifest` from SPEC-style markdown, scan task text for Step 11A dependency patterns, and flag gaps when `needs_crud_api = yes` + `MISSING` service phase + task references entity.

## Pre-execution documentation gate (doc-first; BUG-001)

- [x] Paths + File-Level Plan are concrete below
- [x] PHASE-STATE.md marks 12.2 `in_progress` before first implementation commit

## Paths

```yaml
files_to_create:
  - "lib/crystallize-dependency-validate.cjs"
  - "tests/fixtures/enh022-gap/.viepilot/SPEC.md"
  - "tests/fixtures/enh022-gap/.viepilot/ROADMAP.md"
  - "tests/fixtures/enh022-ok/.viepilot/SPEC.md"
  - "tests/fixtures/enh022-ok/.viepilot/ROADMAP.md"
  - "tests/integration/enh022-entity-dependency.test.js"
files_to_modify:
  - "CHANGELOG.md"
```

## File-Level Plan

- **`lib/crystallize-dependency-validate.cjs`**: Export `parseDomainEntityManifest(md)`, `findEntityDependencyGaps(manifestRows, scanText)` implementing Step 11A pattern list (resolve/create/update/delete/manage/lookup/enrich/fetch + `{entity}Service` / `{entity}Repository`). Case-insensitive entity token matching. Gap when `needs_crud_api === 'yes'` and service column/status indicates MISSING and at least one pattern matches.
- **Fixtures**: Minimal `.viepilot` samples — `gap` has Invoice MISSING + task "Resolve invoice"; `ok` has Invoice tied to Phase + same task (no gap).
- **`tests/integration/enh022-entity-dependency.test.js`**: Load fixtures via library, assert gap count; assert ok fixture has no gaps; contract greps on `workflows/crystallize.md` for Step 6A / 11A.
- **`CHANGELOG.md`**: [Unreleased] note for Phase 12.2.

## Verification

```bash
npx jest tests/integration/enh022-entity-dependency.test.js
npx jest
```

## Implementation Notes

- Table parsing: skip markdown separator rows; require 5+ pipe cells for manifest rows.
