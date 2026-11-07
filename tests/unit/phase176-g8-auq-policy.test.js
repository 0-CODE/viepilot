'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const hook = require('../../lib/hooks/auq-check-hook.cjs');

const ROOT = path.join(__dirname, '../..');
const HOOK = path.join(ROOT, 'lib/hooks/auq-check-hook.cjs');
const user = (text) => ({ type: 'user', message: { role: 'user', content: text } });
const toolResult = () => ({ type: 'user', message: { role: 'user', content: [{ type: 'tool_result', tool_use_id: 'x', content: 'ok' }] } });
const say = (text) => ({ type: 'assistant', message: { role: 'assistant', content: [{ type: 'text', text }] } });
const tool = (name) => ({ type: 'assistant', message: { role: 'assistant', content: [{ type: 'tool_use', id: 't', name, input: {} }] } });

describe('BUG-035 G8 — AUQ rule in every skill', () => {
  test('policy sync --check passes and every SKILL.md carries the asking rule', () => {
    execFileSync('node', ['bin/vp-tools.cjs', 'policy', 'sync', '--check'], { cwd: ROOT });
    const skills = fs.readdirSync(path.join(ROOT, 'skills')).map((d) => path.join(ROOT, 'skills', d, 'SKILL.md')).filter((f) => fs.existsSync(f));
    expect(skills.length).toBeGreaterThanOrEqual(20);
    for (const f of skills) expect(fs.readFileSync(f, 'utf8')).toMatch(/\*\*Asking the user:\*\*[^\n]*AskUserQuestion[^\n]*Never end a turn with a question in prose/);
  });
  test('rule source and proposal closing AUQ exist', () => {
    expect(fs.readFileSync(path.join(ROOT, 'templates/auq-policy.md'), 'utf8')).toMatch(/every question to the user goes through AskUserQuestion/);
    expect(fs.readFileSync(path.join(ROOT, 'workflows/proposal.md'), 'utf8')).toMatch(/\*\*Closing \(BUG-035 G8\):\*\*[\s\S]*AskUserQuestion/);
  });
});

describe('BUG-035 G8 — Stop hook transcript check', () => {
  test('prose question at the end of the turn without AUQ is a violation', () => {
    const r = hook.checkTranscript([user('gom đi'), tool('Bash'), toolResult(), say('Xong.\n\nBạn có muốn mình gom các lỗi này thành request không?')]);
    expect(r.violation).toBe(true);
    expect(r.question).toMatch(/không\?$/);
  });
  test('AUQ in the same turn, statements, and questions inside code are fine', () => {
    expect(hook.checkTranscript([user('x'), tool('AskUserQuestion'), toolResult(), say('Bạn chọn gì?')]).violation).toBe(false);
    expect(hook.checkTranscript([user('x'), say('Done. Phase 176 ready.')]).violation).toBe(false);
    expect(hook.checkTranscript([user('x'), say('Example:\n```\nwhy?\n```\nDone.')]).violation).toBe(false);
  });
  test('an AUQ from an earlier turn does not count', () => {
    expect(hook.checkTranscript([user('a'), tool('AskUserQuestion'), toolResult(), say('ok'), user('b'), say('Tiếp không?')]).violation).toBe(true);
  });
  test('CLI: warn → systemMessage, block → decision once, silent otherwise', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vp176-g8-'));
    const t = path.join(dir, 't.jsonl');
    fs.writeFileSync(t, [user('x'), say('Làm tiếp chứ?')].map((e) => JSON.stringify(e)).join('\n'));
    const run = (args, payload) => execFileSync('node', [HOOK, ...args], { input: JSON.stringify(payload) }).toString();
    expect(JSON.parse(run([], { transcript_path: t })).systemMessage).toMatch(/AskUserQuestion/);
    expect(JSON.parse(run(['block'], { transcript_path: t })).decision).toBe('block');
    expect(JSON.parse(run(['block'], { transcript_path: t, stop_hook_active: true })).systemMessage).toBeTruthy();
    fs.writeFileSync(t, JSON.stringify(say('Done.')));
    expect(run([], { transcript_path: t })).toBe('');
    fs.rmSync(dir, { recursive: true, force: true });
  });
});

describe('BUG-035 G8 — hooks install --auq-check (temp HOME)', () => {
  let home;
  beforeEach(() => { home = fs.mkdtempSync(path.join(os.tmpdir(), 'vp176-home-')); fs.mkdirSync(path.join(home, '.claude'), { recursive: true }); });
  afterEach(() => fs.rmSync(home, { recursive: true, force: true }));
  const cli = (...a) => execFileSync('node', [path.join(ROOT, 'bin/vp-tools.cjs'), 'hooks', 'install', ...a], { env: { ...process.env, HOME: home, USERPROFILE: home }, cwd: ROOT }).toString();
  const settings = () => JSON.parse(fs.readFileSync(path.join(home, '.claude', 'settings.json'), 'utf8'));

  test('dry run writes nothing; --yes installs once; switching mode replaces the entry', () => {
    expect(cli('--auq-check', '--dry-run')).toMatch(/Dry run/);
    expect(fs.existsSync(path.join(home, '.claude', 'settings.json'))).toBe(false);
    cli('--auq-check', '--yes');
    cli('--auq-check', '--yes');
    let stop = settings().hooks.Stop.flatMap((g) => g.hooks.map((h) => h.command));
    expect(stop.filter((c) => c.includes('auq-check-hook.cjs'))).toHaveLength(1);
    cli('--auq-check', 'block', '--yes');
    stop = settings().hooks.Stop.flatMap((g) => g.hooks.map((h) => h.command));
    expect(stop.filter((c) => c.includes('auq-check-hook.cjs'))).toEqual([expect.stringMatching(/auq-check-hook\.cjs block$/)]);
  });
});
