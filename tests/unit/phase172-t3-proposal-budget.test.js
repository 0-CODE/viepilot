'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const budget = require('../../lib/proposal-budget.cjs');

const hasOpenpyxl = spawnSync('python3', ['-c', 'import openpyxl'], { encoding: 'utf8' }).status === 0;

describe('Phase 172.3 — budget workbook spec', () => {
  test('applies to the four budget cases only', () => {
    expect(budget.budgetApplies('project-proposal')).toBe(true);
    expect(budget.budgetApplies('research-proposal', 'grant-proposal')).toBe(true);
    expect(budget.budgetApplies('research-proposal', 'progress-report')).toBe(true);
    expect(budget.budgetApplies('internal-presentation', 'leadership-report')).toBe(true);
    expect(budget.budgetApplies('general')).toBe(false);
    expect(budget.budgetApplies('research-proposal', 'defense')).toBe(false);
    expect(budget.budgetSpec('general')).toBeNull();
  });

  test('totals are formulas, never hard-coded numbers', () => {
    for (const [t, v] of [['project-proposal', null], ['research-proposal', 'grant-proposal'], ['research-proposal', 'progress-report'], ['internal-presentation', 'leadership-report']]) {
      const spec = budget.budgetSpec(t, v, {});
      const totals = spec.sheets.flatMap((s) => s.rows.filter((r) => r.total));
      expect(totals.length).toBeGreaterThan(0);
      for (const r of totals) for (const val of Object.values(r.cells).slice(1)) expect(String(val)).toMatch(/^=/);
      expect(spec.inputCells.length).toBeGreaterThan(0);
    }
  });

  test('grant arithmetic: direct, indirect, total, requested', () => {
    const spec = budget.budgetSpec('research-proposal', 'grant-proposal', {
      items: [{ label: 'Personnel', qty: 12, unitCost: 20000000 }, { label: 'Equipment', qty: 1, unitCost: 150000000 }],
      indirectRate: 0.1, coFunding: 50000000,
    });
    expect(budget.evaluateSpec(spec)).toEqual({ direct: 390000000, indirect: 39000000, total: 429000000, requested: 379000000 });
  });

  test('investment with contingency, budget use with variance, leadership ask with payback', () => {
    expect(budget.evaluateSpec(budget.budgetSpec('project-proposal', null, { items: [{ label: 'Build', qty: 40, unitCost: 5000000 }], contingencyPct: 0.15 })))
      .toEqual({ subtotal: 200000000, contingency: 30000000, total: 230000000 });
    const use = budget.evaluateSpec(budget.budgetSpec('research-proposal', 'progress-report', { lines: [{ label: 'P', planned: 100, actual: 80 }, { label: 'E', planned: 50, actual: 60 }] }));
    expect(use).toMatchObject({ planned: 150, spent: 140, variance: 10 });
    expect(use.pctUsed).toBeCloseTo(0.9333, 3);
    expect(budget.evaluateSpec(budget.budgetSpec('internal-presentation', 'leadership-report', { amount: 120, annualBenefit: 200, annualCost: 80 })).paybackMonths).toBe(12);
    expect(budget.evaluateSpec(budget.budgetSpec('internal-presentation', 'leadership-report', { amount: 1, annualBenefit: 0, annualCost: 5 })).paybackMonths).toBe('n/a');
  });

  (hasOpenpyxl ? test : test.skip)('openpyxl script writes the formulas at the rows the read-back points to', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-budget-'));
    try {
      const spec = budget.budgetSpec('research-proposal', 'grant-proposal', { items: [{ label: 'Personnel', qty: 12, unitCost: 20000000 }], indirectRate: 0.1, coFunding: 5 });
      const xlsx = path.join(dir, 'b.xlsx');
      fs.writeFileSync(path.join(dir, 'w.py'), budget.renderOpenpyxlScript(spec, xlsx));
      expect(spawnSync('python3', [path.join(dir, 'w.py')], { encoding: 'utf8' }).status).toBe(0);
      const dump = spawnSync('python3', ['-c', `from openpyxl import load_workbook;ws=load_workbook(${JSON.stringify(xlsx)})['Budget'];print(ws['D5'].value, ws['D8'].value)`], { encoding: 'utf8' });
      expect(dump.stdout.trim()).toBe('=D3*B4 =D6-B7');
      expect(spec.readBack.requested).toBe('Budget!D8');
      fs.writeFileSync(path.join(dir, 'r.py'), budget.renderReadBackScript(spec, xlsx));
      expect(spawnSync('python3', [path.join(dir, 'r.py')], { encoding: 'utf8' }).status).toBe(0);
    } finally { fs.rmSync(dir, { recursive: true, force: true }); }
  });

  test('workflow sources budget figures from the workbook and labels the fallback', () => {
    const wf = fs.readFileSync(path.join(__dirname, '../../workflows/proposal.md'), 'utf8');
    for (const w of ['budgetApplies', 'budgetSpec', 'renderOpenpyxlScript', 'recalc.py', 'renderReadBackScript', 'evaluateSpec', 'workbook not recalculated', 'anthropic-skills:pdf']) {
      expect(wf).toContain(w);
    }
  });
});
