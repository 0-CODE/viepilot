# Phase 70 — SPEC: vp-proposal docx AI-native generation + UML diagrams (ENH-041)

## Goal
Make the `.docx` output an AI-native document — generated independently with deep content and UML/architecture diagrams (Mermaid in `.md`, table fallback in `.docx`) — not a slide-manifest expansion.

## Version target
**2.8.0** (MINOR — new AI generation pass + UML diagram support)

## Dependencies
- Phase 69 ✅ (ENH-040 — quality uplift base)

---

## Tasks

### Task 70.1 — `workflows/proposal.md`: Step 4b `generate_docx_content`
**Objective:** Insert a new `<step name="generate_docx_content">` between Step 4 (manifest) and Step 5 (template resolution). This step defines a dedicated AI prompt for deep docx content generation — independent of the slide manifest.

## Paths
- workflows/proposal.md

**File-Level Plan:**

Insert between `</step>` (end of manifest_generation) and `<step name="template_resolution">`:

```xml
<step name="generate_docx_content">
## Step 4b: AI Docx Content Generation (independent pass)

This is a SEPARATE AI call from slide manifest generation.
Input: brainstorm session + quality brief meta + proposal type + slide manifest (for context)
Output: `docxContent` JSON with per-section rich content + diagram specs

**Docx content AI prompt contract:**
---
You are generating the DETAILED DOCUMENT for a professional proposal.
This document is deeper, longer, and more technical than the slides.

CONTEXT:
- Proposal type: {typeId} — {label}
- Audience: {meta.decisionMaker}
- CTA: {meta.cta}
- Budget: {meta.budget}
- Timeline: {meta.timeline}
- Brainstorm session summary: {sessionSummary}
- Slide titles for reference: {slides.map(s => s.heading).join(', ')}
{langInstruction}

GENERATE a JSON object with:
{
  "executiveSummary": ["paragraph1", "paragraph2", "paragraph3"],
  "problemStatement": ["paragraph1", "paragraph2"],
  "solutionNarrative": ["paragraph1", "paragraph2"],
  "technicalNarrative": ["paragraph1"],
  "riskRegister": [
    { "risk": "...", "probability": "High|Med|Low", "impact": "High|Med|Low", "mitigation": "..." }
  ],
  "glossary": [
    { "term": "...", "definition": "..." }
  ],
  "diagrams": [
    {
      "type": "flowchart|sequenceDiagram|classDiagram|erDiagram|gantt",
      "title": "...",
      "mermaidSource": "flowchart TD\n  A[...] --> B[...]"
    }
  ]
}

CONTENT RULES:
- Each paragraph: 3–6 sentences, outcome-oriented, uses data from brainstorm
- riskRegister: 3–5 rows covering the most likely project risks
- glossary: 5–10 key terms the audience might not know
- diagrams: see getDiagramTypes() for which types to generate per proposal type
- Mermaid source must be syntactically valid Mermaid 10+ syntax
---

Store result as `docxContent` variable for use in Steps 7 and 8.

</step>
```

**Verification:**
```bash
grep -n "generate_docx_content\|Step 4b\|docxContent\|riskRegister" workflows/proposal.md
# should show 4+ matches
```

---

### Task 70.2 — `lib/proposal-generator.cjs`: `getDiagramTypes(typeId)`
**Objective:** Add exported helper that returns the list of Mermaid diagram types to generate for each proposal type.

## Paths
- lib/proposal-generator.cjs

**File-Level Plan:**

Add after `buildLangInstruction`:

```js
/**
 * Returns the Mermaid diagram types to generate for a given proposal type.
 * Used in Step 4b (generate_docx_content) to tell the AI which diagrams to include.
 *
 * @param {string} typeId - proposal type ID
 * @returns {string[]} array of Mermaid diagram type strings
 */
const DIAGRAM_TYPES_BY_PROPOSAL = {
  'project-proposal':  ['flowchart', 'gantt'],
  'tech-architecture': ['flowchart', 'sequenceDiagram', 'classDiagram'],
  'product-pitch':     ['flowchart', 'sequenceDiagram'],
  'general':           ['flowchart'],
};

function getDiagramTypes(typeId) {
  return DIAGRAM_TYPES_BY_PROPOSAL[typeId] || ['flowchart'];
}
```

Export in `module.exports`:
```js
module.exports = {
  PROPOSAL_TYPES,
  resolveTemplate,
  detectBrainstormSession,
  validateType,
  buildOutputPaths,
  buildLangInstruction,
  getDiagramTypes,    // ← new
};
```

**Verification:**
```bash
node -e "
const g = require('./lib/proposal-generator.cjs');
console.log(g.getDiagramTypes('project-proposal'));   // ['flowchart', 'gantt']
console.log(g.getDiagramTypes('tech-architecture'));  // ['flowchart', 'sequenceDiagram', 'classDiagram']
console.log(g.getDiagramTypes('unknown'));            // ['flowchart']
"
```

---

### Task 70.3 — `workflows/proposal.md`: Step 7 + Step 8 — Mermaid in .md, table fallback in .docx
**Objective:** Update `generate_docx` (Step 7) to use `docxContent` from Step 4b for narrative sections, embed diagrams as structured table descriptions, and add Risk Register + Glossary. Update `generate_md` (Step 8) to embed Mermaid fenced code blocks.

## Paths
- workflows/proposal.md

**File-Level Plan — Step 7 (generate_docx):**

Replace the current generate_docx step content with updated spec that:
1. Sources narrative paragraphs from `docxContent.executiveSummary`, `problemStatement`, `solutionNarrative`, `technicalNarrative`
2. For each diagram in `docxContent.diagrams`: add as structured description table:
   ```
   | Field   | Value                         |
   |---------|-------------------------------|
   | Type    | {diagram.type}                |
   | Title   | {diagram.title}               |
   | Summary | {AI-generated 2-sentence desc}|
   | See     | Refer to {slug}-{date}.md for full Mermaid diagram |
   ```
3. Add Risk Register section from `docxContent.riskRegister`:
   ```
   | Risk | Probability | Impact | Mitigation |
   ```
4. Add Glossary section from `docxContent.glossary`:
   ```
   | Term | Definition |
   ```

**File-Level Plan — Step 8 (generate_md):**

Add after manifest mirror: embed all diagrams from `docxContent.diagrams`:
```markdown
## Architecture Diagrams

### {diagram.title}

```{diagram.type}
{diagram.mermaidSource}
```
```

This makes the `.md` file renderable as a full technical document in GitHub / VS Code Preview.

**Verification:**
```bash
grep -n "docxContent\|riskRegister\|glossary\|Mermaid" workflows/proposal.md
# should show matches across Steps 4b, 7, 8
```

---

### Task 70.4 — `scripts/gen-proposal-docx.cjs`: Risk Register + Glossary sections
**Objective:** Add `riskRegisterTable()` and `glossaryTable()` helper functions + corresponding sections to the stock `.docx` template. Regenerate `project-detail.docx`.

## Paths
- scripts/gen-proposal-docx.cjs
- templates/proposal/docx/project-detail.docx

**File-Level Plan:**

Add two new table builders:

```js
// Risk Register table: Risk | Probability | Impact | Mitigation
function riskRegisterTable(rows) {
  // Header: Risk | Probability | Impact | Mitigation
  // rows: [['{{Risk description}}', 'High|Med|Low', 'High|Med|Low', '{{Mitigation strategy}}']]
}

// Glossary table: Term | Definition
function glossaryTable(rows) {
  // Header: Term | Definition
  // rows: [['{{Term}}', '{{Plain-language definition}}']]
}
```

Add sections to the document (after Section 9 — Next Steps, before Section 10 Appendix):

```
Section 9b — Risk Register
  riskRegisterTable([
    ['{{Risk 1 — e.g. Scope creep}}', 'Med', 'High', '{{Mitigation}}'],
    ['{{Risk 2 — e.g. Third-party API unavailable}}', 'Low', 'High', '{{Mitigation}}'],
    ['{{Risk 3 — e.g. Key personnel unavailable}}', 'Low', 'Med', '{{Mitigation}}'],
    ['{{Risk 4 — e.g. Budget overrun}}', 'Med', 'Med', '{{Mitigation}}'],
  ])

Section 9c — Glossary
  glossaryTable([
    ['{{Term 1}}', '{{Plain-language definition for non-technical audience}}'],
    ['{{Term 2}}', '{{Definition}}'],
    ['{{Term 3}}', '{{Definition}}'],
  ])
```

After implementation, regenerate:
```bash
node scripts/gen-proposal-docx.cjs
```

**Verification:**
```bash
node scripts/gen-proposal-docx.cjs
ls -lh templates/proposal/docx/
# project-detail.docx size > 12KB
```

---

### Task 70.5 — Tests + CHANGELOG 2.8.0
**Objective:** Tests for `getDiagramTypes()`, workflow contracts for Step 4b, updated docx contracts; version bump.

## Paths
- tests/unit/vp-enh041-proposal-docx-ai.test.js
- tests/unit/vp-proposal-contracts.test.js
- CHANGELOG.md
- package.json

**File-Level Plan — `tests/unit/vp-enh041-proposal-docx-ai.test.js`:**
```
describe('proposal-generator — getDiagramTypes')
  test: returns array for project-proposal (includes flowchart + gantt)
  test: returns array for tech-architecture (includes flowchart + sequenceDiagram + classDiagram)
  test: returns array for product-pitch
  test: returns array for general (includes flowchart)
  test: unknown typeId returns ['flowchart'] (graceful fallback)
  test: getDiagramTypes is exported from proposal-generator.cjs

describe('workflows/proposal.md — Step 4b contracts')
  test: workflow.md contains generate_docx_content step
  test: workflow.md contains docxContent variable reference
  test: workflow.md contains riskRegister in docxContent schema
  test: workflow.md contains glossary in docxContent schema
  test: workflow.md contains diagrams array in docxContent schema
  test: workflow.md Step 8 references Mermaid diagram embedding

describe('scripts/gen-proposal-docx.cjs — Risk Register + Glossary')
  test: script defines riskRegisterTable function
  test: script defines glossaryTable function
  test: script contains 'Risk Register' section heading
  test: script contains 'Glossary' section heading
  test: project-detail.docx exists and size > 12KB
```

**File-Level Plan — `tests/unit/vp-proposal-contracts.test.js`:**
- Add 2 tests to Group 1:
  - `workflow.md contains Step 4b / generate_docx_content`
  - `workflow.md embeds Mermaid diagrams in .md step`

**File-Level Plan — version:**
- `package.json`: `2.7.0` → `2.8.0`
- `CHANGELOG.md`: add `[2.8.0]` entry

**Verification:**
```bash
npx jest tests/unit/vp-enh041-proposal-docx-ai.test.js --no-coverage
# all pass

node -e "const g = require('./lib/proposal-generator.cjs'); console.log(typeof g.getDiagramTypes)"
# 'function'

npx jest --no-coverage
# all suites pass
node -e "console.log(require('./package.json').version)"
# 2.8.0
```

---

## Phase Verification
```bash
grep -n "generate_docx_content\|docxContent\|riskRegister\|getDiagramTypes" workflows/proposal.md lib/proposal-generator.cjs
node scripts/gen-proposal-docx.cjs && ls templates/proposal/docx/
npx jest --no-coverage
node -e "console.log(require('./package.json').version)"  # 2.8.0
```
