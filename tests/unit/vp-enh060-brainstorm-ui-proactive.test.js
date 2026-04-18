'use strict';

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', '..');
const brainstorm = fs.readFileSync(path.join(root, 'workflows/brainstorm.md'), 'utf8');
const skill = fs.readFileSync(path.join(root, 'skills/vp-brainstorm/SKILL.md'), 'utf8');

describe('ENH-060: vp-brainstorm UI Direction proactive suggestion', () => {
  test('brainstorm.md has Early-session detection section', () => {
    expect(brainstorm).toMatch(/Early-session detection/);
  });

  test('brainstorm.md has ≥2 unique signals surface threshold', () => {
    expect(brainstorm).toMatch(/≥2 unique signals/);
  });

  test('brainstorm.md has 🎨 proactive banner', () => {
    expect(brainstorm).toMatch(/🎨/);
  });

  test('brainstorm.md has ≥1 signal accumulation threshold', () => {
    expect(brainstorm).toMatch(/≥1 signal occurrence/);
  });

  test('brainstorm.md proactive banner mirrors Architect Design Mode', () => {
    expect(brainstorm).toMatch(/mirrors.*Architect Design Mode/);
  });

  test('skills/vp-brainstorm/SKILL.md documents UI Direction auto-suggestion', () => {
    expect(skill).toMatch(/[Aa]uto-suggest/);
  });

  test('skills/vp-brainstorm/SKILL.md has 🎨 banner reference', () => {
    expect(skill).toMatch(/🎨/);
  });

  test('skills/vp-brainstorm/SKILL.md tags ENH-060', () => {
    expect(skill).toMatch(/ENH-060/);
  });
});
