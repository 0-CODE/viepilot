'use strict';

/**
 * vp-proposal source inventory + Content Map (ENH-122 / ENH-123).
 *
 * Inventory classifies candidate sources by PATH ONLY — it never opens a file — so sensitive files
 * cannot leak into a deck. The Content Map records, for every candidate fact, whether it is FIT
 * (assigned to a slide), TRANSFORM (true but phrased as process → rewritten as outcome or proof),
 * DROP, SENSITIVE or BACKSTAGE (presenter-only). Slides may only use mapped items.
 *
 * Zero dependencies.
 */

const fs = require('fs');
const path = require('path');

const KINDS = Object.freeze(['product-value', 'evidence', 'architecture', 'visual', 'roadmap-future', 'process-log', 'sensitive']);
const DECISIONS = Object.freeze(['FIT', 'TRANSFORM', 'DROP', 'SENSITIVE', 'BACKSTAGE']);

// Ordered: first match wins. Sensitive is checked first so nothing else can claim a secret.
const RULES = Object.freeze([
  ['sensitive', /(^|\/)\.env(\.|$)|\.(pem|key|p12|pfx|keystore)$|(^|\/)id_(rsa|ed25519)|credential|secret|(^|\/)\.npmrc$|(^|\/)\.viepilot\/\.credentials\/|(^|\/)private\//i],
  // Code and tests are implementation detail, not proof or product content (BUG-035 G4) — skipped unless --source adds them.
  [null, /(^|\/)(scripts|tests?|__tests__|__mocks__|spec|fixtures)\/|\.(test|spec)\.[cm]?[jt]sx?$/i],
  ['process-log', /(^|\/)CHANGELOG(\.[a-z]+)?$|(^|\/)\.viepilot\/(TRACKER|HANDOFF|TRACKER-HISTORY)[^/]*$|(^|\/)\.viepilot\/(phases|requests|milestones)\//i],
  ['roadmap-future', /(^|\/)\.viepilot\/ROADMAP\.md$|(^|\/)ROADMAP[^/]*\.md$/i],
  ['architecture', /(^|\/)\.viepilot\/ARCHITECTURE\.md$|(^|\/)docs\/(architecture|arch|design)\/|(^|\/)[^/]*architecture[^/]*\.(md|mmd|mermaid|png|svg)$|\.mmd$|\.mermaid$/i],
  ['visual', /(^|\/)\.viepilot\/ui-direction\/|(^|\/)(screenshots?|mockups?|prototypes?)\/|\.(png|jpe?g|gif|svg|webp)$/i],
  ['evidence', /metric|benchmark|coverage|result|case[-_ ]?stud|testimonial|feedback|survey|kpi|\.csv$/i],
  ['product-value', /(^|\/)docs\/user\/.*\.md$|(^|\/)docs\/brainstorm\/session-[^/]*\.md$|(^|\/)README[^/]*\.md$|(^|\/)\.viepilot\/PROJECT-(CONTEXT|META)\.md$|(^|\/)docs\/[^/]*(overview|vision|brief|product)[^/]*\.md$/i],
]);

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', 'coverage', '.next', '.cache', 'vendor']);

function classifyPath(rel) {
  const p = rel.split(path.sep).join('/');
  for (const [kind, re] of RULES) if (re.test(p)) return kind; // a null kind = skipped path
  return null;
}

/**
 * Version numbers in a source text that disagree with the project's current version (BUG-035 G4: a stale README
 * offered "3.8.0, 2210 tests" as fact). Returns the stale strings so the Content Map can DROP or re-check them.
 * @param {string} text
 * @param {{version?: string}} current
 * @returns {string[]}
 */
function findStaleFacts(text, current = {}) {
  const out = [];
  const v = String(current.version || '');
  if (!v) return out;
  for (const m of String(text || '').matchAll(/\bv?(\d+\.\d+\.\d+)\b/g)) {
    if (m[1] !== v && !out.includes(m[1])) out.push(m[1]);
  }
  return out;
}

// Minimal glob: `**` any depth, `*` within a segment, `?` one char.
function globToRegex(glob) {
  const esc = glob.split('/').join('/').replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*\/?/g, '\u0000').replace(/\*/g, '[^/]*').replace(/\?/g, '[^/]').replace(/\u0000/g, '(?:.*/)?');
  return new RegExp(`^${esc}$`);
}

/**
 * @param {string} root
 * @param {{include?: string[], exclude?: string[], maxFiles?: number}} [opts]
 * @returns {{path: string, kind: string, size: number, userAdded?: boolean}[]}
 */
function inventorySources(root, opts = {}) {
  const exclude = (opts.exclude || []).map(globToRegex);
  const include = (opts.include || []).map(globToRegex);
  const maxFiles = opts.maxFiles || 5000;
  const out = [];
  const walk = (dir) => {
    let entries = [];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (_) { return; }
    for (const e of entries) {
      if (out.length >= maxFiles) return;
      const full = path.join(dir, e.name);
      const rel = path.relative(root, full).split(path.sep).join('/');
      if (e.isDirectory()) {
        if (SKIP_DIRS.has(e.name) || exclude.some((re) => re.test(rel) || re.test(`${rel}/`))) continue;
        if (rel.startsWith('docs/proposals')) continue; // never feed earlier decks back in as sources
        walk(full);
        continue;
      }
      if (exclude.some((re) => re.test(rel))) continue;
      let kind = classifyPath(rel);
      const userAdded = include.some((re) => re.test(rel));
      if (!kind && userAdded) kind = 'product-value';
      if (!kind) continue;
      let size = 0;
      try { size = fs.statSync(full).size; } catch (_) { /* ignore */ }
      out.push({ path: rel, kind, size, ...(userAdded ? { userAdded: true } : {}) });
    }
  };
  walk(root);
  if (fs.existsSync(path.join(root, '.git'))) out.push({ path: 'git:log', kind: 'process-log', size: 0 });
  return out.sort((a, b) => KINDS.indexOf(a.kind) - KINDS.indexOf(b.kind) || a.path.localeCompare(b.path));
}

/** Only these may be opened to extract facts; sensitive sources are never read. */
function readableSources(inventory) {
  return inventory.filter((s) => s.kind !== 'sensitive');
}

// ── Content Map ────────────────────────────────────────────────────────────────

function createContentMap() {
  return { items: [], nextId: 1 };
}

/**
 * @param {ReturnType<typeof createContentMap>} map
 * @param {{text: string, source: string, kind: string, decision: string, slide?: number, transformed?: string, reason?: string}} item
 * @returns {string} item id (e.g. "C3")
 */
function addItem(map, item) {
  const { text, source, kind, decision } = item;
  if (!KINDS.includes(kind)) throw new Error(`unknown source kind "${kind}"`);
  if (!DECISIONS.includes(decision)) throw new Error(`unknown decision "${decision}"`);
  if (kind === 'sensitive' && decision !== 'SENSITIVE') throw new Error('sensitive sources can only be marked SENSITIVE');
  if (kind === 'process-log' && decision === 'FIT') throw new Error('process-log content is never FIT — TRANSFORM it into an outcome, or DROP / BACKSTAGE it');
  if (decision === 'TRANSFORM' && !String(item.transformed || '').trim()) throw new Error('TRANSFORM needs the rewritten wording');
  if ((decision === 'FIT' || decision === 'TRANSFORM') && !(item.slide > 0)) throw new Error(`${decision} items must be assigned to a slide`);
  if ((decision === 'DROP' || decision === 'BACKSTAGE') && !String(item.reason || '').trim()) throw new Error(`${decision} needs a reason`);
  const id = `C${map.nextId++}`;
  map.items.push({ id, text: String(text || ''), source, kind, decision, slide: item.slide || null, transformed: item.transformed || null, reason: item.reason || null });
  return id;
}

/**
 * Every slide content line must cite map items (`refs`) that are FIT or TRANSFORM and assigned to that slide.
 * @param {{slides: {index:number, heading?:string, bullets?:string[], refs?: string[]}[]}} manifest
 * @returns {{ok: boolean, problems: string[], gaps: number[]}} gaps = slides with no usable content (ask the user, never invent)
 */
function validateManifestAgainstMap(manifest, map) {
  const byId = new Map(map.items.map((i) => [i.id, i]));
  const problems = [];
  const gaps = [];
  for (const s of manifest.slides || []) {
    const refs = s.refs || [];
    const hasContent = (s.bullets || []).length > 0 || String(s.body || '').trim();
    if (hasContent && !refs.length) problems.push(`slide ${s.index}: content without Content Map references`);
    for (const r of refs) {
      const it = byId.get(r);
      if (!it) problems.push(`slide ${s.index}: unknown reference ${r}`);
      else if (!['FIT', 'TRANSFORM'].includes(it.decision)) problems.push(`slide ${s.index}: ${r} is ${it.decision} and cannot appear on a slide`);
      else if (it.slide !== s.index) problems.push(`slide ${s.index}: ${r} is assigned to slide ${it.slide}`);
    }
    if (!hasContent && !refs.length && !/^(cover|thank you)/i.test(String(s.heading || ''))) gaps.push(s.index);
  }
  return { ok: problems.length === 0, problems, gaps };
}

/** Summary for the Content Map gate. */
function summarizeContentMap(map) {
  const count = Object.fromEntries(DECISIONS.map((d) => [d, map.items.filter((i) => i.decision === d).length]));
  const dropped = map.items.filter((i) => i.decision === 'DROP' || i.decision === 'BACKSTAGE').map((i) => `${i.id} ${i.decision}: ${i.text.slice(0, 80)} — ${i.reason}`);
  return { count, dropped };
}

module.exports = {
  findStaleFacts, KINDS, DECISIONS, classifyPath, inventorySources, readableSources, createContentMap, addItem, validateManifestAgainstMap, summarizeContentMap };
