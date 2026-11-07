'use strict';

/**
 * Hotfix (3.16.1): the installer copied only templates/{project,phase,architect},
 * so templates/proposal (prompt-contract, review-personas, persona-review-prompt)
 * never reached the install; and `install --yes` reset language.communication to 'en'.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const { buildInstallPlan } = require('../../lib/viepilot-install.cjs');

const REPO_ROOT = path.join(__dirname, '../..');
const BIN = path.join(REPO_ROOT, 'bin', 'viepilot.cjs');

describe('hotfix — install copies every templates/ entry', () => {
  const plan = buildInstallPlan(REPO_ROOT, { VIEPILOT_AUTO_YES: '1' }, {});
  const copySources = plan.steps
    .filter((s) => s.kind === 'copy_dir' || s.kind === 'copy_file')
    .map((s) => path.relative(REPO_ROOT, s.from));

  test.each(fs.readdirSync(path.join(REPO_ROOT, 'templates')))('templates/%s is copied', (name) => {
    expect(copySources).toContain(path.join('templates', name));
  });

  test('templates/proposal lands under the viepilot install dir', () => {
    const step = plan.steps.find((s) => s.kind === 'copy_dir' && s.from.endsWith(path.join('templates', 'proposal')));
    expect(step).toBeDefined();
    expect(step.to).toMatch(/viepilot[\\/]templates[\\/]proposal$/);
  });
});

describe('hotfix — install --yes keeps an existing language choice', () => {
  let home;
  beforeEach(() => {
    home = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-hotfix-lang-'));
  });
  afterEach(() => {
    fs.rmSync(home, { recursive: true, force: true });
  });

  function runDry() {
    return spawnSync(process.execPath, [BIN, 'install', '--target', 'claude-code', '--yes', '--dry-run'], {
      env: { ...process.env, HOME: home, USERPROFILE: home, VIEPILOT_SKIP_UPDATE_CHECK: '1' },
      encoding: 'utf8',
      timeout: 60000,
    });
  }

  test('existing communication=vi is preserved', () => {
    fs.mkdirSync(path.join(home, '.viepilot'), { recursive: true });
    fs.writeFileSync(
      path.join(home, '.viepilot', 'config.json'),
      JSON.stringify({ language: { communication: 'vi', document: 'en' } }),
    );
    const r = runDry();
    expect(r.stdout).toMatch(/Communication language: vi/);
    expect(r.stdout).toMatch(/communication=vi/);
  });

  test('no config falls back to en', () => {
    const r = runDry();
    expect(r.stdout).toMatch(/Communication language: en/);
  });
});
