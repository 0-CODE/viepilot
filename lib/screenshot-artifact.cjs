'use strict';
/**
 * screenshot-artifact.cjs
 * ENH-042: Optional screenshot utility for vp-proposal visual embedding in PPTX slides.
 *
 * Uses puppeteer (optional peer dep) to screenshot HTML artifact files.
 * Returns null gracefully when puppeteer is not installed — no crash, no hard dep.
 *
 * Usage:
 *   const { screenshotArtifact, isPuppeteerAvailable } = require('./lib/screenshot-artifact.cjs');
 *   const tmpPng = await screenshotArtifact('/path/to/index.html');
 *   // tmpPng: absolute path to temp .png, or null if puppeteer absent
 */

const os   = require('os');
const path = require('path');
const fs   = require('fs');

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

module.exports = { screenshotArtifact, isPuppeteerAvailable, cleanupScreenshot };
