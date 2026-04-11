'use strict';
/**
 * ENH-043 — vp-proposal .docx visual embedding: Mermaid PNG + HTML screenshots
 * Tests: isMmdcAvailable, renderMermaidToPng, imageRunFromPng, workflow Step 7
 */

const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

// ─────────────────────────────────────────────────────────────────────────────
// Group 1: isMmdcAvailable + renderMermaidToPng (ENH-043 additions)
// ─────────────────────────────────────────────────────────────────────────────
describe('ENH-043 — isMmdcAvailable + renderMermaidToPng', () => {
  let screenshotMod;
  beforeAll(() => { screenshotMod = require('../../lib/screenshot-artifact.cjs'); });

  test('isMmdcAvailable is exported from screenshot-artifact.cjs', () => {
    expect(typeof screenshotMod.isMmdcAvailable).toBe('function');
  });

  test('renderMermaidToPng is exported from screenshot-artifact.cjs', () => {
    expect(typeof screenshotMod.renderMermaidToPng).toBe('function');
  });

  test('isMmdcAvailable() returns a boolean', () => {
    const result = screenshotMod.isMmdcAvailable();
    expect(typeof result).toBe('boolean');
  });

  test('renderMermaidToPng(null, path) returns null without throwing', () => {
    const r = screenshotMod.renderMermaidToPng(null, '/tmp/vp-test-null.png');
    expect(r).toBeNull();
  });

  test('renderMermaidToPng(source, path) returns null when mmdc absent', () => {
    if (screenshotMod.isMmdcAvailable()) return; // skip if mmdc installed
    const r = screenshotMod.renderMermaidToPng('flowchart TD\n  A-->B', '/tmp/vp-test-diagram.png');
    expect(r).toBeNull();
  });

  test('renderMermaidToPng(empty string, path) returns null', () => {
    const r = screenshotMod.renderMermaidToPng('   ', '/tmp/vp-test-empty.png');
    expect(r).toBeNull();
  });

  test('renderMermaidToPng(source, null) returns null', () => {
    const r = screenshotMod.renderMermaidToPng('flowchart TD\n  A-->B', null);
    expect(r).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Group 2: imageRunFromPng helper in gen-proposal-docx.cjs
// ─────────────────────────────────────────────────────────────────────────────
describe('ENH-043 — imageRunFromPng helper in gen-proposal-docx.cjs', () => {
  let script;
  beforeAll(() => { script = read('scripts/gen-proposal-docx.cjs'); });

  test('imageRunFromPng function is defined', () => {
    expect(script).toContain('function imageRunFromPng(');
  });

  test('script requires screenshot-artifact.cjs', () => {
    expect(script).toContain("require('../lib/screenshot-artifact.cjs')");
  });

  test('script requires proposal-generator.cjs', () => {
    expect(script).toContain("require('../lib/proposal-generator.cjs')");
  });

  test('script imports renderMermaidToPng', () => {
    expect(script).toContain('renderMermaidToPng');
  });

  test('script imports screenshotArtifact', () => {
    expect(script).toContain('screenshotArtifact');
  });

  test('runtime embedding comment block mentions cleanupScreenshot', () => {
    expect(script).toContain('cleanupScreenshot');
  });

  test('stock gen-proposal-docx.cjs still generates project-detail.docx', () => {
    expect(exists('templates/proposal/docx/project-detail.docx')).toBe(true);
    const size = fs.statSync(path.join(ROOT, 'templates/proposal/docx/project-detail.docx')).size;
    expect(size).toBeGreaterThan(10 * 1024);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Group 3: Workflow Step 7 updated
// ─────────────────────────────────────────────────────────────────────────────
describe('ENH-043 — workflow Step 7 visual embedding contract', () => {
  let workflow;
  beforeAll(() => { workflow = read('workflows/proposal.md'); });

  test('Step 7 mentions renderMermaidToPng', () => {
    expect(workflow).toContain('renderMermaidToPng');
  });

  test('Step 7 mentions screenshotArtifact for docx visual injection', () => {
    // screenshotArtifact appears in Step 7 context (docx section, not just Step 4c)
    const step7Match = workflow.match(/<step name="generate_docx">([\s\S]*?)<\/step>/);
    expect(step7Match).not.toBeNull();
    expect(step7Match[1]).toContain('screenshotArtifact');
  });

  test('Step 7 documents cleanupScreenshot usage', () => {
    const step7Match = workflow.match(/<step name="generate_docx">([\s\S]*?)<\/step>/);
    expect(step7Match).not.toBeNull();
    expect(step7Match[1]).toContain('cleanupScreenshot');
  });

  test('Step 7 documents fallback behavior for missing mmdc', () => {
    expect(workflow).toMatch(/mmdc absent|fallback.*preformatted|Fallback.*mmdc/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Group 4: Integration smoke
// ─────────────────────────────────────────────────────────────────────────────
describe('ENH-043 — integration smoke', () => {
  test('lib/screenshot-artifact.cjs exports 5 functions total', () => {
    const mod = require('../../lib/screenshot-artifact.cjs');
    const fns = ['screenshotArtifact', 'isPuppeteerAvailable', 'cleanupScreenshot',
                  'isMmdcAvailable', 'renderMermaidToPng'];
    for (const fn of fns) {
      expect(typeof mod[fn]).toBe('function');
    }
  });

  test('ImageRun is importable from docx package', () => {
    const { ImageRun } = require('docx');
    expect(typeof ImageRun).toBe('function');
  });
});
