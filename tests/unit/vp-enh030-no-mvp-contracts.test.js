'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

describe('ENH-030 — Remove MVP/Post-MVP concept', () => {
  test('brainstorm.md: no Product horizon section', () => {
    const content = read('workflows/brainstorm.md');
    expect(content).not.toMatch(/##\s*Product horizon/);
  });

  test('brainstorm.md: Phase assignment rule present', () => {
    const content = read('workflows/brainstorm.md');
    expect(content).toMatch(/Phase assignment \(ENH-030\)/);
  });

  test('brainstorm.md: ## Phases session template present', () => {
    const content = read('workflows/brainstorm.md');
    expect(content).toMatch(/##\s+Phases/);
  });

  test('crystallize.md: no Horizon validation gate', () => {
    const content = read('workflows/crystallize.md');
    expect(content).not.toMatch(/Horizon validation gate/);
  });

  test('crystallize.md: Phase assignment gate present', () => {
    const content = read('workflows/crystallize.md');
    expect(content).toMatch(/Phase assignment gate/);
  });

  test('crystallize.md: no Post-MVP mandatory block in ROADMAP step', () => {
    const content = read('workflows/crystallize.md');
    expect(content).not.toMatch(/Mandatory.*Post-MVP.*Product horizon/);
  });

  test('feature-map.html: badge-phase-1 present, badge-mvp absent', () => {
    const content = read('templates/architect/feature-map.html');
    expect(content).toMatch(/badge-phase-1/);
    expect(content).not.toMatch(/badge-mvp/);
  });

  test('style.css: .badge-phase-1 present, .badge-mvp absent', () => {
    const content = read('templates/architect/style.css');
    expect(content).toMatch(/\.badge-phase-1/);
    expect(content).not.toMatch(/\.badge-mvp/);
  });

  test('PROJECT-CONTEXT.md template: no MVP boundary section', () => {
    const content = read('templates/project/PROJECT-CONTEXT.md');
    expect(content).not.toMatch(/MVP boundary/);
    expect(content).not.toMatch(/Post-MVP themes/);
  });

  test('ROADMAP.md template: no Post-MVP / Product horizon section', () => {
    const content = read('templates/project/ROADMAP.md');
    expect(content).not.toMatch(/##\s*Post-MVP/);
    expect(content).not.toMatch(/Product horizon/);
  });
});
