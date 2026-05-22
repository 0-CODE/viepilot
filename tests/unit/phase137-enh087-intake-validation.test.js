'use strict';

const fs   = require('fs');
const path = require('path');
const os   = require('os');

const ROOT = path.resolve(__dirname, '../..');

function exists(rel) { return fs.existsSync(path.join(ROOT, rel)); }
function read(rel)   { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }

// ─── validator.cjs exists and exports ────────────────────────────────────────

test('phase137 — lib/intake/validator.cjs exists', () => {
  expect(exists('lib/intake/validator.cjs')).toBe(true);
});

test('phase137 — validator.cjs exports validateTickets', () => {
  const m = require(path.join(ROOT, 'lib/intake/validator.cjs'));
  expect(typeof m.validateTickets).toBe('function');
});

test('phase137 — validator.cjs exports extractKeywords', () => {
  const m = require(path.join(ROOT, 'lib/intake/validator.cjs'));
  expect(typeof m.extractKeywords).toBe('function');
});

test('phase137 — validator.cjs exports validateTicket', () => {
  const m = require(path.join(ROOT, 'lib/intake/validator.cjs'));
  expect(typeof m.validateTicket).toBe('function');
});

test('phase137 — validator.cjs has file-scanner-agent reference', () => {
  const content = read('lib/intake/validator.cjs');
  expect(content).toMatch(/file-scanner-agent|skipValidation|BATCH_SIZE/);
});

// ─── validateTickets with skipValidation ─────────────────────────────────────

test('phase137 — validateTickets with skipValidation returns tickets unchanged', async () => {
  const { validateTickets } = require(path.join(ROOT, 'lib/intake/validator.cjs'));
  const tickets = [{ title: 'Fix login', _classified: 'BUG' }];
  const result = await validateTickets(tickets, ROOT, { skipValidation: true });
  expect(result).toBe(tickets);
  expect(result[0]._validation).toBeUndefined();
});

// ─── extractKeywords ──────────────────────────────────────────────────────────

test('phase137 — extractKeywords returns array of strings', () => {
  const { extractKeywords } = require(path.join(ROOT, 'lib/intake/validator.cjs'));
  const kws = extractKeywords({ title: 'LoginButton throws NullPointerException on submit' });
  expect(Array.isArray(kws)).toBe(true);
  expect(kws.length).toBeGreaterThan(0);
});

// ─── SKILL.md ─────────────────────────────────────────────────────────────────

test('phase137 — vp-intake SKILL.md has Step 4.5 block', () => {
  const content = read('skills/vp-intake/SKILL.md');
  expect(content).toMatch(/Step 4\.5/);
});

test('phase137 — vp-intake SKILL.md has --skip-validation flag', () => {
  const content = read('skills/vp-intake/SKILL.md');
  expect(content).toMatch(/skip-validation/);
});

// ─── triage-ux.cjs ───────────────────────────────────────────────────────────

test('phase137 — triage-ux.cjs has _validation badge logic', () => {
  const content = read('lib/intake/triage-ux.cjs');
  expect(content).toMatch(/_validation|getValidationBadge/);
});
