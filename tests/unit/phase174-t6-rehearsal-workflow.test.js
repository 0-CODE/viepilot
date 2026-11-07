'use strict';

const fs = require('fs');
const path = require('path');
const gates = require('../../lib/proposal-gates.cjs');

const ROOT = path.join(__dirname, '..', '..');
const WF = fs.readFileSync(path.join(ROOT, 'workflows', 'proposal.md'), 'utf8');
const SKILL = fs.readFileSync(path.join(ROOT, 'skills', 'vp-proposal', 'SKILL.md'), 'utf8');
const pos = (n) => WF.indexOf(`<step name="${n}">`);
const step = (n) => WF.slice(pos(n), WF.indexOf('</step>', pos(n)));

describe('Phase 174.6 — Rehearsal Hall in the workflow', () => {
  test('offered after Confirm Output, before Iterate, with input and output gates', () => {
    expect(pos('confirm_output')).toBeLessThan(pos('rehearsal_hall'));
    expect(pos('rehearsal_hall')).toBeLessThan(pos('iterate'));
    const seg = step('rehearsal_hall');
    expect((seg.match(/AskUserQuestion/g) || []).length).toBeGreaterThanOrEqual(2);
    expect(step('confirm_output')).toMatch(/Rehearsal Hall \(Step 10b\)/);
  });

  test('uses every simulation building block and labels the output', () => {
    const seg = step('rehearsal_hall');
    for (const w of ['buildTimeline', 'slideLoad', 'selectHall', 'listener-prompt.md', 'parseListener', 'aggregate(', 'writeRun', 'report.html', 'summary.md', 'data.json', 'AI simulation — not real audience data', '--simulate', '--hall all', 'Agent tool', 'previous']) {
      expect(seg).toContain(w);
    }
  });

  test('registered and fully gated; an older proposal gets the new step on upgrade', () => {
    expect(gates.GATES.map((g) => g.step)).toContain('rehearsal_hall');
    expect(gates.lintWorkflowGates(WF)).toEqual([]);
    expect(gates.upgradePlan({ viepilotVersion: '3.21.0' }, '3.22.0').missing).toEqual(['rehearsal_hall']);
  });

  test('SKILL documents the Rehearsal Hall and --simulate', () => {
    expect(SKILL).toMatch(/\*\*Rehearsal Hall \(ENH-121\):\*\*/);
    expect(SKILL).toMatch(/--simulate <proposal dir>/);
  });
});
