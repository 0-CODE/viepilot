'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const store = require('../../lib/proposal-store.cjs');
const session = require('../../lib/proposal-session.cjs');

let root;
const SLUG = 'demo';
beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'vp176-g2-'));
  store.createProposal(root, { slug: SLUG, title: 'Demo', type: 'general' });
  session.startSession(root, SLUG);
});
afterEach(() => fs.rmSync(root, { recursive: true, force: true }));

describe('BUG-035 G2 — session and store agree', () => {
  test('setCurrentVersion updates proposal.json and session.currentVersion', () => {
    const { version } = store.newVersion(root, SLUG, { date: '2026-11-07' });
    store.setCurrentVersion(root, SLUG, version);
    expect(store.readProposal(root, SLUG).currentVersion).toBe(version);
    expect(session.loadSession(root, SLUG).currentVersion).toBe(version);
  });

  test('input and output gates of one step are both kept', () => {
    session.recordGate(root, SLUG, 'rehearsal_hall', 'input', 'run');
    session.recordGate(root, SLUG, 'rehearsal_hall', 'output', 'done');
    const g = session.loadSession(root, SLUG).gates.rehearsal_hall;
    expect(g.byKind.input.result).toBe('run');
    expect(g.byKind.output.result).toBe('done');
    expect(g.result).toBe('done'); // top level = latest, backward compatible
  });

  test('v1 sessions migrate: flat gate entries gain byKind and are written back', () => {
    const file = path.join(root, 'docs', 'proposals', SLUG, 'session.json');
    const old = JSON.parse(fs.readFileSync(file, 'utf8'));
    old.schemaVersion = 1;
    old.gates = { outline_gate: { kind: 'output', result: 'accepted', at: 'x' } };
    fs.writeFileSync(file, JSON.stringify(old));
    const s = session.loadSession(root, SLUG);
    expect(s.schemaVersion).toBe(session.SCHEMA_VERSION);
    expect(s.gates.outline_gate.byKind.output.result).toBe('accepted');
    expect(JSON.parse(fs.readFileSync(file, 'utf8')).schemaVersion).toBe(session.SCHEMA_VERSION);
  });
});

describe('BUG-035 G2 — outline, completeness, seal, provenance refresh', () => {
  test('outline path is JSON; readOutline accepts the legacy -outline.md name', () => {
    const { version } = store.newVersion(root, SLUG, { date: '2026-11-07' });
    const p = store.versionPaths(root, SLUG, version);
    expect(p.outline.endsWith('-outline.json')).toBe(true);
    fs.writeFileSync(p.outlineLegacy, JSON.stringify({ keyMessage: 'k' }));
    expect(store.readOutline(root, SLUG, version).keyMessage).toBe('k');
  });

  test('missingArtifacts lists what Confirm Output still needs, including -script.docx', () => {
    const { version } = store.newVersion(root, SLUG, { date: '2026-11-07' });
    const p = store.versionPaths(root, SLUG, version);
    for (const k of store.REQUIRED_ARTIFACTS.filter((x) => x !== 'scriptDocx')) fs.writeFileSync(p[k], 'x');
    expect(store.missingArtifacts(root, SLUG, version)).toEqual(['scriptDocx']);
  });

  test('drafts are writable; a sealed version refuses writes except simulation/', () => {
    const { version } = store.newVersion(root, SLUG, { date: '2026-11-07' });
    expect(() => store.assertWritable(root, SLUG, version, 'demo.pptx')).not.toThrow();
    store.writeProvenance(root, SLUG, version, { seal: true });
    expect(store.isSealed(root, SLUG, version)).toBe(true);
    expect(() => store.assertWritable(root, SLUG, version, 'demo.pptx')).toThrow(/sealed/);
    expect(() => store.assertWritable(root, SLUG, version, 'simulation/run-1/data.json')).not.toThrow();
  });

  test('refreshProvenance adds simulation files and keeps sealed hashes untouched', () => {
    const { version, dir } = store.newVersion(root, SLUG, { date: '2026-11-07' });
    fs.writeFileSync(path.join(dir, 'demo.md'), 'v1');
    const before = store.writeProvenance(root, SLUG, version, { seal: true });
    fs.mkdirSync(path.join(dir, 'simulation', 'run-1'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'simulation', 'run-1', 'data.json'), '{}');
    fs.writeFileSync(path.join(dir, 'demo.md'), 'hand edit');
    expect(store.refreshProvenance(root, SLUG, version)).toEqual([path.join('simulation', 'run-1', 'data.json')]);
    const after = store.readProvenance(root, SLUG, version);
    expect(after.artifacts['demo.md']).toBe(before.artifacts['demo.md']);
    expect(store.detectHandEdits(root, SLUG, version).map((d) => d.artifact)).toEqual(['demo.md']);
  });
});
