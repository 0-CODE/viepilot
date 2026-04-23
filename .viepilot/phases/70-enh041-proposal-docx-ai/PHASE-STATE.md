# Phase 70 — State

## Status: ✅ complete

## Tasks
| Task | Status | Notes |
|------|--------|-------|
| 70.1 | ✅ done | workflows/proposal.md — Step 4b generate_docx_content (AI prompt contract) |
| 70.2 | ✅ done | lib/proposal-generator.cjs — getDiagramTypes(typeId) helper |
| 70.3 | ✅ done | workflows/proposal.md — Step 7 docxContent usage + Step 8 Mermaid embed |
| 70.4 | ✅ done | scripts/gen-proposal-docx.cjs — riskRegisterTable + glossaryTable + regenerate |
| 70.5 | ✅ done | Tests (717/717) + CHANGELOG 2.8.0 |

## Blockers
None

## Decisions
- MINOR bump (2.7.0 → 2.8.0): new AI generation pass + diagram support
- Mermaid in .md (zero-dep) + table fallback in .docx — no binary render dependency
- getDiagramTypes() per proposal type: project-proposal=[flowchart,gantt], tech-architecture=[flowchart,sequence,class], product-pitch=[flowchart,sequence], general=[flowchart]
