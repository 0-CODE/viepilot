'use strict';
/**
 * ENH-041 — vp-proposal docx AI-native generation + UML/Mermaid diagrams
 * Tests: workflow Step 4b contract, getDiagramTypes helper, docx template sections
 */

const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

// ─────────────────────────────────────────────────────────────────────────────
// Group 1: Workflow Step 4b — generate_docx_content AI prompt contract
// ─────────────────────────────────────────────────────────────────────────────
describe('ENH-041 — workflow Step 4b: generate_docx_content', () => {
  let workflow;
  beforeAll(() => { workflow = read('workflows/proposal.md'); });

  test('Step 4b block exists in workflow', () => {
    expect(workflow).toMatch(/generate_docx_content|Step 4b/);
  });

  test('docxContent schema includes executiveSummary field', () => {
    expect(workflow).toContain('executiveSummary');
  });

  test('docxContent schema includes problemStatement field', () => {
    expect(workflow).toContain('problemStatement');
  });

  test('docxContent schema includes solutionNarrative field', () => {
    expect(workflow).toContain('solutionNarrative');
  });

  test('docxContent schema includes riskRegister field', () => {
    expect(workflow).toContain('riskRegister');
  });

  test('docxContent schema includes glossary field', () => {
    expect(workflow).toContain('glossary');
  });

  test('docxContent schema includes diagrams field', () => {
    expect(workflow).toContain('diagrams');
  });

  test('docxContent schema includes mermaidSource field', () => {
    expect(workflow).toContain('mermaidSource');
  });

  test('Step 7 references docxContent for narrative paragraphs', () => {
    // Step 7 section should reference docxContent as source
    const step7Match = workflow.match(/<step name="generate_docx">([\s\S]*?)<\/step>/);
    expect(step7Match).not.toBeNull();
    expect(step7Match[1]).toContain('docxContent');
  });

  test('Step 8 specifies Mermaid fenced code blocks for diagrams', () => {
    const step8Match = workflow.match(/<step name="generate_md">([\s\S]*?)<\/step>/);
    expect(step8Match).not.toBeNull();
    expect(step8Match[1]).toMatch(/mermaid|Mermaid/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Group 2: getDiagramTypes helper
// ─────────────────────────────────────────────────────────────────────────────
describe('ENH-041 — getDiagramTypes helper', () => {
  const { getDiagramTypes } = require('../../lib/proposal-generator.cjs');

  test('getDiagramTypes is exported', () => {
    expect(typeof getDiagramTypes).toBe('function');
  });

  test('project-proposal → [flowchart, gantt]', () => {
    expect(getDiagramTypes('project-proposal')).toEqual(['flowchart', 'gantt']);
  });

  test('tech-architecture → [flowchart, sequenceDiagram, classDiagram]', () => {
    expect(getDiagramTypes('tech-architecture')).toEqual(['flowchart', 'sequenceDiagram', 'classDiagram']);
  });

  test('product-pitch → [flowchart, sequenceDiagram]', () => {
    expect(getDiagramTypes('product-pitch')).toEqual(['flowchart', 'sequenceDiagram']);
  });

  test('general → [flowchart]', () => {
    expect(getDiagramTypes('general')).toEqual(['flowchart']);
  });

  test('unknown type falls back to [flowchart]', () => {
    expect(getDiagramTypes('unknown-type')).toEqual(['flowchart']);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Group 3: docx template Risk Register + Glossary sections
// ─────────────────────────────────────────────────────────────────────────────
describe('ENH-041 — gen-proposal-docx: riskRegisterTable + glossaryTable', () => {
  let script;
  beforeAll(() => { script = read('scripts/gen-proposal-docx.cjs'); });

  test('riskRegisterTable function is defined', () => {
    expect(script).toContain('function riskRegisterTable(');
  });

  test('glossaryTable function is defined', () => {
    expect(script).toContain('function glossaryTable(');
  });

  test('Risk Register section heading is in the document', () => {
    expect(script).toMatch(/Risk Register/);
  });

  test('Glossary section heading is in the document', () => {
    expect(script).toMatch(/Glossary/);
  });

  test('project-detail.docx template exists after regeneration', () => {
    expect(exists('templates/proposal/docx/project-detail.docx')).toBe(true);
  });

  test('project-detail.docx template is non-trivial (> 10 KB)', () => {
    const size = fs.statSync(path.join(ROOT, 'templates/proposal/docx/project-detail.docx')).size;
    expect(size).toBeGreaterThan(10 * 1024);
  });
});
