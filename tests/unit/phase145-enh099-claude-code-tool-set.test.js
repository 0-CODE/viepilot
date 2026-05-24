const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const vpAutoSkill = fs.readFileSync(path.join(ROOT, 'skills/vp-auto/SKILL.md'), 'utf8');
const autonomous = fs.readFileSync(path.join(ROOT, 'workflows/autonomous.md'), 'utf8');
const agentsDev = fs.readFileSync(path.join(ROOT, 'docs/dev/agents.md'), 'utf8');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

describe('Phase 145 — ENH-099: Claude Code Tool Set Adapter Docs', () => {
  describe('skills/vp-auto/SKILL.md — New Tools (ENH-099)', () => {
    it('documents Monitor tool', () => {
      expect(vpAutoSkill).toMatch(/Monitor/);
    });
    it('documents CronCreate tool', () => {
      expect(vpAutoSkill).toMatch(/CronCreate/);
    });
    it('documents EnterWorktree tool', () => {
      expect(vpAutoSkill).toMatch(/EnterWorktree/);
    });
    it('documents LSP tool', () => {
      expect(vpAutoSkill).toMatch(/\bLSP\b/);
    });
    it('documents PushNotification tool', () => {
      expect(vpAutoSkill).toMatch(/PushNotification/);
    });
    it('documents EnterPlanMode tool', () => {
      expect(vpAutoSkill).toMatch(/EnterPlanMode/);
    });
    it('references ENH-099', () => {
      expect(vpAutoSkill).toMatch(/ENH-099/);
    });
  });

  describe('workflows/autonomous.md — TodoWrite deprecation fix', () => {
    it('has no TodoWrite references', () => {
      expect(autonomous).not.toMatch(/TodoWrite/);
    });
    it('uses TaskCreate for task tracking', () => {
      expect(autonomous).toMatch(/TaskCreate/);
    });
    it('documents Monitor usage pattern', () => {
      expect(autonomous).toMatch(/Monitor/);
    });
    it('documents PushNotification on phase complete', () => {
      expect(autonomous).toMatch(/PushNotification/);
    });
  });

  describe('docs/dev/agents.md — Hooks + Agent Teams', () => {
    it('has hooks table with Fires When column', () => {
      expect(agentsDev).toMatch(/Fires When/);
    });
    it('documents SubagentStart hook', () => {
      expect(agentsDev).toMatch(/SubagentStart/);
    });
    it('documents TaskCreated hook', () => {
      expect(agentsDev).toMatch(/TaskCreated/);
    });
    it('documents PreCompact hook', () => {
      expect(agentsDev).toMatch(/PreCompact/);
    });
    it('documents PostToolBatch hook', () => {
      expect(agentsDev).toMatch(/PostToolBatch/);
    });
    it('has Agent Teams section', () => {
      expect(agentsDev).toMatch(/Agent Teams/);
    });
    it('documents TeamCreate tool', () => {
      expect(agentsDev).toMatch(/TeamCreate/);
    });
    it('documents SendMessage tool', () => {
      expect(agentsDev).toMatch(/SendMessage/);
    });
    it('mentions experimental env var', () => {
      expect(agentsDev).toMatch(/CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS/);
    });
  });

  describe('package.json', () => {
    it('version is 3.9.1', () => {
      expect(pkg.version).toBe('3.9.1');
    });
  });
});
