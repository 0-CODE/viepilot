'use strict';

const fs = require('fs');
const path = require('path');

const BRAINSTORM = path.join(__dirname, '../../workflows/brainstorm.md');
const PKG = path.join(__dirname, '../../package.json');
const CHANGELOG = path.join(__dirname, '../../CHANGELOG.md');

const brainstorm = fs.readFileSync(BRAINSTORM, 'utf8');
const pkg = JSON.parse(fs.readFileSync(PKG, 'utf8'));
const changelog = fs.readFileSync(CHANGELOG, 'utf8');

describe('Phase 115 — ENH-076.5: Architect workspace design.html', () => {

  describe('115.1 — brainstorm.md: design.html page spec', () => {
    test('design.html present in Architect workspace page table', () => {
      expect(brainstorm).toMatch(/design\.html/);
    });

    test('trigger conditions documented (Architect Mode + design.md/design_tokens)', () => {
      const block = brainstorm.split('design.html trigger')[1]?.split('\n\n')[0] ?? '';
      expect(block).toMatch(/Architect Mode/i);
      expect(block).toMatch(/design\.md|design_tokens/);
    });

    test('color palette section documented', () => {
      expect(brainstorm).toMatch(/Color Palette/i);
      expect(brainstorm).toMatch(/swatch|hex.*label/i);
    });

    test('typography scale section documented', () => {
      const block = brainstorm.split('design.html content sections')[1]?.split('#### ')[0] ?? '';
      expect(block).toMatch(/Typography Scale/i);
    });

    test('sync rule documented (design_tokens → regenerate design.html)', () => {
      expect(brainstorm).toMatch(/design_tokens.*regenerate.*design\.html|Sync rule.*design\.html/i);
    });

    test('hub nav link spec documented', () => {
      expect(brainstorm).toMatch(/design\.html.*nav|Hub nav.*design\.html/i);
    });
  });

  describe('115.2 — version + CHANGELOG', () => {
    test('package.json version is 2.45.1 or later', () => {
      const [major, minor, patch] = pkg.version.split('.').map(Number);
      expect(major).toBe(2);
      expect(minor).toBeGreaterThanOrEqual(45);
      if (minor === 45) expect(patch).toBeGreaterThanOrEqual(1);
    });

    test('CHANGELOG contains [2.45.1] entry', () => {
      expect(changelog).toMatch(/\[2\.45\.1\]/);
    });

    test('CHANGELOG 2.45.1 entry mentions ENH-076 or design.html', () => {
      const entry = changelog.split('[2.45.1]')[1]?.split('\n## [')[0] ?? '';
      expect(entry).toMatch(/ENH-076|design\.html/i);
    });
  });
});
