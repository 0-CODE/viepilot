'use strict';

/**
 * Rehearsal Hall report (ENH-121): self-contained HTML (inline SVG, no network), summary.md, data.json.
 * Zero dependencies. The 3D hall (Phase 174.5) is injected through `opts.hallScript`.
 */

const fs = require('fs');
const path = require('path');

const esc = (s) => String(s === null || s === undefined ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtT = (sec) => `${Math.floor(sec / 60)}:${String(Math.round(sec % 60)).padStart(2, '0')}`;

const LABEL = {
  en: { banner: 'AI simulation — not real audience data', summary: 'Summary', retention: 'Retention', weighted: 'decision-maker weighted', all: 'all listeners',
    tuneouts: 'When people stopped listening', evaluations: 'Persona evaluations', improvements: 'What to improve first', keywords: 'Keyword effectiveness',
    criteria: 'Criteria by persona group', heatmap: 'Attention heatmap', load: 'Cognitive load and confusion', emotion: 'Emotion arc vs intended arc',
    funnel: 'Persuasion funnel', questions: 'Questions and objections', pacing: 'Pacing: planned vs spoken', recall: 'Remembered after 24 hours',
    deltas: 'Compared with the previous run', hall: 'Hall replay', none: 'None', slide: 'Slide', persona: 'Persona', reason: 'Reason', time: 'Time',
    answered: 'answered', unanswered: 'unanswered', wouldAct: 'would act', wouldNot: 'would not act yet',
    estimate: 'model estimate — each listener\'s own judgement, not a measurement', grounding: 'Grounding',
    sawSlides: 'saw every slide', verified: 'verified from transcripts', mechanical: 'quoted whole segments (reactions without a real quote dropped)',
    textOnly: 'Not every listener saw the slides — visual feedback comes only from those who did.',
    panel: 'Panel Q&A', presenter: 'Presenter', round: 'Round', engine: 'engine', unansweredQ: 'Not answerable from the material (add to the deck or backstage)',
    beforeAfter: 'Before / after the panel', changed: 'changed', unchanged: 'unchanged', flagged: 'flagged', relayed: 'relayed by the orchestrator', teams: 'agent teams (direct messages)' },
  vi: { banner: 'Mô phỏng bằng AI — không phải dữ liệu khán giả thật', summary: 'Tóm tắt', retention: 'Giữ chân', weighted: 'theo trọng số người quyết định', all: 'tất cả người nghe',
    tuneouts: 'Lúc người nghe ngưng tiếp nhận', evaluations: 'Đánh giá của persona', improvements: 'Nên cải thiện trước', keywords: 'Hiệu quả từ khóa',
    criteria: 'Tiêu chí theo nhóm persona', heatmap: 'Bản đồ chú ý', load: 'Tải nhận thức và điểm rối', emotion: 'Cung cảm xúc so với cung kể chuyện',
    funnel: 'Phễu thuyết phục', questions: 'Câu hỏi và phản bác', pacing: 'Nhịp độ: dự kiến so với nói thật', recall: 'Còn nhớ sau 24 giờ',
    deltas: 'So với lần tập trước', hall: 'Xem lại hội trường', none: 'Không có', slide: 'Slide', persona: 'Persona', reason: 'Lý do', time: 'Thời điểm',
    answered: 'đã trả lời', unanswered: 'chưa trả lời', wouldAct: 'sẵn sàng hành động', wouldNot: 'chưa hành động',
    estimate: 'ước lượng của mô hình — mỗi người nghe tự chấm, không phải số đo', grounding: 'Độ bám thực tế',
    sawSlides: 'đã xem đủ slide', verified: 'đã kiểm chứng qua transcript', mechanical: 'chép nguyên đoạn (phản ứng không có trích dẫn thật bị loại)',
    textOnly: 'Không phải ai cũng xem slide — nhận xét về hình ảnh chỉ đến từ người đã xem.',
    panel: 'Panel hỏi đáp', presenter: 'Diễn giả', round: 'Vòng', engine: 'cách chạy', unansweredQ: 'Tài liệu chưa có câu trả lời (bổ sung vào deck hoặc backstage)',
    beforeAfter: 'Trước / sau panel', changed: 'đổi ý', unchanged: 'giữ ý', flagged: 'bị gắn cờ', relayed: 'điều phối chuyển tin', teams: 'agent teams (nhắn trực tiếp)' },
};

// ── SVG charts ────────────────────────────────────────────────────────────────

function lineChart(series, { width = 640, height = 220, yMax = 100, yMin = 0, xLabels = [] } = {}) {
  const pad = { l: 36, r: 12, t: 12, b: 28 };
  const n = Math.max(1, ...series.map((s) => s.values.length));
  const x = (i) => pad.l + (n === 1 ? 0 : (i / (n - 1)) * (width - pad.l - pad.r));
  const y = (v) => pad.t + (1 - (v - yMin) / (yMax - yMin || 1)) * (height - pad.t - pad.b);
  const grid = [yMin, (yMin + yMax) / 2, yMax].map((v) => `<line x1="${pad.l}" x2="${width - pad.r}" y1="${y(v)}" y2="${y(v)}" class="grid"/><text x="4" y="${y(v) + 4}" class="axis">${Math.round(v)}</text>`).join('');
  const lines = series.map((s, k) => `<polyline fill="none" class="series s${k}" points="${s.values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')}"/>`).join('');
  const labels = xLabels.map((l, i) => (l ? `<text x="${x(i)}" y="${height - 8}" class="axis" text-anchor="middle">${esc(l)}</text>` : '')).join('');
  const legend = series.map((s, k) => `<span class="key s${k}">${esc(s.name)}</span>`).join(' ');
  return `<div class="chart"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(series.map((s) => s.name).join(', '))}">${grid}${lines}${labels}</svg><div class="legend">${legend}</div></div>`;
}

function barChart(rows, { max, unit = '' } = {}) {
  const m = max || Math.max(1, ...rows.map((r) => Math.max(...r.values.map(Math.abs))));
  return `<div class="bars">${rows.map((r) => `<div class="bar-row"><span class="bar-label">${esc(r.label)}</span><span class="bar-track">${r.values.map((v, k) => `<span class="bar s${k}" style="width:${Math.max(0, Math.min(100, (Math.abs(v) / m) * 100)).toFixed(1)}%" title="${esc(v)}${unit}"></span>`).join('')}</span><span class="bar-value">${r.values.map((v) => `${esc(v)}${unit}`).join(' / ')}</span></div>`).join('')}</div>`;
}

function heatmapSvg(rows, slides, names) {
  const cw = 44; const ch = 22; const lw = 150;
  const w = lw + slides.length * cw; const h = 24 + rows.length * ch;
  const cells = rows.map((r, i) => slides.map((s, j) => {
    const v = r.bySlide[s] ?? 0;
    return `<rect x="${lw + j * cw}" y="${24 + i * ch}" width="${cw - 2}" height="${ch - 2}" rx="3" class="heat" style="fill-opacity:${(0.12 + (v / 100) * 0.88).toFixed(2)}"><title>${esc(names(r.personaId))} · ${esc(s)}: ${v}</title></rect>`;
  }).join('') + `<text x="0" y="${24 + i * ch + 15}" class="axis">${esc(names(r.personaId))}</text>`).join('');
  const head = slides.map((s, j) => `<text x="${lw + j * cw + cw / 2}" y="16" class="axis" text-anchor="middle">${esc(s)}</text>`).join('');
  return `<div class="chart scroll"><svg viewBox="0 0 ${w} ${h}" width="${w}" role="img" aria-label="attention heatmap">${head}${cells}</svg></div>`;
}

const table = (head, rows) => `<div class="scroll"><table><thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;

// ── HTML ──────────────────────────────────────────────────────────────────────

/**
 * @param {object} agg aggregate() output
 * @param {{title?: string, lang?: 'vi'|'en', timeline?: object, personaName?: (id:number)=>string, hallScript?: string, hallData?: object}} [opts]
 */
/** Grounding line under the summary KPIs (BUG-036): visual coverage, verification, mechanical quoting. */
function groundingText(s, L) {
  const v = s.visualCoverage;
  if (!v) return '';
  const parts = [`${v.seen}/${v.total} ${L.sawSlides}`, `${v.verified}/${v.total} ${L.verified}`];
  if (s.mechanicalQuotes) parts.push(`${s.mechanicalQuotes}/${v.total} ${L.mechanical}`);
  return `${L.grounding}: ${parts.join(' · ')}`;
}
function groundingHtml(s, L) {
  const t = groundingText(s, L);
  if (!t) return '';
  const weak = s.visualCoverage.seen < s.visualCoverage.total || s.mechanicalQuotes > 0;
  return `<p class="grounding ${weak ? 'warn' : 'ok'}">${esc(t)}</p>${weak ? `<p class="warn">${esc(L.textOnly)}</p>` : ''}<p class="sim-label">${esc(L.estimate)}</p>`;
}

/** Panel Q&A (ENH-128): chat transcript, unanswered questions, before/after. */
function panelHtml(p, L, name) {
  const who = (x) => (x === 'presenter' ? L.presenter : x === 'all' ? '*' : name(Number(x)));
  const engine = p.engine === 'teams' ? L.teams : L.relayed;
  const msgs = (p.transcript && p.transcript.messages) || [];
  const chat = msgs.map((m) => `<div class="msg ${m.from === 'presenter' ? 'msg-p' : ''}"><div class="muted">${esc(L.round)} ${esc(m.round)} · <b>${esc(who(m.from))}</b> → ${esc(who(m.to))}${m.cites && m.cites.length ? ` · [${esc(m.cites.join(', '))}]` : ''}${m.problems ? ` · <span class="warn">${esc(L.flagged)}: ${esc(m.problems.join('; '))}</span>` : ''}</div><div>${esc(m.text)}</div></div>`).join('');
  const un = (p.unanswered || []).length ? `<h3>${esc(L.unansweredQ)}</h3><ul>${p.unanswered.map((u) => `<li><b>${esc(name(Number(u.from)))}</b>: ${esc(u.text)} <span class="muted">(${esc(u.reason)})</span></li>`).join('')}</ul>` : '';
  const ba = (p.beforeAfter || []).length ? `<h3>${esc(L.beforeAfter)}</h3>` + table([L.persona, 'before', 'after', '', L.reason], p.beforeAfter.map((b) => [esc(name(b.personaId)), esc(b.before.wouldAct ? L.wouldAct : L.wouldNot), esc(b.after.wouldAct ? L.wouldAct : L.wouldNot), esc(b.changed ? L.changed : L.unchanged), esc(b.why)])) : '';
  return `<p class="muted">${esc(L.engine)}: ${esc(engine)} · ${esc((p.members || []).map((id) => name(id)).join(', '))}</p><div class="chat">${chat}</div>${un}${ba}`;
}

function renderReport(agg, opts = {}) {
  const L = LABEL[opts.lang] || LABEL.en;
  const name = opts.personaName || ((id) => `#${id}`);
  const s = agg.summary;
  const slides = [...new Set(agg.retention.map((r) => r.slide))];
  const kpi = (label, value) => `<div class="kpi"><div class="kpi-v">${esc(value)}</div><div class="kpi-l">${esc(label)}</div></div>`;
  // Every section carries the simulation label, so a screenshot of one chart cannot pass as real data (BUG-035 G9).
  const sec = (id, title, body) => `<section id="${id}"><h2>${esc(title)}</h2><p class="sim-label">${esc(L.banner)}</p>${body}</section>`;
  const parts = [];
  parts.push(sec('summary', L.summary, `<div class="kpis">${[
    kpi(L.retention, `${s.avgRetention}%`), kpi(L.weighted, `${s.avgWeightedRetention}%`), kpi(L.tuneouts, s.tuneOuts),
    kpi(L.wouldAct, `${s.wouldActPct}%`), kpi(L.recall, s.keyMessageRecall === null ? '—' : `${s.keyMessageRecall}%`), kpi(L.unanswered, s.unansweredObjections), kpi(L.time, fmtT(s.durationSec)),
  ].join('')}</div>${groundingHtml(s, L)}`));
  parts.push(sec('retention', L.retention, `<p class="sim-label">${esc(L.estimate)}</p>` + lineChart([
    { name: L.all, values: agg.retention.map((r) => r.pct) },
    { name: L.weighted, values: agg.retention.map((r) => r.weightedPct) },
  ], { xLabels: agg.retention.map((r, i) => (i === 0 || agg.retention[i - 1].slide !== r.slide ? `S${r.slide}` : '')) })));
  parts.push(sec('tuneouts', L.tuneouts, agg.tuneOuts.length ? table([L.persona, L.slide, L.time, L.reason, '“…”'], agg.tuneOuts.map((t) => [esc(name(t.personaId)) + (t.primary ? ' ★' : ''), esc(t.slide), fmtT(t.t), esc(t.reason), `<q>${esc(t.line)}</q>`])) : `<p>${L.none}</p>`));
  parts.push(sec('improvements', L.improvements, agg.improvements.length ? `<ol class="improve">${agg.improvements.map((i) => `<li><b>${L.slide} ${esc(i.slide)}</b> <span class="muted">(${esc(i.impact)})</span><ul>${[...i.reasons, ...i.suggestions.map((x) => `→ ${x}`)].map((x) => `<li>${esc(x)}</li>`).join('')}</ul></li>`).join('')}</ol>` : `<p>${L.none}</p>`));
  parts.push(sec('evaluations', L.evaluations, `<div class="cards">${agg.evaluations.map((e) => `<div class="card"><div class="card-h">${esc(name(e.personaId))}${e.primary ? ' ★' : ''}</div><div class="${e.wouldAct ? 'ok' : 'warn'}">${e.wouldAct ? L.wouldAct : L.wouldNot} · ${esc(e.stage)}</div><p><q>${esc(e.quote)}</q></p></div>`).join('')}</div>`));
  parts.push(sec('keywords', L.keywords, agg.keywords.length ? table(['Keyword', 'Mentions', L.slide, `${L.recall} %`, 'Emotion'], agg.keywords.map((k) => [esc(k.keyword), esc(k.mentions), esc(k.slides.join(', ')), esc(k.recallRate), esc(k.association ?? '—')])) : `<p>${L.none}</p>`));
  const groups = Object.entries(agg.criteriaByGroup || {});
  if (groups.length) {
    const codes = [...new Set(groups.flatMap(([, m]) => Object.keys(m)))];
    parts.push(sec('criteria', L.criteria, table(['Group', ...codes], groups.map(([g, m]) => [esc(g), ...codes.map((c) => esc(m[c] ?? '—'))]))));
  }
  parts.push(sec('heatmap', L.heatmap, `<p class="sim-label">${esc(L.estimate)}</p>` + heatmapSvg(agg.heatmap, slides, name)));
  parts.push(sec('load', L.load, barChart(agg.load.map((l) => ({ label: `S${l.slide}`, values: [l.score] })), { max: 100 }) + (agg.confusion.length ? table([L.slide, 'Drop', 'Cause', '“…”'], agg.confusion.map((c) => [esc(c.slide), esc(c.drop), esc(c.cause), `<q>${esc(c.line)}</q>`])) : '')));
  parts.push(sec('emotion', L.emotion, `<p class="sim-label">${esc(L.estimate)}</p>` + lineChart([
    { name: 'actual', values: agg.emotionArc.map((e) => e.actual) },
    { name: 'intended', values: agg.emotionArc.map((e) => (e.intended === null ? 0 : e.intended)) },
  ], { yMin: -2, yMax: 2, xLabels: agg.emotionArc.map((e) => `S${e.slide}`) })));
  parts.push(sec('funnel', L.funnel, barChart(agg.funnel.map((f) => ({ label: f.stage, values: [f.count] })), { max: s.listeners })));
  parts.push(sec('questions', L.questions, agg.questions.length ? table([L.slide, L.persona, 'Kind', '', ''], agg.questions.map((q) => [esc(q.slide), esc(name(q.personaId)), esc(q.kind), esc(q.text), q.answered ? `<span class="ok">${L.answered}</span>` : `<span class="warn">${L.unanswered}</span>`])) : `<p>${L.none}</p>`));
  parts.push(sec('pacing', L.pacing, barChart(agg.pacing.map((p) => ({ label: `S${p.slide}${p.overrun ? ' ⚠' : ''}`, values: [p.plannedSec, p.spokenSec] })), { unit: 's' })));
  parts.push(sec('recall', L.recall, (agg.recall.length ? barChart(agg.recall.map((r) => ({ label: r.message, values: [r.rate, r.weightedRate] })), { max: 100, unit: '%' }) : '') + (agg.topRecalled.length ? `<ul>${agg.topRecalled.map((t) => `<li>${esc(t.text)} <span class="muted">×${t.count}</span></li>`).join('')}</ul>` : '')));
  if (opts.panel) parts.push(sec('panel', L.panel, panelHtml(opts.panel, L, name)));
  if (agg.deltas) parts.push(sec('deltas', L.deltas, table(['Metric', 'Δ'], Object.entries(agg.deltas).map(([k, v]) => [esc(k), esc(v === null ? '—' : (v > 0 ? `+${v}` : v))]))));
  parts.push(sec('hall', L.hall, `<div id="hall-root" class="hall"></div>${opts.hallData ? `<script type="application/json" id="hall-data">${JSON.stringify(opts.hallData).replace(/</g, '\\u003c')}</script>` : ''}`));

  return `<!doctype html>
<html lang="${opts.lang === 'vi' ? 'vi' : 'en'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(opts.title || 'Rehearsal Hall')}</title>
<style>
:root{--bg:#f7f7f5;--fg:#1d1f24;--muted:#6b7080;--card:#fff;--line:#e3e4e8;--s0:#4f6ef7;--s1:#e8833a;--ok:#1f9d55;--warn:#c2410c;--heat:#4f6ef7}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--bg:#111317;--fg:#e8e9ec;--muted:#9aa0ad;--card:#1a1d23;--line:#2a2e36;--s0:#7d93ff;--s1:#f2a25c;--ok:#4ade80;--warn:#fb923c;--heat:#7d93ff}}
:root[data-theme="dark"]{--bg:#111317;--fg:#e8e9ec;--muted:#9aa0ad;--card:#1a1d23;--line:#2a2e36;--s0:#7d93ff;--s1:#f2a25c;--ok:#4ade80;--warn:#fb923c;--heat:#7d93ff}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}
main{max-width:1040px;margin:0 auto;padding:16px}h1{font-size:1.5rem;margin:.5rem 0}h2{font-size:1.1rem;margin:0 0 .6rem}
.banner{background:var(--warn);color:#fff;padding:8px 16px;font-weight:600;text-align:center}
.sim-label{color:var(--warn);font-size:.75rem;font-weight:600;margin:-4px 0 8px}
section{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px;margin:12px 0}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px}.kpi{border:1px solid var(--line);border-radius:10px;padding:10px}.kpi-v{font-size:1.4rem;font-weight:700}.kpi-l{color:var(--muted);font-size:.8rem}
.chart svg{width:100%;height:auto}.scroll{overflow-x:auto}.grid{stroke:var(--line)}.axis{fill:var(--muted);font-size:11px}
.series{stroke-width:2.5}.series.s0{stroke:var(--s0)}.series.s1{stroke:var(--s1);stroke-dasharray:6 4}.legend{font-size:.8rem;color:var(--muted)}.key::before{content:"";display:inline-block;width:12px;height:3px;margin-right:6px;vertical-align:middle}.key.s0::before{background:var(--s0)}.key.s1::before{background:var(--s1)}
.heat{fill:var(--heat)}table{border-collapse:collapse;width:100%;font-size:.9rem}th,td{border-bottom:1px solid var(--line);padding:6px 8px;text-align:left;vertical-align:top}
.bars{display:grid;gap:6px}.bar-row{display:grid;grid-template-columns:minmax(80px,30%) 1fr auto;gap:8px;align-items:center}.bar-track{display:grid;gap:2px}.bar{display:block;height:8px;border-radius:4px}.bar.s0{background:var(--s0)}.bar.s1{background:var(--s1)}.bar-label,.bar-value{font-size:.85rem}.bar-value{color:var(--muted)}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px}.card{border:1px solid var(--line);border-radius:10px;padding:10px}.card-h{font-weight:600}.ok{color:var(--ok)}.warn{color:var(--warn)}.muted{color:var(--muted)}
.hall{min-height:120px}q{color:var(--muted)}
.chat{display:grid;gap:8px}.msg{border:1px solid var(--line);border-radius:10px;padding:8px 10px;max-width:85%}.msg-p{margin-left:auto;border-color:var(--s0)}
</style></head>
<body><div class="banner">${esc(L.banner)}</div><main><h1>${esc(opts.title || 'Rehearsal Hall')}</h1>
${parts.join('\n')}
</main>${opts.threeSource ? `<script type="text/plain" id="three-src">${opts.threeSource.replace(/<\/(script)/gi, '<\\/$1')}</script>` : ''}${opts.hallScript ? `<script>${opts.hallScript.replace(/<\/(script)/gi, '<\\/$1')}</script>` : ''}</body></html>
`;
}

/**
 * The replay script and three.js source to inline (three is optional: without it the report uses the 2D hall).
 * @returns {{hallScript: string, threeSource: string|null}}
 */
function hallAssets() {
  const hallScript = fs.readFileSync(path.join(__dirname, '..', 'templates', 'proposal', 'simulation', 'hall3d.js'), 'utf8');
  let threeSource = null;
  // three's `exports` map hides build/ subpaths, so resolve the main entry (build/three.cjs) and read its sibling
  try { threeSource = fs.readFileSync(path.join(path.dirname(require.resolve('three')), 'three.module.min.js'), 'utf8'); } catch (_) { threeSource = null; }
  return { hallScript, threeSource };
}

function renderSummaryMd(agg, opts = {}) {
  const L = LABEL[opts.lang] || LABEL.en;
  const name = opts.personaName || ((id) => `#${id}`);
  const s = agg.summary;
  const lines = [`# ${opts.title || 'Rehearsal Hall'}`, '', `> ${L.banner}`, '', `## ${L.summary}`, '',
    `- ${L.retention}: ${s.avgRetention}% (${L.weighted}: ${s.avgWeightedRetention}%), end ${s.endRetention}%`,
    `- ${L.wouldAct}: ${s.wouldActPct}% · tune-outs: ${s.tuneOuts} · ${L.unanswered}: ${s.unansweredObjections}`,
    `- ${L.recall}: ${s.keyMessageRecall === null ? '—' : `${s.keyMessageRecall}%`} · ${L.time}: ${fmtT(s.durationSec)}`,
    ...(s.visualCoverage ? [`- ${groundingText(s, L)}`, `- ${L.estimate}`] : []), '', `## ${L.improvements}`, ''];
  agg.improvements.slice(0, 5).forEach((i, k) => lines.push(`${k + 1}. ${L.slide} ${i.slide} (${i.impact}) — ${[...i.reasons, ...i.suggestions.map((x) => `→ ${x}`)].join('; ') || '—'}`));
  lines.push('', `## ${L.tuneouts}`, '', `| ${L.persona} | ${L.slide} | ${L.time} | ${L.reason} |`, '|---|---|---|---|');
  agg.tuneOuts.forEach((t) => lines.push(`| ${name(t.personaId)}${t.primary ? ' ★' : ''} | ${t.slide} | ${fmtT(t.t)} | ${t.reason} |`));
  if (!agg.tuneOuts.length) lines.push(`| — | — | — | ${L.none} |`);
  lines.push('', `## ${L.evaluations}`, '');
  agg.evaluations.forEach((e) => lines.push(`- **${name(e.personaId)}**${e.primary ? ' ★' : ''}: ${e.wouldAct ? L.wouldAct : L.wouldNot} — “${e.quote}”`));
  if (opts.panel) {
    const p = opts.panel;
    lines.push('', `## ${L.panel}`, '', `- ${(p.transcript && p.transcript.messages || []).length} messages · ${(p.unanswered || []).length} unanswered · ${(p.beforeAfter || []).filter((b) => b.changed).length} ${L.changed}`);
    for (const u of p.unanswered || []) lines.push(`- ${L.unansweredQ}: ${name(Number(u.from))} — ${u.text}`);
  }
  if (agg.deltas) { lines.push('', `## ${L.deltas}`, ''); for (const [k, v] of Object.entries(agg.deltas)) lines.push(`- ${k}: ${v === null ? '—' : v > 0 ? `+${v}` : v}`); }
  return lines.join('\n') + '\n';
}

/**
 * Write report.html, summary.md and data.json into a new run folder (never overwrites).
 * @returns {{dir: string, files: string[]}}
 */
const SLIDE_IMAGE_MAX = 400 * 1024;
/**
 * Slide images as data URIs keyed by slide number (BUG-036 — the hall screen shows the real slide). Missing or
 * oversized files are skipped; the replay then shows the slide heading.
 * @param {string[]} paths image per slide, in order (slide 1 first)
 */
function embedSlideImages(paths = []) {
  const out = {};
  paths.forEach((p, i) => {
    try {
      const st = fs.statSync(p);
      if (!st.isFile() || st.size > SLIDE_IMAGE_MAX) return;
      const mime = /\.png$/i.test(p) ? 'image/png' : 'image/jpeg';
      out[i + 1] = `data:${mime};base64,${fs.readFileSync(p).toString('base64')}`;
    } catch (_) { /* missing image → heading fallback */ }
  });
  return out;
}

function writeRun(simulationDir, { agg, timeline, listeners, hall, meta = {}, assets = hallAssets(), slideImages = [], panel = null }) {
  fs.mkdirSync(simulationDir, { recursive: true });
  const used = fs.readdirSync(simulationDir).map((d) => (d.match(/^run-(\d+)$/) || [])[1]).filter(Boolean).map(Number);
  const dir = path.join(simulationDir, `run-${(used.length ? Math.max(...used) : 0) + 1}`);
  fs.mkdirSync(dir);
  const names = meta.names || {};
  const personaName = meta.personaName || ((id) => names[id] || `#${id}`);
  const hallData = { timeline: { segments: timeline.segments, slides: timeline.slides }, listeners: listeners.map((l) => ({ personaId: l.personaId, states: l.states, tuneOut: l.tuneOut, regainedAt: l.regainedAt })), hall, names, slideImages: embedSlideImages(slideImages) };
  const files = {
    'report.html': renderReport(agg, { ...meta, personaName, hallScript: assets.hallScript, threeSource: assets.threeSource, hallData, panel }),
    'summary.md': renderSummaryMd(agg, { ...meta, personaName, panel }),
    'data.json': JSON.stringify({ meta: { ...meta, generatedAt: new Date().toISOString(), label: 'AI simulation — not real audience data' }, timeline, listeners, hall, aggregate: agg, ...(panel ? { panel } : {}) }, null, 2) + '\n',
  };
  for (const [f, body] of Object.entries(files)) fs.writeFileSync(path.join(dir, f), body, { flag: 'wx' });
  return { dir, files: Object.keys(files).map((f) => path.join(dir, f)) };
}

module.exports = { renderReport, renderSummaryMd, writeRun, hallAssets, embedSlideImages, lineChart, barChart };
