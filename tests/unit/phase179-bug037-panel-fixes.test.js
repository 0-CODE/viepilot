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

describe('BUG-037 179.2 — report stance columns, engine from transcript, diff latest two', () => {
  const fs = require('fs'); const os = require('os'); const path = require('path');
  const { execFileSync } = require('child_process');
  const report = require('../../lib/proposal-sim-report.cjs');
  const sim = require('../../lib/proposal-simulation.cjs');
  const { aggregate } = require('../../lib/proposal-sim-aggregate.cjs');
  test('report labels a relayed run as relay even when "teams" was requested; stance + conditions shown', () => {
    const TL = sim.buildTimeline({ slides: [{ index: 1, heading: 'A', speakerNotes: 'Chào mọi người.' }] }, { lang: 'en' });
    const l = sim.parseListener({ personaId: 23, states: [{ seg: 0, attention: 70 }] }, TL).listener;
    const agg = aggregate({ timeline: TL, listeners: [l], manifest: { slides: [{ index: 1 }] } });
    const t = panel.buildTranscript([{ from: 23, to: 'all', round: 3, seq: 1, text: 'Yes if.', final: { wouldAct: true, changed: true, stance: 'conditional yes', conditions: ['branch protection'], why: 'x' } }], { roster: [23] });
    const html = report.renderReport(agg, { lang: 'en', panel: { members: [23], engine: 'teams', transcript: t, unanswered: [], beforeAfter: panel.beforeAfter(agg, t) } });
    expect(html).toMatch(/relayed by the orchestrator/);
    expect(html).not.toMatch(/agent teams \(direct messages\)/);
    expect(html).toMatch(/conditional yes/);
    expect(html).toMatch(/branch protection/);
  });
  test('proposal diff compares the two latest versions by default (numeric order)', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'vp179-'));
    const store = require('../../lib/proposal-store.cjs');
    store.createProposal(root, { slug: 'd', title: 'D', type: 'general' });
    for (const v of ['v1-2026-11-07', 'v2-2026-11-07', 'v10-2026-11-07']) fs.mkdirSync(path.join(root, 'docs/proposals/d/versions', v), { recursive: true });
    store.setCurrentVersion(root, 'd', 'v1-2026-11-07');
    const out = execFileSync('node', [path.join(__dirname, '../../bin/vp-tools.cjs'), 'proposal', 'diff', 'd'], { cwd: root }).toString();
    expect(out).toMatch(/v2-2026-11-07 → v10-2026-11-07/);
    fs.rmSync(root, { recursive: true, force: true });
  });
  test('workflow has the card text centring rule', () => {
    expect(fs.readFileSync(path.join(__dirname, '../../workflows/proposal.md'), 'utf8')).toMatch(/Text in cards \(BUG-037\)/);
  });
});
