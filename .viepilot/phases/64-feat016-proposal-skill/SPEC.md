# Phase 64 — SPEC: vp-proposal skill + workflow (FEAT-016)

## Goal
Create `skills/vp-proposal/SKILL.md` and `workflows/proposal.md`. Define context detection logic (auto-load latest brainstorm session), all 4 proposal types, flags, and the full generation flow.

## Version target
**2.5.0**

## Dependencies
- Phase 63 ✅ (core infrastructure)

---

## Tasks

### Task 64.1 — `skills/vp-proposal/SKILL.md`
**Objective:** Full skill definition following ViePilot SKILL.md conventions.

## Paths
- `skills/vp-proposal/SKILL.md`

**File-Level Plan:**

Key sections:
- `objective`: Generate professional proposal package (.pptx + .docx + .md) from brainstorm session or direct brief
- `context` flags:
  - `--type <id>` — proposal type (project-proposal | tech-architecture | product-pitch | general); default: guided selection
  - `--from <session-file>` — explicit brainstorm session file; default: auto-detect latest
  - `--slides` — upload to Google Slides after generating (requires service account)
  - `--dry-run` — show slide manifest without writing files
- `process`: 7-step process (context load → type select → AI manifest → template resolve → pptxgenjs → docx → optional slides upload)
- `execution_context`: `workflows/proposal.md`
- `success_criteria`: output files present, slide count matches type, template resolution correct

**Verification:** `grep -c "success_criteria" skills/vp-proposal/SKILL.md` returns ≥ 1.

---

### Task 64.2 — `workflows/proposal.md`
**Objective:** Full step-by-step workflow with context detection, AI slide manifest generation, file writing, and Google Slides upload.

## Paths
- `workflows/proposal.md`

**File-Level Plan:**

```
## Step 1: Context Detection
  - Scan docs/brainstorm/ for session-*.md → sort desc → load latest
  - If --from specified: load that file directly
  - If no session found: prompt user for project brief (name, description, audience, key points)

## Step 2: Proposal Type Selection
  - If --type provided: validate against PROPOSAL_TYPES
  - Else: present menu (4 types with descriptions)
  - Output: typeId, slideCount, label

## Step 3: AI Slide Manifest Generation
  - From context (brainstorm notes or brief), generate JSON manifest:
    { title, subtitle, sections: [{ heading, bullets, speakerNotes }] }
  - Slide count must match typeId.slides
  - Cover slide + section slides + CTA/closing slide

## Step 4: Template Resolution
  - Call resolveTemplate(typeId, 'pptx', projectRoot) → templatePath
  - Call resolveTemplate('project-detail', 'docx', projectRoot) → docxTemplatePath
  - Warn if stock fallback used (not error)

## Step 5: Generate .pptx
  - Load template via pptxgenjs
  - Apply slide manifest: inject titles, bullets, speaker notes per slide
  - Save to docs/proposals/{slug}-{date}.pptx

## Step 6: Generate .docx
  - Build detailed document from same manifest + extended content
  - Sections: executive summary, problem/solution, features/specs, timeline, team, appendix
  - Save to docs/proposals/{slug}-{date}.docx

## Step 7: Generate .md summary
  - Write docs/proposals/{slug}-{date}.md (Markdown mirror of slide manifest)
  - If --slides: call google-slides-exporter → write URL to {slug}-{date}-slides.txt

## Step 8: Confirm output
  - List all generated files with sizes
  - Show next actions (share .pptx, upload manually, /vp-proposal --slides)
```

**Verification:** `wc -l workflows/proposal.md` > 80 lines.

---

### Task 64.3 — PHASE-STATE.md
**Objective:** Initialize phase state tracking.

## Paths
- `.viepilot/phases/64-feat016-proposal-skill/PHASE-STATE.md`

**File-Level Plan:** Standard PHASE-STATE template with tasks 64.1–64.3 set to `pending`.

---

## Phase Verification
```bash
grep "execution_context" skills/vp-proposal/SKILL.md
grep "Step 1" workflows/proposal.md
```
