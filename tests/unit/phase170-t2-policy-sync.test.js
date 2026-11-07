'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..', '..');
const sync = require('../../lib/policy-sync.cjs');
const { renderCombinedPolicyBlock } = require('../../lib/tool-policy.cjs');

function tempProject() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-policy-'));
  for (const rel of ['skills/vp-auto/SKILL.md', 'skills/vp-proposal/SKILL.md', 'agents/claude-code/vp-quality-gate.md',
    'agents/claude-code/vp-task-executor.md', 'workflows/evolve.md']) {
    const dest = path.join(dir, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    // strip any existing block so the temp copy starts clean
    const src = fs.readFileSync(path.join(ROOT, rel), 'utf8')
      .replace(/\n*<!-- tool-policy:start -->[\s\S]*?<!-- tool-policy:end -->/, '')
      .replace(/\nTool policy: follow `<tool_policy>` in the invoking skill[^\n]*/, '');
    fs.writeFileSync(dest, src);
  }
  return dir;
}

describe('Phase 170.2 — policy sync', () => {
  let dir;
  beforeEach(() => { dir = tempProject(); });
  afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

  test('check reports drift before sync and none after; second sync is a no-op', () => {
    expect(sync.syncAll(dir, true).length).toBeGreaterThan(0);
    const first = sync.syncAll(dir, false);
    expect(first.length).toBeGreaterThanOrEqual(5);
    expect(sync.syncAll(dir, true)).toEqual([]);
    const snapshot = fs.readFileSync(path.join(dir, 'skills/vp-auto/SKILL.md'), 'utf8');
    expect(sync.syncAll(dir, false)).toEqual([]);
    expect(fs.readFileSync(path.join(dir, 'skills/vp-auto/SKILL.md'), 'utf8')).toBe(snapshot);
  });

  test('a hand-edited block counts as drift', () => {
    sync.syncAll(dir, false);
    const f = path.join(dir, 'skills/vp-auto/SKILL.md');
    fs.writeFileSync(f, fs.readFileSync(f, 'utf8').replace('Read a file', 'Read a fil'));
    expect(sync.syncAll(dir, true)).toContain(f);
  });

  test('skill block is the compact combined table (short enough to load every invocation)', () => {
    const block = renderCombinedPolicyBlock();
    expect(block.split('\n').length).toBeLessThanOrEqual(30);
    for (const name of ['Claude Code', 'Cursor', 'Codex', 'Copilot', 'Antigravity', 'TodoWrite', 'Task (Agent tool)']) {
      expect(block).toContain(name);
    }
  });

  test('read-only agents get the commands-only note', () => {
    sync.syncAll(dir, false);
    const txt = fs.readFileSync(path.join(dir, 'agents/claude-code/vp-quality-gate.md'), 'utf8');
    expect(txt).toMatch(/Bash is for running commands only/);
  });
});

describe('Phase 170.2 — repository is in sync', () => {
  test('`vp-tools policy sync --check` exits 0', () => {
    const r = spawnSync(process.execPath, [path.join(ROOT, 'bin/vp-tools.cjs'), 'policy', 'sync', '--check'], { cwd: ROOT, encoding: 'utf8' });
    expect(r.status).toBe(0);
  });

  test('every skill and agent has exactly one policy block; every workflow references it', () => {
    const files = [
      ...fs.readdirSync(path.join(ROOT, 'skills')).map((d) => path.join(ROOT, 'skills', d, 'SKILL.md')).filter(fs.existsSync),
      ...fs.readdirSync(path.join(ROOT, 'agents/claude-code')).filter((f) => f.endsWith('.md')).map((f) => path.join(ROOT, 'agents/claude-code', f)),
      ...fs.readdirSync(path.join(ROOT, 'agents')).filter((f) => f.endsWith('.md')).map((f) => path.join(ROOT, 'agents', f)),
    ];
    for (const f of files) {
      expect((fs.readFileSync(f, 'utf8').match(/<!-- tool-policy:start -->/g) || []).length).toBe(1);
    }
    for (const w of fs.readdirSync(path.join(ROOT, 'workflows')).filter((f) => f.endsWith('.md'))) {
      expect(fs.readFileSync(path.join(ROOT, 'workflows', w), 'utf8')).toContain('Tool policy: follow `<tool_policy>`');
    }
  });

  test('autonomous.md appends DISPATCH_RULES to subagent prompts', () => {
    const txt = fs.readFileSync(path.join(ROOT, 'workflows/autonomous.md'), 'utf8');
    expect((txt.match(/\{DISPATCH_RULES\}/g) || []).length).toBeGreaterThanOrEqual(3);
    expect(txt).toMatch(/Tool policy \(ENH-125\): Read to read files, Grep\/Glob to search, Edit/);
  });
});
