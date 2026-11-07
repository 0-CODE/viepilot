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
  const plan = opts.durationMin ? planDuration(slides, opts.durationMin) : slides.map(() => ({ seconds: 0 }));
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
    perSlide.push({ slide, heading: s.heading || '', plannedSec: planned, spokenSec: round(spoken), overrun: planned > 0 && spoken > planned * 1.15, underrun: planned > 0 && spoken < planned * 0.6, start: round(start), end: round(t) });
  });
  return { segments, slides: perSlide, totalSec: round(t), plannedTotalSec: perSlide.reduce((a, s) => a + s.plannedSec, 0), wpm };
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
const cites = (line, text) => {
  const l = String(line || '').toLowerCase().replace(/\s+/g, ' ').trim();
  return l.length >= 4 && String(text || '').toLowerCase().replace(/\s+/g, ' ').includes(l);
};

/**
 * Validate one listener's JSON against the timeline. Negative reactions must quote the segment that
 * caused them; unsupported ones are dropped (and logged), never kept as data.
 * The first state sets the listener's baseline (starting below 100 is not a drop). An unsupported
 * attention drop holds the attention at its last supported level; staying at the same lower level
 * afterwards is the same drop, so it is counted once, not once per segment.
 * @returns {{listener: object|null, dropped: number, log: string[]}}
 */
function parseListener(raw, timeline) {
  const log = [];
  let data = raw;
  if (typeof raw === 'string') {
    try { data = JSON.parse(raw.replace(/^```(?:json)?\s*|\s*```$/g, '')); } catch (e) { return { listener: null, dropped: 0, log: [`invalid JSON: ${e.message}`] }; }
  }
  if (!data || typeof data !== 'object' || !Array.isArray(data.states)) return { listener: null, dropped: 0, log: ['missing states[]'] };
  const segs = timeline.segments;
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
      verdict: { wouldAct: !!(data.verdict && data.verdict.wouldAct), quote: String((data.verdict && data.verdict.quote) || '') },
      evaluation: data.evaluation && typeof data.evaluation === 'object' ? data.evaluation : { keep: [], improve: [] },
    },
    dropped,
    log,
  };
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
module.exports.selectHall = selectHall;
module.exports.HALL_MIN = HALL_MIN;
module.exports.HALL_MAX = HALL_MAX;
