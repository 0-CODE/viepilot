# Phase 52 State

## Status: planned

## Tasks
- [ ] 52.1 workflows/brainstorm.md — architect_delta_sync step
- [ ] 52.2 templates/architect/style.css — .arch-stale + .arch-gap-badge classes
- [ ] 52.3 templates/architect/architect-actions.js — markStale() + [data-arch-stale] injection
- [ ] 52.4 Jest contract tests for ENH-034 (12 tests)

## Blockers
_None_

## Notes
- Planned: 2026-04-08
- Version target: 1.19.0 (MINOR — new workflow capability)
- Prerequisite: ENH-033 (data-arch-id system) ✅ done (1.18.0)
- Prerequisite: BUG-010 (diagram card IDs) ✅ done (1.18.1)

- Core mechanism: new `architect_delta_sync` step in brainstorm.md that runs at end
  of UI session or on `/sync-arch` command. AI scans current session for architect
  keywords → maps to affected pages → updates HTML content → marks with data-updated
  → records delta in notes.md `## architect_sync` section.

- .arch-stale: amber/orange visual for items flagged as potentially outdated
  (gap detected in brainstorm, HTML not yet synced). Distinct from .updated (green).

- markStale(slug, id, reason): callable from workflow output or manually in browser
  console to flag an item before the full sync runs.
