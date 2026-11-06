'use strict';
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..', '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const gen = require('../../lib/proposal-generator.cjs');
const script = require('../../lib/proposal-script.cjs');

function mkSlides(n) {
  return Array.from({ length: n }, (_, i) => ({
    index: i + 1,
    heading: `Slide ${i + 1}`,
    speakerNotes: Array(30).fill('word').join(' ') + '.\nMột câu ngắn.',
    durationSec: 20 + (i % 3) * 10,
    optional: i > 0 && i < n - 1 && i % 3 === 0,
  }));
}

describe('ENH-117a human voice + script', () => {
  test('prompt-contract.md has the 6 headings', () => {
    const c = gen.loadPromptContract();
    for (const h of ['Voice', 'Rhythm', 'Narrative arc', 'Real material', 'Numbers', 'Banned clichés']) {
      expect(c).toMatch(new RegExp(`^## ${h}`, 'm'));
    }
  });

  test('VOICE_LEVELS shape, fallback and evidence rule', () => {
    expect(gen.VOICE_LEVELS.length).toBeGreaterThanOrEqual(4);
    for (const v of gen.VOICE_LEVELS) {
      expect(typeof v.level).toBe('number');
      expect(v.id).toBeTruthy();
      expect(v.label_vi).toBeTruthy();
      expect(v.label_en).toBeTruthy();
      expect(v.instruction).toBeTruthy();
    }
    expect(gen.buildVoiceInstruction(99)).toBe(gen.buildVoiceInstruction(2));
    expect(gen.buildVoiceInstruction(3, 'en')).toMatch(/evidence/i);
    expect(gen.buildVoiceInstruction(3, 'vi')).toMatch(/bằng chứng/);
  });

  test('detectCliches finds vi/en clichés', () => {
    expect(gen.detectCliches('Sản phẩm không chỉ nhanh mà còn rẻ.', 'vi').length).toBeGreaterThan(0);
    expect(gen.detectCliches('TRONG THỜI ĐẠI SỐ, mọi thứ thay đổi.', 'vi').length).toBeGreaterThan(0);
    expect(gen.detectCliches('We leverage synergy.', 'en').length).toBeGreaterThan(0);
  });

  test('detectCliches has no false positives', () => {
    expect(gen.detectCliches('A rare privilege for our team.', 'en')).toHaveLength(0);
    expect(gen.detectCliches('96% khách hàng quay lại.', 'vi')).toHaveLength(0);
  });

  test('validateSpeakerNotes flags spelled numbers, missing; accepts digits', () => {
    const bad = script.validateSpeakerNotes([{ speakerNotes: 'Ninety-six percent of users return.' }], 'en');
    expect(bad.ok).toBe(false);
    expect(bad.issues.map(i => i.code)).toContain('spelled-number');
    const vi = script.validateSpeakerNotes([{ speakerNotes: 'ninety-six percent khách hàng quay lại' }], 'vi');
    expect(vi.issues.map(i => i.code)).toContain('spelled-number');
    const viNum = script.validateSpeakerNotes([{ speakerNotes: 'chín mươi sáu phần trăm khách hàng quay lại' }], 'vi');
    expect(viNum.issues.map(i => i.code)).toContain('spelled-number');
    const missing = script.validateSpeakerNotes([{ speakerNotes: '' }], 'en');
    expect(missing.issues.map(i => i.code)).toContain('missing');
    const ok = script.validateSpeakerNotes([{ speakerNotes: '96% of users return.\nThat is the number.' }], 'en');
    expect(ok.ok).toBe(true);
  });

  test.each([5, 15, 30])('planDuration lands within 10%% of %d min and keeps cover+closing', min => {
    const slides = mkSlides(12);
    const plan = script.planDuration(slides, min);
    const total = plan.reduce((a, p) => a + p.seconds, 0);
    expect(Math.abs(total - min * 60)).toBeLessThanOrEqual(min * 60 * 0.1);
    expect(plan[0].include).toBe(true);
    expect(plan[plan.length - 1].include).toBe(true);
  });

  test('buildScriptMarkdown has header, slide sections and Q&A', () => {
    const md = script.buildScriptMarkdown({
      title: 'Demo', audience: 'Investors', voice: { id: 'balanced' },
      slides: mkSlides(6), qa: [{ question: 'Why now?', answer: 'Because 96%.' }],
    }, { minutes: 15 });
    expect(md).toMatch(/^# Script — Demo/);
    expect(md).toMatch(/### Slide 1 /);
    expect(md).toMatch(/Expected Q&A/);
    expect(md).toContain('Why now?');
  });

  test('workflow step headings strictly increase', () => {
    const heads = [...read('workflows/proposal.md').matchAll(/^## Step (\d+)([a-z]?)\b/gm)]
      .map(m => [Number(m[1]), m[2] || '']);
    expect(heads.length).toBeGreaterThan(5);
    for (let i = 1; i < heads.length; i++) {
      const [pn, pl] = heads[i - 1];
      const [n, l] = heads[i];
      expect(n > pn || (n === pn && l > pl)).toBe(true);
    }
  });

  test('workflow covers Voice Profile, Story Brief, addNotes and later-phase placeholders', () => {
    const w = read('workflows/proposal.md');
    expect(w).toContain('Voice Profile');
    expect(w).toContain('Story Brief');
    expect(w).toContain('addNotes');
    expect(w).toMatch(/Step 6b: Animation \(MANDATORY\)/);
    expect(w).toMatch(/Step 8b: Persona Review Council/);
  });

  test('SKILL.md documents --voice and --duration', () => {
    const s = read('skills/vp-proposal/SKILL.md');
    expect(s).toContain('--voice <1-4>');
    expect(s).toContain('--duration <5|15|30>');
    expect(s).toContain('-script.docx');
    expect(s).toMatch(/Voice Profile/);
    expect(s).toMatch(/Story Brief/);
  });
});
