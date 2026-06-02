'use strict';
const fs = require('fs');
const path = require('path');

describe('Phase 152 — ENH-102: vp-design Aesthetic Commitment Framework', () => {

  describe('workflows/design.md', () => {
    let content;
    beforeAll(() => { content = fs.readFileSync('workflows/design.md', 'utf8'); });

    it('contains ## Aesthetic Commitment Framework section', () => {
      expect(content).toMatch(/## Aesthetic Commitment Framework/);
    });

    it('attributes source to anthropics/claude-code', () => {
      expect(content).toMatch(/anthropics\/claude-code/);
    });

    it('lists all 4 dimensions (Typography, Color, Motion, Composition)', () => {
      expect(content).toMatch(/### Dimension 1.*Typography/s);
      expect(content).toMatch(/### Dimension 2.*Color/s);
      expect(content).toMatch(/### Dimension 3.*Motion/s);
      expect(content).toMatch(/### Dimension 4.*Composition/s);
    });

    it('explicitly bans Inter in Typography dimension', () => {
      const aestheticSection = content.slice(
        content.indexOf('## Aesthetic Commitment Framework'),
        content.indexOf('## Command Router')
      );
      expect(aestheticSection).toMatch(/AVOID.*Inter/);
    });

    it('contains Step 0 aesthetic direction AUQ in --init flow', () => {
      expect(content).toMatch(/Step 0.*Aesthetic Direction/i);
    });

    it('font list excludes Inter as recommended option in --init flow', () => {
      // Inter should not appear as a named AUQ option in font selection
      const initSection = content.slice(
        content.indexOf('### Mode A: Q&A from Scratch'),
        content.indexOf('### Mode B')
      );
      // Inter must not appear as an AUQ label (it may appear in AVOID list above)
      const auqFontSection = initSection.slice(initSection.indexOf('Font family'));
      expect(auqFontSection).not.toMatch(/"Inter/);
    });

    it('design.md YAML template includes aesthetic_direction field', () => {
      expect(content).toMatch(/aesthetic_direction:/);
    });
  });

  describe('skills/vp-design/SKILL.md', () => {
    let skill;
    beforeAll(() => { skill = fs.readFileSync('skills/vp-design/SKILL.md', 'utf8'); });

    it('banner shows v2.0.0', () => {
      expect(skill).toMatch(/VP-DESIGN\s+v2\.0\.0/);
    });

    it('objective mentions Aesthetic Commitment Framework', () => {
      expect(skill).toMatch(/Aesthetic Commitment Framework/);
    });

    it('process --init shows Step 0 aesthetic direction', () => {
      expect(skill).toMatch(/Step 0.*Aesthetic/i);
    });
  });

  describe('version', () => {
    it('package.json version is 3.13.0', () => {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      expect(pkg.version).toBe('3.13.0');
    });

    it('CHANGELOG.md contains [3.13.0] entry', () => {
      const changelog = fs.readFileSync('CHANGELOG.md', 'utf8');
      expect(changelog).toMatch(/\[3\.13\.0\]/);
    });
  });
});
