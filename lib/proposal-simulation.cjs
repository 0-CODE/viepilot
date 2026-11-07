'use strict';

/**
 * Rehearsal Hall — deterministic simulation inputs (ENH-121).
 *
 * buildTimeline: the spoken script laid out on a clock (slide → click cue → line), from the speaker
 *   notes, a per-language speaking rate and the planned per-slide time (planDuration).
 * slideLoad: per-slide cognitive-load inputs (words, numbers, jargon, bullets, builds) → 0–100.
 * selectHall: who sits in the hall (listeners) and who observes.
 *
 * Listener reactions come from persona subagents (templates/proposal/simulation/listener-prompt.md);
 * everything here is reproducible. Zero dependencies.
 */

const { planDuration } = require('./proposal-script.cjs');

const WPM = Object.freeze({ vi: 150, en: 140, default: 140 });
const PAUSE_SEC = 1.5;
const CLICK = /\[click\]/gi;
const PAUSE = /\[(?:pause|dừng|dung)\]/gi;
const CUES = /\[(?:click|pause|stress|dừng|dung|nhấn|nhan)\]/gi;

const words = (t) => (String(t || '').replace(CUES, ' ').match(/[\p{L}\p{N}][\p{L}\p{N}'’.,%-]*/gu) || []).length;

/** Split notes into click-cue groups, then sentences. */
function splitNotes(notes) {
  const groups = String(notes || '').split(CLICK);
  const out = [];
  groups.forEach((g, cue) => {
    const sentences = g.split(/(?<=[.!?…])\s+|\n+/).map((x) => x.trim()).filter(Boolean);
    for (const text of sentences) out.push({ cue, text });
  });
  return out;
}

/**
 * @param {{slides: {index?:number, heading?:string, speakerNotes?:string, optional?:boolean}[]}} manifest
 * @param {{durationMin?: number, lang?: string, wpm?: number}} [opts]
 * @returns {{segments: {slide:number, cue:number, lineIdx:number, text:string, words:number, tStart:number, tEnd:number}[],
 *            slides: {slide:number, heading:string, plannedSec:number, spokenSec:number, overrun:boolean, underrun:boolean, start:number, end:number}[],
 *            totalSec: number, plannedTotalSec: number, wpm: number}}
 */
function buildTimeline(manifest, opts = {}) {
  const slides = (manifest && manifest.slides) || [];
  const wpm = opts.wpm || WPM[opts.lang] || WPM.default;
  const qaSec = Math.max(0, Number(manifest && manifest.qaSec) || 0);
  const plan = opts.durationMin ? planDuration(slides, opts.durationMin, { qaSec }) : slides.map(() => ({ seconds: 0, fixedSec: 0 }));
  const segments = [];
  const perSlide = [];
  let t = 0;
  slides.forEach((s, i) => {
    const slide = s.index || i + 1;
    const start = t;
    const lines = splitNotes(s.speakerNotes);
    if (!lines.length) lines.push({ cue: 0, text: s.heading || '' });
    lines.forEach((ln, lineIdx) => {
      const w = words(ln.text);
      const pauses = (ln.text.match(PAUSE) || []).length;
      const dur = Math.max(1, (w / wpm) * 60 + pauses * PAUSE_SEC);
      segments.push({ slide, cue: ln.cue, lineIdx, text: ln.text.replace(CUES, '').replace(/\s+/g, ' ').trim(), words: w, tStart: round(t), tEnd: round(t + dur) });
      t += dur;
    });
    const planned = (plan[i] && plan[i].seconds) || 0;
    const spoken = t - start;
    // Fixed block (live demo, video): the room is still on this slide, nobody is reading notes (BUG-035 G5).
    const fixedSec = Math.max(0, Number(s.fixedSec) || 0);
    if (fixedSec) {
      segments.push({ slide, cue: 'fixed', lineIdx: lines.length, text: `[${s.fixedLabel || 'demo'}]`, words: 0, fixed: true, tStart: round(t), tEnd: round(t + fixedSec) });
      t += fixedSec;
    }
    perSlide.push({ slide, heading: s.heading || '', plannedSec: planned, fixedSec, spokenSec: round(spoken), overrun: planned > 0 && spoken > planned * 1.15, underrun: planned > 0 && spoken < planned * 0.6, start: round(start), end: round(t) });
  });
  if (qaSec && slides.length) {
    segments.push({ slide: perSlide[perSlide.length - 1].slide, cue: 'qa', lineIdx: 0, text: '[Q&A]', words: 0, fixed: true, tStart: round(t), tEnd: round(t + qaSec) });
    t += qaSec;
  }
  const plannedTotalSec = perSlide.reduce((a, s) => a + s.plannedSec + s.fixedSec, 0) + qaSec;
  return { segments, slides: perSlide, totalSec: round(t), plannedTotalSec, qaSec, wpm };
}

const round = (n) => Math.round(n * 10) / 10;

/**
 * @param {{heading?:string, bullets?:string[], body?:string, speakerNotes?:string, builds?:number[]|'auto'}} slide
 * @returns {{words:number, numbers:number, jargon:number, bullets:number, builds:number, density:number, score:number}}
 */
function slideLoad(slide) {
  const bullets = Array.isArray(slide.bullets) ? slide.bullets : slide.body ? String(slide.body).split('\n').filter(Boolean) : [];
  const text = [slide.heading, ...bullets].filter(Boolean).join(' ');
  const w = words(text);
  const numbers = (text.match(/\d[\d.,]*%?/g) || []).length;
  const jargon = (text.match(/\b[A-Z]{2,}[A-Z0-9]*\b|\b[a-z]+[A-Z]\w*\b|\b\w*\d\w*[A-Za-z]\w*\b/g) || []).length;
  const builds = Array.isArray(slide.builds) ? slide.builds.length : (String(slide.speakerNotes || '').match(CLICK) || []).length;
  const density = bullets.length ? w / bullets.length : w;
  // Weights: words dominate; numbers and jargon add effort; many bullets or builds add switching cost.
  const raw = w * 1.2 + numbers * 4 + jargon * 5 + Math.max(0, bullets.length - 3) * 6 + Math.max(0, builds - 4) * 3 + Math.max(0, density - 12) * 1.5;
  return { words: w, numbers, jargon, bullets: bullets.length, builds, density: round(density), score: Math.max(0, Math.min(100, Math.round(raw))) };
}

module.exports = { WPM, PAUSE_SEC, splitNotes, buildTimeline, slideLoad, countWords: words };

// ── Listener output ───────────────────────────────────────────────────────────

const FUNNEL = Object.freeze(['aware', 'understand', 'agree', 'act']);
const clamp = (v, lo, hi, d) => (typeof v === 'number' && Number.isFinite(v) ? Math.max(lo, Math.min(hi, v)) : d);
const normQ = (t) => String(t || '').toLowerCase().replace(/\s+/g, ' ').trim();
/**
 * A citation is a selective quote from the segment (BUG-036): it must appear in the segment and, unless the segment
 * is very short (≤ 6 words, e.g. "[demo]"), be at most 60% of it — a copy of the whole segment proves nothing.
 */
const cites = (line, text) => {
  const l = normQ(line);
  const t = normQ(text);
  if (l.length < 4 || !t.includes(l)) return false;
  return words(t) <= 6 || l.length <= t.length * 0.6;
};
const isFullCopy = (line, text) => { const l = normQ(line); return l.length > 0 && l === normQ(text); };

/**
 * Slides whose image the listener actually opened, from its transcript (Claude Code JSONL entries): Read tool calls
 * whose file_path is one of `imagePaths` (slide number = position in the list + 1, or the `slide-N` in the name).
 * @returns {number[]}
 */
function verifyVisual(entries, imagePaths = []) {
  const byPath = new Map(imagePaths.map((p, i) => [String(p), i + 1]));
  const seen = new Set();
  for (const e of entries || []) {
    const content = e && e.message && Array.isArray(e.message.content) ? e.message.content : [];
    for (const c of content) {
      if (!c || c.type !== 'tool_use' || c.name !== 'Read' || !c.input) continue;
      const fp = String(c.input.file_path || '');
      if (byPath.has(fp)) seen.add(byPath.get(fp));
      else if (imagePaths.some((p) => p.endsWith(fp) || fp.endsWith(String(p).split('/').pop()))) {
        const m = fp.match(/slide-(\d+)\.(?:jpe?g|png)$/i);
        if (m) seen.add(Number(m[1]));
      }
    }
  }
  return [...seen].sort((a, b) => a - b);
}

/**
 * Validate one listener's JSON against the timeline. Negative reactions must quote the segment that
 * caused them; unsupported ones are dropped (and logged), never kept as data.
 * The first state sets the listener's baseline (starting below 100 is not a drop). An unsupported
 * attention drop holds the attention at its last supported level; staying at the same lower level
 * afterwards is the same drop, so it is counted once, not once per segment.
 * @returns {{listener: object|null, dropped: number, log: string[]}}
 */
function parseListener(raw, timeline, opts = {}) {
  const log = [];
  let data = raw;
  if (typeof raw === 'string') {
    try { data = JSON.parse(raw.replace(/^```(?:json)?\s*|\s*```$/g, '')); } catch (e) { return { listener: null, dropped: 0, log: [`invalid JSON: ${e.message}`] }; }
  }
  if (!data || typeof data !== 'object' || !Array.isArray(data.states)) return { listener: null, dropped: 0, log: ['missing states[]'] };
  const segs = timeline.segments;
  // Mechanical quoting (BUG-036): half or more of the states carry a copy of their whole segment.
  const fullCopies = data.states.filter((st) => segs[st.seg] && st.line && words(segs[st.seg].text) > 6 && isFullCopy(st.line, segs[st.seg].text)).length;
  const quoteQuality = fullCopies && fullCopies >= data.states.length / 2 ? 'mechanical' : data.states.some((st) => st.line) ? 'selective' : 'none';
  if (quoteQuality === 'mechanical') log.push(`mechanical quoting: ${fullCopies}/${data.states.length} states copy their whole segment`);
  let dropped = 0;
  let prevAttention = null; // last kept attention; null until the first state sets the baseline
  let prevReported = null; // last attention the listener reported (detects a new drop vs. staying low)
  const states = [];
  for (const st of data.states) {
    const seg = segs[st.seg];
    if (!seg) { log.push(`state for unknown segment ${st.seg} ignored`); continue; }
    const reported = clamp(st.attention, 0, 100, prevReported === null ? 100 : prevReported);
    const s = {
      seg: st.seg,
      attention: reported,
      comprehension: clamp(st.comprehension, 0, 100, 70),
      emotion: clamp(st.emotion, -2, 2, 0),
      funnelStage: FUNNEL.includes(st.funnelStage) ? st.funnelStage : 'aware',
      question: st.question || null,
      objection: st.objection || null,
      line: st.line || null,
    };
    const attentionDrop = prevAttention !== null && prevAttention - s.attention > 20;
    const newDrop = attentionDrop && (prevReported === null || prevReported - s.attention > 20);
    const negative = newDrop || s.comprehension < 40 || s.emotion < 0 || !!s.objection;
    if ((negative || attentionDrop) && !cites(s.line, seg.text)) {
      if (negative) {
        dropped++;
        log.push(`segment ${st.seg}: negative reaction without a quote from the segment — dropped`);
      }
      if (attentionDrop) s.attention = prevAttention;
      s.comprehension = Math.max(s.comprehension, 40); s.emotion = Math.max(s.emotion, 0); s.objection = null; s.line = null;
    }
    prevAttention = s.attention;
    prevReported = reported;
    states.push(s);
  }
  let tuneOut = null;
  if (data.tuneOut && segs[data.tuneOut.seg]) {
    if (cites(data.tuneOut.line, segs[data.tuneOut.seg].text)) {
      tuneOut = { seg: data.tuneOut.seg, t: segs[data.tuneOut.seg].tStart, reason: String(data.tuneOut.reason || ''), line: data.tuneOut.line };
    } else { dropped++; log.push('tuneOut without a quote from its segment — dropped'); }
  }
  const regainedAt = tuneOut && Number.isInteger(data.regainedAt) && data.regainedAt > tuneOut.seg && segs[data.regainedAt] ? data.regainedAt : null;
  return {
    listener: {
      personaId: Number(data.personaId),
      states,
      tuneOut,
      regainedAt,
      recall24h: (Array.isArray(data.recall24h) ? data.recall24h : []).map(String).filter(Boolean).slice(0, 5),
      ...visualFields(data, timeline, opts),
      quoteQuality,
      verdict: { wouldAct: !!(data.verdict && data.verdict.wouldAct), quote: String((data.verdict && data.verdict.quote) || '') },
      evaluation: data.evaluation && typeof data.evaluation === 'object' ? data.evaluation : { keep: [], improve: [] },
    },
    dropped,
    log,
  };
}

/** slidesSeen / visualNotes as claimed, intersected with the verified reads when the orchestrator has them. */
function visualFields(data, timeline, opts) {
  const slideCount = opts.slideCount || ((timeline && timeline.slides) || []).length;
  const inDeck = (n) => Number.isInteger(n) && n >= 1 && (!slideCount || n <= slideCount);
  const claimed = [...new Set((Array.isArray(data.slidesSeen) ? data.slidesSeen : []).map(Number).filter(inDeck))].sort((a, b) => a - b);
  const verified = Array.isArray(opts.verifiedSlides) ? opts.verifiedSlides.map(Number) : null;
  const seen = verified ? claimed.filter((n) => verified.includes(n)) : claimed;
  const visualNotes = (Array.isArray(data.visualNotes) ? data.visualNotes : [])
    .filter((v) => v && inDeck(Number(v.slide)) && String(v.note || '').trim())
    .map((v) => ({ slide: Number(v.slide), note: String(v.note).trim().slice(0, 240) }));
  const visual = !slideCount || !seen.length ? 'none' : seen.length >= slideCount ? 'seen' : 'partial';
  return { slidesSeen: seen, slidesClaimed: claimed, visualNotes, visual, visualVerified: verified !== null };
}

// ── Hall audience ─────────────────────────────────────────────────────────────

const HALL_MIN = 12;
const HALL_MAX = 16;

/**
 * Default hall: the quick council, the personas mapped to the primary audience roles, the type's own
 * personas (internal / academic), then the rest of the type's full set until 12–16 seats are filled. `hall: 'all'` seats every reviewer persona.
 * #20 always sits in the hall; observers (#31) watch but do not count as audience.
 * @returns {{listeners: number[], observers: number[], primary: number[]}}
 */
function selectHall(opts = {}) {
  const review = require('./proposal-review.cjs');
  const { hall = 'default', add = [], remove = [], audienceProfile } = opts;
  const personas = review.loadPersonas();
  // Only personas who can be in this room (BUG-035 G1): no investor/procurement/customer at an internal talk.
  const reviewerIds = personas.filter((p) => !p.observer && (hall === 'all' || review.isEligible(p, opts))).map((p) => p.id);
  const observers = personas.filter((p) => p.observer).map((p) => p.id);
  const removed = new Set(remove.map(Number).filter((id) => id !== review.HUMANITY_ID));

  const primary = [];
  if (audienceProfile && Array.isArray(audienceProfile.roles)) {
    const roleMap = review.loadRoleMapping();
    for (const r of audienceProfile.roles.filter((x) => x.weight === 'primary')) for (const id of roleMap[r.id] || []) if (!primary.includes(id)) primary.push(id);
  }

  let seats;
  if (hall === 'all') seats = reviewerIds.slice();
  else {
    const quick = review.selectPersonas({ ...opts, mode: 'quick' });
    const full = review.selectPersonas({ ...opts, mode: 'full' });
    // Type-specific personas (internal 21–25, academic 26–30) before the general external set.
    const scope = opts.type === 'internal-presentation' ? 'internal' : opts.type === 'research-proposal' ? 'research' : null;
    const scoped = scope ? personas.filter((p) => p.scope === scope).map((p) => p.id) : [];
    seats = [];
    for (const id of [...quick, ...primary, ...scoped, ...full]) {
      if (seats.length >= HALL_MAX) break;
      if (!seats.includes(id) && reviewerIds.includes(id)) seats.push(id);
    }
    // Pad toward HALL_MIN with eligible personas only; an internal room may end up smaller (reported as `short`).
    for (const id of reviewerIds) { if (seats.length >= HALL_MIN) break; if (!seats.includes(id)) seats.push(id); }
  }
  for (const id of add.map(Number)) if (reviewerIds.includes(id) && !seats.includes(id)) seats.push(id);
  seats = seats.filter((id) => !removed.has(id));
  if (!seats.includes(review.HUMANITY_ID)) seats.push(review.HUMANITY_ID);
  return { listeners: seats.sort((a, b) => a - b), observers, primary: primary.filter((id) => seats.includes(id)), short: seats.length < HALL_MIN };
}

module.exports.FUNNEL = FUNNEL;
module.exports.parseListener = parseListener;
module.exports.verifyVisual = verifyVisual;
module.exports.selectHall = selectHall;
module.exports.HALL_MIN = HALL_MIN;
module.exports.HALL_MAX = HALL_MAX;
