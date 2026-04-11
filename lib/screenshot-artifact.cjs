'use strict';
/**
 * screenshot-artifact.cjs
 * ENH-042 + ENH-043: Optional screenshot/render utility for vp-proposal visual embedding.
 *
 * - puppeteer (optional): screenshots HTML artifact files → PNG
 * - mmdc CLI (optional): renders Mermaid source → PNG
 * Both return null gracefully when the tool is absent — no crash, no hard dep.
 *
 * Usage:
 *   const { screenshotArtifact, isPuppeteerAvailable,
 *           isMmdcAvailable, renderMermaidToPng, cleanupScreenshot }
 *     = require('./lib/screenshot-artifact.cjs');
 */

const os   = require('os');
const path = require('path');
const fs   = require('fs');
const cp   = require('child_process');

/**
 * Check if puppeteer is available without throwing.
 * @returns {boolean}
 */
function isPuppeteerAvailable() {
  try { require.resolve('puppeteer'); return true; } catch { return false; }
}

/**
 * Screenshot an HTML file to a temporary PNG using puppeteer (headless Chrome).
 * Returns null silently when puppeteer is not installed.
 *
 * @param {string} htmlPath - Absolute path to the HTML file to screenshot
 * @param {object} [opts]
 * @param {number} [opts.width=1280] - Viewport width in px
 * @param {number} [opts.height=720] - Viewport height in px (matches 16:9 slide ratio)
 * @returns {Promise<string|null>} Absolute path to a temp PNG file, or null if unavailable
 */
async function screenshotArtifact(htmlPath, opts = {}) {
  // Graceful: return null if puppeteer not installed
  let puppeteer;
  try { puppeteer = require('puppeteer'); } catch { return null; }

  if (!htmlPath || !fs.existsSync(htmlPath)) return null;

  const { width = 1280, height = 720 } = opts;
  const tmpFile = path.join(os.tmpdir(), `vp-artifact-${Date.now()}.png`);

  const browser = await puppeteer.launch({
    headless: 'new',        // puppeteer ≥ 20 compat
    args: ['--no-sandbox', '--disable-setuid-sandbox'],  // CI-safe
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width, height });
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0', timeout: 15000 });
    await page.screenshot({ path: tmpFile, fullPage: false });
    return tmpFile;
  } finally {
    await browser.close();
  }
}

/**
 * Clean up a temp screenshot file after embedding.
 * @param {string|null} tmpPath
 */
function cleanupScreenshot(tmpPath) {
  if (tmpPath && fs.existsSync(tmpPath)) {
    try { fs.unlinkSync(tmpPath); } catch { /* ignore cleanup errors */ }
  }
}

// ── Mermaid rendering (ENH-043) ───────────────────────────────────────────────

/**
 * Check if @mermaid-js/mermaid-cli (mmdc) is available on PATH.
 * @returns {boolean}
 */
function isMmdcAvailable() {
  try {
    const r = cp.spawnSync('mmdc', ['--version'], { encoding: 'utf8', timeout: 5000 });
    return r.status === 0;
  } catch {
    return false;
  }
}

/**
 * Render a Mermaid diagram source string to a PNG file using the mmdc CLI.
 * Returns null silently when mmdc is not available or rendering fails.
 *
 * @param {string} mermaidSource - Valid Mermaid 10+ source code
 * @param {string} outputPath - Absolute path for the output .png file
 * @returns {string|null} outputPath on success, null if mmdc absent or error
 */
function renderMermaidToPng(mermaidSource, outputPath) {
  if (!isMmdcAvailable()) return null;
  if (!mermaidSource || !mermaidSource.trim()) return null;
  if (!outputPath) return null;

  const tmpInput = outputPath.replace(/\.png$/i, '.mmd');
  try {
    fs.writeFileSync(tmpInput, mermaidSource, 'utf8');
    const r = cp.spawnSync(
      'mmdc',
      ['-i', tmpInput, '-o', outputPath, '-b', 'white'],
      { encoding: 'utf8', timeout: 30000 }
    );
    return (r.status === 0 && fs.existsSync(outputPath)) ? outputPath : null;
  } catch {
    return null;
  } finally {
    try { if (fs.existsSync(tmpInput)) fs.unlinkSync(tmpInput); } catch { /* ignore */ }
  }
}

// ── Missing-tool warning (ENH-044) ───────────────────────────────────────────

/**
 * Emit a standardized warning to stderr when a visual rendering tool is absent
 * but visual artifacts exist and embedding is mandatory.
 *
 * @param {string} tool - Tool name (e.g. 'puppeteer', 'mmdc')
 * @param {string} installCmd - Install hint (e.g. 'npm install puppeteer')
 */
function warnMissingTool(tool, installCmd) {
  process.stderr.write(
    `\n[vp-proposal] ⚠  Visual artifacts found but '${tool}' is not installed.\n` +
    `  Install to enable screenshots: ${installCmd}\n` +
    `  Using placeholder/text fallback instead.\n\n`
  );
}

module.exports = {
  screenshotArtifact,
  isPuppeteerAvailable,
  cleanupScreenshot,
  isMmdcAvailable,
  renderMermaidToPng,
  warnMissingTool,
};
