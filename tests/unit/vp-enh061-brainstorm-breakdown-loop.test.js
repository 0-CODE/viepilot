'use strict';

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', '..');
const brainstorm = fs.readFileSync(path.join(root, 'workflows/brainstorm.md'), 'utf8');
const skill = fs.readFileSync(path.join(root, 'skills/vp-brainstorm/SKILL.md'), 'utf8');

describe('ENH-061: vp-brainstorm idea-to-architecture breakdown loop', () => {
  test('brainstorm.md has Recommended Breakdown Ordering section', () => {
    expect(brainstorm).toMatch(/Recommended Breakdown Ordering/);
  });

  test('brainstorm.md has Feature → Coverage Mapping step', () => {
    expect(brainstorm).toMatch(/Coverage Mapping/);
  });

  test('brainstorm.md has ## Coverage matrix format', () => {
    expect(brainstorm).toMatch(/## Coverage/);
  });

  test('brainstorm.md has arch_to_ui_sync reverse sync section', () => {
    expect(brainstorm).toMatch(/arch_to_ui_sync/);
  });

  test('brainstorm.md has Section 6C for Architect → UI Direction Sync', () => {
    expect(brainstorm).toMatch(/6C\./);
  });

  test('brainstorm.md has /sync-ui command', () => {
    expect(brainstorm).toMatch(/\/sync-ui/);
  });

  test('brainstorm.md has CHECK 4 in pre-save validation', () => {
    expect(brainstorm).toMatch(/CHECK 4/);
  });

  test('brainstorm.md CHECK 4 is non-blocking (warning, not hard block)', () => {
    expect(brainstorm).toMatch(/non-blocking|Proceed with save/i);
  });

  test('skills/vp-brainstorm/SKILL.md documents ENH-061 breakdown loop', () => {
    expect(skill).toMatch(/ENH-061/);
  });

  test('skills/vp-brainstorm/SKILL.md mentions arch_to_ui_sync', () => {
    expect(skill).toMatch(/arch_to_ui_sync/);
  });

  test('skills/vp-brainstorm/SKILL.md mentions Coverage mapping', () => {
    expect(skill).toMatch(/Coverage mapping/i);
  });
});
