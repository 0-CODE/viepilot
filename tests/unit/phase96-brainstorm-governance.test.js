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
const PROJECT_CONTEXT_TPL = fs.readFileSync(
  path.join(__dirname, '../../templates/project/PROJECT-CONTEXT.md'), 'utf8'
);

describe('Phase 96 — BUG-018 + ENH-063 + ENH-064 contracts', () => {

  // ── BUG-018: unified workspace mode-selection AUQ ───────────────────────

  describe('BUG-018 — workflows/brainstorm.md unified mode-selection', () => {
    test('1. contains "Workspace Mode Selection"', () => {
      expect(BRAINSTORM_MD).toContain('Workspace Mode Selection');
    });

    test('2. contains "BUG-018" reference', () => {
      expect(BRAINSTORM_MD).toContain('BUG-018');
    });

    test('3. contains AUQ spec for "Both Architect + UI Direction"', () => {
      expect(BRAINSTORM_MD).toContain('Both Architect + UI Direction');
    });

    test('4. contains Architect auto-activate suppression guard', () => {
      expect(BRAINSTORM_MD).toContain('Architect auto-activate');
    });
  });

  describe('BUG-018 — skills/vp-brainstorm/SKILL.md', () => {
    test('5. SKILL.md objective contains BUG-018 reference', () => {
      expect(BRAINSTORM_SKILL_MD).toContain('BUG-018');
    });
  });

  // ── ENH-063 brainstorm side: Topic 6 Admin & Governance ─────────────────

  describe('ENH-063 — workflows/brainstorm.md Admin & Governance topic', () => {
    test('6. contains Topic 6 "Admin & Governance"', () => {
      expect(BRAINSTORM_MD).toContain('Admin & Governance');
    });

    test('7. contains admin proactive heuristic keywords (billing, audit, monitoring)', () => {
      expect(BRAINSTORM_MD).toContain('billing');
      expect(BRAINSTORM_MD).toContain('audit');
      expect(BRAINSTORM_MD).toContain('monitoring');
    });

    test('8. contains admin coverage gate before /save', () => {
      expect(BRAINSTORM_MD).toContain('Admin coverage gate');
    });

    test('9. contains admin.html in Architect workspace layout', () => {
      expect(BRAINSTORM_MD).toContain('admin.html');
    });

    test('10. contains notes.md ## admin YAML schema', () => {
      expect(BRAINSTORM_MD).toContain('## admin');
    });
  });

  describe('ENH-063 — skills/vp-brainstorm/SKILL.md', () => {
    test('11. SKILL.md objective contains ENH-063 reference', () => {
      expect(BRAINSTORM_SKILL_MD).toContain('ENH-063');
    });
  });

  // ── ENH-063 crystallize side ─────────────────────────────────────────────

  describe('ENH-063 — workflows/crystallize.md admin export', () => {
    test('12. contains "Admin & Governance" export step in Step 1D', () => {
      expect(CRYSTALLIZE_MD).toContain('Admin & Governance');
    });

    test('13. contains admin_imported working notes field', () => {
      expect(CRYSTALLIZE_MD).toContain('admin_imported');
    });

    test('14. contains admin_capabilities_count working notes field', () => {
      expect(CRYSTALLIZE_MD).toContain('admin_capabilities_count');
    });
  });

  describe('ENH-063 — templates/project/PROJECT-CONTEXT.md', () => {
    test('15. template contains ## Admin & Governance section', () => {
      expect(PROJECT_CONTEXT_TPL).toContain('## Admin & Governance');
    });

    test('16. template Admin & Governance section has Capability table', () => {
      expect(PROJECT_CONTEXT_TPL).toContain('| Capability | Required | Phase | Notes |');
    });

    test('17. template contains Admin Personas table', () => {
      expect(PROJECT_CONTEXT_TPL).toContain('Admin Personas');
    });
  });

  // ── ENH-064: mandatory read gates ───────────────────────────────────────

  describe('ENH-064 — workflows/crystallize.md mandatory read gates', () => {
    test('18. contains ≥2 MANDATORY READ GATE occurrences', () => {
      const matches = (CRYSTALLIZE_MD.match(/MANDATORY READ GATE/g) || []).length;
      expect(matches).toBeGreaterThanOrEqual(2);
    });

    test('19. contains architect_read_complete flag', () => {
      expect(CRYSTALLIZE_MD).toContain('architect_read_complete');
    });

    test('20. contains ui_direction_read_complete flag', () => {
      expect(CRYSTALLIZE_MD).toContain('ui_direction_read_complete');
    });

    test('21. contains Step 1F Cross-Reference Gate', () => {
      expect(CRYSTALLIZE_MD).toContain('Step 1F');
    });

    test('22. crystallize Step 1D gate failure rule requires STOP', () => {
      expect(CRYSTALLIZE_MD).toContain('notes.md is missing or unreadable');
    });

    test('23. crystallize Step 1A gate inventory mismatch requires STOP', () => {
      expect(CRYSTALLIZE_MD).toContain('Pages inventory are out of sync');
    });
  });

  describe('ENH-064 — skills/vp-crystallize/SKILL.md mandatory gates docs', () => {
    test('24. SKILL.md contains Mandatory Workspace Read Gates section', () => {
      expect(CRYSTALLIZE_SKILL_MD).toContain('Mandatory Workspace Read Gates');
    });

    test('25. SKILL.md contains ENH-064 reference', () => {
      expect(CRYSTALLIZE_SKILL_MD).toContain('ENH-064');
    });
  });

  describe('ENH-064 — workflows/brainstorm.md cross-workspace HUB links', () => {
    test('26. brainstorm.md contains Cross-workspace HUB links spec', () => {
      expect(BRAINSTORM_MD).toContain('Cross-workspace HUB');
    });

    test('27. brainstorm.md contains /sync-links trigger command', () => {
      expect(BRAINSTORM_MD).toContain('/sync-links');
    });
  });

});
