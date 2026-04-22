const fs = require('fs');
const path = require('path');

const crystallize = fs.readFileSync(path.join(__dirname, '../../workflows/crystallize.md'), 'utf8');
const autonomous = fs.readFileSync(path.join(__dirname, '../../workflows/autonomous.md'), 'utf8');
const taskTemplate = fs.readFileSync(path.join(__dirname, '../../templates/phase/TASK.md'), 'utf8');

describe('Phase 103 — ENH-069: Crystallize UI→Task Binding (10 gaps)', () => {

  // ── Group A: crystallize.md ──────────────────────────────────────────────

  describe('Gap 1 — UI Pages → Component Map (crystallize Step 1A)', () => {
    test('crystallize contains "UI Pages → Component Map"', () => {
      expect(crystallize).toMatch(/UI Pages → Component Map/);
    });

    test('crystallize contains component map table header', () => {
      expect(crystallize).toMatch(/\| Prototype \| Target component \| Phase \|/);
    });

    test('crystallize mentions "Source" column in component map', () => {
      expect(crystallize).toMatch(/\| Source \| Status \|/);
    });
  });

  describe('Gap 9 — UX walkthrough log processing (crystallize Step 1A)', () => {
    test('crystallize references "UX walkthrough log" action', () => {
      const matches = (crystallize.match(/UX walkthrough log/g) || []).length;
      expect(matches).toBeGreaterThanOrEqual(2);
    });

    test('crystallize defines ux-fix-required status', () => {
      expect(crystallize).toMatch(/ux-fix-required/);
    });

    test('crystallize defines ux_walkthrough as a source label', () => {
      expect(crystallize).toMatch(/ux_walkthrough/);
    });
  });

  describe('Gap 10 — Background extracted ideas gate (crystallize Step 1A)', () => {
    test('crystallize references "Background extracted ideas" gate', () => {
      const matches = (crystallize.match(/Background extracted ideas/g) || []).length;
      expect(matches).toBeGreaterThanOrEqual(2);
    });

    test('crystallize defines "Unresolved Background Ideas" gate list', () => {
      expect(crystallize).toMatch(/Unresolved Background Ideas/);
    });

    test('crystallize mentions background ideas gate blocks Step 7', () => {
      expect(crystallize).toMatch(/BLOCKS Step 7.*Unresolved Background Ideas|Unresolved Background Ideas.*gate/i);
    });
  });

  describe('Gap 5 — arch_to_ui_sync noted → Component Map (crystallize Step 1D)', () => {
    test('crystallize has ≥3 references to arch_to_ui_sync (read + action + source label)', () => {
      const matches = (crystallize.match(/arch_to_ui_sync/g) || []).length;
      expect(matches).toBeGreaterThanOrEqual(3);
    });

    test('crystallize has Step 1D-a section for arch_to_ui_sync noted processing', () => {
      expect(crystallize).toMatch(/Step 1D-a.*arch_to_ui_sync|arch_to_ui_sync.*Step 1D/i);
    });
  });

  describe('Gap 7 — feature-map discrepancy explicit resolution (crystallize Step 1D)', () => {
    test('crystallize requires "Feature-Map Resolutions" working notes', () => {
      expect(crystallize).toMatch(/Feature-Map Resolutions/);
    });

    test('crystallize blocks Step 7 on unresolved discrepancies', () => {
      expect(crystallize).toMatch(/BLOCKED.*Step 7|Step 7.*BLOCKED/i);
    });

    test('crystallize offers design-only resolution option', () => {
      expect(crystallize).toMatch(/design-only/);
    });
  });

  describe('Gap 8 — Design staleness warning (crystallize Step 1D)', () => {
    test('crystallize emits "Design Staleness Warning"', () => {
      expect(crystallize).toMatch(/Design Staleness Warning/);
    });

    test('crystallize has Step 1D-b section for design staleness', () => {
      expect(crystallize).toMatch(/Step 1D-b.*Design Staleness|Step 1D-b.*staleness/i);
    });

    test('crystallize adds design_staleness pre-implementation task', () => {
      expect(crystallize).toMatch(/design_staleness/);
    });
  });

  describe('Gap 6 — Coverage gaps blocking for scoped features (crystallize Step 1F)', () => {
    test('crystallize Step 1F has "Coverage gap BLOCKED" for scoped features', () => {
      expect(crystallize).toMatch(/Coverage gap BLOCKED/);
    });

    test('crystallize Step 1F has design-TBD option', () => {
      expect(crystallize).toMatch(/design-TBD/);
    });

    test('crystallize Step 1F distinguishes scoped vs out-of-scope (Case A / Case B)', () => {
      expect(crystallize).toMatch(/Case A/);
      expect(crystallize).toMatch(/Case B/);
    });
  });

  describe('Gap 2 — ROADMAP cross-check in Step 7 (crystallize)', () => {
    test('crystallize Step 7 has UI Pages → Component Map completeness check', () => {
      expect(crystallize).toMatch(/Component Map Completeness Check|Component Map.*Completeness/);
    });

    test('crystallize Step 7 auto-adds missing tasks', () => {
      expect(crystallize).toMatch(/auto-added by crystallize/);
    });

    test('crystallize Step 7 writes component map to PROJECT-CONTEXT.md', () => {
      expect(crystallize).toMatch(/PROJECT-CONTEXT\.md/);
    });
  });

  // ── Group B: autonomous.md + TASK.md ────────────────────────────────────

  describe('Gap 3 — UI Prototype Reference field (autonomous.md + TASK.md)', () => {
    test('autonomous.md contains UI Prototype Reference section', () => {
      const matches = (autonomous.match(/UI Prototype Reference/g) || []).length;
      expect(matches).toBeGreaterThanOrEqual(2);
    });

    test('autonomous.md instructs to read prototype before writing component code', () => {
      expect(autonomous).toMatch(/READ the referenced prototype file BEFORE writing/i);
    });

    test('TASK.md template contains UI Prototype Reference section', () => {
      expect(taskTemplate).toMatch(/## UI Prototype Reference/);
    });

    test('TASK.md template has prototype path placeholder', () => {
      expect(taskTemplate).toMatch(/ui-direction.*pages.*html|pages.*landing\.html/i);
    });
  });

  describe('Gap 4 — UI Coverage Gate at phase completion (autonomous.md)', () => {
    test('autonomous.md contains "UI Coverage Gate"', () => {
      expect(autonomous).toMatch(/UI Coverage Gate/);
    });

    test('autonomous.md mentions stub heuristic', () => {
      expect(autonomous).toMatch(/stub heuristic|STUB detected/i);
    });

    test('autonomous.md gate is positioned before phase-level verification', () => {
      const gateIdx = autonomous.indexOf('UI Coverage Gate');
      const verifyIdx = autonomous.indexOf('Run phase-level verification');
      expect(gateIdx).toBeGreaterThan(0);
      expect(verifyIdx).toBeGreaterThan(gateIdx);
    });

    test('autonomous.md gate offers defer/design-only to unblock phase', () => {
      expect(autonomous).toMatch(/design-only.*no implementation required|design-only/i);
    });
  });

  // ── Group C: Regression / ordering ──────────────────────────────────────

  describe('Regression — correct ordering in crystallize.md', () => {
    test('Step 1A-i appears before Step 7 in crystallize.md', () => {
      const step1aIdx = crystallize.indexOf('Step 1A-i');
      const step7Idx = crystallize.indexOf('Step 7:');
      expect(step1aIdx).toBeGreaterThan(0);
      expect(step7Idx).toBeGreaterThan(step1aIdx);
    });

    test('Step 1D-a appears before Step 7 in crystallize.md', () => {
      const step1dIdx = crystallize.indexOf('Step 1D-a');
      const step7Idx = crystallize.indexOf('Step 7:');
      expect(step1dIdx).toBeGreaterThan(0);
      expect(step7Idx).toBeGreaterThan(step1dIdx);
    });
  });

});
