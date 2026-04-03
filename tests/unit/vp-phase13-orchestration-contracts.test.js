const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

function readJson(relPath) {
  return JSON.parse(read(relPath));
}

describe('Phase 13 orchestration contracts (Tier A / Tier B)', () => {
  test('autonomous.md: mandatory task-boundary re-hydrate (Tier A)', () => {
    const md = read('workflows/autonomous.md');
    expect(md).toMatch(/Task-boundary context re-hydrate \(Tier A/);
    expect(md).toMatch(/HANDOFF\.json/);
    expect(md).toMatch(/PHASE-STATE/);
    expect(md).toMatch(/files_to_read/);
  });

  test('crystallize.md: seeds .viepilot/delegates from template (Tier B)', () => {
    const md = read('workflows/crystallize.md');
    expect(md).toMatch(/Delegate envelopes \(Tier B/);
    expect(md).toMatch(/delegates\/done/);
  });

  test('delegate example JSON parses and includes required keys', () => {
    const pending = readJson('templates/project/delegates/examples/pending.example.json');
    for (const k of ['id', 'parent_task', 'charter', 'mode', 'created_at']) {
      expect(pending).toHaveProperty(k);
    }
    const done = readJson('templates/project/delegates/examples/done.example.json');
    for (const k of ['id', 'parent_task', 'charter', 'mode', 'created_at', 'status', 'summary', 'evidence_paths', 'errors']) {
      expect(done).toHaveProperty(k);
    }
    expect(Array.isArray(done.evidence_paths)).toBe(true);
    expect(Array.isArray(done.errors)).toBe(true);
  });

  test('delegates README: merge-from-done-only contract', () => {
    const md = read('templates/project/delegates/README.md');
    expect(md).toMatch(/delegates\/done/);
    expect(md).toMatch(/pending/);
    expect(md).toMatch(/Source of truth for merge/);
  });

  test('AI-GUIDE template: Delegate handoff (Tier B) subsection', () => {
    const md = read('templates/project/AI-GUIDE.md');
    expect(md).toMatch(/Delegate handoff \(Tier B\)/);
    expect(md).toMatch(/delegates\/done/);
  });

  test('autonomous-mode.md: Tier B section cross-links template', () => {
    const md = read('docs/user/features/autonomous-mode.md');
    expect(md).toMatch(/Delegate handoff \(Tier B/);
    expect(md).toMatch(/templates\/project\/delegates\/README/);
  });
});
