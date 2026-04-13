# Workflow: vp-proposal — Proposal Package Generation

**Skill:** `/vp-proposal`  
**Version:** 0.1.0  
**Output:** `docs/proposals/{slug}-{date}.pptx` + `.docx` + `.md` (+ optional `-slides.txt`)

<purpose>
Convert a brainstorm session (or direct brief) into a professional proposal package suitable
for client, partner, or investor presentations. Generates three synchronized files:
- .pptx — presentation (ViePilot branded, dark navy/charcoal, for direct delivery)
- .docx — detailed supporting document (full narrative, specs, appendix)
- .md  — Markdown source of truth (version-controlled, diff-friendly)
Supports 4 proposal types with configurable slide counts; optional Google Slides upload.
</purpose>

## Implementation routing guard (ENH-021)

This workflow generates **proposal output artifacts** (`docs/proposals/`) — not ViePilot framework
shipping code. Use `/vp-request` → `/vp-evolve` → `/vp-auto` for framework feature work.

<process>

<step name="initialize">
## Step 1: Initialize

```bash
Read lib/proposal-generator.cjs  → PROPOSAL_TYPES, resolveTemplate, detectBrainstormSession, buildLangInstruction
Read lib/viepilot-config.cjs      → getProposalLang, recordProposalLang
Read package.json                 → verify pptxgenjs + docx dependencies present
```

Read `~/.viepilot/config.json` → `proposal.recentLangs` via `getProposalLang()`.
If `--lang` flag provided: validate ISO 639-1 code; set `lang = flag value`.

Display startup banner:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► PROPOSAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

</step>

<step name="context_detection">
## Step 2: Context Detection

Priority order:
1. `--from <file>` flag → load specified session file
2. Auto-detect: scan `docs/brainstorm/` for `session-*.md` → sort descending → load latest
3. No session found → standalone brief mode (go to Step 2B)

### Step 2A: Load brainstorm session
```
Session loaded: docs/brainstorm/session-{date}.md
Topic: {topic from session}
Key decisions: {D1, D2, D3...}
```
Extract from session:
- Project name / topic
- Problem statement
- Key decisions and features
- Target audience (if stated)

### Step 2B: Standalone brief (no session)
Prompt user:
```
No brainstorm session found. Please provide a brief:

1. Project name?
2. One-line description?
3. Target audience? (client / partner / investor / internal)
4. 3–5 key points to cover?
5. Any specific requirements or constraints?
```

---

</step>

<step name="type_selection">
## Step 3: Proposal Type Selection

If `--type <id>` provided: validate against `PROPOSAL_TYPES`; confirm with user.

If not provided, present menu:
```
Select proposal type:

1. Project Proposal     (10 slides)
   Scope, timeline, budget — for client delivery

2. Technical Architecture  (12 slides)
   System design, components, tech stack — for technical partners

3. Product Pitch Deck   (12 slides)
   Problem/solution, market, traction — for investors/partners

4. General Proposal     ( 8 slides)
   Flexible structure for any audience
```

Output: `typeId` (string), `slideCount` (number), `label` (string)

---

</step>

<step name="language_selection">
## Step 3b: Language Selection

If `--lang` provided: skip prompt; use flag value directly.

If `--lang` not provided:
```
Language for this proposal?

  1. {recentLangs[0]} (most recently used)   ← only shown if recentLangs non-empty
  2. English (en)
  3. Vietnamese (vi)
  4. Other — enter ISO 639-1 code (e.g. ja, fr, zh, ko)
```
- `recent = getProposalLang()` from config
- Present numbered menu; save selected `lang`

Output: `lang` (ISO 639-1 string), `langContentOnly` (boolean from `--lang-content-only` flag)

---

</step>

<step name="quality_brief">
## Step 2C: Quality Brief

Ask these 4 questions regardless of whether a session was loaded:

```
To sharpen the proposal, please answer briefly:

1. Decision / CTA: What should this proposal make the audience do?
   (e.g. "sign the contract", "approve budget", "schedule a demo")

2. Budget range: Approximate investment level?
   (e.g. "$50K–$100K", "internal only", or skip with Enter)

3. Timeline: Key deadline or constraint?
   (e.g. "present end of month", "no fixed deadline")

4. Decision-maker: Who is the primary audience?
   (e.g. "non-technical CEO", "CTO + engineering team", "procurement committee")
```

Store answers in manifest `meta` object:
```json
{
  "meta": {
    "cta": "sign the contract",
    "budget": "$50K–$100K",
    "timeline": "present end of month",
    "decisionMaker": "non-technical CEO"
  }
}
```

These drive sharper content in Step 4 (manifest_generation): tone, word choice, CTA on closing slide.

---

</step>

<step name="manifest_generation">
## Step 4: AI Slide Manifest Generation

Build language instruction and prepend to prompt:
```js
const langInstruction = buildLangInstruction(lang, langContentOnly);
// Prepend langInstruction to the AI content generation prompt before the slide structure spec.
```

Generate a structured JSON manifest from the loaded context.

**Manifest schema:**
```json
{
  "title": "Project Name",
  "subtitle": "One compelling sentence — not just a date",
  "type": "project-proposal",
  "audience": "client|partner|investor|internal",
  "meta": {
    "cta": "sign the contract",
    "budget": "$50K–$100K",
    "timeline": "present end of month",
    "decisionMaker": "non-technical CEO"
  },
  "designConfig": {
    "colorPalette": "navy-electric",
    "layoutStyle": "modern-tech",
    "fontPair": "Calibri / Calibri Light"
  },
  "slides": [
    {
      "index": 1,
      "layout": "cover",
      "heading": "Title",
      "body": "Subtitle / prepared by / date",
      "speakerNotes": "Opening remarks"
    },
    {
      "index": 2,
      "layout": "section",
      "heading": "Section Title",
      "bullets": ["Point 1", "Point 2", "Point 3"],
      "speakerNotes": "Talking points for this slide"
    }
  ]
}
```

## AI Prompt Contract

Inject this system context before asking AI to generate the manifest:

```
You are generating a professional proposal slide manifest.

AUDIENCE: {meta.decisionMaker || "business decision-maker"}
CTA: {meta.cta || "approve the proposal"}
BUDGET CONTEXT: {meta.budget || "not specified"}
TIMELINE: {meta.timeline || "not specified"}
TONE: {if decisionMaker contains "technical" → "precise and data-driven"; else → "clear and persuasive"}
{langInstruction}

CONTENT RULES — apply to every slide:
- Cover subtitle: one compelling sentence that states the value proposition (NOT just a date)
- Every bullet point: 8–15 words, outcome-oriented, starts with an action verb
- Speaker notes: 3–5 sentences — (1) key talking point, (2) supporting evidence or example,
  (3) anticipated objection + response, (4) transition to next slide
- Closing slide: concrete CTA matching meta.cta — NOT "Thank you" alone
- Data/metrics slide: include at least one quantified metric (estimate is fine, label as such)
- AVOID filler phrases: "In conclusion", "As you can see", "We believe", "It is important to note"
- AVOID vague bullets: "Improved performance", "Better results", "Enhanced UX"
```

**Slide layout types:**
- `cover` — full-bleed title slide (index 1 always)
- `section` — heading + bullet list (main content slides)
- `two-column` — heading + two content columns (for comparisons)
- `data` — heading + key metric callouts
- `closing` — CTA block matching meta.cta (last slide always)

**Slide count rules (ENH-045 — dynamic):**
- Base skeleton per type defines the minimum set of slides (see structure below).
- AI may add extra slides when content warrants — there is **no hard maximum**.
- Content-aware split triggers:
  - `technicalNarrative` has > 4 paragraphs → split into 2 Technical Approach slides
  - `team` has > 4 members → split into 2 Team slides
  - `phases` / timeline has > 4 items → split into 2 Timeline slides
  - `riskRegister` has > 3 items → add a dedicated Risk slide
- Every generated manifest MUST include a `designConfig` field (see **Design Selection** below).

**Design Selection (ENH-045):**

The AI MUST choose a `designConfig` based on project context (sector, audience, tone) and include it in the manifest:

```json
"designConfig": {
  "colorPalette": "navy-electric | navy-gold | dark-vibrant",
  "layoutStyle":  "modern-tech | enterprise | creative",
  "fontPair":     "Calibri / Calibri Light | Georgia / Calibri | Calibri / Calibri"
}
```

Selection heuristic:
- **enterprise** → finance, banking, legal, compliance, government, corporate audience
- **creative** → startup, design agency, gaming, media, art, consumer product
- **modern-tech** → default; SaaS, developer tools, technical architecture, general tech

Add this block to the AI prompt immediately after the TONE line:

```
DESIGN SELECTION:
Choose one layoutStyle based on project context:
  enterprise  — if sector/audience is: finance, banking, legal, compliance, government, corporate
  creative    — if sector/audience is: startup, design, gaming, media, agency, consumer
  modern-tech — default for SaaS, dev tools, tech architecture, general
Include "designConfig": { "colorPalette": ..., "layoutStyle": ..., "fontPair": ... } in the manifest root.
```

**Slide structure by type:**

### project-proposal (10 slides)
1. Cover — project name, client name, date
2. Agenda — what we'll cover
3. Problem / Opportunity
4. Proposed Solution
5. Key Features & Deliverables
6. Technical Approach (high level)
7. Project Timeline
8. Team & Expertise
9. Investment / Budget Estimate
10. Next Steps & CTA

### tech-architecture (12 slides)
1. Cover
2. Executive Summary
3. Problem Statement
4. Architecture Overview (diagram description)
5. Component Breakdown
6. Data Flow
7. Tech Stack
8. Security & Compliance
9. Scalability & Performance
10. Integration Points
11. Implementation Roadmap
12. Next Steps & CTA

### product-pitch (12 slides)
1. Cover
2. The Problem
3. Our Solution
4. Market Opportunity
5. Product Demo / Screenshots
6. Business Model
7. Traction & Validation
8. Competitive Landscape
9. Team
10. Roadmap
11. Ask / Investment
12. Thank You & Contact

### general (8 slides)
1. Cover
2. Overview
3. Problem / Context
4. Solution / Proposal
5. Key Benefits
6. Approach & Timeline
7. About Us / Credentials
8. Next Steps & CTA

If `--dry-run`: print manifest as JSON and stop here.

---

</step>

<step name="generate_docx_content">
## Step 4b: AI Docx Content Generation (independent pass)

This is a **separate AI call** from the slide manifest generation.
- Input: brainstorm session + quality brief meta + proposal type + slide manifest (for context only)
- Output: `docxContent` JSON — per-section rich content + diagram specs
- This content is deeper and longer than slides; it is NOT derived from slide bullets

**Docx content AI prompt contract:**

```
You are generating the DETAILED DOCUMENT for a professional proposal.
This document is the deep technical and narrative companion to the slides.

CONTEXT:
- Proposal type: {typeId} — {label}
- Audience: {meta.decisionMaker}
- CTA: {meta.cta}
- Budget: {meta.budget}
- Timeline: {meta.timeline}
- Brainstorm session summary: {sessionSummary or "none"}
- Slide headings (for context only): {slides.map(s => s.heading).join(', ')}
{langInstruction}

DIAGRAM TYPES to generate: {getDiagramTypes(typeId)}
  project-proposal  → flowchart, gantt
  tech-architecture → flowchart, sequenceDiagram, classDiagram
  product-pitch     → flowchart, sequenceDiagram
  general           → flowchart

GENERATE a JSON object with this exact schema:
{
  "executiveSummary": ["paragraph1 (3–6 sentences)", "paragraph2", "paragraph3"],
  "problemStatement": ["paragraph1", "paragraph2"],
  "solutionNarrative": ["paragraph1", "paragraph2"],
  "technicalNarrative": ["paragraph1"],
  "riskRegister": [
    { "risk": "...", "probability": "High|Med|Low", "impact": "High|Med|Low", "mitigation": "..." }
  ],
  "glossary": [
    { "term": "...", "definition": "plain-language definition" }
  ],
  "diagrams": [
    {
      "type": "flowchart|sequenceDiagram|classDiagram|erDiagram|gantt",
      "title": "diagram title",
      "mermaidSource": "valid Mermaid 10+ source code"
    }
  ]
}

CONTENT RULES:
- Each paragraph: 3–6 sentences, outcome-oriented, uses data from brainstorm session
- riskRegister: 3–5 rows covering the most likely project risks
- glossary: 5–10 key terms the decision-maker may not know
- diagrams: generate one diagram per type in getDiagramTypes(typeId)
- Mermaid source MUST be syntactically valid Mermaid 10+ syntax
- flowchart uses `flowchart TD` (not `graph TD`)
- gantt must include `dateFormat YYYY-MM-DD` and at least 3 sections
- AVOID placeholder text — generate real content from the brainstorm session context
```

Store result as `docxContent` variable for use in Steps 7 and 8.

---

</step>


<step name="detect_visual_artifacts">
## Step 4c: Detect Visual Artifacts (MANDATORY visual pass when artifacts exist)

This step runs **after Step 4b** and **before template resolution**.

**ENH-044 enforcement rule:** When `detectVisualArtifacts()` returns non-empty results, `visualSlides[]` MUST be populated — silent skip is not allowed. If puppeteer is absent, use `addPlaceholderVisual()` and emit a WARNING.

1. Call `detectVisualArtifacts()` from `lib/proposal-generator.cjs`:
   ```js
   const { detectVisualArtifacts } = require('./lib/proposal-generator.cjs');
   const artifacts = detectVisualArtifacts(); // auto-detects latest .viepilot/ui-direction/ session
   ```

2. **If no artifacts found** (`artifacts.uiPages.length === 0 && artifacts.architectPages.length === 0`):
   - Set `visualSlides = []`
   - Log: `[visuals] No HTML artifacts found — skipping screenshot pass`
   - Continue to Step 5

3. **If artifacts are found** — `visualSlides[]` MUST be populated (never left empty):

   **3a. When puppeteer is available** (`isPuppeteerAvailable()` returns true):
   - Use `screenshotArtifact(htmlPath)` → `addImage()` for each mapped artifact
   - `visualSlides[]` entries use real screenshots

   **3b. When puppeteer is absent** (MANDATORY fallback):
   ```js
   const { warnMissingTool, isPuppeteerAvailable } = require('./lib/screenshot-artifact.cjs');
   if (!isPuppeteerAvailable()) {
     warnMissingTool('puppeteer', 'npm install puppeteer');
     // Use addPlaceholderVisual(slide, label) for each mapped artifact — do NOT skip
   }
   ```
   - Call `addPlaceholderVisual(slide, label)` for each entry that would have had a screenshot
   - `visualSlides[]` is still populated — placeholder entries count as valid visual slides
   - Do NOT leave `visualSlides[]` empty when artifacts exist

   **Produce `visualSlides[]`** by mapping slide topics to artifact files using AI judgment:

   **Artifact → slide mapping rules:**
   | Slide topic keywords | Artifact to use | artifactType |
   |----------------------|-----------------|--------------|
   | UI, interface, mockup, design, screens | `artifacts.uiPages[0]` (index.html) | `ui-overview` |
   | Specific UI page (login, dashboard…) | matching `artifacts.uiPages[N]` | `ui-page` |
   | Architecture, system design, components | `architecture.html` in architectPages | `architect-arch` |
   | Database, entities, ERD, data model | `erd.html` in architectPages | `architect-erd` |
   | Flow, sequence, interactions, API calls | `sequence-diagram.html` in architectPages | `architect-seq` |
   | Features, feature map | `feature-map.html` in architectPages | `architect-features` |
   | Users, roles, use cases, actors | `user-use-cases.html` in architectPages | `architect-usecases` |

4. `visualSlides[]` schema — one entry per slide that should receive a visual:
   ```json
   [
     {
       "slideIndex": 3,
       "artifactType": "ui-overview",
       "htmlPath": "/absolute/path/to/index.html",
       "label": "UI Prototype Overview"
     },
     {
       "slideIndex": 7,
       "artifactType": "architect-arch",
       "htmlPath": "/absolute/path/to/architecture.html",
       "label": "System Architecture"
     }
   ]
   ```
   - `slideIndex`: 0-based index in the slides array
   - Maximum **1 visual per slide**
   - **Only assign visuals to content slides** — do NOT assign to cover (slide 0), section dividers, or closing/CTA slides
   - Maximum 3–4 visual slides per proposal to avoid visual overload

5. Store as `visualSlides` variable for use in Step 6 (`generate_pptx`).

Progress: `[visuals] Found {N} artifact(s) → {M} slides will have screenshots`

---

</step>

<step name="template_resolution">
## Step 5: Template Resolution

```js
const pptxTemplate = resolveTemplate(typeId, 'pptx', projectRoot);
const docxTemplate = resolveTemplate('project-detail', 'docx', projectRoot);
```

- If project override found: `[override] Using .viepilot/proposal-templates/{type}.pptx`
- If stock fallback: `[stock] Using ViePilot template for {type}`
- If stock file missing (not yet generated): warn user and continue with programmatic fallback

Ensure output directory:
```bash
mkdir -p docs/proposals/
```

---

</step>

<step name="generate_pptx">
## Step 6: Generate .pptx

Using `pptxgenjs`:
1. Create new `pptxgen` instance
2. Define Slide Master from template (dark navy `#1a1f36` background, accent `#4f6ef7`)
3. For each slide in manifest:
   - Apply layout-appropriate template slide
   - Inject `heading`, `bullets` / `body`, `speakerNotes`
4. Write to `docs/proposals/{slug}-{date}.pptx`

Progress: `[pptx] Generating {N} slides...`

---

</step>

<step name="generate_docx">
## Step 7: Generate .docx

Using `docx` package, consuming **`docxContent`** (from Step 4b) for all narrative paragraphs:

1. Build `Document` with structured sections
2. **Cover page**: title (H1, large), subtitle, prepared-for, date
3. **Body sections** — sourced from `docxContent`:

   | Section | Source | Content |
   |---------|--------|---------|
   | Executive Summary | `docxContent.executiveSummary[]` | Paragraphs rendered as Word body text |
   | Problem & Opportunity | `docxContent.problemStatement[]` | Paragraphs rendered as Word body text |
   | Proposed Solution | `docxContent.solutionNarrative[]` | Paragraphs rendered as Word body text |
   | Technical Approach | `docxContent.technicalNarrative[]` | Paragraph(s); omit section if array is empty |
   | **Project Timeline** | slide manifest `meta` | **Gantt-style table: Phase \| Milestone \| Duration \| Dependencies** |
   | **Investment Estimate** | slide manifest `meta` | **Budget table: Line Item \| Estimate \| Notes** (use meta.budget as header context) |
   | Team & Expertise | slide manifest | Role \| Experience \| Responsibility table |
   | **Risk Register** | `docxContent.riskRegister[]` | **Risk \| Probability \| Impact \| Mitigation table** |
   | **Diagram Reference** | `docxContent.diagrams[]` | **Per diagram: render `mermaidSource` → PNG via `renderMermaidToPng()` → `ImageRun`; fallback: preformatted Mermaid source text when mmdc absent** |
   | Why Choose Us | slide manifest | 2–3 differentiator bullets |
   | Next Steps | slide manifest `meta.cta` | Numbered action list |
   | **Glossary** | `docxContent.glossary[]` | **Term \| Definition table** |
   | Appendix | session file | Full brainstorm session notes (if session loaded) |

4. Timeline table structure:
   ```
   | Phase | Milestone | Duration | Dependencies |
   |-------|-----------|----------|--------------|
   | 1     | Discovery | 2 weeks  | —            |
   | 2     | Design    | 3 weeks  | Phase 1      |
   ```

5. Budget table structure:
   ```
   | Line Item        | Estimate   | Notes              |
   |------------------|------------|--------------------|
   | Discovery & UX   | $X,000     | Fixed fee          |
   | Development      | $XX,000    | Time & materials   |
   | Testing & QA     | $X,000     | Included           |
   | Total            | $XX,000    | {meta.budget}      |
   ```

6. Risk Register table structure (from `docxContent.riskRegister[]`):
   ```
   | Risk | Probability | Impact | Mitigation |
   |------|-------------|--------|------------|
   | {r.risk} | {r.probability} | {r.impact} | {r.mitigation} |
   ```

7. Diagram Reference structure (one block per diagram in `docxContent.diagrams[]`):

   **MANDATORY (ENH-044):** This section MUST be added when `docxContent.diagrams.length > 0` — do not skip.

   - Heading: `{diagram.title} ({diagram.type})`
   - **If `isMmdcAvailable()`**: render `mermaidSource` → PNG via `renderMermaidToPng()` → embed as `ImageRun` in a Paragraph
   - **Fallback** (mmdc absent): emit WARNING + embed preformatted text:
     ```js
     const { warnMissingTool, isMmdcAvailable } = require('./lib/screenshot-artifact.cjs');
     if (!isMmdcAvailable()) {
       warnMissingTool('mmdc', 'npm install -g @mermaid-js/mermaid-cli');
       // Add monospace paragraph with preformatted mermaidSource text (NOT skip)
     }
     ```
   - Cleanup temp PNG immediately after embedding (`cleanupScreenshot()`)

8. Glossary table structure (from `docxContent.glossary[]`):
   ```
   | Term | Definition |
   |------|------------|
   | {g.term} | {g.definition} |
   ```

9. **Visual embedding** (ENH-043/ENH-044 — MANDATORY when artifacts exist):

   **MANDATORY (ENH-044):** When `detectVisualArtifacts()` returns non-empty, visual sections MUST be added to the document — do not skip silently. If puppeteer is absent, emit WARNING and add a placeholder text paragraph instead.

   **Mermaid diagram images** — for each `docxContent.diagrams[]` entry:
   ```js
   const { renderMermaidToPng, isMmdcAvailable, warnMissingTool, cleanupScreenshot } = require('./lib/screenshot-artifact.cjs');
   const tmpPng = path.join(os.tmpdir(), `vp-mmdc-${Date.now()}.png`);
   const rendered = renderMermaidToPng(diagram.mermaidSource, tmpPng);
   if (rendered) {
     const imgRun = imageRunFromPng(rendered);
     if (imgRun) children.push(new Paragraph({ children: [imgRun] }));
     cleanupScreenshot(rendered);
   }
   // Fallback: preformatted mermaid source text already added (step 7, always present)
   ```

   **UI prototype screenshot** — MANDATORY when `artifacts.uiPages.length > 0`:
   ```js
   const { screenshotArtifact, isPuppeteerAvailable, warnMissingTool, cleanupScreenshot } = require('./lib/screenshot-artifact.cjs');
   const artifacts = detectVisualArtifacts();
   if (artifacts.uiPages.length > 0) {
     if (isPuppeteerAvailable()) {
       const tmpPng = await screenshotArtifact(artifacts.uiPages[0]);
       if (tmpPng) {
         const imgRun = imageRunFromPng(tmpPng);
         if (imgRun) executiveSummaryChildren.unshift(
           new Paragraph({ children: [imgRun], spacing: { before: 120, after: 200 } })
         );
         cleanupScreenshot(tmpPng);
       }
     } else {
       warnMissingTool('puppeteer', 'npm install puppeteer');
       // Add placeholder paragraph — do NOT skip the section
       executiveSummaryChildren.unshift(
         new Paragraph({ text: '[UI Prototype screenshot — install puppeteer to embed]', style: 'Caption' })
       );
     }
   }
   ```

   **Architecture screenshot** — MANDATORY when `architecture.html` in `artifacts.architectPages`:
   ```js
   const archHtml = artifacts.architectPages.find(p => p.endsWith('architecture.html'));
   if (archHtml) {
     if (isPuppeteerAvailable()) {
       const tmpPng = await screenshotArtifact(archHtml);
       if (tmpPng) {
         const imgRun = imageRunFromPng(tmpPng);
         if (imgRun) techSectionChildren.push(
           new Paragraph({ children: [imgRun], spacing: { before: 200, after: 120 } })
         );
         cleanupScreenshot(tmpPng);
       }
     } else {
       // warnMissingTool already called above (once per run — not repeated per artifact)
       techSectionChildren.push(
         new Paragraph({ text: '[Architecture diagram screenshot — install puppeteer to embed]', style: 'Caption' })
       );
     }
   }
   ```

   Rule: `warnMissingTool()` is called **once per missing tool per generation run** — not per-diagram or per-artifact.

10. Write to `docs/proposals/{slug}-{date}.docx`

Progress: `[docx] Building detailed document...`

---

</step>

<step name="generate_md">
## Step 8: Generate .md Summary

Write a Markdown document combining the slide manifest and `docxContent` diagrams:

```markdown
# {title}

**Type:** {label}  
**Date:** {date}  
**Audience:** {audience}

---

## Slides

### Slide {N}: {heading}

{bullets as - list}

> Speaker notes: {speakerNotes}

---

## Diagrams

For each entry in `docxContent.diagrams[]`, emit a fenced Mermaid code block:

### {diagram.title}

```{diagram.type}
{diagram.mermaidSource}
```

_(repeat for each diagram)_
```

- Mermaid fences use the diagram type as the language identifier (e.g. ` ```flowchart `, ` ```sequenceDiagram `)
- Diagrams section is omitted if `docxContent.diagrams` is empty or unavailable

Write to `docs/proposals/{slug}-{date}.md`

---

</step>

<step name="google_slides_upload">
## Step 9: Optional Google Slides Upload (`--slides`)

```js
const { uploadToSlides } = require('../lib/google-slides-exporter.cjs');
try {
  const url = await uploadToSlides(pptxPath, title);
  fs.writeFileSync(slidesUrlPath, url);
  console.log(`[slides] ${url}`);
} catch (err) {
  console.warn(`[slides] Upload failed: ${err.message}`);
  // Files already written — non-fatal
}
```

Prerequisites (shown if auth fails):
- `npm install @googleapis/slides`
- Create service account → download JSON key
- `export GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json`

---

</step>

<step name="confirm_output">
## Step 10: Confirm Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VIEPILOT ► PROPOSAL GENERATED ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Type:    {label}  ({N} slides)
 Context: {session file or "direct brief"}

 Files:
   docs/proposals/{slug}-{date}.md    ({size})
   docs/proposals/{slug}-{date}.pptx  ({size})
   docs/proposals/{slug}-{date}.docx  ({size})
   [docs/proposals/{slug}-{date}-slides.txt]

 Next:
   Open .pptx in PowerPoint / Keynote / LibreOffice Impress
   Share .docx as supporting document
   /vp-proposal --slides   to upload to Google Slides
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Update MRU config:
```js
recordProposalLang(lang)  // → update ~/.viepilot/config.json proposal.recentLangs
```

---

## Error Handling

| Situation | Action |
|-----------|--------|
| Unknown `--type` | Show valid types list; ask user to select |
| `--from` file not found | Show path; ask to continue with auto-detect |
| Stock template missing (not yet generated) | Warn; use pptxgenjs programmatic fallback |
| `@googleapis/slides` not installed | Clear install instructions; continue without upload |
| `GOOGLE_APPLICATION_CREDENTIALS` not set | Clear setup guide; continue without upload |
| `docs/proposals/` write error | Show path and permission error; stop |

---

</step>

</process>

<success_criteria>
- [ ] Context loaded (brainstorm session or direct brief)
- [ ] Type validated; slide count ≥ base skeleton for type (dynamic — no hard maximum)
- [ ] Manifest generated with correct structure; `designConfig` field present
- [ ] `.pptx` written to `docs/proposals/`
- [ ] `.docx` written to `docs/proposals/`
- [ ] `.md` written to `docs/proposals/`
- [ ] Template resolution: project override takes precedence over stock
- [ ] `--slides`: Google Slides URL in `-slides.txt` or clear non-fatal error shown
- [ ] `--dry-run`: manifest printed to console; no files written
</success_criteria>
