'use strict';

const fs = require('fs');
const path = require('path');

const SKILL = path.join(__dirname, '../../skills/vp-design/SKILL.md');
const WORKFLOW = path.join(__dirname, '../../workflows/design.md');
const PKG = path.join(__dirname, '../../package.json');
const CHANGELOG = path.join(__dirname, '../../CHANGELOG.md');

const skill = fs.readFileSync(SKILL, 'utf8');
const workflow = fs.readFileSync(WORKFLOW, 'utf8');
const pkg = JSON.parse(fs.readFileSync(PKG, 'utf8'));
const changelog = fs.readFileSync(CHANGELOG, 'utf8');

describe('Phase 114 — ENH-076.4: vp-design skill', () => {

  describe('114.1 — skills/vp-design/SKILL.md', () => {
    test('file exists and has content', () => {
      expect(skill.length).toBeGreaterThan(100);
    });

    test('--init command documented', () => {
      expect(skill).toMatch(/--init/);
    });

    test('--sync command documented', () => {
      expect(skill).toMatch(/--sync/);
    });

    test('--audit command documented', () => {
      expect(skill).toMatch(/--audit/);
    });

    test('--import command documented', () => {
      expect(skill).toMatch(/--import/);
    });

    test('execution_context references workflows/design.md', () => {
      expect(skill).toMatch(/workflows\/design\.md/);
    });

    test('awesome-design-md catalog referenced', () => {
      expect(skill).toMatch(/awesome-design-md/);
    });

    test('AUQ preload documented (ENH-059)', () => {
      expect(skill).toMatch(/AskUserQuestion|AUQ/);
      expect(skill).toMatch(/ToolSearch/);
    });
  });

  describe('114.2 — workflows/design.md', () => {
    test('file exists and has content', () => {
      expect(workflow.length).toBeGreaterThan(500);
    });

    test('--init Q&A flow: brand identity questions', () => {
      expect(workflow).toMatch(/brand.*name|brand identity|Brand Identity/i);
    });

    test('--init Q&A flow: typography selection', () => {
      expect(workflow).toMatch(/Inter|Geist|Plus Jakarta Sans/);
      expect(workflow).toMatch(/font/i);
    });

    test('--init Q&A flow: spacing configuration', () => {
      expect(workflow).toMatch(/spacing.*base|base.*spacing/i);
      expect(workflow).toMatch(/4px|8px/);
    });

    test('--sync: Tailwind mode documented', () => {
      expect(workflow).toMatch(/tailwind\.config\.js/);
      expect(workflow).toMatch(/theme\.extend|theme: \{/);
    });

    test('--sync: CSS custom properties mode documented', () => {
      expect(workflow).toMatch(/--color-primary|CSS custom properties/i);
      expect(workflow).toMatch(/:root/);
    });

    test('--sync: SCSS mode documented', () => {
      expect(workflow).toMatch(/\$color-primary|\$font-sans/);
    });

    test('--audit: severity levels present (❌/⚠️/✅)', () => {
      expect(workflow).toMatch(/❌/);
      expect(workflow).toMatch(/⚠️/);
      expect(workflow).toMatch(/✅/);
    });

    test('--audit: report table format documented', () => {
      expect(workflow).toMatch(/File.*Colors.*Typography.*Spacing.*Status/i);
    });

    test('awesome-design-md import mode documented', () => {
      expect(workflow).toMatch(/awesome-design-md/);
      expect(workflow).toMatch(/Apply as-is|Customize before applying/i);
    });

    test('conflict resolution documented (Override/Keep/Skip)', () => {
      expect(workflow).toMatch(/Override|Keep.*current/i);
      expect(workflow).toMatch(/Skip/i);
    });
  });

  describe('114.3 — version + CHANGELOG', () => {
    test('package.json version is 2.45.0 or later', () => {
      const [major, minor] = pkg.version.split('.').map(Number);
      expect(major).toBe(2);
      expect(minor).toBeGreaterThanOrEqual(45);
    });

    test('CHANGELOG contains [2.45.0] entry', () => {
      expect(changelog).toMatch(/\[2\.45\.0\]/);
    });

    test('CHANGELOG 2.45.0 entry mentions ENH-076 or vp-design', () => {
      const entry = changelog.split('[2.45.0]')[1]?.split('\n## [')[0] ?? '';
      expect(entry).toMatch(/ENH-076|vp-design/i);
    });
  });
});
