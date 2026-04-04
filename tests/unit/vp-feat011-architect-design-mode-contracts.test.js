'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

function exists(relPath) {
  return fs.existsSync(path.join(ROOT, relPath));
}

describe('FEAT-011 Architect Design Mode', () => {
  test('brainstorm.md: Architect Design Mode section exists with activation rules', () => {
    const content = read('workflows/brainstorm.md');
    expect(content).toMatch(/Architect Design Mode/);
    expect(content).toMatch(/--architect/);
    expect(content).toMatch(/auto-activate|Auto-activate/);
  });

  test('brainstorm.md: workspace layout documents all 8 artifact files', () => {
    const content = read('workflows/brainstorm.md');
    // 7 HTML files
    expect(content).toMatch(/index\.html/);
    expect(content).toMatch(/architecture\.html/);
    expect(content).toMatch(/data-flow\.html/);
    expect(content).toMatch(/decisions\.html/);
    expect(content).toMatch(/tech-stack\.html/);
    expect(content).toMatch(/tech-notes\.html/);
    expect(content).toMatch(/feature-map\.html/);
    // style.css and notes.md
    expect(content).toMatch(/style\.css/);
    expect(content).toMatch(/notes\.md/);
  });

  test('brainstorm.md: /review-arch command documented', () => {
    const content = read('workflows/brainstorm.md');
    expect(content).toMatch(/\/review-arch/);
  });

  test('brainstorm.md: auto-activate heuristic has ≥2 trigger conditions', () => {
    const content = read('workflows/brainstorm.md');
    // Component trigger
    expect(content).toMatch(/≥3 components|3 component/i);
    // Stack trigger
    expect(content).toMatch(/stack/i);
    // Prompt text
    expect(content).toMatch(/Architect Design Mode/);
  });

  test('crystallize.md: consume_architect_artifacts step exists between Step 1 sections and Step 2', () => {
    const content = read('workflows/crystallize.md');
    expect(content).toMatch(/consume_architect_artifacts/);
    expect(content).toMatch(/Step 1D/);
    // Must appear before Step 2
    const step1DPos = content.indexOf('consume_architect_artifacts');
    const step2Pos = content.indexOf('## Step 2:');
    expect(step1DPos).toBeLessThan(step2Pos);
  });

  test('crystallize.md: Step 1D imports decisions to ARCHITECTURE.md', () => {
    const content = read('workflows/crystallize.md');
    expect(content).toMatch(/decisions\[\]/);
    expect(content).toMatch(/ARCHITECTURE\.md/);
    expect(content).toMatch(/Architecture Decisions \(from Architect Mode\)/);
  });

  test('crystallize.md: Step 1D surfaces open_questions', () => {
    const content = read('workflows/crystallize.md');
    expect(content).toMatch(/open_questions/);
    expect(content).toMatch(/status.*open|open.*status/i);
  });

  test('templates/architect/: all 7 html files + style.css exist', () => {
    const files = [
      'templates/architect/index.html',
      'templates/architect/architecture.html',
      'templates/architect/data-flow.html',
      'templates/architect/decisions.html',
      'templates/architect/tech-stack.html',
      'templates/architect/tech-notes.html',
      'templates/architect/feature-map.html',
      'templates/architect/style.css',
    ];
    files.forEach(f => {
      expect(exists(f)).toBe(true);
    });
  });
});
