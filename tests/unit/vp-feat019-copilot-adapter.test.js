'use strict';
const adapter = require('../../lib/adapters/copilot.cjs');
const { getAdapter, listAdapters } = require('../../lib/adapters/index.cjs');
const path = require('path');
const fs = require('fs');

describe('FEAT-019: GitHub Copilot Adapter', () => {
  // Adapter identity
  test('copilot adapter has id === "copilot"', () => {
    expect(adapter.id).toBe('copilot');
  });

  test('copilot adapter has name === "GitHub Copilot"', () => {
    expect(adapter.name).toBe('GitHub Copilot');
  });

  // Path resolution
  test('skillsDir returns path under ~/.config/gh-copilot/skills', () => {
    const home = '/test/home';
    expect(adapter.skillsDir(home)).toBe(path.join('/test/home', '.config', 'gh-copilot', 'skills'));
  });

  test('viepilotDir returns path under ~/.config/gh-copilot/viepilot', () => {
    const home = '/test/home';
    expect(adapter.viepilotDir(home)).toBe(path.join('/test/home', '.config', 'gh-copilot', 'viepilot'));
  });

  test('executionContextBase is ".config/gh-copilot/viepilot"', () => {
    expect(adapter.executionContextBase).toBe('.config/gh-copilot/viepilot');
  });

  // Post-install hint
  test('postInstallHint mentions /vp-status and Copilot Chat', () => {
    expect(adapter.postInstallHint).toMatch(/vp-status/);
    expect(adapter.postInstallHint).toMatch(/[Cc]opilot/);
  });

  // Hooks
  test('hooks.schema === "copilot"', () => {
    expect(adapter.hooks.schema).toBe('copilot');
  });

  test('hooks.configFile is null (no programmatic hooks)', () => {
    expect(adapter.hooks.configFile).toBeNull();
  });

  test('hooks.supportedEvents is an empty array', () => {
    expect(adapter.hooks.supportedEvents).toEqual([]);
  });

  // isAvailable
  test('isAvailable is a function', () => {
    expect(typeof adapter.isAvailable).toBe('function');
  });

  test('isAvailable returns boolean', () => {
    const result = adapter.isAvailable('/nonexistent/fake/home');
    expect(typeof result).toBe('boolean');
  });

  // installSubdirs
  test('installSubdirs includes agents', () => {
    expect(adapter.installSubdirs).toContain('agents');
  });

  // Registry
  test('getAdapter("copilot") returns copilot adapter', () => {
    const a = getAdapter('copilot');
    expect(a.id).toBe('copilot');
  });

  test('listAdapters() includes copilot', () => {
    const ids = listAdapters().map(a => a.id);
    expect(ids).toContain('copilot');
  });

  // SKILL.md coverage — only 4 of 17 have adapter compatibility tables
  // (vp-request, vp-evolve, vp-brainstorm, vp-crystallize)
  test('adapter-table SKILL.md files include GitHub Copilot row', () => {
    const adapterTableSkills = ['vp-request', 'vp-evolve', 'vp-brainstorm', 'vp-crystallize'];
    const missing = adapterTableSkills.filter(skill => {
      const skillMd = path.join(__dirname, '../../skills', skill, 'SKILL.md');
      if (!fs.existsSync(skillMd)) return true;
      return !fs.readFileSync(skillMd, 'utf8').includes('GitHub Copilot');
    });
    expect(missing).toHaveLength(0);
  });

  // docs
  test('adapters.md documents GitHub Copilot section', () => {
    const adaptersMd = path.join(__dirname, '../../docs/user/features/adapters.md');
    const content = fs.readFileSync(adaptersMd, 'utf8');
    expect(content).toMatch(/GitHub Copilot/);
    expect(content).toMatch(/gh-copilot/);
    expect(content).toMatch(/copilot/);
  });
});
