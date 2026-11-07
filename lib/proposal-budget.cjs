'use strict';

/**
 * vp-proposal budget workbooks (ENH-127).
 *
 * Budgets, investment and "ask" figures live in one xlsx workbook with live formulas — never typed
 * into slides by hand. `budgetSpec` describes the workbook; `renderOpenpyxlScript` turns it into a
 * Python (openpyxl) script that the xlsx document skill runs, followed by the skill's `recalc.py`;
 * `renderReadBackScript` reads the recalculated values that slides and the .docx then quote.
 *
 * Zero dependencies. Formulas use A1 references; inputs are plain cells the user fills or confirms.
 */

const CASES = Object.freeze({
  'project-proposal': 'investment',
  'research-proposal:grant-proposal': 'grant',
  'research-proposal:progress-report': 'budget-use',
  'internal-presentation:leadership-report': 'ask',
});

function caseFor(type, variant) {
  return CASES[`${type}:${variant}`] || CASES[type] || null;
}

function budgetApplies(type, variant) {
  return caseFor(type, variant) !== null;
}

const num = (v, d) => (typeof v === 'number' && Number.isFinite(v) ? v : d);

// One line-item table: columns A label, B qty, C unit cost, D = B*C. Returns rows + the total cell.
function lineTable(items, startRow, labels = ['Item', 'Quantity', 'Unit cost', 'Amount']) {
  const rows = [{ cells: { A: labels[0], B: labels[1], C: labels[2], D: labels[3] }, header: true }];
  items.forEach((it, i) => {
    const r = startRow + 1 + i;
    rows.push({ cells: { A: it.label, B: num(it.qty, 0), C: num(it.unitCost, 0), D: `=B${r}*C${r}` }, input: ['B', 'C'] });
  });
  const first = startRow + 1;
  const last = startRow + items.length;
  const totalRow = last + 1;
  rows.push({ cells: { A: 'Subtotal', D: items.length ? `=SUM(D${first}:D${last})` : '=0' }, total: true });
  return { rows, totalCell: `D${totalRow}`, nextRow: totalRow + 1 }; // rows are contiguous: the next block starts right below
}

function investment(inputs) {
  const items = inputs.items || [
    { label: 'Discovery & design', qty: 0, unitCost: 0 },
    { label: 'Build', qty: 0, unitCost: 0 },
    { label: 'Testing & launch', qty: 0, unitCost: 0 },
  ];
  const t = lineTable(items, 1, ['Phase / role', 'Person-days', 'Day rate', 'Amount']);
  const r = t.nextRow;
  const rows = [...t.rows,
    { cells: { A: 'Contingency %', B: num(inputs.contingencyPct, 0.1) }, input: ['B'] },
    { cells: { A: 'Contingency', D: `=${t.totalCell}*B${r}` } },
    { cells: { A: 'Total investment', D: `=${t.totalCell}+D${r + 1}` }, total: true },
  ];
  return { sheets: [{ name: 'Investment', rows }], readBack: { subtotal: `Investment!${t.totalCell}`, contingency: `Investment!D${r + 1}`, total: `Investment!D${r + 2}` } };
}

function grant(inputs) {
  const items = inputs.items || [
    { label: 'Personnel', qty: 0, unitCost: 0 },
    { label: 'Equipment', qty: 0, unitCost: 0 },
    { label: 'Materials & consumables', qty: 0, unitCost: 0 },
    { label: 'Travel & dissemination', qty: 0, unitCost: 0 },
  ];
  const t = lineTable(items, 1, ['Cost category', 'Quantity', 'Unit cost', 'Amount']);
  const r = t.nextRow;
  const rows = [...t.rows,
    { cells: { A: 'Indirect cost rate', B: num(inputs.indirectRate, 0.1) }, input: ['B'] },
    { cells: { A: 'Indirect costs', D: `=${t.totalCell}*B${r}` } },
    { cells: { A: 'Total project cost', D: `=${t.totalCell}+D${r + 1}` }, total: true },
    { cells: { A: 'Co-funding', B: num(inputs.coFunding, 0) }, input: ['B'] },
    { cells: { A: 'Amount requested', D: `=D${r + 2}-B${r + 3}` }, total: true },
  ];
  return { sheets: [{ name: 'Budget', rows }], readBack: { direct: `Budget!${t.totalCell}`, indirect: `Budget!D${r + 1}`, total: `Budget!D${r + 2}`, requested: `Budget!D${r + 4}` } };
}

function budgetUse(inputs) {
  const lines = inputs.lines || [{ label: 'Personnel', planned: 0, actual: 0 }, { label: 'Equipment', planned: 0, actual: 0 }];
  const rows = [{ cells: { A: 'Budget line', B: 'Planned', C: 'Spent', D: 'Variance', E: '% used' }, header: true }];
  lines.forEach((l, i) => {
    const r = 2 + i;
    rows.push({ cells: { A: l.label, B: num(l.planned, 0), C: num(l.actual, 0), D: `=B${r}-C${r}`, E: `=IF(B${r}=0,0,C${r}/B${r})` }, input: ['B', 'C'] });
  });
  const last = 1 + lines.length;
  const tr = last + 1;
  rows.push({ cells: { A: 'Total', B: `=SUM(B2:B${last})`, C: `=SUM(C2:C${last})`, D: `=B${tr}-C${tr}`, E: `=IF(B${tr}=0,0,C${tr}/B${tr})` }, total: true });
  return { sheets: [{ name: 'Budget use', rows }], readBack: { planned: `'Budget use'!B${tr}`, spent: `'Budget use'!C${tr}`, variance: `'Budget use'!D${tr}`, pctUsed: `'Budget use'!E${tr}` } };
}

function ask(inputs) {
  const rows = [
    { cells: { A: 'Item', B: 'Value' }, header: true },
    { cells: { A: 'Amount requested', B: num(inputs.amount, 0) }, input: ['B'] },
    { cells: { A: 'Expected annual benefit', B: num(inputs.annualBenefit, 0) }, input: ['B'] },
    { cells: { A: 'Annual running cost', B: num(inputs.annualCost, 0) }, input: ['B'] },
    { cells: { A: 'Net annual benefit', B: '=B3-B4' } },
    { cells: { A: 'Payback (months)', B: '=IF(B5<=0,"n/a",B2/B5*12)' }, total: true },
  ];
  return { sheets: [{ name: 'Ask', rows }], readBack: { amount: 'Ask!B2', netAnnualBenefit: 'Ask!B5', paybackMonths: 'Ask!B6' } };
}

const BUILDERS = { investment, grant, 'budget-use': budgetUse, ask };

/**
 * @param {string} type
 * @param {string|null} variant
 * @param {object} [inputs] items / lines / rates confirmed with the user (missing values default to 0 and are flagged)
 * @returns {{case: string, sheets: object[], readBack: Record<string,string>, inputCells: string[]} | null}
 */
function budgetSpec(type, variant, inputs = {}) {
  const c = caseFor(type, variant);
  if (!c) return null;
  const spec = BUILDERS[c](inputs || {});
  const inputCells = [];
  for (const sheet of spec.sheets) {
    sheet.rows.forEach((row, i) => (row.input || []).forEach((col) => inputCells.push(`${sheet.name}!${col}${i + 1}`)));
  }
  return { case: c, ...spec, inputCells };
}

const py = (v) => (typeof v === 'number' ? String(v) : JSON.stringify(String(v)));

/** Python/openpyxl script that writes the workbook (run by the xlsx skill, then its recalc.py). */
function renderOpenpyxlScript(spec, outPath) {
  const lines = ['from openpyxl import Workbook', 'from openpyxl.styles import Font', 'wb = Workbook()', 'wb.remove(wb.active)'];
  for (const sheet of spec.sheets) {
    lines.push(`ws = wb.create_sheet(${py(sheet.name)})`);
    sheet.rows.forEach((row, i) => {
      for (const [col, val] of Object.entries(row.cells)) {
        lines.push(`ws[${py(`${col}${i + 1}`)}] = ${py(val)}`);
        if (row.header || row.total) lines.push(`ws[${py(`${col}${i + 1}`)}].font = Font(bold=True)`);
      }
    });
  }
  lines.push(`wb.save(${py(outPath)})`);
  return lines.join('\n') + '\n';
}

/** Python script that prints the recalculated read-back values as JSON (openpyxl data_only=True). */
function renderReadBackScript(spec, xlsxPath) {
  const pairs = Object.entries(spec.readBack).map(([k, ref]) => {
    const [sheet, cell] = ref.replace(/'/g, '').split('!');
    return `out[${py(k)}] = wb[${py(sheet)}][${py(cell)}].value`;
  });
  return ['import json', 'from openpyxl import load_workbook', `wb = load_workbook(${py(xlsxPath)}, data_only=True)`, 'out = {}', ...pairs, 'print(json.dumps(out))'].join('\n') + '\n';
}

/**
 * Evaluate the spec's own formulas (=A1*B1, +, -, /, SUM(range), IF(cond,a,b)) — used to verify the
 * arithmetic in tests and as a clearly-labelled fallback when the workbook cannot be recalculated
 * (no LibreOffice). Not a general spreadsheet engine.
 * @returns {Record<string, number|string>} read-back key → value
 */
function evaluateSpec(spec) {
  const cells = {};
  for (const sheet of spec.sheets) {
    sheet.rows.forEach((row, i) => {
      for (const [col, val] of Object.entries(row.cells)) cells[`${sheet.name}!${col}${i + 1}`] = val;
    });
  }
  const memo = {};
  const get = (sheet, ref) => {
    const key = `${sheet}!${ref}`;
    if (key in memo) return memo[key];
    const raw = cells[key];
    memo[key] = typeof raw === 'string' && raw.startsWith('=') ? evalExpr(sheet, raw.slice(1)) : raw === undefined || raw === null ? 0 : raw;
    return memo[key];
  };
  const evalExpr = (sheet, expr) => {
    let e = expr.replace(/SUM\(([A-Z]+)(\d+):([A-Z]+)(\d+)\)/g, (_, c1, r1, c2, r2) => {
      let total = 0;
      for (let r = Number(r1); r <= Number(r2); r++) total += Number(get(sheet, `${c1}${r}`)) || 0;
      return String(total);
    });
    e = e.replace(/IF\(([^,]+),([^,]+),([^)]+)\)/g, (_, c, a, b) => `((${c.replace(/(?<![<>!=])=(?!=)/g, '==')})?(${a}):(${b}))`);
    e = e.replace(/\b([A-Z]+\d+)\b/g, (ref) => {
      const v = get(sheet, ref);
      return typeof v === 'number' ? `(${v})` : JSON.stringify(v);
    });
    if (!/^[\d\s+\-*/().?:<>=!"a-z/]*$/i.test(e)) throw new Error(`Unsupported formula: ${expr}`);
    // eslint-disable-next-line no-new-func
    return Function(`"use strict"; return (${e});`)();
  };
  const out = {};
  for (const [k, ref] of Object.entries(spec.readBack)) {
    const [sheet, cell] = ref.replace(/'/g, '').split('!');
    out[k] = get(sheet, cell);
  }
  return out;
}

module.exports = { CASES, budgetApplies, budgetSpec, renderOpenpyxlScript, renderReadBackScript, evaluateSpec };
