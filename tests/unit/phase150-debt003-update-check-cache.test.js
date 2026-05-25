'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '../..');
const today = new Date().toISOString().split('T')[0];
const guardFile = path.join(os.tmpdir(), `vp-update-check-${today}.done`);

afterAll(() => {
  // Remove seeded guard file so we don't pollute real session
  try { if (fs.existsSync(guardFile)) fs.unlinkSync(guardFile); } catch (_) {}
});

describe('Phase 150 — DEBT-003: check-update OS session guard', () => {
  describe('A) bin/vp-tools.cjs source — guard logic', () => {
    const src = fs.readFileSync(path.join(ROOT, 'bin/vp-tools.cjs'), 'utf8');

    test('source references vp-update-check guard file', () => {
      expect(src).toMatch(/vp-update-check/);
    });

    test('source uses os.tmpdir() for guard file location', () => {
      expect(src).toMatch(/tmpdir/);
    });

    test('source writes guard file after check', () => {
      expect(src).toMatch(/writeFileSync.*guardFile|_gf|gf.*writeFile/s);
    });

    test('source reads guard file for fast-path (existsSync)', () => {
      expect(src).toMatch(/existsSync/);
    });

    test('--force bypasses guard (guard skipped when force=true)', () => {
      expect(src).toMatch(/force.*guard|!force/s);
    });
  });

  describe('B) lib/viepilot-update.cjs — 6h TTL', () => {
    const updateLib = fs.readFileSync(path.join(ROOT, 'lib/viepilot-update.cjs'), 'utf8');

    test('TTL_MS is 6 hours', () => {
      expect(updateLib).toContain('6 * 60 * 60 * 1000');
    });

    test('TTL_MS is NOT 24 hours', () => {
      expect(updateLib).not.toContain('24 * 60 * 60 * 1000');
    });
  });

  describe('C) Guard file fast-path behavior', () => {
    test('seeded guard file causes fast exit with no stdout on silent no-update', () => {
      fs.writeFileSync(guardFile, JSON.stringify({
        updateAvailable: false,
        latest: '99.0.0',
        installed: '3.12.1',
        checkedAt: new Date().toISOString()
      }));

      const start = Date.now();
      let stdout = '';
      let exitCode = 0;
      try {
        stdout = execSync('node bin/vp-tools.cjs check-update --silent', {
          cwd: ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe']
        });
      } catch (e) {
        stdout = e.stdout || '';
        exitCode = e.status || 1;
      }
      const ms = Date.now() - start;

      expect(ms).toBeLessThan(800); // fast-path < 800ms
      expect(stdout.trim()).toBe(''); // no stdout when no update
      expect(exitCode).toBe(0);
    });

    test('seeded guard with updateAvailable=true prints latest and exits 1', () => {
      fs.writeFileSync(guardFile, JSON.stringify({
        updateAvailable: true,
        latest: '99.0.0',
        installed: '3.12.1',
        checkedAt: new Date().toISOString()
      }));

      let stdout = '';
      let exitCode = 0;
      try {
        stdout = execSync('node bin/vp-tools.cjs check-update --silent', {
          cwd: ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe']
        });
      } catch (e) {
        stdout = (e.stdout || '').trim();
        exitCode = e.status || 1;
      }

      expect(stdout).toContain('99.0.0');
      expect(exitCode).toBe(1);
    });
  });

  describe('D) version', () => {
    test('package.json version is 3.12.1', () => {
      delete require.cache[require.resolve(path.join(ROOT, 'package.json'))];
      const pkg = require(path.join(ROOT, 'package.json'));
      expect(pkg.version).toBe('3.12.1');
    });
  });
});
