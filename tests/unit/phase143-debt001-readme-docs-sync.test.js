const fs = require('fs');
const path = require('path');

// DEBT-004 (phase 163): rewritten to assert CONSISTENCY (badges == live sources) instead of frozen
// literals that asserted drift-as-truth. Version currency (pkg == CHANGELOG) is owned by
// release-meta.test.js; the README version badge is shape-only here to avoid per-bump friction
// (it is synced to the release at milestone-complete, not on every patch).
const ROOT = path.resolve(__dirname, '../..');
const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
const skillsRef = fs.readFileSync(path.join(ROOT, 'docs/skills-reference.md'), 'utf8');
const arch = fs.readFileSync(path.join(ROOT, 'docs/dev/architecture.md'), 'utf8');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

const vpSkillCount = fs.readdirSync(path.join(ROOT, 'skills')).filter(d => /^vp-/.test(d)).length;
const workflowCount = fs.readdirSync(path.join(ROOT, 'workflows')).filter(f => /\.md$/.test(f)).length;

describe('Phase 143 — DEBT-001: README + Docs consistency (DEBT-004 de-brittled)', () => {
  describe('README.md badges — consistency, not literals', () => {
    it('version badge is valid SemVer', () => {
      expect(readme).toMatch(/version-\d+\.\d+\.\d+/);
    });
    it('skills badge matches skills/vp-* count', () => {
      const m = readme.match(/skills-(\d+)/);
      expect(m).not.toBeNull();
      expect(Number(m[1])).toBe(vpSkillCount);
    });
    it('workflows badge matches workflows/*.md count', () => {
      const m = readme.match(/workflows-(\d+)/);
      expect(m).not.toBeNull();
      expect(Number(m[1])).toBe(workflowCount);
    });
    it('tests badge is present (shape-only — count changes constantly)', () => {
      expect(readme).toMatch(/tests-\d+/);
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
    it('references a phase-cycle count (shape, not a frozen number)', () => {
      expect(readme).toMatch(/\d+\s*(\+\s*)?phase/i);
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
    it('section count matches skills/vp-* count', () => {
      const count = (skillsRef.match(/^## \/vp-/gm) || []).length;
      expect(count).toBe(vpSkillCount);
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
    it('version is valid SemVer (currency owned by release-meta.test.js)', () => {
      expect(pkg.version).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });
});
