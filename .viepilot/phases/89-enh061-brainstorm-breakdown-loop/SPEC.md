# Phase 89 SPEC — ENH-061: vp-brainstorm Idea-to-Architecture Breakdown Loop

## Goal
Add a structured **breakdown loop** to `vp-brainstorm` so that ideas in `## Phases` are explicitly mapped to both Architect components and UI Direction screens — with a reverse Architect→UI sync, a pre-crystallize completeness gate, and documented recommended ordering.

## Problem
Currently the workflow has:
- `architect_delta_sync` (UI → Architect, ENH-034) — one direction only
- No Architect → UI reverse sync
- No feature → component/screen coverage matrix
- No pre-crystallize check that all Phase 1 features have coverage in both modes
- Breakdown ordering is implicit (keyword heuristics only)

## Changes

### `workflows/brainstorm.md`
1. **Feature → Coverage mapping step** (new step after scope locked, before /save):
   - After `## Phases` is confirmed, generate a `## Coverage` matrix in notes.md:
     `Feature | Architect page | UI screen`
   - Any feature with "not yet modeled" in both columns triggers a warning

2. **Architect → UI Direction reverse sync** (`arch_to_ui_sync`):
   - Symmetric to `architect_delta_sync` (ENH-034)
   - After architect workspace edits, scan for decisions that impact UI: async flows, error states, API contracts, data constraints
   - Prompt: "This architectural decision may affect UI screens: [...]. Update UI Direction?"

3. **Pre-crystallize completeness gate** (expand the existing pre-save gate):
   - Check coverage matrix: all Phase 1 features must have ≥1 coverage (architect OR UI)
   - Warn if any feature has NO coverage in both
   - Suggest `/sync-arch` or UI Direction activation if gaps found

4. **Recommended breakdown ordering** (new section, before Architect Design Mode):
   - Document the 8-step recommended flow:
     1. Free idea collection
     2. Scope lock + phase assignment
     3. Feature → Coverage mapping (new)
     4. Architect Design (fill workspace per matrix)
     5. Architect → UI sync (new)
     6. UI Direction (fill workspace per matrix + arch feedback)
     7. Completeness gate (new)
     8. /save → /vp-crystallize

### `skills/vp-brainstorm/SKILL.md`
- Add breakdown loop summary to capabilities list
- Reference coverage matrix, reverse sync, completeness gate

## Version Target
2.24.0 → **2.25.0** (MINOR)

## Tasks

| ID | Title | Complexity |
|----|-------|------------|
| 89.1 | Add recommended breakdown ordering + coverage mapping step to `workflows/brainstorm.md` | M |
| 89.2 | Add `arch_to_ui_sync` reverse sync step to `workflows/brainstorm.md` | M |
| 89.3 | Expand pre-save completeness gate with coverage matrix check | S |
| 89.4 | Update `skills/vp-brainstorm/SKILL.md` — breakdown loop docs | S |
| 89.5 | Contract tests + CHANGELOG + version 2.25.0 | S |

## Acceptance Criteria
- [ ] `workflows/brainstorm.md`: recommended breakdown ordering section present
- [ ] `workflows/brainstorm.md`: Feature → Coverage mapping step documented
- [ ] `workflows/brainstorm.md`: `arch_to_ui_sync` reverse sync step present
- [ ] `workflows/brainstorm.md`: pre-save completeness gate checks coverage matrix
- [ ] `skills/vp-brainstorm/SKILL.md`: breakdown loop documented
- [ ] Contract tests pass
- [ ] `npm test` all pass
- [ ] `package.json` = "2.25.0"
