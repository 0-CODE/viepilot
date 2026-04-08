/**
 * @jest-environment node
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
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
    expect(e.profile).toBe('claude-code');
    expect(e.autoYes).toBe(false);
  });

  test('overrideHomedir paths appear in plan', () => {
    const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-home-'));
    const plan = buildInstallPlan(REPO_ROOT, { VIEPILOT_AUTO_YES: '1' }, { overrideHomedir: fakeHome });
    expect(plan.home).toBe(path.resolve(fakeHome));
    expect(plan.paths.viepilotDir.startsWith(path.resolve(fakeHome))).toBe(true);
  });

  test('buildInstallPlan includes ~/.viepilot profiles + profile-map seed (FEAT-009)', () => {
    const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-fe009-'));
    const plan = buildInstallPlan(
      REPO_ROOT,
      { VIEPILOT_AUTO_YES: '1' },
      { overrideHomedir: fakeHome, wantPathShim: false },
    );
    const ud = path.join(path.resolve(fakeHome), '.viepilot');
    expect(plan.paths.viepilotUserDataDir).toBe(ud);
    expect(plan.paths.viepilotProfilesDir).toBe(path.join(ud, 'profiles'));
    expect(plan.paths.viepilotProfileMapPath).toBe(path.join(ud, 'profile-map.md'));
    expect(
      plan.steps.some((s) => s.kind === 'mkdir' && s.path === plan.paths.viepilotProfilesDir),
    ).toBe(true);
    const w = plan.steps.find((s) => s.kind === 'write_file_if_missing');
    expect(w).toBeDefined();
    expect(w.path).toBe(plan.paths.viepilotProfileMapPath);
    expect(w.content).toMatch(/profile_id/);
  });

  test('buildInstallPlan without installTargets defaults to claude-code (FEAT-013)', () => {
    const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-default-claude-'));
    const plan = buildInstallPlan(
      REPO_ROOT,
      { VIEPILOT_AUTO_YES: '1' },
      { overrideHomedir: fakeHome, wantPathShim: false },
    );
    const claudeSkills = path.join(path.resolve(fakeHome), '.claude', 'skills');
    expect(plan.paths.claudeSkillsDir).toBe(claudeSkills);
    expect(plan.steps.some((s) => s.kind === 'mkdir' && s.path.includes('.claude'))).toBe(true);
    expect(plan.paths.cursorSkillsDir).toBeNull();
  });

  test('buildInstallPlan with installTargets claude-code mirrors vp-* into ~/.claude/skills', () => {
    const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-claude-skills-'));
    const plan = buildInstallPlan(
      REPO_ROOT,
      { VIEPILOT_AUTO_YES: '1' },
      { overrideHomedir: fakeHome, wantPathShim: false, installTargets: ['claude-code'] },
    );
    const claudeSkills = path.join(path.resolve(fakeHome), '.claude', 'skills');
    expect(plan.paths.claudeSkillsDir).toBe(claudeSkills);
    expect(plan.steps.some((s) => s.kind === 'mkdir' && s.path === claudeSkills)).toBe(true);
    const intoClaude = plan.steps.filter(
      (s) =>
        s.kind === 'copy_dir' &&
        typeof s.to === 'string' &&
        s.to.startsWith(claudeSkills + path.sep) &&
        s.to.includes('vp-'),
    );
    expect(intoClaude.length).toBeGreaterThan(0);
  });
});

describe('viepilot-install apply (28.2)', () => {
  test('applyInstallPlan dry-run does not create dirs under fake home', () => {
    const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-dry-'));
    const plan = buildInstallPlan(
      REPO_ROOT,
      { VIEPILOT_AUTO_YES: '1' },
      { overrideHomedir: fakeHome, wantPathShim: false },
    );
    const r = applyInstallPlan(plan, { dryRun: true });
    expect(r.ok).toBe(true);
    expect(fs.existsSync(path.join(fakeHome, '.claude'))).toBe(false);
  });

  test('applyInstallPlan copies CLI into ~/.claude under fake HOME (FEAT-013 default)', () => {
    const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-apply-'));
    const plan = buildInstallPlan(
      REPO_ROOT,
      { VIEPILOT_AUTO_YES: '1' },
      { overrideHomedir: fakeHome, wantPathShim: false },
    );
    const r = applyInstallPlan(plan, { dryRun: false });
    expect(r.ok).toBe(true);
    const bin = path.join(fakeHome, '.claude', 'viepilot', 'bin', 'vp-tools.cjs');
    expect(fs.existsSync(bin)).toBe(true);
    expect(fs.readFileSync(bin, 'utf8').length).toBeGreaterThan(10);
  });

  test('applyInstallPlan creates profile-map.md when missing (FEAT-009)', () => {
    const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-map-'));
    const plan = buildInstallPlan(
      REPO_ROOT,
      { VIEPILOT_AUTO_YES: '1' },
      { overrideHomedir: fakeHome, wantPathShim: false },
    );
    const r = applyInstallPlan(plan, { dryRun: false });
    expect(r.ok).toBe(true);
    const mapPath = path.join(fakeHome, '.viepilot', 'profile-map.md');
    expect(fs.existsSync(mapPath)).toBe(true);
    expect(fs.readFileSync(mapPath, 'utf8')).toMatch(/\| profile_id \|/);
  });

  test('applyInstallPlan does not overwrite existing profile-map.md', () => {
    const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-mapkeep-'));
    const ud = path.join(fakeHome, '.viepilot');
    fs.mkdirSync(path.join(ud, 'profiles'), { recursive: true });
    const mapPath = path.join(ud, 'profile-map.md');
    fs.writeFileSync(mapPath, 'USER_OWNED\n', 'utf8');
    const plan = buildInstallPlan(
      REPO_ROOT,
      { VIEPILOT_AUTO_YES: '1' },
      { overrideHomedir: fakeHome, wantPathShim: false },
    );
    applyInstallPlan(plan, { dryRun: false });
    expect(fs.readFileSync(mapPath, 'utf8')).toBe('USER_OWNED\n');
  });

  test('applyInstallPlan writes vp-info under ~/.claude/skills when installTargets includes claude-code', () => {
    const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-claude-apply-'));
    const plan = buildInstallPlan(
      REPO_ROOT,
      { VIEPILOT_AUTO_YES: '1' },
      { overrideHomedir: fakeHome, wantPathShim: false, installTargets: ['claude-code'] },
    );
    const r = applyInstallPlan(plan, { dryRun: false });
    expect(r.ok).toBe(true);
    const vpInfoSkill = path.join(fakeHome, '.claude', 'skills', 'vp-info', 'SKILL.md');
    expect(fs.existsSync(vpInfoSkill)).toBe(true);
  });
});

describe('BUG-005: claude-code install env path (38.3)', () => {
  test('buildInstallPlan with claude-code target includes claudeViepilotDir in paths', () => {
    const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-b005-paths-'));
    const plan = buildInstallPlan(
      REPO_ROOT,
      { VIEPILOT_AUTO_YES: '1' },
      { overrideHomedir: fakeHome, wantPathShim: false, installTargets: ['claude-code'] },
    );
    const expected = path.join(path.resolve(fakeHome), '.claude', 'viepilot');
    expect(plan.paths.claudeViepilotDir).toBe(expected);
  });

  test('buildInstallPlan with claude-code target has mkdir steps for ~/.claude/viepilot subdirs', () => {
    const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-b005-mkdir-'));
    const plan = buildInstallPlan(
      REPO_ROOT,
      { VIEPILOT_AUTO_YES: '1' },
      { overrideHomedir: fakeHome, wantPathShim: false, installTargets: ['claude-code'] },
    );
    const cvd = path.join(path.resolve(fakeHome), '.claude', 'viepilot');
    for (const sub of ['workflows', path.join('templates', 'project'), path.join('templates', 'phase'), 'bin', 'lib']) {
      expect(plan.steps.some((s) => s.kind === 'mkdir' && s.path === path.join(cvd, sub))).toBe(true);
    }
  });

  test('buildInstallPlan with claude-code target mirrors workflows to ~/.claude/viepilot/workflows', () => {
    const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-b005-wf-'));
    const plan = buildInstallPlan(
      REPO_ROOT,
      { VIEPILOT_AUTO_YES: '1' },
      { overrideHomedir: fakeHome, wantPathShim: false, installTargets: ['claude-code'] },
    );
    const cvd = path.join(path.resolve(fakeHome), '.claude', 'viepilot');
    const copySteps = plan.steps.filter(
      (s) => (s.kind === 'copy_file' || s.kind === 'copy_dir') && typeof s.to === 'string' && s.to.startsWith(path.join(cvd, 'workflows')),
    );
    expect(copySteps.length).toBeGreaterThan(0);
  });

  test('buildInstallPlan with claude-code target has rewrite_paths_in_dir step for skill path fix', () => {
    const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-b005-rw-'));
    const plan = buildInstallPlan(
      REPO_ROOT,
      { VIEPILOT_AUTO_YES: '1' },
      { overrideHomedir: fakeHome, wantPathShim: false, installTargets: ['claude-code'] },
    );
    const claudeSkills = path.join(path.resolve(fakeHome), '.claude', 'skills');
    const rewrite = plan.steps.find((s) => s.kind === 'rewrite_paths_in_dir');
    expect(rewrite).toBeDefined();
    expect(rewrite.dir).toBe(claudeSkills);
    expect(rewrite.from).toBe('.cursor/viepilot');
    expect(rewrite.to).toBe('.claude/viepilot');
  });

  test('applyInstallPlan rewrites .cursor/viepilot to .claude/viepilot in skill SKILL.md files', () => {
    const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-b005-apply-'));
    const plan = buildInstallPlan(
      REPO_ROOT,
      { VIEPILOT_AUTO_YES: '1' },
      { overrideHomedir: fakeHome, wantPathShim: false, installTargets: ['claude-code'] },
    );
    const r = applyInstallPlan(plan, { dryRun: false });
    expect(r.ok).toBe(true);
    const skillFile = path.join(fakeHome, '.claude', 'skills', 'vp-info', 'SKILL.md');
    expect(fs.existsSync(skillFile)).toBe(true);
    const content = fs.readFileSync(skillFile, 'utf8');
    expect(content).not.toContain('.cursor/viepilot');
    expect(content).toContain('.claude/viepilot');
  });

  test('cursor-only target has null claudeViepilotDir and no rewrite step', () => {
    const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-b005-nocc-'));
    const plan = buildInstallPlan(
      REPO_ROOT,
      { VIEPILOT_AUTO_YES: '1', VIEPILOT_INSTALL_PROFILE: 'cursor-ide' },
      { overrideHomedir: fakeHome, wantPathShim: false },
    );
    expect(plan.paths.claudeViepilotDir).toBeNull();
    expect(plan.steps.some((s) => s.kind === 'rewrite_paths_in_dir')).toBe(false);
  });
});

describe('BUG-006: all install targets have complete lib files (40.2)', () => {
  const LIB_FILES = ['cli-shared.cjs', 'viepilot-info.cjs', 'viepilot-update.cjs', 'viepilot-install.cjs'];

  test('cursor target has all 4 lib copy steps in ~/.cursor/viepilot/lib/', () => {
    const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-b006-cursor-'));
    const plan = buildInstallPlan(
      REPO_ROOT,
      { VIEPILOT_AUTO_YES: '1', VIEPILOT_INSTALL_PROFILE: 'cursor-ide' },
      { overrideHomedir: fakeHome, wantPathShim: false },
    );
    const libDir = path.join(path.resolve(fakeHome), '.cursor', 'viepilot', 'lib');
    for (const f of LIB_FILES) {
      const step = plan.steps.find((s) => s.kind === 'copy_file' && s.to === path.join(libDir, f));
      expect(step).toBeDefined();
      expect(step.from).toContain(path.join('lib', f));
    }
  });

  test('claude-code target has all 4 lib copy steps in ~/.claude/viepilot/lib/', () => {
    const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-b006-claude-'));
    const plan = buildInstallPlan(
      REPO_ROOT,
      { VIEPILOT_AUTO_YES: '1' },
      { overrideHomedir: fakeHome, wantPathShim: false, installTargets: ['claude-code'] },
    );
    const libDir = path.join(path.resolve(fakeHome), '.claude', 'viepilot', 'lib');
    for (const f of LIB_FILES) {
      const step = plan.steps.find((s) => s.kind === 'copy_file' && s.to === path.join(libDir, f));
      expect(step).toBeDefined();
      expect(step.from).toContain(path.join('lib', f));
    }
  });

  test('cursor target does NOT copy lib files into ~/.claude/viepilot/lib/', () => {
    const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-b006-nocc-'));
    const plan = buildInstallPlan(
      REPO_ROOT,
      { VIEPILOT_AUTO_YES: '1', VIEPILOT_INSTALL_PROFILE: 'cursor-ide' },
      { overrideHomedir: fakeHome, wantPathShim: false },
    );
    const claudeLibDir = path.join(path.resolve(fakeHome), '.claude', 'viepilot', 'lib');
    expect(plan.steps.some((s) => s.kind === 'copy_file' && typeof s.to === 'string' && s.to.startsWith(claudeLibDir))).toBe(false);
  });
});

describe('BUG-007: claude-code install includes package.json copy (41.2)', () => {
  test('claude-code plan includes package.json copy_file step into ~/.claude/viepilot/', () => {
    const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-b007-claude-'));
    const plan = buildInstallPlan(
      REPO_ROOT,
      { VIEPILOT_AUTO_YES: '1' },
      { overrideHomedir: fakeHome, wantPathShim: false, installTargets: ['claude-code'] },
    );
    const expectedTo = path.join(path.resolve(fakeHome), '.claude', 'viepilot', 'package.json');
    const step = plan.steps.find((s) => s.kind === 'copy_file' && s.to === expectedTo);
    expect(step).toBeDefined();
    expect(step.from).toMatch(/package\.json$/);
  });

  test('cursor-only plan does NOT copy package.json into ~/.claude/viepilot/', () => {
    const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-b007-cursor-'));
    const plan = buildInstallPlan(
      REPO_ROOT,
      { VIEPILOT_AUTO_YES: '1', VIEPILOT_INSTALL_PROFILE: 'cursor-ide' },
      { overrideHomedir: fakeHome, wantPathShim: false },
    );
    const claudeViepilotDir = path.join(path.resolve(fakeHome), '.claude', 'viepilot');
    const step = plan.steps.find(
      (s) => s.kind === 'copy_file' && typeof s.to === 'string' && s.to === path.join(claudeViepilotDir, 'package.json'),
    );
    expect(step).toBeUndefined();
  });
});

describe('install.sh wrapper (28.4)', () => {
  const itBash = process.platform === 'win32' ? test.skip : test;

  itBash('delegates dry-run to Node when VIEPILOT_AUTO_YES and VIEPILOT_INSTALL_DRY_RUN', () => {
    const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-ish-'));
    const installSh = path.join(REPO_ROOT, 'install.sh');
    const result = spawnSync('bash', [installSh], {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      env: {
        ...process.env,
        HOME: fakeHome,
        VIEPILOT_AUTO_YES: '1',
        VIEPILOT_INSTALL_DRY_RUN: '1',
        FORCE_COLOR: '0',
        NO_COLOR: '1',
      },
    });
    if (result.error) {
      throw result.error;
    }
    expect(result.status).toBe(0);
    const out = `${result.stdout}\n${result.stderr}`;
    expect(out).toMatch(/viepilot\.cjs|Node|dry-run|\[dry-run\]/i);
  });
});
