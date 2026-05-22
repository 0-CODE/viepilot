'use strict';
const path = require('path');

const adapter = require('../../lib/adapters/antigravity.cjs');

describe('Phase 131 — FEAT-021: Antigravity adapter path fix + deprecation notice', () => {

  test('projectSkillsDir is .agents/skills', () => {
    expect(adapter.projectSkillsDir).toBe('.agents/skills');
  });

  test('deprecationNotice exists and mentions deprecation', () => {
    expect(typeof adapter.deprecationNotice).toBe('string');
    expect(adapter.deprecationNotice.length).toBeGreaterThan(0);
    expect(adapter.deprecationNotice).toMatch(/deprecated/i);
  });

  test('deprecationNotice mentions Gemini CLI and June 2026', () => {
    expect(adapter.deprecationNotice).toMatch(/Gemini CLI/);
    expect(adapter.deprecationNotice).toMatch(/2026/);
  });

  test('deprecationNotice mentions .agents/skills/ project path', () => {
    expect(adapter.deprecationNotice).toMatch(/\.agents\/skills\//);
  });

  test('hooks.supportedEvents has 3 events', () => {
    expect(Array.isArray(adapter.hooks.supportedEvents)).toBe(true);
    expect(adapter.hooks.supportedEvents).toHaveLength(3);
    expect(adapter.hooks.supportedEvents).toContain('before_tool');
    expect(adapter.hooks.supportedEvents).toContain('after_file_edit');
    expect(adapter.hooks.supportedEvents).toContain('session_start');
  });

  test('isAvailable checks .agents directory (project-level)', () => {
    // isAvailable should find .agents in cwd — check it checks process.cwd()/.agents
    const src = require('fs').readFileSync(
      path.join(__dirname, '../../lib/adapters/antigravity.cjs'), 'utf8'
    );
    expect(src).toMatch(/\.agents/);
    expect(src).toMatch(/process\.cwd\(\)/);
  });

  test('isAvailable returns true when .agents dir exists in cwd', () => {
    const os = require('os');
    const fs = require('fs');
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-test-'));
    const agentsDir = path.join(tmpDir, '.agents');
    fs.mkdirSync(agentsDir);

    // Mock process.cwd to return tmpDir
    const origCwd = process.cwd;
    process.cwd = () => tmpDir;
    try {
      expect(adapter.isAvailable('/nonexistent-home-12345')).toBe(true);
    } finally {
      process.cwd = origCwd;
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('deprecationNotice mentions Antigravity CLI as successor', () => {
    expect(adapter.deprecationNotice).toMatch(/Antigravity/);
  });

});
