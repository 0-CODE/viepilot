'use strict';
/**
 * ViePilot native todo mirror (ENH-118).
 * Derives a todo list from PHASE-STATE + tasks/*.md, emits payloads for host
 * todo tools, maintains the fallback `## Todo` checklist, and detects drift.
 *
 * Dependencies: tasks are chained sequentially (N.M blocked by the previous
 * item in order). The ROADMAP "Parallel" column is intentionally not consulted.
 */
const fs = require('fs');
const path = require('path');

const PREFIX = '[vp]';
const STEP_DEFS = [
  { slug: 'state-start', label: 'state in_progress', active: 'Marking task in_progress' },
  { slug: 'implement', label: 'implement', active: 'Implementing' },
  { slug: 'verify', label: 'verify', active: 'Verifying' },
  { slug: 'state-done', label: 'state done + push', active: 'Recording state and pushing' },
];

function findPhaseDir(projectRoot, phase) {
  const phasesDir = path.join(projectRoot, '.viepilot', 'phases');
  if (!fs.existsSync(phasesDir)) return null;
  const n = String(parseInt(phase, 10));
  const names = fs.readdirSync(phasesDir).filter((d) => {
    if (!fs.statSync(path.join(phasesDir, d)).isDirectory()) return false;
    return d.startsWith(`${n}-`) || d.startsWith(`${n.padStart(2, '0')}-`) && n.length < 2;
  });
  return names.length ? path.join(phasesDir, names.sort()[0]) : null;
}

function normStatus(raw) {
  const s = String(raw || '').toLowerCase().replace(/[^a-z_ ]/g, ' ').trim().split(/\s+/)[0] || '';
  if (s === 'done' || s === 'complete' || s === 'completed' || s === 'skipped') return 'completed';
  if (s === 'in_progress' || s === 'in' || s === 'active') return 'in_progress';
  return 'pending';
}

function splitRow(line) {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
}

function parseTaskTable(text) {
  const lines = text.split('\n');
  const start = lines.findIndex((l) => /^##\s+Tasks\s*$/.test(l));
  if (start < 0) return [];
  const rows = [];
  let header = null;
  for (let i = start + 1; i < lines.length; i++) {
    const l = lines[i];
    if (/^##\s/.test(l)) break;
    if (!l.trim().startsWith('|')) continue;
    const cells = splitRow(l);
    if (!header) {
      header = cells.map((c) => c.toLowerCase());
      continue;
    }
    if (cells.every((c) => /^:?-+:?$/.test(c))) continue;
    const ti = header.indexOf('task');
    const si = header.indexOf('status');
    if (ti < 0 || si < 0) return [];
    rows.push({ id: cells[ti], rawStatus: cells[si] });
  }
  return rows;
}

function taskTitle(file, id) {
  if (!file || !fs.existsSync(file)) return `Task ${id}`;
  const m = fs.readFileSync(file, 'utf8').match(/^#\s+(.+)$/m);
  if (!m) return `Task ${id}`;
  return m[1].trim().replace(/^Task\s+[\w.]+\s*[—–-]\s*(?:[A-Za-z]+-\d+[a-z]?:\s*)?/, '').trim() || `Task ${id}`;
}

function readPhase(projectRoot, phase) {
  const dir = findPhaseDir(projectRoot, phase);
  if (!dir) return { dir: null, tasks: [] };
  const statePath = path.join(dir, 'PHASE-STATE.md');
  const rows = fs.existsSync(statePath) ? parseTaskTable(fs.readFileSync(statePath, 'utf8')) : [];
  const tdir = path.join(dir, 'tasks');
  const files = fs.existsSync(tdir)
    ? fs.readdirSync(tdir).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3))
    : [];
  const ids = [];
  rows.forEach((r) => ids.push(r.id));
  files.forEach((f) => { if (!ids.includes(f)) ids.push(f); });
  const tasks = ids.map((id) => {
    const row = rows.find((r) => r.id === id);
    const fp = files.includes(id) ? path.join(tdir, `${id}.md`) : null;
    return {
      id,
      title: taskTitle(fp, id),
      status: row ? normStatus(row.rawStatus) : 'pending',
      hasRow: !!row,
      file: fp,
    };
  });
  return { dir, tasks };
}

function buildTodoItems(phaseData, opts = {}) {
  const steps = opts.steps !== false;
  const items = [];
  let prevParent = null;
  for (const t of phaseData.tasks) {
    const parentBlock = prevParent ? [prevParent] : [];
    items.push({
      key: t.id,
      subject: `${PREFIX} ${t.id} — ${t.title}`,
      activeForm: `Working on ${t.id} — ${t.title}`,
      status: t.status,
      blockedBy: parentBlock,
    });
    if (steps && t.status === 'in_progress') {
      // Steps never reference their own parent (would be circular): the first
      // step shares the parent's blocker, later steps chain on the prior step.
      let prevStep = null;
      STEP_DEFS.forEach((s, i) => {
        const key = `${t.id}#${s.slug}`;
        items.push({
          key,
          parentKey: t.id,
          subject: `${PREFIX} ${t.id} · ${s.label}`,
          activeForm: `${s.active} ${t.id}`,
          status: i === 0 ? 'completed' : 'pending',
          blockedBy: prevStep ? [prevStep] : parentBlock.slice(),
        });
        prevStep = key;
      });
    }
    prevParent = t.id;
  }
  return items;
}

function singleInProgress(items) {
  let seen = false;
  const out = items.map((it) => {
    if (it.status === 'in_progress') {
      if (seen) return { ...it, status: 'pending' };
      seen = true;
    }
    return { ...it };
  });
  if (!seen) {
    const i = out.findIndex((it) => it.status === 'pending');
    if (i >= 0) out[i].status = 'in_progress';
  }
  return out;
}

function renderChecklist(items) {
  const mark = { completed: 'x', in_progress: '~', pending: ' ' };
  return items.filter((it) => !it.key.includes('#'))
    .map((it) => `- [${mark[it.status]}] ${it.subject}`).join('\n');
}

function toPayload(items, adapterTodo, opts = {}) {
  const todo = adapterTodo || {};
  const tool = (todo.tools || [])[0];
  if (!todo.verified || !tool) {
    return {
      tool: null,
      verified: false,
      notice: 'No verified native todo tool for this adapter; maintain the `## Todo` checklist in PHASE-STATE.md (vp-tools todo sync).',
      checklist: renderChecklist(items),
    };
  }
  if (tool === 'TaskCreate') {
    if (opts.legacy) {
      return {
        tool: 'TodoWrite',
        todos: items.map((it) => ({ id: it.key, content: it.subject, status: it.status, activeForm: it.activeForm })),
      };
    }
    return {
      tool: 'TaskCreate',
      note: 'Create in order; replace addBlockedBy keys with returned task ids; then TaskUpdate each non-pending status.',
      tasks: items.map((it) => ({
        key: it.key,
        subject: it.subject,
        activeForm: it.activeForm,
        status: it.status,
        addBlockedBy: it.blockedBy,
      })),
    };
  }
  const list = todo.single_in_progress ? singleInProgress(items) : items;
  if (tool === 'write_todos') {
    return { tool, todos: list.map((it) => ({ description: it.subject, status: it.status })) };
  }
  if (tool === 'update_plan') {
    return { tool, plan: list.map((it) => ({ step: it.subject, status: it.status })) };
  }
  return { tool, todos: list.map((it) => ({ content: it.subject, status: it.status })) };
}

const SECTION_RE = /\n*^## Todo[ \t]*\n[\s\S]*?(?=^## |(?![\s\S]))/m;

function writeChecklist(statePath, items) {
  let text = fs.readFileSync(statePath, 'utf8');
  text = text.replace(SECTION_RE, '\n').replace(/\s+$/, '');
  text += `\n\n## Todo\n${renderChecklist(items)}\n`;
  fs.writeFileSync(statePath, text);
  return text;
}

function parseChecklist(text) {
  const m = text.match(/^## Todo[ \t]*\n([\s\S]*?)(?=^## |(?![\s\S]))/m);
  if (!m) return null;
  const map = {};
  for (const l of m[1].split('\n')) {
    const x = l.match(/^- \[([ x~])\]\s+\[vp\]\s+(\S+)\s+—/);
    if (x) map[x[2]] = x[1] === 'x' ? 'completed' : x[1] === '~' ? 'in_progress' : 'pending';
  }
  return map;
}

function checkPhase(projectRoot, phase, opts = {}) {
  const data = readPhase(projectRoot, phase);
  const issues = [];
  if (!data.dir) return { ok: false, issues: [{ code: 'phase-not-found', message: `Phase ${phase} not found` }] };
  for (const t of data.tasks) {
    if (t.file && !t.hasRow) issues.push({ code: 'task-file-without-row', task: t.id });
    if (!t.file && t.hasRow) issues.push({ code: 'row-without-task-file', task: t.id });
  }
  const statePath = path.join(data.dir, 'PHASE-STATE.md');
  const text = fs.existsSync(statePath) ? fs.readFileSync(statePath, 'utf8') : '';
  const cl = parseChecklist(text);
  if (!cl) {
    issues.push({ code: 'checklist-missing' });
  } else {
    for (const t of data.tasks) {
      if (cl[t.id] !== t.status) issues.push({ code: 'checklist-drift', task: t.id, expected: t.status, actual: cl[t.id] || null });
    }
  }
  if (data.tasks.filter((t) => t.status === 'in_progress').length > 1) issues.push({ code: 'multiple-in-progress' });
  if (opts.phaseComplete) {
    for (const t of data.tasks) {
      if (t.status !== 'completed') issues.push({ code: 'incomplete-at-phase-complete', task: t.id });
    }
  }
  return { ok: issues.length === 0, issues };
}

module.exports = {
  findPhaseDir, readPhase, buildTodoItems, toPayload, renderChecklist, writeChecklist, checkPhase, parseChecklist,
};
