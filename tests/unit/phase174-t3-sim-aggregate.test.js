'use strict';

const sim = require('../../lib/proposal-simulation.cjs');
const { aggregate } = require('../../lib/proposal-sim-aggregate.cjs');

const MANIFEST = { slides: [
  { index: 1, heading: 'Cover', beat: 'context', speakerNotes: 'Chào mọi người.' },
  { index: 2, heading: 'Architecture', beat: 'solution', bullets: ['CQRS/ES via Kafka', 'gRPC + OAuth2 + mTLS', 'API GW K8s HPA'], speakerNotes: 'Chúng ta dùng CQRS với event sourcing qua Kafka.' },
  { index: 3, heading: 'Ask', beat: 'invitation', speakerNotes: 'Mình đề nghị duyệt thí điểm ba tháng.' },
] };
const TL = sim.buildTimeline(MANIFEST, { lang: 'vi', durationMin: 5 });
const L = [
  sim.parseListener({ personaId: 2, states: [
    { seg: 0, attention: 90, comprehension: 90, emotion: 1, funnelStage: 'aware' },
    { seg: 1, attention: 30, comprehension: 30, emotion: -1, line: 'event sourcing', objection: 'Bảo trì cụm Kafka tốn kém', funnelStage: 'aware' },
    { seg: 2, attention: 70, comprehension: 80, emotion: 1, funnelStage: 'agree' },
  ], tuneOut: { seg: 1, reason: 'jargon', line: 'CQRS với event sourcing' }, regainedAt: 2, recall24h: ['thí điểm ba tháng'], verdict: { wouldAct: false, quote: 'cần rõ chi phí' },
  evaluation: { improve: [{ slide: 2, suggestion: 'Explain in business terms' }], scores: { H1: 3, C2: 2 } } }, TL).listener,
  sim.parseListener({ personaId: 20, states: [
    { seg: 0, attention: 80, comprehension: 85, emotion: 0 }, { seg: 1, attention: 75, comprehension: 70, emotion: 0 }, { seg: 2, attention: 85, comprehension: 90, emotion: 2, funnelStage: 'act' },
  ], recall24h: ['thí điểm ba tháng'], verdict: { wouldAct: true, quote: 'ok' }, evaluation: { scores: { H1: 5, C2: 4 } } }, TL).listener,
];
const A = aggregate({ timeline: TL, listeners: L, manifest: MANIFEST, primary: [2], keyMessages: ['Duyệt thí điểm ba tháng'], keywords: ['thí điểm', 'Kafka'] });

describe('Phase 174.3 — requested outputs', () => {
  test('evaluations per persona with verdict, stage, tune-out time and recall', () => {
    expect(A.evaluations.map((e) => [e.personaId, e.wouldAct, e.stage])).toEqual([[2, false, 'agree'], [20, true, 'act']]);
    expect(A.evaluations[0]).toMatchObject({ primary: true, tunedOutAt: TL.segments[1].tStart });
  });

  test('improvements ranked by weighted attention loss with causes and suggestions', () => {
    expect(A.improvements[0]).toMatchObject({ slide: 2 });
    expect(A.improvements[0].reasons).toEqual(expect.arrayContaining(['tune-out: jargon', 'confusion (jargon)']));
    expect(A.improvements[0].suggestions).toContain('Explain in business terms');
    expect(A.improvements.find((i) => i.slide === 1)).toBeUndefined(); // no loss before the first state
  });

  test('tune-out moments carry slide, time, reason and quote', () => {
    expect(A.tuneOuts).toEqual([expect.objectContaining({ personaId: 2, slide: 2, reason: 'jargon', line: 'CQRS với event sourcing', regainedAt: 2, primary: true })]);
  });

  test('retention curve: all and decision-maker weighted', () => {
    expect(A.retention.map((r) => r.pct)).toEqual([100, 50, 100]);
    expect(A.retention[1].weightedPct).toBeLessThan(A.retention[1].pct);
  });

  test('keyword and criteria effectiveness', () => {
    expect(A.keywords.find((k) => k.keyword === 'thí điểm')).toMatchObject({ mentions: 1, slides: [3], recallRate: 100 });
    expect(A.keywords.find((k) => k.keyword === 'Kafka')).toMatchObject({ recallRate: 0 });
    expect(A.keywords.find((k) => k.keyword === 'Kafka').association).toBeLessThan(0);
    expect(A.criteriaByGroup.all).toEqual({ H1: 4, C2: 3 });
  });
});

describe('Phase 174.3 — chart groups', () => {
  test('attention & cognition: heatmap, load, confusion with cause', () => {
    expect(A.heatmap.find((h) => h.personaId === 2).bySlide).toEqual({ 1: 90, 2: 30, 3: 70 });
    expect(A.load.find((l) => l.slide === 2).score).toBeGreaterThan(A.load.find((l) => l.slide === 3).score);
    expect(A.confusion).toEqual([expect.objectContaining({ slide: 2, cause: 'jargon' })]);
  });

  test('emotion & persuasion: arc gap against the intended beat; cumulative funnel', () => {
    expect(A.emotionArc.find((e) => e.slide === 2)).toMatchObject({ beat: 'solution', intended: 1, actual: -0.5, gap: -1.5 });
    expect(A.funnel).toEqual([{ stage: 'aware', count: 2 }, { stage: 'understand', count: 2 }, { stage: 'agree', count: 2 }, { stage: 'act', count: 1 }]);
  });

  test('questions & pacing: objection map with answered flag; planned vs spoken', () => {
    expect(A.questions).toEqual([expect.objectContaining({ kind: 'objection', slide: 2, answered: false })]);
    expect(A.summary.unansweredObjections).toBe(1);
    expect(A.pacing).toHaveLength(3);
    expect(A.pacing[0]).toHaveProperty('plannedSec');
  });

  test('recall & comparison: key-message recall and run-over-run deltas', () => {
    expect(A.recall[0]).toMatchObject({ rate: 100 });
    expect(A.deltas).toBeNull();
    const B = aggregate({ timeline: TL, listeners: L, manifest: MANIFEST, primary: [2], keyMessages: ['Duyệt thí điểm ba tháng'], previous: { summary: { ...A.summary, avgRetention: 40, tuneOuts: 3 } } });
    expect(B.deltas.avgRetention).toBeCloseTo(A.summary.avgRetention - 40, 1);
    expect(B.deltas.tuneOuts).toBe(-2);
  });
});
