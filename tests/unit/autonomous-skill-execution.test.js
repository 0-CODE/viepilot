'use strict';

const fs = require('fs');
const path = require('path');

const AUTONOMOUS_MD = fs.readFileSync(
  path.join(__dirname, '../../workflows/autonomous.md'), 'utf8'
);
const VP_AUTO_SKILL_MD = fs.readFileSync(
  path.join(__dirname, '../../skills/vp-auto/SKILL.md'), 'utf8'
);

// ─────────────────────────────────────────────────────────────────────────────
// Group 1: workflows/autonomous.md contracts
// ─────────────────────────────────────────────────────────────────────────────
describe('FEAT-020: workflows/autonomous.md contracts', () => {
  test('1. contains "Skill Context Load"', () => {
    expect(AUTONOMOUS_MD).toContain('Skill Context Load');
  });

  test('2. contains "Skill Context Injection"', () => {
    expect(AUTONOMOUS_MD).toContain('Skill Context Injection');
  });

  test('3. contains "FEAT-020"', () => {
    expect(AUTONOMOUS_MD).toContain('FEAT-020');
  });

  test('4. contains "SKILL_CONTEXT_MAP"', () => {
    expect(AUTONOMOUS_MD).toContain('SKILL_CONTEXT_MAP');
  });

  test('5. contains "skills_applied"', () => {
    expect(AUTONOMOUS_MD).toContain('skills_applied');
  });

  test('6. contains no-prompt rule ("Never prompt")', () => {
    expect(AUTONOMOUS_MD).toContain('Never prompt');
  });

  test('7. contains absent-skills no-op rule ("no warning")', () => {
    expect(AUTONOMOUS_MD.toLowerCase()).toContain('no warning');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Group 2: skills/vp-auto/SKILL.md contracts
// ─────────────────────────────────────────────────────────────────────────────
describe('FEAT-020: skills/vp-auto/SKILL.md contracts', () => {
  test('8. contains "FEAT-020"', () => {
    expect(VP_AUTO_SKILL_MD).toContain('FEAT-020');
  });

  test('9. contains "skills_applied"', () => {
    expect(VP_AUTO_SKILL_MD).toContain('skills_applied');
  });
});
