const path = require('path');
const { spawnSync } = require('child_process');

const CLI = path.join(__dirname, '../../bin/viepilot.cjs');
const { parseInstallArgs, normalizeTargets } = require('../../bin/viepilot.cjs');

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

  test('normalizes all targets', () => {
    const targets = normalizeTargets('all');
    expect(targets).toEqual(['claude-code', 'cursor-agent', 'cursor-ide']);
  });

  test('throws on unsupported target', () => {
    expect(() => normalizeTargets('unknown')).toThrow('Unsupported target');
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
});
