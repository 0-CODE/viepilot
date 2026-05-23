'use strict';
const fs   = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '../..');

describe('Phase 142 — ENH-097: vp-git-agent exists', () => {
  let content;
  beforeAll(() => {
    content = fs.readFileSync(path.join(ROOT, 'agents/claude-code/vp-git-agent.md'), 'utf8');
  });

  test('vp-git-agent.md exists', () => {
    expect(fs.existsSync(path.join(ROOT, 'agents/claude-code/vp-git-agent.md'))).toBe(true);
  });

  test('has create-tag operation', () => {
    expect(content).toMatch(/create-tag/);
  });

  test('has push-all operation', () => {
    expect(content).toMatch(/push-all/);
  });

  test('uses GIT_RESULT output format', () => {
    expect(content).toMatch(/GIT_RESULT/);
  });

  test('model is claude-haiku-4-5', () => {
    expect(content).toMatch(/model: claude-haiku-4-5/);
  });
});

describe('Phase 142 — ENH-097: tracker-agent extensions', () => {
  let content;
  beforeAll(() => {
    content = fs.readFileSync(path.join(ROOT, 'agents/claude-code/tracker-agent.md'), 'utf8');
  });

  test('has update-handoff operation', () => {
    expect(content).toMatch(/update-handoff/);
  });

  test('has update-roadmap-phase operation', () => {
    expect(content).toMatch(/update-roadmap-phase/);
  });

  test('Write tool is allowed', () => {
    expect(content).toMatch(/- Write/);
  });
});

describe('Phase 142 — ENH-097: autonomous.md full delegation', () => {
  let content;
  beforeAll(() => {
    content = fs.readFileSync(path.join(ROOT, 'workflows/autonomous.md'), 'utf8');
  });

  test('vp-git-agent is referenced in autonomous.md', () => {
    expect(content).toMatch(/vp-git-agent/);
  });

  test('push-all spawn pattern is present', () => {
    expect(content).toMatch(/push-all/);
  });

  test('update-handoff spawn pattern is present', () => {
    expect(content).toMatch(/update-handoff/);
  });

  test('update-roadmap-phase spawn pattern is present', () => {
    expect(content).toMatch(/update-roadmap-phase/);
  });

  test('whitelist restricts Bash to read-only git checks', () => {
    expect(content).toMatch(/read-only git checks|git status --porcelain.*git rev-list|Bash.*read-only/i);
  });
});
