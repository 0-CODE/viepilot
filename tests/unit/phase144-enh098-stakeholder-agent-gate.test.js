const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const brainstorm = fs.readFileSync(path.join(ROOT, 'workflows/brainstorm.md'), 'utf8');
const crystallize = fs.readFileSync(path.join(ROOT, 'workflows/crystallize.md'), 'utf8');
const template = fs.readFileSync(path.join(ROOT, 'templates/stakeholder-agent.md'), 'utf8');
const skillCrystallize = fs.readFileSync(path.join(ROOT, 'skills/vp-crystallize/SKILL.md'), 'utf8');
const skillBrainstorm = fs.readFileSync(path.join(ROOT, 'skills/vp-brainstorm/SKILL.md'), 'utf8');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

describe('Phase 144 — ENH-098: Stakeholder Agent Gate', () => {
  describe('workflows/brainstorm.md — Stakeholder Generation Gate', () => {
    it('has stakeholder generation gate section', () => {
      expect(brainstorm).toMatch(/Stakeholder Generation Gate|stakeholder.*gate/i);
    });
    it('references .claude/agents/ path', () => {
      expect(brainstorm).toMatch(/\.claude\/agents/);
    });
    it('has --no-stakeholders skip condition', () => {
      expect(brainstorm).toMatch(/no-stakeholders/);
    });
    it('has project_slug / role_slug variable references', () => {
      expect(brainstorm).toMatch(/project.slug|role.slug/i);
    });
    it('references ENH-098', () => {
      expect(brainstorm).toMatch(/ENH-098/);
    });
  });

  describe('workflows/crystallize.md — Step 1G', () => {
    it('has Step 1G section', () => {
      expect(crystallize).toMatch(/Step 1G/);
    });
    it('references ENH-098', () => {
      expect(crystallize).toMatch(/ENH-098/);
    });
    it('mentions parallel execution', () => {
      expect(crystallize).toMatch(/parallel|simultaneously|fan-out/i);
    });
    it('mentions synthesis step', () => {
      expect(crystallize).toMatch(/[Ss]ynthesis|[Ss]ynthesize|merge/);
    });
    it('has Stakeholder Review banner text', () => {
      expect(crystallize).toMatch(/STAKEHOLDER REVIEW|Stakeholder Review/);
    });
    it('has --no-stakeholders skip condition', () => {
      expect(crystallize).toMatch(/no-stakeholders/);
    });
    it('Step 1G appears after Step 1F in file', () => {
      const idx1F = crystallize.indexOf('Step 1F');
      const idx1G = crystallize.indexOf('Step 1G');
      expect(idx1F).toBeGreaterThan(-1);
      expect(idx1G).toBeGreaterThan(idx1F);
    });
  });

  describe('templates/stakeholder-agent.md', () => {
    it('exists', () => {
      expect(fs.existsSync(path.join(ROOT, 'templates/stakeholder-agent.md'))).toBe(true);
    });
    it('uses claude-haiku-4-5 model', () => {
      expect(template).toMatch(/claude-haiku-4-5/);
    });
    it('has Gaps section', () => {
      expect(template).toMatch(/### Gaps/);
    });
    it('has Risks section', () => {
      expect(template).toMatch(/### Risks/);
    });
    it('has Suggestions section', () => {
      expect(template).toMatch(/### Suggestions/);
    });
    it('specifies Read tool', () => {
      expect(template).toMatch(/tools:|Read/);
    });
  });

  describe('SKILL.md updates', () => {
    it('vp-crystallize SKILL.md documents Step 1G or stakeholder gate', () => {
      expect(skillCrystallize).toMatch(/1G|stakeholder/i);
    });
    it('vp-brainstorm SKILL.md documents stakeholder generation', () => {
      expect(skillBrainstorm).toMatch(/ENH-098|stakeholder/i);
    });
  });

  describe('package.json', () => {
    it('version is 3.11.0', () => {
      expect(pkg.version).toBe('3.11.0');
    });
  });
});
