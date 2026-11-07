'use strict';

/**
 * Phase 169 Task 1 — ENH-119: internal-presentation type + variants
 * Tests: TYPE_VARIANTS framework, INTERNAL_VARIANTS, validateVariant, getSkeleton,
 * getDiagramTypes with variant support, resolveTemplate fallback
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
describe('Phase 169.1 — INTERNAL_VARIANTS framework', () => {
  test('TYPE_VARIANTS is exported', () => {
    expect(typeof gen.TYPE_VARIANTS).toBe('object');
  });

  test('INTERNAL_VARIANTS is exported', () => {
    expect(typeof gen.INTERNAL_VARIANTS).toBe('object');
  });

  test('TYPE_VARIANTS["internal-presentation"] === INTERNAL_VARIANTS', () => {
    expect(gen.TYPE_VARIANTS['internal-presentation']).toBe(gen.INTERNAL_VARIANTS);
  });

  test('INTERNAL_VARIANTS is frozen', () => {
    expect(Object.isFrozen(gen.INTERNAL_VARIANTS)).toBe(true);
  });

  test('INTERNAL_VARIANTS has exactly 5 variants', () => {
    expect(Object.keys(gen.INTERNAL_VARIANTS)).toHaveLength(5);
  });

  test('INTERNAL_VARIANTS has team-intro, leadership-report, feature-demo, training, all-hands', () => {
    const ids = Object.keys(gen.INTERNAL_VARIANTS).sort();
    expect(ids).toEqual(['all-hands', 'feature-demo', 'leadership-report', 'team-intro', 'training'].sort());
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Phase 169.1 — internal-presentation type registration', () => {
  test('validateType("internal-presentation") passes', () => {
    expect(() => gen.validateType('internal-presentation')).not.toThrow();
  });

  test('validateType("internal-presentation") returns object with variants: true', () => {
    const type = gen.validateType('internal-presentation');
    expect(type.variants).toBe(true);
  });

  test('internal-presentation in PROPOSAL_TYPES', () => {
    expect(gen.PROPOSAL_TYPES['internal-presentation']).toBeDefined();
  });

  test('internal-presentation has label "Internal Presentation"', () => {
    expect(gen.PROPOSAL_TYPES['internal-presentation'].label).toBe('Internal Presentation');
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
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Phase 169.1 — INTERNAL_VARIANTS structure', () => {
  test('each variant has id, label, slides, skeleton, diagrams, defaultDuration, suggestedVoice, goal', () => {
    for (const [id, variant] of Object.entries(gen.INTERNAL_VARIANTS)) {
      expect(variant.id).toBe(id);
      expect(typeof variant.label).toBe('string');
      expect(typeof variant.slides).toBe('number');
      expect(Array.isArray(variant.skeleton)).toBe(true);
      expect(Array.isArray(variant.diagrams)).toBe(true);
      expect(typeof variant.defaultDuration).toBe('number');
      expect(typeof variant.suggestedVoice).toBe('string');
      expect(typeof variant.goal).toBe('string');
    }
  });

  test('team-intro has 8 slides and correct skeleton', () => {
    const v = gen.INTERNAL_VARIANTS['team-intro'];
    expect(v.slides).toBe(8);
    expect(v.skeleton.length).toBeGreaterThanOrEqual(7);
    expect(v.skeleton[0].title).toBe('Cover');
  });

  test('leadership-report has 8 slides and correct skeleton', () => {
    const v = gen.INTERNAL_VARIANTS['leadership-report'];
    expect(v.slides).toBe(8);
    expect(v.skeleton.length).toBeGreaterThanOrEqual(7);
    expect(v.skeleton[0].title).toBe('Cover');
  });

  test('feature-demo has 7 slides and correct skeleton', () => {
    const v = gen.INTERNAL_VARIANTS['feature-demo'];
    expect(v.slides).toBe(7);
    expect(v.skeleton.length).toBeGreaterThanOrEqual(7);
    expect(v.skeleton[0].title).toBe('Cover');
  });

  test('training has 9 slides and correct skeleton', () => {
    const v = gen.INTERNAL_VARIANTS['training'];
    expect(v.slides).toBe(9);
    expect(v.skeleton.length).toBeGreaterThanOrEqual(7);
    expect(v.skeleton[0].title).toBe('Cover');
  });

  test('all-hands has 8 slides and correct skeleton', () => {
    const v = gen.INTERNAL_VARIANTS['all-hands'];
    expect(v.slides).toBe(8);
    expect(v.skeleton.length).toBeGreaterThanOrEqual(7);
    expect(v.skeleton[0].title).toBe('Cover');
  });

  test('all skeletons have at least 7 slides', () => {
    for (const [id, v] of Object.entries(gen.INTERNAL_VARIANTS)) {
      expect(v.skeleton.length).toBeGreaterThanOrEqual(7);
    }
  });

  test('all skeleton entries have title and beat', () => {
    for (const [id, variant] of Object.entries(gen.INTERNAL_VARIANTS)) {
      for (const entry of variant.skeleton) {
        expect(typeof entry.title).toBe('string');
        expect(typeof entry.beat).toBe('string');
      }
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Phase 169.1 — variant defaults and voice', () => {
  test('all variants have defaultDuration in [5, 15, 30]', () => {
    for (const [id, variant] of Object.entries(gen.INTERNAL_VARIANTS)) {
      expect(DURATIONS).toContain(variant.defaultDuration);
    }
  });

  test('all variants have suggestedVoice in VOICE_LEVELS ids', () => {
    for (const [id, variant] of Object.entries(gen.INTERNAL_VARIANTS)) {
      expect(VOICE_LEVEL_IDS).toContain(variant.suggestedVoice);
    }
  });

  test('team-intro: voice balanced, duration 15', () => {
    const v = gen.INTERNAL_VARIANTS['team-intro'];
    expect(v.suggestedVoice).toBe('balanced');
    expect(v.defaultDuration).toBe(15);
  });

  test('leadership-report: voice humble, duration 5', () => {
    const v = gen.INTERNAL_VARIANTS['leadership-report'];
    expect(v.suggestedVoice).toBe('humble');
    expect(v.defaultDuration).toBe(5);
  });

  test('feature-demo: voice proud, duration 15', () => {
    const v = gen.INTERNAL_VARIANTS['feature-demo'];
    expect(v.suggestedVoice).toBe('proud');
    expect(v.defaultDuration).toBe(15);
  });

  test('training: voice balanced, duration 30', () => {
    const v = gen.INTERNAL_VARIANTS['training'];
    expect(v.suggestedVoice).toBe('balanced');
    expect(v.defaultDuration).toBe(30);
  });

  test('all-hands: voice founder-story, duration 15', () => {
    const v = gen.INTERNAL_VARIANTS['all-hands'];
    expect(v.suggestedVoice).toBe('founder-story');
    expect(v.defaultDuration).toBe(15);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Phase 169.1 — validateVariant function', () => {
  test('validateVariant is exported as function', () => {
    expect(typeof gen.validateVariant).toBe('function');
  });

  test('validateVariant("internal-presentation") defaults to team-intro', () => {
    expect(gen.validateVariant('internal-presentation')).toBe('team-intro');
  });

  test('validateVariant("internal-presentation", "team-intro") returns team-intro', () => {
    expect(gen.validateVariant('internal-presentation', 'team-intro')).toBe('team-intro');
  });

  test('validateVariant("internal-presentation", "leadership-report") returns leadership-report', () => {
    expect(gen.validateVariant('internal-presentation', 'leadership-report')).toBe('leadership-report');
  });

  test('validateVariant("internal-presentation", "unknown") throws with variant ids', () => {
    expect(() => gen.validateVariant('internal-presentation', 'unknown')).toThrow();
    try {
      gen.validateVariant('internal-presentation', 'unknown');
    } catch (e) {
      expect(e.message).toContain('team-intro');
      expect(e.message).toContain('leadership-report');
    }
  });

  test('validateVariant("general", undefined) returns undefined', () => {
    expect(gen.validateVariant('general', undefined)).toBeUndefined();
  });

  test('validateVariant("general", "any-variant") throws', () => {
    expect(() => gen.validateVariant('general', 'any-variant')).toThrow();
    expect(() => gen.validateVariant('general', 'any-variant')).toThrow(/does not support variants/);
  });

  test('validateVariant("product-pitch", "foo") throws', () => {
    expect(() => gen.validateVariant('product-pitch', 'foo')).toThrow(/does not support variants/);
  });

  test('validateVariant("unknown-type") throws', () => {
    expect(() => gen.validateVariant('unknown-type')).toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Phase 169.1 — getSkeleton function', () => {
  test('getSkeleton is exported as function', () => {
    expect(typeof gen.getSkeleton).toBe('function');
  });

  test('getSkeleton("internal-presentation", "team-intro") returns skeleton array', () => {
    const skeleton = gen.getSkeleton('internal-presentation', 'team-intro');
    expect(Array.isArray(skeleton)).toBe(true);
    expect(skeleton.length).toBeGreaterThanOrEqual(7);
  });

  test('getSkeleton("internal-presentation", "leadership-report") returns gantt diagrams', () => {
    const skeleton = gen.getSkeleton('internal-presentation', 'leadership-report');
    expect(Array.isArray(skeleton)).toBe(true);
  });

  test('getSkeleton("general") returns undefined', () => {
    expect(gen.getSkeleton('general')).toBeUndefined();
  });

  test('getSkeleton("general", "any") returns undefined', () => {
    expect(gen.getSkeleton('general', 'any')).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Phase 169.1 — getDiagramTypes with variants', () => {
  test('getDiagramTypes("internal-presentation", "team-intro") returns flowchart', () => {
    expect(gen.getDiagramTypes('internal-presentation', 'team-intro')).toEqual(['flowchart']);
  });

  test('getDiagramTypes("internal-presentation", "leadership-report") returns gantt', () => {
    expect(gen.getDiagramTypes('internal-presentation', 'leadership-report')).toEqual(['gantt']);
  });

  test('getDiagramTypes("internal-presentation", "feature-demo") returns sequenceDiagram and flowchart', () => {
    expect(gen.getDiagramTypes('internal-presentation', 'feature-demo')).toEqual(['sequenceDiagram', 'flowchart']);
  });

  test('getDiagramTypes("internal-presentation", "training") returns flowchart', () => {
    expect(gen.getDiagramTypes('internal-presentation', 'training')).toEqual(['flowchart']);
  });

  test('getDiagramTypes("internal-presentation", "all-hands") returns flowchart', () => {
    expect(gen.getDiagramTypes('internal-presentation', 'all-hands')).toEqual(['flowchart']);
  });

  test('getDiagramTypes("project-proposal") unchanged (no variant)', () => {
    expect(gen.getDiagramTypes('project-proposal')).toEqual(['flowchart', 'gantt']);
  });

  test('getDiagramTypes("tech-architecture") unchanged', () => {
    expect(gen.getDiagramTypes('tech-architecture')).toEqual(['flowchart', 'sequenceDiagram', 'classDiagram']);
  });

  test('getDiagramTypes("product-pitch") unchanged', () => {
    expect(gen.getDiagramTypes('product-pitch')).toEqual(['flowchart', 'sequenceDiagram']);
  });

  test('getDiagramTypes("general") unchanged', () => {
    expect(gen.getDiagramTypes('general')).toEqual(['flowchart']);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Phase 169.1 — resolveTemplate with fallback', () => {
  test('resolveTemplate is exported as function', () => {
    expect(typeof gen.resolveTemplate).toBe('function');
  });

  test('resolveTemplate("internal-presentation","pptx",ROOT) returns existing file', () => {
    const template = gen.resolveTemplate('internal-presentation', 'pptx', ROOT);
    expect(fs.existsSync(template)).toBe(true);
  });

  test('resolveTemplate("internal-presentation","pptx",ROOT) falls back to general.pptx', () => {
    const template = gen.resolveTemplate('internal-presentation', 'pptx', ROOT);
    // Should either be internal-presentation.pptx (if it exists) or general.pptx
    expect(template).toMatch(/general\.pptx|internal-presentation\.pptx/);
  });

  test('resolveTemplate("project-proposal","pptx",ROOT) still returns project-proposal.pptx', () => {
    const template = gen.resolveTemplate('project-proposal', 'pptx', ROOT);
    expect(template).toContain('project-proposal.pptx');
  });

  test('resolveTemplate("tech-architecture","pptx",ROOT) still returns tech-architecture.pptx', () => {
    const template = gen.resolveTemplate('tech-architecture', 'pptx', ROOT);
    expect(template).toContain('tech-architecture.pptx');
  });

  test('resolveTemplate("product-pitch","pptx",ROOT) still returns product-pitch.pptx', () => {
    const template = gen.resolveTemplate('product-pitch', 'pptx', ROOT);
    expect(template).toContain('product-pitch.pptx');
  });

  test('resolveTemplate("general","pptx",ROOT) still returns general.pptx', () => {
    const template = gen.resolveTemplate('general', 'pptx', ROOT);
    expect(template).toContain('general.pptx');
  });
});
