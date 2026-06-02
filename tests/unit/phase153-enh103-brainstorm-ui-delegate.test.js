'use strict';
const fs = require('fs');

describe('Phase 153 — ENH-103: brainstorm --ui delegate → vp-design', () => {

  describe('workflows/brainstorm.md — ENH-076 removal', () => {
    let content;
    beforeAll(() => { content = fs.readFileSync('workflows/brainstorm.md', 'utf8'); });

    it('does NOT contain ENH-076 Design Token Extraction block', () => {
      expect(content).not.toMatch(/### Design Token Extraction \(ENH-076\)/);
    });

    it('contains Design System Delegate Hook section', () => {
      expect(content).toMatch(/### Design System Delegate Hook \(ENH-103\)/);
    });

    it('delegate hook describes design.md absent path (AUQ offer vp-design --init)', () => {
      const hookSection = content.slice(
        content.indexOf('### Design System Delegate Hook'),
        content.indexOf('### Aesthetic Context Injection')
      );
      expect(hookSection).toMatch(/vp-design --init/);
      expect(hookSection).toMatch(/design_skipped/);
    });

    it('notes.md schema uses ## design_system (not ## design_tokens)', () => {
      expect(content).toMatch(/## design_system/);
      expect(content).not.toMatch(/## design_tokens/);
    });
  });

  describe('workflows/brainstorm.md — Aesthetic Context Injection', () => {
    let content;
    beforeAll(() => { content = fs.readFileSync('workflows/brainstorm.md', 'utf8'); });

    it('contains Aesthetic Context Injection section', () => {
      expect(content).toMatch(/### Aesthetic Context Injection \(ENH-103\)/);
    });

    it('describes 3 sources in order (design.md / embedded framework / external skill)', () => {
      const injectionSection = content.slice(
        content.indexOf('### Aesthetic Context Injection'),
        content.indexOf('### Skill Registry Integration')
      );
      expect(injectionSection).toMatch(/Source A.*design\.md/s);
      expect(injectionSection).toMatch(/Source B.*Aesthetic Commitment Framework/s);
      expect(injectionSection).toMatch(/Source C.*frontend-design/s);
    });

    it('fallback (no design.md) documented', () => {
      const injectionSection = content.slice(
        content.indexOf('### Aesthetic Context Injection'),
        content.indexOf('### Skill Registry Integration')
      );
      expect(injectionSection).toMatch(/Fallback/i);
    });
  });

  describe('workflows/brainstorm.md — FEAT-020 upgrade', () => {
    let content;
    beforeAll(() => { content = fs.readFileSync('workflows/brainstorm.md', 'utf8'); });

    it('FEAT-020 section describes 3-layer model', () => {
      const feat020Section = content.slice(
        content.indexOf('### Skill Registry Integration (FEAT-020)'),
        content.indexOf('### Mobile Design Direction')
      );
      expect(feat020Section).toMatch(/\| 1 — baseline/i);
      expect(feat020Section).toMatch(/\| 3 — opt-in/i);
    });

    it('external frontend-design skill documented as opt-in (not required)', () => {
      const feat020Section = content.slice(
        content.indexOf('### Skill Registry Integration (FEAT-020)'),
        content.indexOf('### Mobile Design Direction')
      );
      expect(feat020Section).toMatch(/opt-in/i);
    });
  });

  describe('workflows/autonomous.md — Preflight 5.5', () => {
    let content;
    beforeAll(() => { content = fs.readFileSync('workflows/autonomous.md', 'utf8'); });

    it('TOKEN_MAP includes aesthetic_direction field', () => {
      const preflight55 = content.slice(
        content.indexOf('Preflight 5.5'),
        content.indexOf('Scaffold-First Gate')
      );
      expect(preflight55).toMatch(/TOKEN_MAP\.aesthetic_direction/);
    });
  });

  describe('version', () => {
    it('package.json version is 3.14.0', () => {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      expect(pkg.version).toBe('3.14.0');
    });

    it('CHANGELOG.md contains [3.14.0] entry', () => {
      const changelog = fs.readFileSync('CHANGELOG.md', 'utf8');
      expect(changelog).toMatch(/\[3\.14\.0\]/);
    });
  });
});
