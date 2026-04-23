# Phase 65 — SPEC: vp-proposal stock templates (FEAT-016)

## Goal
Generate 4 dark navy/charcoal `.pptx` stock templates and 1 `.docx` stock template using the proposal-generator library. Commit templates to `templates/proposal/` and add to `package.json` files array so they ship with the npm package.

## Version target
**2.5.0**

## Dependencies
- Phase 63 ✅ (pptxgenjs + docx installed; proposal-generator.cjs exists)

---

## Design spec
- **Primary bg**: `#1a1f36` (deep navy)
- **Accent**: `#4f6ef7` (electric blue)
- **Text (light)**: `#e8ecf4`
- **Text (muted)**: `#8892b0`
- **Section divider**: `#2d3142` (charcoal)
- **Font**: Calibri / Arial fallback (pptxgenjs default)

---

## Tasks

### Task 65.1 — `scripts/gen-proposal-pptx.cjs`
**Objective:** Script that generates 4 stock .pptx templates via pptxgenjs using dark navy/charcoal palette.

## Paths
- `scripts/gen-proposal-pptx.cjs`

**File-Level Plan:**
- One function `generateTemplate(typeId, slideCount)` → creates a pptxgenjs Presentation with:
  - Slide Master: navy background, ViePilot logo placeholder (bottom-left text "ViePilot"), accent line
  - Slide 1 (Cover): title + subtitle placeholders, large centered layout
  - Slides 2–(n-1): section layout with heading + bullets content placeholder + speaker notes placeholder
  - Last slide (CTA): "Thank You / Next Steps" layout, contact placeholder
- Loop over all 4 types; write to `templates/proposal/pptx/{typeId}.pptx`

**Verification:** `node scripts/gen-proposal-pptx.cjs` exits 0; 4 files created.

---

### Task 65.2 — `scripts/gen-proposal-docx.cjs`
**Objective:** Script that generates 1 stock .docx template for project-detail using docx package.

## Paths
- `scripts/gen-proposal-docx.cjs`

**File-Level Plan:**
- Creates a `docx.Document` with:
  - Cover page: project name (H1), date, prepared by
  - Sections: Executive Summary, Problem & Solution, Features & Specifications, Technical Architecture, Timeline, Team, Appendix
  - Each section uses HeadingLevel.HEADING_1 + paragraph placeholders
  - Matching dark style: custom theme colors where docx permits
- Write to `templates/proposal/docx/project-detail.docx`

**Verification:** `node scripts/gen-proposal-docx.cjs` exits 0; file created and > 5KB.

---

### Task 65.3 — Run scripts + commit templates
**Objective:** Execute both scripts; verify output files; add to git.

## Paths
- `templates/proposal/pptx/project-proposal.pptx`
- `templates/proposal/pptx/tech-architecture.pptx`
- `templates/proposal/pptx/product-pitch.pptx`
- `templates/proposal/pptx/general.pptx`
- `templates/proposal/docx/project-detail.docx`

**File-Level Plan:** Run scripts; verify 5 files exist; `git add templates/proposal/`.

---

### Task 65.4 — `package.json` files array
**Objective:** Ensure stock templates ship in the npm package.

## Paths
- `package.json`

**File-Level Plan:** Add `"templates/proposal"` to the `"files"` array if not already present.

**Verification:** `npm pack --dry-run 2>&1 | grep "templates/proposal"` shows template files.

---

## Phase Verification
```bash
ls templates/proposal/pptx/   # 4 files
ls templates/proposal/docx/   # 1 file
npm pack --dry-run 2>&1 | grep "templates/proposal"
```
