'use strict';
const path = require('path');
const os = require('os');
const fs = require('fs');

describe('Phase 151 — BUG-032: install version-mismatch warning + skill log clarity', () => {
  const installLib = path.join(__dirname, '../../lib/viepilot-install.cjs');
  const { applyInstallPlan } = require(installLib);

  describe('151.1 — applyInstallPlan new: log prefix', () => {
    let tmpDir;

    beforeEach(() => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-151-'));
    });

    afterEach(() => {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it('emits new: log when copy_dir dest does not exist', () => {
      const src = path.join(tmpDir, 'src-skill');
      const dest = path.join(tmpDir, 'dest-skill');
      fs.mkdirSync(src);
      fs.writeFileSync(path.join(src, 'SKILL.md'), '# test');

      const plan = { steps: [{ kind: 'copy_dir', from: src, to: dest }] };
      const result = applyInstallPlan(plan, { dryRun: false });

      expect(result.ok).toBe(true);
      expect(result.logs.some((l) => l.startsWith('new:') && l.includes('dest-skill'))).toBe(true);
      expect(fs.existsSync(dest)).toBe(true);
    });

    it('does NOT emit new: log on re-install (dest already exists)', () => {
      const src = path.join(tmpDir, 'src-skill2');
      const dest = path.join(tmpDir, 'dest-skill2');
      fs.mkdirSync(src);
      fs.mkdirSync(dest);
      fs.writeFileSync(path.join(src, 'SKILL.md'), '# test');

      const plan = { steps: [{ kind: 'copy_dir', from: src, to: dest }] };
      const result = applyInstallPlan(plan, { dryRun: false });

      expect(result.ok).toBe(true);
      expect(result.logs.some((l) => l.startsWith('new:'))).toBe(false);
    });

    it('dry-run mode unchanged — emits [dry-run] copyDir, no new:', () => {
      const plan = { steps: [{ kind: 'copy_dir', from: '/fake/src', to: '/fake/dest' }] };
      const result = applyInstallPlan(plan, { dryRun: true });

      expect(result.logs.some((l) => l.includes('[dry-run]') && l.includes('copyDir'))).toBe(true);
      expect(result.logs.some((l) => l.startsWith('new:'))).toBe(false);
    });

    it('new: log is emitted after copy — dest exists when logged', () => {
      const src = path.join(tmpDir, 'src-skill3');
      const dest = path.join(tmpDir, 'dest-skill3');
      fs.mkdirSync(src);
      fs.writeFileSync(path.join(src, 'SKILL.md'), '# test3');

      const plan = { steps: [{ kind: 'copy_dir', from: src, to: dest }] };
      applyInstallPlan(plan, { dryRun: false });

      expect(fs.existsSync(path.join(dest, 'SKILL.md'))).toBe(true);
    });
  });

  describe('151.2 — installCommand version-mismatch warning (imports + logic)', () => {
    it('viepilot-info exports readInstalledVersion and fetchLatestNpmVersion', () => {
      const info = require(path.join(__dirname, '../../lib/viepilot-info.cjs'));
      expect(typeof info.readInstalledVersion).toBe('function');
      expect(typeof info.fetchLatestNpmVersion).toBe('function');
    });

    it('viepilot-update exports compareSemver', () => {
      const update = require(path.join(__dirname, '../../lib/viepilot-update.cjs'));
      expect(typeof update.compareSemver).toBe('function');
    });

    it('compareSemver correctly identifies outdated version', () => {
      const { compareSemver } = require(path.join(__dirname, '../../lib/viepilot-update.cjs'));
      expect(compareSemver('2.50.1', '3.12.1')).toBeLessThan(0);
      expect(compareSemver('3.12.1', '3.12.1')).toBe(0);
      expect(compareSemver('3.12.2', '3.12.1')).toBeGreaterThan(0);
    });
  });

  describe('151.3 — version + changelog', () => {
    it('package.json version is 3.12.2', () => {
      const pkg = require(path.join(__dirname, '../../package.json'));
      expect(pkg.version).toBe('3.12.2');
    });

    it('CHANGELOG.md has [3.12.2] entry', () => {
      const changelog = fs.readFileSync(path.join(__dirname, '../../CHANGELOG.md'), 'utf8');
      expect(changelog).toMatch(/\[3\.12\.2\]/);
    });
  });
});
