'use strict';
const fs = require('fs');
const path = require('path');

const SKILLS_DIR = path.join(__dirname, '../../skills');
const WORKFLOWS_DIR = path.join(__dirname, '../../workflows');

const AUQ_SKILLS = ['vp-request', 'vp-evolve', 'vp-auto', 'vp-brainstorm', 'vp-crystallize'];
const AUQ_WORKFLOWS = ['request.md', 'evolve.md', 'autonomous.md'];

describe('ENH-059: AskUserQuestion ToolSearch preload', () => {
  AUQ_SKILLS.forEach(skill => {
    test(`${skill}/SKILL.md has ToolSearch preload instruction`, () => {
      const content = fs.readFileSync(path.join(SKILLS_DIR, skill, 'SKILL.md'), 'utf8');
      expect(content).toMatch(/ToolSearch/);
      expect(content).toMatch(/select:AskUserQuestion/);
    });
  });

  AUQ_WORKFLOWS.forEach(wf => {
    test(`workflows/${wf} has ToolSearch preload step`, () => {
      const content = fs.readFileSync(path.join(WORKFLOWS_DIR, wf), 'utf8');
      expect(content).toMatch(/select:AskUserQuestion/);
    });
  });

  test('all 5 SKILL.md files have preload (bulk check)', () => {
    const missing = AUQ_SKILLS.filter(skill => {
      const content = fs.readFileSync(path.join(SKILLS_DIR, skill, 'SKILL.md'), 'utf8');
      return !content.includes('select:AskUserQuestion');
    });
    expect(missing).toHaveLength(0);
  });

  test('all 3 workflow files have preload (bulk check)', () => {
    const missing = AUQ_WORKFLOWS.filter(wf => {
      const content = fs.readFileSync(path.join(WORKFLOWS_DIR, wf), 'utf8');
      return !content.includes('select:AskUserQuestion');
    });
    expect(missing).toHaveLength(0);
  });
});
