'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { buildInstallPlan, applyInstallPlan } = require('../../lib/viepilot-install.cjs');

const ROOT = path.join(__dirname, '..', '..');

describe('Phase 175 — BUG-034: dependency install in the installed copy', () => {
  let home;
  beforeEach(() => { home = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-deps-')); });
  afterEach(() => fs.rmSync(home, { recursive: true, force: true }));

  test('plan copies package-lock.json and adds a deps_install step after it', () => {
    const plan = buildInstallPlan(ROOT, { VIEPILOT_AUTO_YES: '1' }, {});
    const idx = (pred) => plan.steps.findIndex(pred);
    const lock = idx((s) => s.kind === 'copy_file' && s.from.endsWith('package-lock.json'));
    const deps = idx((s) => s.kind === 'deps_install');
    expect(lock).toBeGreaterThan(-1);
    expect(deps).toBeGreaterThan(lock);
    expect(plan.steps[deps]).toMatchObject({ useCi: true });
    expect(plan.steps[deps].dir).toMatch(/viepilot$/);
  });

  test('--skip-deps (VIEPILOT_SKIP_DEPS=1) replaces the step with a note carrying the manual command', () => {
    const plan = buildInstallPlan(ROOT, { VIEPILOT_AUTO_YES: '1', VIEPILOT_SKIP_DEPS: '1' }, {});
    expect(plan.steps.some((s) => s.kind === 'deps_install')).toBe(false);
    const note = plan.steps.find((s) => s.id === 'deps_skipped');
    expect(note.message).toMatch(/npm ci --omit=dev/);
  });

  test('dry-run prints the exact command and runs nothing', () => {
    const plan = buildInstallPlan(ROOT, { VIEPILOT_AUTO_YES: '1' }, {});
    const calls = [];
    const res = applyInstallPlan({ ...plan, steps: plan.steps.filter((s) => s.kind === 'deps_install') }, { dryRun: true, runCommand: (...a) => calls.push(a) });
    expect(calls).toEqual([]);
    expect(res.logs.join('\n')).toMatch(/\[dry-run\] deps_install .*viepilot: npm ci --omit=dev --no-audit --no-fund/);
  });

  test('real run calls the runner in the installed dir; npm install when there is no lock file', () => {
    const calls = [];
    const runCommand = (cmd, args, opts) => { calls.push({ cmd, args, cwd: opts.cwd }); return { status: 0 }; };
    const steps = [{ kind: 'deps_install', dir: home, useCi: true }, { kind: 'deps_install', dir: home, useCi: false }];
    const res = applyInstallPlan({ steps, env: {} }, { runCommand });
    expect(res.ok).toBe(true);
    expect(calls).toEqual([
      { cmd: 'npm', args: ['ci', '--omit=dev', '--no-audit', '--no-fund'], cwd: home },
      { cmd: 'npm', args: ['install', '--omit=dev', '--no-audit', '--no-fund'], cwd: home },
    ]);
  });

  test('a failing install is a warning with the manual command — the install still succeeds', () => {
    const res = applyInstallPlan({ steps: [{ kind: 'deps_install', dir: home, useCi: true }], env: {} }, { runCommand: () => ({ status: 1 }) });
    expect(res.ok).toBe(true);
    expect(res.logs.join('\n')).toContain(`warning: deps_install failed in ${home} — run manually: cd "${home}" && npm ci --omit=dev`);
    const thrown = applyInstallPlan({ steps: [{ kind: 'deps_install', dir: home, useCi: true }], env: {} }, { runCommand: () => { throw new Error('ENOENT npm'); } });
    expect(thrown.ok).toBe(true);
    expect(thrown.logs.join('\n')).toMatch(/warning: deps_install failed/);
  });

  test('the default runner honours VIEPILOT_SKIP_DEPS in the process (tests never hit the network)', () => {
    expect(process.env.VIEPILOT_SKIP_DEPS).toBe('1');
    const res = applyInstallPlan({ steps: [{ kind: 'deps_install', dir: home, useCi: true }], env: {} }, {});
    expect(res.logs.join('\n')).toMatch(/deps_install skipped \(VIEPILOT_SKIP_DEPS=1\)/);
  });

  test('CLI help documents --skip-deps', () => {
    const src = fs.readFileSync(path.join(ROOT, 'bin', 'viepilot.cjs'), 'utf8');
    expect(src).toMatch(/--skip-deps\s+Do not install runtime dependencies/);
    expect(src).toMatch(/VIEPILOT_SKIP_DEPS: '1'/);
  });
});
