'use strict';

const fs   = require('fs');
const path = require('path');
const os   = require('os');

const ROOT = path.resolve(__dirname, '../..');

function exists(rel) { return fs.existsSync(path.join(ROOT, rel)); }
function read(rel)   { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }

// ─── auto-intake.cjs ─────────────────────────────────────────────────────────

test('phase138 — lib/intake/auto-intake.cjs exists', () => {
  expect(exists('lib/intake/auto-intake.cjs')).toBe(true);
});

test('phase138 — auto-intake.cjs exports runAutoIntake', () => {
  const m = require(path.join(ROOT, 'lib/intake/auto-intake.cjs'));
  expect(typeof m.runAutoIntake).toBe('function');
});

test('phase138 — auto-intake.cjs exports createSchedule', () => {
  const m = require(path.join(ROOT, 'lib/intake/auto-intake.cjs'));
  expect(typeof m.createSchedule).toBe('function');
});

test('phase138 — auto-intake.cjs exports deleteSchedule', () => {
  const m = require(path.join(ROOT, 'lib/intake/auto-intake.cjs'));
  expect(typeof m.deleteSchedule).toBe('function');
});

test('phase138 — auto-intake.cjs exports appendPendingReview', () => {
  const m = require(path.join(ROOT, 'lib/intake/auto-intake.cjs'));
  expect(typeof m.appendPendingReview).toBe('function');
});

test('phase138 — auto-intake.cjs CONFIDENCE_THRESHOLD = 0.7', () => {
  const { CONFIDENCE_THRESHOLD } = require(path.join(ROOT, 'lib/intake/auto-intake.cjs'));
  expect(CONFIDENCE_THRESHOLD).toBe(0.7);
});

// ─── classifier.cjs confidence ───────────────────────────────────────────────

test('phase138 — classifier.cjs returns confidence field', () => {
  const { classifyTicket } = require(path.join(ROOT, 'lib/intake/classifier.cjs'));
  const result = classifyTicket({ title: 'fix login crash', description: '' });
  expect(typeof result.confidence).toBe('number');
  expect(result.confidence).toBeGreaterThanOrEqual(0);
  expect(result.confidence).toBeLessThanOrEqual(1);
});

test('phase138 — UNCLEAR tickets have confidence 0.0', () => {
  const { classifyTicket } = require(path.join(ROOT, 'lib/intake/classifier.cjs'));
  const result = classifyTicket({ title: 'quarterly review notes', description: '' });
  expect(result.classified).toBe('UNCLEAR');
  expect(result.confidence).toBe(0.0);
});

// ─── appendPendingReview accumulation ────────────────────────────────────────

test('phase138 — appendPendingReview accumulates items across calls', async () => {
  const { appendPendingReview } = require(path.join(ROOT, 'lib/intake/auto-intake.cjs'));
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-test-'));
  const tmpPath = path.join(tmpDir, 'pending-review.json');
  const channel = { name: 'test-channel' };

  await appendPendingReview([{ title: 'T1', _classified: 'BUG' }], channel, tmpPath);
  await appendPendingReview([{ title: 'T2', _classified: 'ENH' }], channel, tmpPath);

  const result = JSON.parse(fs.readFileSync(tmpPath, 'utf8'));
  expect(result.items.length).toBe(2);

  fs.rmSync(tmpDir, { recursive: true });
});

// ─── SKILL.md schedule flags ─────────────────────────────────────────────────

test('phase138 — vp-intake SKILL.md has schedule/CronCreate/--auto (≥3 hits)', () => {
  const content = read('skills/vp-intake/SKILL.md');
  const hits = [/--schedule/, /CronCreate/, /--auto/].filter((r) => r.test(content));
  expect(hits.length).toBeGreaterThanOrEqual(3);
});

test('phase138 — vp-intake SKILL.md has pending-review reference', () => {
  const content = read('skills/vp-intake/SKILL.md');
  expect(content).toMatch(/pending-review/);
});

test('phase138 — vp-intake SKILL.md has non-CC scheduling fallback', () => {
  const content = read('skills/vp-intake/SKILL.md');
  expect(content).toMatch(/Non-CC|Scheduling requires Claude Code/);
});

// ─── schedule.json management ────────────────────────────────────────────────

test('phase138 — auto-intake.cjs has CronCreate/CronDelete reference', () => {
  const content = read('lib/intake/auto-intake.cjs');
  expect(content).toMatch(/CronCreate|CronDelete/);
});

test('phase138 — auto-intake.cjs writes schedule.json', () => {
  const content = read('lib/intake/auto-intake.cjs');
  expect(content).toMatch(/schedule\.json/);
});
