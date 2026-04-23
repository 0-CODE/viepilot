# Phase 68 — SPEC: vp-proposal language selection (ENH-039)

## Goal
Add `--lang <code>` flag to `/vp-proposal` so AI-generated content (headings, bullets, speaker notes, docx sections) is written in the chosen language. Selected language is persisted to `~/.viepilot/config.json` → `proposal.recentLangs` (MRU, max 5) for future suggestions. Add `--lang-content-only` for content-only mode that keeps structural labels in English.

## Version target
**2.6.0** (MINOR — new flags + config extension + UX flow change)

## Dependencies
- Phase 67 ✅ (FEAT-016 — vp-proposal base skill)
- ENH-032 ✅ (viepilot-config.cjs exists with readConfig/writeConfig)

---

## Tasks

### Task 68.1 — `lib/viepilot-config.cjs` — proposal lang helpers
**Objective:** Extend config DEFAULTS with `proposal.recentLangs` section; add two helpers: `getProposalLang()` (reads MRU default) and `recordProposalLang()` (prepends to MRU list, dedups, caps at 5).

## Paths
- `lib/viepilot-config.cjs`

**File-Level Plan:**

Extend `DEFAULTS`:
```js
const DEFAULTS = {
  language: { communication: 'en', document: 'en' },
  proposal: {
    recentLangs: [],    // MRU list, most recent first, max 5
    defaultLang: 'en',  // kept in sync with recentLangs[0]
  },
};
```

Add two new exported functions:

```js
/**
 * Get the suggested default language for proposals.
 * Returns recentLangs[0] if present, else DEFAULTS.proposal.defaultLang.
 */
function getProposalLang(overrideHomedir) {
  const cfg = readConfig(overrideHomedir);
  const recent = cfg.proposal && cfg.proposal.recentLangs;
  return (Array.isArray(recent) && recent.length > 0) ? recent[0] : 'en';
}

/**
 * Record a used language: prepend to recentLangs, dedup, cap at 5, sync defaultLang.
 */
function recordProposalLang(lang, overrideHomedir) {
  const cfg = readConfig(overrideHomedir);
  const existing = (cfg.proposal && Array.isArray(cfg.proposal.recentLangs))
    ? cfg.proposal.recentLangs : [];
  const updated = [lang, ...existing.filter(l => l !== lang)].slice(0, 5);
  writeConfig({ proposal: { recentLangs: updated, defaultLang: updated[0] } }, overrideHomedir);
}
```

**Verification:**
```bash
node -e "
const c = require('./lib/viepilot-config.cjs');
const tmp = require('os').tmpdir() + '/vp-lang-test';
c.recordProposalLang('vi', tmp);
c.recordProposalLang('en', tmp);
c.recordProposalLang('vi', tmp);  // dedup
console.log(c.getProposalLang(tmp)); // 'vi'
const cfg = c.readConfig(tmp);
console.log(cfg.proposal.recentLangs.length); // 2 (not 3 — deduped)
"
```

---

### Task 68.2 — `lib/proposal-generator.cjs` — language param + instruction builder
**Objective:** Add `lang` and `langContentOnly` params to the generator; add `buildLangInstruction()` helper that returns a prompt instruction string for the AI.

## Paths
- `lib/proposal-generator.cjs`

**File-Level Plan:**

Add exported function:
```js
/**
 * Build a language instruction string to prepend to the AI content generation prompt.
 *
 * @param {string} lang - ISO 639-1 code (e.g. 'vi', 'en', 'ja')
 * @param {boolean} contentOnly - if true, translate content only; keep structural labels English
 * @returns {string} Instruction to inject into AI prompt
 */
function buildLangInstruction(lang, contentOnly = false) {
  if (!lang || lang === 'en') {
    return '';  // English is default — no explicit instruction needed
  }
  const LANG_NAMES = {
    vi: 'Vietnamese', ja: 'Japanese', fr: 'French', zh: 'Chinese',
    ko: 'Korean', de: 'German', es: 'Spanish', pt: 'Portuguese',
    it: 'Italian', th: 'Thai', ar: 'Arabic', hi: 'Hindi',
  };
  const langName = LANG_NAMES[lang] || lang.toUpperCase();

  if (contentOnly) {
    return (
      `LANGUAGE INSTRUCTION: Generate all slide content (bullet points, body text, ` +
      `speaker notes, and paragraph content) in ${langName}. ` +
      `Keep structural labels, section names, and template placeholders in English.`
    );
  }
  return (
    `LANGUAGE INSTRUCTION: Generate ALL content — slide headings, bullet points, ` +
    `body text, speaker notes, document section titles, and paragraph content — in ${langName}. ` +
    `Do not mix languages.`
  );
}
```

Export it in `module.exports`:
```js
module.exports = {
  PROPOSAL_TYPES,
  resolveTemplate,
  detectBrainstormSession,
  validateType,
  buildOutputPaths,
  buildLangInstruction,   // ← new
};
```

**Verification:**
```bash
node -e "
const g = require('./lib/proposal-generator.cjs');
console.log(g.buildLangInstruction('vi'));
console.log(g.buildLangInstruction('en'));  // empty string
console.log(g.buildLangInstruction('ja', true));
"
```

---

### Task 68.3 — Skill + workflow: `--lang` flag docs + UX flow
**Objective:** Document `--lang` and `--lang-content-only` in SKILL.md; update `workflows/proposal.md` Step 1 (load lang config) and Step 4 (manifest generation) with language instruction injection and MRU prompt.

## Paths
- `skills/vp-proposal/SKILL.md`
- `workflows/proposal.md`

**File-Level Plan — SKILL.md:**

Add to `<context>` flags section:
```
- `--lang <code>` : Language for generated content — ISO 639-1 (e.g. vi, en, ja, fr, zh).
                    If omitted: prompted with MRU suggestions from config.
                    Saved to ~/.viepilot/config.json → proposal.recentLangs after generation.
- `--lang-content-only` : Translate content (bullets, notes, paragraphs) only.
                           Keep structural labels / section names in English.
```

**File-Level Plan — workflows/proposal.md:**

In `<step name="initialize">` — add after reading deps:
```
Read ~/.viepilot/config.json → proposal.recentLangs (via getProposalLang())
If --lang flag provided: validate ISO code; set lang = flag value
```

After Step 3 (type selection), insert **Step 3b: Language Selection** (only when --lang not provided):
```
## Step 3b: Language Selection

If --lang not provided:
  - recent = getProposalLang() from config
  - Present:
      Language for this proposal?
        1. {recent[0]} (most recently used)     ← only if recentLangs non-empty
        2. English (en)
        3. Vietnamese (vi)
        4. Other — enter ISO 639-1 code (e.g. ja, fr, zh, ko)
  - Save selected lang

If --lang provided: skip prompt; use flag value directly
```

In `<step name="manifest_generation">` — prepend to manifest instructions:
```
langInstruction = buildLangInstruction(lang, langContentOnly)
Prepend langInstruction to the AI content generation prompt before the slide structure spec.
```

After Step 10 (confirm output) — add:
```
recordProposalLang(lang)  → update ~/.viepilot/config.json MRU list
```

---

### Task 68.4 — Tests + CHANGELOG 2.6.0
**Objective:** Jest tests for new helpers; update contract tests; bump version; CHANGELOG entry.

## Paths
- `tests/unit/vp-enh039-proposal-lang.test.js`
- `tests/unit/vp-proposal-contracts.test.js`
- `CHANGELOG.md`
- `package.json`

**File-Level Plan — `tests/unit/vp-enh039-proposal-lang.test.js`:**
```
describe('viepilot-config — proposal lang helpers')
  test: getProposalLang returns 'en' when config absent
  test: recordProposalLang adds to recentLangs
  test: recordProposalLang deduplicates (vi,en → vi again → [vi,en] not [vi,vi,en])
  test: recordProposalLang caps at 5 entries
  test: getProposalLang returns most recently used after record
  test: recordProposalLang syncs defaultLang to recentLangs[0]

describe('proposal-generator — buildLangInstruction')
  test: returns empty string for 'en'
  test: returns empty string for undefined/null
  test: returns Vietnamese instruction for 'vi'
  test: instruction for 'vi' contains 'Vietnamese'
  test: contentOnly=true → instruction mentions 'content' and keeps 'English' for labels
  test: contentOnly=false (default) → instruction says 'ALL content'
  test: unknown lang code → uses lang.toUpperCase() as name (graceful)

describe('skills/vp-proposal/SKILL.md — lang flags')
  test: SKILL.md documents --lang flag
  test: SKILL.md documents --lang-content-only flag
  test: workflow.md contains 'Language Selection' step
  test: workflow.md contains 'recentLangs' or 'getProposalLang' reference
```

**File-Level Plan — `tests/unit/vp-proposal-contracts.test.js`:**
- Add 2 tests to Group 1:
  - `SKILL.md documents --lang flag`
  - `SKILL.md documents --lang-content-only flag`

**File-Level Plan — version:**
- `package.json`: `2.5.0` → `2.6.0`
- `CHANGELOG.md`: add `[2.6.0]` entry under `[Unreleased]`

**Verification:**
```bash
npx jest tests/unit/vp-enh039-proposal-lang.test.js --no-coverage
# all pass

npx jest --no-coverage
# all suites pass; count ≥ 662 + new tests
```

---

## Phase Verification
```bash
node -e "
const g = require('./lib/proposal-generator.cjs');
console.log(typeof g.buildLangInstruction === 'function');  // true

const c = require('./lib/viepilot-config.cjs');
console.log(typeof c.getProposalLang === 'function');       // true
console.log(typeof c.recordProposalLang === 'function');    // true
"

npx jest --no-coverage
# all pass
node -e "console.log(require('./package.json').version)"
# 2.6.0
```
