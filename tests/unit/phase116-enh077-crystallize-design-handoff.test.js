'use strict';

const fs = require('fs');
const path = require('path');

const CRYSTALLIZE = path.join(__dirname, '../../workflows/crystallize.md');
const PKG = path.join(__dirname, '../../package.json');
const CHANGELOG = path.join(__dirname, '../../CHANGELOG.md');

const crystallize = fs.readFileSync(CRYSTALLIZE, 'utf8');
const pkg = JSON.parse(fs.readFileSync(PKG, 'utf8'));
const changelog = fs.readFileSync(CHANGELOG, 'utf8');

describe('Phase 116 — ENH-077: crystallize → vp-design seamless handoff', () => {

  describe('116.1 — crystallize.md Step 1D.14 post-export handoff', () => {
    test('ENH-077 referenced in crystallize.md', () => {
      expect(crystallize).toMatch(/ENH-077/);
    });

    test('post-export handoff block present after Step 1D.14', () => {
      expect(crystallize).toMatch(/Post-Export Handoff.*vp-design.*sync|Post-Export Handoff.*ENH-077/i);
    });

    test('"Run /vp-design --sync now" option documented', () => {
      const block = crystallize.split('ENH-077')[1] ?? '';
      expect(block).toMatch(/Run.*vp-design.*sync.*now|vp-design.*--sync.*now/i);
    });

    test('skip option documented', () => {
      const block = crystallize.split('Post-Export Handoff')[1]?.split('### Step 1D-a')[0] ?? '';
      expect(block).toMatch(/Skip.*run manually|skip.*later/i);
    });

    test('text fallback documented for non-terminal adapters', () => {
      const block = crystallize.split('Post-Export Handoff')[1]?.split('### Step 1D-a')[0] ?? '';
      expect(block).toMatch(/Cursor.*Codex.*Text fallback|Text fallback/i);
    });

    test('silent skip condition documented (no stylesheet target)', () => {
      const block = crystallize.split('Post-Export Handoff')[1]?.split('### Step 1D-a')[0] ?? '';
      expect(block).toMatch(/no stylesheet target|tailwind.*css.*scss/i);
    });

    test('handoff placed after export success (after skip pipeline)', () => {
      const exportIdx = crystallize.indexOf('design_md_status: exported');
      const handoffIdx = crystallize.indexOf('ENH-077');
      expect(handoffIdx).toBeGreaterThan(exportIdx);
    });
  });

  describe('116.2 — version + CHANGELOG', () => {
    test('package.json version is 2.45.2 or later', () => {
      const [major, minor, patch] = pkg.version.split('.').map(Number);
      expect(major).toBe(2);
      expect(minor).toBeGreaterThanOrEqual(45);
      if (minor === 45) expect(patch).toBeGreaterThanOrEqual(2);
    });

    test('CHANGELOG contains [2.45.2] entry', () => {
      expect(changelog).toMatch(/\[2\.45\.2\]/);
    });

    test('CHANGELOG 2.45.2 entry mentions ENH-077 or vp-design sync', () => {
      const entry = changelog.split('[2.45.2]')[1]?.split('\n## [')[0] ?? '';
      expect(entry).toMatch(/ENH-077|vp-design.*sync/i);
    });
  });
});
