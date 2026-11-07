'use strict';

/**
 * vp-proposal curation guards (ENH-122 / ENH-123).
 *
 * detectProcessLeak — a proposal is not a changelog: versions, phase/task/request ids, commit hashes,
 *   changelog verbs, dated "what we did" lists and "first we… then we…" narration are flagged.
 * detectDevNotes — not-done work, "things to watch / remaining" lists and hedges are development
 *   notes, not audience content; each finding goes to the Backstage Editor (#31).
 * enforceMaterialRule — material risks may not be hidden from a decision audience: only fix|reframe.
 *
 * Bilingual (vi accented/unaccented + en), whole-word matching. Zero dependencies.
 */

const strip = (t) => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[đĐ]/g, 'd').toLowerCase();
const norm = (t) => String(t || '').normalize('NFC').toLowerCase();

// Whole-word phrase match; the diacritic-stripped form is used only for unaccented input
// (otherwise short words collide, e.g. "quỹ" vs "quý").
function findPhrase(text, phrase) {
  const n = norm(text);
  const unaccented = strip(text) === n;
  const hay = n;
  const needle = unaccented ? strip(phrase) : norm(phrase);
  const re = new RegExp(`(?<![\\p{L}\\p{N}])${needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\p{L}\\p{N}])`, 'u');
  const m = re.exec(hay);
  return m ? m.index : -1;
}

function textsOf(manifest, script) {
  const out = [];
  (manifest.slides || []).forEach((s, i) => {
    const slide = s.index || i + 1;
    if (s.heading) out.push({ slide, location: 'slide', field: 'heading', text: s.heading });
    (Array.isArray(s.bullets) ? s.bullets : s.body ? String(s.body).split('\n') : []).forEach((b) => b && out.push({ slide, location: 'slide', field: 'bullet', text: b }));
    if (s.speakerNotes) out.push({ slide, location: 'notes', field: 'notes', text: s.speakerNotes });
  });
  for (const line of (script && script.lines) || []) out.push({ slide: line.slide, location: 'script', field: 'script', text: line.text });
  return out;
}

// ── Process leak ────────────────────────────────────────────────────────────────

const CHANGELOG_VERBS = ['added', 'fixed', 'refactored', 'bumped', 'merged', 'implemented', 'updated', 'removed', 'deprecated', 'shipped',
  'đã thêm', 'đã sửa', 'đã cập nhật', 'đã triển khai', 'đã hoàn thành', 'bổ sung', 'sửa lỗi', 'nâng cấp', 'nâng version', 'refactor'];
const NARRATION = ['first we', 'then we', 'after that we', 'next we', 'finally we', 'đầu tiên chúng tôi', 'sau đó chúng tôi', 'tiếp theo chúng tôi', 'cuối cùng chúng tôi', 'đầu tiên mình', 'sau đó mình'];

const VERSION = /(?<![\w.])v?\d+\.\d+\.\d+(?![\w.])/i;
const IDS = /\b(?:(?:phase|giai đoạn|sprint)\s+\d+|(?:ENH|BUG|FEAT|DEBT|TASK)-\d+|vp-p\d+(?:-t[\d.]+)?)\b/i;
const HASH = /\b(?=[0-9a-f]*[a-f])(?=[0-9a-f]*\d)[0-9a-f]{7,40}\b/;
const PATH_OR_FN = /\b[\w.-]+\/[\w./-]+\.(?:cjs|mjs|js|ts|tsx|md|json|py|ya?ml|java|go|rb)\b|\b[a-z]+[A-Z]\w*\(\)/;
const DATE_START = /^\s*(?:\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|(?:week|tuần|tuan)\s*\d+|q[1-4]\b|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\d)/i;

const TECHNICAL_TYPES = new Set(['tech-architecture']);
const MILESTONE_VARIANTS = new Set(['research-proposal:progress-report', 'internal-presentation:leadership-report', 'research-proposal:kickoff']);

/**
 * @returns {{slide:number, location:string, rule:string, quote:string, suggestion:string}[]}
 */
function detectProcessLeak(manifest, opts = {}) {
  const { type, variant, audienceProfile } = opts;
  const technical = TECHNICAL_TYPES.has(type) || (audienceProfile && audienceProfile.knowledge === 'expert');
  const milestones = MILESTONE_VARIANTS.has(`${type}:${variant}`);
  const out = [];
  const add = (t, rule, suggestion) => out.push({ slide: t.slide, location: t.location, rule, quote: t.text, suggestion });
  const texts = textsOf(manifest, opts.script);
  for (const t of texts) {
    if (VERSION.test(t.text)) add(t, 'version-number', 'Say what changed for the audience, not which release it shipped in.');
    if (IDS.test(t.text)) add(t, 'internal-id', 'Remove phase/task/request ids; describe the outcome.');
    if (HASH.test(t.text)) add(t, 'commit-hash', 'Remove commit hashes.');
    if (!technical && PATH_OR_FN.test(t.text)) add(t, 'file-or-function', 'Name the capability, not the file or function.');
    // A changelog verb opening a bullet, or opening any sentence of the notes / script.
    const openers = t.field === 'bullet' ? [t.text.replace(/^[^\p{L}\p{N}]+/u, '')] : t.text.split(/(?<=[.!?])\s+/).map((x) => x.replace(/^[^\p{L}\p{N}]+/u, ''));
    if (openers.some((o) => CHANGELOG_VERBS.some((v) => findPhrase(o, v) === 0))) {
      add(t, 'changelog-verb', 'Rewrite as a benefit or result ("You can now…", "Teams save…").');
    }
  }
  // Per-slide patterns
  const bySlide = new Map();
  for (const t of texts) { if (!bySlide.has(t.slide)) bySlide.set(t.slide, []); bySlide.get(t.slide).push(t); }
  for (const [slide, ts] of bySlide) {
    const dated = ts.filter((t) => t.field === 'bullet' && DATE_START.test(t.text));
    if (!milestones && dated.length >= 3) out.push({ slide, location: 'slide', rule: 'dated-list', quote: dated.map((t) => t.text).join(' / '), suggestion: 'A timeline of what was done is a log; show results or the plan ahead instead.' });
    const narr = ts.filter((t) => NARRATION.some((p) => findPhrase(t.text, p) >= 0));
    if (narr.length >= 2) out.push({ slide, location: narr[0].location, rule: 'process-narration', quote: narr.map((t) => t.text).join(' / '), suggestion: 'Lead with why it matters and what changes, not the order of work.' });
  }
  return out;
}

// ── Dev notes ───────────────────────────────────────────────────────────────────

const DEV_PHRASES = Object.freeze({
  'not-done': ['chưa làm', 'chưa hoàn thành', 'chưa xong', 'đang làm', 'sẽ làm sau', 'chưa có', 'chưa triển khai', 'todo', 'wip', 'pending', 'not yet', 'in progress', 'to be done', 'planned but', 'not implemented'],
  'watch-out': ['cần quan tâm', 'cần lưu ý', 'lưu ý', 'còn lại', 'tồn đọng', 'vấn đề còn', 'known issues', 'known issue', 'limitations', 'caveats', 'remaining', 'open issues'],
  hedge: ['tạm thời', 'chưa ổn định', 'hy vọng', 'chưa chắc', 'workaround', 'hack', 'hopefully', 'temporarily', 'not stable', 'unstable', 'might not'],
});
const MATERIAL = ['ngân sách', 'chi phí', 'vượt', 'trễ', 'chậm tiến độ', 'bảo mật', 'pháp lý', 'mất dữ liệu', 'rò rỉ', 'budget', 'cost', 'overrun', 'delay', 'late', 'security', 'legal', 'compliance', 'data loss', 'breach', 'outage'];

/**
 * @returns {{slide:number, location:string, quote:string, kind:'dev-note'|'weakness', category:string, phrase:string, materialHint:boolean}[]}
 */
function detectDevNotes(manifest, script) {
  const out = [];
  for (const t of textsOf(manifest, script)) {
    for (const [category, phrases] of Object.entries(DEV_PHRASES)) {
      const hit = phrases.find((p) => findPhrase(t.text, p) >= 0);
      if (!hit) continue;
      out.push({
        slide: t.slide, location: t.location, quote: t.text,
        kind: category === 'hedge' ? 'weakness' : 'dev-note', category, phrase: hit,
        materialHint: MATERIAL.some((m) => findPhrase(t.text, m) >= 0),
      });
      break;
    }
  }
  return out;
}

// ── Material rule ───────────────────────────────────────────────────────────────

const DECISION_AUDIENCES = new Set(['project-proposal:', 'research-proposal:grant-proposal', 'research-proposal:progress-report', 'internal-presentation:leadership-report']);
const ACTIONS = Object.freeze(['fix', 'reframe', 'backstage', 'remove']);

function isDecisionAudience(type, variant) {
  return DECISION_AUDIENCES.has(`${type}:${variant || ''}`) || DECISION_AUDIENCES.has(`${type}:`);
}

/**
 * @param {{material: boolean, action: string, slide?: number, quote?: string}[]} findings with the Backstage Editor's decisions
 * @returns {{ok: boolean, violations: object[]}}
 */
function enforceMaterialRule(findings, { type, variant } = {}) {
  const violations = [];
  for (const f of findings || []) {
    if (!ACTIONS.includes(f.action)) violations.push({ ...f, reason: `unknown action "${f.action}"` });
    else if (f.material && isDecisionAudience(type, variant) && (f.action === 'backstage' || f.action === 'remove')) {
      violations.push({ ...f, reason: 'material risk for a decision audience — only fix or reframe (risk → mitigation → ask)' });
    }
  }
  return { ok: violations.length === 0, violations };
}

// ── Backstage ──────────────────────────────────────────────────────────────────

/**
 * Presenter-only file from the Backstage Editor's decisions. Never rendered into slides or the script.
 * @param {{slide:number, quote:string, action:string, material?:boolean, reason?:string, question?:string,
 *          preparedAnswer?:string, owner?:string, due?:string, reframedAs?:string}[]} decisions
 * @param {{title?: string}} [meta]
 */
function buildBackstage(decisions, meta = {}) {
  const by = (a) => decisions.filter((d) => d.action === a);
  const lines = [`# Backstage — ${meta.title || 'proposal'}`, '', '> Presenter only. Not shown on slides and not read aloud.', ''];
  const qa = decisions.filter((d) => d.question || d.preparedAnswer);
  lines.push('## Likely tough questions', '');
  if (qa.length) for (const d of qa) lines.push(`- **Slide ${d.slide}** — ${d.question || 'Question about: ' + d.quote}`, `  - Prepared answer: ${d.preparedAnswer || '(to prepare)'}`);
  else lines.push('- (none recorded)');
  lines.push('', '## Open items (moved backstage)', '');
  const open = by('backstage');
  if (open.length) for (const d of open) lines.push(`- Slide ${d.slide}: ${d.quote} — owner: ${d.owner || 'TBD'}, due: ${d.due || 'TBD'}${d.reason ? ` — ${d.reason}` : ''}`);
  else lines.push('- (none)');
  lines.push('', '## Reframed on the slides', '');
  const re = by('reframe');
  if (re.length) for (const d of re) lines.push(`- Slide ${d.slide}: "${d.quote}" → "${d.reframedAs || '(rewrite pending)'}"${d.material ? ' (material risk: risk → mitigation → ask)' : ''}`);
  else lines.push('- (none)');
  lines.push('', '## To fix before presenting', '');
  const fix = by('fix');
  if (fix.length) for (const d of fix) lines.push(`- Slide ${d.slide}: ${d.quote}${d.reason ? ` — ${d.reason}` : ''}`);
  else lines.push('- (none)');
  lines.push('', '## Removed', '');
  const rm = by('remove');
  if (rm.length) for (const d of rm) lines.push(`- Slide ${d.slide}: ${d.quote} — ${d.reason || 'not relevant to this audience'}`);
  else lines.push('- (none)');
  return lines.join('\n') + '\n';
}

/**
 * Anything moved backstage or removed must not reappear in the slides, notes or script.
 * @returns {{ok: boolean, leaks: {slide:number, location:string, quote:string}[]}}
 */
function findBackstageLeaks(decisions, manifest, script) {
  const hidden = decisions.filter((d) => d.action === 'backstage' || d.action === 'remove').map((d) => norm(d.quote).replace(/\s+/g, ' ').trim()).filter((q) => q.length >= 8);
  const leaks = [];
  for (const t of textsOf(manifest, script)) {
    const text = norm(t.text).replace(/\s+/g, ' ');
    for (const q of hidden) if (text.includes(q)) leaks.push({ slide: t.slide, location: t.location, quote: t.text });
  }
  return { ok: leaks.length === 0, leaks };
}

module.exports = { DEV_PHRASES, ACTIONS, detectProcessLeak, detectDevNotes, enforceMaterialRule, isDecisionAudience, buildBackstage, findBackstageLeaks };
