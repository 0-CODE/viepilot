const path = require('path');
const { spawnSync } = require('child_process');
const os = require('os');
const fs = require('fs');

const CLI = path.join(__dirname, '../../bin/viepilot.cjs');
const {
  parseInstallArgs,
  parseUninstallArgs,
  normalizeTargets,
  createSelectorState,
  applySelectorKey,
  computeUninstallPaths,
} = require('../../bin/viepilot.cjs');

describe('guided installer parser', () => {
  test('parses target and flags', () => {
    const opts = parseInstallArgs(['--target', 'cursor-agent', '--yes', '--dry-run']);
    expect(opts.targets).toBe('cursor-agent');
    expect(opts.yes).toBe(true);
    expect(opts.dryRun).toBe(true);
  });

  test('supports --list-targets flag', () => {
    const opts = parseInstallArgs(['--list-targets']);
    expect(opts.listTargets).toBe(true);
  });

  test('parses uninstall flags', () => {
    const opts = parseUninstallArgs(['--target', 'cursor-agent', '--yes', '--dry-run']);
    expect(opts.targets).toBe('cursor-agent');
    expect(opts.yes).toBe(true);
    expect(opts.dryRun).toBe(true);
  });

  test('normalizes all targets', () => {
    const targets = normalizeTargets('all');
    expect(targets).toEqual(['claude-code', 'cursor-agent', 'cursor-ide']);
  });

  test('throws on unsupported target', () => {
    expect(() => normalizeTargets('unknown')).toThrow('Unsupported target');
  });
});

describe('interactive selector state machine', () => {
  test('moves cursor and toggles selections in multi mode', () => {
    const state0 = createSelectorState(
      [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }, { id: 'c', label: 'C' }],
      'multi'
    );
    const state1 = applySelectorKey(state0, 'down');
    const state2 = applySelectorKey(state1, 'space');
    const state3 = applySelectorKey(state2, 'up');
    expect(state1.cursor).toBe(1);
    expect(state2.selected.has(1)).toBe(true);
    expect(state3.cursor).toBe(0);
  });
});

describe('guided installer CLI', () => {
  test('prints targets list', () => {
    const result = spawnSync('node', [CLI, '--list-targets'], {
      encoding: 'utf8',
      env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
    });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('claude-code');
    expect(result.stdout).toContain('cursor-agent');
    expect(result.stdout).toContain('cursor-ide');
  });

  test('supports dry-run with non-interactive target', () => {
    const result = spawnSync('node', [CLI, 'install', '--target', 'cursor-agent', '--yes', '--dry-run'], {
      encoding: 'utf8',
      env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
    });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Selected targets: cursor-agent');
    expect(result.stdout).toContain('[dry-run]');
  });

  test('dry-run with claude-code target plans ~/.claude/skills', () => {
    const result = spawnSync('node', [CLI, 'install', '--target', 'claude-code', '--yes', '--dry-run'], {
      encoding: 'utf8',
      env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
    });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Selected targets: claude-code');
    expect(result.stdout).toContain('.claude/skills');
    expect(result.stdout).toContain('[dry-run]');
  });

  test('supports uninstall dry-run in non-interactive mode', () => {
    const home = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-home-'));
    const result = spawnSync('node', [CLI, 'uninstall', '--yes', '--dry-run'], {
      encoding: 'utf8',
      env: { ...process.env, HOME: home, FORCE_COLOR: '0', NO_COLOR: '1' },
    });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Uninstall summary:');
  });

  test('computeUninstallPaths includes root install dir', () => {
    const paths = computeUninstallPaths(['cursor-agent']);
    expect(paths.some((p) => p.endsWith('/.cursor/viepilot'))).toBe(true);
  });

  test('computeUninstallPaths lists ~/.claude/skills/vp-* when claude-code target', () => {
    const home = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-uninst-claude-'));
    const skillDir = path.join(home, '.claude', 'skills', 'vp-ztest');
    fs.mkdirSync(skillDir, { recursive: true });
    fs.writeFileSync(path.join(skillDir, 'SKILL.md'), '---\nname: vp-ztest\n---\n', 'utf8');
    const prev = process.env.HOME;
    process.env.HOME = home;
    try {
      const paths = computeUninstallPaths(['claude-code']);
      expect(paths).toContain(path.join(home, '.claude', 'skills', 'vp-ztest'));
    } finally {
      process.env.HOME = prev;
    }
  });
});
