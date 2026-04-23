# Task 73.1 — lib/screenshot-artifact.cjs: warnMissingTool helper

## Objective
Add `warnMissingTool(tool, installCmd)` exported helper to `lib/screenshot-artifact.cjs`. This function writes a standardized ⚠ warning to stderr when a visual tool is absent but artifacts exist.

## Paths
- lib/screenshot-artifact.cjs

## File-Level Plan

### Add before module.exports:

```js
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
```

Export: add `warnMissingTool` to `module.exports`.

**When to call** (documented in the helper's JSDoc and the workflow):
- Step 4c (PPTX): after `detectVisualArtifacts()` returns non-empty AND `isPuppeteerAvailable()` returns false
- Step 7 (docx): after checking mmdc absent AND `docxContent.diagrams.length > 0`; after checking puppeteer absent AND `artifacts.uiPages.length > 0 || artifacts.architectPages.length > 0`

## Best Practices
- `process.stderr.write()` (not `console.warn`) for consistent output regardless of logger config
- No throw — purely informational
- Single call per missing tool per generation run (not per-diagram)

## Verification
```bash
node -e "
const s = require('./lib/screenshot-artifact.cjs');
console.log(typeof s.warnMissingTool);  // function
s.warnMissingTool('puppeteer', 'npm install puppeteer');
// Should print ⚠ warning to stderr
"
```

## Acceptance Criteria
- [ ] `warnMissingTool` exported as function
- [ ] Writes to stderr (not stdout)
- [ ] Message includes ⚠, tool name, and install command
- [ ] Does not throw
- [ ] Existing exports unchanged
