'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '../..');
const AUTONOMOUS_MD = path.join(ROOT, 'workflows/autonomous.md');

describe('Phase 133 — FEAT-021: vp-auto Orchestration Refactor (fan-out dispatch)', () => {

  let src;
  beforeAll(() => {
    src = fs.readFileSync(AUTONOMOUS_MD, 'utf8');
  });

  // ── Orchestration mode selection ──────────────────────────────────────────

  test('autonomous.md references ADAPTER_PARALLEL for mode selection', () => {
    expect(src).toMatch(/ADAPTER_PARALLEL/);
  });

  test('autonomous.md has ORCHESTRATOR MODE and SEQUENTIAL MODE branches', () => {
    expect(src).toMatch(/ORCHESTRATOR MODE/);
    expect(src).toMatch(/SEQUENTIAL MODE/);
  });

  test('autonomous.md documents fan-out dispatch', () => {
    expect(src).toMatch(/fan-out/i);
    expect(src).toMatch(/fan-out dispatch/i);
  });

  // ── Dependency resolution (vp-phase-planner) ────────────────────────────

  test('autonomous.md documents vp-phase-planner dependency resolution step', () => {
    expect(src).toMatch(/vp-phase-planner/);
    expect(src).toMatch(/Dependency resolution/i);
  });

  test('autonomous.md documents clusters JSON schema with can_parallel and sequential_fallback', () => {
    expect(src).toMatch(/can_parallel/);
    expect(src).toMatch(/sequential_fallback/);
    expect(src).toMatch(/clusters/);
  });

  // ── Fan-out dispatch ──────────────────────────────────────────────────────

  test('autonomous.md documents parallel Agent calls per cluster', () => {
    expect(src).toMatch(/simultaneously/i);
  });

  test('autonomous.md documents vp-task-executor dispatch', () => {
    expect(src).toMatch(/vp-task-executor/);
    expect(src).toMatch(/TASK_RESULT/);
  });

  // ── Model tiering ─────────────────────────────────────────────────────────

  test('autonomous.md documents model tiering (Haiku workers, Sonnet orchestrator)', () => {
    expect(src).toMatch(/Model tiering/i);
    expect(src).toMatch(/claude-haiku-4-5/);
    expect(src).toMatch(/claude-sonnet-4-6/);
    expect(src).toMatch(/model_override/);
  });

  // ── Quality gate ──────────────────────────────────────────────────────────

  test('autonomous.md documents vp-quality-gate after cluster completion', () => {
    expect(src).toMatch(/vp-quality-gate/);
    expect(src).toMatch(/QUALITY_GATE/);
    expect(src).toMatch(/QUALITY_GATE: PASS\|FAIL\|PARTIAL/);
  });

  // ── Agent Teams mode ─────────────────────────────────────────────────────

  test('autonomous.md documents Agent Teams mode for large phases (≥8 tasks)', () => {
    expect(src).toMatch(/Teams mode/i);
    expect(src).toMatch(/orchestration\.teams/);
  });

  // ── Sequential fallback ───────────────────────────────────────────────────

  test('autonomous.md documents sequential fallback for non-claude-code adapters', () => {
    expect(src).toMatch(/3b-seq.*Sequential Mode|Sequential Mode.*non-Claude/is);
  });

  test('autonomous.md sequential fallback mentions Cursor and Antigravity', () => {
    // The 3b-seq section mentions adapters in its description
    expect(src).toMatch(/Cursor.*Antigravity|Antigravity.*Cursor/s);
  });

  // ── ADAPTER_CONTEXT.orchestration references ──────────────────────────────

  test('autonomous.md references ADAPTER_CONTEXT.orchestration at least twice', () => {
    const hits = (src.match(/ADAPTER_CONTEXT\.orchestration/g) || []).length;
    expect(hits).toBeGreaterThanOrEqual(2);
  });

});
