# Task 72.2 — scripts/gen-proposal-docx.cjs: imageRunFromPng + visual embedding

## Objective
Add `imageRunFromPng(pngPath, widthPx, heightPx)` helper to `scripts/gen-proposal-docx.cjs`, and wire up visual embedding in the document:
1. **Mermaid diagrams**: in Diagram Reference section, render each `mermaidSource` to PNG (via `renderMermaidToPng`) and insert as `ImageRun` before the monospace text; fallback keeps text-only
2. **UI screenshot**: before Executive Summary — if `detectVisualArtifacts()` finds `uiPages[0]`, screenshot and insert as `ImageRun`; fallback: no image (silent skip)
3. **Architect screenshot**: after Technical Approach — if `architecture.html` found, screenshot and insert; fallback: silent skip

Note: `gen-proposal-docx.cjs` is the stock template generator — it runs without a real session, so `detectVisualArtifacts()` will return empty. The screenshot helpers are integrated via comment blocks for the runtime path, same pattern as ENH-042 in gen-proposal-pptx.cjs. The `imageRunFromPng` function IS testable as a pure helper.

## Paths
- scripts/gen-proposal-docx.cjs

## File-Level Plan

### Add requires at top:
```js
const { renderMermaidToPng, isMmdcAvailable, screenshotArtifact, cleanupScreenshot } = require('../lib/screenshot-artifact.cjs');
const { detectVisualArtifacts } = require('../lib/proposal-generator.cjs');
```

### Add helper function (after twoColTable, before main()):

```js
// ── Image embedding helper (ENH-043) ─────────────────────────────────────────

/**
 * Create a docx ImageRun from a PNG file path.
 * Returns null if path is null/missing.
 *
 * @param {string|null} pngPath - Absolute path to PNG
 * @param {number} [widthEmu=5940000] - Width in EMUs (1 inch = 914400 EMUs; ~6.5 inches)
 * @param {number} [heightEmu=3402000] - Height in EMUs (~3.7 inches)
 * @returns {ImageRun|null}
 */
function imageRunFromPng(pngPath, widthEmu = 5940000, heightEmu = 3402000) {
  if (!pngPath || !require('fs').existsSync(pngPath)) return null;
  try {
    return new ImageRun({
      data: require('fs').readFileSync(pngPath),
      transformation: { width: widthEmu, height: heightEmu },
      type: 'png',
    });
  } catch {
    return null;
  }
}
```

### Runtime visual embedding pattern (comment block in gen-proposal-docx.cjs):

```js
// ── Runtime visual embedding (ENH-043) ────────────────────────────────────────
// Called by vp-proposal workflow at runtime when docxContent + visualSlides available.
//
// 1. Mermaid diagrams in Diagram Reference section:
//    for (const diagram of docxContent.diagrams) {
//      const tmpPng = path.join(os.tmpdir(), `vp-mmdc-${Date.now()}.png`);
//      const rendered = renderMermaidToPng(diagram.mermaidSource, tmpPng);
//      if (rendered) {
//        const imgRun = imageRunFromPng(rendered);
//        if (imgRun) children.push(new Paragraph({ children: [imgRun] }));
//        cleanupScreenshot(rendered);
//      }
//      // Fallback: preformatted mermaid source text already added above
//    }
//
// 2. UI screenshot before Executive Summary:
//    const artifacts = detectVisualArtifacts();
//    if (artifacts.uiPages[0]) {
//      const tmpPng = await screenshotArtifact(artifacts.uiPages[0]);
//      if (tmpPng) {
//        const imgRun = imageRunFromPng(tmpPng);
//        if (imgRun) executiveSummaryChildren.unshift(new Paragraph({ children: [imgRun] }));
//        cleanupScreenshot(tmpPng);
//      }
//    }
//
// 3. Architect screenshot after Technical Approach:
//    const archHtml = artifacts.architectPages.find(p => p.endsWith('architecture.html'));
//    if (archHtml) {
//      const tmpPng = await screenshotArtifact(archHtml);
//      if (tmpPng) {
//        const imgRun = imageRunFromPng(tmpPng);
//        if (imgRun) techSectionChildren.push(new Paragraph({ children: [imgRun] }));
//        cleanupScreenshot(tmpPng);
//      }
//    }
```

## Best Practices
- EMU (English Metric Units): 914400 EMU = 1 inch; 5940000 ≈ 6.5 inches width (full page width minus margins)
- `ImageRun` must be child of a `Paragraph` — never standalone
- Wrap `readFileSync` in try/catch — corrupt PNG should not crash generation
- Require `fs` and `path` at module top (already present in the file)

## Verification
```bash
node scripts/gen-proposal-docx.cjs
# Should still output: ✓ project-detail.docx (N KB)
node -e "const s = require('./scripts/gen-proposal-docx.cjs')"
# Should not throw (module-level execution is wrapped in main())
```

## Acceptance Criteria
- [ ] `imageRunFromPng` function defined in `gen-proposal-docx.cjs`
- [ ] Returns null for null/missing path (no throw)
- [ ] Runtime visual embedding comment block present (Mermaid + UI + architect)
- [ ] `require('../lib/screenshot-artifact.cjs')` at top of file
- [ ] `require('../lib/proposal-generator.cjs')` at top of file
- [ ] Stock `gen-proposal-docx.cjs` still generates `project-detail.docx` successfully
