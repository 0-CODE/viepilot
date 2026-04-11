'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

// ─────────────────────────────────────────────────────────────────────────────
// Group 1: Skill + workflow files
// ─────────────────────────────────────────────────────────────────────────────
describe('vp-proposal — skill + workflow files', () => {
  test('skills/vp-proposal/SKILL.md exists', () => {
    expect(exists('skills/vp-proposal/SKILL.md')).toBe(true);
  });

  test('workflows/proposal.md exists', () => {
    expect(exists('workflows/proposal.md')).toBe(true);
  });

  test('SKILL.md documents --type flag', () => {
    expect(read('skills/vp-proposal/SKILL.md')).toMatch(/--type/);
  });

  test('SKILL.md documents --slides flag', () => {
    expect(read('skills/vp-proposal/SKILL.md')).toMatch(/--slides/);
  });

  test('SKILL.md documents --dry-run flag', () => {
    expect(read('skills/vp-proposal/SKILL.md')).toMatch(/--dry-run/);
  });

  test('SKILL.md documents --lang flag', () => {
    expect(read('skills/vp-proposal/SKILL.md')).toMatch(/--lang/);
  });

  test('SKILL.md documents --lang-content-only flag', () => {
    expect(read('skills/vp-proposal/SKILL.md')).toContain('--lang-content-only');
  });

  test('workflow.md contains Step 2C quality brief', () => {
    expect(read('workflows/proposal.md')).toMatch(/quality_brief|Quality Brief|Step 2C/);
  });

  test('workflow.md specifies outcome-oriented bullet rules', () => {
    expect(read('workflows/proposal.md')).toContain('outcome-oriented');
  });

  test('workflow.md contains Step 1 context detection', () => {
    const content = read('workflows/proposal.md');
    expect(content).toMatch(/Step 1/);
    expect(content).toMatch(/[Cc]ontext [Dd]etection/);
  });

  test('workflow.md contains Step 4b generate_docx_content AI pass (ENH-041)', () => {
    expect(read('workflows/proposal.md')).toMatch(/generate_docx_content|Step 4b/);
  });

  test('workflow.md embeds Mermaid fenced blocks in Step 8 (ENH-041)', () => {
    expect(read('workflows/proposal.md')).toMatch(/mermaid|Mermaid/);
  });

  test('SKILL.md execution_context points to workflows/proposal.md', () => {
    expect(read('skills/vp-proposal/SKILL.md')).toMatch(/workflows\/proposal\.md/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Group 2: proposal-generator exports
// ─────────────────────────────────────────────────────────────────────────────
describe('vp-proposal — proposal-generator exports', () => {
  const gen = require('../../lib/proposal-generator.cjs');

  test('resolveTemplate is a function', () => {
    expect(typeof gen.resolveTemplate).toBe('function');
  });

  test('detectBrainstormSession is a function', () => {
    expect(typeof gen.detectBrainstormSession).toBe('function');
  });

  test('validateType is a function', () => {
    expect(typeof gen.validateType).toBe('function');
  });

  test('buildOutputPaths is a function', () => {
    expect(typeof gen.buildOutputPaths).toBe('function');
  });

  test('PROPOSAL_TYPES has exactly 4 entries', () => {
    expect(Object.keys(gen.PROPOSAL_TYPES)).toHaveLength(4);
  });

  test('project-proposal has 10 slides', () => {
    expect(gen.PROPOSAL_TYPES['project-proposal'].slides).toBe(10);
  });

  test('tech-architecture has 12 slides', () => {
    expect(gen.PROPOSAL_TYPES['tech-architecture'].slides).toBe(12);
  });

  test('product-pitch has 12 slides', () => {
    expect(gen.PROPOSAL_TYPES['product-pitch'].slides).toBe(12);
  });

  test('general has 8 slides', () => {
    expect(gen.PROPOSAL_TYPES['general'].slides).toBe(8);
  });

  test('getDiagramTypes is a function (ENH-041)', () => {
    expect(typeof gen.getDiagramTypes).toBe('function');
  });

  test('getDiagramTypes returns flowchart+gantt for project-proposal (ENH-041)', () => {
    expect(gen.getDiagramTypes('project-proposal')).toEqual(['flowchart', 'gantt']);
  });

  test('getDiagramTypes falls back to [flowchart] for unknown type (ENH-041)', () => {
    expect(gen.getDiagramTypes('unknown')).toEqual(['flowchart']);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Group 3: Stock templates exist
// ─────────────────────────────────────────────────────────────────────────────
describe('vp-proposal — stock templates exist', () => {
  test('templates/proposal/pptx/project-proposal.pptx exists', () => {
    expect(exists('templates/proposal/pptx/project-proposal.pptx')).toBe(true);
  });

  test('templates/proposal/pptx/tech-architecture.pptx exists', () => {
    expect(exists('templates/proposal/pptx/tech-architecture.pptx')).toBe(true);
  });

  test('templates/proposal/pptx/product-pitch.pptx exists', () => {
    expect(exists('templates/proposal/pptx/product-pitch.pptx')).toBe(true);
  });

  test('templates/proposal/pptx/general.pptx exists', () => {
    expect(exists('templates/proposal/pptx/general.pptx')).toBe(true);
  });

  test('templates/proposal/docx/project-detail.docx exists', () => {
    expect(exists('templates/proposal/docx/project-detail.docx')).toBe(true);
  });

  test('pptx templates are non-empty (> 5 KB)', () => {
    for (const type of ['project-proposal', 'tech-architecture', 'product-pitch', 'general']) {
      const size = fs.statSync(path.join(ROOT, `templates/proposal/pptx/${type}.pptx`)).size;
      expect(size).toBeGreaterThan(5 * 1024);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Group 4: Google Slides exporter graceful degradation
// ─────────────────────────────────────────────────────────────────────────────
describe('vp-proposal — google-slides-exporter graceful degradation', () => {
  test('google-slides-exporter.cjs can be required without error', () => {
    expect(() => require('../../lib/google-slides-exporter.cjs')).not.toThrow();
  });

  test('uploadToSlides is a function', () => {
    const { uploadToSlides } = require('../../lib/google-slides-exporter.cjs');
    expect(typeof uploadToSlides).toBe('function');
  });

  test('uploadToSlides rejects with helpful message when @googleapis/slides absent', async () => {
    const { uploadToSlides } = require('../../lib/google-slides-exporter.cjs');
    await expect(uploadToSlides('test.pptx', 'Test')).rejects.toThrow(/@googleapis/);
  });
});
