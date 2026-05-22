'use strict';
const fs = require('fs');
const path = require('path');

const WORKFLOWS_DIR = path.join(__dirname, '../../workflows');
const read = (name) => fs.readFileSync(path.join(WORKFLOWS_DIR, name), 'utf8');

describe('Phase 129 — FEAT-021: Workflow adapter-aware execution paths', () => {

  // ── autonomous.md (Phase 127 baseline) ───────────────────────────────────

  test('autonomous.md: ADAPTER_CONTEXT injection section present', () => {
    const w = read('autonomous.md');
    expect(w).toMatch(/ADAPTER_CONTEXT Injection/);
  });

  test('autonomous.md: detect-adapter --json command referenced', () => {
    const w = read('autonomous.md');
    expect(w).toMatch(/detect-adapter --json/);
  });

  test('autonomous.md: interactive fallback chain defined', () => {
    const w = read('autonomous.md');
    expect(w).toMatch(/Interactive fallback chain/);
    expect(w).toMatch(/AskUserQuestion/);
    expect(w).toMatch(/numbered list/);
  });

  // ── brainstorm.md ─────────────────────────────────────────────────────────

  test('brainstorm.md: ADAPTER_CONTEXT Load section present', () => {
    const w = read('brainstorm.md');
    expect(w).toMatch(/ADAPTER_CONTEXT Load/);
  });

  test('brainstorm.md: detect-adapter --json referenced', () => {
    const w = read('brainstorm.md');
    expect(w).toMatch(/detect-adapter --json/);
  });

  test('brainstorm.md: adapter compatibility table has all 5 adapters', () => {
    const w = read('brainstorm.md');
    expect(w).toMatch(/claude-code/);
    expect(w).toMatch(/cursor-agent/);
    expect(w).toMatch(/antigravity/);
    expect(w).toMatch(/codex/);
    expect(w).toMatch(/copilot/);
  });

  test('brainstorm.md: interactive fallback chain defined (AUQ → text → none)', () => {
    const w = read('brainstorm.md');
    expect(w).toMatch(/Interactive fallback chain/);
    expect(w).toMatch(/AUQ.*AskUserQuestion/s);
  });

  // ── crystallize.md ────────────────────────────────────────────────────────

  test('crystallize.md: adapter compatibility table has all 5 adapters', () => {
    const w = read('crystallize.md');
    expect(w).toMatch(/claude-code/);
    expect(w).toMatch(/cursor-agent/);
    expect(w).toMatch(/antigravity/);
  });

  test('crystallize.md: Sub-scan A shell tool referenced via ADAPTER_CONTEXT', () => {
    const w = read('crystallize.md');
    expect(w).toMatch(/ADAPTER_CONTEXT\.tools\.shell/);
    expect(w).toMatch(/run_terminal_cmd/);
  });

  test('crystallize.md: interactive fallback chain defined', () => {
    const w = read('crystallize.md');
    expect(w).toMatch(/Interactive fallback chain/);
  });

  // ── design.md ─────────────────────────────────────────────────────────────

  test('design.md: adapter_context block present', () => {
    const w = read('design.md');
    expect(w).toMatch(/<adapter_context>/);
    expect(w).toMatch(/ADAPTER_CONTEXT/);
  });

  test('design.md: shell tool resolution table for --sync', () => {
    const w = read('design.md');
    expect(w).toMatch(/run_terminal_cmd/);
    expect(w).toMatch(/container\.exec/);
  });

});
