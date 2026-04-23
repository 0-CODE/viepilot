# Phase 63 — SPEC: vp-proposal core infrastructure (FEAT-016)

## Goal
Add `pptxgenjs` + `docx` npm dependencies and create `lib/proposal-generator.cjs` — the shared engine for template resolution and file generation. This is the foundation all subsequent phases build on.

## Version target
**2.5.0** (MINOR — new skill)

## Dependencies
- Phase 62 ✅ (FEAT-015 — Codex adapter)

---

## Tasks

### Task 63.1 — Add npm dependencies
**Objective:** Wire in the two core packages and the optional Google Slides dep.

## Paths
- `package.json`

**File-Level Plan:**
- `dependencies`: add `"pptxgenjs": "^3.12.0"` and `"docx": "^9.0.0"`
- `optionalDependencies`: add `"@googleapis/slides": "^1.0.0"`
- Do NOT add to `devDependencies` — these ship with the package

**Verification:** `node -e "require('pptxgenjs'); require('docx'); console.log('ok')"` prints `ok`.

---

### Task 63.2 — `lib/proposal-generator.cjs`
**Objective:** Core module: template resolution (2-tier), JSON slide manifest schema, base .pptx and .docx writer stubs.

## Paths
- `lib/proposal-generator.cjs`

**File-Level Plan:**
```js
'use strict';
const fs   = require('fs');
const path = require('path');

// Proposal type definitions
const PROPOSAL_TYPES = {
  'project-proposal':  { slides: 10, label: 'Project Proposal' },
  'tech-architecture': { slides: 12, label: 'Technical Architecture' },
  'product-pitch':     { slides: 12, label: 'Product Pitch Deck' },
  'general':           { slides: 8,  label: 'General Proposal' },
};

// 2-tier template resolution
// Tier 1: .viepilot/proposal-templates/{type}.{ext}  (project override)
// Tier 2: {packageRoot}/templates/proposal/{ext}/{type}.{ext}  (stock)
function resolveTemplate(type, ext, projectRoot) {
  const override = path.join(projectRoot, '.viepilot', 'proposal-templates', `${type}.${ext}`);
  if (fs.existsSync(override)) return override;
  const stock = path.join(__dirname, '..', 'templates', 'proposal', ext, `${type}.${ext}`);
  return stock; // caller validates existence
}

// Auto-detect latest brainstorm session
function detectBrainstormSession(projectRoot) {
  const dir = path.join(projectRoot, 'docs', 'brainstorm');
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir)
    .filter(f => f.startsWith('session-') && f.endsWith('.md'))
    .sort()
    .reverse();
  return files.length ? path.join(dir, files[0]) : null;
}

// Validate proposal type
function validateType(type) {
  if (!PROPOSAL_TYPES[type]) {
    throw new Error(`Unknown proposal type "${type}". Valid: ${Object.keys(PROPOSAL_TYPES).join(', ')}`);
  }
  return PROPOSAL_TYPES[type];
}

module.exports = { PROPOSAL_TYPES, resolveTemplate, detectBrainstormSession, validateType };
```

**Verification:** `node -e "const g=require('./lib/proposal-generator.cjs'); console.log(g.validateType('product-pitch').slides)"` prints `12`.

---

### Task 63.3 — Unit tests: template resolution
**Objective:** Jest tests covering template resolution and type validation.

## Paths
- `tests/unit/vp-proposal-core.test.js`

**File-Level Plan:**
```
describe('proposal-generator — resolveTemplate')
  test: returns project override path when .viepilot/proposal-templates/{type}.pptx exists
  test: falls back to stock path when project override absent
  test: resolveTemplate works for .docx ext too

describe('proposal-generator — validateType')
  test: all 4 valid type IDs pass without throwing
  test: unknown type throws with helpful message

describe('proposal-generator — detectBrainstormSession')
  test: returns null when docs/brainstorm/ absent
  test: returns most recent session file when multiple exist
```

**Verification:** `npx jest tests/unit/vp-proposal-core.test.js --no-coverage` — all tests pass.

---

## Phase Verification
```bash
node -e "require('pptxgenjs'); require('docx'); console.log('deps ok')"
node -e "const g=require('./lib/proposal-generator.cjs'); console.log(Object.keys(g.PROPOSAL_TYPES))"
npx jest tests/unit/vp-proposal-core.test.js --no-coverage
```
