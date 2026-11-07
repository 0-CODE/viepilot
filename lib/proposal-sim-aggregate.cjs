'use strict';

/**
 * Rehearsal Hall aggregator (ENH-121): listener states → every report output.
 *
 * Requested outputs: persona evaluations, ranked improvements, tune-out moments, retention curve,
 * keyword & criteria effectiveness. Chart groups: attention & cognition (heatmap, load, confusion),
 * emotion & persuasion (emotion vs intended arc, funnel), questions & pacing, recall & comparison
 * (24 h recall vs key messages, decision-maker-weighted retention, run-over-run deltas).
 *
 * Deterministic; zero dependencies.
 */

const { slideLoad } = require('./proposal-simulation.cjs');

const ATTENTIVE = 50;
// Intended emotional shape of the arc (−2…+2): tension at the conflict, lift from the turning point on.
const BEAT_EMOTION = Object.freeze({ context: 0, conflict: -0.5, 'turning point': 1, solution: 1, proof: 1, invitation: 1.5 });
const FUNNEL = ['aware', 'understand', 'agree', 'act'];

const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const r1 = (n) => Math.round(n * 10) / 10;
const tokens = (t) => (String(t || '').toLowerCase().normalize('NFC').match(/[\p{L}\p{N}]{3,}/gu) || []);

function stateAt(listener, seg) {
  return listener.states.find((s) => s.seg === seg) || null;
}

function isListening(listener, seg) {
  const st = stateAt(listener, seg);
  if (!st) return false;
  if (listener.tuneOut && seg >= listener.tuneOut.seg && !(listener.regainedAt !== null && seg >= listener.regainedAt)) return false;
  return st.attention >= ATTENTIVE;
}

/**
 * @param {{timeline, listeners: object[], manifest, primary?: number[], keyMessages?: string[], keywords?: string[], previous?: object}} input
 */
function aggregate({ timeline, listeners, manifest, primary = [], keyMessages = [], keywords = [], previous = null }) {
  const segs = timeline.segments;
  const slides = (manifest && manifest.slides) || [];
  const weight = (id) => (primary.includes(id) ? 2 : 1);
  const totalWeight = listeners.reduce((a, l) => a + weight(l.personaId), 0) || 1;

  // Retention curve (all + weighted) per segment
  const retention = segs.map((s, i) => {
    const on = listeners.filter((l) => isListening(l, i));
    return {
      seg: i, slide: s.slide, t: s.tStart,
      pct: r1((on.length / (listeners.length || 1)) * 100),
      weightedPct: r1((on.reduce((a, l) => a + weight(l.personaId), 0) / totalWeight) * 100),
    };
  });

  // Tune-outs
  const tuneOuts = listeners.filter((l) => l.tuneOut).map((l) => ({
    personaId: l.personaId, primary: primary.includes(l.personaId), seg: l.tuneOut.seg, slide: segs[l.tuneOut.seg].slide,
    t: l.tuneOut.t, reason: l.tuneOut.reason, line: l.tuneOut.line, regainedAt: l.regainedAt,
  })).sort((a, b) => a.t - b.t);

  // Heatmap persona × slide (mean attention)
  const slideIds = [...new Set(segs.map((s) => s.slide))];
  const heatmap = listeners.map((l) => ({
    personaId: l.personaId,
    bySlide: Object.fromEntries(slideIds.map((sl) => [sl, r1(mean(segs.map((s, i) => [s, i]).filter(([s]) => s.slide === sl).map(([, i]) => (stateAt(l, i) || { attention: 0 }).attention)))])),
  }));

  // Cognitive load + confusion spikes
  const load = slides.map((s, i) => ({ slide: s.index || i + 1, ...slideLoad(s) }));
  const comp = segs.map((_, i) => mean(listeners.map((l) => (stateAt(l, i) || { comprehension: 70 }).comprehension)));
  const confusion = [];
  comp.forEach((c, i) => {
    if (i > 0 && comp[i - 1] - c >= 15) {
      const ld = load.find((x) => x.slide === segs[i].slide) || {};
      const cause = ld.jargon >= 3 ? 'jargon' : ld.numbers >= 4 ? 'numbers' : ld.words >= 40 ? 'text density' : 'content';
      confusion.push({ seg: i, slide: segs[i].slide, drop: r1(comp[i - 1] - c), comprehension: r1(c), cause, line: segs[i].text });
    }
  });

  // Emotion arc vs intended beat
  const emotionArc = slideIds.map((sl) => {
    const m = slides.find((s, i) => (s.index || i + 1) === sl) || {};
    const actual = mean(segs.map((s, i) => [s, i]).filter(([s]) => s.slide === sl).flatMap(([, i]) => listeners.map((l) => (stateAt(l, i) || { emotion: 0 }).emotion)));
    const intended = m.beat in BEAT_EMOTION ? BEAT_EMOTION[m.beat] : null;
    return { slide: sl, beat: m.beat || null, intended, actual: r1(actual), gap: intended === null ? null : r1(actual - intended) };
  });

  // Persuasion funnel (final stage per listener; cumulative counts)
  const finalStage = (l) => {
    const st = l.states.length ? l.states[l.states.length - 1].funnelStage : 'aware';
    return l.verdict && l.verdict.wouldAct ? 'act' : st;
  };
  const stages = listeners.map(finalStage);
  const funnel = FUNNEL.map((stage, k) => ({ stage, count: stages.filter((s) => FUNNEL.indexOf(s) >= k).length }));

  // Questions & objections map; an objection counts as answered when a later segment shares ≥ 2 of its words
  const questions = [];
  listeners.forEach((l) => l.states.forEach((st) => {
    for (const kind of ['question', 'objection']) {
      if (!st[kind]) continue;
      const words = new Set(tokens(st[kind]));
      const answered = segs.slice(st.seg + 1).some((s) => tokens(s.text).filter((w) => words.has(w)).length >= 2);
      questions.push({ personaId: l.personaId, kind, slide: segs[st.seg].slide, seg: st.seg, text: st[kind], answered });
    }
  }));

  // Pacing
  const pacing = timeline.slides.map((s) => ({ slide: s.slide, plannedSec: s.plannedSec, spokenSec: s.spokenSec, overrun: s.overrun, underrun: !!s.underrun }));

  // Recall vs key messages; keyword effectiveness
  const recallText = (l) => tokens((l.recall24h || []).join(' '));
  const recall = keyMessages.map((km) => {
    const kw = [...new Set(tokens(km))];
    const hits = listeners.filter((l) => { const r = new Set(recallText(l)); return kw.length && kw.filter((w) => r.has(w)).length / kw.length >= 0.5; });
    return { message: km, rate: r1((hits.length / (listeners.length || 1)) * 100), weightedRate: r1((hits.reduce((a, l) => a + weight(l.personaId), 0) / totalWeight) * 100) };
  });
  const remembered = {};
  listeners.forEach((l) => (l.recall24h || []).forEach((item) => { const k = String(item).toLowerCase().trim(); remembered[k] = (remembered[k] || 0) + 1; }));
  const topRecalled = Object.entries(remembered).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([text, count]) => ({ text, count }));

  const keywordStats = keywords.map((k) => {
    const kl = k.toLowerCase();
    const where = segs.map((s, i) => [s, i]).filter(([s]) => s.text.toLowerCase().includes(kl));
    const recalled = listeners.filter((l) => (l.recall24h || []).join(' ').toLowerCase().includes(kl)).length;
    const assoc = mean(where.flatMap(([, i]) => listeners.map((l) => (stateAt(l, i) || { emotion: 0 }).emotion)));
    return { keyword: k, mentions: where.length, slides: [...new Set(where.map(([s]) => s.slide))], recallRate: r1((recalled / (listeners.length || 1)) * 100), association: where.length ? r1(assoc) : null };
  });

  // Criteria by persona group (when listeners return evaluation.scores)
  const criteria = {};
  listeners.forEach((l) => {
    const sc = (l.evaluation && l.evaluation.scores) || {};
    const group = l.group || 'all';
    for (const [code, v] of Object.entries(sc)) {
      if (typeof v !== 'number') continue;
      criteria[group] = criteria[group] || {};
      (criteria[group][code] = criteria[group][code] || []).push(v);
    }
  });
  const criteriaByGroup = Object.fromEntries(Object.entries(criteria).map(([g, m]) => [g, Object.fromEntries(Object.entries(m).map(([c, xs]) => [c, r1(mean(xs))]))]));

  // Improvements ranked by weighted attention loss per slide
  const lossBySlide = {};
  listeners.forEach((l) => {
    let prev = null; // loss is measured from each listener's own first state, not from an assumed 100
    l.states.forEach((st) => {
      if (prev !== null) { const d = Math.max(0, prev - st.attention) * weight(l.personaId); const sl = segs[st.seg].slide; lossBySlide[sl] = (lossBySlide[sl] || 0) + d; }
      prev = st.attention;
    });
  });
  const improvements = Object.entries(lossBySlide).filter(([, v]) => v > 0).map(([sl, v]) => {
    const slide = Number(sl);
    const reasons = [
      ...tuneOuts.filter((t) => t.slide === slide).map((t) => `tune-out: ${t.reason}`),
      ...confusion.filter((c) => c.slide === slide).map((c) => `confusion (${c.cause})`),
      ...questions.filter((q) => q.slide === slide && q.kind === 'objection' && !q.answered).map((q) => `unanswered objection: ${q.text}`),
    ];
    const suggestions = listeners.flatMap((l) => ((l.evaluation && l.evaluation.improve) || []).filter((x) => x.slide === slide).map((x) => x.suggestion)).filter(Boolean);
    return { slide, impact: r1(v), reasons, suggestions };
  }).sort((a, b) => b.impact - a.impact);

  // Evaluations
  const evaluations = listeners.map((l) => ({
    personaId: l.personaId, primary: primary.includes(l.personaId), wouldAct: l.verdict.wouldAct, quote: l.verdict.quote,
    finalAttention: l.states.length ? l.states[l.states.length - 1].attention : null,
    tunedOutAt: l.tuneOut ? l.tuneOut.t : null, stage: finalStage(l), recall24h: l.recall24h || [],
  }));

  const summary = {
    listeners: listeners.length,
    avgRetention: r1(mean(retention.map((r) => r.pct))),
    avgWeightedRetention: r1(mean(retention.map((r) => r.weightedPct))),
    endRetention: retention.length ? retention[retention.length - 1].pct : 0,
    tuneOuts: tuneOuts.length,
    wouldActPct: r1((evaluations.filter((e) => e.wouldAct).length / (listeners.length || 1)) * 100),
    keyMessageRecall: recall.length ? r1(mean(recall.map((r) => r.rate))) : null,
    unansweredObjections: questions.filter((q) => q.kind === 'objection' && !q.answered).length,
    durationSec: timeline.totalSec,
  };

  const deltas = previous && previous.summary ? Object.fromEntries(Object.entries(summary).filter(([, v]) => typeof v === 'number').map(([k, v]) => [k, typeof previous.summary[k] === 'number' ? r1(v - previous.summary[k]) : null])) : null;

  return { summary, evaluations, improvements, tuneOuts, retention, heatmap, load, confusion, emotionArc, funnel, questions, pacing, recall, topRecalled, keywords: keywordStats, criteriaByGroup, deltas };
}

module.exports = { aggregate, ATTENTIVE, BEAT_EMOTION };
