'use strict';

/**
 * Phase 169 Task 2 — ENH-120: research-proposal type + 5 variants
 * Tests: RESEARCH_VARIANTS, TYPE_VARIANTS frozen, validateVariant, getSkeleton,
 * getDiagramTypes with research variants, deep-freeze for both families
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

const gen = require('../../lib/proposal-generator.cjs');
const DURATIONS = [5, 15, 30];
const VOICE_LEVEL_IDS = gen.VOICE_LEVELS.map(v => v.id);

// ─────────────────────────────────────────────────────────────────────────────
describe('Phase 169.2 — RESEARCH_VARIANTS framework', () => {
  test('RESEARCH_VARIANTS is exported', () => {
    expect(typeof gen.RESEARCH_VARIANTS).toBe('object');
  });

  test('TYPE_VARIANTS includes research-proposal', () => {
    expect(gen.TYPE_VARIANTS['research-proposal']).toBeDefined();
  });

  test('TYPE_VARIANTS["research-proposal"] === RESEARCH_VARIANTS', () => {
    expect(gen.TYPE_VARIANTS['research-proposal']).toBe(gen.RESEARCH_VARIANTS);
  });

  test('RESEARCH_VARIANTS is frozen', () => {
    expect(Object.isFrozen(gen.RESEARCH_VARIANTS)).toBe(true);
  });

  test('TYPE_VARIANTS is frozen', () => {
    expect(Object.isFrozen(gen.TYPE_VARIANTS)).toBe(true);
  });

  test('RESEARCH_VARIANTS has exactly 5 variants', () => {
    expect(Object.keys(gen.RESEARCH_VARIANTS)).toHaveLength(5);
  });

  test('RESEARCH_VARIANTS has grant-proposal, kickoff, progress-report, defense, tech-transfer', () => {
    const ids = Object.keys(gen.RESEARCH_VARIANTS).sort();
    const expected = ['defense', 'grant-proposal', 'kickoff', 'progress-report', 'tech-transfer'].sort();
    expect(ids).toEqual(expected);
  });

  test('all RESEARCH_VARIANTS are frozen', () => {
    for (const variant of Object.values(gen.RESEARCH_VARIANTS)) {
      expect(Object.isFrozen(variant)).toBe(true);
    }
  });

  test('all RESEARCH_VARIANTS skeleton arrays are frozen', () => {
    for (const variant of Object.values(gen.RESEARCH_VARIANTS)) {
      if (Array.isArray(variant.skeleton)) {
        expect(Object.isFrozen(variant.skeleton)).toBe(true);
      }
    }
  });

  test('all INTERNAL_VARIANTS are still frozen', () => {
    for (const variant of Object.values(gen.INTERNAL_VARIANTS)) {
      expect(Object.isFrozen(variant)).toBe(true);
    }
  });

  test('all INTERNAL_VARIANTS skeleton arrays are frozen', () => {
    for (const variant of Object.values(gen.INTERNAL_VARIANTS)) {
      if (Array.isArray(variant.skeleton)) {
        expect(Object.isFrozen(variant.skeleton)).toBe(true);
      }
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Phase 169.2 — research-proposal type registration', () => {
  test('validateType("research-proposal") passes', () => {
    expect(() => gen.validateType('research-proposal')).not.toThrow();
  });

  test('validateType("research-proposal") returns object with variants: true', () => {
    const type = gen.validateType('research-proposal');
    expect(type.variants).toBe(true);
  });

  test('research-proposal in PROPOSAL_TYPES', () => {
    expect(gen.PROPOSAL_TYPES['research-proposal']).toBeDefined();
  });

  test('research-proposal has label "Science & Technology Research"', () => {
    expect(gen.PROPOSAL_TYPES['research-proposal'].label).toBe('Science & Technology Research');
  });

  test('research-proposal has 10 slides', () => {
    expect(gen.PROPOSAL_TYPES['research-proposal'].slides).toBe(10);
  });

  test('Existing 4 types still in PROPOSAL_TYPES', () => {
    const types = ['project-proposal', 'tech-architecture', 'product-pitch', 'general'];
    for (const t of types) {
      expect(gen.PROPOSAL_TYPES[t]).toBeDefined();
    }
  });

  test('project-proposal still has 10 slides', () => {
    expect(gen.PROPOSAL_TYPES['project-proposal'].slides).toBe(10);
  });

  test('tech-architecture still has 12 slides', () => {
    expect(gen.PROPOSAL_TYPES['tech-architecture'].slides).toBe(12);
  });

  test('product-pitch still has 12 slides', () => {
    expect(gen.PROPOSAL_TYPES['product-pitch'].slides).toBe(12);
  });

  test('general still has 8 slides', () => {
    expect(gen.PROPOSAL_TYPES['general'].slides).toBe(8);
  });

  test('internal-presentation still has 8 slides', () => {
    expect(gen.PROPOSAL_TYPES['internal-presentation'].slides).toBe(8);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Phase 169.2 — RESEARCH_VARIANTS structure', () => {
  test('each variant has id, label, slides, skeleton, diagrams, defaultDuration, suggestedVoice, citations, goal', () => {
    for (const [id, variant] of Object.entries(gen.RESEARCH_VARIANTS)) {
      expect(variant.id).toBe(id);
      expect(typeof variant.label).toBe('string');
      expect(typeof variant.slides).toBe('number');
      expect(Array.isArray(variant.skeleton)).toBe(true);
      expect(Array.isArray(variant.diagrams)).toBe(true);
      expect(typeof variant.defaultDuration).toBe('number');
      expect(typeof variant.suggestedVoice).toBe('string');
      expect(variant.citations).toBe(true);
      expect(typeof variant.goal).toBe('string');
    }
  });

  test('grant-proposal has 12 slides', () => {
    const v = gen.RESEARCH_VARIANTS['grant-proposal'];
    expect(v.slides).toBe(12);
  });

  test('kickoff has 10 slides', () => {
    const v = gen.RESEARCH_VARIANTS['kickoff'];
    expect(v.slides).toBe(10);
  });

  test('progress-report has 10 slides', () => {
    const v = gen.RESEARCH_VARIANTS['progress-report'];
    expect(v.slides).toBe(10);
  });

  test('defense has 10 slides', () => {
    const v = gen.RESEARCH_VARIANTS['defense'];
    expect(v.slides).toBe(10);
  });

  test('tech-transfer has 10 slides', () => {
    const v = gen.RESEARCH_VARIANTS['tech-transfer'];
    expect(v.slides).toBe(10);
  });

  test('grant-proposal skeleton has at least 12 slides', () => {
    const v = gen.RESEARCH_VARIANTS['grant-proposal'];
    expect(v.skeleton.length).toBeGreaterThanOrEqual(12);
  });

  test('kickoff skeleton has at least 10 slides', () => {
    const v = gen.RESEARCH_VARIANTS['kickoff'];
    expect(v.skeleton.length).toBeGreaterThanOrEqual(10);
  });

  test('progress-report skeleton has at least 10 slides', () => {
    const v = gen.RESEARCH_VARIANTS['progress-report'];
    expect(v.skeleton.length).toBeGreaterThanOrEqual(10);
  });

  test('defense skeleton has at least 10 slides', () => {
    const v = gen.RESEARCH_VARIANTS['defense'];
    expect(v.skeleton.length).toBeGreaterThanOrEqual(10);
  });

  test('tech-transfer skeleton has at least 10 slides', () => {
    const v = gen.RESEARCH_VARIANTS['tech-transfer'];
    expect(v.skeleton.length).toBeGreaterThanOrEqual(10);
  });

  test('all skeleton entries have title and beat', () => {
    for (const [id, variant] of Object.entries(gen.RESEARCH_VARIANTS)) {
      for (const entry of variant.skeleton) {
        expect(typeof entry.title).toBe('string');
        expect(typeof entry.beat).toBe('string');
      }
    }
  });

  test('all skeletons start with Cover', () => {
    for (const [id, variant] of Object.entries(gen.RESEARCH_VARIANTS)) {
      expect(variant.skeleton[0].title).toBe('Cover');
    }
  });

  test('grant-proposal skeleton first beat is context', () => {
    const v = gen.RESEARCH_VARIANTS['grant-proposal'];
    expect(v.skeleton[0].beat).toBe('context');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Phase 169.2 — research variant defaults and voice', () => {
  test('all variants have defaultDuration in [5, 15, 30]', () => {
    for (const [id, variant] of Object.entries(gen.RESEARCH_VARIANTS)) {
      expect(DURATIONS).toContain(variant.defaultDuration);
    }
  });

  test('all variants have suggestedVoice in VOICE_LEVELS ids', () => {
    for (const [id, variant] of Object.entries(gen.RESEARCH_VARIANTS)) {
      expect(VOICE_LEVEL_IDS).toContain(variant.suggestedVoice);
    }
  });

  test('all variants have citations: true', () => {
    for (const [id, variant] of Object.entries(gen.RESEARCH_VARIANTS)) {
      expect(variant.citations).toBe(true);
    }
  });

  test('grant-proposal: voice balanced, duration 15', () => {
    const v = gen.RESEARCH_VARIANTS['grant-proposal'];
    expect(v.suggestedVoice).toBe('balanced');
    expect(v.defaultDuration).toBe(15);
  });

  test('kickoff: voice balanced, duration 15', () => {
    const v = gen.RESEARCH_VARIANTS['kickoff'];
    expect(v.suggestedVoice).toBe('balanced');
    expect(v.defaultDuration).toBe(15);
  });

  test('progress-report: voice humble, duration 15', () => {
    const v = gen.RESEARCH_VARIANTS['progress-report'];
    expect(v.suggestedVoice).toBe('humble');
    expect(v.defaultDuration).toBe(15);
  });

  test('defense: voice balanced, duration 15', () => {
    const v = gen.RESEARCH_VARIANTS['defense'];
    expect(v.suggestedVoice).toBe('balanced');
    expect(v.defaultDuration).toBe(15);
  });

  test('tech-transfer: voice proud, duration 15', () => {
    const v = gen.RESEARCH_VARIANTS['tech-transfer'];
    expect(v.suggestedVoice).toBe('proud');
    expect(v.defaultDuration).toBe(15);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Phase 169.2 — research variant diagrams', () => {
  test('grant-proposal has gantt and flowchart', () => {
    expect(gen.RESEARCH_VARIANTS['grant-proposal'].diagrams).toEqual(['gantt', 'flowchart']);
  });

  test('kickoff has gantt and flowchart', () => {
    expect(gen.RESEARCH_VARIANTS['kickoff'].diagrams).toEqual(['gantt', 'flowchart']);
  });

  test('progress-report has gantt', () => {
    expect(gen.RESEARCH_VARIANTS['progress-report'].diagrams).toEqual(['gantt']);
  });

  test('defense has flowchart', () => {
    expect(gen.RESEARCH_VARIANTS['defense'].diagrams).toEqual(['flowchart']);
  });

  test('tech-transfer has flowchart and sequenceDiagram', () => {
    expect(gen.RESEARCH_VARIANTS['tech-transfer'].diagrams).toEqual(['flowchart', 'sequenceDiagram']);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Phase 169.2 — validateVariant for research-proposal', () => {
  test('validateVariant("research-proposal") defaults to grant-proposal', () => {
    expect(gen.validateVariant('research-proposal')).toBe('grant-proposal');
  });

  test('validateVariant("research-proposal", "grant-proposal") returns grant-proposal', () => {
    expect(gen.validateVariant('research-proposal', 'grant-proposal')).toBe('grant-proposal');
  });

  test('validateVariant("research-proposal", "kickoff") returns kickoff', () => {
    expect(gen.validateVariant('research-proposal', 'kickoff')).toBe('kickoff');
  });

  test('validateVariant("research-proposal", "progress-report") returns progress-report', () => {
    expect(gen.validateVariant('research-proposal', 'progress-report')).toBe('progress-report');
  });

  test('validateVariant("research-proposal", "defense") returns defense', () => {
    expect(gen.validateVariant('research-proposal', 'defense')).toBe('defense');
  });

  test('validateVariant("research-proposal", "tech-transfer") returns tech-transfer', () => {
    expect(gen.validateVariant('research-proposal', 'tech-transfer')).toBe('tech-transfer');
  });

  test('validateVariant("research-proposal", "unknown") throws with variant ids', () => {
    expect(() => gen.validateVariant('research-proposal', 'unknown')).toThrow();
    try {
      gen.validateVariant('research-proposal', 'unknown');
    } catch (e) {
      expect(e.message).toContain('grant-proposal');
      expect(e.message).toContain('kickoff');
      expect(e.message).toContain('defense');
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Phase 169.2 — getSkeleton for research-proposal', () => {
  test('getSkeleton("research-proposal", "grant-proposal") returns skeleton array', () => {
    const skeleton = gen.getSkeleton('research-proposal', 'grant-proposal');
    expect(Array.isArray(skeleton)).toBe(true);
    expect(skeleton.length).toBeGreaterThanOrEqual(12);
  });

  test('getSkeleton("research-proposal", "kickoff") returns skeleton array', () => {
    const skeleton = gen.getSkeleton('research-proposal', 'kickoff');
    expect(Array.isArray(skeleton)).toBe(true);
    expect(skeleton.length).toBeGreaterThanOrEqual(10);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Phase 169.2 — getDiagramTypes for research-proposal', () => {
  test('getDiagramTypes("research-proposal", "grant-proposal") returns gantt and flowchart', () => {
    expect(gen.getDiagramTypes('research-proposal', 'grant-proposal')).toEqual(['gantt', 'flowchart']);
  });

  test('getDiagramTypes("research-proposal", "kickoff") returns gantt and flowchart', () => {
    expect(gen.getDiagramTypes('research-proposal', 'kickoff')).toEqual(['gantt', 'flowchart']);
  });

  test('getDiagramTypes("research-proposal", "progress-report") returns gantt', () => {
    expect(gen.getDiagramTypes('research-proposal', 'progress-report')).toEqual(['gantt']);
  });

  test('getDiagramTypes("research-proposal", "defense") returns flowchart', () => {
    expect(gen.getDiagramTypes('research-proposal', 'defense')).toEqual(['flowchart']);
  });

  test('getDiagramTypes("research-proposal", "tech-transfer") returns flowchart and sequenceDiagram', () => {
    expect(gen.getDiagramTypes('research-proposal', 'tech-transfer')).toEqual(['flowchart', 'sequenceDiagram']);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Phase 169.2 — template resolution for research-proposal', () => {
  test('resolveTemplate("research-proposal","pptx",ROOT) returns existing file', () => {
    const template = gen.resolveTemplate('research-proposal', 'pptx', ROOT);
    expect(fs.existsSync(template)).toBe(true);
  });

  test('resolveTemplate("research-proposal","pptx",ROOT) falls back to general.pptx', () => {
    const template = gen.resolveTemplate('research-proposal', 'pptx', ROOT);
    expect(template).toMatch(/general\.pptx|research-proposal\.pptx/);
  });
});
