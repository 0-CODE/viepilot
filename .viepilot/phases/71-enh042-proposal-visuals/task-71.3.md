# Task 71.3 — scripts/gen-proposal-pptx.cjs: screenshotArtifact + placeholder + visualSlides integration

## Objective
Add screenshot capability to `gen-proposal-pptx.cjs` (the stock template generator) AND update `scripts/gen-proposal-pptx.cjs` runtime integration so that when `visualSlides[]` is provided, each referenced slide receives either a puppeteer screenshot or a styled placeholder shape.

In practice for the stock template generator (which runs without a real session), add the helper functions and wire them up — the actual `visualSlides` integration happens in the workflow-driven generation path (called by vp-proposal at runtime, not by the template script).

## Paths
- scripts/gen-proposal-pptx.cjs
- lib/screenshot-artifact.cjs

## File-Level Plan

### NEW: lib/screenshot-artifact.cjs
Standalone module for optional screenshot functionality:

```js
'use strict';
/**
 * screenshot-artifact.cjs
 * Optional screenshot utility for vp-proposal visual embedding.
 * Uses puppeteer if available; returns null otherwise (graceful fallback).
 */

const os   = require('os');
const path = require('path');
const fs   = require('fs');

/**
 * Screenshot an HTML file to a temporary PNG using puppeteer.
 * @param {string} htmlPath - Absolute path to HTML file
 * @param {object} [opts]
 * @param {number} [opts.width=1280]
 * @param {number} [opts.height=720]
 * @returns {Promise<string|null>} Absolute path to temp PNG, or null if puppeteer unavailable
 */
async function screenshotArtifact(htmlPath, opts = {}) {
  let puppeteer;
  try { puppeteer = require('puppeteer'); } catch { return null; }

  const { width = 1280, height = 720 } = opts;
  const tmpFile = path.join(os.tmpdir(), `vp-artifact-${Date.now()}.png`);

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
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
 * Check if puppeteer is available without throwing.
 * @returns {boolean}
 */
function isPuppeteerAvailable() {
  try { require.resolve('puppeteer'); return true; } catch { return false; }
}

module.exports = { screenshotArtifact, isPuppeteerAvailable };
```

### UPDATE: scripts/gen-proposal-pptx.cjs
Add `addPlaceholderVisual(slide, label)` helper function that adds a styled rectangle when no screenshot is available:

```js
/**
 * Add a styled placeholder shape to a slide position where a screenshot would go.
 * Used as fallback when puppeteer is not installed.
 */
function addPlaceholderVisual(slide, label = 'Screenshot placeholder') {
  slide.addShape(pptxgenjs_instance.ShapeType.rect, {
    x: 0.5, y: 1.8, w: '60%', h: 3.2,
    fill: { color: '2d3142' },
    line: { color: '4f6ef7', width: 2 },
  });
  slide.addText(label, {
    x: 0.5, y: 1.8, w: '60%', h: 3.2,
    color: '8892b0', fontSize: 13, italic: true,
    align: 'center', valign: 'middle',
  });
}
```

Note: In the stock template generator, `addPlaceholderVisual` is defined but not called (no real session artifacts during template generation). The workflow-driven runtime path calls it when `visualSlides[i].screenshotPath === null`.

**Runtime integration pattern** (documented in this file as a comment block for the workflow to follow):

```js
// ── Visual embedding (called by vp-proposal workflow at runtime) ──────────────
// For each entry in visualSlides[]:
//   const tmpPng = await screenshotArtifact(entry.htmlPath);
//   const slide = pptx.slides[entry.slideIndex];
//   if (tmpPng) {
//     slide.addImage({ path: tmpPng, x: 0.5, y: 1.8, w: '60%', h: 3.2 });
//     fs.unlinkSync(tmpPng);  // cleanup temp file
//   } else {
//     addPlaceholderVisual(slide, entry.label);
//   }
```

## Best Practices
- `lib/screenshot-artifact.cjs` is standalone — no pptxgenjs dep, easy to test
- `isPuppeteerAvailable()` for quick pre-check (no async cost)
- Temp files cleaned up immediately after embedding
- `headless: 'new'` for puppeteer ≥ 20 compat
- `--no-sandbox` for CI compatibility
- Viewport 1280×720 matches typical slide aspect ratio

## Verification
```bash
node -e "const s = require('./lib/screenshot-artifact.cjs'); console.log(typeof s.screenshotArtifact, typeof s.isPuppeteerAvailable);"
# function function
node -e "const s = require('./lib/screenshot-artifact.cjs'); console.log(s.isPuppeteerAvailable());"
# false (puppeteer not installed as dep) or true
```

## Acceptance Criteria
- [ ] `lib/screenshot-artifact.cjs` exists and can be required without error
- [ ] `screenshotArtifact()` returns `null` when puppeteer not installed (no throw)
- [ ] `isPuppeteerAvailable()` returns boolean without error
- [ ] `addPlaceholderVisual()` defined in `gen-proposal-pptx.cjs`
- [ ] Runtime integration comment block present in `gen-proposal-pptx.cjs`
- [ ] Stock template generation still works (`node scripts/gen-proposal-pptx.cjs` passes)
