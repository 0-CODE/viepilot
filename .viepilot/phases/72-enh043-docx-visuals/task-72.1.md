# Task 72.1 — lib/screenshot-artifact.cjs: isMmdcAvailable + renderMermaidToPng

## Objective
Extend `lib/screenshot-artifact.cjs` with two new exports:
- `isMmdcAvailable()`: synchronous boolean check for `mmdc` CLI on PATH
- `renderMermaidToPng(mermaidSource, outputPath)`: renders Mermaid source string → PNG file via `mmdc`; returns output path or `null` if mmdc absent

## Paths
- lib/screenshot-artifact.cjs

## File-Level Plan

### Add after existing exports in lib/screenshot-artifact.cjs:

```js
const cp = require('child_process');

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
 * Render a Mermaid diagram source string to a PNG file using mmdc CLI.
 * Returns null silently when mmdc is not available.
 *
 * @param {string} mermaidSource - Valid Mermaid 10+ source code
 * @param {string} outputPath - Absolute path for the output .png file
 * @returns {string|null} outputPath on success, null if mmdc absent or error
 */
function renderMermaidToPng(mermaidSource, outputPath) {
  if (!isMmdcAvailable()) return null;
  if (!mermaidSource || !mermaidSource.trim()) return null;

  const tmpInput = outputPath.replace(/\.png$/, '.mmd');
  try {
    fs.writeFileSync(tmpInput, mermaidSource, 'utf8');
    const r = cp.spawnSync('mmdc', ['-i', tmpInput, '-o', outputPath, '-b', 'white'], {
      encoding: 'utf8',
      timeout: 30000,
    });
    return (r.status === 0 && fs.existsSync(outputPath)) ? outputPath : null;
  } catch {
    return null;
  } finally {
    try { if (fs.existsSync(tmpInput)) fs.unlinkSync(tmpInput); } catch { /* ignore */ }
  }
}
```

Also add `cp` (`child_process`) require at top of file (it's a Node built-in — no install needed).

Export: add `isMmdcAvailable` and `renderMermaidToPng` to `module.exports`.

## Best Practices
- `spawnSync` with timeout to avoid hanging
- Write temp `.mmd` file, then delete after render (cleanup in finally block)
- `fs.existsSync(outputPath)` check after render confirms success (mmdc can exit 0 with errors in some versions)
- `-b white` flag: white background for clean docx embedding

## Verification
```bash
node -e "
const s = require('./lib/screenshot-artifact.cjs');
console.log(typeof s.isMmdcAvailable);     // function
console.log(typeof s.renderMermaidToPng);  // function
console.log(s.isMmdcAvailable());           // false (mmdc not globally installed as dep)
// renderMermaidToPng returns null when mmdc absent — no throw:
const r = s.renderMermaidToPng('flowchart TD\n  A-->B', '/tmp/test.png');
console.log(r);  // null
"
```

## Acceptance Criteria
- [ ] `isMmdcAvailable` exported as function
- [ ] `renderMermaidToPng` exported as function
- [ ] Both return without throwing when mmdc absent
- [ ] `renderMermaidToPng` returns null (not undefined) when mmdc unavailable
- [ ] Existing exports (`screenshotArtifact`, `isPuppeteerAvailable`, `cleanupScreenshot`) unchanged
