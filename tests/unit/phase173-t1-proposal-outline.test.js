'use strict';

const outline = require('../../lib/proposal-outline.cjs');
const gen = require('../../lib/proposal-generator.cjs');

const COMBOS = [
  ...Object.keys(outline.BASE_SKELETONS).map((t) => [t, null]),
  ...Object.entries(gen.TYPE_VARIANTS).flatMap(([t, vs]) => Object.keys(vs).map((v) => [t, v])),
];

describe('Phase 173.1 — outline builder', () => {
  test('covers every type and variant', () => {
    expect(COMBOS.length).toBeGreaterThanOrEqual(14);
  });

  test.each(COMBOS)('%s / %s → valid outline whose time budgets sum to the duration', (type, variant) => {
    for (const durationMin of [5, 15, 30]) {
      const o = outline.buildOutline({ type, variant, keyMessage: 'We cut onboarding time in half for your team.', durationMin });
      expect(outline.validateOutline(o)).toEqual({ ok: true, problems: [] });
      expect(o.slides.reduce((a, s) => a + s.timeBudgetSec, 0)).toBe(durationMin * 60);
      for (const s of o.slides) {
        expect(outline.BEATS).toContain(s.beat);
        expect(outline.EVIDENCE).toContain(s.evidenceNeeded);
        expect(s.job.length).toBeGreaterThan(5);
      }
    }
  });

  test('overrides from the outline gate replace defaults per slide', () => {
    const o = outline.buildOutline({ type: 'general', keyMessage: 'One sentence.', durationMin: 15, overrides: [{}, { job: 'agree the problem is real', evidenceNeeded: 'quote' }] });
    expect(o.slides[1]).toMatchObject({ job: 'agree the problem is real', evidenceNeeded: 'quote' });
  });

  test('validation rejects bad outlines with readable reasons', () => {
    const r = outline.validateOutline({ keyMessage: 'Two. Sentences.', durationMin: 5, slides: [{ n: 1, title: '', beat: 'x', job: '', evidenceNeeded: 'y', timeBudgetSec: 0 }] });
    expect(r.ok).toBe(false);
    for (const p of ['one sentence', 'title missing', 'unknown beat', 'job missing', 'evidence must be one of', 'time budget', 'no invitation']) {
      expect(r.problems.join(' | ')).toContain(p);
    }
  });

  test('formatOutline shows the key message and one row per slide', () => {
    const o = outline.buildOutline({ type: 'product-pitch', keyMessage: 'Teams ship twice as fast.', durationMin: 15 });
    const md = outline.formatOutline(o);
    expect(md).toMatch(/^\*\*Key message:\*\* Teams ship twice as fast\./);
    expect((md.match(/^\| \d+ \|/gm) || []).length).toBe(o.slides.length);
  });

  test('unknown type throws', () => {
    expect(() => outline.buildOutline({ type: 'nope', keyMessage: 'x.', durationMin: 5 })).toThrow(/No skeleton/);
  });
});
