'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { HallCore } = require('../../templates/proposal/simulation/hall3d.js');
const sim = require('../../lib/proposal-simulation.cjs');
const { aggregate } = require('../../lib/proposal-sim-aggregate.cjs');
const report = require('../../lib/proposal-sim-report.cjs');

const TL = sim.buildTimeline({ slides: [
  { index: 1, heading: 'Cover', speakerNotes: 'Chào mọi người.' },
  { index: 2, heading: 'Architecture', speakerNotes: 'Chúng ta dùng CQRS với event sourcing qua Kafka.' },
  { index: 3, heading: 'Ask', speakerNotes: 'Mình đề nghị duyệt thí điểm ba tháng.' },
] }, { lang: 'vi' });
const LISTENERS = [
  sim.parseListener({ personaId: 2, states: [{ seg: 0, attention: 90 }, { seg: 1, attention: 20, comprehension: 30, emotion: -1, line: 'event sourcing', objection: 'Ai vận hành Kafka?' }, { seg: 2, attention: 80 }], tuneOut: { seg: 1, reason: 'jargon', line: 'CQRS với' }, regainedAt: 2, verdict: { wouldAct: true, quote: 'ok' } }, TL).listener,
  sim.parseListener({ personaId: 20, states: [{ seg: 0, attention: 70 }, { seg: 1, attention: 65 }, { seg: 2, attention: 90 }], verdict: { wouldAct: true, quote: 'ok' } }, TL).listener,
];
const DATA = { timeline: TL, listeners: LISTENERS, hall: { primary: [2] } };

describe('Phase 174.5 — hall replay core', () => {
  test('segment lookup by time, clamped to the last segment', () => {
    expect(HallCore.segmentAt(TL.segments, 0)).toBe(0);
    expect(HallCore.segmentAt(TL.segments, TL.segments[1].tStart + 0.01)).toBe(1);
    expect(HallCore.segmentAt(TL.segments, 9999)).toBe(TL.segments.length - 1);
  });

  test('frame: colours by attention, tune-out dims until regained, objection shown on its segment', () => {
    const f1 = HallCore.frame(DATA, TL.segments[1].tStart + 0.01);
    const p2 = f1.seats.find((s) => s.personaId === 2);
    expect(p2).toMatchObject({ tunedOut: true, objection: 'Ai vận hành Kafka?', primary: true });
    expect(p2.color).toBe(HallCore.attentionColor(0));
    const f2 = HallCore.frame(DATA, TL.segments[2].tStart + 0.01);
    expect(f2.seats.find((s) => s.personaId === 2)).toMatchObject({ tunedOut: false, objection: null, attention: 80 });
    expect(f2.text).toMatch(/thí điểm/);
  });

  test('colour scale runs red → amber → green', () => {
    const rgb = (c) => c.match(/\d+/g).map(Number);
    const [r0, g0] = rgb(HallCore.attentionColor(0));
    const [r1, g1] = rgb(HallCore.attentionColor(100));
    expect(r0).toBeGreaterThan(g0);
    expect(g1).toBeGreaterThan(r1);
  });

  test('seat layout: one seat per listener, rows of up to 8, all in front of the stage', () => {
    const seats = HallCore.seatLayout(30);
    expect(seats).toHaveLength(30);
    expect(Math.max(...seats.map((s) => s.row))).toBe(3);
    expect(seats.every((s) => s.z > 0)).toBe(true);
  });
});

describe('Phase 174.5 — report embeds the replay offline', () => {
  test('three.js source and replay script are inlined; data is valid JSON; report stays under 3 MB', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-hall-'));
    try {
      const agg = aggregate({ timeline: TL, listeners: LISTENERS, manifest: { slides: [] }, primary: [2] });
      const run = report.writeRun(dir, { agg, timeline: TL, listeners: LISTENERS, hall: { listeners: [2, 20], observers: [31], primary: [2] }, meta: { title: 'x', lang: 'en', names: { 2: 'CFO' } } });
      const html = fs.readFileSync(path.join(run.dir, 'report.html'), 'utf8');
      const assets = report.hallAssets();
      if (assets.threeSource) expect(html).toContain('id="three-src"');
      expect(html).toMatch(/HallCore/);
      expect(html).toMatch(/make2D/);
      const json = html.match(/id="hall-data">([\s\S]*?)<\/script>/)[1];
      expect(JSON.parse(json).names).toEqual({ 2: 'CFO' });
      expect(fs.statSync(path.join(run.dir, 'report.html')).size).toBeLessThan(3 * 1024 * 1024);
      expect(html).toContain('CFO');
      expect(html.replace(/http:\/\/www\.w3\.org\/[\w/.]+/g, '')).not.toMatch(/https?:\/\//);
    } finally { fs.rmSync(dir, { recursive: true, force: true }); }
  });

  test('without WebGL or three the replay falls back to the 2D hall', () => {
    const src = fs.readFileSync(path.join(__dirname, '../../templates/proposal/simulation/hall3d.js'), 'utf8');
    expect(src).toMatch(/if \(src && hasWebGL\(\)\)[\s\S]*catch\(function \(\) \{ start\(make2D\(\)\); \}\)[\s\S]*else start\(make2D\(\)\)/);
  });
});
