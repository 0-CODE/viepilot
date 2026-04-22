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

describe('Phase 100 — ENH-068 Admin Entity Management contracts', () => {

  // ── ENH-068 brainstorm side: Topic 7 Admin Entity Management ─────────────

  describe('ENH-068 — workflows/brainstorm.md Admin Entity Management topic', () => {
    test('1. contains Topic 7 "Admin Entity Management"', () => {
      expect(BRAINSTORM_MD).toContain('Admin Entity Management');
    });

    test('2. Topic 7 has ≥8 sub-questions', () => {
      const topic7Match = BRAINSTORM_MD.match(/7\. \*\*Admin Entity Management\*\*([\s\S]*?)(?=8\. \*\*Content|###)/);
      expect(topic7Match).not.toBeNull();
      const bullets = (topic7Match[1].match(/^\s+-/gm) || []).length;
      expect(bullets).toBeGreaterThanOrEqual(8);
    });

    test('3. contains entity management heuristic keyword "CRUD"', () => {
      expect(BRAINSTORM_MD).toContain('CRUD');
    });

    test('4. contains entity management coverage gate ("Entity management gap")', () => {
      expect(BRAINSTORM_MD).toContain('Entity management gap');
    });

    test('5. contains entity-mgmt.html in Architect workspace layout', () => {
      expect(BRAINSTORM_MD).toContain('entity-mgmt.html');
    });

    test('6. contains notes.md ## entity_mgmt YAML schema section', () => {
      const idx = BRAINSTORM_MD.indexOf('## entity_mgmt\nentities:');
      expect(idx).toBeGreaterThan(-1);
    });

    test('7. contains ENH-068 reference in brainstorm.md', () => {
      expect(BRAINSTORM_MD).toContain('ENH-068');
    });

    test('8. Phase assignment renumbered to Topic 10', () => {
      expect(BRAINSTORM_MD).toContain('10. **Phase assignment (ENH-030):**');
    });

    test('9. Content Management renumbered to Topic 8', () => {
      expect(BRAINSTORM_MD).toContain('8. **Content Management**');
    });

    test('10. User Data Management renumbered to Topic 9', () => {
      expect(BRAINSTORM_MD).toContain('9. **User Data Management**');
    });
  });

  describe('ENH-068 — skills/vp-brainstorm/SKILL.md', () => {
    test('11. SKILL.md objective contains ENH-068 reference', () => {
      expect(BRAINSTORM_SKILL_MD).toContain('ENH-068');
    });

    test('12. SKILL.md objective contains Admin Entity Management coverage bullet', () => {
      expect(BRAINSTORM_SKILL_MD).toContain('Admin Entity Management coverage (ENH-068)');
    });
  });

  // ── ENH-068 crystallize side ──────────────────────────────────────────────

  describe('ENH-068 — workflows/crystallize.md entity_mgmt export', () => {
    test('13. contains "Admin Entity Management" export step in Step 1D', () => {
      expect(CRYSTALLIZE_MD).toContain('Admin Entity Management');
    });

    test('14. contains entity_mgmt_imported working notes field', () => {
      expect(CRYSTALLIZE_MD).toContain('entity_mgmt_imported');
    });

    test('15. contains entity_mgmt_entity_count working notes field', () => {
      expect(CRYSTALLIZE_MD).toContain('entity_mgmt_entity_count');
    });

    test('16. contains entity-mgmt.html in MANDATORY READ GATE list', () => {
      expect(CRYSTALLIZE_MD).toContain('15. `entity-mgmt.html`');
    });

    test('17. contains ENH-068 reference in crystallize.md', () => {
      expect(CRYSTALLIZE_MD).toContain('ENH-068');
    });
  });

  describe('ENH-068 — templates/project/PROJECT-CONTEXT.md', () => {
    test('18. template contains ## Admin Entity Management section', () => {
      expect(PROJECT_CONTEXT_TPL).toContain('## Admin Entity Management');
    });

    test('19. template Admin Entity Management section has Audit Trail column', () => {
      expect(PROJECT_CONTEXT_TPL).toContain('| Entity | CRUD Ops | Soft Delete | Bulk Actions | Audit Trail | Scope |');
    });

    test('20. template contains Import / Export sub-section', () => {
      expect(PROJECT_CONTEXT_TPL).toContain('### Import / Export');
    });
  });

  describe('ENH-068 — skills/vp-crystallize/SKILL.md', () => {
    test('21. SKILL.md contains Admin Entity Management Export section', () => {
      expect(CRYSTALLIZE_SKILL_MD).toContain('Admin Entity Management Export (ENH-068)');
    });
  });

});
