'use strict';

const c = require('../../lib/proposal-curation.cjs');

const slide = (index, bullets, extra = {}) => ({ index, heading: extra.heading || `Slide ${index}`, bullets, ...extra });
const rules = (findings) => findings.map((f) => f.rule);

describe('Phase 173.3 — detectProcessLeak', () => {
  test.each([
    ['What changed in v3.13.0', 'version-number'],
    ['Delivered in 2.4.1', 'version-number'],
    ['Phase 165 voice levels', 'internal-id'],
    ['Giai đoạn 3 hoàn tất', 'internal-id'],
    ['See ENH-117 for details', 'internal-id'],
    ['Tagged vp-p169-t169.3', 'internal-id'],
    ['Commit 9762d57 adds provenance', 'commit-hash'],
    ['Logic lives in lib/proposal-generator.cjs', 'file-or-function'],
    ['Call buildOutline() first', 'file-or-function'],
    ['Added 4 voice levels', 'changelog-verb'],
    ['Fixed the cliché matcher', 'changelog-verb'],
    ['• Refactored the installer', 'changelog-verb'],
    ['Đã thêm 4 mức giọng', 'changelog-verb'],
    ['Sửa lỗi bộ lọc', 'changelog-verb'],
    ['Bổ sung bảng ngân sách', 'changelog-verb'],
  ])('flags "%s" as %s', (text, rule) => {
    expect(rules(c.detectProcessLeak({ slides: [slide(1, [text])] }, { type: 'general' }))).toContain(rule);
  });

  test.each([
    'Teams onboard in 2 days instead of 5',
    'You choose how boldly the deck speaks',
    'Rated 4.8 by 120 customers',
    'Doanh thu tăng 32% trong quý 3',
    'Mỗi nhóm tiết kiệm 6 giờ mỗi tuần',
  ])('leaves clean audience content alone: "%s"', (text) => {
    expect(c.detectProcessLeak({ slides: [slide(1, [text])] }, { type: 'general' })).toEqual([]);
  });

  test('changelog verbs opening a sentence in the notes are flagged too', () => {
    const f = c.detectProcessLeak({ slides: [slide(1, ['x benefit'], { speakerNotes: 'Mọi người thấy rồi. Đã thêm tính năng mới.' })] }, { type: 'general' });
    expect(f.map((x) => [x.rule, x.location])).toContainEqual(['changelog-verb', 'notes']);
  });

  test('a dated "what we did" list is flagged, except where milestones are expected', () => {
    const m = { slides: [slide(2, ['2026-10-01 kickoff', '2026-10-15 design', '2026-11-01 build'])] };
    expect(rules(c.detectProcessLeak(m, { type: 'general' }))).toContain('dated-list');
    expect(rules(c.detectProcessLeak(m, { type: 'research-proposal', variant: 'progress-report' }))).not.toContain('dated-list');
    expect(rules(c.detectProcessLeak(m, { type: 'internal-presentation', variant: 'leadership-report' }))).not.toContain('dated-list');
  });

  test('"first we… then we…" narration is flagged (vi + en)', () => {
    expect(rules(c.detectProcessLeak({ slides: [slide(3, ['Đầu tiên chúng tôi khảo sát', 'Sau đó chúng tôi xây dựng'])] }, {}))).toContain('process-narration');
    expect(rules(c.detectProcessLeak({ slides: [slide(3, ['First we surveyed users', 'Then we built it'])] }, {}))).toContain('process-narration');
  });

  test('technical decks may name files and functions', () => {
    const m = { slides: [slide(1, ['Ingest runs in lib/ingest.cjs via parseFeed()'])] };
    expect(rules(c.detectProcessLeak(m, { type: 'tech-architecture' }))).not.toContain('file-or-function');
    expect(rules(c.detectProcessLeak(m, { type: 'general' }))).toContain('file-or-function');
  });
});

test('Vietnamese capital Đ at the start of a bullet is kept (Unicode-aware strip)', () => {
  expect(rules(c.detectProcessLeak({ slides: [slide(1, ['• Đã sửa lỗi đăng nhập'])] }, { type: 'general' }))).toContain('changelog-verb');
});

describe('Phase 173.3 — detectDevNotes', () => {
  test.each([
    ['Tính năng export chưa làm', 'not-done'],
    ['Phần thanh toán đang làm', 'not-done'],
    ['Sẽ làm sau khi có ngân sách', 'not-done'],
    ['TODO: hoàn thiện báo cáo', 'not-done'],
    ['Export is not yet available', 'not-done'],
    ['WIP dashboard', 'not-done'],
    ['Các việc còn lại', 'watch-out'],
    ['Cần lưu ý về hiệu năng', 'watch-out'],
    ['Known issues with sync', 'watch-out'],
    ['Limitations of the pilot', 'watch-out'],
    ['Tạm thời dùng workaround', 'hedge'],
    ['Hệ thống chưa ổn định', 'hedge'],
    ['Hopefully ready in Q3', 'hedge'],
    ['tinh nang chua lam', 'not-done'],
    ['cac viec con lai', 'watch-out'],
  ])('"%s" → %s', (text, category) => {
    const [f] = c.detectDevNotes({ slides: [slide(1, [text])] });
    expect(f).toMatchObject({ category, slide: 1, location: 'slide' });
  });

  test('no false positives from accent stripping or partial words', () => {
    expect(c.detectDevNotes({ slides: [slide(1, ['Quỹ đầu tư mạo hiểm', 'Báo cáo quý 3', 'Chuachua là tên riêng', 'Pendingham Ltd'])] })).toEqual([]);
  });

  test('material hint for budget, delay, security, legal', () => {
    const f = c.detectDevNotes({ slides: [slide(1, ['Còn lại rủi ro vượt ngân sách', 'Security review pending'])] });
    expect(f.map((x) => x.materialHint)).toEqual([true, true]);
  });

  test('scans speaker notes and script lines', () => {
    const f = c.detectDevNotes({ slides: [slide(1, ['ok'], { speakerNotes: 'Phần này chưa xong' })] }, { lines: [{ slide: 2, text: 'This part is WIP' }] });
    expect(f.map((x) => [x.slide, x.location])).toEqual([[1, 'notes'], [2, 'script']]);
  });
});

describe('Phase 173.3 — enforceMaterialRule', () => {
  test('decision audiences: material items only fix or reframe', () => {
    const r = c.enforceMaterialRule([{ material: true, action: 'backstage' }, { material: true, action: 'remove' }, { material: true, action: 'reframe' }, { material: false, action: 'backstage' }], { type: 'internal-presentation', variant: 'leadership-report' });
    expect(r.ok).toBe(false);
    expect(r.violations.map((v) => v.action)).toEqual(['backstage', 'remove']);
  });

  test.each([['project-proposal', null], ['research-proposal', 'grant-proposal'], ['research-proposal', 'progress-report']])('%s/%s is a decision audience', (t, v) => {
    expect(c.isDecisionAudience(t, v)).toBe(true);
  });

  test('non-decision audiences may move material items backstage; unknown actions are rejected', () => {
    expect(c.enforceMaterialRule([{ material: true, action: 'backstage' }], { type: 'internal-presentation', variant: 'all-hands' }).ok).toBe(true);
    expect(c.enforceMaterialRule([{ material: false, action: 'hide' }], { type: 'general' }).ok).toBe(false);
  });
});
