'use strict';

const fs   = require('fs');
const path = require('path');

const BRAINSTORM_MD = fs.readFileSync(
  path.join(__dirname, '../../workflows/brainstorm.md'), 'utf8'
);
const CRYSTALLIZE_MD = fs.readFileSync(
  path.join(__dirname, '../../workflows/crystallize.md'), 'utf8'
);
const BRAINSTORM_SKILL_MD = fs.readFileSync(
  path.join(__dirname, '../../skills/vp-brainstorm/SKILL.md'), 'utf8'
);
const CRYSTALLIZE_SKILL_MD = fs.readFileSync(
  path.join(__dirname, '../../skills/vp-crystallize/SKILL.md'), 'utf8'
);

describe('Phase 99 — ENH-067 Workflow Upgrade Awareness contracts', () => {

  // ── Part C: Version stamps ────────────────────────────────────────────────

  describe('ENH-067 Part C — version stamps', () => {
    test('1. brainstorm.md session template has workflow_version field', () => {
      expect(BRAINSTORM_MD).toContain('workflow_version');
    });

    test('2. brainstorm.md session template has upgrade_supplement_version field', () => {
      expect(BRAINSTORM_MD).toContain('upgrade_supplement_version');
    });

    test('3. crystallize.md Step 5 writes crystallize_version comment to PROJECT-CONTEXT.md', () => {
      expect(CRYSTALLIZE_MD).toContain('crystallize_version');
    });

    test('4. crystallize.md HANDOFF.json includes crystallize_version field', () => {
      // HANDOFF.json creation should include the version field
      const idx = CRYSTALLIZE_MD.indexOf('"crystallize_version"');
      expect(idx).toBeGreaterThan(-1);
    });

    test('5. vp-brainstorm SKILL.md documents version stamps (ENH-067)', () => {
      expect(BRAINSTORM_SKILL_MD).toContain('Workflow version stamps (ENH-067)');
    });

    test('6. vp-crystallize SKILL.md documents version stamps (ENH-067)', () => {
      expect(CRYSTALLIZE_SKILL_MD).toContain('Crystallize version stamps (ENH-067)');
    });
  });

  // ── Part A: Brainstorm gap detection ─────────────────────────────────────

  describe('ENH-067 Part A — brainstorm upgrade gap detection', () => {
    test('7. brainstorm.md contains Step 3B Upgrade Gap Detection section', () => {
      expect(BRAINSTORM_MD).toContain('Step 3B: Upgrade Gap Detection');
    });

    test('8. brainstorm.md contains upgrade banner "Upgrade gap detected" text', () => {
      expect(BRAINSTORM_MD).toContain('Upgrade gap detected');
    });

    test('9. brainstorm.md contains "Upgrade supplement" section format', () => {
      expect(BRAINSTORM_MD).toContain('Upgrade supplement (v{old} → v{new})');
    });

    test('10. brainstorm.md version threshold table covers ENH-063 (v2.32.0)', () => {
      expect(BRAINSTORM_MD).toContain('v2.32.0');
    });

    test('11. brainstorm.md version threshold table covers ENH-065 (v2.33.0)', () => {
      expect(BRAINSTORM_MD).toContain('v2.33.0');
    });

    test('12. brainstorm.md version threshold table covers ENH-066 (v2.34.0)', () => {
      expect(BRAINSTORM_MD).toContain('v2.34.0');
    });

    test('13. vp-brainstorm SKILL.md documents gap detection (ENH-067)', () => {
      expect(BRAINSTORM_SKILL_MD).toContain('Upgrade gap detection (ENH-067)');
    });
  });

  // ── Part B: Crystallize --upgrade re-scan ────────────────────────────────

  describe('ENH-067 Part B — crystallize --upgrade re-scan', () => {
    test('14. crystallize.md contains Step 0-B Upgrade Re-scan Mode section', () => {
      expect(CRYSTALLIZE_MD).toContain('Step 0-B: Upgrade Re-scan Mode');
    });

    test('15. crystallize.md contains --upgrade flag reference', () => {
      expect(CRYSTALLIZE_MD).toContain('--upgrade');
    });

    test('16. crystallize.md contains Patch mode documentation', () => {
      expect(CRYSTALLIZE_MD).toContain('Patch mode');
    });

    test('17. crystallize.md contains Full re-generate mode documentation', () => {
      expect(CRYSTALLIZE_MD).toContain('Full re-generate mode');
    });

    test('18. crystallize.md contains backup path documentation', () => {
      expect(CRYSTALLIZE_MD).toContain('backup-pre-regen-');
    });

    test('19. crystallize.md contains ENH-067 reference', () => {
      expect(CRYSTALLIZE_MD).toContain('ENH-067');
    });

    test('20. vp-crystallize SKILL.md documents upgrade re-scan mode (ENH-067)', () => {
      expect(CRYSTALLIZE_SKILL_MD).toContain('Upgrade re-scan mode');
      expect(CRYSTALLIZE_SKILL_MD).toContain('ENH-067');
    });

    test('21. crystallize.md contains brainstorm supplement integration note', () => {
      expect(CRYSTALLIZE_MD).toContain('Upgrade supplement');
    });
  });

});
