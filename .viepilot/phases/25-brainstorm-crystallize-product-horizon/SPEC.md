# Phase 25 Specification — Product horizon: Brainstorm → Crystallize (ENH-014)

## Metadata
- **Phase**: 25
- **Milestone**: M1.21
- **Request**: ENH-014
- **Priority**: high
- **Status**: not_started

## Objective
Close the gap where brainstorm sessions capture MVP **and** post-MVP ideas, but crystallize artifacts bias executable MVP-only phases and omit deferred capabilities from `ROADMAP.md` and product narrative from `PROJECT-CONTEXT.md`, weakening autonomous execution context and north-star alignment.

## Scope
1. **Brainstorm workflow** (`workflows/brainstorm.md`): structured sections or mandatory prompts for `(MVP)` / `(Post-MVP)` / `(Future)` capability timeline.
2. **Crystallize workflow** (`workflows/crystallize.md`): Step 1 extracts horizon + extensibility constraints; Step 7 writes MVP phases **and** a dedicated Post-MVP / horizon section; validation gate when user confirms single-release-only.
3. **Templates** (`templates/project/ROADMAP.md`, `PROJECT-CONTEXT.md` if present): placeholders for horizon and phased product vision.
4. **Skills** (`skills/vp-brainstorm/SKILL.md`, `skills/vp-crystallize/SKILL.md`): mirror workflow; bump minor versions.
5. **Docs**: short user-facing note + `AI-GUIDE.md` template or generator notes for load order (vision before locking architecture).

## Out of Scope
- Automatic inference of horizon from unstructured prose without user confirmation.
- Changing npm installer or `/vp-auto` git gates.

## Success Criteria
- [ ] New brainstorm sessions have a clear, documented place for post-MVP content.
- [ ] Crystallize output always includes either a populated horizon section or an explicit “single-release / no deferred epics” statement.
- [ ] `PROJECT-CONTEXT` (or equivalent generated artifact) reflects phased scope consistent with brainstorm.
