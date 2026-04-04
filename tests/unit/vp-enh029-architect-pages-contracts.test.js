'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

describe('ENH-029 Architect Design Mode — C4/Sequence/Deployment/APIs pages', () => {
  test('architecture.html: C4Context section present', () => {
    const content = read('templates/architect/architecture.html');
    expect(content).toMatch(/C4Context/);
  });

  test('architecture.html: External Systems table present (6 columns)', () => {
    const content = read('templates/architect/architecture.html');
    expect(content).toMatch(/External Systems/);
    expect(content).toMatch(/Integration method/);
  });

  test('sequence-diagram.html: exists with sequenceDiagram mermaid block', () => {
    const p = path.join(ROOT, 'templates/architect/sequence-diagram.html');
    expect(fs.existsSync(p)).toBe(true);
    const content = fs.readFileSync(p, 'utf8');
    expect(content).toMatch(/sequenceDiagram/);
  });

  test('sequence-diagram.html: differentiation note from data-flow.html present', () => {
    const content = read('templates/architect/sequence-diagram.html');
    expect(content).toMatch(/data-flow\.html/);
    expect(content).toMatch(/High-level/i);
  });

  test('deployment.html: exists with environments table', () => {
    const p = path.join(ROOT, 'templates/architect/deployment.html');
    expect(fs.existsSync(p)).toBe(true);
    const content = fs.readFileSync(p, 'utf8');
    expect(content).toMatch(/Environments/);
    expect(content).toMatch(/Staging/i);
  });

  test('apis.html: exists with endpoint table (Method | Path columns)', () => {
    const p = path.join(ROOT, 'templates/architect/apis.html');
    expect(fs.existsSync(p)).toBe(true);
    const content = fs.readFileSync(p, 'utf8');
    expect(content).toMatch(/Method/);
    expect(content).toMatch(/Path/);
  });

  test('style.css: HTTP method badge classes present (method-get, method-post, method-delete)', () => {
    const content = read('templates/architect/style.css');
    expect(content).toMatch(/\.method-get/);
    expect(content).toMatch(/\.method-post/);
    expect(content).toMatch(/\.method-delete/);
  });

  test('brainstorm.md: boundary rule table / differentiation documented', () => {
    const content = read('workflows/brainstorm.md');
    expect(content).toMatch(/Page Boundary Rules/);
    expect(content).toMatch(/sequence-diagram\.html/);
  });

  test('brainstorm.md: deployment and apis trigger keywords present', () => {
    const content = read('workflows/brainstorm.md');
    expect(content).toMatch(/Deployment trigger keywords/i);
    expect(content).toMatch(/APIs trigger keywords/i);
  });

  test('crystallize.md: Deployment & Infrastructure extraction documented', () => {
    const content = read('workflows/crystallize.md');
    expect(content).toMatch(/Deployment & Infrastructure/);
  });

  test('crystallize.md: API Design extraction documented', () => {
    const content = read('workflows/crystallize.md');
    expect(content).toMatch(/API Design/);
  });
});
