/**
 * @jest-environment node
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  validateViepilotPackageRoot,
  buildInstallPlan,
  formatPlanLines,
  normalizeInstallEnv,
  listSkillDirNames,
  applyInstallPlan,
} = require('../../lib/viepilot-install.cjs');

const REPO_ROOT = path.join(__dirname, '..', '..');

describe('viepilot-install plan (28.1 scaffold)', () => {
  test('validateViepilotPackageRoot accepts repo root', () => {
    expect(() => validateViepilotPackageRoot(REPO_ROOT)).not.toThrow();
  });

  test('validateViepilotPackageRoot rejects empty temp dir', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-install-'));
    expect(() => validateViepilotPackageRoot(dir)).toThrow();
  });

  test('listSkillDirNames returns vp-* style folders', () => {
    const names = listSkillDirNames(REPO_ROOT);
    expect(names.some((n) => n.startsWith('vp-'))).toBe(true);
  });

  test('buildInstallPlan includes mkdir, bin copies, and cloc note', () => {
    const plan = buildInstallPlan(
      REPO_ROOT,
      { VIEPILOT_AUTO_YES: '1', VIEPILOT_INSTALL_PROFILE: 'cursor-agent' },
      { wantPathShim: false },
    );
    expect(plan.version).toBe(1);
    expect(plan.env.profile).toBe('cursor-agent');
    expect(plan.steps.some((s) => s.kind === 'mkdir' && s.path.includes('.cursor'))).toBe(true);
    expect(
      plan.steps.some(
        (s) =>
          s.kind === 'copy_file' &&
          s.from.endsWith(`vp-tools.cjs`) &&
          s.to.includes('.cursor') &&
          s.to.includes('vp-tools.cjs'),
      ),
    ).toBe(true);
    expect(plan.steps.some((s) => s.kind === 'note' && s.id === 'cloc_optional')).toBe(true);
  });

  test('symlink_skills env adds symlink_dir steps', () => {
    const plan = buildInstallPlan(
      REPO_ROOT,
      {
        VIEPILOT_AUTO_YES: '1',
        VIEPILOT_SYMLINK_SKILLS: '1',
      },
      { wantPathShim: false },
    );
    expect(plan.steps.some((s) => s.kind === 'symlink_dir')).toBe(true);
    expect(plan.steps.some((s) => s.kind === 'copy_dir' && s.from.includes(`${path.sep}skills${path.sep}`))).toBe(
      false,
    );
  });

  test('wantPathShim adds path_shim step', () => {
    const plan = buildInstallPlan(REPO_ROOT, { VIEPILOT_AUTO_YES: '1' }, { wantPathShim: true });
    expect(plan.steps.some((s) => s.kind === 'path_shim')).toBe(true);
  });

  test('formatPlanLines returns non-empty strings', () => {
    const plan = buildInstallPlan(REPO_ROOT, { VIEPILOT_AUTO_YES: '1' }, { wantPathShim: false });
    const lines = formatPlanLines(plan);
    expect(lines.length).toBeGreaterThan(5);
    expect(lines.some((l) => l.includes('copy'))).toBe(true);
  });

  test('normalizeInstallEnv defaults', () => {
    const e = normalizeInstallEnv({});
    expect(e.profile).toBe('cursor-ide');
    expect(e.autoYes).toBe(false);
  });
});

describe('viepilot-install apply (28.2)', () => {
  test('applyInstallPlan dry-run does not create ~/.cursor under fake home', () => {
    const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-dry-'));
    const plan = buildInstallPlan(
      REPO_ROOT,
      { VIEPILOT_AUTO_YES: '1' },
      { overrideHomedir: fakeHome, wantPathShim: false },
    );
    const r = applyInstallPlan(plan, { dryRun: true });
    expect(r.ok).toBe(true);
    expect(fs.existsSync(path.join(fakeHome, '.cursor'))).toBe(false);
  });

  test('applyInstallPlan copies CLI into fake HOME', () => {
    const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-apply-'));
    const plan = buildInstallPlan(
      REPO_ROOT,
      { VIEPILOT_AUTO_YES: '1' },
      { overrideHomedir: fakeHome, wantPathShim: false },
    );
    const r = applyInstallPlan(plan, { dryRun: false });
    expect(r.ok).toBe(true);
    const bin = path.join(fakeHome, '.cursor', 'viepilot', 'bin', 'vp-tools.cjs');
    expect(fs.existsSync(bin)).toBe(true);
    expect(fs.readFileSync(bin, 'utf8').length).toBeGreaterThan(10);
  });

  test('overrideHomedir paths appear in plan', () => {
    const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-home-'));
    const plan = buildInstallPlan(REPO_ROOT, { VIEPILOT_AUTO_YES: '1' }, { overrideHomedir: fakeHome });
    expect(plan.home).toBe(path.resolve(fakeHome));
    expect(plan.paths.viepilotDir.startsWith(path.resolve(fakeHome))).toBe(true);
  });
});
