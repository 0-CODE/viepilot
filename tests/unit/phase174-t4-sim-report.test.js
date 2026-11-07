'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const sim = require('../../lib/proposal-simulation.cjs');
const { aggregate } = require('../../lib/proposal-sim-aggregate.cjs');
const report = require('../../lib/proposal-sim-report.cjs');

const M = { slides: [
  { index: 1, heading: 'Cover', beat: 'context', speakerNotes: 'Chào mọi người.' },
  { index: 2, heading: 'Architecture', beat: 'solution', bullets: ['CQRS/ES via Kafka'], speakerNotes: 'Chúng ta dùng CQRS với event sourcing qua Kafka.' },
  { index: 3, heading: 'Ask', beat: 'invitation', speakerNotes: 'Mình đề nghị duyệt thí điểm ba tháng.' },
] };
const TL = sim.buildTimeline(M, { lang: 'vi', durationMin: 5 });
const LS = [sim.parseListener({ personaId: 2, states: [{ seg: 0, attention: 90 }, { seg: 1, attention: 30, comprehension: 30, emotion: -1, line: 'event sourcing', objection: 'Ai vận hành cụm này?' }, { seg: 2, attention: 70, funnelStage: 'agree' }],
  tuneOut: { seg: 1, reason: 'jargon <script>alert(1)</script>', line: 'CQRS với event sourcing' }, recall24h: ['thí điểm'], verdict: { wouldAct: false, quote: 'cần rõ chi phí' } }, TL).listener];
const AGG = aggregate({ timeline: TL, listeners: LS, manifest: M, primary: [2], keyMessages: ['thí điểm ba tháng'], keywords: ['Kafka'] });

describe('Phase 174.4 — report.html', () => {
  const html = report.renderReport(AGG, { title: 'CRM rollout', lang: 'vi', personaName: (id) => `P${id}` });

  test('self-contained: no external URLs, no external scripts or styles', () => {
    expect(html).not.toMatch(/https?:\/\//);
    expect(html).not.toMatch(/<link\b|<script[^>]+src=/);
  });

  test('labelled as an AI simulation, in the requested language', () => {
    expect(html).toContain('Mô phỏng bằng AI — không phải dữ liệu khán giả thật');
    expect(report.renderReport(AGG, { lang: 'en' })).toContain('AI simulation — not real audience data');
  });

  test('has every requested output and chart group', () => {
    for (const id of ['summary', 'retention', 'tuneouts', 'improvements', 'evaluations', 'keywords', 'heatmap', 'load', 'emotion', 'funnel', 'questions', 'pacing', 'recall', 'hall']) {
      expect(html).toContain(`<section id="${id}">`);
    }
    expect((html.match(/<svg/g) || []).length).toBeGreaterThanOrEqual(3);
  });

  test('escapes persona-provided text', () => {
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  test('light/dark tokens and a phone-width layout', () => {
    expect(html).toMatch(/prefers-color-scheme: dark/);
    expect(html).toMatch(/:root\[data-theme="dark"\]/);
    expect(html).toMatch(/name="viewport"/);
  });
});

describe('Phase 174.4 — summary.md and run folders', () => {
  test('summary has banner, KPIs, improvements and tune-out table', () => {
    const md = report.renderSummaryMd(AGG, { title: 'CRM', lang: 'en', personaName: (id) => `P${id}` });
    expect(md).toMatch(/> AI simulation — not real audience data/);
    expect(md).toMatch(/## What to improve first[\s\S]*Slide 2/);
    expect(md).toMatch(/\| P2 ★ \| 2 \|/);
  });

  test('writeRun creates run-1, run-2 … and never overwrites', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-run-'));
    try {
      const a = report.writeRun(dir, { agg: AGG, timeline: TL, listeners: LS, hall: { listeners: [2], observers: [31] }, meta: { title: 'x', lang: 'en' } });
      const b = report.writeRun(dir, { agg: AGG, timeline: TL, listeners: LS, hall: { listeners: [2], observers: [31] }, meta: { title: 'x', lang: 'en' } });
      expect(path.basename(a.dir)).toBe('run-1');
      expect(path.basename(b.dir)).toBe('run-2');
      expect(fs.readdirSync(a.dir).sort()).toEqual(['data.json', 'report.html', 'summary.md']);
      const data = JSON.parse(fs.readFileSync(path.join(a.dir, 'data.json'), 'utf8'));
      expect(data.meta.label).toMatch(/AI simulation/);
      expect(data.aggregate.summary.listeners).toBe(1);
      expect(fs.readFileSync(path.join(a.dir, 'report.html'), 'utf8')).toMatch(/id="hall-data"/);
    } finally { fs.rmSync(dir, { recursive: true, force: true }); }
  });
});
