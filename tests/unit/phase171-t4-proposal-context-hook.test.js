'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..', '..');
const HOOK = path.join(ROOT, 'lib', 'hooks', 'proposal-context-hook.cjs');
const VP = path.join(ROOT, 'bin', 'vp-tools.cjs');
const session = require('../../lib/proposal-session.cjs');

const runHook = (payload) => spawnSync(process.execPath, [HOOK], { input: JSON.stringify(payload), encoding: 'utf8' });

describe('Phase 171.4 — proposal context hook', () => {
  let proj;
  beforeEach(() => {
    proj = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-ctx-'));
    fs.mkdirSync(path.join(proj, 'docs', 'proposals'), { recursive: true });
  });
  afterEach(() => fs.rmSync(proj, { recursive: true, force: true }));

  test('silent without an active session', () => {
    const r = runHook({ cwd: proj, hook_event_name: 'UserPromptSubmit' });
    expect(r.status).toBe(0);
    expect(r.stdout).toBe('');
  });

  test('prints slug, step, pending gate and the re-entry rule; works from a subdirectory', () => {
    session.startSession(proj, 'crm');
    session.recordStep(proj, 'crm', 'outline');
    session.setPendingGate(proj, 'crm', 'outline:output');
    fs.mkdirSync(path.join(proj, 'sub', 'deep'), { recursive: true });
    const r = runHook({ cwd: path.join(proj, 'sub', 'deep'), hook_event_name: 'UserPromptSubmit' });
    expect(r.status).toBe(0);
    expect(r.stdout).toMatch(/slug: crm/);
    expect(r.stdout).toMatch(/step: outline/);
    expect(r.stdout).toMatch(/pending gate: outline:output/);
    expect(r.stdout).toMatch(/\/vp-proposal --resume/);
    expect(r.stdout).toMatch(/AskUserQuestion/);
  });

  test('SessionStart adds the "do not ask confirmed decisions again" line', () => {
    session.startSession(proj, 'crm');
    const r = runHook({ cwd: proj, hook_event_name: 'SessionStart' });
    expect(r.stdout).toMatch(/do not ask them again/);
  });

  test('malformed input never blocks', () => {
    const r = spawnSync(process.execPath, [HOOK], { input: 'not json', encoding: 'utf8' });
    expect(r.status).toBe(0);
  });
});

describe('Phase 171.4 — hooks install --proposal-context', () => {
  let home;
  beforeEach(() => { home = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-ctx-home-')); });
  afterEach(() => fs.rmSync(home, { recursive: true, force: true }));
  const run = (...a) => spawnSync(process.execPath, [VP, 'hooks', 'install', '--proposal-context', ...a],
    { env: { ...process.env, HOME: home, USERPROFILE: home }, encoding: 'utf8' });

  test('dry-run writes nothing; --yes registers both events once; re-run is idempotent', () => {
    run('--dry-run');
    expect(fs.existsSync(path.join(home, '.claude', 'settings.json'))).toBe(false);
    expect(run('--yes').status).toBe(0);
    expect(run('--yes').stdout).toMatch(/already installed/);
    const hooks = JSON.parse(fs.readFileSync(path.join(home, '.claude', 'settings.json'), 'utf8')).hooks;
    expect(hooks.UserPromptSubmit).toHaveLength(1);
    expect(hooks.SessionStart).toHaveLength(1);
    expect(hooks.SessionStart[0].matcher).toBe('startup|resume|compact');
    expect(hooks.UserPromptSubmit[0].hooks[0].command).toMatch(/proposal-context-hook\.cjs$/);
  });

  test('non-interactive without --yes does not write', () => {
    const r = run();
    expect(r.status).toBe(0);
    expect(fs.existsSync(path.join(home, '.claude', 'settings.json'))).toBe(false);
  });
});
