'use strict';

const panel = require('../../lib/proposal-panel.cjs');

const AGG = {
  evaluations: [
    { personaId: 3, primary: true, wouldAct: true, finalAttention: 70 },
    { personaId: 4, primary: true, wouldAct: false, finalAttention: 66 },
    { personaId: 7, primary: false, wouldAct: false, finalAttention: 40 },
    { personaId: 9, primary: false, wouldAct: false, finalAttention: 60 },
    { personaId: 20, primary: false, wouldAct: true, finalAttention: 80 },
    { personaId: 23, primary: false, wouldAct: true, finalAttention: 75 },
    { personaId: 25, primary: false, wouldAct: false, finalAttention: 55 },
  ],
  questions: [
    { personaId: 9, kind: 'objection', answered: false }, { personaId: 9, kind: 'objection', answered: false },
    { personaId: 3, kind: 'objection', answered: false }, { personaId: 7, kind: 'question', answered: false },
  ],
};

describe('ENH-128 178.1 — panel selection', () => {
  test('picks negative primary, lowest attention, most unanswered objections, #20 and a decision-maker', () => {
    const { panel: ids, why } = panel.selectPanel(AGG);
    expect(ids.slice(0, 3)).toEqual([4, 7, 9]);
    expect(ids).toContain(20);
    expect(ids).toContain(23);
    expect(ids.length).toBe(5);
    expect(why[9]).toMatch(/2 unanswered/);
  });
  test('size is clamped to 4–6', () => {
    expect(panel.selectPanel(AGG, { size: 2 }).panel.length).toBe(4);
    expect(panel.selectPanel(AGG, { size: 9 }).panel.length).toBe(6);
  });
});

describe('ENH-128 178.1 — message protocol', () => {
  const ctx = { roster: [4, 7, 9, 20, 23], sourceIds: ['S4', 'S6', 'N6', 'B2', 'C11'] };
  test('presenter must cite known sources or say there is no answer', () => {
    expect(panel.validateMessage({ from: 'presenter', to: 4, round: 1, text: 'Ở slide 6.', cites: ['S6'] }, ctx)).toEqual([]);
    expect(panel.validateMessage({ from: 'presenter', to: 4, round: 1, text: 'Chắc khoảng 10%.' }, ctx)[0]).toMatch(/without a citation/);
    expect(panel.validateMessage({ from: 'presenter', to: 4, round: 1, text: 'Theo số liệu X.', cites: ['Z9'] }, ctx)[0]).toMatch(/unknown source Z9/);
    expect(panel.validateMessage({ from: 'presenter', to: 4, round: 1, text: 'Chưa có trong tài liệu — mình ghi lại.', noAnswer: true }, ctx)).toEqual([]);
  });
  test('round rules: R1 to the presenter, R2 to another panelist, caps on words and rounds', () => {
    expect(panel.validateMessage({ from: 4, to: 7, round: 1, text: 'Hỏi bạn 7.' }, ctx)[0]).toMatch(/question the presenter/);
    expect(panel.validateMessage({ from: 4, to: 'presenter', round: 2, text: 'x y' }, ctx)[0]).toMatch(/another panelist/);
    expect(panel.validateMessage({ from: 4, to: 'all', round: 2, text: 'Mình đồng ý.' }, ctx)[0]).toMatch(/replyTo/);
    expect(panel.validateMessage({ from: 4, to: 'all', round: 2, text: 'Mình đồng ý với 7.', replyTo: [7] }, ctx)).toEqual([]);
    expect(panel.validateMessage({ from: 4, to: 'presenter', round: 4, text: 'x' }, ctx)[0]).toMatch(/round 4/);
    expect(panel.validateMessage({ from: 4, to: 'presenter', round: 1, text: Array(90).fill('từ').join(' ') }, ctx)[0]).toMatch(/80 words/);
    expect(panel.validateMessage({ from: 99, to: 'presenter', round: 1, text: 'x' }, ctx)[0]).toMatch(/unknown sender/);
  });
  test('transcript drops over-cap messages, extracts unanswered questions and before/after', () => {
    const msgs = [
      { from: 4, to: 'presenter', round: 1, seq: 1, text: 'Tốn thêm bao nhiêu giờ?' },
      { from: 'presenter', to: 4, round: 1, seq: 2, text: 'Khoảng 15–20 phút đầu mỗi việc.', cites: ['S6'] },
      { from: 9, to: 'presenter', round: 1, seq: 3, text: 'Khác gì plan mode?' },
      { from: 'presenter', to: 9, round: 1, seq: 4, text: 'Chưa có trong tài liệu.', noAnswer: true },
      { from: 7, to: 'presenter', round: 1, seq: 5, text: 'Người không viết code dùng được không?' },
      { from: 4, to: 9, round: 2, seq: 6, text: 'Mình nghĩ khác bạn 9.' },
      { from: 4, to: 7, round: 2, seq: 7, text: 'Thêm ý.' },
      { from: 4, to: 7, round: 2, seq: 8, text: 'Quá số tin.' },
      { from: 4, to: 'all', round: 3, seq: 9, text: 'Mình đồng ý thử.', final: { wouldAct: true, why: 'có số ước lượng' } },
    ];
    const t = panel.buildTranscript(msgs, ctx);
    expect(t.dropped).toHaveLength(1);
    expect(panel.unansweredQuestions(t).map((u) => [u.from, u.reason])).toEqual([[9, 'no answer in the material'], [7, 'not answered']]);
    expect(panel.beforeAfter(AGG, t)).toEqual([{ personaId: 4, before: { wouldAct: false }, after: { wouldAct: true }, changed: true, why: 'có số ước lượng' }]);
  });
});

describe('ENH-128 178.2 — presenter and panel prompts', () => {
  const fs = require('fs');
  const path = require('path');
  const dir = path.join(__dirname, '../../templates/proposal/simulation');
  test('presenter answers only from cited material; no invention; noAnswer', () => {
    const t = fs.readFileSync(path.join(dir, 'presenter-prompt.md'), 'utf8');
    for (const p of ['{deck_material}', '{questions_json}', '{voice}', '{lang}']) expect(t.split(p).length - 1).toBe(1);
    expect(t).toMatch(/Answer only from the material/);
    expect(t).toMatch(/Never invent numbers/);
    expect(t).toMatch(/"noAnswer"/);
  });
  test('panel prompt defines the three rounds and quoting each other', () => {
    const t = fs.readFileSync(path.join(dir, 'panel-prompt.md'), 'utf8');
    for (const p of ['{persona_card}', '{listener_summary}', '{roster}', '{transcript_json}', '{round}', '{lang}']) expect(t).toContain(p);
    expect(t).toMatch(/Round 1 — question the presenter/);
    expect(t).toMatch(/Round 2 — talk to the other panelists/);
    expect(t).toMatch(/Round 3 — final position/);
    expect(t).toMatch(/at most 80 words/);
  });
});
