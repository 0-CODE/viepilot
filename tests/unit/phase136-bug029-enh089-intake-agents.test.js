'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');

function exists(rel) { return fs.existsSync(path.join(ROOT, rel)); }
function read(rel)   { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }

// ─── Agent files ──────────────────────────────────────────────────────────────

test('phase136 — excel-intake-agent.md exists', () => {
  expect(exists('agents/claude-code/excel-intake-agent.md')).toBe(true);
});

test('phase136 — sheets-intake-agent.md exists', () => {
  expect(exists('agents/claude-code/sheets-intake-agent.md')).toBe(true);
});

test('phase136 — agents/claude-code has 11 files total', () => {
  const files = fs.readdirSync(path.join(ROOT, 'agents/claude-code')).filter(f => f.endsWith('.md'));
  expect(files.length).toBe(11);
});

test('phase136 — excel-intake-agent.md has valid name frontmatter', () => {
  const content = read('agents/claude-code/excel-intake-agent.md');
  expect(content).toMatch(/name:\s*excel-intake-agent/);
});

test('phase136 — sheets-intake-agent.md has valid name frontmatter', () => {
  const content = read('agents/claude-code/sheets-intake-agent.md');
  expect(content).toMatch(/name:\s*sheets-intake-agent/);
});

test('phase136 — excel-intake-agent.md uses claude-sonnet-4-6 model', () => {
  const content = read('agents/claude-code/excel-intake-agent.md');
  expect(content).toMatch(/model:\s*claude-sonnet-4-6/);
});

test('phase136 — sheets-intake-agent.md uses claude-haiku-4-5 model', () => {
  const content = read('agents/claude-code/sheets-intake-agent.md');
  expect(content).toMatch(/model:\s*claude-haiku-4-5/);
});

// ─── writeback.cjs ────────────────────────────────────────────────────────────

test('phase136 — writeback.cjs has writebackExcelM365 function', () => {
  const content = read('lib/intake/writeback.cjs');
  expect(content).toMatch(/writebackExcelM365/);
});

test('phase136 — writeback.cjs has PATCH workbook URL pattern', () => {
  const content = read('lib/intake/writeback.cjs');
  expect(content).toMatch(/PATCH.*workbook|graph\.microsoft\.com.*workbook/);
});

test('phase136 — writeback.cjs has sharing_url read-only guard', () => {
  const content = read('lib/intake/writeback.cjs');
  expect(content).toMatch(/sharing_url.*read-only|read-only.*sharing_url/);
});

// ─── SKILL.md ─────────────────────────────────────────────────────────────────

test('phase136 — vp-intake SKILL.md has excel-intake-agent dispatch', () => {
  const content = read('skills/vp-intake/SKILL.md');
  const hits = (content.match(/excel-intake-agent/g) || []).length;
  expect(hits).toBeGreaterThanOrEqual(2);
});

test('phase136 — vp-intake SKILL.md has sharing_url read-only warning', () => {
  const content = read('skills/vp-intake/SKILL.md');
  expect(content).toMatch(/sharing_url.*read-only|read-only.*sharing_url/);
});
