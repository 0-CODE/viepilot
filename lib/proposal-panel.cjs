'use strict';

/**
 * Rehearsal Hall panel (ENH-128): after independent listening, a small panel questions a presenter agent and
 * debates over messages in capped rounds. Pure functions — the orchestrator (relay) or the agent-teams lead moves
 * the messages; this module picks the panel and validates what was said.
 *
 * Message: { from, to, round, text, cites?: string[], noAnswer?: boolean }
 *   from / to: persona id (number), 'presenter' or 'all'.
 *   Round 1: panelists ask the presenter; presenter answers. Round 2: panelists reply to each other.
 *   Round 3: each panelist states a final position ({ final: { wouldAct, changed, why } }).
 *
 * Zero dependencies.
 */

const HUMANITY_ID = 20;
const DECISION_IDS = Object.freeze([23, 25, 1, 22, 2]); // leadership / manager personas, in preference order

const PANEL_LIMITS = Object.freeze({ minSize: 4, maxSize: 6, rounds: 3, messagesPerRound: 2, maxWords: 80 });

const words = (t) => (String(t || '').match(/[\p{L}\p{N}][\p{L}\p{N}'’.,%-]*/gu) || []).length;

/**
 * Pick the panel from a hall result: the most negative primary persona, the lowest final attention, the most
 * unanswered objections, #20 (humanity editor) and one decision-maker; filled up to `size` by lowest attention.
 * @param {{evaluations: object[], questions: object[]}} agg  aggregate from proposal-sim-aggregate
 * @param {{size?: number}} [opts]
 * @returns {{panel: number[], why: Record<number, string>}}
 */
function selectPanel(agg, opts = {}) {
  const size = Math.max(PANEL_LIMITS.minSize, Math.min(PANEL_LIMITS.maxSize, opts.size || 5));
  const evals = (agg && agg.evaluations) || [];
  const ids = evals.map((e) => e.personaId);
  const panel = [];
  const why = {};
  const add = (id, reason) => { if (id != null && ids.includes(id) && !panel.includes(id) && panel.length < size) { panel.push(id); why[id] = reason; } };
  const byAttention = evals.slice().sort((a, b) => (a.finalAttention ?? 100) - (b.finalAttention ?? 100));
  const unanswered = {};
  for (const q of (agg && agg.questions) || []) if (q.kind === 'objection' && !q.answered) unanswered[q.personaId] = (unanswered[q.personaId] || 0) + 1;

  const negPrimary = evals.filter((e) => e.primary).sort((a, b) => Number(a.wouldAct) - Number(b.wouldAct) || (a.finalAttention ?? 100) - (b.finalAttention ?? 100))[0];
  if (negPrimary) add(negPrimary.personaId, 'most negative primary listener');
  if (byAttention[0]) add(byAttention[0].personaId, 'lowest attention at the end');
  const mostObj = Object.entries(unanswered).sort((a, b) => b[1] - a[1])[0];
  if (mostObj) add(Number(mostObj[0]), `${mostObj[1]} unanswered objection(s)`);
  add(HUMANITY_ID, 'humanity editor (always)');
  const dm = DECISION_IDS.find((id) => ids.includes(id) && !panel.includes(id));
  if (dm != null) add(dm, 'decision-maker');
  for (const e of byAttention) add(e.personaId, 'low attention');
  return { panel, why };
}

/**
 * Validate one message against the protocol and caps. Returns the list of problems (empty = ok).
 * @param {object} msg
 * @param {{roster: number[], sourceIds?: string[], round?: number}} ctx
 */
function validateMessage(msg, ctx) {
  const problems = [];
  const roster = ctx.roster || [];
  const isPanelist = (x) => roster.includes(Number(x));
  const party = (x) => x === 'presenter' || x === 'all' || isPanelist(x);
  if (!msg || typeof msg !== 'object') return ['not an object'];
  if (!party(msg.from) || msg.from === 'all') problems.push(`unknown sender ${msg.from}`);
  if (!party(msg.to)) problems.push(`unknown recipient ${msg.to}`);
  if (!(msg.round >= 1 && msg.round <= PANEL_LIMITS.rounds)) problems.push(`round ${msg.round} outside 1–${PANEL_LIMITS.rounds}`);
  if (words(msg.text) > PANEL_LIMITS.maxWords) problems.push(`over ${PANEL_LIMITS.maxWords} words`);
  if (!String(msg.text || '').trim()) problems.push('empty text');
  if (msg.from === 'presenter') {
    const cites = Array.isArray(msg.cites) ? msg.cites : [];
    const known = ctx.sourceIds || null;
    if (!msg.noAnswer && !cites.length) problems.push('presenter answer without a citation');
    if (known && cites.some((c) => !known.includes(c))) problems.push(`presenter cites unknown source ${cites.filter((c) => !known.includes(c)).join(', ')}`);
  } else if (msg.round === 1 && msg.to !== 'presenter') problems.push('round 1: panelists question the presenter');
  else if (msg.round === 2 && !(isPanelist(msg.to) || msg.to === 'all') ) problems.push('round 2: reply to another panelist');
  else if (msg.round === 2 && msg.to === 'all' && !(Array.isArray(msg.replyTo) && msg.replyTo.some(isPanelist))) problems.push('round 2: name the panelist you answer (replyTo)');
  return problems;
}

/**
 * Order and validate a debate. Over-cap messages (more than `messagesPerRound` per sender per round) are dropped.
 * @returns {{messages: object[], dropped: object[], flags: number}}
 */
function buildTranscript(messages, ctx) {
  const count = {};
  const kept = [];
  const dropped = [];
  const order = (m) => (m.round || 0) * 1e6 + (m.seq || 0);
  for (const m of (messages || []).slice().sort((a, b) => order(a) - order(b))) {
    const key = `${m.from}|${m.round}`;
    count[key] = (count[key] || 0) + 1;
    if (m.from !== 'presenter' && count[key] > PANEL_LIMITS.messagesPerRound) { dropped.push({ ...m, problems: ['over the per-round cap'] }); continue; }
    const problems = validateMessage(m, ctx);
    kept.push(problems.length ? { ...m, problems } : m);
  }
  return { messages: kept, dropped, flags: kept.filter((m) => m.problems).length };
}

/** Questions the presenter could not answer from the material (noAnswer, or never answered). */
function unansweredQuestions(transcript) {
  const msgs = (transcript && transcript.messages) || [];
  const out = [];
  msgs.filter((m) => m.round === 1 && m.to === 'presenter').forEach((q) => {
    const reply = msgs.find((m) => m.from === 'presenter' && m.round === 1 && (m.to === q.from || m.to === 'all') && (!m.answers || m.answers === q.id));
    if (!reply || reply.noAnswer) out.push({ from: q.from, text: q.text, reason: reply ? 'no answer in the material' : 'not answered' });
  });
  return out;
}

/** Before/after per panelist: Phase A verdict vs round-3 final position. */
function beforeAfter(agg, transcript) {
  const finals = {};
  for (const m of (transcript && transcript.messages) || []) if (m.round === 3 && m.final && m.from !== 'presenter') finals[m.from] = m.final;
  return Object.keys(finals).map(Number).map((id) => {
    const e = ((agg && agg.evaluations) || []).find((x) => x.personaId === id) || {};
    const f = finals[id];
    return { personaId: id, before: { wouldAct: !!e.wouldAct }, after: { wouldAct: !!f.wouldAct }, changed: !!e.wouldAct !== !!f.wouldAct, why: String(f.why || '') };
  });
}

module.exports = { PANEL_LIMITS, selectPanel, validateMessage, buildTranscript, unansweredQuestions, beforeAfter };
