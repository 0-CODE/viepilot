# Task 71.4 — Tests + CHANGELOG 2.9.0

## Objective
Create `tests/unit/vp-enh042-proposal-visuals.test.js` (≥15 tests), update `vp-proposal-contracts.test.js` (+3), bump `package.json` to 2.9.0, update CHANGELOG.

## Paths
- tests/unit/vp-enh042-proposal-visuals.test.js
- tests/unit/vp-proposal-contracts.test.js
- package.json
- CHANGELOG.md

## File-Level Plan

### tests/unit/vp-enh042-proposal-visuals.test.js
Groups:
1. **detectVisualArtifacts()** (6 tests):
   - Is exported function
   - Returns `{ uiPages, architectPages, sessionDir }` for missing dir
   - `uiPages` is array, `architectPages` is array
   - Returns empty arrays for nonexistent path
   - Auto-detects (returns valid object when no arg)
   - `sessionDir` is null when no ui-direction exists

2. **screenshot-artifact.cjs** (5 tests):
   - Module can be required without error
   - `screenshotArtifact` is async function
   - `isPuppeteerAvailable` is synchronous function returning boolean
   - `screenshotArtifact('/nonexistent.html')` returns null (no puppeteer) — does not throw
   - `isPuppeteerAvailable()` returns false when puppeteer not installed

3. **workflow Step 4c** (3 tests):
   - `workflows/proposal.md` contains `detect_visual_artifacts` step
   - `visualSlides[]` schema documented in workflow
   - artifact → slide mapping table present

4. **gen-proposal-pptx.cjs** (2 tests):
   - `addPlaceholderVisual` defined in script
   - Runtime integration comment block present

### tests/unit/vp-proposal-contracts.test.js — add to Group 1:
```js
test('workflow.md contains Step 4c detect_visual_artifacts (ENH-042)', () => {
  expect(read('workflows/proposal.md')).toMatch(/detect_visual_artifacts|Step 4c/);
});
test('workflow.md documents visualSlides[] manifest field (ENH-042)', () => {
  expect(read('workflows/proposal.md')).toContain('visualSlides');
});
test('lib/screenshot-artifact.cjs can be required (ENH-042)', () => {
  expect(() => require('../../lib/screenshot-artifact.cjs')).not.toThrow();
});
```

### package.json
- `"version": "2.8.0"` → `"version": "2.9.0"`

### CHANGELOG.md
Add `## [2.9.0]` section documenting ENH-042 additions.

## Verification
```bash
npx jest tests/unit/vp-enh042-proposal-visuals.test.js tests/unit/vp-proposal-contracts.test.js --no-coverage
# All tests pass
npx jest tests/unit/ --no-coverage 2>&1 | tail -5
# X passed, 0 failed
```

## Acceptance Criteria
- [ ] `vp-enh042-proposal-visuals.test.js` with ≥15 tests all passing
- [ ] `vp-proposal-contracts.test.js` +3 ENH-042 assertions
- [ ] `package.json` version = 2.9.0
- [ ] CHANGELOG `[2.9.0]` section present
- [ ] Full `npm test` passes
