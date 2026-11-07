'use strict';

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '../..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

describe('ENH-129 — optional Plan Mode for /vp-evolve', () => {
  const wf = read('workflows/evolve.md');
  test('evolve workflow has the Plan Mode block with trigger and flow', () => {
    expect(wf).toMatch(/### Plan Mode \(ENH-129 — Claude Code, optional\)/);
    expect(wf).toMatch(/--plan-mode/);
    expect(wf).toMatch(/\*\*L\*\* or \*\*XL\*\*/);
    expect(wf).toMatch(/Use Plan Mode \(Recommended for L\/XL\) \/\s*Plan directly/);
    expect(wf).toMatch(/select:EnterPlanMode,ExitPlanMode/);
    expect(wf.indexOf('### Plan Mode (ENH-129')).toBeLessThan(wf.indexOf('### Generate Phase'));
  });
  test('approved plan is written verbatim; one gate only; fallback for other hosts', () => {
    expect(wf).toMatch(/verbatim from the approved\s*plan/);
    expect(wf).toMatch(/Approved plan \(Plan Mode, verbatim\)/);
    expect(wf).toMatch(/do not add an AskUserQuestion "is the plan ok\?" on top/);
    expect(wf).toMatch(/hosts without Plan Mode \(Cursor Agent mode, Codex, Copilot, Antigravity\) and subagents/);
    expect(wf).toMatch(/new milestone planned in one sitting, the Plan Mode option/);
    expect(wf).toMatch(/large refactor, the Plan Mode option/);
  });
  test('SKILL documents --plan-mode and the AUQ offer', () => {
    const sk = read('skills/vp-evolve/SKILL.md');
    expect(sk).toMatch(/`--plan-mode` : Plan in Claude Code Plan Mode \(ENH-129\)/);
    expect(sk).toMatch(/Plan Mode offer \(Step 3A — L\/XL or vague requests; ENH-129\)/);
  });
  test('vp-auto: optional per high-risk task, never the default', () => {
    const au = read('workflows/autonomous.md');
    expect(au).toMatch(/Plan Mode for a high-risk task \(ENH-129/);
    expect(au).toMatch(/Never the default for every task/);
  });
});
