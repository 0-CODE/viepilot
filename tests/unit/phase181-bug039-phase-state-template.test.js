'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..', '..');
const VP = path.join(ROOT, 'bin', 'vp-tools.cjs');
const mirror = require(path.join(ROOT, 'lib', 'todo-mirror.cjs'));

const made = [];
function tmp(prefix) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  made.push(d);
  return d;
}
afterAll(() => made.forEach((d) => fs.rmSync(d, { recursive: true, force: true })));

function createPhaseFromTemplate({ dirName = '181-test', taskFormat = 'new' }) {
  const root = tmp('vp181-fx-');
  const pd = path.join(root, '.viepilot', 'phases', dirName);
  fs.mkdirSync(path.join(pd, 'tasks'), { recursive: true });

  let phaseStateContent;
  if (taskFormat === 'new') {
    // New format: ## Tasks with | Task | Title | Status | ...
    const table = [
      '| Task | Title | Status | Started | Completed | Git Tag |',
      '|------|-------|--------|---------|-----------|---------|',
      '| 181.1 | First task | pending | | | |',
      '| 181.2 | Second task | pending | | | |',
    ].join('\n');
    phaseStateContent = `# Phase 181: Bug 039 - State\n\n## Overview\n- **Started**: 2026-11-18\n- **Status**: in_progress\n- **Progress**: 0/2 tasks (0%)\n- **Current Task**: 181.1\n\n## Tasks\n${table}\n\n## Notes\nTest fixture\n\n## Todo\n- [ ] [vp] 181.1 — First task\n- [ ] [vp] 181.2 — Second task\n`;
  } else if (taskFormat === 'legacy') {
    // Legacy format: ## Task Status with | # | Task | Status | ...
    const table = [
      '| # | Task | Status | Started | Completed | Git Tag |',
      '|---|------|--------|---------|-----------|---------|',
      '| 1 | 181.1 | pending | | | |',
      '| 2 | 181.2 | pending | | | |',
    ].join('\n');
    phaseStateContent = `# Phase 181: Bug 039 - State\n\n## Overview\n- **Started**: 2026-11-18\n- **Status**: in_progress\n- **Progress**: 0/2 tasks (0%)\n- **Current Task**: 181.1\n\n## Task Status\n${table}\n\n## Notes\nTest fixture\n\n## Todo\n- [ ] [vp] 181.1 — First task\n- [ ] [vp] 181.2 — Second task\n`;
  }

  fs.writeFileSync(path.join(pd, 'PHASE-STATE.md'), phaseStateContent);
  fs.writeFileSync(path.join(pd, 'tasks', '181.1.md'), '# Task 181.1 — First task\n');
  fs.writeFileSync(path.join(pd, 'tasks', '181.2.md'), '# Task 181.2 — Second task\n');

  return { root, pd, state: path.join(pd, 'PHASE-STATE.md') };
}

function vp(cwd, args, home) {
  return spawnSync('node', [VP, ...args], {
    cwd, encoding: 'utf8', input: '',
    env: { ...process.env, HOME: home || tmp('vp181-home-'), USERPROFILE: home || '' },
  });
}

describe('phase181-bug039: PHASE-STATE template matches todo-mirror parser', () => {
  test('new format (## Tasks) passes todo check', () => {
    const fx = createPhaseFromTemplate({ taskFormat: 'new' });
    const result = vp(fx.root, ['todo', 'check', '--phase', '181']);
    expect(result.status).toBe(0);
  });

  test('legacy format (## Task Status) passes todo check', () => {
    const fx = createPhaseFromTemplate({ taskFormat: 'legacy' });
    const result = vp(fx.root, ['todo', 'check', '--phase', '181']);
    expect(result.status).toBe(0);
  });

  test('new format: sync and check idempotent', () => {
    const fx = createPhaseFromTemplate({ taskFormat: 'new' });
    const r1 = vp(fx.root, ['todo', 'sync', '--phase', '181']);
    expect(r1.status).toBe(0);
    const a = fs.readFileSync(fx.state, 'utf8');
    const r2 = vp(fx.root, ['todo', 'sync', '--phase', '181']);
    expect(r2.status).toBe(0);
    const b = fs.readFileSync(fx.state, 'utf8');
    expect(b).toBe(a);
  });

  test('legacy format: sync and check idempotent', () => {
    const fx = createPhaseFromTemplate({ taskFormat: 'legacy' });
    const r1 = vp(fx.root, ['todo', 'sync', '--phase', '181']);
    expect(r1.status).toBe(0);
    const a = fs.readFileSync(fx.state, 'utf8');
    const r2 = vp(fx.root, ['todo', 'sync', '--phase', '181']);
    expect(r2.status).toBe(0);
    const b = fs.readFileSync(fx.state, 'utf8');
    expect(b).toBe(a);
  });

  test('readPhase: new format - tasks have correct ids and titles', () => {
    const fx = createPhaseFromTemplate({ taskFormat: 'new' });
    const phase = mirror.readPhase(fx.root, '181');
    expect(phase.tasks).toHaveLength(2);
    expect(phase.tasks[0].id).toBe('181.1');
    expect(phase.tasks[0].title).toContain('First task');
    expect(phase.tasks[1].id).toBe('181.2');
    expect(phase.tasks[1].title).toContain('Second task');
  });

  test('readPhase: legacy format - tasks have correct ids and titles', () => {
    const fx = createPhaseFromTemplate({ taskFormat: 'legacy' });
    const phase = mirror.readPhase(fx.root, '181');
    expect(phase.tasks).toHaveLength(2);
    expect(phase.tasks[0].id).toBe('181.1');
    expect(phase.tasks[0].title).toContain('First task');
    expect(phase.tasks[1].id).toBe('181.2');
    expect(phase.tasks[1].title).toContain('Second task');
  });
});
