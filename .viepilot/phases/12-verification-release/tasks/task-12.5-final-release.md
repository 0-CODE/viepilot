# Task 12.5: Final release — CHANGELOG 2.2.0 + git tags

## Meta
- **Phase**: 12-verification-release
- **Status**: done

## Objective

Cut **CHANGELOG [2.2.0]** from current `[Unreleased]` (Phase 12 work). **`package.json`** already **2.2.0** — no version file bump. Git tags: **`viepilot-vp-p12-complete`**, **`viepilot-vp-v2.2.0`** (ROADMAP originally said v2.1.0 tag; superseded by shipped semver **2.2.0**). Update **`.viepilot/ROADMAP.md`** Phase 12 rows/verification to match.

## Paths

```yaml
files_to_modify:
  - "CHANGELOG.md"
  - ".viepilot/ROADMAP.md"
files_to_create:
  - ".viepilot/phases/12-verification-release/SUMMARY.md"
```

## Verification

`npx jest`; `git tag -l 'viepilot-vp-*' | tail -5`; push tags.
