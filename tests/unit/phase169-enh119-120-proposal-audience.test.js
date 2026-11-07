'use strict';

/**
 * Phase 169 (ENH-119 + ENH-120) — end-to-end contract:
 * free text → hints → audience profile → recommendation → variant skeleton → personas → rubric.
 * Unit detail lives in phase169-t1..t5 test files.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const gen = require('../../lib/proposal-generator.cjs');
const audience = require('../../lib/proposal-audience.cjs');
const review = require('../../lib/proposal-review.cjs');
const { DURATIONS } = require('../../lib/proposal-script.cjs');

const VOICE_IDS = gen.VOICE_LEVELS.map((v) => v.id);

function run(text, lang = 'vi') {
  const hints = audience.extractAudienceHints(text, { lang });
  const profile = audience.normalizeAudienceProfile(hints.raw);
  const rec = audience.recommendProposalType(profile, { lang });
  return { hints, profile, rec };
}

const FLOWS = [
  ['Buổi thuyết minh kickoff đề tài cấp bộ trước hội đồng khoa học', 'research-proposal', 'kickoff'],
  ['Báo cáo nghiệm thu đề tài trước hội đồng khoa học', 'research-proposal', 'progress-report'],
  ['Hồ sơ xin tài trợ Nafosted cho đề tài nghiên cứu', 'research-proposal', 'grant-proposal'],
  ['Bảo vệ luận văn thạc sĩ', 'research-proposal', 'defense'],
  ['Giới thiệu kết quả nghiên cứu cho doanh nghiệp để chuyển giao công nghệ', 'research-proposal', 'tech-transfer'],
  ['Báo cáo tiến độ dự án lên ban giám đốc để xin duyệt ngân sách', 'internal-presentation', 'leadership-report'],
  ['Đào tạo nhân viên mới về quy trình bán hàng', 'internal-presentation', 'training'],
  ['Giới thiệu công cụ mới cho phòng kinh doanh, demo trực tiếp', 'internal-presentation', 'feature-demo'],
  ['Họp toàn công ty cuối năm, khoảng 200 người', 'internal-presentation', 'all-hands'],
  ['Giới thiệu dự án mới cho các đồng nghiệp trong team', 'internal-presentation', 'team-intro'],
];

describe('Phase 169 — end-to-end audience → type → personas', () => {
  test.each(FLOWS)('%s → %s/%s with a valid downstream plan', (text, typeId, variant) => {
    const { profile, rec } = run(text);
    expect(rec.typeId).toBe(typeId);
    expect(rec.variant).toBe(variant);

    expect(() => gen.validateType(rec.typeId)).not.toThrow();
    expect(gen.validateVariant(rec.typeId, rec.variant)).toBe(variant);

    const skeleton = gen.getSkeleton(rec.typeId, rec.variant);
    expect(skeleton.length).toBeGreaterThanOrEqual(7);

    expect(DURATIONS).toContain(audience.suggestDuration(profile, rec));
    expect(VOICE_IDS).toContain(audience.suggestVoice(profile, rec));

    const ids = review.selectPersonas({ type: rec.typeId, variant: rec.variant, audienceProfile: profile, mode: 'quick' });
    expect(ids).toContain(20);
    expect(ids.length).toBeGreaterThanOrEqual(6);
    expect(ids.length).toBeLessThanOrEqual(8);

    const codes = review.getRubric(rec.typeId).map((c) => c.code || c.id);
    if (typeId === 'research-proposal') expect(codes).toEqual(expect.arrayContaining(['R1', 'R2', 'R3']));
    else expect(codes).not.toContain('R1');
  });

  test('every intake gap group is a known key and a complete profile has none', () => {
    const KEYS = ['roles', 'decisionMaker', 'knowledgeSize', 'formatGoal'];
    const empty = audience.findIntakeGaps(audience.normalizeAudienceProfile({}));
    expect(empty).toEqual(KEYS);
    const full = audience.normalizeAudienceProfile({
      roles: ['leadership'], rolePrimary: ['leadership'],
      decisionMaker: { role: 'leadership', cares: ['cost'] },
      knowledge: 'mixed', size: 'small', format: 'in-person', goal: 'approve',
    });
    expect(audience.findIntakeGaps(full)).toEqual([]);
  });

  test('existing external types still validate and keep their stock templates', () => {
    for (const t of ['project-proposal', 'tech-architecture', 'product-pitch', 'general']) {
      expect(() => gen.validateType(t)).not.toThrow();
      expect(path.basename(gen.resolveTemplate(t, 'pptx', ROOT))).toBe(`${t}.pptx`);
    }
  });

  test('consult prompt template ships under templates/ (installed by the 3.16.1 installer)', () => {
    const p = path.join(ROOT, 'templates', 'proposal', 'purpose-consult-prompt.md');
    const txt = fs.readFileSync(p, 'utf8');
    for (const ph of ['{user_text}', '{hints_json}', '{gaps}', '{recommendation_json}', '{lang}']) {
      expect(txt).toContain(ph);
    }
  });
});
