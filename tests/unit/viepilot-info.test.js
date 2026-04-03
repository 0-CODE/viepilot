const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  resolveViepilotPackageRoot,
  readInstalledVersion,
  parseSkillFileVersion,
  listSkillsWithVersions,
  listWorkflows,
  buildInfoReport,
  WORKFLOW_SEMVER_NOTE,
} = require('../../lib/viepilot-info.cjs');

const repoRoot = path.join(__dirname, '..', '..');

describe('viepilot-info', () => {
  test('resolveViepilotPackageRoot finds repo from lib/tests location', () => {
    const root = resolveViepilotPackageRoot(path.join(__dirname, '..', '..'));
    expect(root).toBe(path.resolve(repoRoot));
  });

  test('readInstalledVersion reads package.json', () => {
    const v = readInstalledVersion(repoRoot);
    expect(v).toMatch(/^\d+\.\d+\.\d+/);
  });

  test('parseSkillFileVersion reads YAML frontmatter', () => {
    expect(
      parseSkillFileVersion(`---
name: x
version: 1.2.3
---
body`)
    ).toBe('1.2.3');
    expect(parseSkillFileVersion('no frontmatter')).toBe('unspecified');
  });

  test('listSkillsWithVersions returns sorted ids with versions', () => {
    const skills = listSkillsWithVersions(repoRoot);
    expect(skills.length).toBeGreaterThan(0);
    expect(skills.some((s) => s.id === 'vp-auto')).toBe(true);
    skills.forEach((s) => {
      expect(s).toHaveProperty('relativePath');
      expect(s.version).toBeTruthy();
    });
  });

  test('listSkillsWithVersions falls back to ~/.cursor/skills when bundle has no vp-* skills', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-info-fallback-'));
    const homedirSpy = jest.spyOn(os, 'homedir').mockReturnValue(tmp);
    try {
      fs.mkdirSync(path.join(tmp, '.cursor', 'skills', 'vp-fallback-test'), { recursive: true });
      fs.writeFileSync(
        path.join(tmp, '.cursor', 'skills', 'vp-fallback-test', 'SKILL.md'),
        '---\nversion: 8.8.8\n---\n',
        'utf8',
      );
      const bundle = fs.mkdtempSync(path.join(tmp, 'bundle-'));
      fs.writeFileSync(
        path.join(bundle, 'package.json'),
        JSON.stringify({ name: 'viepilot', version: '0.0.0-test' }),
        'utf8',
      );
      const skills = listSkillsWithVersions(bundle);
      expect(skills.some((s) => s.id === 'vp-fallback-test' && s.version === '8.8.8')).toBe(true);
    } finally {
      homedirSpy.mockRestore();
    }
  });

  test('listSkillsWithVersions falls back to ~/.codex/skills when Cursor/Claude skills are absent', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-info-codex-fallback-'));
    const homedirSpy = jest.spyOn(os, 'homedir').mockReturnValue(tmp);
    try {
      fs.mkdirSync(path.join(tmp, '.codex', 'skills', 'vp-codex-test'), { recursive: true });
      fs.writeFileSync(
        path.join(tmp, '.codex', 'skills', 'vp-codex-test', 'SKILL.md'),
        '---\nversion: 9.9.9\n---\n',
        'utf8',
      );
      const bundle = fs.mkdtempSync(path.join(tmp, 'bundle-'));
      fs.writeFileSync(
        path.join(bundle, 'package.json'),
        JSON.stringify({ name: 'viepilot', version: '0.0.0-test' }),
        'utf8',
      );
      const skills = listSkillsWithVersions(bundle);
      expect(skills.some((s) => s.id === 'vp-codex-test' && s.version === '9.9.9')).toBe(true);
    } finally {
      homedirSpy.mockRestore();
    }
  });

  test('listWorkflows uses semver policy note', () => {
    const wfs = listWorkflows(repoRoot);
    expect(wfs.length).toBeGreaterThan(0);
    expect(wfs.every((w) => w.semverInFile === null && w.note === WORKFLOW_SEMVER_NOTE)).toBe(true);
  });

  test('buildInfoReport has required keys', () => {
    const report = buildInfoReport(repoRoot);
    expect(report.packageRoot).toBe(path.resolve(repoRoot));
    expect(report).toHaveProperty('packageName', 'viepilot');
    expect(report).toHaveProperty('installedVersion');
    expect(report.latestNpm).toHaveProperty('ok');
    expect(Array.isArray(report.skills)).toBe(true);
    expect(Array.isArray(report.workflows)).toBe(true);
  });
});
