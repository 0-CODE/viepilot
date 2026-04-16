'use strict';
/**
 * Contract tests — ENH-049: vp-audit Tier 4 silent mode
 * Verifies that workflows/audit.md suppresses Tier 4 output when clean/skipped.
 */

const fs = require('fs');
const path = require('path');

const auditPath = path.join(__dirname, '../../workflows/audit.md');
const skillPath = path.join(__dirname, '../../skills/vp-audit/SKILL.md');
const content = fs.readFileSync(auditPath, 'utf8');
const skillContent = fs.readFileSync(skillPath, 'utf8');

describe('ENH-049: vp-audit Tier 4 silent mode', () => {
  describe('Step 4 skip guard — no echo output', () => {
    it('does not echo "Tier 4 skipped" message', () => {
      expect(content).not.toContain('echo "→ Tier 4 skipped');
    });

    it('still has the IS_VIEPILOT_FRAMEWORK guard block', () => {
      expect(content).toContain('IS_VIEPILOT_FRAMEWORK');
    });

    it('skip block uses a silent comment instead of echo', () => {
      expect(content).toContain('Tier 4 skipped silently');
    });
  });

  describe('Step 4f — conditional output guard', () => {
    it('wraps Tier 4 report in TIER4_ISSUES conditional', () => {
      expect(content).toMatch(/TIER4_ISSUES.*-gt.*0|TIER4_ISSUES.*>.*0/);
    });

    it('4f section still exists (not deleted)', () => {
      expect(content).toContain('4f');
    });

    it('ENH-049 silent note is present in 4f', () => {
      expect(content).toContain('Silent by default (ENH-049)');
    });
  });

  describe('Step 5 All Clear banner — no Tier 4 line', () => {
    it('All Clear banner does not contain a Tier 4 line', () => {
      const allClearStart = content.indexOf('### All Clear');
      const issuesStart = content.indexOf('### Issues Found');
      const allClearSection = content.slice(allClearStart, issuesStart);
      expect(allClearSection).not.toContain('Tier 4');
    });

    it('All Clear banner does not contain "Skipped" for Tier 4', () => {
      const allClearStart = content.indexOf('### All Clear');
      const issuesStart = content.indexOf('### Issues Found');
      const allClearSection = content.slice(allClearStart, issuesStart);
      expect(allClearSection).not.toMatch(/Tier 4.*Skipped/);
    });

    it('All Clear banner does not contain "In sync" for Tier 4', () => {
      const allClearStart = content.indexOf('### All Clear');
      const issuesStart = content.indexOf('### Issues Found');
      const allClearSection = content.slice(allClearStart, issuesStart);
      expect(allClearSection).not.toMatch(/Tier 4.*sync/);
    });
  });

  describe('Step 5 Issues Found banner — conditional Tier 4 line', () => {
    it('Issues Found banner retains a Tier 4 reference (for when issues exist)', () => {
      const issuesStart = content.indexOf('### Issues Found');
      const issuesSection = content.slice(issuesStart, issuesStart + 1000);
      expect(issuesSection).toContain('Tier 4');
    });

    it('Tier 4 in Issues Found banner is wrapped in a conditional', () => {
      const issuesStart = content.indexOf('### Issues Found');
      const issuesSection = content.slice(issuesStart, issuesStart + 1000);
      expect(issuesSection).toMatch(/if TIER4_ISSUES|TIER4_ISSUES.*>/);
    });
  });

  describe('skills/vp-audit/SKILL.md — documents silent behavior', () => {
    it('SKILL.md mentions ENH-049 silent by default', () => {
      expect(skillContent).toContain('ENH-049');
    });

    it('SKILL.md notes Tier 4 is suppressed when passing', () => {
      expect(skillContent).toContain('suppressed');
    });
  });
});
