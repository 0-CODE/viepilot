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

describe('Phase 98 — ENH-066 User Data Management contracts', () => {

  // ── ENH-066 brainstorm side: Topic 8 User Data Management ────────────────

  describe('ENH-066 — workflows/brainstorm.md User Data Management topic', () => {
    test('1. contains Topic 8 "User Data Management"', () => {
      expect(BRAINSTORM_MD).toContain('User Data Management');
    });

    test('2. Topic 8 has ≥10 sub-questions', () => {
      const topic8Match = BRAINSTORM_MD.match(/8\. \*\*User Data Management\*\*([\s\S]*?)(?=9\. \*\*Phase assignment|###)/);
      expect(topic8Match).not.toBeNull();
      const bullets = (topic8Match[1].match(/^\s+-/gm) || []).length;
      expect(bullets).toBeGreaterThanOrEqual(10);
    });

    test('3. contains user data heuristic keyword "profile"', () => {
      expect(BRAINSTORM_MD).toContain('profile');
    });

    test('4. contains user data heuristic keyword "GDPR"', () => {
      expect(BRAINSTORM_MD).toContain('GDPR');
    });

    test('5. contains user data coverage gate ("User data gap detected")', () => {
      expect(BRAINSTORM_MD).toContain('User data gap detected');
    });

    test('6. contains user-data.html in Architect workspace layout', () => {
      expect(BRAINSTORM_MD).toContain('user-data.html');
    });

    test('7. contains notes.md ## user_data YAML schema section', () => {
      const idx = BRAINSTORM_MD.indexOf('## user_data\nprofile_fields:');
      expect(idx).toBeGreaterThan(-1);
    });

    test('8. contains ENH-066 reference in brainstorm.md', () => {
      expect(BRAINSTORM_MD).toContain('ENH-066');
    });

    test('9. Phase assignment renumbered to Topic 9', () => {
      expect(BRAINSTORM_MD).toContain('9. **Phase assignment (ENH-030):**');
    });
  });

  describe('ENH-066 — skills/vp-brainstorm/SKILL.md', () => {
    test('10. SKILL.md objective contains ENH-066 reference', () => {
      expect(BRAINSTORM_SKILL_MD).toContain('ENH-066');
    });

    test('11. SKILL.md objective contains User Data Management coverage bullet', () => {
      expect(BRAINSTORM_SKILL_MD).toContain('User Data Management coverage (ENH-066)');
    });
  });

  // ── ENH-066 crystallize side ──────────────────────────────────────────────

  describe('ENH-066 — workflows/crystallize.md user data export', () => {
    test('12. contains "User Data Management" export step in Step 1D', () => {
      expect(CRYSTALLIZE_MD).toContain('User Data Management');
    });

    test('13. contains user_data_imported working notes field', () => {
      expect(CRYSTALLIZE_MD).toContain('user_data_imported');
    });

    test('14. contains user_data_capabilities_count working notes field', () => {
      expect(CRYSTALLIZE_MD).toContain('user_data_capabilities_count');
    });

    test('15. contains user-data.html in MANDATORY READ GATE list', () => {
      expect(CRYSTALLIZE_MD).toContain('14. `user-data.html`');
    });

    test('16. contains ENH-066 reference in crystallize.md', () => {
      expect(CRYSTALLIZE_MD).toContain('ENH-066');
    });
  });

  describe('ENH-066 — templates/project/PROJECT-CONTEXT.md', () => {
    test('17. template contains ## User Data Management section', () => {
      expect(PROJECT_CONTEXT_TPL).toContain('## User Data Management');
    });

    test('18. template User Data Management section has Capability table', () => {
      expect(PROJECT_CONTEXT_TPL).toContain('| Capability | Supported | Notes |');
    });

    test('19. template User Data Management mentions data export (GDPR)', () => {
      expect(PROJECT_CONTEXT_TPL).toContain('Data export (GDPR)');
    });
  });

  describe('ENH-066 — skills/vp-crystallize/SKILL.md', () => {
    test('20. SKILL.md contains User Data Management Export section', () => {
      expect(CRYSTALLIZE_SKILL_MD).toContain('User Data Management Export (ENH-066)');
    });

    test('21. SKILL.md contains ENH-066 reference', () => {
      expect(CRYSTALLIZE_SKILL_MD).toContain('ENH-066');
    });
  });

});
