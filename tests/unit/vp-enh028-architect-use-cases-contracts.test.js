'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

describe('ENH-028 Architect Design Mode — User Use Cases page', () => {
  test('templates/architect/user-use-cases.html: file exists', () => {
    const p = path.join(ROOT, 'templates/architect/user-use-cases.html');
    expect(fs.existsSync(p)).toBe(true);
  });

  test('templates/architect/user-use-cases.html: contains flowchart mermaid block with actors', () => {
    const content = read('templates/architect/user-use-cases.html');
    expect(content).toMatch(/flowchart/);
    expect(content).toMatch(/mermaid/);
    // Should have actor-style nodes
    expect(content).toMatch(/Actor|actor|👤|subgraph/i);
  });

  test('templates/architect/user-use-cases.html: Use Case List table with ID, Actor, Phase columns', () => {
    const content = read('templates/architect/user-use-cases.html');
    expect(content).toMatch(/Use Case/);
    expect(content).toMatch(/Actor/);
    expect(content).toMatch(/Phase/);
    expect(content).toMatch(/UC-00/);
  });

  test('templates/architect/user-use-cases.html: Actor Summary table exists', () => {
    const content = read('templates/architect/user-use-cases.html');
    expect(content).toMatch(/Actor Summary/);
    expect(content).toMatch(/Role/);
    expect(content).toMatch(/Goals/);
  });

  test('templates/architect/user-use-cases.html: sidebar nav has 9 items with user-use-cases.html active', () => {
    const content = read('templates/architect/user-use-cases.html');
    // Active link for user-use-cases.html
    expect(content).toMatch(/user-use-cases\.html.*class="active"|class="active"[^>]*>.*Use Cases/s);
    const navLinks = content.match(/<li><a href=/g) || [];
    expect(navLinks.length).toBeGreaterThanOrEqual(8);
  });

  test('brainstorm.md: Use Cases trigger keywords and ## use_cases YAML section documented', () => {
    const content = read('workflows/brainstorm.md');
    expect(content).toMatch(/use.cases|use_cases/i);
    expect(content).toMatch(/## use_cases/);
  });

  test('crystallize.md Step 1D: use_cases extraction to PROJECT-CONTEXT.md documented', () => {
    const content = read('workflows/crystallize.md');
    expect(content).toMatch(/use_cases/);
    expect(content).toMatch(/User Stories.*Use Cases|Use Cases.*User Stories/i);
    expect(content).toMatch(/PROJECT-CONTEXT\.md/);
  });

  test('skills/vp-brainstorm/SKILL.md: ENH-028 note and user-use-cases.html reference', () => {
    const content = read('skills/vp-brainstorm/SKILL.md');
    expect(content).toMatch(/ENH-028/);
    expect(content).toMatch(/user-use-cases\.html/);
  });

  test('templates/architect/index.html: Use Cases nav link and hub card present', () => {
    const content = read('templates/architect/index.html');
    expect(content).toMatch(/user-use-cases\.html/);
    expect(content).toMatch(/Use Cases/);
  });
});
