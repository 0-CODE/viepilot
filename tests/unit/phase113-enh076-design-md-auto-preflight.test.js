'use strict';

const fs = require('fs');
const path = require('path');

const AUTONOMOUS = path.join(__dirname, '../../workflows/autonomous.md');
const PKG = path.join(__dirname, '../../package.json');
const CHANGELOG = path.join(__dirname, '../../CHANGELOG.md');

const autonomous = fs.readFileSync(AUTONOMOUS, 'utf8');
const pkg = JSON.parse(fs.readFileSync(PKG, 'utf8'));
const changelog = fs.readFileSync(CHANGELOG, 'utf8');

const preflight55Block = (() => {
  const start = autonomous.indexOf('Preflight 5.5');
  const end = autonomous.indexOf('#### Scaffold-First Gate', start);
  return start > -1 ? autonomous.slice(start, end) : '';
})();

describe('Phase 113 — ENH-076.3: vp-auto Design.MD preflight injection', () => {

  describe('113.1 — autonomous.md: Preflight 5.5', () => {
    test('has Preflight 5.5 Design.MD Token Injection heading', () => {
      expect(autonomous).toMatch(/Preflight 5\.5.*Design\.MD Token Injection/i);
    });

    test('references ENH-076', () => {
      expect(preflight55Block).toMatch(/ENH-076/);
    });

    test('TOKEN_MAP build process documented', () => {
      expect(preflight55Block).toMatch(/TOKEN_MAP/);
      expect(preflight55Block).toMatch(/colors|typography|spacing/);
    });

    test('UI_KEYWORDS list present', () => {
      expect(preflight55Block).toMatch(/UI_KEYWORDS/);
      expect(preflight55Block).toMatch(/html.*css|css.*html/i);
    });

    test('Level 1 silent injection documented', () => {
      expect(preflight55Block).toMatch(/Level 1.*[Ss]ilent|[Ss]ilent.*context injection/i);
    });

    test('Level 2 checklist items documented', () => {
      expect(preflight55Block).toMatch(/Level 2.*[Cc]hecklist/i);
    });

    test('Level 3 post-task audit documented', () => {
      expect(preflight55Block).toMatch(/Level 3.*[Pp]ost.task/i);
    });

    test('backend-only skip edge case documented', () => {
      expect(preflight55Block).toMatch(/[Bb]ackend.only.*skip|skip.*[Bb]ackend.only/i);
    });

    test('monorepo nearest-file rule documented', () => {
      expect(preflight55Block).toMatch(/[Mm]onorepo|nearest.*design\.md/i);
    });
  });

  describe('113.2 — version + CHANGELOG', () => {
    test('package.json version is 2.44.1', () => {
      expect(pkg.version).toBe('2.44.1');
    });

    test('CHANGELOG contains [2.44.1] entry', () => {
      expect(changelog).toMatch(/\[2\.44\.1\]/);
    });

    test('CHANGELOG 2.44.1 entry mentions ENH-076 or Design.MD preflight', () => {
      const entry = changelog.split('[2.44.1]')[1]?.split('\n## [')[0] ?? '';
      expect(entry).toMatch(/ENH-076|Design\.MD|preflight|TOKEN_MAP/i);
    });
  });
});
