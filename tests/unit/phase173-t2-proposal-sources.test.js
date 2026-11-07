'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const src = require('../../lib/proposal-sources.cjs');

function project(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-src-'));
  for (const [rel, body] of Object.entries(files)) {
    const f = path.join(root, rel);
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, body);
  }
  return root;
}

describe('Phase 173.2 — classification by path', () => {
  test.each([
    ['.env', 'sensitive'], ['config/.env.production', 'sensitive'], ['certs/server.pem', 'sensitive'], ['.viepilot/.credentials/x.json', 'sensitive'],
    ['CHANGELOG.md', 'process-log'], ['.viepilot/TRACKER.md', 'process-log'], ['.viepilot/phases/1-x/SPEC.md', 'process-log'], ['.viepilot/requests/ENH-1.md', 'process-log'],
    ['.viepilot/ROADMAP.md', 'roadmap-future'], ['.viepilot/ARCHITECTURE.md', 'architecture'], ['docs/brainstorm/session-2026-01-01.md', 'product-value'],
    ['README.md', 'product-value'], ['.viepilot/ui-direction/s1/index.html', 'visual'], ['docs/metrics/q3.csv', 'evidence'], ['src/index.js', null],
  ])('%s → %s', (p, kind) => expect(src.classifyPath(p)).toBe(kind));
});

describe('Phase 173.2 — inventory', () => {
  let root;
  afterEach(() => root && fs.rmSync(root, { recursive: true, force: true }));

  test('never opens a file (sensitive content cannot be read)', () => {
    root = project({ '.env': 'TOKEN=abc', 'README.md': '# app', 'CHANGELOG.md': '## 1.0', 'node_modules/x/README.md': 'skip' });
    const spy = jest.spyOn(fs, 'readFileSync');
    try {
      const inv = src.inventorySources(root);
      expect(spy).not.toHaveBeenCalled();
      expect(inv.map((i) => [i.path, i.kind])).toEqual([['README.md', 'product-value'], ['CHANGELOG.md', 'process-log'], ['.env', 'sensitive']]);
      expect(src.readableSources(inv).map((i) => i.path)).not.toContain('.env');
    } finally { spy.mockRestore(); }
  });

  test('--source adds files, --exclude removes them, earlier decks are never sources', () => {
    root = project({ 'notes/pitch-ideas.txt': 'x', 'docs/brainstorm/session-1.md': 'x', 'docs/proposals/old/versions/v1/x.md': 'x', 'README.md': 'x' });
    const inv = src.inventorySources(root, { include: ['notes/*.txt'], exclude: ['README.md'] });
    const paths = inv.map((i) => i.path);
    expect(paths).toContain('notes/pitch-ideas.txt');
    expect(inv.find((i) => i.path === 'notes/pitch-ideas.txt')).toMatchObject({ kind: 'product-value', userAdded: true });
    expect(paths).not.toContain('README.md');
    expect(paths.some((p) => p.startsWith('docs/proposals'))).toBe(false);
  });
});

describe('Phase 173.2 — Content Map rules', () => {
  test('process-log can never be FIT; TRANSFORM needs wording and a slide', () => {
    const map = src.createContentMap();
    expect(() => src.addItem(map, { text: 'Phase 165 added 4 voice levels (v3.13.0)', source: 'CHANGELOG.md', kind: 'process-log', decision: 'FIT', slide: 3 })).toThrow(/never FIT/);
    expect(() => src.addItem(map, { text: 'x', source: 'CHANGELOG.md', kind: 'process-log', decision: 'TRANSFORM', slide: 3 })).toThrow(/rewritten wording/);
    const id = src.addItem(map, { text: 'Phase 165 added 4 voice levels', source: 'CHANGELOG.md', kind: 'process-log', decision: 'TRANSFORM', slide: 3, transformed: 'You choose how boldly the deck speaks' });
    expect(id).toBe('C1');
  });

  test('sensitive is only SENSITIVE; DROP and BACKSTAGE need a reason', () => {
    const map = src.createContentMap();
    expect(() => src.addItem(map, { text: 'k', source: '.env', kind: 'sensitive', decision: 'DROP', reason: 'x' })).toThrow(/only be marked SENSITIVE/);
    expect(() => src.addItem(map, { text: 'old detail', source: 'README.md', kind: 'product-value', decision: 'DROP' })).toThrow(/needs a reason/);
    src.addItem(map, { text: 'old detail', source: 'README.md', kind: 'product-value', decision: 'DROP', reason: 'not relevant to finance audience' });
    expect(src.summarizeContentMap(map).count.DROP).toBe(1);
  });

  test('manifest validation: unmapped content, wrong slide, non-slide decisions, gaps', () => {
    const map = src.createContentMap();
    const a = src.addItem(map, { text: 'Onboarding takes 3 days', source: 'docs/metrics/q3.csv', kind: 'evidence', decision: 'FIT', slide: 2 });
    const b = src.addItem(map, { text: 'TODO list', source: 'README.md', kind: 'product-value', decision: 'BACKSTAGE', reason: 'dev note' });
    const r = src.validateManifestAgainstMap({ slides: [
      { index: 1, heading: 'Cover' },
      { index: 2, heading: 'Problem', bullets: ['3 days'], refs: [a] },
      { index: 3, heading: 'Plan', bullets: ['x'] },
      { index: 4, heading: 'Risks', bullets: ['y'], refs: [b, a] },
      { index: 5, heading: 'Proof' },
    ] }, map);
    expect(r.ok).toBe(false);
    expect(r.problems).toEqual([
      'slide 3: content without Content Map references',
      `slide 4: ${b} is BACKSTAGE and cannot appear on a slide`,
      `slide 4: ${a} is assigned to slide 2`,
    ]);
    expect(r.gaps).toEqual([5]);
  });
});
