'use strict';

const fs = require('fs');
const path = require('path');
const gates = require('../../lib/proposal-gates.cjs');

const ROOT = path.join(__dirname, '..', '..');
const WF = fs.readFileSync(path.join(ROOT, 'workflows', 'proposal.md'), 'utf8');
const SKILL = fs.readFileSync(path.join(ROOT, 'skills', 'vp-proposal', 'SKILL.md'), 'utf8');

describe('Phase 171.5 — every proposal gate asks the user', () => {
  test('lintWorkflowGates finds no ungated step', () => {
    expect(gates.lintWorkflowGates(WF)).toEqual([]);
  });

  test('gate inventory table lists exactly the registered steps', () => {
    const table = WF.slice(WF.indexOf('### Gate inventory'));
    const rows = [...table.matchAll(/^\| ([a-z_]+) \|/gm)].map((m) => m[1]);
    expect(rows.sort()).toEqual(gates.GATES.map((g) => g.step).sort());
  });

  test('every registered step exists in the workflow', () => {
    for (const g of gates.GATES) expect(WF).toContain(`<step name="${g.step}">`);
  });

  test('detect_existing offers Upgrade / Revise / New / Keep and protects hand edits', () => {
    const seg = WF.slice(WF.indexOf('<step name="detect_existing">'), WF.indexOf('<step name="context_detection">'));
    for (const word of ['Upgrade', 'Revise', 'New proposal', 'Keep as is', 'upgradePlan', 'detectHandEdits', 'upgrade-report.md', 'vp-tools proposal migrate']) {
      expect(seg).toContain(word);
    }
  });

  test('iterate step reruns only invalidated steps and ends with an output gate', () => {
    const seg = WF.slice(WF.indexOf('<step name="iterate">'));
    expect(seg).toMatch(/invalidated steps/);
    expect(seg).toMatch(/Output gate/);
    expect(seg).toMatch(/newVersion/);
  });

  test('session and versioning rules are stated', () => {
    for (const word of ['recordStep', 'recordDecision', 'recordGate', 'setPendingGate', 'newVersion', 'versionPaths', 'writeProvenance', 'setCurrentVersion', '--resume']) {
      expect(WF).toContain(word);
    }
    expect((WF.match(/docs\/proposals\/\{slug\}-\{date\}/g) || []).length).toBeLessThanOrEqual(1); // only the legacy description
  });

  test('SKILL documents --resume, --yes and the re-entry rule', () => {
    expect(SKILL).toMatch(/--resume \[slug\]/);
    expect(SKILL).toMatch(/--yes/);
    expect(SKILL).toMatch(/Re-entry rule/);
  });
});
