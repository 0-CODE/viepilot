'use strict';

const script = require('../../lib/proposal-script.cjs');
const sim = require('../../lib/proposal-simulation.cjs');

const notes = (n) => Array.from({ length: n }, (_, i) => `Câu nói số ${i + 1} của slide này.`).join('\n');
const DECK = {
  title: 'Demo', qaSec: 180,
  audienceProfile: { roles: [{ id: 'engineering', weight: 'primary' }], size: 'medium', format: 'in-person' },
  slides: [1, 2, 3, 4, 5, 6].map((i) => ({ index: i, heading: `S${i}`, speakerNotes: notes(8), ...(i === 4 ? { fixedSec: 240, fixedLabel: 'demo trực tiếp' } : {}) })),
};

describe('BUG-035 G5 — fixed demo and Q&A blocks', () => {
  test('planDuration takes fixed blocks off the target before spreading spoken time', () => {
    const plan = script.planDuration(DECK.slides, 15, { qaSec: 180 });
    const spoken = plan.reduce((a, p) => a + p.seconds, 0);
    expect(plan[3].fixedSec).toBe(240);
    expect(Math.abs(spoken - (900 - 240 - 180))).toBeLessThanOrEqual(900 * 0.1);
  });

  test('without fixed blocks the old behaviour is unchanged', () => {
    const a = script.planDuration(DECK.slides.map(({ fixedSec, ...s }) => s), 15);
    expect(a.every((p) => p.fixedSec === 0)).toBe(true);
  });

  test('timeline inserts demo and Q&A segments; totals include them', () => {
    const tl = sim.buildTimeline(DECK, { durationMin: 15, lang: 'vi' });
    const fixed = tl.segments.filter((s) => s.fixed);
    expect(fixed.map((s) => s.cue)).toEqual(['fixed', 'qa']);
    expect(fixed[0].tEnd - fixed[0].tStart).toBeCloseTo(240, 0);
    expect(tl.plannedTotalSec).toBeGreaterThanOrEqual(900 - 900 * 0.1);
    expect(tl.totalSec).toBeGreaterThan(240 + 180);
  });

  test('script header and Q&A are never empty', () => {
    const md = script.buildScriptMarkdown(DECK, { minutes: 15, expectedQuestions: ['Tốn thêm bao nhiêu thời gian?'] });
    expect(md).toMatch(/\*\*Audience:\*\* engineering · medium · in-person/);
    expect(md).toMatch(/\+ demo trực tiếp 04:00/);
    expect(md).toMatch(/Expected Q&A \(03:00\)/);
    expect(md).toMatch(/Q1\. Tốn thêm bao nhiêu thời gian\?/);
  });
});
