# Phase 24 Specification — Multi-page UI Direction + manifest for Crystallize (FEAT-007)

## Metadata
- **Phase**: 24
- **Milestone**: M1.20
- **Request**: FEAT-007
- **Priority**: high
- **Status**: complete

## Objective
Extend UI Direction mode so multi-page brainstorms produce **one HTML file per page**, maintain a **machine-readable page manifest** (and/or structured `notes.md` section), and require a **documentation hook** whenever pages are added or renamed — enabling `/vp-crystallize` to consume a reliable **site map** (page count, purpose, navigation) without missing screens.

## Scope
1. Artifact layout convention: shared CSS, optional `index.html` hub, `pages/*.html` per screen.
2. Manifest contract (`PAGES.md` JSON front-matter or `pages-manifest.json` — pick one in task 24.1).
3. Brainstorm workflow + `vp-brainstorm` skill: mandatory update to manifest/notes after page HTML changes.
4. Crystallize workflow + skill: read manifest + all page HTML when present; fallback to legacy single-file layout.
5. User docs (`docs/user/features/ui-direction.md`) + optional lightweight verification (grep/script).

## Out of Scope
- Production app routing implementation (target app code).
- Visual regression testing of HTML prototypes.

## Success Criteria
- [x] New sessions can use multi-page layout without breaking old single-`index.html` sessions.
- [x] Adding a page updates manifest/notes before session is considered “saved”.
- [x] Crystallize explicitly lists pages and maps them into architecture notes.
