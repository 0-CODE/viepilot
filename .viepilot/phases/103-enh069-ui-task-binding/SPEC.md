# Phase 103 SPEC — ENH-069: Crystallize UI→Task Binding

## Goal
Close the 10-gap chain where `crystallize` reads UI Direction artifacts (pages/*.html, notes.md sections) but never binds them to implementation tasks, allowing prototype pages to remain as stubs after all phases are complete.

## Scope
- `workflows/crystallize.md` — Gaps 1, 2, 5, 6, 7, 8, 9, 10
- `workflows/autonomous.md` — Gaps 3, 4
- `templates/phase/TASK.md` — Gap 3 (UI Prototype Reference field)

## Version Target
2.37.0 → **2.38.0**

## Tasks

| Task | Description | Gaps | Complexity |
|------|-------------|------|------------|
| 103.1 | crystallize Step 1A: UI Pages→Component Map + UX walkthrough log + Background ideas gate | 1, 9, 10 | L |
| 103.2 | crystallize Step 1D: arch_to_ui_sync noted + feature-map resolution + design staleness | 5, 7, 8 | M |
| 103.3 | crystallize Step 1F blocking + Step 7 ROADMAP cross-check | 6, 2 | M |
| 103.4 | autonomous.md + TASK.md template: UI Prototype Reference + phase UI coverage gate | 3, 4 | M |
| 103.5 | Tests (≥20) + CHANGELOG [2.38.0] + version bump | — | S |

## Dependencies
- ENH-064 ✅ (mandatory read gate reads pages/*.html — foundation for Gap 1)
- BUG-020 ✅ (scaffold-first gate — Phase 102)
- Phase 102 ✅

## Acceptance Criteria (all 10 gaps)
- [ ] Gap 1 — crystallize Step 1A emits `## UI Pages → Component Map` table
- [ ] Gap 2 — crystallize Step 7 cross-checks ROADMAP vs UI Pages → Component Map
- [ ] Gap 3 — TASK.md template + autonomous.md include `## UI Prototype Reference` field for frontend tasks
- [ ] Gap 4 — vp-auto phase completion gate warns on stub components referenced in UI Pages → Component Map
- [ ] Gap 5 — crystallize Step 1D: arch_to_ui_sync entries with `status: noted` → UI Pages → Component Map
- [ ] Gap 6 — crystallize Step 1F: coverage[] gaps blocking for features in phases_inventory
- [ ] Gap 7 — crystallize Step 1D: feature-map discrepancies require explicit resolution before Step 7
- [ ] Gap 8 — crystallize emits "design staleness" warning when arch decisions not reflected in pages/*.html
- [ ] Gap 9 — crystallize Step 1A: P0/P1 UX walkthrough pain items → UX-fix tasks in ROADMAP
- [ ] Gap 10 — crystallize Step 1A: Background extracted ideas surface resolution gate before Step 7
- [ ] Tests (≥20) all pass
- [ ] Re-run scenario: Home.vue task references landing.html; phase cannot PASS with stub
