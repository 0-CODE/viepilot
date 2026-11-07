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
// Sense guards (BUG-035 G6): the phrase only counts as a dev note in its work-item sense.
const PRONOUN_BEFORE = /(?:mình|tôi|bạn|họ|ta|anh|chị|em|mọi người|người ta)\s+$/u;
const BACKLOG_NOUN = /^\s+(?:\p{L}+\s+){0,2}?(?:tính năng|chức năng|test|kiểm thử|tài liệu|hỗ trợ|api|giao diện|ui|module|màn hình|bản build|bản phát hành|phần)(?![\p{L}])/iu;
function devSense(line, phrase) {
  const n = norm(line);
  const i = findPhrase(line, phrase);
  if (i < 0) return false;
  const before = n.slice(0, i);
  const after = n.slice(i + norm(phrase).length);
  if (phrase === 'đang làm') return !PRONOUN_BEFORE.test(before) && !/^\s+gì(?![\p{L}])/u.test(after);
  if (phrase === 'chưa có') return BACKLOG_NOUN.test(after);
  return true;
}

const sentences = (text) => String(text || '').split(/\n+|(?<=[.!?…])\s+/).map((x) => x.trim()).filter(Boolean);
const sameItem = (a, b) => a.slide === b.slide && norm(a.quote).trim() === norm(b.quote).trim();

/**
 * @param {object} manifest
 * @param {object} [script]
 * @param {{keep?: {slide:number, quote:string}[]}} [opts] lines the user chose to keep (false positives)
 * @returns {{slide:number, location:string, quote:string, kind:'dev-note'|'weakness', category:string, phrase:string, materialHint:boolean}[]}
 *   `quote` is the matching line, not the whole note.
 */
function detectDevNotes(manifest, script, opts = {}) {
  const keep = opts.keep || [];
  const out = [];
  for (const t of textsOf(manifest, script)) {
    for (const line of sentences(t.text)) {
      for (const [category, phrases] of Object.entries(DEV_PHRASES)) {
        const hit = phrases.find((p) => devSense(line, p));
        if (!hit) continue;
        const f = {
          slide: t.slide, location: t.location, quote: line,
          kind: category === 'hedge' ? 'weakness' : 'dev-note', category, phrase: hit,
          materialHint: MATERIAL.some((m) => findPhrase(line, m) >= 0),
        };
        if (!keep.some((k) => sameItem(k, f))) out.push(f);
        break;
      }
    }
  }
  return out;
}

// ── Material rule ───────────────────────────────────────────────────────────────

const DECISION_AUDIENCES = new Set(['project-proposal:', 'research-proposal:grant-proposal', 'research-proposal:progress-report', 'internal-presentation:leadership-report']);
// `keep` = flagged line stays as it is (false positive or deliberate) — BUG-035 G6.
const ACTIONS = Object.freeze(['fix', 'reframe', 'backstage', 'remove', 'keep']);

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

const BACKSTAGE_HEADINGS = Object.freeze({
  en: { intro: 'Presenter only. Not shown on slides and not read aloud.', qa: 'Likely tough questions', answer: 'Prepared answer', toPrepare: '(to prepare)',
    open: 'Open items (moved backstage)', reframed: 'Reframed on the slides', pending: 'Reframe not on the slides yet', fix: 'To fix before presenting',
    removed: 'Removed', none: '(none)', noneRecorded: '(none recorded)', owner: 'owner', due: 'due', notRelevant: 'not relevant to this audience', contentMap: 'Content Map' },
  vi: { intro: 'Chỉ người trình bày xem. Không hiện trên slide, không đọc to.', qa: 'Câu hỏi khó có thể gặp', answer: 'Trả lời chuẩn bị sẵn', toPrepare: '(cần chuẩn bị)',
    open: 'Việc còn mở (chuyển ra hậu trường)', reframed: 'Đã diễn đạt lại trên slide', pending: 'Diễn đạt lại nhưng chưa có trên slide', fix: 'Cần sửa trước khi trình bày',
    removed: 'Đã bỏ', none: '(không có)', noneRecorded: '(chưa ghi nhận)', owner: 'người phụ trách', due: 'hạn', notRelevant: 'không liên quan tới người nghe này', contentMap: 'Content Map' },
});

/**
 * Presenter-only file from the Backstage Editor's decisions. Never rendered into slides or the script.
 * BUG-035 G6: headings follow `meta.lang`; a decision already listed as a tough question is not repeated under
 * Open items; Removed also lists Content Map DROP items; a reframe is only "on the slides" when its new wording
 * is actually in the manifest (when `meta.manifest` is given).
 * @param {{slide:number, quote:string, action:string, material?:boolean, reason?:string, question?:string,
 *          preparedAnswer?:string, owner?:string, due?:string, reframedAs?:string}[]} decisions
 * @param {{title?: string, lang?: string, manifest?: object, contentMap?: {items: object[]}}} [meta]
 */
function buildBackstage(decisions, meta = {}) {
  const H = BACKSTAGE_HEADINGS[meta.lang] || BACKSTAGE_HEADINGS.en;
  const by = (a) => decisions.filter((d) => d.action === a);
  const lines = [`# Backstage — ${meta.title || 'proposal'}`, '', `> ${H.intro}`, ''];
  const qa = decisions.filter((d) => d.question || d.preparedAnswer);
  lines.push(`## ${H.qa}`, '');
  if (qa.length) for (const d of qa) lines.push(`- **Slide ${d.slide}** — ${d.question || d.quote}`, `  - ${H.answer}: ${d.preparedAnswer || H.toPrepare}`);
  else lines.push(`- ${H.noneRecorded}`);
  lines.push('', `## ${H.open}`, '');
  const open = by('backstage').filter((d) => !d.question && !d.preparedAnswer);
  if (open.length) for (const d of open) lines.push(`- Slide ${d.slide}: ${d.quote} — ${H.owner}: ${d.owner || 'TBD'}, ${H.due}: ${d.due || 'TBD'}${d.reason ? ` — ${d.reason}` : ''}`);
  else lines.push(`- ${H.none}`);
  const deckText = meta.manifest ? norm(textsOf(meta.manifest).map((t) => t.text).join('\n')).replace(/\s+/g, ' ') : null;
  const onSlides = (d) => !deckText || (d.reframedAs && deckText.includes(norm(d.reframedAs).replace(/\s+/g, ' ').trim()));
  const re = by('reframe');
  lines.push('', `## ${H.reframed}`, '');
  const done = re.filter(onSlides);
  if (done.length) for (const d of done) lines.push(`- Slide ${d.slide}: "${d.quote}" → "${d.reframedAs}"${d.material ? ' (material risk: risk → mitigation → ask)' : ''}`);
  else lines.push(`- ${H.none}`);
  const pending = re.filter((d) => !onSlides(d));
  if (pending.length) {
    lines.push('', `## ${H.pending}`, '');
    for (const d of pending) lines.push(`- Slide ${d.slide}: "${d.quote}" → "${d.reframedAs || '?'}"`);
  }
  lines.push('', `## ${H.fix}`, '');
  const fix = by('fix');
  if (fix.length) for (const d of fix) lines.push(`- Slide ${d.slide}: ${d.quote}${d.reason ? ` — ${d.reason}` : ''}`);
  else lines.push(`- ${H.none}`);
  lines.push('', `## ${H.removed}`, '');
  const rm = by('remove').map((d) => `- Slide ${d.slide}: ${d.quote} — ${d.reason || H.notRelevant}`);
  const drops = ((meta.contentMap && meta.contentMap.items) || []).filter((it) => it.decision === 'DROP').map((it) => `- ${H.contentMap} ${it.id}: ${it.text} — ${it.reason || H.notRelevant}`);
  const removed = [...rm, ...drops];
  if (removed.length) lines.push(...removed);
  else lines.push(`- ${H.none}`);
  return lines.join('\n') + '\n';
}

// ── Consistency + placeholders (BUG-035 G6) ─────────────────────────────────────

const TIME_MARKERS = [
  { side: 'before', re: /(?<![\p{L}])(?:trước|before)\s+(buổi|session|meeting|talk|demo|sprint)(?![\p{L}])/giu },
  { side: 'after', re: /(?<![\p{L}])(?:sau|after)\s+(buổi|session|meeting|talk|demo|sprint)(?![\p{L}])/giu },
];
// "<word> <number> <unit>" — the word before the number names the thing ("thử 2 tuần", "demo 4 phút").
const UNIT = /(?<![\p{L}])(\p{L}{3,})\s+~?(\d+(?:[.,]\d+)?)\s*(tuần|ngày|phút|giờ|tháng|người|weeks?|days?|minutes?|hours?|months?|people)(?![\p{L}])/giu;
const STOP = new Set(['trong', 'theo', 'mình', 'được', 'những', 'không', 'nhưng', 'người', 'buổi', 'một', 'các', 'của', 'cho', 'với', 'này', 'là', 'và', 'có', 'sẽ', 'đã', 'thì', 'mà', 'nó', 'khi', 'slide',
  'with', 'this', 'that', 'from', 'will', 'have', 'the', 'and', 'for', 'are', 'you', 'our']);
// Vietnamese words are short (thử, đội), so 3+ letters count.
const contentWords = (t) => new Set((norm(t).match(/[\p{L}]{3,}/gu) || []).filter((w) => !STOP.has(w)));
const overlap = (a, b) => { const B = contentWords(b); let n = 0; for (const w of contentWords(a)) if (B.has(w)) n++; return n; };

/**
 * The same fact stated two ways across slides, notes, script and extra files (e.g. backstage): opposite time
 * words for the same event (before / after the session) or different numbers for the same unit, in sentences
 * that share at least two content words.
 * @param {object} manifest
 * @param {{name: string, text: string}[]} [extra] other package files (backstage, docx text…)
 * @returns {{kind: 'time'|'number', a: object, b: object}[]}
 */
function checkConsistency(manifest, extra = []) {
  const items = [];
  for (const t of textsOf(manifest)) for (const line of sentences(t.text)) items.push({ where: `slide ${t.slide} ${t.location}`, text: line });
  for (const f of extra) for (const line of sentences(f.text)) items.push({ where: f.name, text: line });
  const facts = [];
  for (const it of items) {
    for (const m of TIME_MARKERS) for (const x of it.text.matchAll(m.re)) facts.push({ kind: 'time', key: norm(x[1]), value: m.side, it });
    for (const x of it.text.matchAll(UNIT)) facts.push({ kind: 'number', key: `${norm(x[1])} ${norm(x[3]).replace(/s$/, '')}`, value: x[2], it });
  }
  const out = [];
  for (let i = 0; i < facts.length; i++) {
    for (let j = i + 1; j < facts.length; j++) {
      const a = facts[i], b = facts[j];
      if (a.kind !== b.kind || a.key !== b.key || a.value === b.value || a.it === b.it) continue;
      // A sentence that also states the other value (a range, "~5–6 min (demo ~4 min)") is not a contradiction.
      const vals = (it) => new Set(facts.filter((f) => f.it === it && f.kind === a.kind && f.key === a.key).map((f) => f.value));
      if (vals(a.it).has(b.value) || vals(b.it).has(a.value)) continue;
      if (overlap(a.it.text, b.it.text) < 2) continue;
      out.push({ kind: a.kind, a: { where: a.it.where, text: a.it.text }, b: { where: b.it.where, text: b.it.text } });
    }
  }
  return out;
}

const CUE_TOKENS = /^\[(?:click|pause|stress|dừng|dung|nhấn|nhan|demo|q&a)\]$/i;

/**
 * Fill-in markers like "[điền tên + kênh trước buổi]" or "[TBD]" left in slides or notes. Confirm Output lists
 * them and needs an explicit "ship with placeholders" choice.
 * @returns {{slide:number, location:string, placeholder:string}[]}
 */
function findPlaceholders(manifest) {
  const out = [];
  for (const t of textsOf(manifest)) {
    for (const m of String(t.text).matchAll(/\[[^\]\n]{2,80}\]/g)) {
      if (CUE_TOKENS.test(m[0])) continue;
      out.push({ slide: t.slide, location: t.location, placeholder: m[0] });
    }
  }
  return out;
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

module.exports = { DEV_PHRASES, ACTIONS, BACKSTAGE_HEADINGS, detectProcessLeak, detectDevNotes, enforceMaterialRule, isDecisionAudience, buildBackstage, findBackstageLeaks, checkConsistency, findPlaceholders };
