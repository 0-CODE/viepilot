# Task 12.4: README.md sync

## Meta
- **Phase**: 12-verification-release
- **Status**: done

## Objective

Align README badges and metrics with `package.json`, current Jest totals, and refreshed LOC via `npm run readme:sync`.

## Paths

```yaml
files_to_modify:
  - "README.md"
  - "CHANGELOG.md"
```

## File-Level Plan

- Run `npm run readme:sync` (updates Total LOC when `cloc` available).
- Bump version badge to match `package.json` (`2.2.0`).
- Set tests badge and tables to **334** tests, **18** suites; completion + project tree lines consistent.
- Refresh completion banner to cite current package version + `CHANGELOG.md` (avoid stale v1.9.x-only line).
- CHANGELOG `[Unreleased]` note for README sync.

## Verification

`npx jest`; `npm run readme:sync` (no-op or LOC ok); manual skim README header + scale table.
