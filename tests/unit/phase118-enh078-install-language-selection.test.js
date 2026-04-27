'use strict';

const fs = require('fs');
const path = require('path');

const { buildInstallPlan, applyInstallPlan } = require('../../lib/viepilot-install.cjs');
const BIN = path.join(__dirname, '../../bin/viepilot.cjs');
const PKG = path.join(__dirname, '../../package.json');
const CHANGELOG = path.join(__dirname, '../../CHANGELOG.md');

const REPO_ROOT = path.join(__dirname, '../..');
const binSource = fs.readFileSync(BIN, 'utf8');
const pkg = JSON.parse(fs.readFileSync(PKG, 'utf8'));
const changelog = fs.readFileSync(CHANGELOG, 'utf8');

describe('Phase 118 — ENH-078: install communication language selection', () => {

  describe('118.1 — lib/viepilot-install.cjs language threading', () => {
    test('language_config_prompt step carries communicationLang from VIEPILOT_COMM_LANG=vi', () => {
      const plan = buildInstallPlan(REPO_ROOT, { VIEPILOT_AUTO_YES: '1', VIEPILOT_COMM_LANG: 'vi' }, {});
      const step = plan.steps.find((s) => s.kind === 'language_config_prompt');
      expect(step).toBeDefined();
      expect(step.communicationLang).toBe('vi');
    });

    test('language_config_prompt step defaults communicationLang to en when VIEPILOT_COMM_LANG not set', () => {
      const plan = buildInstallPlan(REPO_ROOT, { VIEPILOT_AUTO_YES: '1' }, {});
      const step = plan.steps.find((s) => s.kind === 'language_config_prompt');
      expect(step).toBeDefined();
      expect(step.communicationLang).toBe('en');
    });

    test('applyInstallPlan dry-run with communicationLang=vi logs vi, not en', () => {
      const plan = buildInstallPlan(REPO_ROOT, { VIEPILOT_AUTO_YES: '1', VIEPILOT_COMM_LANG: 'vi' }, {});
      const result = applyInstallPlan(plan, { dryRun: true });
      const langLog = result.logs.find((l) => l.includes('language_config_prompt'));
      expect(langLog).toMatch(/communication=vi/);
      expect(langLog).not.toMatch(/communication=en/);
    });

    test('applyInstallPlan dry-run defaults to en when no VIEPILOT_COMM_LANG', () => {
      const plan = buildInstallPlan(REPO_ROOT, { VIEPILOT_AUTO_YES: '1' }, {});
      const result = applyInstallPlan(plan, { dryRun: true });
      const langLog = result.logs.find((l) => l.includes('language_config_prompt'));
      expect(langLog).toMatch(/communication=en/);
    });

    test('applyInstallPlan dry-run with communicationLang=ja logs ja', () => {
      const plan = buildInstallPlan(REPO_ROOT, { VIEPILOT_AUTO_YES: '1', VIEPILOT_COMM_LANG: 'ja' }, {});
      const result = applyInstallPlan(plan, { dryRun: true });
      const langLog = result.logs.find((l) => l.includes('language_config_prompt'));
      expect(langLog).toMatch(/communication=ja/);
    });
  });

  describe('118.2 — bin/viepilot.cjs LANGUAGES constant and wiring', () => {
    test('LANGUAGES array defined with en and vi entries', () => {
      expect(binSource).toMatch(/const LANGUAGES\s*=/);
      expect(binSource).toMatch(/'en'.*English|English.*'en'/);
      expect(binSource).toMatch(/'vi'.*Vietnamese|Vietnamese.*'vi'/);
    });

    test('LANGUAGES array has at least 8 entries', () => {
      const match = binSource.match(/const LANGUAGES\s*=\s*\[([\s\S]*?)\];/);
      expect(match).not.toBeNull();
      const entries = (match[1].match(/id:/g) || []).length;
      expect(entries).toBeGreaterThanOrEqual(8);
    });

    test('interactiveLanguageSelection function defined in bin/viepilot.cjs', () => {
      expect(binSource).toMatch(/function interactiveLanguageSelection\s*\(/);
    });

    test('VIEPILOT_COMM_LANG env var threaded through runInstallViaNode', () => {
      expect(binSource).toMatch(/VIEPILOT_COMM_LANG/);
    });

    test('runInstallViaNode accepts communicationLang parameter', () => {
      expect(binSource).toMatch(/function runInstallViaNode\s*\([^)]*communicationLang/);
    });

    test('installCommand calls interactiveLanguageSelection unless --yes', () => {
      expect(binSource).toMatch(/interactiveLanguageSelection/);
      expect(binSource).toMatch(/options\.yes[\s\S]{0,200}interactiveLanguageSelection|interactiveLanguageSelection[\s\S]{0,50}options\.yes/);
    });
  });

  describe('118.3 — version and changelog', () => {
    test('package.json version is at least 2.45.5', () => {
      const [, minor, patch] = pkg.version.split('.').map(Number);
      expect(minor).toBeGreaterThanOrEqual(45);
      if (minor === 45) expect(patch).toBeGreaterThanOrEqual(5);
    });

    test('CHANGELOG has [2.45.5] entry', () => {
      expect(changelog).toMatch(/\[2\.45\.5\]/);
    });

    test('CHANGELOG ENH-078 entry references communication language', () => {
      expect(changelog).toMatch(/ENH-078/);
      expect(changelog).toMatch(/communication.*language|language.*communication/i);
    });
  });
});
