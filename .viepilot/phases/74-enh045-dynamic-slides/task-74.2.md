# Task 74.2 — lib/proposal-generator.cjs: getDesignConfig(projectContext) helper

## Objective
Add `getDesignConfig(projectContext)` exported helper to `lib/proposal-generator.cjs`. Returns the appropriate `designConfig` object based on project context hints (audience, sector, decisionMaker).

## Paths
- lib/proposal-generator.cjs

## File-Level Plan

### Add constant: DESIGN_CONFIGS

```js
/**
 * Design config presets for 3 layout styles.
 * ENH-045: AI-driven visual design for vp-proposal PPTX.
 */
const DESIGN_CONFIGS = {
  'modern-tech': {
    layoutStyle: 'modern-tech',
    colorPalette: {
      primary:   '1a1f36',  // deep navy
      accent:    '4f6ef7',  // electric blue
      highlight: '00d4ff',  // cyan
      surface:   '2d3142',  // charcoal
      text:      'e8ecf4',  // near-white
      muted:     '8892b0',  // slate
    },
    fontPair: { heading: 'Calibri', body: 'Calibri' },
    description: 'Tech/SaaS/startup — modern dark with electric blue accent',
  },
  'enterprise': {
    layoutStyle: 'enterprise',
    colorPalette: {
      primary:   '0f2044',  // dark navy
      accent:    'c9a84c',  // gold
      highlight: 'e8c96d',  // light gold
      surface:   '1c3461',  // medium navy
      text:      'f0f4ff',  // near-white
      muted:     '8fa3c8',  // cool grey
    },
    fontPair: { heading: 'Calibri', body: 'Calibri' },
    description: 'Finance/legal/enterprise — professional navy with gold accent',
  },
  'creative': {
    layoutStyle: 'creative',
    colorPalette: {
      primary:   '1a0a2e',  // deep purple
      accent:    'e94560',  // vibrant red-pink
      highlight: 'f4a261',  // warm orange
      surface:   '2d1b45',  // purple surface
      text:      'f5f0ff',  // near-white with purple tint
      muted:     'a895c8',  // muted purple
    },
    fontPair: { heading: 'Calibri', body: 'Calibri' },
    description: 'Design/marketing/creative — vibrant with bold accent',
  },
};
```

### Add function: getDesignConfig

```js
/**
 * Select the appropriate design config based on project context hints.
 * Falls back to 'modern-tech' when no clear signal.
 *
 * @param {object} [projectContext] - Optional context object
 * @param {string} [projectContext.audience] - e.g. 'client', 'investor', 'partner'
 * @param {string} [projectContext.decisionMaker] - e.g. 'CTO', 'CEO', 'procurement committee'
 * @param {string} [projectContext.layoutStyle] - Explicit override
 * @param {string} [projectContext.sector] - e.g. 'fintech', 'healthtech', 'design', 'saas'
 * @returns {{ layoutStyle: string, colorPalette: object, fontPair: object, description: string }}
 */
function getDesignConfig(projectContext = {}) {
  // Explicit override takes priority
  if (projectContext.layoutStyle && DESIGN_CONFIGS[projectContext.layoutStyle]) {
    return DESIGN_CONFIGS[projectContext.layoutStyle];
  }

  const hints = [
    projectContext.decisionMaker || '',
    projectContext.audience || '',
    projectContext.sector || '',
  ].join(' ').toLowerCase();

  // Enterprise signals
  if (/finance|legal|bank|insurance|government|procurement|c-suite|cfo|coo|board|compliance/.test(hints)) {
    return DESIGN_CONFIGS['enterprise'];
  }

  // Creative signals
  if (/design|creative|marketing|brand|art|media|agency|product.*manager|startup.*pitch/.test(hints)) {
    return DESIGN_CONFIGS['creative'];
  }

  // Default: modern-tech (covers tech/SaaS/dev/general)
  return DESIGN_CONFIGS['modern-tech'];
}
```

### Export: add to module.exports

Add `DESIGN_CONFIGS` and `getDesignConfig` to `module.exports`.

## Verification
```bash
node -e "
const { getDesignConfig, DESIGN_CONFIGS } = require('./lib/proposal-generator.cjs');
console.log(typeof getDesignConfig);                          // function
console.log(getDesignConfig().layoutStyle);                   // modern-tech
console.log(getDesignConfig({ sector: 'fintech' }).layoutStyle); // enterprise
console.log(getDesignConfig({ sector: 'design agency' }).layoutStyle); // creative
console.log(getDesignConfig({ layoutStyle: 'enterprise' }).layoutStyle); // enterprise
console.log(Object.keys(DESIGN_CONFIGS));                     // ['modern-tech','enterprise','creative']
"
```

## Acceptance Criteria
- [ ] `getDesignConfig` exported as function
- [ ] `DESIGN_CONFIGS` exported with 3 keys: `modern-tech`, `enterprise`, `creative`
- [ ] Each config has `colorPalette` (6 keys), `fontPair`, `layoutStyle`, `description`
- [ ] Explicit `layoutStyle` override works
- [ ] Enterprise signals detected (finance, legal, bank, etc.)
- [ ] Creative signals detected (design, marketing, creative, etc.)
- [ ] Default fallback returns `modern-tech`
- [ ] Does not throw for any input
