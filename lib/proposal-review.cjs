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

module.exports = { loadPersonas, selectPersonas, evaluateGate, RUBRIC, BLOCKERS, HUMANITY_ID };
