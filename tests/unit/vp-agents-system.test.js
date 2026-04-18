/**
 * Contract tests for ENH-057 — ViePilot Agents System (Phase 83)
 */
const fs = require('fs');
const path = require('path');

const AGENTS_DIR = path.join(__dirname, '../../agents');
const WORKFLOWS_DIR = path.join(__dirname, '../../workflows');

const REQUIRED_SECTIONS = [
  '## Purpose',
  '## Inputs',
  '## Outputs',
  '## Invocation Pattern',
  '## Adapter Behavior',
];

const AGENT_FILES = [
  'tracker-agent.md',
  'research-agent.md',
  'file-scanner-agent.md',
  'changelog-agent.md',
  'test-generator-agent.md',
  'doc-sync-agent.md',
];

describe('ENH-057: ViePilot Agents System', () => {
  // --- Agent files exist ---
  test('agents/ directory exists', () => {
    expect(fs.existsSync(AGENTS_DIR)).toBe(true);
  });

  test.each(AGENT_FILES)('%s exists in agents/', (file) => {
    expect(fs.existsSync(path.join(AGENTS_DIR, file))).toBe(true);
  });

  // --- Required sections ---
  test.each(AGENT_FILES)('%s has all required sections', (file) => {
    const content = fs.readFileSync(path.join(AGENTS_DIR, file), 'utf8');
    REQUIRED_SECTIONS.forEach((section) => {
      expect(content).toContain(section);
    });
  });

  // --- Adapter Behavior table has all 4 adapters ---
  test.each(AGENT_FILES)('%s Adapter Behavior table covers all 4 adapters', (file) => {
    const content = fs.readFileSync(path.join(AGENTS_DIR, file), 'utf8');
    expect(content).toMatch(/Claude Code/);
    expect(content).toMatch(/Cursor/);
    expect(content).toMatch(/Codex/);
    expect(content).toMatch(/Antigravity/);
  });

  // --- Invocation Pattern has Claude Code Agent call ---
  test.each(AGENT_FILES)('%s has Claude Code Agent invocation pattern', (file) => {
    const content = fs.readFileSync(path.join(AGENTS_DIR, file), 'utf8');
    expect(content).toMatch(/Agent\(\{|subagent_type/);
  });

  // --- Exact 6 agent files ---
  test('agents/ contains exactly 6 .md files', () => {
    const files = fs.readdirSync(AGENTS_DIR).filter((f) => f.endsWith('.md'));
    expect(files).toHaveLength(6);
  });

  // --- autonomous.md integration ---
  test('autonomous.md has Agent Delegation section (ENH-057)', () => {
    const content = fs.readFileSync(path.join(WORKFLOWS_DIR, 'autonomous.md'), 'utf8');
    expect(content).toContain('## Agent Delegation');
    expect(content).toContain('tracker-agent');
    expect(content).toContain('changelog-agent');
    expect(content).toContain('doc-sync-agent');
  });

  test('autonomous.md has bulk-edit doc-sync-agent detection', () => {
    const content = fs.readFileSync(path.join(WORKFLOWS_DIR, 'autonomous.md'), 'utf8');
    expect(content).toMatch(/Bulk-Edit Task Detection/i);
    expect(content).toMatch(/doc-sync-agent/);
    expect(content).toMatch(/≥5/);
  });

  test('autonomous.md delegates version bump to changelog-agent', () => {
    const content = fs.readFileSync(path.join(WORKFLOWS_DIR, 'autonomous.md'), 'utf8');
    expect(content).toMatch(/changelog-agent.*ENH-057|ENH-057.*changelog-agent/);
    expect(content).toMatch(/single authority/i);
  });

  // --- request.md integration ---
  test('request.md has Step 2B feasibility gate referencing research-agent', () => {
    const content = fs.readFileSync(path.join(WORKFLOWS_DIR, 'request.md'), 'utf8');
    expect(content).toContain('## 2B. Feasibility Gate');
    expect(content).toMatch(/research-agent/);
  });

  test('request.md FEAT template has ## Research Findings section', () => {
    const content = fs.readFileSync(path.join(WORKFLOWS_DIR, 'request.md'), 'utf8');
    expect(content).toContain('## Research Findings');
  });
});
