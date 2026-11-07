'use strict';

const fs = require('fs');
const path = require('path');
const gates = require('../../lib/proposal-gates.cjs');

const ROOT = path.join(__dirname, '..', '..');
const WF = fs.readFileSync(path.join(ROOT, 'workflows', 'proposal.md'), 'utf8');
const SKILL = fs.readFileSync(path.join(ROOT, 'skills', 'vp-proposal', 'SKILL.md'), 'utf8');
const step = (name) => {
  const start = WF.indexOf(`<step name="${name}">`);
  return WF.slice(start, WF.indexOf('</step>', start));
};

describe('Phase 172.2 — document skills in the proposal workflow', () => {
  test('Initialize assesses the environment and asks when something is missing', () => {
    const seg = step('initialize');
    expect(seg).toMatch(/assessEnvironment\(/);
    expect(seg).toMatch(/AskUserQuestion/);
    expect(seg).toMatch(/skipped — /);
  });

  test('Step 6 loads the pptx skill; Step 7 loads the docx skill', () => {
    expect(step('generate_pptx')).toMatch(/anthropic-skills:pptx/);
    expect(step('generate_docx')).toMatch(/anthropic-skills:docx/);
  });

  test('Step 6b runs the skill validator after the animation post-process, fail-loud', () => {
    const seg = step('animation_hook');
    expect(seg).toMatch(/scripts\/office\/validate\.py/);
    expect(seg).toMatch(/fail-loud/);
    expect(seg.indexOf('validatePptxAnimations')).toBeLessThan(seg.indexOf('validate.py'));
  });

  test('Deck QA step runs content, file and visual QA and ends with an output gate', () => {
    const seg = step('deck_qa');
    for (const word of ['slide_text.py', 'validate.py', 'soffice.py', 'pdftoppm', 'Content QA', 'File QA', 'Visual QA', 'AskUserQuestion']) {
      expect(seg).toContain(word);
    }
    expect(WF.indexOf('<step name="animation_hook">')).toBeLessThan(WF.indexOf('<step name="deck_qa">'));
    expect(WF.indexOf('<step name="deck_qa">')).toBeLessThan(WF.indexOf('<step name="generate_docx">'));
  });

  test('deck_qa is registered and the workflow stays fully gated', () => {
    expect(gates.GATES.map((g) => g.step)).toContain('deck_qa');
    expect(gates.lintWorkflowGates(WF)).toEqual([]);
  });

  test('SKILL scopes the namespace-guard exception to vp-proposal and names all four skills', () => {
    const scope = SKILL.slice(SKILL.indexOf('<scope_policy>'), SKILL.indexOf('</scope_policy>'));
    for (const s of ['pptx', 'docx', 'xlsx', 'pdf']) expect(scope).toContain(`anthropic-skills:${s}`);
    expect(scope).toMatch(/vp-proposal only/);
    expect(scope).toMatch(/skipped — /);
  });
});
