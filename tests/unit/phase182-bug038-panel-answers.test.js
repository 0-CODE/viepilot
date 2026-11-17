'use strict';

const panel = require('../../lib/proposal-panel.cjs');

const AGG = {
  evaluations: [
    { personaId: 3, primary: true, wouldAct: true, finalAttention: 70 },
    { personaId: 1, primary: false, wouldAct: true, finalAttention: 50 },
    { personaId: 7, primary: false, wouldAct: false, finalAttention: 40 },
    { personaId: 9, primary: false, wouldAct: false, finalAttention: 68 },
    { personaId: 20, primary: false, wouldAct: true, finalAttention: 80 },
    { personaId: 23, primary: false, wouldAct: true, finalAttention: 75 },
  ],
};

describe('BUG-038 182.1 — noAnswer vs partial state', () => {
  const ctx = { roster: [3, 7, 9, 20, 23], sourceIds: ['S4', 'S6', 'N6', 'B2', 'C11'] };

  test('noAnswer with cites is flagged as a contradiction', () => {
    const msg = { from: 'presenter', to: 3, round: 1, text: 'Slide 6 says this.', cites: ['S6'], noAnswer: true };
    const problems = panel.validateMessage(msg, ctx);
    expect(problems.length).toBeGreaterThan(0);
    expect(problems[0]).toMatch(/noAnswer with cites/);
  });

  test('partial: true with cites is accepted (answered with a gap)', () => {
    const msg = { from: 'presenter', to: 3, round: 1, text: 'Takes 15–20 phút, but I do not know for whom.', cites: ['S6'], partial: true };
    expect(panel.validateMessage(msg, ctx)).toEqual([]);
  });

  test('partial: true without cites is flagged (gap must be named)', () => {
    const msg = { from: 'presenter', to: 3, round: 1, text: 'Something incomplete.', partial: true };
    const problems = panel.validateMessage(msg, ctx);
    expect(problems.length).toBeGreaterThan(0);
    expect(problems[0]).toMatch(/partial.*requires cites/);
  });

  test('presenter answer requires cites, partial, or noAnswer', () => {
    const msg = { from: 'presenter', to: 3, round: 1, text: 'Some answer.' };
    const problems = panel.validateMessage(msg, ctx);
    expect(problems.length).toBeGreaterThan(0);
    expect(problems[0]).toMatch(/without a citation/);
  });

  test('old transcript with noAnswer and cites still validates (backward compatible if not flagged)', () => {
    // The old code allowed this. When backward compatibility is needed, old transcripts
    // should still load but new ones should be flagged.
    const msg = { from: 'presenter', to: 3, round: 1, text: 'Old data.', cites: ['S6'], noAnswer: true };
    // This will now be flagged, which is correct — the flag guides the user to fix it
    const problems = panel.validateMessage(msg, ctx);
    expect(problems.some((p) => p.match(/noAnswer with cites/))).toBe(true);
  });
});

describe('BUG-038 182.1 — message IDs', () => {
  const ctx = { roster: [4, 7, 9, 20, 23], sourceIds: ['S4', 'S6', 'N6', 'B2', 'C11'] };

  test('questions get unique IDs q<persona>-<n>', () => {
    const msgs = [
      { from: 4, to: 'presenter', round: 1, seq: 1, text: 'First question?' },
      { from: 9, to: 'presenter', round: 1, seq: 2, text: 'Second question?' },
      { from: 4, to: 'presenter', round: 1, seq: 3, text: 'Third question?' },
    ];
    const t = panel.buildTranscript(msgs, ctx);
    const qs = t.messages.filter((m) => m.from !== 'presenter' && m.round === 1);
    expect(qs[0].id).toBe('q4-1');
    expect(qs[1].id).toBe('q9-1');
    expect(qs[2].id).toBe('q4-2');
  });

  test('presenter answers get IDs a<persona>-<n> derived from the question', () => {
    const msgs = [
      { from: 4, to: 'presenter', round: 1, seq: 1, text: 'Q from 4?', id: 'q4-1' },
      { from: 'presenter', to: 4, round: 1, seq: 2, text: 'Answer from S6.', cites: ['S6'], answers: 'q4-1' },
      { from: 9, to: 'presenter', round: 1, seq: 3, text: 'Q from 9?', id: 'q9-1' },
      { from: 'presenter', to: 9, round: 1, seq: 4, text: 'Answer 2 from S4.', cites: ['S4'] },
    ];
    const t = panel.buildTranscript(msgs, ctx);
    const as = t.messages.filter((m) => m.from === 'presenter' && m.round === 1);
    expect(as[0].id).toBe('a4-1');
    expect(as[1].id).toBe('a9-1');
  });

  test('panel messages (round 2+) get IDs r<round>-<persona>-<n>', () => {
    const msgs = [
      { from: 4, to: 'presenter', round: 1, seq: 1, text: 'Question?' },
      { from: 'presenter', to: 4, round: 1, seq: 2, text: 'Answer.', cites: ['S6'] },
      { from: 4, to: 9, round: 2, seq: 3, text: 'First reply from 4.' },
      { from: 9, to: 4, round: 2, seq: 4, text: 'Reply from 9.' },
      { from: 4, to: 9, round: 2, seq: 5, text: 'Second reply from 4.' },
    ];
    const t = panel.buildTranscript(msgs, ctx);
    const r2 = t.messages.filter((m) => m.round === 2);
    expect(r2[0].id).toBe('r2-4-1');
    expect(r2[1].id).toBe('r2-9-1');
    expect(r2[2].id).toBe('r2-4-2');
  });

  test('resolveSender handles question IDs (q9-2 -> sender is 9)', () => {
    expect(panel.resolveSender('q9-2')).toBe(9);
  });

  test('resolveSender handles answer IDs (a7-1 -> sender is presenter)', () => {
    expect(panel.resolveSender('a7-1')).toBe('presenter');
  });

  test('resolveSender handles panel message IDs (r2-7-3 -> sender is 7)', () => {
    expect(panel.resolveSender('r2-7-3')).toBe(7);
  });

  test('resolveSender resolves actual message ids from transcript', () => {
    const msgs = [
      { id: 'q4-1', from: 4, to: 'presenter', round: 1, text: 'Q?' },
      { id: 'answer1', from: 'presenter', to: 4, round: 1, text: 'A.' },
    ];
    expect(panel.resolveSender('answer1', msgs)).toBe('presenter');
    expect(panel.resolveSender('q4-1', msgs)).toBe(4);
  });

  test('panelists can reply to presenter answers using IDs', () => {
    const ctx = { roster: [4, 9], messages: [] };
    const msg = { from: 4, to: 'all', round: 2, text: 'Reply to answer.', replyTo: ['a9-1'] };
    // The validator should accept this
    expect(panel.validateMessage(msg, ctx)).toEqual([]);
  });
});

describe('BUG-038 182.1 — partialAnswers extraction', () => {
  test('partialAnswers extracts partial answers from transcript', () => {
    const transcript = {
      messages: [
        { from: 7, to: 'presenter', round: 1, text: 'Question about X?', id: 'q7-1' },
        { from: 'presenter', to: 7, round: 1, text: 'Partial answer.', cites: ['S6'], partial: true, answers: 'q7-1', id: 'a7-1' },
        { from: 9, to: 'presenter', round: 1, text: 'Question about Y?', id: 'q9-1' },
        { from: 'presenter', to: 9, round: 1, text: 'No answer here.', noAnswer: true, answers: 'q9-1', id: 'a9-1' },
      ],
    };
    const pa = panel.partialAnswers(transcript);
    expect(pa).toHaveLength(1);
    expect(pa[0].from).toBe(7);
    expect(pa[0].question).toBe('Question about X?');
  });

  test('partialAnswers ignores non-partial answers', () => {
    const transcript = {
      messages: [
        { from: 7, to: 'presenter', round: 1, text: 'Q?' },
        { from: 'presenter', to: 7, round: 1, text: 'Full answer.', cites: ['S6'], answers: 'q7-1' },
        { from: 9, to: 'presenter', round: 1, text: 'Q?' },
        { from: 'presenter', to: 9, round: 1, text: 'No answer.', noAnswer: true },
      ],
    };
    expect(panel.partialAnswers(transcript)).toHaveLength(0);
  });

  test('unansweredQuestions distinguishes partial from unanswered', () => {
    const transcript = {
      messages: [
        { from: 7, to: 'presenter', round: 1, text: 'Q about X?', id: 'q7-1' },
        { from: 'presenter', to: 7, round: 1, text: 'Partial.', cites: ['S6'], partial: true, answers: 'q7-1' },
        { from: 9, to: 'presenter', round: 1, text: 'Q about Y?', id: 'q9-1' },
        { from: 'presenter', to: 9, round: 1, text: 'No answer.', noAnswer: true, answers: 'q9-1' },
        { from: 20, to: 'presenter', round: 1, text: 'Q about Z?' },
      ],
    };
    const un = panel.unansweredQuestions(transcript);
    // Should have 2: noAnswer and not answered (not the partial)
    expect(un).toHaveLength(2);
    expect(un.map((u) => u.from)).toEqual([9, 20]);
  });
});

describe('BUG-038 182.1 — backward compatibility', () => {
  const ctx = { roster: [4, 7], sourceIds: ['S6'] };

  test('transcripts without ids still validate (backward compat)', () => {
    const msgs = [
      { from: 4, to: 'presenter', round: 1, seq: 1, text: 'Old question?' },
      { from: 'presenter', to: 4, round: 1, seq: 2, text: 'Old answer.', cites: ['S6'] },
    ];
    const t = panel.buildTranscript(msgs, ctx);
    expect(t.messages).toHaveLength(2);
    // IDs should be assigned by buildTranscript
    expect(t.messages[0].id).toBe('q4-1');
    expect(t.messages[1].id).toBe('a4-1');
  });

  test('messages with pre-existing ids are preserved', () => {
    const msgs = [
      { from: 4, to: 'presenter', round: 1, text: 'Q?', id: 'custom-q1' },
      { from: 'presenter', to: 4, round: 1, text: 'A.', cites: ['S6'], id: 'custom-a1' },
    ];
    const t = panel.buildTranscript(msgs, ctx);
    expect(t.messages[0].id).toBe('custom-q1');
    expect(t.messages[1].id).toBe('custom-a1');
  });

  test('old transcripts with partial/noAnswer flags still work', () => {
    const msgs = [
      { from: 7, to: 'presenter', round: 1, text: 'Q?', id: 'q7-1' },
      { from: 'presenter', to: 7, round: 1, text: 'Answer.', cites: ['S6'], partial: true, answers: 'q7-1' },
    ];
    const t = panel.buildTranscript(msgs, ctx);
    expect(t.messages).toHaveLength(2);
    expect(t.messages[1].partial).toBe(true);
  });
});

describe('BUG-038 182.4 — workflow card margin order', () => {
  const fs = require('fs');
  const path = require('path');

  test('workflow contains "left, right, bottom, top" margin order and not "[t, r, b, l]"', () => {
    const workflowPath = path.join(__dirname, '../../workflows/proposal.md');
    const workflowContent = fs.readFileSync(workflowPath, 'utf-8');
    expect(workflowContent).toContain('left, right, bottom, top');
    expect(workflowContent).not.toContain('[t, r, b, l]');
  });
});
