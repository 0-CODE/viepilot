'use strict';

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '../..');

describe('BUG-036 177.1 — listener prompt requires seeing the slides', () => {
  const tpl = fs.readFileSync(path.join(ROOT, 'templates/proposal/simulation/listener-prompt.md'), 'utf8');
  test('precondition: open every slide image; report slidesSeen and visualNotes', () => {
    expect(tpl).toMatch(/open \*\*every\*\* slide image/);
    expect(tpl).toMatch(/"slidesSeen"/);
    expect(tpl).toMatch(/"visualNotes"/);
    expect(tpl).toMatch(/text-only/);
  });
  test('quote rule: only the few words; whole-segment copy discarded; estimates', () => {
    expect(tpl).toMatch(/only the few words/);
    expect(tpl).toMatch(/copy of the whole segment is not a quote/);
    expect(tpl).toMatch(/estimates, not measurements/);
  });
  test('workflow documents visual verification', () => {
    const wf = fs.readFileSync(path.join(ROOT, 'workflows/proposal.md'), 'utf8');
    expect(wf).toMatch(/verifyVisual\(entries, imagePaths\)/);
    expect(wf).toMatch(/quoteQuality: mechanical/);
  });
});

const sim = require('../../lib/proposal-simulation.cjs');
const LONG = 'Mình sẽ mở terminal và chạy trực tiếp khoảng 4 phút, trên một repo nhỏ mình đã chuẩn bị sẵn.';
const TL = sim.buildTimeline({ slides: [
  { index: 1, heading: 'Cover', speakerNotes: 'Chào mọi người.' },
  { index: 2, heading: 'Demo', speakerNotes: LONG },
  { index: 3, heading: 'Ask', speakerNotes: 'Mình đề nghị một đội thử 2 tuần trên một việc thật trong sprint này.' },
] }, { lang: 'vi' });

describe('BUG-036 177.2 — selective quotes, mechanical flag, visual grounding', () => {
  test('a whole-segment copy is not a citation; a few words are', () => {
    const copy = sim.parseListener({ personaId: 1, states: [{ seg: 0, attention: 80 }, { seg: 1, attention: 40, line: LONG }] }, TL);
    expect(copy.dropped).toBe(1);
    const sel = sim.parseListener({ personaId: 1, states: [{ seg: 0, attention: 80 }, { seg: 1, attention: 40, line: 'chạy trực tiếp khoảng 4 phút' }] }, TL);
    expect(sel.dropped).toBe(0);
    expect(sel.listener.states[1].attention).toBe(40);
  });

  test('run-3 pattern (whole segment copied into every state) is flagged mechanical', () => {
    const states = TL.segments.map((s, i) => ({ seg: i, attention: 70, line: s.text }));
    const r = sim.parseListener({ personaId: 4, states }, TL);
    expect(r.listener.quoteQuality).toBe('mechanical');
    expect(r.log.join(' ')).toMatch(/mechanical quoting/);
  });

  test('short segments (≤ 6 words, e.g. [demo]) may be quoted whole', () => {
    const r = sim.parseListener({ personaId: 1, states: [{ seg: 0, attention: 90 }], tuneOut: { seg: 0, reason: 'x', line: 'Chào mọi người.' } }, TL);
    expect(r.listener.tuneOut).not.toBeNull();
  });

  test('slidesSeen / visualNotes kept within the deck; verified reads win over claims', () => {
    const data = { personaId: 13, slidesSeen: [1, 2, 3, 9], visualNotes: [{ slide: 2, note: 'terminal screenshot' }, { slide: 9, note: 'x' }], states: [{ seg: 0, attention: 80 }] };
    const claimed = sim.parseListener(data, TL, { slideCount: 3 }).listener;
    expect(claimed).toMatchObject({ slidesSeen: [1, 2, 3], visual: 'seen', visualVerified: false });
    expect(claimed.visualNotes).toEqual([{ slide: 2, note: 'terminal screenshot' }]);
    const verified = sim.parseListener(data, TL, { slideCount: 3, verifiedSlides: [2] }).listener;
    expect(verified).toMatchObject({ slidesSeen: [2], slidesClaimed: [1, 2, 3], visual: 'partial', visualVerified: true });
    expect(sim.parseListener({ personaId: 1, states: [] }, TL, { slideCount: 3 }).listener.visual).toBe('none');
  });

  test('verifyVisual counts Read calls on the slide images in a transcript', () => {
    const imgs = ['/p/qa/slide-1.jpg', '/p/qa/slide-2.jpg', '/p/qa/slide-3.jpg'];
    const read = (fp) => ({ type: 'assistant', message: { content: [{ type: 'tool_use', name: 'Read', input: { file_path: fp } }] } });
    const entries = [read('/p/qa/slide-2.jpg'), read('/p/prompt.md'), read('/p/qa/slide-3.jpg'), { type: 'assistant', message: { content: [{ type: 'text', text: 'slide-1.jpg' }] } }];
    expect(sim.verifyVisual(entries, imgs)).toEqual([2, 3]);
  });
});

const { aggregate } = require('../../lib/proposal-sim-aggregate.cjs');
const report = require('../../lib/proposal-sim-report.cjs');

describe('BUG-036 177.3 — grounding in summary/report; deltas from data.json', () => {
  const mk = (id, extra, dataExtra = {}) => sim.parseListener({ personaId: id, states: TL.segments.map((s, i) => ({ seg: i, attention: 80, ...extra(s, i) })), ...dataExtra }, TL, { slideCount: 3 }).listener;
  const seen = mk(3, () => ({}), { slidesSeen: [1, 2, 3] });
  const mech = mk(4, (s) => ({ line: s.text }));
  const manifest = { slides: [{ index: 1, heading: 'Cover' }, { index: 2, heading: 'Demo' }, { index: 3, heading: 'Ask' }] };
  const agg = aggregate({ timeline: TL, listeners: [seen, mech], manifest });

  test('summary has visual coverage and mechanical-quote count', () => {
    expect(agg.summary.visualCoverage).toEqual({ seen: 1, partial: 0, verified: 0, total: 2 });
    expect(agg.summary.mechanicalQuotes).toBe(1);
  });

  test('report and summary.md label the numbers as model estimates and warn on weak grounding', () => {
    const html = report.renderReport(agg, { lang: 'vi', title: 'T' });
    expect(html).toMatch(/Độ bám thực tế: 1\/2 đã xem đủ slide · 0\/2 đã kiểm chứng qua transcript · 1\/2 chép nguyên đoạn/);
    expect((html.match(/ước lượng của mô hình/g) || []).length).toBeGreaterThanOrEqual(4);
    expect(html).toMatch(/nhận xét về hình ảnh chỉ đến từ người đã xem/);
    const md = report.renderSummaryMd(agg, { lang: 'en', title: 'T' });
    expect(md).toMatch(/Grounding: 1\/2 saw every slide/);
    expect(md).toMatch(/model estimate/);
  });

  test('aggregate accepts the previous run data.json for deltas', () => {
    const dataJson = { meta: {}, aggregate: { summary: { ...agg.summary, avgRetention: agg.summary.avgRetention - 10 } } };
    const next = aggregate({ timeline: TL, listeners: [seen, mech], manifest, previous: dataJson });
    expect(next.deltas).not.toBeNull();
    expect(next.deltas.avgRetention).toBe(10);
  });
});
