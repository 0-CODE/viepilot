'use strict';

const sim = require('../../lib/proposal-simulation.cjs');

const MANIFEST = { slides: [
  { index: 1, heading: 'Cover', speakerNotes: 'Chào mọi người. Hôm nay mình kể một câu chuyện ngắn.' },
  { index: 2, heading: 'Problem', bullets: ['Onboarding takes 5 days', '96% of teams lose a week'], speakerNotes: 'Bắt đầu từ vấn đề. [click] Năm ngày cho một người mới. [dừng] [click] Và 96% đội đều gặp.' },
  { index: 3, heading: 'Ask', speakerNotes: 'Mình đề nghị duyệt thí điểm 3 tháng.' },
] };

describe('Phase 174.1 — timeline', () => {
  const t = sim.buildTimeline(MANIFEST, { durationMin: 5, lang: 'vi' });

  test('segments are contiguous, ordered and end at totalSec', () => {
    expect(t.segments[0].tStart).toBe(0);
    for (let i = 1; i < t.segments.length; i++) expect(t.segments[i].tStart).toBeCloseTo(t.segments[i - 1].tEnd, 1);
    expect(t.segments[t.segments.length - 1].tEnd).toBeCloseTo(t.totalSec, 1);
  });

  test('click cues split a slide into cue groups; cue markers are removed from the text', () => {
    const s2 = t.segments.filter((x) => x.slide === 2);
    expect([...new Set(s2.map((x) => x.cue))]).toEqual([0, 1, 2]);
    expect(s2.every((x) => !/\[(click|dừng)\]/.test(x.text))).toBe(true);
  });

  test('duration follows the speaking rate and pauses add time', () => {
    const fast = sim.buildTimeline(MANIFEST, { wpm: 300 });
    const slow = sim.buildTimeline(MANIFEST, { wpm: 100 });
    expect(slow.totalSec).toBeGreaterThan(fast.totalSec);
    const noPause = sim.buildTimeline({ slides: [{ index: 1, speakerNotes: 'Một hai ba bốn năm.' }] }, { wpm: 60 });
    const withPause = sim.buildTimeline({ slides: [{ index: 1, speakerNotes: 'Một hai ba bốn năm. [dừng]' }] }, { wpm: 60 });
    expect(withPause.totalSec - noPause.totalSec).toBeCloseTo(sim.PAUSE_SEC, 0);
    expect(t.wpm).toBe(sim.WPM.vi);
  });

  test('per-slide planned vs spoken time flags overrun and underrun', () => {
    expect(t.slides.map((s) => s.slide)).toEqual([1, 2, 3]);
    expect(t.plannedTotalSec).toBe(300);
    expect(t.slides.every((s) => s.underrun)).toBe(true); // notes far shorter than 100 s per slide
    const long = sim.buildTimeline({ slides: [{ index: 1, speakerNotes: Array(200).fill('từ').join(' ') + '.' }] }, { durationMin: 0.5, lang: 'vi' });
    expect(long.slides[0].overrun).toBe(true);
  });

  test('a slide without notes still gets a segment (its heading)', () => {
    const r = sim.buildTimeline({ slides: [{ index: 1, heading: 'Thank you' }] }, {});
    expect(r.segments).toHaveLength(1);
    expect(r.segments[0].text).toBe('Thank you');
  });
});

describe('Phase 174.1 — slide load', () => {
  test('dense jargon-heavy slides score higher than plain ones; range 0–100', () => {
    const plain = sim.slideLoad(MANIFEST.slides[1]);
    const heavy = sim.slideLoad({ heading: 'Architecture', bullets: ['API GW → K8s HPA autoscale', 'gRPC + OAuth2 + mTLS', 'p99 < 120ms at 5k RPS', 'CQRS/ES via Kafka', 'S3 + Redis cache', 'IaC with Terraform v1.6'] });
    expect(heavy.score).toBeGreaterThan(plain.score);
    expect(heavy.jargon).toBeGreaterThan(5);
    for (const v of [plain.score, heavy.score]) { expect(v).toBeGreaterThanOrEqual(0); expect(v).toBeLessThanOrEqual(100); }
  });

  test('builds come from the builds array or [click] cues', () => {
    expect(sim.slideLoad({ heading: 'x', builds: [1, 2, 3] }).builds).toBe(3);
    expect(sim.slideLoad({ heading: 'x', speakerNotes: 'a [click] b [click] c' }).builds).toBe(2);
  });
});
