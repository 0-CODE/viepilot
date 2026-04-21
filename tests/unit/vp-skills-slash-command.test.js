'use strict';

/**
 * Contract tests for Phase 95: /vp-skills + get-registry + BUG-016 + BUG-017
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '../..');

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

// ── skills/vp-skills/SKILL.md ──────────────────────────────────────────────

test('skills/vp-skills/SKILL.md exists', () => {
  expect(exists('skills/vp-skills/SKILL.md')).toBe(true);
});

test('vp-skills SKILL.md contains "vp-skills"', () => {
  const content = read('skills/vp-skills/SKILL.md');
  expect(content).toContain('vp-skills');
});

test('vp-skills SKILL.md contains "scan" command', () => {
  const content = read('skills/vp-skills/SKILL.md');
  expect(content).toContain('scan');
});

test('vp-skills SKILL.md contains "install" command', () => {
  const content = read('skills/vp-skills/SKILL.md');
  expect(content).toContain('install');
});

test('vp-skills SKILL.md contains "get-registry" installed path usage', () => {
  const content = read('skills/vp-skills/SKILL.md');
  expect(content).toContain('get-registry');
});

test('vp-skills SKILL.md contains "~/.claude/viepilot" cross-project path', () => {
  const content = read('skills/vp-skills/SKILL.md');
  expect(content).toContain('~/.claude/viepilot');
});

// ── CLI: get-registry ──────────────────────────────────────────────────────

test('vp-tools --help includes "get-registry"', () => {
  const output = execSync('node bin/vp-tools.cjs --help', { cwd: ROOT }).toString();
  expect(output).toContain('get-registry');
});

test('vp-tools get-registry outputs valid JSON or "null"', () => {
  const output = execSync('node bin/vp-tools.cjs get-registry 2>/dev/null', { cwd: ROOT }).toString().trim();
  // Should be parseable JSON or the string "null"
  expect(() => JSON.parse(output)).not.toThrow();
});

test('vp-tools get-registry --id non-existent outputs null', () => {
  const output = execSync('node bin/vp-tools.cjs get-registry --id __nonexistent_skill__ 2>/dev/null', { cwd: ROOT }).toString().trim();
  expect(output).toBe('null');
});

// ── BUG-016 fix: workflows/autonomous.md ──────────────────────────────────

test('workflows/autonomous.md does NOT contain "Call loadRegistry()"', () => {
  const content = read('workflows/autonomous.md');
  expect(content).not.toContain('Call `loadRegistry()`');
});

test('workflows/autonomous.md contains "get-registry" shell command', () => {
  const content = read('workflows/autonomous.md');
  expect(content).toContain('get-registry');
});

// ── BUG-016 fix: workflows/brainstorm.md ──────────────────────────────────

test('workflows/brainstorm.md does NOT contain "Call loadRegistry()"', () => {
  const content = read('workflows/brainstorm.md');
  expect(content).not.toContain('Call `loadRegistry()`');
});

test('workflows/brainstorm.md contains "get-registry" shell command', () => {
  const content = read('workflows/brainstorm.md');
  expect(content).toContain('get-registry');
});

// ── BUG-017 fix: AUQ in vp-evolve Step 5 ─────────────────────────────────

test('skills/vp-evolve/SKILL.md <process> Step 5 contains AskUserQuestion', () => {
  const content = read('skills/vp-evolve/SKILL.md');
  const processBlock = content.match(/<process>([\s\S]*?)<\/process>/)?.[1] || '';
  const step5 = processBlock.split('### Step 5')[1] || '';
  expect(step5).toContain('AskUserQuestion');
});

// ── BUG-017 fix: AUQ in vp-request Step 6 ────────────────────────────────

test('skills/vp-request/SKILL.md <process> Step 6 contains AskUserQuestion', () => {
  const content = read('skills/vp-request/SKILL.md');
  const processBlock = content.match(/<process>([\s\S]*?)<\/process>/)?.[1] || '';
  const step6 = processBlock.split('### Step 6')[1] || '';
  expect(step6).toContain('AskUserQuestion');
});
