'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const { checkLatestVersion, compareSemver } = require('../../lib/viepilot-update.cjs');

const REPO_ROOT = path.join(__dirname, '..', '..');

// ──────────────────────────────────────────────────────────────────────────────
// Group 1: checkLatestVersion — cache logic
// ──────────────────────────────────────────────────────────────────────────────
describe('ENH-072: checkLatestVersion cache logic', () => {
  let tmpCache;

  beforeEach(() => {
    tmpCache = path.join(os.tmpdir(), `vp-update-test-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
  });

  afterEach(() => {
    try { fs.unlinkSync(tmpCache); } catch (_e) { /* already gone */ }
  });

  test('returns cached result when cache is fresh (no network call)', async () => {
    const freshCache = {
      checked_at: new Date().toISOString(),
      installed: '2.40.0',
      latest: '2.99.0',
      has_update: true,
    };
    fs.writeFileSync(tmpCache, JSON.stringify(freshCache), 'utf8');

    let networkCalled = false;
    const result = await checkLatestVersion({
      cacheFile: tmpCache,
      _fetchFn: async () => { networkCalled = true; return '2.99.9'; },
    });

    expect(networkCalled).toBe(false);
    expect(result.latest).toBe('2.99.0');
  });

  test('writes cache file after successful network fetch', async () => {
    const result = await checkLatestVersion({
      cacheFile: tmpCache,
      _fetchFn: async () => '9.9.9',
      force: true,
    });

    expect(fs.existsSync(tmpCache)).toBe(true);
    const written = JSON.parse(fs.readFileSync(tmpCache, 'utf8'));
    expect(written.latest).toBe('9.9.9');
    expect(typeof written.checked_at).toBe('string');
    expect(typeof written.has_update).toBe('boolean');
  });

  test('opts.force bypasses fresh cache and makes network call', async () => {
    const freshCache = {
      checked_at: new Date().toISOString(),
      installed: '2.40.0',
      latest: '2.40.0',
      has_update: false,
    };
    fs.writeFileSync(tmpCache, JSON.stringify(freshCache), 'utf8');

    let networkCalled = false;
    await checkLatestVersion({
      cacheFile: tmpCache,
      force: true,
      _fetchFn: async () => { networkCalled = true; return '2.40.0'; },
    });

    expect(networkCalled).toBe(true);
  });

  test('returns { upToDate: true } when cache missing and network fails', async () => {
    const result = await checkLatestVersion({
      cacheFile: tmpCache,
      _fetchFn: async () => { throw new Error('network error'); },
    });

    expect(result.upToDate).toBe(true);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Group 2: checkLatestVersion — failure handling
// ──────────────────────────────────────────────────────────────────────────────
describe('ENH-072: checkLatestVersion failure handling', () => {
  let tmpCache;

  beforeEach(() => {
    tmpCache = path.join(os.tmpdir(), `vp-update-fail-${Date.now()}.json`);
  });
  afterEach(() => {
    try { fs.unlinkSync(tmpCache); } catch (_e) { /* gone */ }
  });

  test('network error → returns { upToDate: true } (no throw)', async () => {
    const result = await checkLatestVersion({
      cacheFile: tmpCache,
      _fetchFn: async () => { throw new Error('ECONNREFUSED'); },
    });
    expect(result.upToDate).toBe(true);
  });

  test('timeout error → returns { upToDate: true } (no throw)', async () => {
    const result = await checkLatestVersion({
      cacheFile: tmpCache,
      _fetchFn: async () => { throw new Error('timeout'); },
    });
    expect(result.upToDate).toBe(true);
  });

  test('malformed response (null) → returns { upToDate: true } (no throw)', async () => {
    const result = await checkLatestVersion({
      cacheFile: tmpCache,
      _fetchFn: async () => null,
    });
    expect(result.upToDate).toBe(true);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Group 3: vp-tools check-update subcommand
// ──────────────────────────────────────────────────────────────────────────────
describe('ENH-072: vp-tools check-update subcommand', () => {
  const vpToolsSrc = fs.readFileSync(path.join(REPO_ROOT, 'bin', 'vp-tools.cjs'), 'utf8');

  test('check-update case exists in bin/vp-tools.cjs dispatch', () => {
    expect(vpToolsSrc).toContain("'check-update'");
  });

  test('--silent flag handled in check-update', () => {
    expect(vpToolsSrc).toContain('--silent');
  });

  test('--json flag handled in check-update', () => {
    expect(vpToolsSrc).toContain('--json');
  });

  test('--force flag handled in check-update', () => {
    expect(vpToolsSrc).toContain('--force');
  });

  test('check-update appears in help/usage output text', () => {
    expect(vpToolsSrc).toContain('check-update');
    // check it appears multiple times (dispatch + help)
    const count = (vpToolsSrc.match(/check-update/g) || []).length;
    expect(count).toBeGreaterThanOrEqual(3);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Group 4: SKILL.md version_check blocks
// ──────────────────────────────────────────────────────────────────────────────
describe('ENH-072: SKILL.md <version_check> blocks', () => {
  const skillsDir = path.join(REPO_ROOT, 'skills');
  const vpSkills = fs.readdirSync(skillsDir).filter((d) => {
    const stat = fs.statSync(path.join(skillsDir, d));
    return stat.isDirectory() && d.startsWith('vp-');
  });
  const skillsWithFile = vpSkills.filter((d) =>
    fs.existsSync(path.join(skillsDir, d, 'SKILL.md'))
  );

  test('all vp-* SKILL.md files contain <version_check> block', () => {
    const missing = skillsWithFile.filter((skill) => {
      const content = fs.readFileSync(path.join(skillsDir, skill, 'SKILL.md'), 'utf8');
      return !content.includes('<version_check>');
    });
    expect(missing).toEqual([]);
  });

  test('<version_check> block is positioned after </greeting> in every SKILL.md', () => {
    const wrongOrder = skillsWithFile.filter((skill) => {
      const content = fs.readFileSync(path.join(skillsDir, skill, 'SKILL.md'), 'utf8');
      const greetingEnd = content.indexOf('</greeting>');
      const versionCheckStart = content.indexOf('<version_check>');
      if (greetingEnd === -1 || versionCheckStart === -1) return false;
      return versionCheckStart < greetingEnd; // wrong: version_check before </greeting>
    });
    expect(wrongOrder).toEqual([]);
  });

  test('<version_check> block contains bash command and notice banner', () => {
    const sampleContent = fs.readFileSync(
      path.join(skillsDir, 'vp-auto', 'SKILL.md'), 'utf8'
    );
    expect(sampleContent).toContain('check-update --silent');
    expect(sampleContent).toContain('✨ ViePilot');
    expect(sampleContent).toContain('npm i -g viepilot');
  });

  test('<version_check> block contains suppression rules', () => {
    const sampleContent = fs.readFileSync(
      path.join(skillsDir, 'vp-brainstorm', 'SKILL.md'), 'utf8'
    );
    expect(sampleContent).toContain('--no-update-check');
    expect(sampleContent).toContain('update.check: false');
    expect(sampleContent).toContain('update_check_done');
  });
});
