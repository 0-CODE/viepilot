# Task 74.4 — Tests + CHANGELOG 2.11.0

## Objective
Create `tests/unit/vp-enh045-dynamic-slides.test.js` with ≥12 tests. Update CHANGELOG.md and bump version to 2.11.0.

## Paths
- tests/unit/vp-enh045-dynamic-slides.test.js
- CHANGELOG.md
- package.json

## File-Level Plan

### tests/unit/vp-enh045-dynamic-slides.test.js

Contracts to cover (≥12 tests):

```js
const { getDesignConfig, DESIGN_CONFIGS } = require('../../lib/proposal-generator.cjs');
const fs   = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', '..');

// Contract 1: getDesignConfig exported as function
test('getDesignConfig is exported as function', () => {
  expect(typeof getDesignConfig).toBe('function');
});

// Contract 2: DESIGN_CONFIGS has 3 keys
test('DESIGN_CONFIGS has modern-tech, enterprise, creative', () => {
  expect(Object.keys(DESIGN_CONFIGS)).toEqual(expect.arrayContaining(['modern-tech', 'enterprise', 'creative']));
});

// Contract 3: each config has required fields
test.each(Object.entries(DESIGN_CONFIGS))('DESIGN_CONFIGS[%s] has colorPalette + fontPair', (key, config) => {
  expect(config).toHaveProperty('colorPalette');
  expect(config).toHaveProperty('fontPair');
  expect(config).toHaveProperty('layoutStyle');
  expect(config.colorPalette).toHaveProperty('primary');
  expect(config.colorPalette).toHaveProperty('accent');
});

// Contract 6: default → modern-tech
test('getDesignConfig() defaults to modern-tech', () => {
  expect(getDesignConfig().layoutStyle).toBe('modern-tech');
  expect(getDesignConfig({}).layoutStyle).toBe('modern-tech');
});

// Contract 7: finance signal → enterprise
test('getDesignConfig({sector:"fintech"}) returns enterprise', () => {
  expect(getDesignConfig({ sector: 'fintech' }).layoutStyle).toBe('enterprise');
});

// Contract 8: legal signal → enterprise
test('getDesignConfig({decisionMaker:"procurement committee"}) returns enterprise', () => {
  expect(getDesignConfig({ decisionMaker: 'procurement committee' }).layoutStyle).toBe('enterprise');
});

// Contract 9: design signal → creative
test('getDesignConfig({sector:"design agency"}) returns creative', () => {
  expect(getDesignConfig({ sector: 'design agency' }).layoutStyle).toBe('creative');
});

// Contract 10: explicit override
test('getDesignConfig({layoutStyle:"enterprise"}) returns enterprise', () => {
  expect(getDesignConfig({ layoutStyle: 'enterprise' }).layoutStyle).toBe('enterprise');
});

// Contract 11: does not throw for any input
test('getDesignConfig does not throw for null/undefined fields', () => {
  expect(() => getDesignConfig(null)).not.toThrow();
  expect(() => getDesignConfig({ sector: undefined })).not.toThrow();
});

// Contract 12: workflows/proposal.md Step 4 no longer has hard slide cap
test('workflows/proposal.md does not contain hardcap "slides.length MUST equal"', () => {
  const src = fs.readFileSync(path.join(ROOT, 'workflows/proposal.md'), 'utf8');
  expect(src).not.toContain('slides.length MUST equal PROPOSAL_TYPES[typeId].slides');
});

// Contract 13: workflows/proposal.md has designConfig in manifest schema
test('workflows/proposal.md manifest schema includes designConfig', () => {
  const src = fs.readFileSync(path.join(ROOT, 'workflows/proposal.md'), 'utf8');
  expect(src).toContain('designConfig');
});

// Contract 14: workflows/proposal.md has dynamic slide rules
test('workflows/proposal.md has content-aware split rules', () => {
  const src = fs.readFileSync(path.join(ROOT, 'workflows/proposal.md'), 'utf8');
  expect(src).toMatch(/content.aware|split.*trigger|dynamic.*slide/i);
});

// Contract 15: 3 palette PPTX variants exist for project-proposal
test('project-proposal palette variants exist', () => {
  const pptxDir = path.join(ROOT, 'templates', 'proposal', 'pptx');
  ['modern-tech', 'enterprise', 'creative'].forEach(style => {
    expect(fs.existsSync(path.join(pptxDir, `project-proposal-${style}.pptx`))).toBe(true);
  });
});
```

### CHANGELOG.md

Add `## [2.11.0]` section:
```markdown
## [2.11.0] - 2026-04-11

### Added (ENH-045 — Phase 74)
- **`lib/proposal-generator.cjs`**: `getDesignConfig(projectContext)` — selects design config (colorPalette, layoutStyle, fontPair) based on project context hints; `DESIGN_CONFIGS` preset map for `modern-tech`, `enterprise`, `creative` styles
- **`scripts/gen-proposal-pptx.cjs`**: Palette-driven generation — all layout functions accept `colors` param; 3 new rich layouts: `addTimelineGanttSlide` (visual Gantt bars), `addTeamCardSlide` (card-based with avatar), `addInvestmentVisualSlide` (bar breakdown with total callout)
- **`templates/proposal/pptx/`**: 3 palette variants for `project-proposal`: `project-proposal-modern-tech.pptx`, `project-proposal-enterprise.pptx`, `project-proposal-creative.pptx`
- **`workflows/proposal.md` Step 4**: Dynamic slide count — base count per type is minimum, AI extends based on content; `designConfig` field in manifest schema; content-aware split triggers documented; AI prompt DESIGN SELECTION + DYNAMIC SLIDES rules added
- **`workflows/proposal.md` Step 6**: Palette template selection — AI reads `manifest.designConfig.layoutStyle` to pick `project-proposal-{style}.pptx`
- 15 tests in `vp-enh045-dynamic-slides.test.js`
```

### package.json version bump
- Change `"version": "2.10.1"` → `"version": "2.11.0"`

## Verification
```bash
npx jest tests/unit/vp-enh045-dynamic-slides.test.js --no-coverage
# All ≥12 tests pass

npx jest tests/unit/ --no-coverage
# All suites pass
```

## Acceptance Criteria
- [ ] `tests/unit/vp-enh045-dynamic-slides.test.js` created with ≥12 tests
- [ ] All tests pass
- [ ] CHANGELOG.md has `[2.11.0]` section with ENH-045 notes
- [ ] `package.json` version is `2.11.0`
- [ ] `npm test` passes (all suites)
