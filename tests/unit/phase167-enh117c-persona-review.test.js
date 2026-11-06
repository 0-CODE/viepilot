'use strict';
const fs = require('fs');
const path = require('path');
const pr = require('../../lib/proposal-review.cjs');

const ROOT = path.join(__dirname, '..', '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const CODES = ['H1', 'H2', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8'];
const arr = v => (Array.isArray(v) ? v : [v]);

function mkRaw(personaId, scoreOver = {}, extra = {}, base = 5) {
  const scores = {};
  const evidence = {};
  for (const c of CODES) {
    scores[c] = c in scoreOver ? scoreOver[c] : base;
    evidence[c] = [{ slide: 1, quote: 'a real line', note: 'n' }];
  }
  return { personaId, scores, evidence, keep: [], improve: [], blockers: [], keyMessage: 'km', ...extra };
}
const mk = (...a) => pr.parseReview(mkRaw(...a)).review;

describe('persona library', () => {
  const personas = pr.loadPersonas();
  test('20 unique personas, one always:true (id 20)', () => {
    expect(personas).toHaveLength(20);
    expect(new Set(personas.map(p => p.id)).size).toBe(20);
    const always = personas.filter(p => p.always);
    expect(always).toHaveLength(1);
    expect(always[0].id).toBe(20);
  });
  test('every card has required fields and distinct cares_about', () => {
    const seen = new Set();
    for (const p of personas) {
      for (const f of ['cares_about', 'loses_patience_when', 'will_ask', 'strictness']) {
        expect(arr(p[f]).join('').trim()).not.toBe('');
      }
      for (const line of arr(p.cares_about)) {
        expect(seen.has(line)).toBe(false);
        seen.add(line);
      }
    }
  });
});

describe('selectPersonas', () => {
  test('quick: 6-8 ids incl. 20 for each type', () => {
    for (const type of ['product-pitch', 'tech-architecture', 'project-proposal', 'general']) {
      const ids = pr.selectPersonas({ type, mode: 'quick' });
      expect(ids.length).toBeGreaterThanOrEqual(6);
      expect(ids.length).toBeLessThanOrEqual(8);
      expect(ids).toContain(20);
    }
  });
  test('full -> 20 ids, off -> [20]', () => {
    expect(pr.selectPersonas({ type: 'general', mode: 'full' })).toHaveLength(20);
    expect(pr.selectPersonas({ type: 'general', mode: 'off' })).toEqual([20]);
  });
  test('remove cannot drop 20', () => {
    expect(pr.selectPersonas({ type: 'general', remove: [20] })).toContain(20);
  });
  test('decisionMaker keywords swap in 2 and 5 within cap; add stays capped', () => {
    const ids = pr.selectPersonas({ type: 'general', decisionMaker: 'CFO and investors' });
    expect(ids).toEqual(expect.arrayContaining([2, 5, 20]));
    expect(ids.length).toBeLessThanOrEqual(8);
    const added = pr.selectPersonas({ type: 'general', add: [2, 3, 4, 5, 6, 8, 10, 11, 12] });
    expect(added.length).toBeLessThanOrEqual(8);
    expect(added).toContain(20);
  });
});

describe('rubric and gate', () => {
  test('RUBRIC codes, thresholds, blockers', () => {
    expect(pr.RUBRIC.map(r => r.code)).toEqual(CODES);
    const th = Object.fromEntries(pr.RUBRIC.map(r => [r.code, r.threshold]));
    expect(th).toEqual({ H1: 4, H2: 4, C1: 4, C2: 3.5, C3: 4, C4: 3.5, C5: 4, C6: 4, C7: 3.5, C8: 3.5 });
    expect(pr.RUBRIC[0].minAny).toBe(3);
    expect(pr.BLOCKERS).toEqual(['false-claim', 'fabricated-anecdote', 'overreaching-legal-security-promise', 'slide-without-script', 'slide-without-animation']);
  });
  test('gate: all 5 passes', () => {
    expect(pr.evaluateGate([mk(1, {}), mk(20, {})]).pass).toBe(true);
  });
  test('gate: H1 avg >= 4 but one persona at 2 fails', () => {
    const g = pr.evaluateGate([mk(1, {}), mk(2, {}), mk(3, {}), mk(20, { H1: 2 })]);
    const h1 = g.perCriterion.find(c => c.code === 'H1');
    expect(h1.avg).toBeGreaterThanOrEqual(4);
    expect(g.pass).toBe(false);
    expect(g.failing).toContain('H1');
  });
  test('gate: blocker fails even with all 5; missing criterion fails', () => {
    const b = mk(1, {}, { blockers: ['false-claim'] });
    const g = pr.evaluateGate([b, mk(20, {})]);
    expect(g.pass).toBe(false);
    expect(g.blockers).toHaveLength(1);
    const noC8 = mkRaw(1); delete noC8.scores.C8;
    expect(pr.evaluateGate([pr.parseReview(noC8).review]).pass).toBe(false);
  });
});

describe('parseReview', () => {
  test('returns {review, dropped, log}; drops unevidenced score', () => {
    const raw = mkRaw(3);
    raw.evidence.C3 = [];
    const out = pr.parseReview(raw);
    expect(Object.keys(out).sort()).toEqual(['dropped', 'log', 'review']);
    expect(out.dropped).toContain('C3');
    expect(out.review.scores.C3).toBeUndefined();
    expect(out.log.length).toBeGreaterThan(0);
  });
  test('drops keep w/o quote, improve w/o problem, unknown blockers', () => {
    const out = pr.parseReview(mkRaw(3, {}, {
      keep: [{ slide: 1, criterion: 'H1' }, { slide: 2, criterion: 'H1', quote: 'ok' }],
      improve: [{ slide: 1, criterion: 'C3' }, { slide: 2, criterion: 'C3', problem: 'p' }],
      blockers: ['made-up', 'false-claim'],
    }));
    expect(out.review.keep).toHaveLength(1);
    expect(out.review.improve).toHaveLength(1);
    expect(out.review.blockers).toEqual(['false-claim']);
  });
});

describe('synthesizeFeedback', () => {
  const keepE = (slide, criterion) => ({ slide, criterion, quote: 'q' });
  const impE = (slide, criterion) => ({ slide, criterion, problem: 'bad', suggestion: 'fix' });
  test('keep needs >= 2 personas; primary weight x2', () => {
    const r = [mk(1, {}, { keep: [keepE(2, 'C1')] }), mk(2, {}, { keep: [keepE(2, 'C1'), keepE(4, 'C3')] }), mk(5, {}, { keep: [] })];
    const s = pr.synthesizeFeedback(r, { primaryPersonaIds: [1] });
    expect(s.keep).toHaveLength(1);
    expect(s.keep[0].slide).toBe(2);
    expect(s.keep[0].weight).toBe(3);
  });
  test('persona 20 H1/H2 improve never rejected despite 2 primary keeps', () => {
    const r = [
      mk(1, {}, { keep: [keepE(3, 'H1')] }),
      mk(2, {}, { keep: [keepE(3, 'H1')] }),
      mk(20, {}, { improve: [impE(3, 'H1')] }),
    ];
    const s = pr.synthesizeFeedback(r, { primaryPersonaIds: [1, 2] });
    expect(s.reject.find(x => x.slide === 3 && x.criterion === 'H1')).toBeUndefined();
    const imp = s.improve.find(x => x.slide === 3 && x.criterion === 'H1');
    expect(imp).toBeDefined();
    expect(imp.reason.toLowerCase()).toContain('veto');
  });
  test('lone non-primary improve against primary keep is rejected with reason; entries complete', () => {
    const r = [
      mk(1, {}, { keep: [keepE(4, 'C4')] }),
      mk(9, {}, { improve: [impE(4, 'C4')] }),
      mk(2, {}, { improve: [impE(6, 'C5')] }),
    ];
    const s = pr.synthesizeFeedback(r, { primaryPersonaIds: [1, 2] });
    const rej = s.reject.find(x => x.slide === 4);
    expect(rej).toBeDefined();
    expect(rej.reason).toBeTruthy();
    for (const e of [...s.keep, ...s.improve, ...s.reject]) {
      for (const k of ['slide', 'criterion', 'sources', 'weight', 'reason']) expect(e[k]).toBeDefined();
    }
    expect(s.improve.find(x => x.slide === 6)).toBeDefined();
  });
});

describe('buildReviewReport', () => {
  test('sections present', () => {
    const reviews = [mk(1, {}), mk(20, { H1: 2 })];
    const gate = pr.evaluateGate(reviews);
    const decisions = pr.synthesizeFeedback([mk(1, {}, { improve: [{ slide: 3, criterion: 'H1', problem: 'stiff' }] })], {});
    const rep = pr.buildReviewReport({ rounds: [{ reviews }], decisions, gate });
    for (const s of ['Avg', 'Threshold', 'Result', 'Keep', 'Improve', 'Reject', 'Open issues']) expect(rep).toContain(s);
  });
});

describe('end-to-end fixture', () => {
  test('round 1 fails -> synthesize -> round 2 passes; report has both rounds', () => {
    const r1 = [
      mk(1, {}, { improve: [] }),
      mk(2, {}),
      mk(20, { H1: 2 }, { improve: [{ slide: 3, criterion: 'H1', problem: 'brochure tone', suggestion: 'say it plainly' }] }),
    ];
    const g1 = pr.evaluateGate(r1);
    expect(g1.pass).toBe(false);
    const d1 = pr.synthesizeFeedback(r1, { primaryPersonaIds: [1, 2] });
    expect(d1.improve.some(i => i.slide === 3 && i.sources.includes(20))).toBe(true);
    const r2 = [mk(1, {}, {}, 4), mk(2, {}, {}, 4), mk(20, { H1: 4 }, {}, 4)];
    const g2 = pr.evaluateGate(r2);
    expect(g2.pass).toBe(true);
    const rep = pr.buildReviewReport({
      rounds: [{ reviews: r1, gate: g1, decisions: d1 }, { reviews: r2, gate: g2, decisions: { keep: [], improve: [], reject: [] } }],
    });
    expect(rep).toContain('Round 1');
    expect(rep).toContain('Round 2');
  });
});

describe('templates and docs', () => {
  test('persona-review-prompt.md placeholders and schema keys', () => {
    const t = read('templates/proposal/persona-review-prompt.md');
    for (const p of ['{persona_card}', '{rubric}', '{voice_level}', '{manifest_json}', '{script_md}', '{lang}']) expect(t).toContain(p);
    for (const k of ['personaId', 'scores', 'evidence', 'keep', 'improve', 'blockers', 'keyMessage']) expect(t).toContain(`"${k}"`);
  });
  test('review-personas.md has mapping, keywords, rubric', () => {
    const t = read('templates/proposal/review-personas.md');
    for (const h of ['## Audience Mapping', '## Audience Keywords', '## Rubric']) expect(t).toContain(h);
  });
  test('workflows/proposal.md documents council step', () => {
    const t = read('workflows/proposal.md');
    expect(t).toContain('Step 8b: Persona Review Council');
    expect(t).toContain('2 rounds');
    expect(t.toLowerCase()).toContain('humanity veto');
    expect(t).toContain('Accept current version');
    expect(t).toContain('Sounds like me');
  });
  test('vp-proposal SKILL documents --review and off still runs Humanity editor', () => {
    const t = read('skills/vp-proposal/SKILL.md');
    expect(t).toContain('--review');
    expect(t).toMatch(/off[\s\S]{0,120}Humanity editor/);
  });
});
