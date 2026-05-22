'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '../..');
const adapterContext = require('../../lib/adapter-context.cjs');

describe('Phase 132 — FEAT-021: Adapter detection + ADAPTER_CONTEXT integration', () => {

  // ── lib/adapter-context.cjs completeness ─────────────────────────────────

  test('all 5 adapters are defined in ADAPTER_CONTEXTS', () => {
    const ids = adapterContext.listAdapterIds();
    expect(ids).toContain('claude-code');
    expect(ids).toContain('cursor-agent');
    expect(ids).toContain('antigravity');
    expect(ids).toContain('codex');
    expect(ids).toContain('copilot');
    expect(ids).toHaveLength(5);
  });

  test('each adapter context has required fields: tools, interactive, orchestration, hooks, mcp', () => {
    const ids = adapterContext.listAdapterIds();
    for (const id of ids) {
      const ctx = adapterContext.getAdapterContext(id);
      expect(ctx).toHaveProperty('tools');
      expect(ctx).toHaveProperty('interactive');
      expect(ctx).toHaveProperty('orchestration');
      expect(ctx).toHaveProperty('hooks');
      expect(ctx).toHaveProperty('mcp');
    }
  });

  test('claude-code adapter has Agent tool defined (not null)', () => {
    const ctx = adapterContext.getAdapterContext('claude-code');
    expect(ctx.tools.agent).toBeTruthy();
    expect(ctx.tools.agent).not.toBeNull();
  });

  test('cursor-agent, antigravity, copilot have null agent tool (no parallel dispatch)', () => {
    const noAgentAdapters = ['cursor-agent', 'antigravity', 'copilot'];
    for (const id of noAgentAdapters) {
      const ctx = adapterContext.getAdapterContext(id);
      expect(ctx.tools.agent).toBeNull();
    }
  });

  test('codex has subagent tool (limited single-level spawn)', () => {
    const ctx = adapterContext.getAdapterContext('codex');
    expect(ctx.tools.agent).toBe('subagent');
  });

  test('claude-code orchestration.parallel is true', () => {
    const ctx = adapterContext.getAdapterContext('claude-code');
    expect(ctx.orchestration.parallel).toBe(true);
  });

  test('non-claude-code adapters have orchestration.parallel false or missing', () => {
    const ids = ['cursor-agent', 'antigravity', 'codex', 'copilot'];
    for (const id of ids) {
      const ctx = adapterContext.getAdapterContext(id);
      expect(ctx.orchestration.parallel).toBeFalsy();
    }
  });

  test('claude-code tools.shell is Bash', () => {
    const ctx = adapterContext.getAdapterContext('claude-code');
    expect(ctx.tools.shell).toBe('Bash');
  });

  test('cursor-agent tools.shell is run_terminal_cmd', () => {
    const ctx = adapterContext.getAdapterContext('cursor-agent');
    expect(ctx.tools.shell).toBe('run_terminal_cmd');
  });

  test('detectAdapter returns a valid adapter id', () => {
    const id = adapterContext.detectAdapter();
    const validIds = adapterContext.listAdapterIds();
    expect(validIds).toContain(id);
  });

  test('getAdapterContext throws for unknown id', () => {
    expect(() => adapterContext.getAdapterContext('unknown-xyz')).toThrow(/Unknown adapter/i);
  });

  // ── vp-tools detect-adapter command ──────────────────────────────────────

  test('vp-tools detect-adapter --json outputs valid JSON with adapterId', () => {
    let output;
    try {
      output = execSync('node bin/vp-tools.cjs detect-adapter --json', {
        cwd: ROOT, encoding: 'utf8', timeout: 10000
      });
    } catch (e) {
      output = e.stdout || '';
    }
    // Should output JSON
    const jsonStart = output.indexOf('{');
    expect(jsonStart).toBeGreaterThanOrEqual(0);
    const json = JSON.parse(output.slice(jsonStart));
    // detect-adapter --json outputs { adapter: '...', name: '...', ... }
    expect(json).toHaveProperty('adapter');
  });

  test('vp-tools validate --adapter claude-code exits 0', () => {
    let exitCode = 0;
    try {
      execSync('node bin/vp-tools.cjs validate --adapter claude-code', {
        cwd: ROOT, encoding: 'utf8', timeout: 10000
      });
    } catch (e) {
      exitCode = e.status || 1;
    }
    expect(exitCode).toBe(0);
  });

});
