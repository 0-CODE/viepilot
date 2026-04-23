# Task 71.1 — detectVisualArtifacts() helper

## Objective
Add `detectVisualArtifacts(sessionDir)` exported function to `lib/proposal-generator.cjs`. Given an optional session directory path, scan for available HTML artifact files (ui-direction pages + architect workspace pages) and return a structured object.

## Paths
- lib/proposal-generator.cjs

## File-Level Plan

### lib/proposal-generator.cjs
Add at end of module (before `module.exports`):

```js
/** Known architect workspace page filenames */
const ARCHITECT_PAGES = [
  'architecture.html',
  'erd.html',
  'sequence-diagram.html',
  'feature-map.html',
  'user-use-cases.html',
  'deployment.html',
  'apis.html',
  'tech-notes.html',
];

/**
 * Detect available HTML visual artifacts for screenshot embedding.
 * @param {string} [sessionDir] - Path to .viepilot/ui-direction/{session}/ dir.
 *   If omitted, auto-detects latest session by scanning CWD/.viepilot/ui-direction/.
 * @returns {{ uiPages: string[], architectPages: string[], sessionDir: string|null }}
 *   uiPages: absolute paths to ui-direction HTML files (index.html + pages/*.html)
 *   architectPages: absolute paths to architect workspace HTML files found in sessionDir
 *   sessionDir: resolved session directory or null if none found
 */
function detectVisualArtifacts(sessionDir) {
  const fs = require('fs');
  const path = require('path');

  // Auto-detect latest session if not provided
  let resolvedDir = sessionDir || null;
  if (!resolvedDir) {
    const uiBase = path.join(process.cwd(), '.viepilot', 'ui-direction');
    if (fs.existsSync(uiBase)) {
      const entries = fs.readdirSync(uiBase)
        .filter(e => fs.statSync(path.join(uiBase, e)).isDirectory())
        .sort()
        .reverse();  // latest first (ISO date dirs sort correctly)
      if (entries.length > 0) resolvedDir = path.join(uiBase, entries[0]);
    }
  }

  const result = { uiPages: [], architectPages: [], sessionDir: resolvedDir };
  if (!resolvedDir || !fs.existsSync(resolvedDir)) return result;

  // ui-direction: index.html + pages/*.html
  const indexHtml = path.join(resolvedDir, 'index.html');
  if (fs.existsSync(indexHtml)) result.uiPages.push(indexHtml);

  const pagesDir = path.join(resolvedDir, 'pages');
  if (fs.existsSync(pagesDir)) {
    const pageFiles = fs.readdirSync(pagesDir)
      .filter(f => f.endsWith('.html'))
      .map(f => path.join(pagesDir, f));
    result.uiPages.push(...pageFiles);
  }

  // Architect workspace pages (in same session dir)
  for (const page of ARCHITECT_PAGES) {
    const p = path.join(resolvedDir, page);
    if (fs.existsSync(p)) result.architectPages.push(p);
  }

  return result;
}
```

Export: add `detectVisualArtifacts` to `module.exports`.

## Best Practices
- `require('fs')` / `require('path')` inside function (already available in Node env)
- No external dependencies
- Graceful: returns empty arrays if dirs don't exist
- Deterministic: sort + reverse for latest-first

## Verification
```bash
node -e "
const g = require('./lib/proposal-generator.cjs');
console.log(typeof g.detectVisualArtifacts);
// Should print 'function'
const r = g.detectVisualArtifacts('/nonexistent');
console.log(r.uiPages.length, r.architectPages.length);
// Should print: 0 0
"
```

## Acceptance Criteria
- [ ] `detectVisualArtifacts` exported from `proposal-generator.cjs`
- [ ] Returns `{ uiPages: [], architectPages: [], sessionDir }` for missing dir
- [ ] Detects `index.html` + `pages/*.html` for ui-direction
- [ ] Detects architect pages from `ARCHITECT_PAGES` list
- [ ] Auto-detects latest session when no arg provided
