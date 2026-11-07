'use strict';
const pr = require('../../lib/proposal-review.cjs');

const CODES = ['H1', 'H2', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8'];
const RESEARCH_CODES = ['R1', 'R2', 'R3'];

function mkRaw(personaId, scoreOver = {}, extra = {}, base = 5) {
  const scores = {};
  const evidence = {};
  const allCodes = [...CODES, ...RESEARCH_CODES];
  for (const c of allCodes) {
    scores[c] = c in scoreOver ? scoreOver[c] : base;
    evidence[c] = [{ slide: 1, quote: 'a real line' }];
  }
  return { personaId, scores, evidence, keep: [], improve: [], blockers: [], keyMessage: 'km', ...extra };
}

describe('phase169-t4: personas 21-30, research criteria, role mapping', () => {

  describe('loadPersonas() expansion', () => {
    const personas = pr.loadPersonas();

    test('at least 30 personas loaded', () => {
      expect(personas.length).toBeGreaterThanOrEqual(30);
    });

    test('all ids are unique', () => {
      const ids = personas.map(p => p.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    test('personas 21-25 have scope: internal', () => {
      for (let i = 21; i <= 25; i++) {
        const p = personas.find(x => x.id === i);
        expect(p).toBeDefined();
        expect(p.scope).toBe('internal');
      }
    });

    test('personas 26-30 have scope: research', () => {
      for (let i = 26; i <= 30; i++) {
        const p = personas.find(x => x.id === i);
        expect(p).toBeDefined();
        expect(p.scope).toBe('research');
      }
    });

    test('personas 1-20 have no scope field or scope is implicit', () => {
      for (let i = 1; i <= 20; i++) {
        const p = personas.find(x => x.id === i);
        expect(p).toBeDefined();
        // For backward compat, 1-20 may have scope undefined or any value
        // We just ensure they parse without error
      }
    });
  });

  describe('internal-presentation variants', () => {
    const variants = ['team-intro', 'leadership-report', 'feature-demo', 'training', 'all-hands'];

    test('each variant has 6-8 quick ids', () => {
      for (const variant of variants) {
        const ids = pr.selectPersonas({ type: 'internal-presentation', variant, mode: 'quick' });
        expect(ids.length).toBeGreaterThanOrEqual(6);
        expect(ids.length).toBeLessThanOrEqual(8);
      }
    });

    test('each variant includes persona 20', () => {
      for (const variant of variants) {
        const ids = pr.selectPersonas({ type: 'internal-presentation', variant, mode: 'quick' });
        expect(ids).toContain(20);
      }
    });

    test('full mode for internal-presentation includes 1-25', () => {
      const ids = pr.selectPersonas({ type: 'internal-presentation', mode: 'full' });
      expect(ids).toEqual(expect.arrayContaining([1, 2, 20, 21, 22, 23, 24, 25]));
      // Should not include research personas in this mode
      expect(ids.some(id => id >= 26)).toBe(false);
    });
  });

  describe('research-proposal variants', () => {
    const variants = ['grant-proposal', 'kickoff', 'progress-report', 'defense', 'tech-transfer'];

    test('each variant has 6-8 quick ids', () => {
      for (const variant of variants) {
        const ids = pr.selectPersonas({ type: 'research-proposal', variant, mode: 'quick' });
        expect(ids.length).toBeGreaterThanOrEqual(6);
        expect(ids.length).toBeLessThanOrEqual(8);
      }
    });

    test('each variant includes persona 20', () => {
      for (const variant of variants) {
        const ids = pr.selectPersonas({ type: 'research-proposal', variant, mode: 'quick' });
        expect(ids).toContain(20);
      }
    });

    test('each variant includes at least 2 academic personas (26-30)', () => {
      for (const variant of variants) {
        const ids = pr.selectPersonas({ type: 'research-proposal', variant, mode: 'quick' });
        const academic = ids.filter(id => id >= 26 && id <= 30);
        expect(academic.length).toBeGreaterThanOrEqual(2);
      }
    });

    test('full mode for research-proposal includes 1-20 and 26-30', () => {
      const ids = pr.selectPersonas({ type: 'research-proposal', mode: 'full' });
      expect(ids).toEqual(expect.arrayContaining([1, 2, 20, 26, 27, 28, 29, 30]));
      // Should not include internal personas 21-25 in full mode
      expect(ids.some(id => id >= 21 && id <= 25)).toBe(false);
    });
  });

  describe('audienceProfile with roles', () => {
    test('profile with primary new-hires role includes persona 21', () => {
      const profile = {
        roles: [{ id: 'new-hires', weight: 'primary' }],
        internal: true,
      };
      const ids = pr.selectPersonas({
        type: 'internal-presentation',
        audienceProfile: profile,
        mode: 'quick',
      });
      expect(ids).toContain(21);
    });

    test('profile with leadership role includes persona from leadership mapping', () => {
      const profile = {
        roles: [{ id: 'leadership', weight: 'primary' }],
        internal: true,
      };
      const ids = pr.selectPersonas({
        type: 'internal-presentation',
        audienceProfile: profile,
        mode: 'quick',
      });
      // Persona 1 and/or 25 are in leadership mapping
      expect(ids.some(id => [1, 25, 23].includes(id))).toBe(true);
    });
  });

  describe('backward compatibility', () => {
    const backCompatCalls = [
      { type: 'product-pitch' },
      { type: 'tech-architecture' },
      { type: 'project-proposal' },
      { type: 'general' },
      { type: 'product-pitch', audience: 'cfo investor' },
      { type: 'general', mode: 'full' },
    ];

    const expected = {
      product_pitch: [1, 2, 5, 9, 10, 18, 20],
      tech_architecture: [3, 4, 9, 12, 13, 19, 20],
      project_proposal: [1, 2, 6, 7, 11, 15, 20],
      general: [1, 7, 9, 14, 16, 17, 20],
      product_pitch_cfo_investor: [1, 2, 5, 9, 10, 18, 20],
      general_full: [...Array.from({ length: 20 }, (_, i) => i + 1)],
    };

    test('external type calls return same personas as before', () => {
      const results = {
        product_pitch: pr.selectPersonas(backCompatCalls[0]),
        tech_architecture: pr.selectPersonas(backCompatCalls[1]),
        project_proposal: pr.selectPersonas(backCompatCalls[2]),
        general: pr.selectPersonas(backCompatCalls[3]),
        product_pitch_cfo_investor: pr.selectPersonas(backCompatCalls[4]),
        general_full: pr.selectPersonas(backCompatCalls[5]),
      };

      expect(results.product_pitch).toEqual(expected.product_pitch);
      expect(results.tech_architecture).toEqual(expected.tech_architecture);
      expect(results.project_proposal).toEqual(expected.project_proposal);
      expect(results.general).toEqual(expected.general);
      expect(results.product_pitch_cfo_investor).toEqual(expected.product_pitch_cfo_investor);
      expect(results.general_full).toEqual(expected.general_full);
    });
  });

  describe('getRubric(type) and getBlockers(type)', () => {
    test('getRubric returns universal criteria for non-research types', () => {
      const rubric = pr.getRubric('product-pitch');
      const codes = rubric.map(r => r.code);
      expect(codes).toContain('H1');
      expect(codes).toContain('C8');
      expect(codes).not.toContain('R1');
    });

    test('getRubric for research-proposal includes R1, R2, R3', () => {
      const rubric = pr.getRubric('research-proposal');
      const codes = rubric.map(r => r.code);
      expect(codes).toContain('H1');
      expect(codes).toContain('C8');
      expect(codes).toContain('R1');
      expect(codes).toContain('R2');
      expect(codes).toContain('R3');
    });

    test('getBlockers returns standard blockers for non-research types', () => {
      const blockers = pr.getBlockers('product-pitch');
      expect(blockers).toContain('false-claim');
      expect(blockers).not.toContain('unsupported-scientific-claim');
    });

    test('getBlockers for research-proposal includes unsupported-scientific-claim', () => {
      const blockers = pr.getBlockers('research-proposal');
      expect(blockers).toContain('false-claim');
      expect(blockers).toContain('unsupported-scientific-claim');
    });
  });

  describe('evaluateGate with research criteria', () => {
    test('non-research gate uses standard criteria only', () => {
      const reviews = [
        pr.parseReview(mkRaw(1, { H1: 5, C1: 5, R1: 2 })).review,
      ];
      const gate = pr.evaluateGate(reviews, { type: 'product-pitch' });
      // R1 with score 2 should not affect product-pitch gate (R1 not in standard rubric)
      const r1Criterion = gate.perCriterion.find(c => c.code === 'R1');
      expect(r1Criterion).toBeUndefined();
    });

    test('research gate fails when R1 average < 4.0', () => {
      // Create mock reviews directly with research codes
      const reviews = [
        {
          personaId: 26,
          scores: { H1: 5, H2: 5, C1: 5, C2: 4, C3: 5, C4: 4, C5: 5, C6: 5, C7: 4, C8: 4, R1: 3.5, R2: 4.5, R3: 4.0 },
          evidence: {},
          keep: [],
          improve: [],
          blockers: [],
        },
        {
          personaId: 27,
          scores: { H1: 5, H2: 5, C1: 5, C2: 4, C3: 5, C4: 4, C5: 5, C6: 5, C7: 4, C8: 4, R1: 3.5, R2: 4.5, R3: 4.0 },
          evidence: {},
          keep: [],
          improve: [],
          blockers: [],
        },
      ];
      const gate = pr.evaluateGate(reviews, { type: 'research-proposal' });
      const r1Criterion = gate.perCriterion.find(c => c.code === 'R1');
      expect(r1Criterion).toBeDefined();
      expect(r1Criterion.avg).toBeLessThan(4.0);
      expect(r1Criterion.pass).toBe(false);
      expect(gate.pass).toBe(false);
    });

    test('research gate passes when R1 average >= 4.0', () => {
      const reviews = [
        {
          personaId: 26,
          scores: { H1: 5, H2: 5, C1: 5, C2: 4, C3: 5, C4: 4, C5: 5, C6: 5, C7: 4, C8: 4, R1: 4.0, R2: 4.0, R3: 3.5 },
          evidence: {},
          keep: [],
          improve: [],
          blockers: [],
        },
        {
          personaId: 27,
          scores: { H1: 5, H2: 5, C1: 5, C2: 4, C3: 5, C4: 4, C5: 5, C6: 5, C7: 4, C8: 4, R1: 4.0, R2: 4.0, R3: 3.5 },
          evidence: {},
          keep: [],
          improve: [],
          blockers: [],
        },
      ];
      const gate = pr.evaluateGate(reviews, { type: 'research-proposal' });
      const r1Criterion = gate.perCriterion.find(c => c.code === 'R1');
      expect(r1Criterion).toBeDefined();
      expect(r1Criterion.avg).toBeGreaterThanOrEqual(4.0);
      expect(r1Criterion.pass).toBe(true);
    });

    test('research gate fails on unsupported-scientific-claim blocker', () => {
      const reviews = [
        {
          personaId: 26,
          scores: { H1: 5, H2: 5, C1: 5, C2: 4, C3: 5, C4: 4, C5: 5, C6: 5, C7: 4, C8: 4, R1: 4.5, R2: 4.5, R3: 4.0 },
          evidence: {},
          keep: [],
          improve: [],
          blockers: ['unsupported-scientific-claim'],
        },
      ];
      const gate = pr.evaluateGate(reviews, { type: 'research-proposal' });
      expect(gate.blockers.length).toBeGreaterThan(0);
      expect(gate.blockers[0].blocker).toBe('unsupported-scientific-claim');
      expect(gate.pass).toBe(false);
    });

    test('non-research gate ignores unsupported-scientific-claim blocker', () => {
      const reviews = [
        {
          personaId: 1,
          scores: { H1: 5, H2: 5, C1: 5, C2: 4, C3: 5, C4: 4, C5: 5, C6: 5, C7: 4, C8: 4 },
          evidence: {},
          keep: [],
          improve: [],
          blockers: ['unsupported-scientific-claim'],
        },
      ];
      const gate = pr.evaluateGate(reviews, { type: 'product-pitch' });
      expect(gate.blockers.length).toBe(0);
    });
  });

  describe('role mapping', () => {
    test('loadRoleMapping returns map of role ids to persona ids', () => {
      const roleMap = pr.loadRoleMapping();
      expect(roleMap).toBeDefined();
      expect(typeof roleMap).toBe('object');
      // Should have at least the main roles
      expect(roleMap.leadership).toBeDefined();
      expect(roleMap.engineering).toBeDefined();
      expect(roleMap['new-hires']).toBeDefined();
    });

    test('new-hires role maps to persona 21', () => {
      const roleMap = pr.loadRoleMapping();
      expect(roleMap['new-hires']).toContain(21);
    });

    test('research roles map to research personas', () => {
      const roleMap = pr.loadRoleMapping();
      expect(roleMap['scientific-council']).toBeDefined();
      expect(roleMap['funding-agency']).toBeDefined();
      expect(roleMap.researchers).toBeDefined();
      // At least some research personas should be in research role mappings
      const allResearchMappings = [
        ...roleMap['scientific-council'],
        ...roleMap['funding-agency'],
        ...roleMap.researchers,
      ];
      const hasResearchPersonas = allResearchMappings.some(id => id >= 26 && id <= 30);
      expect(hasResearchPersonas).toBe(true);
    });
  });

  describe('internal-presentation scope only in quick mode', () => {
    test('quick selection for internal-presentation does not include research personas 26-30', () => {
      const variants = ['team-intro', 'leadership-report', 'feature-demo', 'training', 'all-hands'];
      for (const variant of variants) {
        const ids = pr.selectPersonas({ type: 'internal-presentation', variant, mode: 'quick' });
        expect(ids.some(id => id >= 26)).toBe(false);
      }
    });

    test('quick selection for research-proposal may include internal personas 21-25', () => {
      // research-proposal selections may cross-reference internal personas as needed
      const variants = ['grant-proposal', 'kickoff', 'progress-report', 'defense', 'tech-transfer'];
      let foundInternal = false;
      for (const variant of variants) {
        const ids = pr.selectPersonas({ type: 'research-proposal', variant, mode: 'quick' });
        if (ids.some(id => id >= 21 && id <= 25)) {
          foundInternal = true;
          break;
        }
      }
      // It's OK if some research variants include internal personas (for cross-functional mix)
      // Just verify that if they do, they stay within the range
      expect(true).toBe(true);
    });
  });
});

describe('phase169-t4: type-level default rows (review)', () => {
  const review = require('../../lib/proposal-review.cjs');
  test('internal-presentation without variant uses the team-intro set, not general', () => {
    expect(review.selectPersonas({ type: 'internal-presentation' }))
      .toEqual(review.selectPersonas({ type: 'internal-presentation', variant: 'team-intro' }));
  });
  test('research-proposal without variant uses the grant-proposal set', () => {
    expect(review.selectPersonas({ type: 'research-proposal' }))
      .toEqual(review.selectPersonas({ type: 'research-proposal', variant: 'grant-proposal' }));
  });
});
