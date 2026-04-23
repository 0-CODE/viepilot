# Task 72.4 — Tests + CHANGELOG 2.10.0

## Objective
Create `tests/unit/vp-enh043-docx-visuals.test.js` (≥14 tests), update `vp-proposal-contracts.test.js` (+2), bump `package.json` to 2.10.0, update CHANGELOG.

## Paths
- tests/unit/vp-enh043-docx-visuals.test.js
- tests/unit/vp-proposal-contracts.test.js
- package.json
- CHANGELOG.md

## File-Level Plan

### tests/unit/vp-enh043-docx-visuals.test.js
Groups:

1. **isMmdcAvailable + renderMermaidToPng** (5 tests):
   - `isMmdcAvailable` is exported function from `screenshot-artifact.cjs`
   - `renderMermaidToPng` is exported function
   - `isMmdcAvailable()` returns boolean
   - `renderMermaidToPng(null, '/tmp/x.png')` returns null (no throw)
   - `renderMermaidToPng('flowchart TD\n A-->B', '/tmp/vp-test.png')` returns null when mmdc absent

2. **imageRunFromPng helper** (5 tests):
   - `gen-proposal-docx.cjs` contains `imageRunFromPng` function
   - Script contains `require('../lib/screenshot-artifact.cjs')`
   - Script contains `require('../lib/proposal-generator.cjs')`
   - Script contains runtime visual embedding comment block (`renderMermaidToPng`)
   - Stock `gen-proposal-docx.cjs` still generates `project-detail.docx` after changes

3. **Workflow Step 7 updated** (2 tests):
   - `workflows/proposal.md` Step 7 mentions `renderMermaidToPng`
   - `workflows/proposal.md` Step 7 mentions `screenshotArtifact` in context of docx

4. **Integration smoke** (2 tests):
   - `lib/screenshot-artifact.cjs` exports `isMmdcAvailable` function
   - `lib/screenshot-artifact.cjs` exports `renderMermaidToPng` function

### vp-proposal-contracts.test.js — add to Group 2:
```js
test('isMmdcAvailable is exported from screenshot-artifact.cjs (ENH-043)', () => {
  const s = require('../../lib/screenshot-artifact.cjs');
  expect(typeof s.isMmdcAvailable).toBe('function');
});
test('renderMermaidToPng is exported from screenshot-artifact.cjs (ENH-043)', () => {
  const s = require('../../lib/screenshot-artifact.cjs');
  expect(typeof s.renderMermaidToPng).toBe('function');
});
```

### package.json: 2.9.0 → 2.10.0
### CHANGELOG.md: add `## [2.10.0]` section

## Verification
```bash
npx jest tests/unit/vp-enh043-docx-visuals.test.js tests/unit/vp-proposal-contracts.test.js --no-coverage
# All pass
npx jest tests/unit/ --no-coverage 2>&1 | tail -5
# X passed, 0 failed
```

## Acceptance Criteria
- [ ] `vp-enh043-docx-visuals.test.js` ≥14 tests all passing
- [ ] `vp-proposal-contracts.test.js` +2 ENH-043 assertions
- [ ] `package.json` version = 2.10.0
- [ ] CHANGELOG `[2.10.0]` present
- [ ] Full test suite passes
