'use strict';

const fs = require('fs');
const path = require('path');
const sim = require('../../lib/proposal-simulation.cjs');
const audience = require('../../lib/proposal-audience.cjs');

const TL = sim.buildTimeline({ slides: [
  { index: 1, heading: 'Cover', speakerNotes: 'Chào mọi người.' },
  { index: 2, heading: 'Architecture', speakerNotes: 'Chúng ta dùng CQRS với event sourcing qua Kafka.' },
  { index: 3, heading: 'Ask', speakerNotes: 'Mình đề nghị duyệt thí điểm ba tháng.' },
] }, { lang: 'vi' });

describe('Phase 174.2 — listener prompt contract', () => {
  const tpl = fs.readFileSync(path.join(__dirname, '../../templates/proposal/simulation/listener-prompt.md'), 'utf8');
  test('has all placeholders and the strict JSON shape', () => {
    for (const p of ['{persona_card}', '{audience_context}', '{timeline_json}', '{slide_images}', '{lang}']) expect(tpl).toContain(p);
    for (const k of ['"states"', '"attention"', '"comprehension"', '"emotion"', '"funnelStage"', '"tuneOut"', '"recall24h"', '"verdict"']) expect(tpl).toContain(k);
    expect(tpl).toMatch(/Negative reactions without a quote from the segment are discarded/);
  });
});

describe('Phase 174.2 — parseListener', () => {
  test('keeps cited negative reactions, drops uncited ones, clamps ranges', () => {
    const r = sim.parseListener({
      personaId: 7,
      states: [
        { seg: 0, attention: 90, comprehension: 90, emotion: 1, funnelStage: 'aware' },
        { seg: 1, attention: 40, comprehension: 30, emotion: -1, funnelStage: 'aware', line: 'CQRS với event sourcing' },
        { seg: 2, attention: 10, comprehension: 20, emotion: -2, objection: 'Too expensive', funnelStage: 'nope' },
      ],
      tuneOut: { seg: 1, reason: 'jargon', line: 'event sourcing qua Kafka' },
      regainedAt: 2,
      recall24h: ['thí điểm 3 tháng', 'Kafka'],
      verdict: { wouldAct: true, quote: 'Ok nếu có người giải thích.' },
    }, TL);
    expect(r.dropped).toBe(1);
    expect(r.listener.states[1]).toMatchObject({ attention: 40, comprehension: 30, emotion: -1 });
    expect(r.listener.states[2]).toMatchObject({ attention: 40, objection: null, funnelStage: 'aware' });
    expect(r.listener.tuneOut).toMatchObject({ seg: 1, reason: 'jargon', t: TL.segments[1].tStart });
    expect(r.listener.regainedAt).toBe(2);
    expect(r.listener.verdict.wouldAct).toBe(true);
  });

  test('tuneOut without a matching quote is dropped; regainedAt then ignored', () => {
    const r = sim.parseListener({ personaId: 1, states: [{ seg: 0, attention: 80 }], tuneOut: { seg: 1, reason: 'bored', line: 'not said' }, regainedAt: 2 }, TL);
    expect(r.listener.tuneOut).toBeNull();
    expect(r.listener.regainedAt).toBeNull();
    expect(r.log.join(' ')).toMatch(/tuneOut without a quote/);
  });

  test('accepts fenced JSON strings; rejects malformed output', () => {
    expect(sim.parseListener('```json\n{"personaId":2,"states":[{"seg":0,"attention":70}]}\n```', TL).listener.personaId).toBe(2);
    expect(sim.parseListener('not json', TL).listener).toBeNull();
    expect(sim.parseListener({ personaId: 1 }, TL).listener).toBeNull();
  });
});

describe('parseListener — attention baseline and held drops', () => {
  test('the first state sets the baseline: starting below 100 is not a drop', () => {
    const r = sim.parseListener({ personaId: 4, states: [{ seg: 0, attention: 60 }, { seg: 1, attention: 55 }, { seg: 2, attention: 65 }] }, TL);
    expect(r.dropped).toBe(0);
    expect(r.listener.states.map((s) => s.attention)).toEqual([60, 55, 65]);
  });

  test('an uncited drop is held and counted once, not once per later segment', () => {
    const r = sim.parseListener({ personaId: 4, states: [{ seg: 0, attention: 90 }, { seg: 1, attention: 50 }, { seg: 2, attention: 50 }] }, TL);
    expect(r.dropped).toBe(1);
    expect(r.listener.states.map((s) => s.attention)).toEqual([90, 90, 90]);
  });

  test('a held listener who recovers is released', () => {
    const r = sim.parseListener({ personaId: 4, states: [{ seg: 0, attention: 90 }, { seg: 1, attention: 50 }, { seg: 2, attention: 85 }] }, TL);
    expect(r.dropped).toBe(1);
    expect(r.listener.states.map((s) => s.attention)).toEqual([90, 90, 85]);
  });
});

describe('Phase 174.2 — hall audience', () => {
  test('default hall: 12–16 listeners, #20 present, #31 observes only', () => {
    for (const o of [{ type: 'product-pitch' }, { type: 'general' }, { type: 'tech-architecture' }, { type: 'research-proposal', variant: 'kickoff' }, { type: 'internal-presentation', variant: 'all-hands' }]) {
      const h = sim.selectHall(o);
      expect(h.listeners.length).toBeGreaterThanOrEqual(sim.HALL_MIN);
      expect(h.listeners.length).toBeLessThanOrEqual(sim.HALL_MAX);
      expect(h.listeners).toContain(20);
      expect(h.listeners).not.toContain(31);
      expect(h.observers).toEqual([31]);
    }
  });

  test('type-specific personas are seated: academic for research, internal for internal decks', () => {
    expect(sim.selectHall({ type: 'research-proposal', variant: 'grant-proposal' }).listeners).toEqual(expect.arrayContaining([26, 27, 28, 29, 30]));
    expect(sim.selectHall({ type: 'internal-presentation', variant: 'training' }).listeners).toEqual(expect.arrayContaining([21, 22, 23, 24, 25]));
  });

  test('primary audience roles are recorded for weighting', () => {
    const profile = audience.normalizeAudienceProfile({ roles: ['new-hires'], rolePrimary: ['new-hires'] });
    const h = sim.selectHall({ type: 'internal-presentation', variant: 'training', audienceProfile: profile });
    expect(h.primary).toContain(21);
  });

  test('--hall all seats every reviewer persona; add/remove work; #20 cannot be removed', () => {
    expect(sim.selectHall({ type: 'general', hall: 'all' }).listeners.length).toBeGreaterThanOrEqual(30);
    const h = sim.selectHall({ type: 'general', remove: [20, 1], add: [29] });
    expect(h.listeners).toContain(20);
    expect(h.listeners).not.toContain(1);
    expect(h.listeners).toContain(29);
  });
});
