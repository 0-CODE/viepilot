'use strict';

/**
 * Spoken speaker notes + script deliverables (ENH-117a, Phase 165).
 * Pure helpers: validation, duration planning, markdown script builder.
 */

const { detectCliches } = require('./proposal-generator.cjs');

const DURATIONS = [5, 15, 30];

const SPOKEN_NOTES_RULES = [
  'SPOKEN NOTES RULES:',
  '- Write the full words the presenter says. Not keywords, not an essay.',
  '- Spoken style: short sentences, one idea per line, a line break at each breath point.',
  '- Natural particles and contractions are fine (e.g. "nhe", "dung khong", "you know what").',
  '- Numbers stay as digits and symbols: 96%, 3x, $50K, 2026. Never spell them out',
  '  (never "chin muoi sau phan tram", never "ninety-six percent").',
  '- Optional stage cues in brackets: [dung] [nhan] [click].',
  '- No line longer than 40 words.',
].join('\n');

// --- spelled-number detection -------------------------------------------

const VI_NUM = 'không|một|mốt|hai|ba|bốn|tư|năm|lăm|sáu|bảy|tám|chín|mười|mươi|trăm|nghìn|ngàn|triệu|tỷ';
const VI_TAIL = `${VI_NUM}|phần trăm|lần`;
// number word followed by at least one more number word / unit
const VI_RE = new RegExp(
  `(?<![\\p{L}])(?:${VI_NUM})(?:\\s+(?:${VI_TAIL}))+(?![\\p{L}])`, 'iu'
);

const EN_UNITS = 'zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen';
const EN_TENS = 'twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety';
const EN_BIG = 'hundred|thousand|million|billion';
const EN_NUM = `${EN_UNITS}|${EN_TENS}|${EN_BIG}`;
const EN_RES = [
  // hyphenated: ninety-six
  new RegExp(`\\b(?:${EN_TENS})-(?:${EN_UNITS})\\b`, 'i'),
  // number followed by percent / times
  new RegExp(`\\b(?:${EN_NUM})\\s+(?:percent|per cent|times)\\b`, 'i'),
  // two or more number words in a row: one hundred, twenty five
  new RegExp(`\\b(?:${EN_NUM})(?:\\s+(?:and\\s+)?(?:${EN_NUM}))+\\b`, 'i'),
];

function findSpelledNumber(text, lang) {
  const t = text.normalize('NFC');
  const hits = [];
  if (!lang || lang === 'vi') {
    const m = VI_RE.exec(t);
    if (m) hits.push(m[0]);
  }
  if (!lang || lang === 'en') {
    for (const re of EN_RES) {
      const m = re.exec(t);
      if (m) { hits.push(m[0]); break; }
    }
  }
  return hits;
}

function wordCount(line) {
  return line.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * @param {Array<{speakerNotes?: string}>} slides
 * @param {string} [lang] 'vi' | 'en'
 * @returns {{ ok: boolean, issues: Array<{slideIndex: number, code: string, detail: string}> }}
 */
function validateSpeakerNotes(slides, lang) {
  const issues = [];
  (slides || []).forEach((slide, i) => {
    const slideIndex = i;
    const notes = slide && typeof slide.speakerNotes === 'string' ? slide.speakerNotes : '';
    if (!notes.trim()) {
      issues.push({ slideIndex, code: 'missing', detail: 'speakerNotes is empty' });
      return;
    }
    for (const hit of findSpelledNumber(notes, lang)) {
      issues.push({ slideIndex, code: 'spelled-number', detail: `spelled-out number: "${hit}" (use digits)` });
    }
    for (const line of notes.split(/\r?\n/)) {
      const n = wordCount(line);
      if (n > 40) {
        issues.push({ slideIndex, code: 'essay', detail: `line has ${n} words (max 40): "${line.trim().slice(0, 40)}..."` });
      }
    }
    for (const c of detectCliches(notes, lang)) {
      issues.push({ slideIndex, code: 'cliche', detail: `cliche: "${c.phrase}"` });
    }
  });
  return { ok: issues.length === 0, issues };
}

// --- duration planning ---------------------------------------------------

function baseSeconds(slide) {
  if (slide && Number(slide.durationSec) > 0) return Number(slide.durationSec);
  const words = wordCount((slide && slide.speakerNotes) || '');
  return Math.max(10, Math.round(words / 2.5)); // ~150 wpm
}

/**
 * @returns {Array<{ include: boolean, seconds: number }>} one entry per slide
 */
function planDuration(slides, minutes) {
  const list = slides || [];
  const last = list.length - 1;
  const budget = Math.max(0, Number(minutes) || 0) * 60;
  const dropOptional = minutes < 30;
  const plan = list.map((s, i) => {
    const core = i === 0 || i === last;
    const include = core || !(dropOptional && s && s.optional);
    return { include, seconds: include ? baseSeconds(s) : 0 };
  });
  const total = plan.reduce((a, p) => a + p.seconds, 0);
  if (total > budget && total > 0) {
    const scale = budget / total;
    for (const p of plan) if (p.include) p.seconds = Math.max(1, Math.floor(p.seconds * scale));
    // guard against the min-1s floor pushing us over budget
    let sum = plan.reduce((a, p) => a + p.seconds, 0);
    for (let i = plan.length - 1; sum > budget && i >= 0; i--) {
      while (plan[i].include && plan[i].seconds > 1 && sum > budget) { plan[i].seconds--; sum--; }
    }
  }
  return plan;
}

function mmss(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Build the script markdown for one duration.
 * manifest: { title, audience, voice, slides[], qa[] }
 */
function buildScriptMarkdown(manifest, opts) {
  const m = manifest || {};
  const minutes = (opts && opts.minutes) || 15;
  const slides = m.slides || [];
  const plan = planDuration(slides, minutes);
  const total = plan.reduce((a, p) => a + p.seconds, 0);
  const voice = m.voice ? (m.voice.id || m.voice.level || '') : '';
  const out = [];
  out.push(`# Script — ${m.title || 'Untitled'} (${minutes} min)`, '');
  out.push(`**Duration:** ${minutes} min (planned ${mmss(total)})  `);
  out.push(`**Audience:** ${m.audience || ''}  `);
  out.push(`**Voice:** ${voice}`, '', '---', '');
  let n = 0;
  slides.forEach((s, i) => {
    if (!plan[i].include) return;
    n++;
    const num = s.index || i + 1;
    out.push(`### Slide ${num} — ${s.heading || ''} (${mmss(plan[i].seconds)})`, '');
    out.push((s.speakerNotes || '').trim(), '');
    const next = slides.slice(i + 1).find((_, k) => plan[i + 1 + k].include);
    if (s.transition) out.push(`_Transition: ${s.transition}_`, '');
    else if (next) out.push(`_Transition: next, ${next.heading || ''}._`, '');
  });
  out.push('---', '', '## Câu hỏi dự kiến / Expected Q&A', '');
  const qa = Array.isArray(m.qa) ? m.qa : [];
  qa.forEach((item, k) => {
    out.push(`**Q${k + 1}. ${item.question || item.q || ''}**`, '');
    out.push(`${item.answer || item.a || ''}`, '');
  });
  return out.join('\n');
}

module.exports = {
  SPOKEN_NOTES_RULES,
  DURATIONS,
  validateSpeakerNotes,
  planDuration,
  buildScriptMarkdown,
};
