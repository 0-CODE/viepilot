'use strict';
/**
 * Persona review council — persona library, selection and rubric gate (ENH-117c).
 * Zero dependencies; parses templates/proposal/review-personas.md deterministically.
 */
const fs = require('fs');
const path = require('path');

const PERSONAS_FILE = path.join(__dirname, '..', 'templates', 'proposal', 'review-personas.md');
const HUMANITY_ID = 20;

const RUBRIC = [
  { code: 'H1', label: 'Humanity', threshold: 4.0, minAny: 3 },
  { code: 'H2', label: "Maker's voice and evidenced pride", threshold: 4.0 },
  { code: 'C1', label: 'Memorable key message', threshold: 4.0 },
  { code: 'C2', label: 'Fit to audience', threshold: 3.5 },
  { code: 'C3', label: 'Evidence and numbers', threshold: 4.0 },
  { code: 'C4', label: 'Narrative arc and structure', threshold: 3.5 },
  { code: 'C5', label: 'Concrete doable CTA', threshold: 4.0 },
  { code: 'C6', label: 'Speakable script', threshold: 4.0 },
  { code: 'C7', label: 'Design and animation serve content', threshold: 3.5 },
  { code: 'C8', label: 'Anticipates objections', threshold: 3.5 },
];

const BLOCKERS = [
  'false-claim',
  'fabricated-anecdote',
  'overreaching-legal-security-promise',
  'slide-without-script',
  'slide-without-animation',
];

function unquote(s) {
  s = s.trim();
  if (s.length >= 2 && s[0] === '"' && s[s.length - 1] === '"') {
    return s.slice(1, -1).replace(/\\"/g, '"');
  }
  return s;
}

function parseCard(block) {
  const card = {};
  let listKey = null;
  for (const raw of block.split('\n')) {
    if (!raw.trim()) continue;
    const item = raw.match(/^\s+-\s+(.*)$/);
    if (item && listKey) { card[listKey].push(unquote(item[1])); continue; }
    const kv = raw.match(/^([a-z_]+):\s*(.*)$/);
    if (!kv) continue;
    const [, key, val] = kv;
    listKey = null;
    if (val === '') { card[key] = []; listKey = key; }
    else if (val.startsWith('[') && val.endsWith(']')) {
      card[key] = val.slice(1, -1).split(',').map(s => s.trim()).filter(Boolean);
    } else if (val === 'true' || val === 'false') card[key] = val === 'true';
    else card[key] = unquote(val);
  }
  card.id = Number(card.id);
  return card;
}

function readTemplate() { return fs.readFileSync(PERSONAS_FILE, 'utf8'); }

function loadPersonas() {
  const text = readTemplate();
  const personas = [];
  const re = /^### P\d+[^\n]*\n+```yaml\n([\s\S]*?)```/gm;
  let m;
  while ((m = re.exec(text))) personas.push(parseCard(m[1]));
  const ids = personas.map(p => p.id);
  if (personas.length < 20) throw new Error(`Expected 20 personas, found ${personas.length}`);
  if (new Set(ids).size !== ids.length) throw new Error('Duplicate persona ids');
  const always = personas.filter(p => p.always);
  if (always.length !== 1 || always[0].id !== HUMANITY_ID) {
    throw new Error('Exactly one always:true persona (#20) required');
  }
  return personas;
}

function section(text, heading) {
  const re = new RegExp(`^## ${heading}\\s*$([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, 'm');
  const m = text.match(re);
  return m ? m[1] : '';
}

function tableRows(body) {
  return body.split('\n')
    .filter(l => l.trim().startsWith('|'))
    .map(l => l.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim()))
    .filter(r => r.length >= 2 && !/^-+$/.test(r[0]) && r[0] !== 'type' && r[0] !== 'keywords');
}

function parseIds(s) { return s.split(',').map(x => Number(x.trim())).filter(n => Number.isInteger(n)); }

function loadMapping() {
  const map = {};
  for (const [type, ids] of tableRows(section(readTemplate(), 'Audience Mapping'))) map[type] = parseIds(ids);
  return map;
}

function loadKeywords() {
  return tableRows(section(readTemplate(), 'Audience Keywords')).map(([kw, ids]) => ({
    keywords: kw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
    ids: parseIds(ids),
  }));
}

function keywordIds(audience, decisionMaker) {
  const hay = ` ${[audience, decisionMaker].filter(Boolean).join(' ').toLowerCase()} `;
  if (hay.trim() === '') return [];
  const out = [];
  for (const row of loadKeywords()) {
    const hit = row.keywords.some(k => new RegExp(`(^|[^a-z])${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}s?([^a-z]|$)`).test(hay));
    if (hit) for (const id of row.ids) if (!out.includes(id)) out.push(id);
  }
  return out;
}

const MIN_QUICK = 6;
const MAX_QUICK = 8;

function selectPersonas(opts = {}) {
  const { type, audience, decisionMaker, mode = 'quick', add = [], remove = [] } = opts;
  const all = loadPersonas().map(p => p.id);
  if (mode === 'off') return [HUMANITY_ID];
  if (mode === 'full') return all.slice().sort((a, b) => a - b);

  const mapping = loadMapping();
  const base = (mapping[type] || mapping.general || []).slice();
  const preferred = [];
  for (const id of [...add.map(Number), ...keywordIds(audience, decisionMaker)]) {
    if (all.includes(id) && !preferred.includes(id)) preferred.push(id);
  }
  const removed = new Set(remove.map(Number).filter(id => id !== HUMANITY_ID));
  let list = [];
  for (const id of [...preferred, ...base, HUMANITY_ID]) {
    if (all.includes(id) && !removed.has(id) && !list.includes(id)) list.push(id);
  }
  // trim to max: drop non-preferred base entries from the end, then preferred from the end
  const dropOrder = [
    ...list.filter(id => id !== HUMANITY_ID && !preferred.includes(id)).reverse(),
    ...list.filter(id => id !== HUMANITY_ID && preferred.includes(id)).reverse(),
  ];
  while (list.length > MAX_QUICK && dropOrder.length) {
    const d = dropOrder.shift();
    list = list.filter(id => id !== d);
  }
  // pad to min from general defaults then any remaining
  const padPool = [...(mapping.general || []), ...all];
  for (const id of padPool) {
    if (list.length >= MIN_QUICK) break;
    if (!removed.has(id) && !list.includes(id)) list.push(id);
  }
  return list.sort((a, b) => a - b);
}

function evaluateGate(reviews = []) {
  const perCriterion = RUBRIC.map(r => {
    const vals = reviews
      .map(rv => rv && rv.scores && rv.scores[r.code])
      .filter(v => typeof v === 'number' && Number.isFinite(v));
    if (!vals.length) return { code: r.code, avg: null, min: null, pass: false };
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    const min = Math.min(...vals);
    const pass = avg >= r.threshold && (r.minAny == null || min >= r.minAny);
    return { code: r.code, avg: Math.round(avg * 100) / 100, min, pass };
  });
  const blockers = [];
  for (const rv of reviews) {
    for (const b of (rv && rv.blockers) || []) blockers.push({ personaId: rv.personaId, blocker: b });
  }
  const failing = perCriterion.filter(c => !c.pass).map(c => c.code);
  return { pass: failing.length === 0 && blockers.length === 0, perCriterion, blockers, failing };
}

// ---------------------------------------------------------------------------
// Review parsing, feedback synthesis and report (task 167.2)
// ---------------------------------------------------------------------------
const CODES = RUBRIC.map(r => r.code);
const VETO_CRITERIA = ['H1', 'H2'];

function hasText(v) { return typeof v === 'string' && v.trim() !== ''; }
function hasSlide(v) { return (typeof v === 'number' && Number.isFinite(v)) || hasText(v); }

/**
 * Validate one persona review. Scores lacking evidence (slide + quote) are dropped and logged.
 * Returns { review, dropped, log }. Throws if the shape is unusable.
 */
function parseReview(input) {
  let raw = input;
  if (typeof raw === 'string') {
    try { raw = JSON.parse(raw); } catch (e) { throw new Error(`Invalid review JSON: ${e.message}`); }
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Review must be an object');
  const personaId = Number(raw.personaId);
  if (!Number.isInteger(personaId)) throw new Error('Review missing integer personaId');
  const log = [];
  const dropped = [];
  const evidenceIn = raw.evidence && typeof raw.evidence === 'object' ? raw.evidence : {};
  const scores = {};
  const evidence = {};
  for (const code of CODES) {
    const v = raw.scores ? raw.scores[code] : undefined;
    if (v === undefined) continue;
    const ev = (Array.isArray(evidenceIn[code]) ? evidenceIn[code] : []).filter(e => e && hasSlide(e.slide) && hasText(e.quote));
    if (typeof v !== 'number' || !Number.isFinite(v) || v < 1 || v > 5) {
      dropped.push(code); log.push(`P${personaId} ${code}: invalid score ${JSON.stringify(v)} dropped`); continue;
    }
    if (!ev.length) {
      dropped.push(code); log.push(`P${personaId} ${code}: score ${v} dropped (no slide+quote evidence)`); continue;
    }
    scores[code] = v;
    evidence[code] = ev;
  }
  const keep = (Array.isArray(raw.keep) ? raw.keep : []).filter(k => {
    const ok = k && hasSlide(k.slide) && hasText(k.quote);
    if (!ok) log.push(`P${personaId}: keep entry dropped (needs slide+quote)`);
    return ok;
  }).map(k => ({ slide: k.slide, criterion: k.criterion || '', quote: k.quote, note: k.note || '' }));
  const improve = (Array.isArray(raw.improve) ? raw.improve : []).filter(i => {
    const ok = i && hasSlide(i.slide) && hasText(i.problem);
    if (!ok) log.push(`P${personaId}: improve entry dropped (needs slide+problem)`);
    return ok;
  }).map(i => ({
    slide: i.slide, criterion: i.criterion || '', problem: i.problem, suggestion: i.suggestion || '',
    conflictsWithVoice: i.conflictsWithVoice === true,
  }));
  const blockers = [];
  for (const b of Array.isArray(raw.blockers) ? raw.blockers : []) {
    if (BLOCKERS.includes(b)) blockers.push(b);
    else log.push(`P${personaId}: unknown blocker code ${JSON.stringify(b)} dropped`);
  }
  return {
    review: { personaId, scores, evidence, keep, improve, blockers, keyMessage: raw.keyMessage || '' },
    dropped, log,
  };
}

const gkey = (slide, criterion) => `${slide}::${criterion || ''}`;
const uniq = arr => arr.filter((v, i) => arr.indexOf(v) === i);

/**
 * Turn many reviews into explainable Keep / Improve / Reject decisions.
 * Every entry carries slide, criterion, sources (persona ids), weight and reason.
 */
function synthesizeFeedback(reviews = [], opts = {}) {
  const primary = new Set((opts.primaryPersonaIds || []).map(Number));
  const weightOf = id => (primary.has(Number(id)) ? 2 : 1);
  const sum = ids => ids.reduce((a, id) => a + weightOf(id), 0);

  // Keep: strengths quoted by >= 2 personas (same slide + criterion)
  const keepGroups = new Map();
  const primaryKeeps = [];
  for (const rv of reviews) {
    for (const k of rv.keep || []) {
      const key = gkey(k.slide, k.criterion);
      if (!keepGroups.has(key)) keepGroups.set(key, { slide: k.slide, criterion: k.criterion || '', sources: [], quotes: [] });
      const g = keepGroups.get(key);
      if (!g.sources.includes(rv.personaId)) g.sources.push(rv.personaId);
      g.quotes.push(k.quote);
      if (primary.has(Number(rv.personaId))) primaryKeeps.push({ slide: k.slide, criterion: k.criterion || '', id: rv.personaId });
    }
  }
  const keep = [];
  for (const g of keepGroups.values()) {
    if (g.sources.length < 2) continue;
    keep.push({
      slide: g.slide, criterion: g.criterion, sources: g.sources, weight: sum(g.sources),
      quote: g.quotes[0],
      reason: `Praised by ${g.sources.length} personas (${g.sources.map(i => 'P' + i).join(', ')}); quoted: "${g.quotes[0]}"`,
    });
  }

  // Improve candidates grouped by slide + criterion
  const groups = new Map();
  for (const rv of reviews) {
    for (const i of rv.improve || []) {
      const key = gkey(i.slide, i.criterion);
      if (!groups.has(key)) groups.set(key, { slide: i.slide, criterion: i.criterion || '', sources: [], problems: [], suggestions: [], voiceConflictBy: [] });
      const g = groups.get(key);
      if (!g.sources.includes(rv.personaId)) g.sources.push(rv.personaId);
      g.problems.push(i.problem);
      if (i.suggestion) g.suggestions.push(i.suggestion);
      if (i.conflictsWithVoice) g.voiceConflictBy.push(rv.personaId);
    }
  }
  const improve = [];
  const reject = [];
  for (const g of groups.values()) {
    const entry = {
      slide: g.slide, criterion: g.criterion, sources: g.sources, weight: sum(g.sources),
      problem: g.problems.join(' | '), suggestion: g.suggestions[0] || '', suggestions: uniq(g.suggestions),
    };
    const vetoed = g.sources.includes(HUMANITY_ID) && VETO_CRITERIA.includes(g.criterion);
    if (vetoed) {
      improve.push({ ...entry, reason: `Humanity veto: P${HUMANITY_ID} flagged ${g.criterion}; cannot be rejected` });
      continue;
    }
    const allVoiceConflict = g.voiceConflictBy.length === g.sources.length;
    if (allVoiceConflict) {
      reject.push({ ...entry, reason: `Conflicts with the chosen voice level (suggested by ${g.sources.map(i => 'P' + i).join(', ')})` });
      continue;
    }
    const lone = g.sources.length === 1 && !primary.has(Number(g.sources[0]));
    const against = lone && primaryKeeps.find(k => k.slide === g.slide && (!k.criterion || !g.criterion || k.criterion === g.criterion));
    if (against) {
      reject.push({ ...entry, reason: `Lone non-primary opinion (P${g.sources[0]}) against a Keep by primary-audience P${against.id} on slide ${g.slide}` });
      continue;
    }
    const why = g.sources.length > 1
      ? `Raised by ${g.sources.length} personas (${g.sources.map(i => 'P' + i).join(', ')}), total weight ${entry.weight}`
      : `Raised by P${g.sources[0]}${primary.has(Number(g.sources[0])) ? ' (primary audience, x2)' : ''}, weight ${entry.weight}`;
    improve.push({ ...entry, reason: why });
  }
  improve.sort((a, b) => b.weight - a.weight);
  keep.sort((a, b) => b.weight - a.weight);
  return { keep, improve, reject };
}

function fmt(n) { return n == null ? '-' : String(n); }
function ids(list) { return list.map(i => 'P' + i).join(', '); }

function decisionList(title, items, kind) {
  const out = [`### ${title} (${items.length})`, ''];
  if (!items.length) { out.push('_None_', ''); return out; }
  for (const it of items) {
    const head = `- Slide ${it.slide}${it.criterion ? ` [${it.criterion}]` : ''} - sources ${ids(it.sources)} - weight ${it.weight}`;
    out.push(head);
    if (kind === 'keep') out.push(`  - Quote: "${it.quote}"`);
    else {
      out.push(`  - Problem: ${it.problem}`);
      if (it.suggestion) out.push(`  - Suggestion: ${it.suggestion}`);
    }
    out.push(`  - Reason: ${it.reason}`);
  }
  out.push('');
  return out;
}

/**
 * rounds: [{ round?, reviews, gate?, decisions? }]; decisions/gate apply to the last round
 * unless a round carries its own.
 */
function buildReviewReport({ rounds = [], decisions, gate } = {}) {
  const out = ['# Persona Review Report', ''];
  rounds.forEach((r, idx) => {
    const n = r.round || idx + 1;
    const last = idx === rounds.length - 1;
    const reviews = r.reviews || [];
    const g = r.gate || (last && gate) || evaluateGate(reviews);
    const d = r.decisions || (last ? decisions : null) || { keep: [], improve: [], reject: [] };
    out.push(`## Round ${n}`, '');
    out.push(`| Persona | ${CODES.join(' | ')} |`);
    out.push(`| --- | ${CODES.map(() => '---').join(' | ')} |`);
    for (const rv of reviews) {
      out.push(`| P${rv.personaId} | ${CODES.map(c => fmt(rv.scores && rv.scores[c])).join(' | ')} |`);
    }
    const per = {};
    for (const c of g.perCriterion) per[c.code] = c;
    out.push(`| **Avg** | ${CODES.map(c => fmt(per[c] && per[c].avg)).join(' | ')} |`);
    out.push(`| **Threshold** | ${RUBRIC.map(c => '>=' + c.threshold).join(' | ')} |`);
    out.push(`| **Result** | ${CODES.map(c => (per[c] && per[c].pass ? 'PASS' : 'FAIL')).join(' | ')} |`, '');
    out.push(`Gate: **${g.pass ? 'PASS' : 'FAIL'}**`, '');
    out.push('### Blockers', '');
    if (g.blockers.length) for (const b of g.blockers) out.push(`- ${b.blocker} (P${b.personaId})`);
    else out.push('_None_');
    out.push('');
    out.push(...decisionList('Keep', d.keep || [], 'keep'));
    out.push(...decisionList('Improve', d.improve || [], 'improve'));
    out.push(...decisionList('Reject', d.reject || [], 'reject'));
  });
  const lastRound = rounds[rounds.length - 1] || {};
  const g = lastRound.gate || gate || evaluateGate(lastRound.reviews || []);
  const d = lastRound.decisions || decisions || { improve: [] };
  out.push('## Open issues', '');
  const open = [];
  for (const c of g.failing || []) {
    const pc = g.perCriterion.find(x => x.code === c);
    open.push(`- Criterion ${c} below threshold (avg ${fmt(pc && pc.avg)}, min ${fmt(pc && pc.min)})`);
  }
  for (const b of g.blockers || []) open.push(`- Blocker ${b.blocker} (P${b.personaId})`);
  for (const i of d.improve || []) open.push(`- Slide ${i.slide}${i.criterion ? ` [${i.criterion}]` : ''}: ${i.problem}`);
  out.push(...(open.length ? open : ['_None_']), '');
  return out.join('\n');
}

module.exports = {
  loadPersonas, selectPersonas, evaluateGate, parseReview, synthesizeFeedback, buildReviewReport,
  RUBRIC, BLOCKERS, HUMANITY_ID,
};
