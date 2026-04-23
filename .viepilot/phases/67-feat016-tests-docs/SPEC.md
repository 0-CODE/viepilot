# Phase 67 — SPEC: vp-proposal tests + docs (FEAT-016)

## Goal
Jest contracts, full user guide, update skills-reference and README, CHANGELOG 2.5.0 entry, bump package.json version.

## Version target
**2.5.0**

## Dependencies
- Phases 63–66 ✅

---

## Tasks

### Task 67.1 — `tests/unit/vp-proposal-contracts.test.js`
**Objective:** Contract tests covering skill/workflow existence, proposal-generator exports, type definitions, and optional dep behavior.

## Paths
- `tests/unit/vp-proposal-contracts.test.js`

**File-Level Plan:**
```
describe('vp-proposal — skill + workflow files exist')
  test: skills/vp-proposal/SKILL.md exists
  test: workflows/proposal.md exists
  test: SKILL.md contains --type flag documentation
  test: SKILL.md contains --slides flag documentation
  test: workflow.md contains 'Step 1' and 'context detection' language

describe('vp-proposal — proposal-generator exports')
  test: resolveTemplate is a function
  test: detectBrainstormSession is a function
  test: validateType is a function
  test: PROPOSAL_TYPES has 4 entries
  test: project-proposal has 10 slides
  test: tech-architecture has 12 slides
  test: product-pitch has 12 slides
  test: general has 8 slides

describe('vp-proposal — stock templates exist')
  test: templates/proposal/pptx/project-proposal.pptx exists
  test: templates/proposal/pptx/tech-architecture.pptx exists
  test: templates/proposal/pptx/product-pitch.pptx exists
  test: templates/proposal/pptx/general.pptx exists
  test: templates/proposal/docx/project-detail.docx exists

describe('vp-proposal — google-slides-exporter graceful degradation')
  test: google-slides-exporter.cjs can be required
  test: uploadToSlides throws error mentioning @googleapis/slides when package absent
```

**Verification:** `npx jest tests/unit/vp-proposal-contracts.test.js --no-coverage` — all pass.

---

### Task 67.2 — `docs/user/features/proposal.md`
**Objective:** Complete user guide for `/vp-proposal`.

## Paths
- `docs/user/features/proposal.md`

**File-Level Plan:**
```markdown
# vp-proposal — Proposal Generator

## Overview
## Quick Start
## Proposal Types (table: type, slides, use case)
## Output Files (table: file, format, description)
## Template Override (.viepilot/proposal-templates/)
## Context Detection (brainstorm auto-load vs standalone)
## Flags (--type, --from, --slides, --dry-run)
## Google Slides Export (setup guide)
## Examples
```

---

### Task 67.3 — `docs/skills-reference.md` update
**Objective:** Add `/vp-proposal` section.

## Paths
- `docs/skills-reference.md`

**File-Level Plan:** Append section for vp-proposal: trigger words, flags, output, examples.

---

### Task 67.4 — README.md update
**Objective:** Update skills count 16→17; add vp-proposal row to Skills Reference table.

## Paths
- `README.md`

**File-Level Plan:**
- Badge: `skills-16-purple` → `skills-17-purple`
- Skills Reference table: add `| \`/vp-proposal\` | Generate .pptx + .docx proposal package | "proposal", "pitch" | Develop |`
- Project Structure: add `├── vp-proposal/` entry
- Completion Status: add proposal row

---

### Task 67.5 — CHANGELOG + version bump
**Objective:** Add `[2.5.0]` entry to CHANGELOG.md; bump package.json 2.4.0→2.5.0.

## Paths
- `CHANGELOG.md`
- `package.json`

**File-Level Plan:**
- `CHANGELOG.md`: add `## [2.5.0] - 2026-04-11` under `[Unreleased]` with Added section listing all FEAT-016 deliverables
- `package.json`: `"version": "2.5.0"`

**Verification:** `node -e "console.log(require('./package.json').version)"` prints `2.5.0`.

---

## Phase Verification
```bash
npx jest --no-coverage
# all suites pass; count ≥ 607 + new vp-proposal-contracts tests

grep "vp-proposal" README.md
node -e "console.log(require('./package.json').version)"
# 2.5.0
```
