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
  const objections = {};
  const unanswered = {};
  for (const q of (agg && agg.questions) || []) {
    if (q.kind !== 'objection') continue;
    objections[q.personaId] = (objections[q.personaId] || 0) + 1;
    if (!q.answered) unanswered[q.personaId] = (unanswered[q.personaId] || 0) + 1;
  }
  const obj = (id) => objections[id] || 0;
  // Skeptic-first (BUG-037): listeners who would not act, most objections first.
  const skeptics = evals.filter((e) => !e.wouldAct).sort((a, b) => obj(b.personaId) - obj(a.personaId) || (a.finalAttention ?? 100) - (b.finalAttention ?? 100));
  if (skeptics[0]) add(skeptics[0].personaId, `strongest skeptic (${obj(skeptics[0].personaId)} objection(s), would not act)`);
  if (byAttention[0]) add(byAttention[0].personaId, 'lowest attention at the end');
  const negPrimary = evals.filter((e) => e.primary).sort((a, b) => Number(a.wouldAct) - Number(b.wouldAct) || obj(b.personaId) - obj(a.personaId) || (a.finalAttention ?? 100) - (b.finalAttention ?? 100))[0];
  if (negPrimary) add(negPrimary.personaId, negPrimary.wouldAct ? 'primary listener with most doubts' : 'primary listener who would not act');
  const mostObj = Object.entries(unanswered).sort((a, b) => b[1] - a[1])[0];
  if (mostObj) add(Number(mostObj[0]), `${mostObj[1]} unanswered objection(s)`);
  add(HUMANITY_ID, 'humanity editor (always)');
  const dm = DECISION_IDS.find((id) => ids.includes(id) && !panel.includes(id));
  if (dm != null) add(dm, 'decision-maker');
  for (const e of skeptics.slice(1)) add(e.personaId, 'skeptic');
  for (const e of byAttention) add(e.personaId, 'low attention');
  return { panel, why };
}

/** A replyTo entry may be a panelist id or a message id (e.g. "q9-2" or "a7-1"); message ids resolve to their sender. */
function resolveSender(ref, messages) {
  if (typeof ref === 'number' || /^\d+$/.test(String(ref))) return Number(ref);
  const m = (messages || []).find((x) => x && x.id === ref);
  if (m) return m.from;
  // Question ID: q<persona>-<n> -> persona is the sender
  const q = String(ref).match(/^q(\d+)-\d+$/);
  if (q) return Number(q[1]);
  // Answer ID: a<persona>-<n> -> sender is presenter
  const a = String(ref).match(/^a(\d+)-\d+$/);
  if (a) return 'presenter';
  // Panel message ID: r<round>-<persona>-<n> -> persona is the sender
  const r = String(ref).match(/^r\d+-(\d+)-\d+$/);
  if (r) return Number(r[1]);
  return null;
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
    // noAnswer + cites is a contradiction (should use partial instead)
    if (msg.noAnswer && cites.length) problems.push('noAnswer with cites — use partial');
    // Partial requires cites (the gap being named)
    if (msg.partial && !cites.length) problems.push('partial: true requires cites (the gap)');
    // Must have either cites, partial, or noAnswer
    if (!msg.noAnswer && !msg.partial && !cites.length) problems.push('presenter answer without a citation');
    if (known && cites.some((c) => !known.includes(c))) problems.push(`presenter cites unknown source ${cites.filter((c) => !known.includes(c)).join(', ')}`);
  } else if (msg.round === 1 && msg.to !== 'presenter') problems.push('round 1: panelists question the presenter');
  else if (msg.round === 2 && !(isPanelist(msg.to) || msg.to === 'all') ) problems.push('round 2: reply to another panelist');
  else if (msg.round === 2 && msg.to === 'all') {
    // replyTo must name a panelist or a message from a panelist (or presenter answer to reply to)
    if (!(Array.isArray(msg.replyTo) && msg.replyTo.some((r) => {
      const sender = resolveSender(r, ctx.messages);
      return isPanelist(r) || isPanelist(sender) || sender === 'presenter';
    }))) problems.push('round 2: name the panelist or presenter answer you reply to (replyTo)');
  }
  return problems;
}

/**
 * Order and validate a debate. Over-cap messages (more than `messagesPerRound` per sender per round) are dropped.
 * Assigns unique IDs: questions q<persona>-<n>, answers a<persona>-<n> derived from the question,
 * panel messages r<round>-<persona>-<n>.
 * @returns {{messages: object[], dropped: object[], flags: number}}
 */
function buildTranscript(messages, ctx) {
  const count = {};
  const kept = [];
  const dropped = [];
  const order = (m) => (m.round || 0) * 1e6 + (m.seq || 0);
  const answerIds = {}; // map question id -> answer id

  for (const m of (messages || []).slice().sort((a, b) => order(a) - order(b))) {
    const key = `${m.from}|${m.round}`;
    count[key] = (count[key] || 0) + 1;
    if (m.from !== 'presenter' && count[key] > PANEL_LIMITS.messagesPerRound) { dropped.push({ ...m, problems: ['over the per-round cap'] }); continue; }

    const problems = validateMessage(m, { ...ctx, messages: messages || [] });
    let msg = problems.length ? { ...m, problems } : m;

    // Assign ID if missing
    if (!msg.id) {
      if (m.round === 1 && m.from !== 'presenter') {
        // Question: q<persona>-<n>
        const qcount = (count[`q${m.from}`] || 0) + 1;
        count[`q${m.from}`] = qcount;
        msg.id = `q${m.from}-${qcount}`;
      } else if (m.round === 1 && m.from === 'presenter') {
        // Presenter answer: a<persona>-<n> derived from the question they answer
        // Find the question they're answering
        const questionId = m.answers;
        if (questionId) {
          msg.id = `a${questionId.substring(1)}`; // q7-1 -> a7-1
          answerIds[questionId] = msg.id;
        } else {
          // Fallback: find the matching question by round and recipient
          const q = kept.find((x) => x.round === 1 && x.from !== 'presenter' && (x.from === m.to || m.to === 'all') && !answerIds[x.id]);
          if (q) {
            msg.id = `a${q.id.substring(1)}`; // q7-1 -> a7-1
            answerIds[q.id] = msg.id;
          } else {
            msg.id = `a${m.to || 'unknown'}-1`;
          }
        }
      } else if (m.round >= 2) {
        // Panel message: r<round>-<persona>-<n>
        const pcount = (count[`r${m.round}${m.from}`] || 0) + 1;
        count[`r${m.round}${m.from}`] = pcount;
        msg.id = `r${m.round}-${m.from}-${pcount}`;
      }
    }

    kept.push(msg);
  }
  return { messages: kept, dropped, flags: kept.filter((m) => m.problems).length };
}

/** Questions the presenter could not answer from the material (noAnswer, or never answered). */
function unansweredQuestions(transcript) {
  const msgs = (transcript && transcript.messages) || [];
  const out = [];
  msgs.filter((m) => m.round === 1 && m.to === 'presenter').forEach((q) => {
    const reply = msgs.find((m) => m.from === 'presenter' && m.round === 1 && (m.to === q.from || m.to === 'all') && (!m.answers || m.answers === q.id));
    if (!reply || (reply.noAnswer && !reply.partial)) out.push({ from: q.from, text: q.text, reason: reply ? 'no answer in the material' : 'not answered' });
  });
  return out;
}

/** Presenter's partial answers: answered from material but with a named gap. */
function partialAnswers(transcript) {
  const msgs = (transcript && transcript.messages) || [];
  const out = [];
  msgs.filter((m) => m.round === 1 && m.to === 'presenter').forEach((q) => {
    const reply = msgs.find((m) => m.from === 'presenter' && m.round === 1 && (m.to === q.from || m.to === 'all') && (!m.answers || m.answers === q.id));
    if (reply && reply.partial) out.push({ from: q.from, question: q.text, answer: reply.text, gap: reply.text });
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
    // The panelist's own `changed` counts too (BUG-037: "now a conditional yes" was shown as unchanged).
    return { personaId: id, before: { wouldAct: !!e.wouldAct }, after: { wouldAct: !!f.wouldAct, stance: String(f.stance || ''), conditions: Array.isArray(f.conditions) ? f.conditions.map(String) : [] },
      changed: !!f.changed || !!e.wouldAct !== !!f.wouldAct, why: String(f.why || '') };
  });
}

/**
 * The presenter's only source, with citable ids: S<n> slide, N<n> notes, B<n> backstage line, C<n> Content Map item.
 * @returns {{text: string, ids: string[]}}
 */
function deckMaterial(manifest, backstageText = '') {
  const parts = [];
  const ids = [];
  for (const [i, s] of ((manifest && manifest.slides) || []).entries()) {
    const n = s.index || i + 1;
    ids.push(`S${n}`, `N${n}`);
    parts.push(`[S${n}] ${s.heading || ''}${(s.bullets || []).map((b) => `\n  - ${b}`).join('')}${s.caption ? `\n  (${s.caption})` : ''}`);
    parts.push(`[N${n}] ${String(s.speakerNotes || '').replace(/\[(?:click|pause)\]\s*/gi, '').replace(/\n+/g, ' ')}`);
  }
  String(backstageText || '').split('\n').map((l) => l.replace(/^[-*]\s*/, '').trim()).filter((l) => l && !l.startsWith('#') && !l.startsWith('>') && !l.startsWith('|'))
    .forEach((l, k) => { ids.push(`B${k + 1}`); parts.push(`[B${k + 1}] ${l}`); });
  const cm = manifest && manifest.contentMap;
  for (const it of (Array.isArray(cm) ? cm : (cm && cm.items) || [])) {
    if (it.decision === 'FIT' || it.decision === 'TRANSFORM' || it.decision === 'BACKSTAGE') { ids.push(it.id); parts.push(`[${it.id}] ${it.transformed || it.text}`); }
  }
  return { text: parts.join('\n'), ids };
}

/**
 * Engine from how the messages actually flowed (BUG-037): `teams` only when round-2 panelist messages were delivered
 * peer to peer (`via: "direct"`, recorded by the lead when a teammate messaged another teammate); otherwise `relay`.
 */
function detectEngine(transcript) {
  const msgs = (transcript && transcript.messages) || transcript || [];
  return msgs.some((m) => m && m.round === 2 && m.from !== 'presenter' && m.via === 'direct') ? 'teams' : 'relay';
}

module.exports = { detectEngine, resolveSender, deckMaterial, PANEL_LIMITS, selectPanel, validateMessage, buildTranscript, unansweredQuestions, partialAnswers, beforeAfter };
