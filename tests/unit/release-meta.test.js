const fs = require('fs');
const path = require('path');

// DEBT-004 (phase 163): single authoritative version-currency check.
// Per-phase suites assert version SHAPE only; this suite owns the "version is current" invariant.
const ROOT = path.resolve(__dirname, '../..');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const changelog = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8');

describe('Release meta — version currency (DEBT-004)', () => {
  it('package.json version is valid SemVer', () => {
    expect(pkg.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('package.json version matches the latest CHANGELOG [x.y.z] heading', () => {
    const m = changelog.match(/^##\s*\[(\d+\.\d+\.\d+)\]/m);
    expect(m).not.toBeNull();
    expect(pkg.version).toBe(m[1]);
  });
});
