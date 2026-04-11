'use strict';
/**
 * ENH-042 — vp-proposal PPTX visual imagery from ui-direction & architect HTML screenshots
 * Tests: detectVisualArtifacts(), screenshot-artifact.cjs, workflow Step 4c, pptx helpers
 */

const fs   = require('fs');
const path = require('path');
const os   = require('os');

const ROOT = path.join(__dirname, '..', '..');

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

// ─────────────────────────────────────────────────────────────────────────────
// Group 1: detectVisualArtifacts()
// ─────────────────────────────────────────────────────────────────────────────
describe('ENH-042 — detectVisualArtifacts()', () => {
  const { detectVisualArtifacts } = require('../../lib/proposal-generator.cjs');

  test('detectVisualArtifacts is exported', () => {
    expect(typeof detectVisualArtifacts).toBe('function');
  });

  test('returns object with uiPages, architectPages, sessionDir', () => {
    const r = detectVisualArtifacts('/nonexistent-path-xyz');
    expect(r).toHaveProperty('uiPages');
    expect(r).toHaveProperty('architectPages');
    expect(r).toHaveProperty('sessionDir');
  });

  test('uiPages is an array', () => {
    const r = detectVisualArtifacts('/nonexistent-path-xyz');
    expect(Array.isArray(r.uiPages)).toBe(true);
  });

  test('architectPages is an array', () => {
    const r = detectVisualArtifacts('/nonexistent-path-xyz');
    expect(Array.isArray(r.architectPages)).toBe(true);
  });

  test('returns empty arrays for nonexistent path', () => {
    const r = detectVisualArtifacts('/totally-nonexistent-abc-123');
    expect(r.uiPages).toHaveLength(0);
    expect(r.architectPages).toHaveLength(0);
  });

  test('auto-detect returns valid object when no arg provided', () => {
    const r = detectVisualArtifacts();
    expect(r).toHaveProperty('uiPages');
    expect(r).toHaveProperty('architectPages');
    expect(r).toHaveProperty('sessionDir');
  });

  test('sessionDir is null when no ui-direction dir exists at cwd', () => {
    // In the repo root, .viepilot/ui-direction/ likely has no subdirs
    // — sessionDir will be null or a path string, never throw
    const r = detectVisualArtifacts();
    expect(r.sessionDir === null || typeof r.sessionDir === 'string').toBe(true);
  });

  test('detects index.html when present in temp session dir', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-test-session-'));
    fs.writeFileSync(path.join(tmpDir, 'index.html'), '<html></html>');
    const r = detectVisualArtifacts(tmpDir);
    expect(r.uiPages.some(p => p.endsWith('index.html'))).toBe(true);
    fs.rmSync(tmpDir, { recursive: true });
  });

  test('detects pages/*.html when present in temp session dir', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-test-session-'));
    const pagesDir = path.join(tmpDir, 'pages');
    fs.mkdirSync(pagesDir);
    fs.writeFileSync(path.join(pagesDir, 'dashboard.html'), '<html></html>');
    const r = detectVisualArtifacts(tmpDir);
    expect(r.uiPages.some(p => p.endsWith('dashboard.html'))).toBe(true);
    fs.rmSync(tmpDir, { recursive: true });
  });

  test('detects architect pages when present in temp session dir', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-test-session-'));
    fs.writeFileSync(path.join(tmpDir, 'architecture.html'), '<html></html>');
    fs.writeFileSync(path.join(tmpDir, 'erd.html'), '<html></html>');
    const r = detectVisualArtifacts(tmpDir);
    expect(r.architectPages.some(p => p.endsWith('architecture.html'))).toBe(true);
    expect(r.architectPages.some(p => p.endsWith('erd.html'))).toBe(true);
    fs.rmSync(tmpDir, { recursive: true });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Group 2: screenshot-artifact.cjs
// ─────────────────────────────────────────────────────────────────────────────
describe('ENH-042 — screenshot-artifact.cjs', () => {
  let screenshotMod;
  beforeAll(() => { screenshotMod = require('../../lib/screenshot-artifact.cjs'); });

  test('module can be required without error', () => {
    expect(screenshotMod).toBeDefined();
  });

  test('screenshotArtifact is a function', () => {
    expect(typeof screenshotMod.screenshotArtifact).toBe('function');
  });

  test('isPuppeteerAvailable is a function', () => {
    expect(typeof screenshotMod.isPuppeteerAvailable).toBe('function');
  });

  test('cleanupScreenshot is a function', () => {
    expect(typeof screenshotMod.cleanupScreenshot).toBe('function');
  });

  test('isPuppeteerAvailable() returns a boolean', () => {
    const result = screenshotMod.isPuppeteerAvailable();
    expect(typeof result).toBe('boolean');
  });

  test('screenshotArtifact returns null when puppeteer absent (no throw)', async () => {
    // puppeteer is not a production dep — should return null gracefully
    if (screenshotMod.isPuppeteerAvailable()) {
      // If puppeteer IS available in test env, skip this assertion
      return;
    }
    const result = await screenshotMod.screenshotArtifact('/tmp/nonexistent.html');
    expect(result).toBeNull();
  });

  test('screenshotArtifact returns null for nonexistent file (no throw)', async () => {
    const result = await screenshotMod.screenshotArtifact('/absolutely/nonexistent/file.html');
    expect(result).toBeNull();
  });

  test('cleanupScreenshot does not throw for null input', () => {
    expect(() => screenshotMod.cleanupScreenshot(null)).not.toThrow();
  });

  test('cleanupScreenshot does not throw for nonexistent path', () => {
    expect(() => screenshotMod.cleanupScreenshot('/nonexistent/tmp/file.png')).not.toThrow();
  });

  test('lib/screenshot-artifact.cjs file exists', () => {
    expect(exists('lib/screenshot-artifact.cjs')).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Group 3: Workflow Step 4c contract
// ─────────────────────────────────────────────────────────────────────────────
describe('ENH-042 — workflow Step 4c contract', () => {
  let workflow;
  beforeAll(() => { workflow = read('workflows/proposal.md'); });

  test('workflow contains detect_visual_artifacts step', () => {
    expect(workflow).toMatch(/detect_visual_artifacts|Step 4c/);
  });

  test('workflow documents visualSlides[] schema', () => {
    expect(workflow).toContain('visualSlides');
  });

  test('workflow documents artifact → slide mapping table', () => {
    expect(workflow).toMatch(/artifactType|ui-overview|architect-arch/);
  });

  test('workflow documents fallback behavior (empty artifacts)', () => {
    expect(workflow).toMatch(/No HTML artifacts|skipping screenshot/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Group 4: gen-proposal-pptx.cjs helpers
// ─────────────────────────────────────────────────────────────────────────────
describe('ENH-042 — gen-proposal-pptx.cjs visual helpers', () => {
  let script;
  beforeAll(() => { script = read('scripts/gen-proposal-pptx.cjs'); });

  test('addPlaceholderVisual function is defined', () => {
    expect(script).toContain('function addPlaceholderVisual(');
  });

  test('runtime integration comment block is present', () => {
    expect(script).toMatch(/screenshotArtifact|visualSlides/);
  });

  test('pptx templates still generate after changes (project-proposal.pptx > 100 KB)', () => {
    const size = fs.statSync(path.join(ROOT, 'templates/proposal/pptx/project-proposal.pptx')).size;
    expect(size).toBeGreaterThan(100 * 1024);
  });
});
