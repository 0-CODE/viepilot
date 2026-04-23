'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const { getAdapter, listAdapters } = require('../../lib/adapters/index.cjs');
const { buildInstallPlan } = require('../../lib/viepilot-install.cjs');

const REPO_ROOT = path.join(__dirname, '..', '..');

// ──────────────────────────────────────────────────────────────────────────────
// Group 1: Adapter shape
// ──────────────────────────────────────────────────────────────────────────────
describe('FEAT-014: Antigravity adapter shape', () => {
  test('antigravity adapter has all required fields', () => {
    const a = getAdapter('antigravity');
    expect(a.id).toBe('antigravity');
    expect(a.name).toBe('Antigravity');
    expect(typeof a.skillsDir).toBe('function');
    expect(typeof a.viepilotDir).toBe('function');
    expect(typeof a.executionContextBase).toBe('string');
    expect(typeof a.postInstallHint).toBe('string');
    expect(a.hooks).toBeTruthy();
    expect(Array.isArray(a.installSubdirs)).toBe(true);
    expect(typeof a.isAvailable).toBe('function');
  });

  test('antigravity skillsDir(home) returns .gemini/antigravity/skills path (BUG-021)', () => {
    const a = getAdapter('antigravity');
    const dir = a.skillsDir('/fake/home');
    expect(dir).toContain(path.join('.gemini', 'antigravity', 'skills'));
  });

  test('antigravity viepilotDir(home) returns .gemini/antigravity/viepilot path (BUG-021)', () => {
    const a = getAdapter('antigravity');
    const dir = a.viepilotDir('/fake/home');
    expect(dir).toContain(path.join('.gemini', 'antigravity', 'viepilot'));
  });

  test('antigravity executionContextBase is .gemini/antigravity/viepilot (BUG-021)', () => {
    const a = getAdapter('antigravity');
    expect(a.executionContextBase).toBe('.gemini/antigravity/viepilot');
  });

  test('antigravity has no pathRewrite field (ENH-035 clean shape)', () => {
    const a = getAdapter('antigravity');
    expect(a.pathRewrite).toBeUndefined();
  });

  test('antigravity hooks.configFile is null (no hooks system)', () => {
    const a = getAdapter('antigravity');
    expect(a.hooks.configFile).toBeNull();
    expect(a.hooks.supportedEvents).toEqual([]);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Group 2: Registry
// ──────────────────────────────────────────────────────────────────────────────
describe('FEAT-014: Antigravity registry', () => {
  test('getAdapter("antigravity") resolves without error', () => {
    expect(() => getAdapter('antigravity')).not.toThrow();
    expect(getAdapter('antigravity').id).toBe('antigravity');
  });

  test('listAdapters() contains antigravity (among 4 unique adapters)', () => {
    const list = listAdapters();
    const ids = list.map((a) => a.id);
    expect(ids).toContain('claude-code');
    expect(ids).toContain('cursor');
    expect(ids).toContain('antigravity');
    expect(list.length).toBe(5);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Group 3: Install plan
// ──────────────────────────────────────────────────────────────────────────────
describe('FEAT-014: Antigravity install plan', () => {
  test('buildInstallPlan with installTargets:["antigravity"] → paths.skillsDir contains .gemini/antigravity (BUG-021)', () => {
    const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-ag-'));
    const plan = buildInstallPlan(
      REPO_ROOT,
      { VIEPILOT_AUTO_YES: '1' },
      { overrideHomedir: fakeHome, wantPathShim: false, installTargets: ['antigravity'] },
    );
    expect(plan.paths.skillsDir).toContain(path.join('.gemini', 'antigravity'));
    expect(plan.paths.viepilotDir).toContain(path.join('.gemini', 'antigravity'));
  });

  test('antigravity install plan resolves {envToolDir} → .gemini/antigravity/viepilot (BUG-021 + ENH-035)', () => {
    const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-ag-rw-'));
    const plan = buildInstallPlan(
      REPO_ROOT,
      { VIEPILOT_AUTO_YES: '1' },
      { overrideHomedir: fakeHome, wantPathShim: false, installTargets: ['antigravity'] },
    );
    const rewrite = plan.steps.find((s) => s.kind === 'rewrite_paths_in_dir');
    expect(rewrite).toBeDefined();
    expect(rewrite.from).toBe('{envToolDir}');
    expect(rewrite.to).toBe('.gemini/antigravity/viepilot');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Group 4: isAvailable (BUG-021)
// ──────────────────────────────────────────────────────────────────────────────
describe('BUG-021: Antigravity isAvailable path detection', () => {
  test('isAvailable returns true when .gemini/antigravity/ exists (new path)', () => {
    const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-ag-new-'));
    fs.mkdirSync(path.join(fakeHome, '.gemini', 'antigravity'), { recursive: true });
    const a = getAdapter('antigravity');
    expect(a.isAvailable(fakeHome)).toBe(true);
    fs.rmSync(fakeHome, { recursive: true, force: true });
  });

  test('isAvailable returns true when .antigravity/ exists (old path fallback)', () => {
    const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-ag-old-'));
    fs.mkdirSync(path.join(fakeHome, '.antigravity'), { recursive: true });
    const a = getAdapter('antigravity');
    expect(a.isAvailable(fakeHome)).toBe(true);
    fs.rmSync(fakeHome, { recursive: true, force: true });
  });

  test('isAvailable returns false when neither directory exists', () => {
    const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-ag-none-'));
    const a = getAdapter('antigravity');
    expect(a.isAvailable(fakeHome)).toBe(false);
    fs.rmSync(fakeHome, { recursive: true, force: true });
  });
});

