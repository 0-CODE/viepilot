'use strict';
const adapter = require('../../lib/adapters/zed.cjs');
const { getAdapter, listAdapters } = require('../../lib/adapters/index.cjs');
const { getAdapterContext, listAdapterIds } = require('../../lib/adapter-context.cjs');
const { buildInstallPlan } = require('../../lib/viepilot-install.cjs');
const path = require('path');
const fs = require('fs');
const os = require('os');

const REPO_ROOT = path.join(__dirname, '..', '..');

describe('Zed adapter', () => {
  test('zed adapter has id === "zed"', () => {
    expect(adapter.id).toBe('zed');
  });

  test('zed adapter has name === "Zed"', () => {
    expect(adapter.name).toBe('Zed');
  });

  test('skillsDir returns path under ~/.agents/skills', () => {
    expect(adapter.skillsDir('/test/home')).toBe(path.join('/test/home', '.agents', 'skills'));
  });

  test('viepilotDir returns path under ~/.agents/viepilot', () => {
    expect(adapter.viepilotDir('/test/home')).toBe(path.join('/test/home', '.agents', 'viepilot'));
  });

  test('executionContextBase is ".agents/viepilot"', () => {
    expect(adapter.executionContextBase).toBe('.agents/viepilot');
  });

  test('projectSkillsDir is .agents/skills (shared with Antigravity project path)', () => {
    expect(adapter.projectSkillsDir).toBe('.agents/skills');
  });

  test('postInstallHint mentions /vp-status and Zed', () => {
    expect(adapter.postInstallHint).toMatch(/vp-status/);
    expect(adapter.postInstallHint).toMatch(/Zed/);
  });

  test('hooks.schema === "zed" and configFile is null', () => {
    expect(adapter.hooks.schema).toBe('zed');
    expect(adapter.hooks.configFile).toBeNull();
    expect(adapter.hooks.supportedEvents).toEqual([]);
  });

  test('isAvailable returns boolean', () => {
    expect(typeof adapter.isAvailable).toBe('function');
    expect(typeof adapter.isAvailable('/nonexistent/fake/home')).toBe('boolean');
  });

  test('isAvailable detects ~/.config/zed', () => {
    const home = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-zed-avail-'));
    fs.mkdirSync(path.join(home, '.config', 'zed'), { recursive: true });
    expect(adapter.isAvailable(home)).toBe(true);
  });

  test('getAdapter("zed") returns zed adapter', () => {
    expect(getAdapter('zed').id).toBe('zed');
  });

  test('listAdapters() includes zed', () => {
    expect(listAdapters().map(a => a.id)).toContain('zed');
  });

  test('ADAPTER_CONTEXT tools.shell is terminal', () => {
    expect(getAdapterContext('zed').tools.shell).toBe('terminal');
  });

  test('ADAPTER_CONTEXT tools.agent is spawn_agent', () => {
    expect(getAdapterContext('zed').tools.agent).toBe('spawn_agent');
  });

  test('ADAPTER_CONTEXT orchestration.parallel is false', () => {
    expect(getAdapterContext('zed').orchestration.parallel).toBe(false);
  });

  test('ADAPTER_CONTEXT skill_path_global is ~/.agents/skills', () => {
    expect(getAdapterContext('zed').skill_path_global).toBe('~/.agents/skills');
  });

  test('listAdapterIds includes zed', () => {
    expect(listAdapterIds()).toContain('zed');
  });

  test('buildInstallPlan --target zed writes to .agents/skills', () => {
    const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-zed-plan-'));
    const plan = buildInstallPlan(
      REPO_ROOT,
      { VIEPILOT_AUTO_YES: '1' },
      { overrideHomedir: fakeHome, wantPathShim: false, installTargets: ['zed'] },
    );
    expect(plan.paths.skillsDir).toContain(path.join('.agents', 'skills'));
    expect(plan.paths.viepilotDir).toContain(path.join('.agents', 'viepilot'));
    const rewrite = plan.steps.find((s) => s.kind === 'rewrite_paths_in_dir');
    expect(rewrite.to).toBe('.agents/viepilot');
  });

  test('all SKILL.md files have zed adapter block', () => {
    const skillsDir = path.join(REPO_ROOT, 'skills');
    const dirs = fs.readdirSync(skillsDir).filter(d =>
      fs.existsSync(path.join(skillsDir, d, 'SKILL.md'))
    );
    const missing = dirs.filter(d => {
      const src = fs.readFileSync(path.join(skillsDir, d, 'SKILL.md'), 'utf8');
      return !src.includes('<adapter id="zed">');
    });
    expect(missing).toEqual([]);
  });

  test('zed adapter blocks reference terminal and spawn_agent', () => {
    const src = fs.readFileSync(path.join(REPO_ROOT, 'skills', 'vp-status', 'SKILL.md'), 'utf8');
    const start = src.indexOf('<adapter id="zed">');
    const end = src.indexOf('</adapter>', start);
    const block = src.slice(start, end);
    expect(block).toMatch(/terminal/);
    expect(block).toMatch(/spawn_agent/);
    expect(block).toMatch(/~\/\.agents\/skills/);
  });

  test('adapters.md documents Zed', () => {
    const content = fs.readFileSync(path.join(REPO_ROOT, 'docs/user/features/adapters.md'), 'utf8');
    expect(content).toMatch(/`zed`/);
    expect(content).toMatch(/~\/\.agents\/skills/);
    expect(content).toMatch(/viepilot install --target zed/);
  });
});
