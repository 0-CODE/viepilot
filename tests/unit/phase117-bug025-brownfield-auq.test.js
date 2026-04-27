'use strict';

const fs = require('fs');
const path = require('path');

const CRYSTALLIZE = path.join(__dirname, '../../workflows/crystallize.md');
const PKG = path.join(__dirname, '../../package.json');
const CHANGELOG = path.join(__dirname, '../../CHANGELOG.md');

const crystallize = fs.readFileSync(CRYSTALLIZE, 'utf8');
const pkg = JSON.parse(fs.readFileSync(PKG, 'utf8'));
const changelog = fs.readFileSync(CHANGELOG, 'utf8');

describe('Phase 117 — BUG-025: brownfield crystallize AUQ initial entry gate', () => {

  describe('117.1 — crystallize.md Step 0-B initial brownfield AUQ spec', () => {
    test('BUG-025 referenced in crystallize.md', () => {
      expect(crystallize).toMatch(/BUG-025/);
    });

    test('AUQ spec present for initial brownfield entry gate', () => {
      expect(crystallize).toMatch(/Brownfield Mode Detected/);
    });

    test('initial entry gate AUQ has 3 options: Proceed, Brainstorm, Cancel', () => {
      expect(crystallize).toMatch(/Proceed with Brownfield Mode/);
      expect(crystallize).toMatch(/Run brainstorm first.*vp-brainstorm/);
      expect(crystallize).toMatch(/Cancel.*[Ee]xit without changes/);
    });

    test('AUQ spec appears BEFORE the scanner execution block', () => {
      const gateIdx = crystallize.indexOf('Brownfield Mode Detected');
      const scannerIdx = crystallize.indexOf('When brownfield mode is active:');
      expect(gateIdx).toBeGreaterThan(-1);
      expect(scannerIdx).toBeGreaterThan(-1);
      expect(gateIdx).toBeLessThan(scannerIdx);
    });

    test('AUQ spec is marked Claude Code REQUIRED', () => {
      const step0B = crystallize.split('Step 0-B')[1];
      // First occurrence of "REQUIRED" in Step 0-B should precede "When brownfield mode is active:"
      const gateSection = step0B.split('When brownfield mode is active:')[0];
      expect(gateSection).toMatch(/Claude Code.*terminal.*REQUIRED/i);
    });

    test('text fallback preserved for non-terminal adapters', () => {
      expect(crystallize).toMatch(/Cursor.*Codex.*Antigravity.*other/i);
      expect(crystallize).toMatch(/Which would you like\? \(1 \/ 2 \/ 3\)/);
    });

    test('"Run brainstorm first" exit path prints tip and exits', () => {
      expect(crystallize).toMatch(/vp-brainstorm.*vision.*exit|exit.*vp-brainstorm/i);
    });

    test('"Cancel" selection exits without changes', () => {
      const cancelSection = crystallize.match(/Cancel.*exit without changes[\s\S]{0,200}On selection/);
      // AUQ option and on-selection handler both reference cancel+exit
      expect(crystallize).toMatch(/"Cancel".*\/.*"3".*→.*exit without changes/);
    });
  });

  describe('117.2 — version and changelog', () => {
    test('package.json version is at least 2.45.4', () => {
      const [, minor, patch] = pkg.version.split('.').map(Number);
      expect(minor).toBeGreaterThanOrEqual(45);
      if (minor === 45) expect(patch).toBeGreaterThanOrEqual(4);
    });

    test('CHANGELOG has [2.45.4] entry', () => {
      expect(changelog).toMatch(/\[2\.45\.4\]/);
    });

    test('CHANGELOG BUG-025 entry mentions brownfield AUQ', () => {
      expect(changelog).toMatch(/BUG-025/);
    });
  });
});
