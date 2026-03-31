# Phase 16 Specification — UI direction + component curation library (FEAT-002)

## Metadata
- **Phase**: 16
- **Milestone**: M1.13
- **Request**: FEAT-002
- **Priority**: high
- **Status**: planned

## Objective
Enable a UI-first pipeline where brainstorm sessions can produce live HTML direction artifacts and crystallize can consume those artifacts to regenerate design intent in the project tech stack, plus a reusable UI component curation workflow and storage.

## Scope
1. Brainstorm UI mode: create/update `.viepilot/ui-direction/{session-id}/` preview artifacts.
2. Crystallize integration: treat UI direction artifacts as mandatory input for frontend planning.
3. UI component curation workflow: ingest/classify 21st.dev references and store to global + local libraries.
4. Installation bootstrap: include baseline stock UI components in global/project setup.
5. Documentation for usage, curation conventions, and reuse flow.

## Out of scope
- Rendering production-grade full apps directly from brainstorm artifacts.
- Auto-converting all curated snippets to every framework automatically.

## Success Criteria
- [ ] UI brainstorm generates and updates direction artifacts.
- [ ] Crystallize references direction artifacts in output planning.
- [ ] Component curation storage works in both `~/.viepilot/ui-components/` and `.viepilot/ui-components/`.
- [ ] Install scripts provision baseline stock components.
- [ ] Documentation covers end-to-end process.
