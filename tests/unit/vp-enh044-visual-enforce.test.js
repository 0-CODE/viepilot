'use strict';
/**
 * ENH-044 — vp-proposal mandatory visual enforcement
 * Tests: warnMissingTool() helper + workflow Step 4c/Step 7 enforcement language
 */

const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

// ─────────────────────────────────────────────────────────────────────────────
describe('ENH-044 — warnMissingTool() helper', () => {
  const { warnMissingTool, isPuppeteerAvailable, isMmdcAvailable } =
    require('../../lib/screenshot-artifact.cjs');

  test('warnMissingTool is exported as function', () => {
    expect(typeof warnMissingTool).toBe('function');
  });

  test('warnMissingTool does not throw', () => {
    expect(() => warnMissingTool('puppeteer', 'npm install puppeteer')).not.toThrow();
    expect(() => warnMissingTool('mmdc', 'npm install -g @mermaid-js/mermaid-cli')).not.toThrow();
  });

  test('warnMissingTool writes to stderr (not stdout)', () => {
    const stderrWrites = [];
    const orig = process.stderr.write.bind(process.stderr);
    process.stderr.write = (msg) => { stderrWrites.push(msg); return true; };
    warnMissingTool('puppeteer', 'npm install puppeteer');
    process.stderr.write = orig;
    expect(stderrWrites.length).toBeGreaterThan(0);
  });

  test('warnMissingTool message includes ⚠ warning symbol', () => {
    const writes = [];
    const orig = process.stderr.write.bind(process.stderr);
    process.stderr.write = (msg) => { writes.push(msg); return true; };
    warnMissingTool('mytool', 'npm install mytool');
    process.stderr.write = orig;
    expect(writes.join('')).toContain('⚠');
  });

  test('warnMissingTool message includes tool name', () => {
    const writes = [];
    const orig = process.stderr.write.bind(process.stderr);
    process.stderr.write = (msg) => { writes.push(msg); return true; };
    warnMissingTool('mmdc', 'npm install -g @mermaid-js/mermaid-cli');
    process.stderr.write = orig;
    expect(writes.join('')).toContain('mmdc');
  });

  test('warnMissingTool message includes install command', () => {
    const writes = [];
    const orig = process.stderr.write.bind(process.stderr);
    process.stderr.write = (msg) => { writes.push(msg); return true; };
    warnMissingTool('puppeteer', 'npm install puppeteer');
    process.stderr.write = orig;
    expect(writes.join('')).toContain('npm install puppeteer');
  });

  test('warnMissingTool message includes [vp-proposal] prefix', () => {
    const writes = [];
    const orig = process.stderr.write.bind(process.stderr);
    process.stderr.write = (msg) => { writes.push(msg); return true; };
    warnMissingTool('test-tool', 'npm install test-tool');
    process.stderr.write = orig;
    expect(writes.join('')).toContain('[vp-proposal]');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ENH-044 — screenshot-artifact.cjs exports', () => {
  const mod = require('../../lib/screenshot-artifact.cjs');

  test('warnMissingTool is present alongside existing exports', () => {
    expect(typeof mod.screenshotArtifact).toBe('function');
    expect(typeof mod.isPuppeteerAvailable).toBe('function');
    expect(typeof mod.isMmdcAvailable).toBe('function');
    expect(typeof mod.renderMermaidToPng).toBe('function');
    expect(typeof mod.cleanupScreenshot).toBe('function');
    expect(typeof mod.warnMissingTool).toBe('function');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ENH-044 — workflows/proposal.md Step 4c mandatory enforcement', () => {
  const src = read('workflows/proposal.md');

  test('Step 4c title indicates MANDATORY (not optional)', () => {
    expect(src).toMatch(/Step 4c.*MANDATORY/);
  });

  test('Step 4c references warnMissingTool for puppeteer absent path', () => {
    const step4cMatch = src.match(/Step 4c[\s\S]*?(?=## Step 5)/);
    expect(step4cMatch).not.toBeNull();
    expect(step4cMatch[0]).toContain('warnMissingTool');
  });

  test('Step 4c states visualSlides[] must not be empty when artifacts exist', () => {
    const step4cMatch = src.match(/Step 4c[\s\S]*?(?=## Step 5)/);
    expect(step4cMatch).not.toBeNull();
    const text = step4cMatch[0];
    expect(text).toMatch(/MUST be populated|must.*populated|never left empty|not.*empty when artifacts/i);
  });

  test('Step 4c mentions addPlaceholderVisual for fallback', () => {
    const step4cMatch = src.match(/Step 4c[\s\S]*?(?=## Step 5)/);
    expect(step4cMatch).not.toBeNull();
    expect(step4cMatch[0]).toContain('addPlaceholderVisual');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ENH-044 — workflows/proposal.md Step 7 mandatory enforcement', () => {
  const src = read('workflows/proposal.md');

  test('Step 7 references warnMissingTool for mmdc absent path', () => {
    const step7Match = src.match(/## Step 7[\s\S]*?(?=## Step 8)/);
    expect(step7Match).not.toBeNull();
    const count = (step7Match[0].match(/warnMissingTool/g) || []).length;
    expect(count).toBeGreaterThanOrEqual(2); // mmdc + puppeteer absent paths
  });

  test('Step 7 has MANDATORY enforcement language', () => {
    const step7Match = src.match(/## Step 7[\s\S]*?(?=## Step 8)/);
    expect(step7Match).not.toBeNull();
    expect(step7Match[0]).toMatch(/MANDATORY/);
  });

  test('Step 7 documents warnMissingTool for mmdc', () => {
    const step7Match = src.match(/## Step 7[\s\S]*?(?=## Step 8)/);
    expect(step7Match).not.toBeNull();
    expect(step7Match[0]).toContain("warnMissingTool('mmdc'");
  });

  test('Step 7 documents warnMissingTool for puppeteer', () => {
    const step7Match = src.match(/## Step 7[\s\S]*?(?=## Step 8)/);
    expect(step7Match).not.toBeNull();
    expect(step7Match[0]).toContain("warnMissingTool('puppeteer'");
  });
});
