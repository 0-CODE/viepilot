'use strict';

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const ROOT = path.resolve(__dirname, '..', '..');

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

// Extract ## Paths block content from a task .md file
function extractPathsBlock(content) {
  const match = content.match(/##\s+Paths\s*\n([\s\S]*?)(?:\n##|\n####|$)/);
  if (!match) return '';
  return match[1];
}

// ─────────────────────────────────────────────────────────────────────────────
// Group 1: workflows/evolve.md contains TASK PATH RULE guard
// ─────────────────────────────────────────────────────────────────────────────
describe('BUG-009 — workflows/evolve.md TASK PATH RULE guard', () => {
  let content;
  beforeAll(() => { content = read('workflows/evolve.md'); });

  test('contains BUG-009 guard label', () => {
    expect(content).toMatch(/TASK PATH RULE.*BUG-009/);
  });

  test('contains CORRECT repo-relative path examples', () => {
    expect(content).toMatch(/CORRECT/);
    expect(content).toMatch(/workflows\/[^\s]+\.md/);
    expect(content).toMatch(/skills\/[^\s]+\/SKILL\.md/);
  });

  test('contains INCORRECT external path examples', () => {
    expect(content).toMatch(/INCORRECT/);
    expect(content).toMatch(/~\/.claude\//);
  });

  test('guard appears before Create Phase Directory step', () => {
    const guardPos = content.indexOf('TASK PATH RULE');
    const createPos = content.indexOf('### Create Phase Directory');
    expect(guardPos).toBeGreaterThan(0);
    expect(createPos).toBeGreaterThan(0);
    expect(guardPos).toBeLessThan(createPos);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Group 2: workflows/autonomous.md contains preflight path validation
// ─────────────────────────────────────────────────────────────────────────────
describe('BUG-009 — workflows/autonomous.md preflight path validation', () => {
  let content;
  beforeAll(() => { content = read('workflows/autonomous.md'); });

  test('contains BUG-009 preflight check label', () => {
    expect(content).toMatch(/Preflight.*Task Paths Validation.*BUG-009/i);
  });

  test('preflight check mentions ~/ prefix as invalid', () => {
    const checkSection = content.split('Preflight')[1] || '';
    expect(checkSection).toMatch(/~\//);
  });

  test('preflight check mentions absolute path / prefix as invalid', () => {
    const checkSection = content.split('Preflight')[1] || '';
    // Should mention detecting leading / for absolute paths
    expect(checkSection).toMatch(/starts with/i);
  });

  test('error message template references offending path and task file', () => {
    expect(content).toMatch(/TASK PATH ERROR.*BUG-009/);
    expect(content).toMatch(/offending_path/);
    expect(content).toMatch(/Fix the task file/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Group 3: SKILL.md documentation
// ─────────────────────────────────────────────────────────────────────────────
describe('BUG-009 — SKILL.md path convention documentation', () => {
  test('vp-evolve SKILL.md contains BUG-009 path convention note', () => {
    const content = read('skills/vp-evolve/SKILL.md');
    expect(content).toMatch(/BUG-009/);
    expect(content).toMatch(/repo-relative/i);
  });

  test('vp-auto SKILL.md contains BUG-009 path validation note', () => {
    const content = read('skills/vp-auto/SKILL.md');
    expect(content).toMatch(/BUG-009/);
    expect(content).toMatch(/repo-relative/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Group 4: Existing phase 47–49 task files use repo-relative paths only
// ─────────────────────────────────────────────────────────────────────────────
describe('BUG-009 — Phase task files use repo-relative paths', () => {
  // Collect all task .md files in phases 47, 48, 49
  const taskFiles = [
    ...glob.sync('.viepilot/phases/47-*/tasks/*.md', { cwd: ROOT }),
    ...glob.sync('.viepilot/phases/48-*/tasks/*.md', { cwd: ROOT }),
    ...glob.sync('.viepilot/phases/49-*/tasks/*.md', { cwd: ROOT }),
  ];

  test('task files for phases 47–49 exist', () => {
    expect(taskFiles.length).toBeGreaterThan(0);
  });

  test('no ## Paths block contains ~/.claude/ prefix', () => {
    const violations = [];
    for (const file of taskFiles) {
      const content = read(file);
      const pathsBlock = extractPathsBlock(content);
      const lines = pathsBlock.split('\n');
      for (const line of lines) {
        // Only check backtick-quoted paths (actual path entries)
        const match = line.match(/`([^`]+)`/);
        if (match) {
          const p = match[1];
          if (p.startsWith('~/.claude/') || p.startsWith('~/.cursor/')) {
            violations.push(`${file}: "${p}"`);
          }
        }
      }
    }
    if (violations.length > 0) {
      throw new Error(
        `Found ~/.claude/ or ~/.cursor/ paths in ## Paths blocks:\n${violations.join('\n')}`
      );
    }
  });

  test('no ## Paths block contains absolute / prefix', () => {
    const violations = [];
    for (const file of taskFiles) {
      const content = read(file);
      const pathsBlock = extractPathsBlock(content);
      const lines = pathsBlock.split('\n');
      for (const line of lines) {
        const match = line.match(/`([^`]+)`/);
        if (match) {
          const p = match[1];
          // Allow paths like /dev/null, /tmp explicitly — flag real fs paths
          if (p.startsWith('/Users/') || p.startsWith('/home/') || p.startsWith('/opt/')) {
            violations.push(`${file}: "${p}"`);
          }
        }
      }
    }
    if (violations.length > 0) {
      throw new Error(
        `Found absolute paths in ## Paths blocks:\n${violations.join('\n')}`
      );
    }
  });
});
