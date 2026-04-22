const fs = require('fs');
const path = require('path');

const audit = fs.readFileSync(path.join(__dirname, '../../workflows/audit.md'), 'utf8');
const skill = fs.readFileSync(path.join(__dirname, '../../skills/vp-audit/SKILL.md'), 'utf8');

describe('Phase 104 — ENH-070: vp-audit Auto-Log Gaps → Direct vp-evolve Routing', () => {

  // ── Group A: Auto-Log Gate (audit.md) ───────────────────────────────────

  describe('Auto-Log Gate presence and structure', () => {
    test('audit.md contains "Auto-Log Gate" section', () => {
      expect(audit).toMatch(/Auto-Log Gate/);
    });

    test('audit.md contains "auto-logged by vp-audit" source label', () => {
      const count = (audit.match(/auto-logged by vp-audit/g) || []).length;
      expect(count).toBeGreaterThanOrEqual(2);
    });

    test('audit.md contains Duplicate Detection logic', () => {
      expect(audit).toMatch(/Duplicate [Dd]etection/);
    });

    test('audit.md tracks auto_logged_new counter', () => {
      expect(audit).toMatch(/auto_logged_new/);
    });

    test('audit.md tracks auto_logged_deduped counter', () => {
      expect(audit).toMatch(/auto_logged_deduped/);
    });

    test('audit.md has Tier → Request Type mapping table', () => {
      expect(audit).toMatch(/Tier.*Request [Tt]ype|Tier → Request Type/);
    });

    test('audit.md documents TRACKER.md update in gate block', () => {
      expect(audit).toMatch(/auto-logged by vp-audit Tier.*Backlog|TRACKER\.md.*Decision Log/i);
    });
  });

  // ── Group B: --no-autolog flag (audit.md) ───────────────────────────────

  describe('--no-autolog flag', () => {
    test('audit.md contains --no-autolog flag', () => {
      const count = (audit.match(/no-autolog/g) || []).length;
      expect(count).toBeGreaterThanOrEqual(2);
    });

    test('audit.md documents skip condition for --no-autolog', () => {
      expect(audit).toMatch(/no-autolog.*skip|skip.*no-autolog/i);
    });
  });

  // ── Group C: Post-Audit Routing Banner (audit.md) ───────────────────────

  describe('Post-Audit Routing Banner', () => {
    test('audit.md contains "Post-Audit Routing Banner"', () => {
      expect(audit).toMatch(/Post-Audit Routing Banner/);
    });

    test('audit.md recommends /vp-evolve as next action', () => {
      const count = (audit.match(/vp-evolve/g) || []).length;
      expect(count).toBeGreaterThanOrEqual(2);
    });

    test('audit.md has "Plan fix phase → /vp-evolve" as Recommended option', () => {
      expect(audit).toMatch(/Plan fix phase.*vp-evolve/i);
    });

    test('audit.md has "Skip — review later" option', () => {
      expect(audit).toMatch(/Skip.*review later/i);
    });

    test('audit.md has AUQ call instruction for Claude Code terminal', () => {
      expect(audit).toMatch(/AskUserQuestion|AUQ/);
    });
  });

  // ── Group D: SKILL.md documentation ─────────────────────────────────────

  describe('SKILL.md documentation', () => {
    test('SKILL.md has --no-autolog flag entry', () => {
      const count = (skill.match(/no-autolog/g) || []).length;
      expect(count).toBeGreaterThanOrEqual(1);
    });

    test('SKILL.md has "Auto-Log Behavior" section', () => {
      expect(skill).toMatch(/Auto-Log Behavior/);
    });

    test('SKILL.md documents duplicate detection', () => {
      expect(skill).toMatch(/[Dd]uplicate/);
    });

    test('SKILL.md mentions vp-evolve as post-audit next action', () => {
      expect(skill).toMatch(/vp-evolve/);
    });
  });

});
