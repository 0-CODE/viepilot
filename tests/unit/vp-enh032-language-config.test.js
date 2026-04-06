'use strict';

/**
 * ENH-032 Language Configuration System contracts
 *
 * Verifies:
 *   1. lib/viepilot-config.cjs exports the required functions
 *   2. Defaults are en/en when config file is absent
 *   3. bin/vp-tools.cjs includes "config" command in help text
 *   4. Workflow contracts: load_language_config in crystallize.md + autonomous.md;
 *      detect_session_language in brainstorm.md
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = path.resolve(__dirname, '..', '..');

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

// ─────────────────────────────────────────────────────────────────────────────
// Test Group 1: viepilot-config.cjs exports
// ─────────────────────────────────────────────────────────────────────────────
describe('ENH-032 — lib/viepilot-config.cjs: required exports', () => {
  let cfg;

  beforeAll(() => {
    cfg = require(path.join(ROOT, 'lib', 'viepilot-config.cjs'));
  });

  test('exports readConfig', () => {
    expect(typeof cfg.readConfig).toBe('function');
  });

  test('exports writeConfig', () => {
    expect(typeof cfg.writeConfig).toBe('function');
  });

  test('exports resetConfig', () => {
    expect(typeof cfg.resetConfig).toBe('function');
  });

  test('exports getConfigPath', () => {
    expect(typeof cfg.getConfigPath).toBe('function');
  });

  test('exports DEFAULTS with language.communication=en and language.document=en', () => {
    expect(cfg.DEFAULTS).toBeDefined();
    expect(cfg.DEFAULTS.language).toBeDefined();
    expect(cfg.DEFAULTS.language.communication).toBe('en');
    expect(cfg.DEFAULTS.language.document).toBe('en');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test Group 2: Default values when config file absent
// ─────────────────────────────────────────────────────────────────────────────
describe('ENH-032 — viepilot-config.cjs: defaults when config file absent', () => {
  let cfg;
  let tmpDir;

  beforeAll(() => {
    cfg = require(path.join(ROOT, 'lib', 'viepilot-config.cjs'));
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-enh032-test-'));
  });

  afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('readConfig returns en/en defaults when config file missing', () => {
    const result = cfg.readConfig(tmpDir);
    expect(result.language.communication).toBe('en');
    expect(result.language.document).toBe('en');
  });

  test('readConfig does not throw when config file missing', () => {
    expect(() => cfg.readConfig(tmpDir)).not.toThrow();
  });

  test('writeConfig creates config.json and merges patch', () => {
    cfg.writeConfig({ language: { communication: 'vi' } }, tmpDir);
    const result = cfg.readConfig(tmpDir);
    expect(result.language.communication).toBe('vi');
    // document should remain default
    expect(result.language.document).toBe('en');
  });

  test('resetConfig writes defaults back to config.json', () => {
    cfg.resetConfig(tmpDir);
    const result = cfg.readConfig(tmpDir);
    expect(result.language.communication).toBe('en');
    expect(result.language.document).toBe('en');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test Group 3: bin/vp-tools.cjs includes config command
// ─────────────────────────────────────────────────────────────────────────────
describe('ENH-032 — bin/vp-tools.cjs: config command present', () => {
  let vpToolsSource;

  beforeAll(() => {
    vpToolsSource = read('bin/vp-tools.cjs');
  });

  test('vp-tools.cjs contains "config" command handler', () => {
    expect(vpToolsSource).toMatch(/\bconfig\b/);
  });

  test('vp-tools.cjs help text lists config command', () => {
    expect(vpToolsSource).toMatch(/config.*get\|set\|reset|config.*language/i);
  });

  test('vp-tools.cjs imports viepilot-config.cjs', () => {
    expect(vpToolsSource).toMatch(/viepilot-config/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test Group 4: Workflow contracts
// ─────────────────────────────────────────────────────────────────────────────
describe('ENH-032 — workflow contracts: language config steps present', () => {
  test('crystallize.md contains load_language_config step', () => {
    const content = read('workflows/crystallize.md');
    expect(content).toMatch(/load_language_config/);
  });

  test('crystallize.md references DOCUMENT_LANG', () => {
    const content = read('workflows/crystallize.md');
    expect(content).toMatch(/DOCUMENT_LANG/);
  });

  test('autonomous.md contains load_language_config step', () => {
    const content = read('workflows/autonomous.md');
    expect(content).toMatch(/load_language_config/);
  });

  test('autonomous.md references COMMUNICATION_LANG', () => {
    const content = read('workflows/autonomous.md');
    expect(content).toMatch(/COMMUNICATION_LANG/);
  });

  test('brainstorm.md contains detect_session_language step', () => {
    const content = read('workflows/brainstorm.md');
    expect(content).toMatch(/detect_session_language/);
  });

  test('brainstorm.md references BRAINSTORM_LANG', () => {
    const content = read('workflows/brainstorm.md');
    expect(content).toMatch(/BRAINSTORM_LANG/);
  });
});
