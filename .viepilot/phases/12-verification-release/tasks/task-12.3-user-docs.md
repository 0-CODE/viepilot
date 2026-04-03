# Task 12.3: User docs — autonomous-mode, quick-start, advanced-usage

## Meta
- **Phase**: 12-verification-release
- **Status**: done
- **Complexity**: M

## Objective

Document BUG-007 working-directory guard, brainstorm artifact manifest (Phase 9), and diagram profile / stale-diagram behavior (Phase 11) in the three user-facing guides listed in ROADMAP Phase 12.

## Paths

```yaml
files_to_modify:
  - "docs/user/features/autonomous-mode.md"
  - "docs/user/quick-start.md"
  - "docs/advanced-usage.md"
  - "CHANGELOG.md"
```

## File-Level Plan

- **autonomous-mode.md**: New sections — (1) Project working directory guard (BUG-007): `{project_cwd}`, install paths read-only, pre-edit check, control point; optional `lib/project-write-guard.cjs` for CI/tooling. (2) Token budget sub-section (expand Phase 10 behavior beyond JSONL example). (3) Phase-complete stale diagram reconciliation (Phase 11) summary + pointer to `workflows/crystallize.md` / `workflows/autonomous.md`.
- **quick-start.md**: After brainstorm — manifest path + consumed-by-crystallize one paragraph; crystallize bullet list — manifest Step 0A, domain_entities/tech_stack artifacts.
- **advanced-usage.md**: New numbered sections — install path guard, artifact manifest lifecycle, diagram profiles & architecture folder map.

## Verification

Manual: headings present, links resolve. Optional: `grep -n 'BUG-007\\|brainstorm-manifest\\|diagram profile' docs/user/features/autonomous-mode.md docs/user/quick-start.md docs/advanced-usage.md`
