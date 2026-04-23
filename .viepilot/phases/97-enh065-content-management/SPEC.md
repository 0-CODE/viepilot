# Phase 97 Spec — ENH-065: Brainstorm Topic 7 Content Management Coverage

## Goal
Add "Content Management" as Topic 7 to the brainstorm Topics Template, following the same pattern as ENH-063 (Admin & Governance). Includes proactive 🗂️ heuristic, content coverage gate, `content.html` Architect page, `notes.md ## content` YAML schema, crystallize export, and project template update.

## Request
- ENH-065: Brainstorm Topic 7 Content Management Coverage

## Target Version
2.33.0

## Tasks
| Task | Description | Complexity |
|------|-------------|------------|
| 97.1 | brainstorm side — Topic 7 + heuristic + content.html + YAML schema | M |
| 97.2 | crystallize side — content export + template + SKILL.md docs | S |
| 97.3 | Tests (≥10) + CHANGELOG [2.33.0] + version bump | S |

## Dependencies
- ENH-063 ✅ (Admin & Governance pattern)
- Phase 96 ✅

## Verification
- `grep -c "Content Management" workflows/brainstorm.md` ≥2
- `grep -c "content.html" workflows/brainstorm.md` ≥1
- `grep -c "Content Management" workflows/crystallize.md` ≥1
- `grep -c "## Content Management" templates/project/PROJECT-CONTEXT.md` ≥1
- `npm test` all pass
