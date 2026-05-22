'use strict';
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '../..');
const AGENTS_CC = path.join(ROOT, 'agents', 'claude-code');
const AUTONOMOUS = path.join(ROOT, 'workflows', 'autonomous.md');
const REQUEST = path.join(ROOT, 'workflows', 'request.md');
const VP_AUDIT = path.join(ROOT, 'skills', 'vp-audit', 'SKILL.md');

describe('Phase 135 — ENH-086 + BUG-028: Native Agents Promotion', () => {

  const NEW_AGENTS = [
    'changelog-agent',
    'tracker-agent',
    'research-agent',
    'file-scanner-agent',
    'test-generator-agent',
    'doc-sync-agent',
  ];

  test('all 6 new agent files exist in agents/claude-code/', () => {
    for (const name of NEW_AGENTS) {
      const p = path.join(AGENTS_CC, `${name}.md`);
      expect(fs.existsSync(p)).toBe(true);
    }
  });

  test('agents/claude-code/ has at least 9 files (3 existing + 6 new from phase135)', () => {
    const files = fs.readdirSync(AGENTS_CC).filter(f => f.endsWith('.md'));
    expect(files.length).toBeGreaterThanOrEqual(9);
  });

  test('each new agent file has valid YAML frontmatter with name, description, model, tools', () => {
    for (const name of NEW_AGENTS) {
      const content = fs.readFileSync(path.join(AGENTS_CC, `${name}.md`), 'utf8');
      expect(content).toMatch(/^---/);
      expect(content).toMatch(/\nname:/);
      expect(content).toMatch(/\ndescription:/);
      expect(content).toMatch(/\nmodel:/);
      expect(content).toMatch(/\ntools:/);
    }
  });

  test('research-agent uses claude-sonnet model', () => {
    const content = fs.readFileSync(path.join(AGENTS_CC, 'research-agent.md'), 'utf8');
    expect(content).toMatch(/model:\s*claude-sonnet/);
  });

  test('other 5 new agents use claude-haiku model', () => {
    const haikuAgents = NEW_AGENTS.filter(n => n !== 'research-agent');
    for (const name of haikuAgents) {
      const content = fs.readFileSync(path.join(AGENTS_CC, `${name}.md`), 'utf8');
      expect(content).toMatch(/model:\s*claude-haiku/);
    }
  });

  test('file-scanner-agent disallows Edit and Write tools', () => {
    const content = fs.readFileSync(path.join(AGENTS_CC, 'file-scanner-agent.md'), 'utf8');
    const disallowedSection = content.split('disallowedTools:')[1] || '';
    const frontmatterEnd = disallowedSection.indexOf('---');
    const disallowedBlock = frontmatterEnd > 0 ? disallowedSection.slice(0, frontmatterEnd) : disallowedSection.slice(0, 200);
    expect(disallowedBlock).toMatch(/Edit/);
    expect(disallowedBlock).toMatch(/Write/);
  });

  test('autonomous.md uses direct subagent_type for tracker, changelog, doc-sync agents', () => {
    const content = fs.readFileSync(AUTONOMOUS, 'utf8');
    expect(content).toMatch(/subagent_type:\s*["']tracker-agent["']/);
    expect(content).toMatch(/subagent_type:\s*["']changelog-agent["']/);
    expect(content).toMatch(/subagent_type:\s*["']doc-sync-agent["']/);
  });

  test('autonomous.md has test-generator-agent invocation block (not just table row)', () => {
    const content = fs.readFileSync(AUTONOMOUS, 'utf8');
    const matches = content.match(/test-generator-agent/g) || [];
    expect(matches.length).toBeGreaterThanOrEqual(2);
    expect(content).toMatch(/subagent_type:\s*["']test-generator-agent["']/);
  });

  test('autonomous.md has no prompt-injection Load agents/ for wired agents', () => {
    const content = fs.readFileSync(AUTONOMOUS, 'utf8');
    expect(content).not.toMatch(/Load agents\/tracker-agent\.md/);
    expect(content).not.toMatch(/Load agents\/changelog-agent\.md/);
    expect(content).not.toMatch(/Load agents\/doc-sync-agent\.md/);
  });

  test('vp-audit/SKILL.md references file-scanner-agent in at least 2 places', () => {
    const content = fs.readFileSync(VP_AUDIT, 'utf8');
    const matches = content.match(/file-scanner-agent/g) || [];
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });

  test('request.md uses subagent_type: research-agent (no prompt-injection)', () => {
    const content = fs.readFileSync(REQUEST, 'utf8');
    expect(content).toMatch(/subagent_type:\s*["']research-agent["']/);
    expect(content).not.toMatch(/Load agents\/research-agent\.md/);
  });

});
