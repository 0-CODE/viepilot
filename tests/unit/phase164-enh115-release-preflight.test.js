const fs = require('fs');
const path = require('path');

// Phase 164 / ENH-115 — automated npm publish/release preflight gate.
// RESILIENT asserts only (anchor: feedback_resilient_page_count_asserts + DEBT-004):
// no hard-coded version/count literals; assert behavior/shape/wiring, not point-in-time values.
// Exact package-version enforcement lives in the RELEASE GATE (release-preflight.cjs), deliberately
// NOT in unit tests — so per-bump README/badge drift does not fail the dev test suite.

const ROOT = path.resolve(__dirname, '../..');
const preflight = require(path.join(ROOT, 'scripts/release-preflight.cjs'));
const versionRefs = require(path.join(ROOT, 'scripts/lib/version-refs.cjs'));
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

describe('ENH-115 release-preflight — module API', () => {
  it('exports runGates + individual gate functions without throwing on require', () => {
    expect(typeof preflight.runGates).toBe('function');
    for (const fn of [
      'gateGitClean',
      'gateGitBranch',
      'gateGitSynced',
      'gateNpmAuth',
      'gateVersionConsistency',
      'gateStaleVersionRefs',
      'gateNotPublished',
    ]) {
      expect(typeof preflight[fn]).toBe('function');
    }
  });

  it('changelogTopVersion() returns valid SemVer that equals package.json (consistency invariant)', () => {
    const top = preflight.changelogTopVersion();
    expect(top).toMatch(/^\d+\.\d+\.\d+$/);
    expect(top).toBe(pkg.version); // shape-safe: both derive from real files, no frozen literal
  });
});

describe('ENH-115 release-preflight — gate behavior', () => {
  it('content-only mode runs version-consistency and passes on a consistent repo', () => {
    const report = preflight.runGates({ contentOnly: true });
    const vc = report.results.find((r) => r.name === 'version-consistency');
    expect(vc).toBeDefined();
    expect(vc.status).toBe('pass');
    expect(report.ok).toBe(true);
    // content-only must NOT include git/auth gates (dev-safe, DEBT-004 no-friction)
    expect(report.results.some((r) => r.name.startsWith('git-'))).toBe(false);
    expect(report.results.some((r) => r.name === 'npm-auth')).toBe(false);
  });

  it('--local skips the git gates (reported as skip, not fail)', () => {
    for (const name of ['gateGitClean', 'gateGitBranch', 'gateGitSynced']) {
      const res = preflight[name]({ local: true });
      expect(res.status).toBe('skip');
    }
  });

  it('npm-auth gate is skipped when CI / NODE_AUTH_TOKEN is set', () => {
    const saved = { CI: process.env.CI, NODE_AUTH_TOKEN: process.env.NODE_AUTH_TOKEN };
    try {
      process.env.CI = '1';
      delete process.env.NODE_AUTH_TOKEN;
      expect(preflight.gateNpmAuth({}).status).toBe('skip');
    } finally {
      if (saved.CI === undefined) delete process.env.CI;
      else process.env.CI = saved.CI;
      if (saved.NODE_AUTH_TOKEN === undefined) delete process.env.NODE_AUTH_TOKEN;
      else process.env.NODE_AUTH_TOKEN = saved.NODE_AUTH_TOKEN;
    }
  });
});

describe('ENH-115 version-refs — stale reference sweep', () => {
  it('findStaleVersionRefs() returns an array', () => {
    expect(Array.isArray(versionRefs.findStaleVersionRefs())).toBe(true);
  });

  it('flags refs that disagree with an injected expected version, with correct shape', () => {
    // impossible version → every real ref becomes an offender (deterministic, no literal coupling)
    const offenders = versionRefs.findStaleVersionRefs({ expected: '0.0.0-nonexistent' });
    expect(offenders.length).toBeGreaterThan(0);
    for (const o of offenders) {
      expect(o).toEqual(
        expect.objectContaining({
          file: expect.any(String),
          line: expect.any(Number),
          found: expect.stringMatching(/^\d+\.\d+\.\d+/),
          expected: '0.0.0-nonexistent',
        })
      );
    }
  });
});

describe('ENH-115 wiring — package.json + CI', () => {
  it('package.json defines release + release:preflight and wires preflight into verify:release', () => {
    const s = pkg.scripts;
    expect(s.release).toContain('scripts/release.cjs');
    expect(s['release:preflight']).toContain('scripts/release-preflight.cjs');
    expect(s['verify:release']).toContain('release:preflight');
  });

  it('release-npm.yml runs the preflight before publishing', () => {
    const wf = fs.readFileSync(path.join(ROOT, '.github/workflows/release-npm.yml'), 'utf8');
    expect(wf).toMatch(/release:?preflight/);
    // preflight step must appear before the publish step
    expect(wf.indexOf('release:preflight')).toBeLessThan(wf.indexOf('npm publish'));
  });
});
