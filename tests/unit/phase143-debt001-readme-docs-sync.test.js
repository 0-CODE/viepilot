const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
const skillsRef = fs.readFileSync(path.join(ROOT, 'docs/skills-reference.md'), 'utf8');
const arch = fs.readFileSync(path.join(ROOT, 'docs/dev/architecture.md'), 'utf8');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

describe('Phase 143 — DEBT-001: README + Docs Drift Sync', () => {
  describe('README.md badges', () => {
    it('version badge is 3.8.0', () => {
      expect(readme).toMatch(/version-3\.8\.0/);
    });
    it('skills badge is 21', () => {
      expect(readme).toMatch(/skills-21/);
    });
    it('workflows badge is 14', () => {
      expect(readme).toMatch(/workflows-14/);
    });
    it('tests badge shows 2210', () => {
      expect(readme).toMatch(/tests-2210/);
    });
  });

  describe('README.md no stale versions', () => {
    it('does not contain stale version 3.1.1', () => {
      expect(readme).not.toMatch(/3\.1\.1/);
    });
    it('does not contain stale framework version 2.19.0', () => {
      expect(readme).not.toMatch(/2\.19\.0/);
    });
  });

  describe('README.md metric tables', () => {
    it('contains 142 phase cycles reference', () => {
      expect(readme).toMatch(/142.*phase/i);
    });
  });

  describe('docs/skills-reference.md', () => {
    it('has vp-design section', () => {
      expect(skillsRef).toMatch(/^## \/vp-design/m);
    });
    it('has vp-intake section', () => {
      expect(skillsRef).toMatch(/^## \/vp-intake/m);
    });
    it('has vp-persona section', () => {
      expect(skillsRef).toMatch(/^## \/vp-persona/m);
    });
    it('has 21 skill sections total', () => {
      const count = (skillsRef.match(/^## \/vp-/gm) || []).length;
      expect(count).toBe(21);
    });
  });

  describe('docs/dev/architecture.md', () => {
    it('documents vp-git-agent', () => {
      expect(arch).toMatch(/vp-git-agent/);
    });
    it('documents tracker-agent', () => {
      expect(arch).toMatch(/tracker-agent/);
    });
    it('documents GIT_RESULT format', () => {
      expect(arch).toMatch(/GIT_RESULT/);
    });
  });

  describe('package.json', () => {
    it('version is 3.9.1', () => {
      expect(pkg.version).toBe('3.9.1');
    });
  });
});
