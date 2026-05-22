'use strict';
const { ADAPTER_CONTEXTS, getAdapterContext, listAdapterIds, detectAdapter } = require('../../lib/adapter-context.cjs');
const fs = require('fs');
const path = require('path');

describe('Phase 127 — FEAT-021: ADAPTER_CONTEXT schema', () => {

  // ── lib/adapter-context.cjs exports ──────────────────────────────────────

  test('listAdapterIds returns 5 canonical adapters', () => {
    const ids = listAdapterIds();
    expect(ids).toHaveLength(5);
    expect(ids).toContain('claude-code');
    expect(ids).toContain('cursor-agent');
    expect(ids).toContain('antigravity');
    expect(ids).toContain('codex');
    expect(ids).toContain('copilot');
  });

  test('getAdapterContext throws on unknown adapter', () => {
    expect(() => getAdapterContext('nonexistent')).toThrow(/Unknown adapter/);
  });

  // ── Claude Code context ───────────────────────────────────────────────────

  test('claude-code: tools.shell is Bash', () => {
    expect(getAdapterContext('claude-code').tools.shell).toBe('Bash');
  });

  test('claude-code: tools.read is Read', () => {
    expect(getAdapterContext('claude-code').tools.read).toBe('Read');
  });

  test('claude-code: tools.search is Grep', () => {
    expect(getAdapterContext('claude-code').tools.search).toBe('Grep');
  });

  test('claude-code: tools.agent is Agent', () => {
    expect(getAdapterContext('claude-code').tools.agent).toBe('Agent');
  });

  test('claude-code: interactive is AUQ', () => {
    expect(getAdapterContext('claude-code').interactive).toBe('AUQ');
  });

  test('claude-code: orchestration.parallel is true', () => {
    expect(getAdapterContext('claude-code').orchestration.parallel).toBe(true);
  });

  test('claude-code: orchestration.teams is true', () => {
    expect(getAdapterContext('claude-code').orchestration.teams).toBe(true);
  });

  test('claude-code: hooks.count is 28', () => {
    expect(getAdapterContext('claude-code').hooks.count).toBe(28);
  });

  // ── Cursor context ────────────────────────────────────────────────────────

  test('cursor-agent: tools.shell is run_terminal_cmd', () => {
    expect(getAdapterContext('cursor-agent').tools.shell).toBe('run_terminal_cmd');
  });

  test('cursor-agent: tools.read is read_file', () => {
    expect(getAdapterContext('cursor-agent').tools.read).toBe('read_file');
  });

  test('cursor-agent: tools.search is grep_search', () => {
    expect(getAdapterContext('cursor-agent').tools.search).toBe('grep_search');
  });

  test('cursor-agent: tools.agent is null (not callable)', () => {
    expect(getAdapterContext('cursor-agent').tools.agent).toBeNull();
  });

  test('cursor-agent: interactive is text', () => {
    expect(getAdapterContext('cursor-agent').interactive).toBe('text');
  });

  test('cursor-agent: orchestration.parallel is false', () => {
    expect(getAdapterContext('cursor-agent').orchestration.parallel).toBe(false);
  });

  test('cursor-agent: mcp.tool_limit is 40', () => {
    expect(getAdapterContext('cursor-agent').mcp.tool_limit).toBe(40);
  });

  // ── Antigravity context ───────────────────────────────────────────────────

  test('antigravity: tools.shell is shell', () => {
    expect(getAdapterContext('antigravity').tools.shell).toBe('shell');
  });

  test('antigravity: interactive is none', () => {
    expect(getAdapterContext('antigravity').interactive).toBe('none');
  });

  test('antigravity: has deprecation_notice', () => {
    expect(getAdapterContext('antigravity').deprecation_notice).toBeTruthy();
    expect(getAdapterContext('antigravity').deprecation_notice).toMatch(/deprecated/i);
  });

  test('antigravity: skill_path_project is .agents/skills', () => {
    expect(getAdapterContext('antigravity').skill_path_project).toBe('.agents/skills');
  });

  // ── Codex context ─────────────────────────────────────────────────────────

  test('codex: tools.shell is container.exec', () => {
    expect(getAdapterContext('codex').tools.shell).toBe('container.exec');
  });

  test('codex: tools.write is apply_patch', () => {
    expect(getAdapterContext('codex').tools.write).toBe('apply_patch');
  });

  // ── Copilot context ───────────────────────────────────────────────────────

  test('copilot: tools.shell is runCommands', () => {
    expect(getAdapterContext('copilot').tools.shell).toBe('runCommands');
  });

  test('copilot: orchestration.parallel is false', () => {
    expect(getAdapterContext('copilot').orchestration.parallel).toBe(false);
  });

  // ── Aliases ───────────────────────────────────────────────────────────────

  test('cursor alias resolves to same context as cursor-agent', () => {
    expect(getAdapterContext('cursor')).toBe(getAdapterContext('cursor-agent'));
  });

  // ── vp-tools commands exist ───────────────────────────────────────────────

  test('detect-adapter command exists in vp-tools.cjs', () => {
    const source = fs.readFileSync(path.join(__dirname, '../../bin/vp-tools.cjs'), 'utf8');
    expect(source).toMatch(/'detect-adapter'/);
  });

  test('validate command exists in vp-tools.cjs', () => {
    const source = fs.readFileSync(path.join(__dirname, '../../bin/vp-tools.cjs'), 'utf8');
    expect(source).toMatch(/\bvalidate\b.*--adapter/);
  });

  // ── autonomous.md ADAPTER_CONTEXT injection ───────────────────────────────

  test('autonomous.md contains ADAPTER_CONTEXT injection section', () => {
    const workflow = fs.readFileSync(path.join(__dirname, '../../workflows/autonomous.md'), 'utf8');
    expect(workflow).toMatch(/ADAPTER_CONTEXT Injection/);
  });

  test('autonomous.md references detect-adapter --json', () => {
    const workflow = fs.readFileSync(path.join(__dirname, '../../workflows/autonomous.md'), 'utf8');
    expect(workflow).toMatch(/detect-adapter --json/);
  });

  test('autonomous.md defines shell tool resolution table', () => {
    const workflow = fs.readFileSync(path.join(__dirname, '../../workflows/autonomous.md'), 'utf8');
    expect(workflow).toMatch(/run_terminal_cmd/);
    expect(workflow).toMatch(/container\.exec/);
  });

  test('autonomous.md defines interactive fallback chain', () => {
    const workflow = fs.readFileSync(path.join(__dirname, '../../workflows/autonomous.md'), 'utf8');
    expect(workflow).toMatch(/Interactive fallback chain/);
    expect(workflow).toMatch(/AUQ.*AskUserQuestion/);
  });

});
