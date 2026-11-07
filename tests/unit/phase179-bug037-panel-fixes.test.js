'use strict';

const panel = require('../../lib/proposal-panel.cjs');

const AGG = {
  evaluations: [
    { personaId: 3, primary: true, wouldAct: true, finalAttention: 70 },
    { personaId: 1, primary: false, wouldAct: true, finalAttention: 50 },
    { personaId: 9, primary: false, wouldAct: false, finalAttention: 68 },
    { personaId: 12, primary: false, wouldAct: false, finalAttention: 66 },
    { personaId: 20, primary: false, wouldAct: true, finalAttention: 80 },
    { personaId: 23, primary: false, wouldAct: true, finalAttention: 75 },
  ],
  questions: [
    ...Array(5).fill({ personaId: 9, kind: 'objection', answered: true }),
    ...Array(3).fill({ personaId: 12, kind: 'objection', answered: true }),
    { personaId: 3, kind: 'objection', answered: false },
  ],
};

describe('BUG-037 179.1 — skeptic-first panel', () => {
  test('the strongest skeptic gets the first seat; other skeptics are kept when there is room', () => {
    const { panel: ids, why } = panel.selectPanel(AGG, { size: 6 });
    expect(ids[0]).toBe(9);
    expect(why[9]).toMatch(/strongest skeptic \(5 objection/);
    expect(ids).toContain(12);
    expect(ids).toContain(20);
  });
});

describe('BUG-037 179.1 — replyTo and engine', () => {
  const ctx = { roster: [3, 9, 20] };
  test('replyTo accepts message ids (q9-2) and resolves them to the sender', () => {
    expect(panel.resolveSender('q9-2')).toBe(9);
    expect(panel.resolveSender(20)).toBe(20);
    expect(panel.validateMessage({ from: 20, to: 'all', round: 2, text: 'Đồng ý với 9.', replyTo: ['q9-2'] }, ctx)).toEqual([]);
    expect(panel.validateMessage({ from: 20, to: 'all', round: 2, text: 'x', replyTo: ['m7'] }, { ...ctx, messages: [{ id: 'm7', from: 3 }] })).toEqual([]);
  });
  test('engine is computed from the transcript', () => {
    expect(panel.detectEngine({ messages: [{ from: 3, to: 9, round: 2, text: 'x' }] })).toBe('relay');
    expect(panel.detectEngine({ messages: [{ from: 3, to: 9, round: 2, text: 'x', via: 'direct' }] })).toBe('teams');
  });
});

describe('BUG-037 179.1 — before/after uses the panelist stance', () => {
  test("a panelist's own changed flag and stance/conditions are kept", () => {
    const t = { messages: [{ from: 23, to: 'all', round: 3, text: 'Có điều kiện.', final: { wouldAct: true, changed: true, stance: 'đồng ý có điều kiện', conditions: ['PR + branch protection'], why: 'tự ký' } }] };
    const [b] = panel.beforeAfter({ evaluations: [{ personaId: 23, wouldAct: true }] }, t);
    expect(b.changed).toBe(true);
    expect(b.after).toEqual({ wouldAct: true, stance: 'đồng ý có điều kiện', conditions: ['PR + branch protection'] });
  });
  test('prompts: replyTo ids explained, stance/conditions asked, presenter word cap reminded', () => {
    const fs = require('fs'); const path = require('path'); const dir = path.join(__dirname, '../../templates/proposal/simulation');
    expect(fs.readFileSync(path.join(dir, 'panel-prompt.md'), 'utf8')).toMatch(/persona ids or message ids/);
    expect(fs.readFileSync(path.join(dir, 'panel-prompt.md'), 'utf8')).toMatch(/stance, conditions/);
    expect(fs.readFileSync(path.join(dir, 'presenter-prompt.md'), 'utf8')).toMatch(/at most 80 words — count before you write/);
    expect(fs.readFileSync(path.join(__dirname, '../../workflows/proposal.md'), 'utf8')).toMatch(/detectEngine\(transcript\)/);
  });
});
