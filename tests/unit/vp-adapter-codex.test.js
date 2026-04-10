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
describe('FEAT-015: Codex adapter shape', () => {
  test('codex adapter has all required fields', () => {
    const a = getAdapter('codex');
    expect(a.id).toBe('codex');
    expect(a.name).toBe('Codex');
    expect(typeof a.skillsDir).toBe('function');
    expect(typeof a.viepilotDir).toBe('function');
    expect(typeof a.executionContextBase).toBe('string');
    expect(typeof a.postInstallHint).toBe('string');
    expect(a.hooks).toBeTruthy();
    expect(Array.isArray(a.installSubdirs)).toBe(true);
    expect(typeof a.isAvailable).toBe('function');
  });

  test('codex skillsDir(home) returns .codex/skills path', () => {
    const a = getAdapter('codex');
    const dir = a.skillsDir('/fake/home');
    expect(dir).toContain('.codex');
    expect(dir).toContain('skills');
  });

  test('codex viepilotDir(home) returns .codex/viepilot path', () => {
    const a = getAdapter('codex');
    const dir = a.viepilotDir('/fake/home');
    expect(dir).toContain(path.join('.codex', 'viepilot'));
  });

  test('codex executionContextBase is .codex/viepilot', () => {
    const a = getAdapter('codex');
    expect(a.executionContextBase).toBe('.codex/viepilot');
  });

  test('codex has no pathRewrite field (ENH-035 clean shape)', () => {
    const a = getAdapter('codex');
    expect(a.pathRewrite).toBeUndefined();
  });

  test('codex postInstallHint uses $vp-status syntax (not /vp-status)', () => {
    const a = getAdapter('codex');
    expect(a.postInstallHint).toContain('$vp-status');
    expect(a.postInstallHint).not.toMatch(/^- \//);
  });

  test('codex hooks.configFile is null (no programmatic hooks)', () => {
    const a = getAdapter('codex');
    expect(a.hooks.configFile).toBeNull();
    expect(a.hooks.supportedEvents).toEqual([]);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Group 2: Registry
// ──────────────────────────────────────────────────────────────────────────────
describe('FEAT-015: Codex registry', () => {
  test('getAdapter("codex") resolves without error', () => {
    expect(() => getAdapter('codex')).not.toThrow();
    expect(getAdapter('codex').id).toBe('codex');
  });

  test('listAdapters() returns 4 unique adapters (claude-code, cursor, antigravity, codex)', () => {
    const list = listAdapters();
    const ids = list.map((a) => a.id);
    expect(ids).toContain('claude-code');
    expect(ids).toContain('cursor');
    expect(ids).toContain('antigravity');
    expect(ids).toContain('codex');
    expect(list.length).toBe(4);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Group 3: Install plan
// ──────────────────────────────────────────────────────────────────────────────
describe('FEAT-015: Codex install plan', () => {
  test('buildInstallPlan with installTargets:["codex"] → paths.skillsDir contains .codex', () => {
    const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-cx-'));
    const plan = buildInstallPlan(
      REPO_ROOT,
      { VIEPILOT_AUTO_YES: '1' },
      { overrideHomedir: fakeHome, wantPathShim: false, installTargets: ['codex'] },
    );
    expect(plan.paths.skillsDir).toContain('.codex');
    expect(plan.paths.viepilotDir).toContain('.codex');
  });

  test('codex install plan resolves {envToolDir} → .codex/viepilot (ENH-035)', () => {
    const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-cx-rw-'));
    const plan = buildInstallPlan(
      REPO_ROOT,
      { VIEPILOT_AUTO_YES: '1' },
      { overrideHomedir: fakeHome, wantPathShim: false, installTargets: ['codex'] },
    );
    const rewrite = plan.steps.find((s) => s.kind === 'rewrite_paths_in_dir');
    expect(rewrite).toBeDefined();
    expect(rewrite.from).toBe('{envToolDir}');
    expect(rewrite.to).toBe('.codex/viepilot');
  });
});
