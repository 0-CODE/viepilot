'use strict';

const fs = require('fs');
const path = require('path');

const CRYSTALLIZE_MD = fs.readFileSync(
  path.join(__dirname, '../../workflows/crystallize.md'), 'utf8'
);
const PROJECT_CONTEXT_TEMPLATE = fs.readFileSync(
  path.join(__dirname, '../../templates/project/PROJECT-CONTEXT.md'), 'utf8'
);
const CRYSTALLIZE_SKILL_MD = fs.readFileSync(
  path.join(__dirname, '../../skills/vp-crystallize/SKILL.md'), 'utf8'
);

// ─────────────────────────────────────────────────────────────────────────────
// Group 1: workflows/crystallize.md contracts
// ─────────────────────────────────────────────────────────────────────────────
describe('FEAT-020: workflows/crystallize.md contracts', () => {
  test('1. contains "Step 1E"', () => {
    expect(CRYSTALLIZE_MD).toContain('Step 1E');
  });

  test('2. contains "Skill Decision Gate"', () => {
    expect(CRYSTALLIZE_MD).toContain('Skill Decision Gate');
  });

  test('3. contains "FEAT-020"', () => {
    expect(CRYSTALLIZE_MD).toContain('FEAT-020');
  });

  test('4. contains "## Skills"', () => {
    expect(CRYSTALLIZE_MD).toContain('## Skills');
  });

  test('5. contains "skills_used"', () => {
    expect(CRYSTALLIZE_MD).toContain('skills_used');
  });

  test('6. contains skip condition ("silently skip")', () => {
    expect(CRYSTALLIZE_MD.toLowerCase()).toContain('silently skip');
  });

  test('7. AUQ spec present (required | optional | exclude)', () => {
    expect(CRYSTALLIZE_MD).toContain('required');
    expect(CRYSTALLIZE_MD).toContain('optional');
    expect(CRYSTALLIZE_MD).toContain('exclude');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Group 2: template contracts
// ─────────────────────────────────────────────────────────────────────────────
describe('FEAT-020: templates/project/PROJECT-CONTEXT.md contracts', () => {
  test('8. contains "## Skills"', () => {
    expect(PROJECT_CONTEXT_TEMPLATE).toContain('## Skills');
  });

  test('9. Skills table has required columns (Skill/Source/Required/Phases/Rationale)', () => {
    expect(PROJECT_CONTEXT_TEMPLATE).toContain('Skill');
    expect(PROJECT_CONTEXT_TEMPLATE).toContain('Source');
    expect(PROJECT_CONTEXT_TEMPLATE).toContain('Required');
    expect(PROJECT_CONTEXT_TEMPLATE).toContain('Phases');
    expect(PROJECT_CONTEXT_TEMPLATE).toContain('Rationale');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Group 3: SKILL.md contracts
// ─────────────────────────────────────────────────────────────────────────────
describe('FEAT-020: skills/vp-crystallize/SKILL.md contracts', () => {
  test('10. contains "FEAT-020"', () => {
    expect(CRYSTALLIZE_SKILL_MD).toContain('FEAT-020');
  });

  test('11. contains "Step 1E"', () => {
    expect(CRYSTALLIZE_SKILL_MD).toContain('Step 1E');
  });
});
