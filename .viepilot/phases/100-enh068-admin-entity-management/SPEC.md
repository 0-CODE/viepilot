# Phase 100 Spec — ENH-068: Brainstorm Topic — Admin Entity Data Management (CRUD)

## Goal
Add "Admin Entity Management" as a new numbered topic to the brainstorm Topics Template.
This topic covers how admins manage core business entities in the DB via CRUD interfaces
(list views, create/edit forms, delete semantics, bulk ops, import/export, audit trail,
multi-tenant scoping). Follows the same pattern as ENH-063/065/066.

**Topic numbering after this phase:**
```
6. Admin & Governance         (ENH-063)
7. Admin Entity Management    (ENH-068) ← NEW
8. Content Management         (ENH-065) — renumbered from 7
9. User Data Management       (ENH-066) — renumbered from 8
10. Phase assignment          (ENH-030) — renumbered from 9
```

**ENH-031 language test** must be updated: add `entity` / `quản lý` keyword blockquote
exemption (same pattern as admin/article/profile).

## Request
- ENH-068: Brainstorm Topic — Admin Entity Data Management (CRUD)

## Target Version
2.36.0

## Tasks
| Task | Description | Complexity |
|------|-------------|------------|
| 100.1 | brainstorm side — Topic 7 Admin Entity Management + 🗄️ heuristic + entity-mgmt.html + YAML schema + renumber Content→8, User Data→9, Phase→10 | M |
| 100.2 | crystallize side — entity_mgmt export + template section + SKILL.md docs | S |
| 100.3 | Tests (≥10) + ENH-031 test exemption + CHANGELOG [2.36.0] + version bump | S |

## Dependencies
- ENH-063 ✅ (Admin & Governance pattern + cross-reference)
- ENH-027 ✅ (ERD page — coverage gate cross-references ERD presence)
- ENH-065 ✅ (Content Management — same pattern)
- ENH-066 ✅ (User Data Management — same pattern)
- Phase 99 ✅

## Verification
- `grep -c "Admin Entity Management" workflows/brainstorm.md` ≥2
- `grep -c "entity-mgmt.html" workflows/brainstorm.md` ≥1
- `grep -c "Admin Entity Management" workflows/crystallize.md` ≥1
- `grep -c "## Admin Entity Management" templates/project/PROJECT-CONTEXT.md` ≥1
- `grep "10\. \*\*Phase assignment" workflows/brainstorm.md` ← renumbered to 10
- `npm test` all pass
