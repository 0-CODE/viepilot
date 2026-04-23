# Phase 69 — SPEC: vp-proposal quality uplift (ENH-040)

## Goal
Comprehensive quality uplift across all 4 layers of `/vp-proposal`: workflow information gathering, AI content richness, `.pptx` visual variety, and `.docx` narrative depth.

## Version target
**2.7.0** (MINOR — UX + content + template change)

## Dependencies
- Phase 67 ✅ (FEAT-016 — vp-proposal base skill)
- Phase 68 ✅ (ENH-039 — --lang flag)

---

## Tasks

### Task 69.1 — Workflow + manifest: Step 2C quality brief + meta field
**Objective:** Add "Step 2C: Quality Brief" to `workflows/proposal.md` — even when a brainstorm session is loaded, ask 4 focused questions to sharpen output. Extend manifest schema with `meta` field. Update `lib/proposal-generator.cjs` with `meta` in output path / schema documentation.

## Paths
- workflows/proposal.md
- lib/proposal-generator.cjs

**File-Level Plan:**

`workflows/proposal.md` — after Step 2 (context_detection), insert new `<step name="quality_brief">`:

```xml
<step name="quality_brief">
## Step 2C: Quality Brief

Ask these 4 questions regardless of whether session was loaded:

1. **Decision / CTA**: What decision should this proposal drive?
   (e.g. "sign contract", "approve budget", "schedule demo")
2. **Budget range**: Approximate budget or investment level?
   (e.g. "$50K–$100K", "internal only — no budget discussion", skip if N/A)
3. **Timeline**: Key deadline or constraint?
   (e.g. "need to present by end of month", "no fixed deadline")
4. **Decision-maker**: Who is the primary audience?
   (e.g. "CTO + engineering team", "non-technical CEO", "procurement committee")

Store answers in manifest `meta`:
```json
{
  "meta": {
    "cta": "...",
    "budget": "...",
    "timeline": "...",
    "decisionMaker": "..."
  }
}
```

These drive sharper content in Step 4 (manifest_generation).
</step>
```

`lib/proposal-generator.cjs` — update JSDoc for `buildOutputPaths` to document that callers may pass a `meta` object. No runtime change needed (meta is manifest-level, not path-level). Add a JSDoc block comment explaining the manifest meta schema.

**Verification:**
```bash
grep -n "quality_brief\|Quality Brief\|Step 2C" workflows/proposal.md
# should show the new step
```

---

### Task 69.2 — AI content: richer manifest generation prompt
**Objective:** Rewrite the manifest_generation step in `workflows/proposal.md` to include a detailed prompt template that drives higher-quality AI output: word count targets, audience tone, outcome-oriented bullets, and richer speaker notes.

## Paths
- workflows/proposal.md

**File-Level Plan:**

In `<step name="manifest_generation">`, replace the generic "Generate a structured JSON manifest" instruction with a detailed prompt contract:

```
## AI Prompt Contract for Manifest Generation

System context to inject before asking AI for the manifest:
---
You are generating a slide manifest for a professional proposal.

AUDIENCE: {meta.decisionMaker or "business decision-maker"}
CTA: {meta.cta or "approve the proposal"}
TONE: {if audience contains "technical" → "precise and data-driven"; else → "clear and persuasive"}
LANG_INSTRUCTION: {langInstruction from buildLangInstruction(lang, langContentOnly)}

CONTENT RULES:
- Cover slide subtitle: one compelling sentence (not just a date)
- Every bullet point: 8–15 words, outcome-oriented, starts with action verb
- Speaker notes: 3–5 sentences — key talking point, transition to next slide, question to anticipate
- Closing slide: concrete CTA matching meta.cta — not generic "Thank you"
- Data slide: include at least one quantified metric (even if estimated)
- Do NOT use filler phrases: "In conclusion", "As you can see", "We believe"
---

Slide count MUST equal PROPOSAL_TYPES[typeId].slides.
```

**Verification:**
```bash
grep -n "outcome-oriented\|8–15 words\|Speaker notes.*3–5" workflows/proposal.md
# should match
```

---

### Task 69.3 — .pptx templates: 5 distinct slide layouts
**Objective:** Rebuild `scripts/gen-proposal-pptx.cjs` with 5 visually distinct layout functions. Regenerate all 4 stock `.pptx` files.

## Paths
- scripts/gen-proposal-pptx.cjs
- templates/proposal/pptx/project-proposal.pptx
- templates/proposal/pptx/tech-architecture.pptx
- templates/proposal/pptx/product-pitch.pptx
- templates/proposal/pptx/general.pptx

**File-Level Plan:**

Define 5 layout builders:

```js
// Layout: cover — large title, subtitle, accent full-width bar at bottom
function addCoverSlide(pptx, slide, { heading, body }) { ... }

// Layout: section — heading left-aligned, accent sidebar (left 8px strip), bullets
function addSectionSlide(pptx, slide, { heading, bullets }) { ... }

// Layout: two-column — heading top, left col + right col bullets
function addTwoColumnSlide(pptx, slide, { heading, leftBullets, rightBullets }) { ... }

// Layout: data — heading, 2–3 large metric callouts (number + label)
function addDataSlide(pptx, slide, { heading, metrics }) { ... }

// Layout: closing — full-bleed, large CTA text, contact info, accent color bg
function addClosingSlide(pptx, slide, { heading, cta, contact }) { ... }
```

Color palette (unchanged):
- Background: `#1a1f36` (dark navy)
- Accent: `#4f6ef7` (blue)
- Charcoal: `#2d3142`
- Text primary: `#ffffff`
- Text secondary: `#a0a8c0`

Each template uses the appropriate layout per slide type:
- `cover` → `addCoverSlide`
- content slides → `addSectionSlide` or `addDataSlide` based on slide index/type
- last slide → `addClosingSlide`

Footer (all non-cover slides): "ViePilot" left + page number right, 8px from bottom, text secondary color.

After implementation, regenerate templates:
```bash
node scripts/gen-proposal-pptx.cjs
```

**Verification:**
```bash
node scripts/gen-proposal-pptx.cjs
ls -lh templates/proposal/pptx/
# all 4 files present, size > 20KB each
```

---

### Task 69.4 — .docx quality: tables + narrative
**Objective:** Rebuild `scripts/gen-proposal-docx.cjs` with structured content — Timeline table, Budget table, narrative paragraphs. Update Step 7 in `workflows/proposal.md` with the new section spec. Regenerate stock `.docx`.

## Paths
- scripts/gen-proposal-docx.cjs
- templates/proposal/docx/project-detail.docx
- workflows/proposal.md

**File-Level Plan:**

`scripts/gen-proposal-docx.cjs` — rebuild sections:

```
Section 1 — Executive Summary
  2–3 paragraphs: Project purpose, key benefits, recommended action

Section 2 — Problem & Opportunity
  1–2 paragraphs: Context + pain points

Section 3 — Proposed Solution
  1–2 paragraphs + feature list (bullets)

Section 4 — Technical Approach (conditional: tech-architecture type)
  1 paragraph + architecture components table:
  | Component | Technology | Purpose |

Section 5 — Project Timeline
  Gantt-style table:
  | Phase | Milestone | Duration | Dependencies |
  | 1     | Discovery  | 2 weeks  | —            |

Section 6 — Investment Estimate
  Budget table:
  | Line Item | Estimate | Notes |
  | Development | $XX,000 | T&M or fixed |

Section 7 — Team & Expertise
  Table: | Role | Experience | Responsibility |

Section 8 — Why Us
  2–3 differentiator bullets

Section 9 — Next Steps
  Numbered action list

Section 10 — Appendix
  Raw brainstorm session notes (if available)
```

`workflows/proposal.md` — update `<step name="generate_docx">` to describe the new section structure and table specs.

After implementation, regenerate:
```bash
node scripts/gen-proposal-docx.cjs
```

**Verification:**
```bash
node scripts/gen-proposal-docx.cjs
ls -lh templates/proposal/docx/
# project-detail.docx present, size > 15KB
```

---

### Task 69.5 — Tests + CHANGELOG 2.7.0
**Objective:** Update contract tests to cover new workflow steps and quality rules; bump version; CHANGELOG entry.

## Paths
- tests/unit/vp-proposal-contracts.test.js
- tests/unit/vp-enh040-proposal-quality.test.js
- CHANGELOG.md
- package.json

**File-Level Plan — `tests/unit/vp-enh040-proposal-quality.test.js`:**
```
describe('vp-proposal quality uplift — workflow contracts')
  test: workflow.md contains Step 2C / quality_brief step
  test: workflow.md contains 'Quality Brief'
  test: workflow.md contains 'decisionMaker' or 'decision-maker'
  test: workflow.md contains 'outcome-oriented' bullet rule
  test: workflow.md contains '8–15 words' or '8-15 words' bullet word-count target
  test: workflow.md contains speaker notes 3-sentence rule
  test: workflow.md Step 7 (generate_docx) mentions Timeline table
  test: workflow.md Step 7 mentions Budget or Investment table

describe('vp-proposal quality uplift — pptx layout coverage')
  test: gen-proposal-pptx.cjs exists
  test: gen-proposal-pptx.cjs contains 'addCoverSlide' or 'cover'
  test: gen-proposal-pptx.cjs contains 'addClosingSlide' or 'closing'
  test: gen-proposal-pptx.cjs contains 'addSectionSlide' or 'section'
  test: all 4 pptx templates exist and size > 20KB

describe('vp-proposal quality uplift — docx structure')
  test: gen-proposal-docx.cjs exists
  test: gen-proposal-docx.cjs mentions 'Timeline' table
  test: gen-proposal-docx.cjs mentions 'Budget' or 'Investment'
  test: project-detail.docx exists and size > 15KB
```

**File-Level Plan — `tests/unit/vp-proposal-contracts.test.js`:**
- Add 2 contract tests to Group 1:
  - `workflow.md contains Step 2C quality brief`
  - `workflow.md specifies outcome-oriented bullet rules`

**File-Level Plan — version:**
- `package.json`: `2.6.0` → `2.7.0`
- `CHANGELOG.md`: add `[2.7.0]` entry under `[Unreleased]`

**Verification:**
```bash
npx jest tests/unit/vp-enh040-proposal-quality.test.js --no-coverage
# all pass

npx jest --no-coverage
# all suites pass
```

---

## Phase Verification
```bash
grep -n "quality_brief\|Step 2C" workflows/proposal.md   # Task 69.1
grep -n "outcome-oriented\|8–15 words" workflows/proposal.md  # Task 69.2
node scripts/gen-proposal-pptx.cjs && ls templates/proposal/pptx/  # Task 69.3
node scripts/gen-proposal-docx.cjs && ls templates/proposal/docx/  # Task 69.4
npx jest --no-coverage  # Task 69.5
node -e "console.log(require('./package.json').version)"  # 2.7.0
```
