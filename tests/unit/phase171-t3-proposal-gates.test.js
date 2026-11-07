'use strict';

const fs = require('fs');
const path = require('path');
const gates = require('../../lib/proposal-gates.cjs');

const ROOT = path.join(__dirname, '..', '..');
const INSTALLED = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version;
const WORKFLOW = fs.readFileSync(path.join(ROOT, 'workflows', 'proposal.md'), 'utf8');

describe('Phase 171.3 — gate registry', () => {
  test('registry is frozen, unique, and every entry asks the user or is covered', () => {
    expect(Object.isFrozen(gates.GATES)).toBe(true);
    const names = gates.GATES.map((g) => g.step);
    expect(new Set(names).size).toBe(names.length);
    expect(names.length).toBeGreaterThan(20);
    for (const g of gates.GATES) {
      expect(g.askUser).toBe(true);
      if (g.kinds.length === 0) expect(names).toContain(g.coveredBy);
    }
  });

  test('every current workflow step is registered', () => {
    const steps = [...WORKFLOW.matchAll(/<step name="([a-z_]+)">/g)].map((m) => m[1]);
    const names = new Set(gates.GATES.map((g) => g.step));
    for (const s of steps) expect(names.has(s)).toBe(true);
  });
});

describe('Phase 171.3 — upgradePlan', () => {
  test('a 3.16.0 proposal is missing the consult, intake, detect and iterate gates', () => {
    const plan = gates.upgradePlan({ viepilotVersion: '3.16.0' }, '3.19.0');
    expect(plan.legacy).toBe(false);
    expect(plan.missing).toEqual(expect.arrayContaining(['purpose_consult', 'audience_intake', 'detect_existing', 'iterate']));
    expect(plan.missing).not.toContain('persona_review_council');
    expect(plan.changed).toEqual(expect.arrayContaining(['type_selection', 'persona_review_council']));
    expect(plan.newInputs).toEqual(['purpose_consult', 'audience_intake']);
  });

  test('legacy provenance is treated as the base pipeline', () => {
    const plan = gates.upgradePlan({ viepilotVersion: 'legacy' }, '3.19.0');
    expect(plan.legacy).toBe(true);
    expect(plan.from).toBe(gates.BASE_VERSION);
    expect(plan.missing).toEqual(expect.arrayContaining(['voice_profile', 'spoken_script', 'animation_hook', 'persona_review_council']));
  });

  test('a proposal from the installed version needs nothing', () => {
    const plan = gates.upgradePlan({ viepilotVersion: INSTALLED }, INSTALLED);
    expect(plan.missing).toEqual([]);
    expect(plan.changed).toEqual([]);
  });

  test('gates newer than the installed version are never planned', () => {
    const plan = gates.upgradePlan({ viepilotVersion: '3.12.0' }, '3.14.0');
    expect(plan.missing).not.toContain('animation_hook'); // 3.15.0
    expect(plan.missing).toContain('voice_profile'); // 3.13.0
  });
});

describe('Phase 171.3 — lintWorkflowGates', () => {
  test('flags a step without AskUserQuestion and accepts a valid covered-by reference', () => {
    const wf = [
      '<step name="a">\nAsk via AskUserQuestion.\n</step>',
      '<step name="b">\nCompute only. covered by gate: `a`\n</step>',
      '<step name="c">\nNothing here.\n</step>',
      '<step name="d">\ncovered by gate: `zzz`\n</step>',
    ].join('\n');
    const problems = gates.lintWorkflowGates(wf).filter((p) => ['a', 'b', 'c', 'd'].includes(p.step));
    expect(problems.map((p) => p.step)).toEqual(['c', 'd']);
  });

  test('reports the ungated steps of the real workflow (closed in 171.5)', () => {
    const problems = gates.lintWorkflowGates(WORKFLOW);
    expect(Array.isArray(problems)).toBe(true);
    for (const p of problems) expect(typeof p.reason).toBe('string');
  });
});
