'use strict';
const fs = require('fs');
const path = require('path');
const { globSync } = require('glob');

const ROOT = path.join(__dirname, '../..');
const SKILLS_DIR = path.join(ROOT, 'skills');
const WORKFLOWS_DIR = path.join(ROOT, 'workflows');

describe('Phase 132 — FEAT-021: 5-block adapter standard + workflow adapter contracts', () => {

  // ── 5-block adapter standard across all SKILL.md files ───────────────────

  let skillFiles;
  beforeAll(() => {
    skillFiles = globSync('*/SKILL.md', { cwd: SKILLS_DIR, absolute: true });
  });

  test('all SKILL.md files have 5 adapter blocks', () => {
    for (const f of skillFiles) {
      const src = fs.readFileSync(f, 'utf8');
      const blocks = (src.match(/<adapter id="/g) || []).length;
      expect({ file: path.relative(ROOT, f), blocks }).toMatchObject({
        blocks: 5
      });
    }
  });

  test('all SKILL.md files have claude-code adapter block', () => {
    for (const f of skillFiles) {
      const src = fs.readFileSync(f, 'utf8');
      expect(src).toMatch(/<adapter id="claude-code">/);
    }
  });

  test('all SKILL.md files have cursor-agent adapter block', () => {
    for (const f of skillFiles) {
      const src = fs.readFileSync(f, 'utf8');
      expect(src).toMatch(/<adapter id="cursor-agent">/);
    }
  });

  test('no SKILL.md file has cursor_skill_adapter block (legacy — removed in Phase 128)', () => {
    for (const f of skillFiles) {
      const src = fs.readFileSync(f, 'utf8');
      expect(src).not.toMatch(/<cursor_skill_adapter>/);
    }
  });

  test('claude-code adapter blocks use Bash not Shell as tool name', () => {
    for (const f of skillFiles) {
      const src = fs.readFileSync(f, 'utf8');
      // Extract just the claude-code adapter block
      const match = src.match(/<adapter id="claude-code">([\s\S]*?)<\/adapter>/);
      if (match) {
        // Should reference Bash, not Shell (Cursor's tool name)
        expect(match[1]).toMatch(/Bash/);
      }
    }
  });

  // ── Workflow adapter-aware paths ──────────────────────────────────────────

  test('autonomous.md references ADAPTER_CONTEXT', () => {
    const src = fs.readFileSync(path.join(WORKFLOWS_DIR, 'autonomous.md'), 'utf8');
    expect(src).toMatch(/ADAPTER_CONTEXT/);
  });

  test('autonomous.md references v3 Orchestration Agents section', () => {
    const src = fs.readFileSync(path.join(WORKFLOWS_DIR, 'autonomous.md'), 'utf8');
    expect(src).toMatch(/v3 Orchestration Agents/);
  });

  test('brainstorm.md references ADAPTER_CONTEXT', () => {
    const src = fs.readFileSync(path.join(WORKFLOWS_DIR, 'brainstorm.md'), 'utf8');
    expect(src).toMatch(/ADAPTER_CONTEXT/);
  });

  test('crystallize.md has 5-adapter compatibility table', () => {
    const src = fs.readFileSync(path.join(WORKFLOWS_DIR, 'crystallize.md'), 'utf8');
    expect(src).toMatch(/claude-code/);
    expect(src).toMatch(/cursor-agent/);
    expect(src).toMatch(/antigravity/);
    expect(src).toMatch(/codex/);
    expect(src).toMatch(/copilot/);
  });

  // ── Claude Code adapter has agent definitions metadata ────────────────────

  test('claude-code adapter defines claudeAgentsDir and claudeAgentsSrc', () => {
    const adapter = require('../../lib/adapters/claude-code.cjs');
    expect(typeof adapter.claudeAgentsDir).toBe('function');
    expect(typeof adapter.claudeAgentsSrc).toBe('string');
    expect(adapter.claudeAgentsSrc).toBe('agents/claude-code');
  });

  // ── Antigravity adapter Phase 131 additions ───────────────────────────────

  test('antigravity adapter has projectSkillsDir', () => {
    const adapter = require('../../lib/adapters/antigravity.cjs');
    expect(adapter.projectSkillsDir).toBe('.agents/skills');
  });

  test('antigravity adapter has deprecationNotice string', () => {
    const adapter = require('../../lib/adapters/antigravity.cjs');
    expect(typeof adapter.deprecationNotice).toBe('string');
    expect(adapter.deprecationNotice).toMatch(/deprecated/i);
  });

});
