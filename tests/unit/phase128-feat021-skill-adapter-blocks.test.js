'use strict';
const fs = require('fs');
const path = require('path');

const SKILLS_DIR = path.join(__dirname, '../../skills');

const skillDirs = fs.readdirSync(SKILLS_DIR).filter(d =>
  fs.existsSync(path.join(SKILLS_DIR, d, 'SKILL.md'))
);

describe('Phase 128 — FEAT-021: SKILL.md 5-block adapter standard', () => {

  test('all 21 SKILL.md files exist', () => {
    expect(skillDirs).toHaveLength(21);
  });

  test('no SKILL.md contains cursor_skill_adapter (root bug fixed)', () => {
    const withBug = skillDirs.filter(d => {
      const src = fs.readFileSync(path.join(SKILLS_DIR, d, 'SKILL.md'), 'utf8');
      return src.includes('cursor_skill_adapter');
    });
    expect(withBug).toHaveLength(0);
  });

  test('all 21 SKILL.md contain <adapter id="claude-code"> block', () => {
    const missing = skillDirs.filter(d => {
      const src = fs.readFileSync(path.join(SKILLS_DIR, d, 'SKILL.md'), 'utf8');
      return !src.includes('<adapter id="claude-code">');
    });
    expect(missing).toHaveLength(0);
  });

  test('all 21 SKILL.md contain <adapter id="cursor-agent"> block', () => {
    const missing = skillDirs.filter(d => {
      const src = fs.readFileSync(path.join(SKILLS_DIR, d, 'SKILL.md'), 'utf8');
      return !src.includes('<adapter id="cursor-agent">');
    });
    expect(missing).toHaveLength(0);
  });

  test('all 21 SKILL.md contain <adapter id="antigravity"> block', () => {
    const missing = skillDirs.filter(d => {
      const src = fs.readFileSync(path.join(SKILLS_DIR, d, 'SKILL.md'), 'utf8');
      return !src.includes('<adapter id="antigravity">');
    });
    expect(missing).toHaveLength(0);
  });

  test('all 21 SKILL.md contain <adapter id="codex"> block', () => {
    const missing = skillDirs.filter(d => {
      const src = fs.readFileSync(path.join(SKILLS_DIR, d, 'SKILL.md'), 'utf8');
      return !src.includes('<adapter id="codex">');
    });
    expect(missing).toHaveLength(0);
  });

  test('all 21 SKILL.md contain <adapter id="copilot"> block', () => {
    const missing = skillDirs.filter(d => {
      const src = fs.readFileSync(path.join(SKILLS_DIR, d, 'SKILL.md'), 'utf8');
      return !src.includes('<adapter id="copilot">');
    });
    expect(missing).toHaveLength(0);
  });

  test('claude-code adapter blocks use Bash (not Shell)', () => {
    const wrong = skillDirs.filter(d => {
      const src = fs.readFileSync(path.join(SKILLS_DIR, d, 'SKILL.md'), 'utf8');
      // extract claude-code block only
      const start = src.indexOf('<adapter id="claude-code">');
      const end = src.indexOf('</adapter>', start);
      if (start === -1 || end === -1) return false;
      const block = src.slice(start, end);
      // Should have Bash, not Shell as the shell tool in Claude Code block
      return block.includes('`Shell`') && !block.includes('`Bash`');
    });
    expect(wrong).toHaveLength(0);
  });

  test('claude-code adapter blocks use Grep (not rg)', () => {
    const wrong = skillDirs.filter(d => {
      const src = fs.readFileSync(path.join(SKILLS_DIR, d, 'SKILL.md'), 'utf8');
      const start = src.indexOf('<adapter id="claude-code">');
      const end = src.indexOf('</adapter>', start);
      if (start === -1 || end === -1) return false;
      const block = src.slice(start, end);
      return block.includes('`rg`') || block.includes('ReadFile') || block.includes('ApplyPatch');
    });
    expect(wrong).toHaveLength(0);
  });

  test('cursor-agent adapter blocks reference run_terminal_cmd', () => {
    const missing = skillDirs.filter(d => {
      const src = fs.readFileSync(path.join(SKILLS_DIR, d, 'SKILL.md'), 'utf8');
      const start = src.indexOf('<adapter id="cursor-agent">');
      const end = src.indexOf('</adapter>', start);
      if (start === -1 || end === -1) return true;
      const block = src.slice(start, end);
      return !block.includes('run_terminal_cmd');
    });
    expect(missing).toHaveLength(0);
  });

  test('antigravity adapter blocks reference .agents/skills/ project path', () => {
    const missing = skillDirs.filter(d => {
      const src = fs.readFileSync(path.join(SKILLS_DIR, d, 'SKILL.md'), 'utf8');
      const start = src.indexOf('<adapter id="antigravity">');
      const end = src.indexOf('</adapter>', start);
      if (start === -1 || end === -1) return true;
      const block = src.slice(start, end);
      return !block.includes('.agents/skills/');
    });
    expect(missing).toHaveLength(0);
  });

  test('vp-auto claude-code block uses Agent tool (not Task(subagent_type))', () => {
    const src = fs.readFileSync(path.join(SKILLS_DIR, 'vp-auto', 'SKILL.md'), 'utf8');
    const start = src.indexOf('<adapter id="claude-code">');
    const end = src.indexOf('</adapter>', start);
    const block = src.slice(start, end);
    expect(block).not.toMatch(/Task\(subagent_type/);
    expect(block).toMatch(/`Agent` tool/);
  });

  test('copilot adapter blocks mention askQuestions limitation (not in subagents)', () => {
    const missing = skillDirs.filter(d => {
      const src = fs.readFileSync(path.join(SKILLS_DIR, d, 'SKILL.md'), 'utf8');
      const start = src.indexOf('<adapter id="copilot">');
      const end = src.indexOf('</adapter>', start);
      if (start === -1 || end === -1) return true;
      const block = src.slice(start, end);
      return !block.includes('askQuestions') || !block.includes('main agent');
    });
    expect(missing).toHaveLength(0);
  });

});
