'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

describe('ENH-027 Architect Design Mode — ERD page', () => {
  test('templates/architect/erd.html: file exists', () => {
    const p = path.join(ROOT, 'templates/architect/erd.html');
    expect(fs.existsSync(p)).toBe(true);
  });

  test('templates/architect/erd.html: contains erDiagram mermaid block', () => {
    const content = read('templates/architect/erd.html');
    expect(content).toMatch(/erDiagram/);
    expect(content).toMatch(/mermaid/);
  });

  test('templates/architect/erd.html: Entity List table with required columns', () => {
    const content = read('templates/architect/erd.html');
    expect(content).toMatch(/Entity/);
    expect(content).toMatch(/Attributes/);
    expect(content).toMatch(/PK/);
    expect(content).toMatch(/FK/);
  });

  test('templates/architect/erd.html: Relationship Summary table exists', () => {
    const content = read('templates/architect/erd.html');
    expect(content).toMatch(/Relationship/);
  });

  test('templates/architect/erd.html: sidebar nav has 9 items including ERD active and Use Cases link', () => {
    const content = read('templates/architect/erd.html');
    // Active link for erd.html
    expect(content).toMatch(/erd\.html.*class="active"|class="active"[^>]*>.*ERD/s);
    // Must include Use Cases link (BUG-008 fix)
    expect(content).toMatch(/user-use-cases\.html/);
    // Has all 9 nav links
    const navLinks = content.match(/<li><a href=/g) || [];
    expect(navLinks.length).toBeGreaterThanOrEqual(9);
  });

  test('brainstorm.md: ERD trigger keywords documented in Architect Design Mode', () => {
    const content = read('workflows/brainstorm.md');
    expect(content).toMatch(/erd|ERD|entity|table.*database|database.*table/i);
    expect(content).toMatch(/erDiagram/);
  });

  test('crystallize.md Step 1D: ERD extraction to ARCHITECTURE.md documented', () => {
    const content = read('workflows/crystallize.md');
    expect(content).toMatch(/## erd/i);
    expect(content).toMatch(/Database Schema/i);
  });

  test('skills/vp-brainstorm/SKILL.md: version and ENH-027 note', () => {
    const content = read('skills/vp-brainstorm/SKILL.md');
    expect(content).toMatch(/version:\s*\d+\.\d+\.\d+/);
    expect(content).toMatch(/ENH-027/);
    expect(content).toMatch(/erd\.html/);
  });

  test('templates/architect/index.html: ERD nav link and hub card present', () => {
    const content = read('templates/architect/index.html');
    expect(content).toMatch(/erd\.html/);
    expect(content).toMatch(/ERD/);
  });
});
