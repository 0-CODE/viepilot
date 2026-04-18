'use strict';
const fs = require('fs');
const path = require('path');

const WORKFLOWS_DIR = path.join(__dirname, '../../workflows');
const SKILLS_DIR = path.join(__dirname, '../../skills');

describe('ENH-058: Workflow Continuation Prompt', () => {
  test('evolve.md Step 5 has AskUserQuestion continuation block', () => {
    const content = fs.readFileSync(path.join(WORKFLOWS_DIR, 'evolve.md'), 'utf8');
    expect(content).toMatch(/AskUserQuestion/);
    expect(content).toMatch(/Execute now.*vp-auto/i);
    expect(content).toMatch(/Done for now/i);
  });

  test('request.md Step 7 has AskUserQuestion continuation block', () => {
    const content = fs.readFileSync(path.join(WORKFLOWS_DIR, 'request.md'), 'utf8');
    expect(content).toMatch(/AskUserQuestion/);
    expect(content).toMatch(/Plan phase.*vp-evolve/i);
    expect(content).toMatch(/Done for now/i);
  });

  test('vp-evolve SKILL.md AUQ table has Step 5 continuation entry', () => {
    const content = fs.readFileSync(path.join(SKILLS_DIR, 'vp-evolve/SKILL.md'), 'utf8');
    expect(content).toMatch(/Step 5.*continuation|continuation.*Step 5/i);
  });

  test('vp-request SKILL.md AUQ table has Step 6 continuation entry', () => {
    const content = fs.readFileSync(path.join(SKILLS_DIR, 'vp-request/SKILL.md'), 'utf8');
    expect(content).toMatch(/Step 6.*continuation|continuation.*Step 6/i);
  });

  test('evolve.md has text fallback for non-Claude Code adapters', () => {
    const content = fs.readFileSync(path.join(WORKFLOWS_DIR, 'evolve.md'), 'utf8');
    expect(content).toMatch(/[Tt]ext fallback/);
  });

  test('request.md has text fallback for non-Claude Code adapters', () => {
    const content = fs.readFileSync(path.join(WORKFLOWS_DIR, 'request.md'), 'utf8');
    expect(content).toMatch(/[Tt]ext fallback/);
  });

  test('evolve.md continuation offers vp-request as alternative', () => {
    const content = fs.readFileSync(path.join(WORKFLOWS_DIR, 'evolve.md'), 'utf8');
    expect(content).toMatch(/Create another request.*vp-request/i);
  });

  test('request.md continuation offers vp-request create-another option', () => {
    const content = fs.readFileSync(path.join(WORKFLOWS_DIR, 'request.md'), 'utf8');
    expect(content).toMatch(/Create another request.*vp-request/i);
  });
});
