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
