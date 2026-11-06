'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..', '..');
const VP = path.join(ROOT, 'bin', 'vp-tools.cjs');
const mirror = require(path.join(ROOT, 'lib', 'todo-mirror.cjs'));
const ac = require(path.join(ROOT, 'lib', 'adapter-context.cjs'));

const made = [];
function tmp(prefix) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  made.push(d);
  return d;
}
afterAll(() => made.forEach((d) => fs.rmSync(d, { recursive: true, force: true })));

function fixture({ dirName = '900-fx', rows, files, todo }) {
  const root = tmp('vp168-fx-');
  const pd = path.join(root, '.viepilot', 'phases', dirName);
  fs.mkdirSync(path.join(pd, 'tasks'), { recursive: true });
  const table = ['| Task | Status |', '|---|---|']
    .concat(rows.map(([id, st]) => `| ${id} | ${st} |`)).join('\n');
  fs.writeFileSync(path.join(pd, 'PHASE-STATE.md'),
    `# Phase State\n\n## Tasks\n${table}\n\n## Notes\nkeep me\n${todo ? `\n## Todo\n${todo}\n` : ''}`);
  files.forEach((id) => fs.writeFileSync(path.join(pd, 'tasks', `${id}.md`), `# Task ${id} — Title ${id}\n`));
  return { root, pd, state: path.join(pd, 'PHASE-STATE.md') };
}

function vp(cwd, args, home) {
  return spawnSync('node', [VP, ...args], {
    cwd, encoding: 'utf8', input: '',
    env: { ...process.env, HOME: home || tmp('vp168-home-'), USERPROFILE: home || '' },
  });
}

const std = () => fixture({
  rows: [['900.1', 'done'], ['900.2', 'in_progress'], ['900.3', 'pending']],
  files: ['900.1', '900.2', '900.3'],
});

describe('capability', () => {
  test('identical key set across adapters; verified implies source', () => {
    const ids = ac.listAdapterIds();
    const keys = Object.keys(ac.getTodoCapability(ids[0])).sort();
    ids.forEach((id) => {
      const c = ac.getTodoCapability(id);
      expect(Object.keys(c).sort()).toEqual(keys);
      if (c.verified) expect(String(c.source)).toMatch(/^https?:\/\//);
    });
  });
  test('claude-code tools and legacy', () => {
    const c = ac.getTodoCapability('claude-code');
    expect(c.tools).toContain('TaskCreate');
    expect(c.legacy).toContain('TodoWrite');
  });
  test('antigravity and codex are full-replace', () => {
    expect(ac.getTodoCapability('antigravity').mode).toBe('full-replace');
    expect(ac.getTodoCapability('codex').mode).toBe('full-replace');
  });
  test('back-compat todo_write', () => {
    expect(ac.getAdapterContext('claude-code').tools.todo_write).toBe('TodoWrite');
  });
});

describe('buildTodoItems', () => {
  test('1:1 parents, prefix, sequential blockedBy, no self-block', () => {
    const fx = std();
    const items = mirror.buildTodoItems(mirror.readPhase(fx.root, '900'));
    const parents = items.filter((i) => !i.parentKey);
    expect(parents.map((p) => p.key)).toEqual(['900.1', '900.2', '900.3']);
    parents.forEach((p) => expect(p.subject.startsWith('[vp]')).toBe(true));
    expect(parents[0].blockedBy).toEqual([]);
    expect(parents[1].blockedBy).toEqual(['900.1']);
    expect(parents[2].blockedBy).toEqual(['900.2']);
    items.filter((i) => i.parentKey).forEach((s) => expect(s.blockedBy).not.toContain(s.parentKey));
  });
});

describe('payloads', () => {
  const items = () => mirror.buildTodoItems(mirror.readPhase(std().root, '900'));
  test('claude TaskCreate shape', () => {
    const p = mirror.toPayload(items(), ac.getTodoCapability('claude-code'));
    expect(p.tool).toBe('TaskCreate');
    expect(p.tasks[0]).toHaveProperty('addBlockedBy');
    expect(p.tasks[0]).toHaveProperty('subject');
  });
  test('legacy TodoWrite shape', () => {
    const p = mirror.toPayload(items(), ac.getTodoCapability('claude-code'), { legacy: true });
    expect(p.tool).toBe('TodoWrite');
    expect(p.todos[0]).toHaveProperty('content');
    expect(p.todos[0]).toHaveProperty('activeForm');
  });
  test('write_todos shape', () => {
    const p = mirror.toPayload(items(), ac.getTodoCapability('antigravity'));
    expect(p.tool).toBe('write_todos');
    expect(p.todos[0]).toHaveProperty('description');
  });
  test('update_plan has exactly one in_progress', () => {
    const p = mirror.toPayload(items(), ac.getTodoCapability('codex'));
    expect(p.tool).toBe('update_plan');
    expect(p.plan.filter((s) => s.status === 'in_progress')).toHaveLength(1);
  });
  test('cursor and copilot fall back with notice', () => {
    ['cursor-agent', 'copilot'].forEach((id) => {
      const p = mirror.toPayload(items(), ac.getTodoCapability(id));
      expect(p.tool).toBeNull();
      expect(p.notice).toBeTruthy();
    });
    const fx = std();
    const r = vp(fx.root, ['todo', 'payload', '--phase', '900', '--adapter', 'copilot']);
    expect(r.stderr).toMatch(/No verified native todo tool/);
  });
});

describe('sync and check', () => {
  test('sync idempotent and replaces only ## Todo', () => {
    const fx = std();
    expect(vp(fx.root, ['todo', 'sync', '--phase', '900']).status).toBe(0);
    const a = fs.readFileSync(fx.state, 'utf8');
    expect(vp(fx.root, ['todo', 'sync', '--phase', '900']).status).toBe(0);
    const b = fs.readFileSync(fx.state, 'utf8');
    expect(b).toBe(a);
    expect(a).toContain('## Notes\nkeep me');
    expect(a).toContain('## Tasks');
    expect(a).toMatch(/- \[~\] \[vp\] 900\.2/);
    expect(a.match(/^## Todo/gm)).toHaveLength(1);
  });
  test('consistent phase passes check', () => {
    const fx = std();
    vp(fx.root, ['todo', 'sync', '--phase', '900']);
    expect(vp(fx.root, ['todo', 'check', '--phase', '900']).status).toBe(0);
  });
  test('checklist-missing', () => {
    const fx = std();
    const r = vp(fx.root, ['todo', 'check', '--phase', '900']);
    expect(r.status).toBe(1);
    expect(r.stdout).toContain('checklist-missing');
  });
  test('checklist-drift', () => {
    const fx = std();
    vp(fx.root, ['todo', 'sync', '--phase', '900']);
    fs.writeFileSync(fx.state, fs.readFileSync(fx.state, 'utf8').replace('- [x] [vp] 900.1', '- [ ] [vp] 900.1'));
    const r = vp(fx.root, ['todo', 'check', '--phase', '900']);
    expect(r.status).toBe(1);
    expect(r.stdout).toContain('checklist-drift');
  });
  test('task-file-without-row', () => {
    const fx = fixture({ rows: [['900.1', 'done']], files: ['900.1', '900.2'] });
    vp(fx.root, ['todo', 'sync', '--phase', '900']);
    const r = vp(fx.root, ['todo', 'check', '--phase', '900']);
    expect(r.status).toBe(1);
    expect(r.stdout).toContain('task-file-without-row');
  });
  test('row-without-task-file', () => {
    const fx = fixture({ rows: [['900.1', 'done'], ['900.2', 'pending']], files: ['900.1'] });
    vp(fx.root, ['todo', 'sync', '--phase', '900']);
    const r = vp(fx.root, ['todo', 'check', '--phase', '900']);
    expect(r.status).toBe(1);
    expect(r.stdout).toContain('row-without-task-file');
  });
  test('multiple-in-progress', () => {
    const fx = fixture({ rows: [['900.1', 'in_progress'], ['900.2', 'in_progress']], files: ['900.1', '900.2'] });
    vp(fx.root, ['todo', 'sync', '--phase', '900']);
    const r = vp(fx.root, ['todo', 'check', '--phase', '900']);
    expect(r.status).toBe(1);
    expect(r.stdout).toContain('multiple-in-progress');
  });
  test('incomplete-at-phase-complete', () => {
    const fx = std();
    vp(fx.root, ['todo', 'sync', '--phase', '900']);
    expect(vp(fx.root, ['todo', 'check', '--phase', '900']).status).toBe(0);
    const r = vp(fx.root, ['todo', 'check', '--phase', '900', '--phase-complete']);
    expect(r.status).toBe(1);
    expect(r.stdout).toContain('incomplete-at-phase-complete');
  });
  test('--phase 16 does not match 165-*', () => {
    const fx = fixture({ dirName: '165-other', rows: [['165.1', 'done']], files: ['165.1'] });
    expect(mirror.findPhaseDir(fx.root, '16')).toBeNull();
    expect(mirror.findPhaseDir(fx.root, '165')).toBe(fx.pd);
    expect(vp(fx.root, ['todo', 'check', '--phase', '16']).status).toBe(1);
  });
});

describe('todo enable', () => {
  const settingsOf = (h) => path.join(h, '.claude', 'settings.json');
  test('--dry-run writes nothing', () => {
    const home = tmp('vp168-home-');
    const r = vp(home, ['todo', 'enable', '--dry-run'], home);
    expect(r.status).toBe(0);
    expect(fs.existsSync(settingsOf(home))).toBe(false);
  });
  test('--yes preserves keys, adds env, idempotent', () => {
    const home = tmp('vp168-home-');
    fs.mkdirSync(path.join(home, '.claude'));
    fs.writeFileSync(settingsOf(home), JSON.stringify({ theme: 'dark', env: { FOO: 'bar' } }));
    expect(vp(home, ['todo', 'enable', '--yes'], home).status).toBe(0);
    const j = JSON.parse(fs.readFileSync(settingsOf(home), 'utf8'));
    expect(j.theme).toBe('dark');
    expect(j.env.FOO).toBe('bar');
    expect(j.env.CLAUDE_CODE_ENABLE_TODO_TOOLS).toBe('1');
    const a = fs.readFileSync(settingsOf(home), 'utf8');
    expect(vp(home, ['todo', 'enable', '--yes'], home).status).toBe(0);
    expect(fs.readFileSync(settingsOf(home), 'utf8')).toBe(a);
  });
  test('non-TTY without --yes writes nothing', () => {
    const home = tmp('vp168-home-');
    const r = vp(home, ['todo', 'enable'], home);
    expect(r.status).toBe(0);
    expect(fs.existsSync(settingsOf(home))).toBe(false);
  });
  test('codex prints update_plan hint', () => {
    const home = tmp('vp168-home-');
    const r = vp(home, ['todo', 'enable', '--adapter', 'codex'], home);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain('update_plan');
    expect(fs.existsSync(settingsOf(home))).toBe(false);
  });
});

describe('docs gates', () => {
  const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
  test.each([
    'workflows/evolve.md', 'workflows/autonomous.md', 'workflows/resume-work.md', 'agents/claude-code/tracker-agent.md',
  ])('%s has ENH-118 gate and resolver', (p) => {
    const t = read(p);
    expect(t).toContain('ENH-118');
    expect(t).toMatch(/VP_TOOLS="\$d\/bin\/vp-tools\.cjs"/);
  });
  test('autonomous dispatch-blocking rule', () => {
    const t = read('workflows/autonomous.md');
    expect(t).toContain('MUST NOT dispatch');
    expect(t).toMatch(/todo check/);
  });
});
