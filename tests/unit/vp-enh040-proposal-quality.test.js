'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

function read(rel) { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function exists(rel) { return fs.existsSync(path.join(ROOT, rel)); }
function size(rel) { return fs.statSync(path.join(ROOT, rel)).size; }

// ─────────────────────────────────────────────────────────────────────────────
// Workflow contracts — quality brief + AI prompt
// ─────────────────────────────────────────────────────────────────────────────

describe('vp-proposal quality uplift — workflow contracts', () => {
  let workflow;
  beforeAll(() => { workflow = read('workflows/proposal.md'); });

  test('workflow.md contains Step 2C / quality_brief step', () => {
    expect(workflow).toMatch(/quality_brief|Step 2C/);
  });

  test('workflow.md contains "Quality Brief" heading', () => {
    expect(workflow).toContain('Quality Brief');
  });

  test('workflow.md contains decisionMaker field in meta', () => {
    expect(workflow).toMatch(/decisionMaker|decision-maker/i);
  });

  test('workflow.md contains "cta" field in quality brief', () => {
    expect(workflow).toMatch(/"cta"/);
  });

  test('workflow.md AI prompt contract specifies outcome-oriented bullets', () => {
    expect(workflow).toContain('outcome-oriented');
  });

  test('workflow.md AI prompt contract specifies 8–15 word bullet target', () => {
    expect(workflow).toMatch(/8.{1,3}15 words/);
  });

  test('workflow.md AI prompt contract specifies 3–5 sentence speaker notes', () => {
    expect(workflow).toMatch(/3.{1,3}5 sentences/);
  });

  test('workflow.md Step 7 (generate_docx) mentions Timeline table', () => {
    expect(workflow).toMatch(/Timeline.*table|Gantt/i);
  });

  test('workflow.md Step 7 mentions Budget or Investment table', () => {
    expect(workflow).toMatch(/Budget.*table|Investment.*table/i);
  });

  test('workflow.md Step 7 has column spec for Timeline (Phase | Milestone | Duration)', () => {
    expect(workflow).toMatch(/Phase.*Milestone.*Duration/i);
  });

  test('workflow.md Step 7 has column spec for Budget (Line Item | Estimate)', () => {
    expect(workflow).toMatch(/Line Item.*Estimate/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// .pptx layout coverage
// ─────────────────────────────────────────────────────────────────────────────

describe('vp-proposal quality uplift — pptx layout coverage', () => {
  let script;
  beforeAll(() => { script = read('scripts/gen-proposal-pptx.cjs'); });

  test('gen-proposal-pptx.cjs exists', () => {
    expect(exists('scripts/gen-proposal-pptx.cjs')).toBe(true);
  });

  test('gen-proposal-pptx.cjs defines addCoverSlide function', () => {
    expect(script).toMatch(/function addCoverSlide/);
  });

  test('gen-proposal-pptx.cjs defines addSectionSlide function', () => {
    expect(script).toMatch(/function addSectionSlide/);
  });

  test('gen-proposal-pptx.cjs defines addTwoColumnSlide function', () => {
    expect(script).toMatch(/function addTwoColumnSlide/);
  });

  test('gen-proposal-pptx.cjs defines addDataSlide function', () => {
    expect(script).toMatch(/function addDataSlide/);
  });

  test('gen-proposal-pptx.cjs defines addClosingSlide function', () => {
    expect(script).toMatch(/function addClosingSlide/);
  });

  test('project-proposal.pptx exists and size > 20KB', () => {
    expect(exists('templates/proposal/pptx/project-proposal.pptx')).toBe(true);
    expect(size('templates/proposal/pptx/project-proposal.pptx')).toBeGreaterThan(20 * 1024);
  });

  test('tech-architecture.pptx exists and size > 20KB', () => {
    expect(exists('templates/proposal/pptx/tech-architecture.pptx')).toBe(true);
    expect(size('templates/proposal/pptx/tech-architecture.pptx')).toBeGreaterThan(20 * 1024);
  });

  test('product-pitch.pptx exists and size > 20KB', () => {
    expect(exists('templates/proposal/pptx/product-pitch.pptx')).toBe(true);
    expect(size('templates/proposal/pptx/product-pitch.pptx')).toBeGreaterThan(20 * 1024);
  });

  test('general.pptx exists and size > 20KB', () => {
    expect(exists('templates/proposal/pptx/general.pptx')).toBe(true);
    expect(size('templates/proposal/pptx/general.pptx')).toBeGreaterThan(20 * 1024);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// .docx structure
// ─────────────────────────────────────────────────────────────────────────────

describe('vp-proposal quality uplift — docx structure', () => {
  let script;
  beforeAll(() => { script = read('scripts/gen-proposal-docx.cjs'); });

  test('gen-proposal-docx.cjs exists', () => {
    expect(exists('scripts/gen-proposal-docx.cjs')).toBe(true);
  });

  test('gen-proposal-docx.cjs defines timelineTable function', () => {
    expect(script).toMatch(/function timelineTable/);
  });

  test('gen-proposal-docx.cjs defines budgetTable function', () => {
    expect(script).toMatch(/function budgetTable/);
  });

  test('gen-proposal-docx.cjs Timeline table has Phase | Milestone | Duration columns', () => {
    expect(script).toContain("headerCell('Phase'");
    expect(script).toContain('Milestone');
    expect(script).toContain('Duration');
  });

  test('gen-proposal-docx.cjs Budget table has Line Item | Estimate | Notes columns', () => {
    expect(script).toContain("headerCell('Line Item'");
    expect(script).toContain('Estimate');
    expect(script).toContain('Notes');
  });

  test('gen-proposal-docx.cjs defines teamTable function', () => {
    expect(script).toMatch(/function teamTable/);
  });

  test('project-detail.docx exists and size > 10KB', () => {
    expect(exists('templates/proposal/docx/project-detail.docx')).toBe(true);
    expect(size('templates/proposal/docx/project-detail.docx')).toBeGreaterThan(10 * 1024);
  });
});
