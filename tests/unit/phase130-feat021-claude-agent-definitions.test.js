'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '../..');
const CLAUDE_AGENTS = path.join(ROOT, 'agents/claude-code');

describe('Phase 130 — FEAT-021: Claude Code agent definitions', () => {

  test('agents/claude-code/ directory exists', () => {
    expect(fs.existsSync(CLAUDE_AGENTS)).toBe(true);
  });

  // ── vp-task-executor ──────────────────────────────────────────────────────

  test('vp-task-executor.md exists', () => {
    expect(fs.existsSync(path.join(CLAUDE_AGENTS, 'vp-task-executor.md'))).toBe(true);
  });

  test('vp-task-executor.md has YAML frontmatter with model: claude-haiku-4-5', () => {
    const src = fs.readFileSync(path.join(CLAUDE_AGENTS, 'vp-task-executor.md'), 'utf8');
    expect(src).toMatch(/^---/);
    expect(src).toMatch(/model:\s*claude-haiku-4-5/);
  });

  test('vp-task-executor.md restricts to file tools only (no Agent/WebSearch)', () => {
    const src = fs.readFileSync(path.join(CLAUDE_AGENTS, 'vp-task-executor.md'), 'utf8');
    expect(src).toMatch(/disallowedTools/);
    expect(src).toMatch(/WebSearch/);
    expect(src).toMatch(/Agent/);
  });

  test('vp-task-executor.md has TASK_RESULT output format', () => {
    const src = fs.readFileSync(path.join(CLAUDE_AGENTS, 'vp-task-executor.md'), 'utf8');
    expect(src).toMatch(/TASK_RESULT/);
    expect(src).toMatch(/PASS|FAIL|PARTIAL/);
  });

  // ── vp-phase-planner ─────────────────────────────────────────────────────

  test('vp-phase-planner.md exists', () => {
    expect(fs.existsSync(path.join(CLAUDE_AGENTS, 'vp-phase-planner.md'))).toBe(true);
  });

  test('vp-phase-planner.md uses claude-sonnet-4-6', () => {
    const src = fs.readFileSync(path.join(CLAUDE_AGENTS, 'vp-phase-planner.md'), 'utf8');
    expect(src).toMatch(/model:\s*claude-sonnet-4-6/);
  });

  test('vp-phase-planner.md is read-only (no Edit/Write in tools)', () => {
    const src = fs.readFileSync(path.join(CLAUDE_AGENTS, 'vp-phase-planner.md'), 'utf8');
    expect(src).toMatch(/disallowedTools/);
    // Edit and Write should be in disallowedTools
    const disallowedMatch = src.match(/disallowedTools:([\s\S]*?)(?=\n[a-z]|\n---)/);
    if (disallowedMatch) {
      expect(disallowedMatch[1]).toMatch(/Edit/);
      expect(disallowedMatch[1]).toMatch(/Write/);
    }
  });

  test('vp-phase-planner.md returns clusters JSON structure', () => {
    const src = fs.readFileSync(path.join(CLAUDE_AGENTS, 'vp-phase-planner.md'), 'utf8');
    expect(src).toMatch(/clusters/);
    expect(src).toMatch(/can_parallel/);
    expect(src).toMatch(/sequential_fallback/);
  });

  // ── vp-quality-gate ───────────────────────────────────────────────────────

  test('vp-quality-gate.md exists', () => {
    expect(fs.existsSync(path.join(CLAUDE_AGENTS, 'vp-quality-gate.md'))).toBe(true);
  });

  test('vp-quality-gate.md uses claude-sonnet-4-6', () => {
    const src = fs.readFileSync(path.join(CLAUDE_AGENTS, 'vp-quality-gate.md'), 'utf8');
    expect(src).toMatch(/model:\s*claude-sonnet-4-6/);
  });

  test('vp-quality-gate.md has QUALITY_GATE output format', () => {
    const src = fs.readFileSync(path.join(CLAUDE_AGENTS, 'vp-quality-gate.md'), 'utf8');
    expect(src).toMatch(/QUALITY_GATE/);
  });

  // ── autonomous.md v3 orchestration section ────────────────────────────────

  test('autonomous.md references v3 orchestration agents', () => {
    const w = fs.readFileSync(path.join(ROOT, 'workflows/autonomous.md'), 'utf8');
    expect(w).toMatch(/v3 Orchestration Agents/);
    expect(w).toMatch(/vp-task-executor/);
    expect(w).toMatch(/vp-phase-planner/);
    expect(w).toMatch(/vp-quality-gate/);
  });

  test('autonomous.md references PreToolUse/PostToolUse hooks', () => {
    const w = fs.readFileSync(path.join(ROOT, 'workflows/autonomous.md'), 'utf8');
    expect(w).toMatch(/PreToolUse/);
    expect(w).toMatch(/PostToolUse/);
  });

  // ── claude-code adapter has claudeAgentsDir ───────────────────────────────

  test('claude-code adapter defines claudeAgentsDir function', () => {
    const adapter = require('../../lib/adapters/claude-code.cjs');
    expect(typeof adapter.claudeAgentsDir).toBe('function');
    expect(adapter.claudeAgentsDir('/home/test')).toMatch(/\.claude\/agents/);
  });

  test('claude-code adapter defines claudeAgentsSrc', () => {
    const adapter = require('../../lib/adapters/claude-code.cjs');
    expect(adapter.claudeAgentsSrc).toBe('agents/claude-code');
  });

});
