'use strict';

const cur = require('../../lib/proposal-curation.cjs');

const deck = (notes, bullets = []) => ({ slides: [{ index: 2, heading: 'Vấn đề', bullets, speakerNotes: notes }] });

describe('BUG-035 G6 — dev notes in their work-item sense, quoted per line', () => {
  test('"mình đang làm gì" and an honest "chưa có số" are not dev notes', () => {
    expect(cur.detectDevNotes(deck('Agent hay quên mình đang làm gì.\nMình chưa có số cho đội mình.'))).toEqual([]);
  });
  test('"tính năng export đang làm" and "chưa có tài liệu" are', () => {
    const f = cur.detectDevNotes(deck('Mọi thứ ổn.\nTính năng export đang làm.\nChúng ta chưa có tài liệu cho phần này.'));
    expect(f.map((x) => x.quote)).toEqual(['Tính năng export đang làm.', 'Chúng ta chưa có tài liệu cho phần này.']);
  });
  test('keep suppresses a line the user chose to keep; keep is a valid action', () => {
    const f = cur.detectDevNotes(deck('Còn lại hai việc nhỏ.'), null, { keep: [{ slide: 2, quote: 'Còn lại hai việc nhỏ.' }] });
    expect(f).toEqual([]);
    expect(cur.ACTIONS).toContain('keep');
    expect(cur.enforceMaterialRule([{ action: 'keep', material: true }], { type: 'project-proposal' }).ok).toBe(true);
  });
});

describe('BUG-035 G6 — backstage', () => {
  const decisions = [
    { slide: 6, quote: 'Tốn thêm bao nhiêu?', action: 'backstage', question: 'Tốn thêm bao nhiêu?', preparedAnswer: 'Chưa có số.' },
    { slide: 4, quote: 'Cursor: file trạng thái', action: 'backstage', reason: 'chi tiết kỹ thuật' },
    { slide: 6, quote: 'Chưa có số', action: 'reframe', reframedAs: 'thử 2 tuần sẽ đo' },
    { slide: 3, quote: 'Câu cũ', action: 'reframe', reframedAs: 'Câu mới đã có' },
  ];
  const manifest = { slides: [{ index: 3, heading: 'x', bullets: ['Câu mới đã có'] }, { index: 6, heading: 'y', bullets: ['Chưa có số'] }] };
  const md = cur.buildBackstage(decisions, { title: 'T', lang: 'vi', manifest, contentMap: { items: [{ id: 'C16', text: 'Số liệu README', decision: 'DROP', reason: 'số đã cũ' }] } });
  test('Vietnamese headings', () => {
    expect(md).toMatch(/## Câu hỏi khó có thể gặp/);
    expect(md).toMatch(/## Đã bỏ/);
  });
  test('a tough question is not repeated under open items', () => {
    const open = md.split('## Việc còn mở')[1].split('## ')[0];
    expect(open).not.toMatch(/Tốn thêm/);
    expect(open).toMatch(/Cursor/);
  });
  test('only reframes present on the slides are listed as done; others pending', () => {
    const done = md.split('## Đã diễn đạt lại trên slide')[1].split('## ')[0];
    expect(done).toMatch(/Câu mới đã có/);
    expect(done).not.toMatch(/thử 2 tuần/);
    expect(md).toMatch(/## Diễn đạt lại nhưng chưa có trên slide[\s\S]*thử 2 tuần/);
  });
  test('Removed lists Content Map DROP items', () => {
    expect(md).toMatch(/Content Map C16: Số liệu README — số đã cũ/);
  });
});

describe('BUG-035 G6 — consistency and placeholders', () => {
  test('before vs after the session for the same fact is flagged', () => {
    const m = { slides: [{ index: 7, heading: 'Bắt đầu', bullets: ['Cài theo hướng dẫn trong kênh'], speakerNotes: 'Mình sẽ gửi hướng dẫn cài vào kênh ngay sau buổi.' }] };
    const out = cur.checkConsistency(m, [{ name: 'backstage', text: 'Gửi hướng dẫn cài vào kênh trước buổi.' }]);
    expect(out).toHaveLength(1);
    expect(out[0].kind).toBe('time');
  });
  test('different numbers for the same thing are flagged; ranges are not', () => {
    const m = { slides: [{ index: 8, heading: 'Đề nghị', bullets: ['Một đội thử 2 tuần'], speakerNotes: 'Mình đề nghị một đội thử 3 tuần.' }] };
    expect(cur.checkConsistency(m).map((x) => x.kind)).toEqual(['number']);
    expect(cur.checkConsistency({ slides: [{ index: 5, heading: 'Demo', speakerNotes: 'Demo 4 phút trên repo nhỏ.' }] }, [{ name: 'b', text: 'Slide 5 khoảng 5 phút (demo 4 phút) trên repo nhỏ.' }])).toEqual([]);
  });
  test('findPlaceholders finds fill-in markers but not cues', () => {
    const m = { slides: [{ index: 7, heading: 'x', bullets: ['Hỏi: [điền tên + kênh trước buổi]'], speakerNotes: '[click] Có gì vướng [pause] thì hỏi.' }] };
    expect(cur.findPlaceholders(m)).toEqual([{ slide: 7, location: 'slide', placeholder: '[điền tên + kênh trước buổi]' }]);
  });
});
