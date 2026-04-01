const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

describe('BUG-004 vp-only scope policy contracts', () => {
  test('all vp skills define namespace guard policy', () => {
    const skillsDir = path.join(ROOT, 'skills');
    const skillDirs = fs
      .readdirSync(skillsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory() && d.name.startsWith('vp-'))
      .map((d) => d.name);

    for (const skill of skillDirs) {
      const md = read(path.join('skills', skill, 'SKILL.md'));
      expect(md).toMatch(/<scope_policy>/);
      expect(md).toMatch(/Default mode: only use and reference `vp-\*` skills/);
      expect(md).toMatch(/External skills \(`non vp-\*`\) are out of framework scope/);
      expect(md).toMatch(/explicitly opts in/);
    }
  });

  test('core workflows declare vp-only scope policy', () => {
    const workflows = [
      'workflows/autonomous.md',
      'workflows/request.md',
      'workflows/debug.md',
      'workflows/documentation.md',
      'workflows/audit.md',
      'workflows/evolve.md',
      'workflows/crystallize.md',
      'workflows/brainstorm.md',
    ];

    for (const wf of workflows) {
      const md = read(wf);
      expect(md).toMatch(/ViePilot Skill Scope Policy \(BUG-004\)/);
      expect(md).toMatch(/only use and suggest skills under `vp-\*`/);
      expect(md).toMatch(/unless the user explicitly opts in/);
    }
  });
});
