/**
 * @jest-environment node
 *
 * Contract tests for FEAT-013: dynamic adapter system
 * Tests: adapter interface shape, registry, install plan paths
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

const { getAdapter, listAdapters, adapters: adapterMap } = require('../../lib/adapters/index.cjs');
const { buildInstallPlan } = require('../../lib/viepilot-install.cjs');

const REPO_ROOT = path.join(__dirname, '..', '..');

// ──────────────────────────────────────────────────────────────────────────────
// Group 1: Adapter interface shape
// ──────────────────────────────────────────────────────────────────────────────
describe('FEAT-013: Adapter interface shape', () => {
  test('claude-code adapter has all required fields', () => {
    const a = getAdapter('claude-code');
    expect(a.id).toBe('claude-code');
    expect(a.name).toBe('Claude Code');
    expect(typeof a.skillsDir).toBe('function');
    expect(typeof a.viepilotDir).toBe('function');
    expect(typeof a.executionContextBase).toBe('string');
    expect(typeof a.postInstallHint).toBe('string');
    expect(a.hooks).toBeTruthy();
    expect(Array.isArray(a.installSubdirs)).toBe(true);
    expect(typeof a.isAvailable).toBe('function');
  });

  test('claude-code skillsDir(home) returns path containing .claude', () => {
    const a = getAdapter('claude-code');
    const dir = a.skillsDir('/fake/home');
    expect(dir).toContain('.claude');
  });

  test('claude-code viepilotDir(home) returns path containing .claude/viepilot', () => {
    const a = getAdapter('claude-code');
    const dir = a.viepilotDir('/fake/home');
    expect(dir).toContain(path.join('.claude', 'viepilot'));
  });

  test('cursor adapter has all required fields', () => {
    const a = getAdapter('cursor');
    expect(a.id).toBe('cursor');
    expect(a.name).toBe('Cursor');
    expect(typeof a.skillsDir).toBe('function');
    expect(typeof a.viepilotDir).toBe('function');
    expect(typeof a.executionContextBase).toBe('string');
    expect(typeof a.postInstallHint).toBe('string');
    expect(Array.isArray(a.installSubdirs)).toBe(true);
    expect(typeof a.isAvailable).toBe('function');
  });

  test('cursor skillsDir(home) returns path containing .cursor', () => {
    const a = getAdapter('cursor');
    const dir = a.skillsDir('/fake/home');
    expect(dir).toContain('.cursor');
  });

  test('cursor adapter has hooks.configFile === null (no settings.json)', () => {
    const a = getAdapter('cursor');
    expect(a.hooks.configFile).toBeNull();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Group 2: Adapter registry
// ──────────────────────────────────────────────────────────────────────────────
describe('FEAT-013: Adapter registry', () => {
  test('getAdapter("claude-code") returns claude-code adapter', () => {
    const a = getAdapter('claude-code');
    expect(a.id).toBe('claude-code');
  });

  test('getAdapter("cursor-agent") returns cursor adapter', () => {
    const a = getAdapter('cursor-agent');
    expect(a.id).toBe('cursor');
  });

  test('getAdapter("cursor-ide") returns cursor adapter', () => {
    const a = getAdapter('cursor-ide');
    expect(a.id).toBe('cursor');
  });

  test('getAdapter("unknown") throws error mentioning "Unknown adapter"', () => {
    expect(() => getAdapter('unknown-agent')).toThrow(/Unknown adapter/);
  });

  test('listAdapters() returns deduplicated list (cursor-agent + cursor-ide = 1 cursor entry)', () => {
    const list = listAdapters();
    expect(Array.isArray(list)).toBe(true);
    // Should have claude-code + cursor = 2 unique adapters
    const ids = list.map((a) => a.id);
    expect(ids).toContain('claude-code');
    expect(ids).toContain('cursor');
    // cursor-agent and cursor-ide are aliases — should NOT appear as separate entries
    expect(ids.filter((id) => id === 'cursor').length).toBe(1);
    // 4 unique adapters: claude-code, cursor, antigravity (FEAT-014), codex (FEAT-015)
    expect(list.length).toBe(4);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Group 3: Install plan adapter-driven
// ──────────────────────────────────────────────────────────────────────────────
describe('FEAT-013: Install plan adapter-driven', () => {
  test('buildInstallPlan with installTargets:["claude-code"] → paths.skillsDir contains .claude', () => {
    const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-a-cc-'));
    const plan = buildInstallPlan(
      REPO_ROOT,
      { VIEPILOT_AUTO_YES: '1' },
      { overrideHomedir: fakeHome, wantPathShim: false, installTargets: ['claude-code'] },
    );
    expect(plan.paths.skillsDir).toContain('.claude');
    expect(plan.paths.viepilotDir).toContain('.claude');
  });

  test('buildInstallPlan with installTargets:["cursor-agent"] → paths.skillsDir contains .cursor', () => {
    const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-a-cur-'));
    const plan = buildInstallPlan(
      REPO_ROOT,
      { VIEPILOT_AUTO_YES: '1' },
      { overrideHomedir: fakeHome, wantPathShim: false, installTargets: ['cursor-agent'] },
    );
    expect(plan.paths.skillsDir).toContain('.cursor');
    expect(plan.paths.viepilotDir).toContain('.cursor');
  });

  test('buildInstallPlan with [] (empty targets) defaults to claude-code paths', () => {
    const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-a-def-'));
    const plan = buildInstallPlan(
      REPO_ROOT,
      { VIEPILOT_AUTO_YES: '1' },
      { overrideHomedir: fakeHome, wantPathShim: false, installTargets: [] },
    );
    expect(plan.paths.skillsDir).toContain('.claude');
    expect(plan.paths.claudeSkillsDir).toContain('.claude');
  });

  test('buildInstallPlan with ["claude-code","cursor-agent"] → steps include both .claude and .cursor dirs', () => {
    const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-a-both-'));
    const plan = buildInstallPlan(
      REPO_ROOT,
      { VIEPILOT_AUTO_YES: '1' },
      { overrideHomedir: fakeHome, wantPathShim: false, installTargets: ['claude-code', 'cursor-agent'] },
    );
    const hasClaude = plan.steps.some((s) => s.kind === 'mkdir' && typeof s.path === 'string' && s.path.includes('.claude'));
    const hasCursor = plan.steps.some((s) => s.kind === 'mkdir' && typeof s.path === 'string' && s.path.includes('.cursor'));
    expect(hasClaude).toBe(true);
    expect(hasCursor).toBe(true);
  });

  test('steps do NOT contain .cursor/skills when only claude-code target used', () => {
    const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-a-nocur-'));
    const plan = buildInstallPlan(
      REPO_ROOT,
      { VIEPILOT_AUTO_YES: '1' },
      { overrideHomedir: fakeHome, wantPathShim: false, installTargets: ['claude-code'] },
    );
    const cursorSkills = path.join(path.resolve(fakeHome), '.cursor', 'skills');
    const hasCursorSkills = plan.steps.some(
      (s) => s.kind === 'mkdir' && typeof s.path === 'string' && s.path === cursorSkills
    );
    expect(hasCursorSkills).toBe(false);
  });

  test('steps include {envToolDir} substitution step for claude-code target (ENH-035)', () => {
    const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-a-rw-'));
    const plan = buildInstallPlan(
      REPO_ROOT,
      { VIEPILOT_AUTO_YES: '1' },
      { overrideHomedir: fakeHome, wantPathShim: false, installTargets: ['claude-code'] },
    );
    const rewrite = plan.steps.find((s) => s.kind === 'rewrite_paths_in_dir');
    expect(rewrite).toBeDefined();
    expect(rewrite.from).toBe('{envToolDir}');
    expect(rewrite.to).toBe('.claude/viepilot');
  });

  test('steps include {envToolDir} substitution step for cursor target (ENH-035)', () => {
    const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-a-rw-cur-'));
    const plan = buildInstallPlan(
      REPO_ROOT,
      { VIEPILOT_AUTO_YES: '1' },
      { overrideHomedir: fakeHome, wantPathShim: false, installTargets: ['cursor-agent'] },
    );
    const rewrite = plan.steps.find((s) => s.kind === 'rewrite_paths_in_dir');
    expect(rewrite).toBeDefined();
    expect(rewrite.from).toBe('{envToolDir}');
    expect(rewrite.to).toBe('.cursor/viepilot');
  });
});

