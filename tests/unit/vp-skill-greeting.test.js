/**
 * Contract tests — Phase 82: Skill Invocation Greeting Banner (ENH-056)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '../..');
const skill = (s) => fs.readFileSync(path.join(ROOT, 'skills', s, 'SKILL.md'), 'utf8');

const SKILLS = [
  { name: 'vp-audit',         upper: 'VP-AUDIT',         version: '0.3.2' },
  { name: 'vp-auto',          upper: 'VP-AUTO',           version: '0.2.2' },
  { name: 'vp-brainstorm',    upper: 'VP-BRAINSTORM',     version: '1.1.0' },
  { name: 'vp-crystallize',   upper: 'VP-CRYSTALLIZE',    version: '0.8.0' },
  { name: 'vp-debug',         upper: 'VP-DEBUG',          version: '0.2.0' },
  { name: 'vp-docs',          upper: 'VP-DOCS',           version: '0.2.1' },
  { name: 'vp-evolve',        upper: 'VP-EVOLVE',         version: '0.3.0' },
  { name: 'vp-info',          upper: 'VP-INFO',           version: '0.1.1' },
  { name: 'vp-pause',         upper: 'VP-PAUSE',          version: '0.1.1' },
  { name: 'vp-proposal',      upper: 'VP-PROPOSAL',       version: '0.1.0' },
  { name: 'vp-request',       upper: 'VP-REQUEST',        version: '0.2.0' },
  { name: 'vp-resume',        upper: 'VP-RESUME',         version: '0.1.1' },
  { name: 'vp-rollback',      upper: 'VP-ROLLBACK',       version: '0.1.1' },
  { name: 'vp-status',        upper: 'VP-STATUS',         version: '0.1.1' },
  { name: 'vp-task',          upper: 'VP-TASK',           version: '0.2.0' },
  { name: 'vp-ui-components', upper: 'VP-UI-COMPONENTS',  version: '0.1.1' },
  { name: 'vp-update',        upper: 'VP-UPDATE',         version: '0.1.1' },
];

describe('ENH-056: Skill invocation greeting banner', () => {
  test.each(SKILLS)('$name: has <greeting> block', ({ name }) => {
    expect(skill(name)).toMatch(/<greeting>/);
  });

  test.each(SKILLS)('$name: greeting is properly closed', ({ name }) => {
    const content = skill(name);
    const opens = (content.match(/<greeting>/g) || []).length;
    const closes = (content.match(/<\/greeting>/g) || []).length;
    expect(opens).toBe(closes);
    expect(opens).toBe(1);
  });

  test.each(SKILLS)('$name: banner contains VIEPILOT ►', ({ name }) => {
    expect(skill(name)).toMatch(/VIEPILOT ►/);
  });

  test.each(SKILLS)('$name: banner contains correct skill name', ({ name, upper }) => {
    expect(skill(name)).toMatch(new RegExp(`VIEPILOT ► ${upper}`));
  });

  test.each(SKILLS)('$name: banner contains (fw marker', ({ name }) => {
    expect(skill(name)).toMatch(/\(fw /);
  });

  test.each(SKILLS)('$name: banner contains correct skill version', ({ name, version }) => {
    const content = skill(name);
    const greetingMatch = content.match(/<greeting>([\s\S]*?)<\/greeting>/);
    expect(greetingMatch).not.toBeNull();
    if (greetingMatch) {
      expect(greetingMatch[1]).toContain(`v${version}`);
    }
  });

  test.each(SKILLS)('$name: greeting appears before objective', ({ name }) => {
    const content = skill(name);
    const greetingPos = content.indexOf('<greeting>');
    const objectivePos = content.indexOf('<objective>');
    expect(greetingPos).toBeGreaterThan(-1);
    // If <objective> exists, greeting must come before it
    if (objectivePos > -1) {
      expect(greetingPos).toBeLessThan(objectivePos);
    }
  });
});
