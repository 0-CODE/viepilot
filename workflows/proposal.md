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
Read lib/proposal-generator.cjs  → PROPOSAL_TYPES, resolveTemplate, detectBrainstormSession
Read package.json                 → verify pptxgenjs + docx dependencies present
```

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

<step name="manifest_generation">
## Step 4: AI Slide Manifest Generation

Generate a structured JSON manifest from the loaded context.

**Manifest schema:**
```json
{
  "title": "Project Name",
  "subtitle": "Tagline or date",
  "type": "project-proposal",
  "audience": "client|partner|investor|internal",
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

**Slide layout types:**
- `cover` — full-bleed title slide (index 1 always)
- `section` — heading + bullet list (main content slides)
- `two-column` — heading + two content columns (for comparisons)
- `data` — heading + key metric callouts
- `closing` — thank you / next steps / contact (last slide always)

**Slide count rules:** `slides.length` MUST equal `PROPOSAL_TYPES[typeId].slides`

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

Using `docx` package:
1. Build `Document` with sections matching the proposal type
2. **Cover page**: title (H1), subtitle, prepared-for, date
3. **Body sections** (one per major slide group):
   - `HeadingLevel.HEADING_1` per section
   - Paragraph content expanded from slide bullets (2–4 sentences each)
   - Tables where relevant (timeline, budget estimate, tech stack)
4. **Appendix**: raw brainstorm notes (if session loaded)
5. Write to `docs/proposals/{slug}-{date}.docx`

Progress: `[docx] Building detailed document...`

---

</step>

<step name="generate_md">
## Step 8: Generate .md Summary

Write a Markdown mirror of the manifest:

```markdown
# {title}

**Type:** {label}  
**Date:** {date}  
**Audience:** {audience}

---

## Slide {N}: {heading}

{bullets as - list}

> Speaker notes: {speakerNotes}
```

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
- [ ] Type validated; slide count matches PROPOSAL_TYPES spec
- [ ] Manifest generated with correct structure and slide count
- [ ] `.pptx` written to `docs/proposals/`
- [ ] `.docx` written to `docs/proposals/`
- [ ] `.md` written to `docs/proposals/`
- [ ] Template resolution: project override takes precedence over stock
- [ ] `--slides`: Google Slides URL in `-slides.txt` or clear non-fatal error shown
- [ ] `--dry-run`: manifest printed to console; no files written
</success_criteria>
