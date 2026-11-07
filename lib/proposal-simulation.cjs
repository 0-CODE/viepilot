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
