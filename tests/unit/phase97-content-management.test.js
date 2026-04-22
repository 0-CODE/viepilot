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

describe('Phase 97 — ENH-065 Content Management contracts', () => {

  // ── ENH-065 brainstorm side: Topic 7 Content Management ─────────────────

  describe('ENH-065 — workflows/brainstorm.md Content Management topic', () => {
    test('1. contains Topic 7 "Content Management"', () => {
      expect(BRAINSTORM_MD).toContain('Content Management');
    });

    test('2. Topic 8 has ≥10 sub-questions (renumbered from 7 after ENH-068 added Topic 7)', () => {
      // ENH-068 (Phase 100) inserted Topic 7 Admin Entity Management, pushing Content to 8
      const topic8Match = BRAINSTORM_MD.match(/8\. \*\*Content Management\*\*([\s\S]*?)(?=9\. \*\*User Data|###)/);
      expect(topic8Match).not.toBeNull();
      const bullets = (topic8Match[1].match(/^\s+-/gm) || []).length;
      expect(bullets).toBeGreaterThanOrEqual(10);
    });

    test('3. contains content heuristic keyword "article"', () => {
      expect(BRAINSTORM_MD).toContain('article');
    });

    test('4. contains content heuristic keyword "SEO"', () => {
      expect(BRAINSTORM_MD).toContain('SEO');
    });

    test('5. contains content coverage gate ("Content gap detected")', () => {
      expect(BRAINSTORM_MD).toContain('Content gap detected');
    });

    test('6. contains content.html in Architect workspace layout', () => {
      expect(BRAINSTORM_MD).toContain('content.html');
    });

    test('7. contains notes.md ## content YAML schema section', () => {
      // After the admin section there should be a ## content section
      const idx = BRAINSTORM_MD.indexOf('## content\ncontent_types:');
      expect(idx).toBeGreaterThan(-1);
    });

    test('8. contains ENH-065 reference in brainstorm.md', () => {
      expect(BRAINSTORM_MD).toContain('ENH-065');
    });

    test('9. Phase assignment renumbered to Topic 10 (after ENH-068 added Topic 7)', () => {
      // ENH-068 (Phase 100) added Topic 7 Admin Entity Management, pushing Phase assignment to 10
      expect(BRAINSTORM_MD).toContain('10. **Phase assignment (ENH-030):**');
    });
  });

  describe('ENH-065 — skills/vp-brainstorm/SKILL.md', () => {
    test('10. SKILL.md objective contains ENH-065 reference', () => {
      expect(BRAINSTORM_SKILL_MD).toContain('ENH-065');
    });

    test('11. SKILL.md objective contains Content Management coverage bullet', () => {
      expect(BRAINSTORM_SKILL_MD).toContain('Content Management coverage (ENH-065)');
    });
  });

  // ── ENH-065 crystallize side ─────────────────────────────────────────────

  describe('ENH-065 — workflows/crystallize.md content export', () => {
    test('12. contains "Content Management" export step in Step 1D', () => {
      expect(CRYSTALLIZE_MD).toContain('Content Management');
    });

    test('13. contains content_imported working notes field', () => {
      expect(CRYSTALLIZE_MD).toContain('content_imported');
    });

    test('14. contains content_types_count working notes field', () => {
      expect(CRYSTALLIZE_MD).toContain('content_types_count');
    });

    test('15. contains ENH-065 reference in crystallize.md', () => {
      expect(CRYSTALLIZE_MD).toContain('ENH-065');
    });
  });

  describe('ENH-065 — templates/project/PROJECT-CONTEXT.md', () => {
    test('16. template contains ## Content Management section', () => {
      expect(PROJECT_CONTEXT_TPL).toContain('## Content Management');
    });

    test('17. template Content Management section has Content Type table', () => {
      expect(PROJECT_CONTEXT_TPL).toContain('| Content Type | Created By | Lifecycle | Key Fields | Phase |');
    });

    test('18. template contains Media & Storage sub-section', () => {
      expect(PROJECT_CONTEXT_TPL).toContain('### Media & Storage');
    });

    test('19. template contains Localization sub-section', () => {
      expect(PROJECT_CONTEXT_TPL).toContain('### Localization');
    });
  });

  describe('ENH-065 — skills/vp-crystallize/SKILL.md', () => {
    test('20. SKILL.md contains Content Management Export section', () => {
      expect(CRYSTALLIZE_SKILL_MD).toContain('Content Management Export (ENH-065)');
    });

    test('21. SKILL.md contains ENH-065 reference', () => {
      expect(CRYSTALLIZE_SKILL_MD).toContain('ENH-065');
    });
  });

});
