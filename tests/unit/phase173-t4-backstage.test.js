'use strict';

const review = require('../../lib/proposal-review.cjs');
const cur = require('../../lib/proposal-curation.cjs');
const gen = require('../../lib/proposal-generator.cjs');

describe('Phase 173.4 — Backstage Editor (#31)', () => {
  test('card parses as an observer; #20 stays the only always-on reviewer', () => {
    const personas = review.loadPersonas();
    const p31 = personas.find((p) => p.id === review.BACKSTAGE_ID);
    expect(p31).toMatchObject({ scope: 'always', observer: true });
    expect(personas.filter((p) => p.always).map((p) => p.id)).toEqual([20]);
  });

  test('every council includes #31 as an observer, never among the 6–8 reviewers', () => {
    const combos = [['product-pitch'], ['general'], ['project-proposal'], ['tech-architecture'],
      ...Object.entries(gen.TYPE_VARIANTS).flatMap(([t, vs]) => Object.keys(vs).map((v) => [t, v]))];
    for (const [type, variant] of combos) {
      for (const mode of ['quick', 'full', 'off']) {
        const c = review.selectCouncil({ type, variant, mode });
        expect(c.observers).toEqual([31]);
        expect(c.reviewers).not.toContain(31);
        if (mode === 'quick') {
          expect(c.reviewers.length).toBeGreaterThanOrEqual(6);
          expect(c.reviewers.length).toBeLessThanOrEqual(8);
          expect(c.reviewers).toContain(20);
        }
      }
    }
  });

  test('new blockers apply to every type', () => {
    for (const t of ['general', 'product-pitch', 'research-proposal', 'internal-presentation']) {
      expect(review.getBlockers(t)).toEqual(expect.arrayContaining(['process-log-instead-of-proposal', 'material-risk-hidden']));
    }
  });
});

describe('Phase 173.4 — backstage.md', () => {
  const decisions = [
    { slide: 4, quote: 'Tính năng export chưa làm', action: 'backstage', owner: 'Lan', due: '2026-12-01', reason: 'not needed for the decision' },
    { slide: 5, quote: 'Ngân sách có thể vượt 20%', action: 'reframe', material: true, reframedAs: 'Risk: a 20% overrun — mitigation: phased release — ask: approve a 10% reserve' },
    { slide: 6, quote: 'Tạm thời dùng workaround', action: 'fix', reason: 'replace before the demo' },
    { slide: 7, quote: 'Old internal tooling notes', action: 'remove', reason: 'irrelevant to clients' },
    { slide: 4, quote: 'Export', action: 'backstage', question: 'When will export be ready?', preparedAnswer: 'In the January release; a CSV workaround exists today.' },
  ];

  test('groups tough questions, open items, reframes, fixes and removals; presenter-only banner', () => {
    const md = cur.buildBackstage(decisions, { title: 'CRM rollout' });
    expect(md).toMatch(/^# Backstage — CRM rollout/);
    expect(md).toMatch(/Presenter only/);
    expect(md).toMatch(/When will export be ready\?[\s\S]*Prepared answer: In the January release/);
    expect(md).toMatch(/Slide 4: Tính năng export chưa làm — owner: Lan, due: 2026-12-01/);
    expect(md).toMatch(/material risk: risk → mitigation → ask/);
    expect(md).toMatch(/## To fix before presenting[\s\S]*Tạm thời dùng workaround/);
    expect(md).toMatch(/## Removed[\s\S]*Old internal tooling notes — irrelevant to clients/);
  });

  test('anything moved backstage or removed must not reappear in slides, notes or script', () => {
    const manifest = { slides: [
      { index: 4, heading: 'Roadmap', bullets: ['Export arrives in January'] },
      { index: 7, heading: 'Team', bullets: ['ok'], speakerNotes: 'Remember the old internal tooling notes here' },
    ] };
    const r = cur.findBackstageLeaks(decisions, manifest, { lines: [{ slide: 4, text: 'Tính năng export chưa làm, nhưng…' }] });
    expect(r.ok).toBe(false);
    expect(r.leaks.map((l) => [l.slide, l.location])).toEqual([[7, 'notes'], [4, 'script']]);
    expect(cur.findBackstageLeaks(decisions, { slides: [manifest.slides[0]] }).ok).toBe(true);
  });
});
