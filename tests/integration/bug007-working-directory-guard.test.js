/**
 * BUG-007: working directory guard — install paths must never be write targets.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = path.resolve(__dirname, '..', '..');
const { validateWriteTarget, isPathInsideOrEqual } = require('../../lib/project-write-guard.cjs');

function readWorkflow(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

describe('BUG-007 validateWriteTarget (integration)', () => {
  const fakeHome = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-bug007-home-'));

  afterAll(() => {
    fs.rmSync(fakeHome, { recursive: true, force: true });
  });

  test('relative path under project root is allowed', () => {
    const project = path.join(fakeHome, 'my-project');
    fs.mkdirSync(project, { recursive: true });
    const r = validateWriteTarget(project, 'src/foo.ts', { homedir: fakeHome });
    expect(r).toEqual({ ok: true, code: 'ok' });
  });

  test('absolute path under .cursor/viepilot is blocked (install_path)', () => {
    const project = path.join(fakeHome, 'my-project');
    fs.mkdirSync(project, { recursive: true });
    const installFile = path.join(fakeHome, '.cursor', 'viepilot', 'workflows', 'autonomous.md');
    const r = validateWriteTarget(project, installFile, { homedir: fakeHome });
    expect(r.ok).toBe(false);
    expect(r.code).toBe('install_path');
    expect(r.message).toMatch(/READ-ONLY/);
  });

  test('absolute path under .claude/viepilot is blocked (install_path)', () => {
    const project = path.join(fakeHome, 'my-project');
    fs.mkdirSync(project, { recursive: true });
    const installFile = path.join(fakeHome, '.claude', 'viepilot', 'skills', 'vp-auto', 'SKILL.md');
    const r = validateWriteTarget(project, installFile, { homedir: fakeHome });
    expect(r.ok).toBe(false);
    expect(r.code).toBe('install_path');
  });

  test('absolute path under .codex/viepilot is blocked (install_path)', () => {
    const project = path.join(fakeHome, 'my-project');
    fs.mkdirSync(project, { recursive: true });
    const installFile = path.join(fakeHome, '.codex', 'viepilot', 'skills', 'vp-auto', 'SKILL.md');
    const r = validateWriteTarget(project, installFile, { homedir: fakeHome });
    expect(r.ok).toBe(false);
    expect(r.code).toBe('install_path');
  });

  test('path outside project and not install root is outside_project', () => {
    const project = path.join(fakeHome, 'my-project');
    fs.mkdirSync(project, { recursive: true });
    const outside = path.join(fakeHome, 'other-repo', 'file.txt');
    const r = validateWriteTarget(project, outside, { homedir: fakeHome });
    expect(r.ok).toBe(false);
    expect(r.code).toBe('outside_project');
  });

  test('/tmp target is outside_project when project is under fakeHome', () => {
    const project = path.join(fakeHome, 'my-project');
    fs.mkdirSync(project, { recursive: true });
    const r = validateWriteTarget(project, path.join(os.tmpdir(), 'nope.txt'), { homedir: fakeHome });
    expect(r.ok).toBe(false);
    expect(r.code).toBe('outside_project');
  });
});

describe('BUG-007 workflow + template contracts', () => {
  test('autonomous.md defines Working Directory Guard and control point', () => {
    const md = readWorkflow('workflows/autonomous.md');
    expect(md).toMatch(/Working Directory Guard/);
    expect(md).toMatch(/\{project_cwd\}/);
    expect(md).toMatch(/READ-ONLY/);
    expect(md).toMatch(/control_point|control point/i);
    expect(md).toMatch(/\.claude\/viepilot|~\/\.claude\/viepilot/);
    expect(md).toMatch(/\.codex\/viepilot|~\/\.codex\/viepilot/);
    expect(md).toMatch(/\.cursor\/viepilot|~\/\.cursor\/viepilot/);
  });

  test('AI-GUIDE template warns install paths are READ-ONLY', () => {
    const md = readWorkflow('templates/project/AI-GUIDE.md');
    expect(md).toMatch(/READ-ONLY/);
    expect(md).toMatch(/install path|viepilot\//i);
  });
});

describe('isPathInsideOrEqual', () => {
  test('child directory is inside', () => {
    expect(isPathInsideOrEqual('/a/b', '/a/b/c')).toBe(true);
  });

  test('parent path is not inside child', () => {
    expect(isPathInsideOrEqual('/a/b/c', '/a/b')).toBe(false);
  });
});
