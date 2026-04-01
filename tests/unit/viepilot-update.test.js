const path = require('path');
const {
  classifyInstall,
  compareSemver,
  buildUpdatePlan,
} = require('../../lib/viepilot-update.cjs');

describe('viepilot-update', () => {
  test('compareSemver orders versions', () => {
    expect(compareSemver('1.5.0', '1.5.1')).toBe(-1);
    expect(compareSemver('1.6.0', '1.5.1')).toBe(1);
    expect(compareSemver('1.5.1', '1.5.1')).toBe(0);
    expect(compareSemver('1.10.0', '1.9.0')).toBe(1);
  });

  test('classifyInstall local project dependency', () => {
    const root = path.join('/tmp', 'myapp', 'node_modules', 'viepilot');
    const r = classifyInstall(root, false, null);
    expect(r.mode).toBe('local');
    expect(r.cwd).toBe(path.join('/tmp', 'myapp'));
    expect(r.npmArgs).toEqual(['install', 'viepilot@latest']);
  });

  test('classifyInstall forceGlobal', () => {
    const r = classifyInstall('/any/path', true, null);
    expect(r.mode).toBe('global');
    expect(r.npmArgs).toEqual(['install', '-g', 'viepilot@latest']);
  });

  test('classifyInstall matches global viepilot path', () => {
    const g = path.join('/usr', 'lib', 'node_modules', 'viepilot');
    const r = classifyInstall(g, false, g);
    expect(r.mode).toBe('global');
    expect(r.ambiguous).toBe(false);
  });

  test('classifyInstall ambiguous when not local and not global match', () => {
    const r = classifyInstall('/src/viepilot', false, '/other/node_modules/viepilot');
    expect(r.mode).toBe('global');
    expect(r.ambiguous).toBe(true);
  });

  test('buildUpdatePlan resolves repo and returns shape', () => {
    const repoRoot = path.join(__dirname, '..', '..');
    const plan = buildUpdatePlan({ startDir: path.join(repoRoot, 'bin') });
    expect(plan.ok).toBe(true);
    if (plan.alreadyLatest) {
      expect(plan).toHaveProperty('installedVersion');
      expect(plan).toHaveProperty('latestVersion');
    } else {
      expect(plan).toHaveProperty('npmArgs');
      expect(plan).toHaveProperty('displayCommand');
    }
  });
});
