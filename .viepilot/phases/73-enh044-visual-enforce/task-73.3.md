# Task 73.3 — Tests + CHANGELOG 2.10.1

## Objective
Create test file `tests/unit/vp-enh044-visual-enforce.test.js` with ≥8 tests verifying warning behavior. Update `CHANGELOG.md` to version 2.10.1.

## Paths
- tests/unit/vp-enh044-visual-enforce.test.js
- CHANGELOG.md
- package.json

## File-Level Plan

### tests/unit/vp-enh044-visual-enforce.test.js

Contracts to cover (≥8 tests):

```js
const { warnMissingTool, isPuppeteerAvailable, isMmdcAvailable } = require('../../lib/screenshot-artifact.cjs');

// Contract 1: warnMissingTool is exported as a function
test('warnMissingTool is exported as function', () => {
  expect(typeof warnMissingTool).toBe('function');
});

// Contract 2: does not throw
test('warnMissingTool does not throw', () => {
  expect(() => warnMissingTool('puppeteer', 'npm install puppeteer')).not.toThrow();
});

// Contract 3: writes to stderr (capture via process.stderr.write spy)
test('warnMissingTool writes to stderr', () => {
  const writes = [];
  const orig = process.stderr.write.bind(process.stderr);
  process.stderr.write = (msg) => { writes.push(msg); return true; };
  warnMissingTool('puppeteer', 'npm install puppeteer');
  process.stderr.write = orig;
  expect(writes.length).toBeGreaterThan(0);
});

// Contract 4: message includes ⚠
test('warnMissingTool message includes warning symbol', () => {
  const writes = [];
  const orig = process.stderr.write.bind(process.stderr);
  process.stderr.write = (msg) => { writes.push(msg); return true; };
  warnMissingTool('mytool', 'npm install mytool');
  process.stderr.write = orig;
  expect(writes.join('')).toContain('⚠');
});

// Contract 5: message includes tool name
test('warnMissingTool message includes tool name', () => {
  const writes = [];
  const orig = process.stderr.write.bind(process.stderr);
  process.stderr.write = (msg) => { writes.push(msg); return true; };
  warnMissingTool('mmdc', 'npm install -g @mermaid-js/mermaid-cli');
  process.stderr.write = orig;
  expect(writes.join('')).toContain('mmdc');
});

// Contract 6: message includes install command
test('warnMissingTool message includes install command', () => {
  const writes = [];
  const orig = process.stderr.write.bind(process.stderr);
  process.stderr.write = (msg) => { writes.push(msg); return true; };
  warnMissingTool('puppeteer', 'npm install puppeteer');
  process.stderr.write = orig;
  expect(writes.join('')).toContain('npm install puppeteer');
});

// Contract 7: workflows/proposal.md Step 4c uses warnMissingTool language
test('workflows/proposal.md Step 4c references warnMissingTool', () => {
  const fs = require('fs'), path = require('path');
  const src = fs.readFileSync(path.join(__dirname, '../../workflows/proposal.md'), 'utf8');
  expect(src).toMatch(/warnMissingTool/);
});

// Contract 8: workflows/proposal.md Step 7 references warnMissingTool
test('workflows/proposal.md Step 7 has mandatory enforcement language', () => {
  const fs = require('fs'), path = require('path');
  const src = fs.readFileSync(path.join(__dirname, '../../workflows/proposal.md'), 'utf8');
  // Step 7 should contain both warnMissingTool and mandatory/MANDATORY
  const step7Match = src.match(/###\s+Step 7[\s\S]*?(?=###\s+Step 8|$)/);
  expect(step7Match).not.toBeNull();
  expect(step7Match[0]).toMatch(/warnMissingTool|mandatory|MANDATORY/i);
});
```

### CHANGELOG.md update

Add under `## [Unreleased]` (or create `## [2.10.1]` section):

```markdown
## [2.10.1] - 2026-04-11

### Changed
- ENH-044: vp-proposal mandatory visual enforcement — when `detectVisualArtifacts()` returns non-empty, visual embedding can no longer be silently skipped
  - Step 4c (PPTX): `visualSlides[]` is always populated when artifacts exist; puppeteer absent → `addPlaceholderVisual()` + `⚠ WARNING`
  - Step 7 (docx): Mermaid + ui/architect sections always added when diagrams/artifacts exist; mmdc/puppeteer absent → text fallback + `⚠ WARNING`
  - Added `warnMissingTool(tool, installCmd)` helper to `lib/screenshot-artifact.cjs` — writes standardized stderr warning with install hint
```

### package.json version bump
- Change `"version": "2.10.0"` → `"version": "2.10.1"`

## Verification
```bash
npx jest tests/unit/vp-enh044-visual-enforce.test.js --no-coverage
# All ≥8 tests pass

node -e "
const s = require('./lib/screenshot-artifact.cjs');
console.log(typeof s.warnMissingTool);
s.warnMissingTool('test-tool', 'npm install test-tool');
" 2>&1
# Should print: function
# Then print ⚠ warning to stderr
```

## Acceptance Criteria
- [ ] `tests/unit/vp-enh044-visual-enforce.test.js` created with ≥8 tests
- [ ] All tests pass
- [ ] CHANGELOG.md has `[2.10.1]` section with ENH-044 notes
- [ ] `package.json` version is `2.10.1`
- [ ] `npm test` passes (all suites)
