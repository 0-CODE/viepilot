'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const store = require('../../lib/proposal-store.cjs');
const session = require('../../lib/proposal-session.cjs');
const sim = require('../../lib/proposal-simulation.cjs');
const { aggregate } = require('../../lib/proposal-sim-aggregate.cjs');
const report = require('../../lib/proposal-sim-report.cjs');

let root;
const SLUG = 'demo';

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'vp182-'));
  store.createProposal(root, { slug: SLUG, title: 'Demo', type: 'general' });
  session.startSession(root, SLUG);
});

afterEach(() => fs.rmSync(root, { recursive: true, force: true }));

// Test data
const M = { slides: [
  { index: 1, heading: 'Cover', beat: 'context', speakerNotes: 'Chào mọi người.' },
  { index: 2, heading: 'Architecture', beat: 'solution', bullets: ['CQRS/ES via Kafka'], speakerNotes: 'Chúng ta dùng CQRS với event sourcing qua Kafka.' },
] };
const TL = sim.buildTimeline(M, { lang: 'vi', durationMin: 5 });
const LS = [sim.parseListener({ personaId: 2, states: [{ seg: 0, attention: 90 }, { seg: 1, attention: 30 }] }, TL).listener];
const AGG = aggregate({ timeline: TL, listeners: LS, manifest: M, primary: [2], keyMessages: ['test'], keywords: ['test'] });

describe('Phase 182.3 — BUG-038 provenance refresh and run duplicate guard', () => {
  describe('refreshProvenance: prune and re-hash', () => {
    test('prunes deleted simulation files, updates changed simulation files', () => {
      const { version, dir } = store.newVersion(root, SLUG, { date: '2026-11-07' });
      fs.writeFileSync(path.join(dir, 'demo.md'), 'sealed');
      store.writeProvenance(root, SLUG, version, { seal: true });

      // Add simulation files
      fs.mkdirSync(path.join(dir, 'simulation', 'run-1'), { recursive: true });
      fs.writeFileSync(path.join(dir, 'simulation', 'run-1', 'data.json'), '{"v":1}');
      fs.writeFileSync(path.join(dir, 'simulation', 'run-1', 'report.html'), 'report1');

      let result = store.refreshProvenance(root, SLUG, version);
      expect(result.length).toBe(2); // 2 added files
      expect(result.added).toHaveLength(2);
      expect(result.removed).toHaveLength(0);
      expect(result.updated).toHaveLength(0);
      expect(result.tampered).toHaveLength(0);
      expect(result).toContain(path.join('simulation', 'run-1', 'data.json'));

      // Now modify a simulation file
      fs.writeFileSync(path.join(dir, 'simulation', 'run-1', 'data.json'), '{"v":2}');
      result = store.refreshProvenance(root, SLUG, version);
      expect(result.length).toBe(0); // No new files added
      expect(result.added).toHaveLength(0);
      expect(result.updated).toHaveLength(1);
      expect(result.updated).toContain(path.join('simulation', 'run-1', 'data.json'));

      // Delete a simulation file
      fs.unlinkSync(path.join(dir, 'simulation', 'run-1', 'report.html'));
      result = store.refreshProvenance(root, SLUG, version);
      expect(result.length).toBe(0);
      expect(result.removed).toHaveLength(1);
      expect(result.removed).toContain(path.join('simulation', 'run-1', 'report.html'));

      // Verify file is gone from provenance
      const prov = store.readProvenance(root, SLUG, version);
      expect(prov.artifacts[path.join('simulation', 'run-1', 'report.html')]).toBeUndefined();
    });

    test('reports sealed file changes (tampered), does not rewrite their hashes', () => {
      const { version, dir } = store.newVersion(root, SLUG, { date: '2026-11-07' });
      const sealedContent = 'original sealed content';
      fs.writeFileSync(path.join(dir, 'demo.md'), sealedContent);
      store.writeProvenance(root, SLUG, version, { seal: true });

      const beforeProv = store.readProvenance(root, SLUG, version);
      const originalHash = beforeProv.artifacts['demo.md'];

      // Hand-edit the sealed file
      fs.writeFileSync(path.join(dir, 'demo.md'), 'modified sealed content');

      // Add a simulation file
      fs.mkdirSync(path.join(dir, 'simulation', 'run-1'), { recursive: true });
      fs.writeFileSync(path.join(dir, 'simulation', 'run-1', 'data.json'), 'run data');

      const result = store.refreshProvenance(root, SLUG, version);
      expect(result.tampered).toHaveLength(1);
      expect(result.tampered).toContain('demo.md');

      // Verify the sealed file's hash was NOT rewritten
      const afterProv = store.readProvenance(root, SLUG, version);
      expect(afterProv.artifacts['demo.md']).toBe(originalHash);
    });

    test('reports missing sealed files as tampered, does not remove them from provenance', () => {
      const { version, dir } = store.newVersion(root, SLUG, { date: '2026-11-07' });
      fs.writeFileSync(path.join(dir, 'demo.md'), 'sealed');
      store.writeProvenance(root, SLUG, version, { seal: true });

      const beforeProv = store.readProvenance(root, SLUG, version);
      expect(beforeProv.artifacts['demo.md']).toBeDefined();

      // Delete the sealed file
      fs.unlinkSync(path.join(dir, 'demo.md'));

      // Add a simulation file to trigger refresh
      fs.mkdirSync(path.join(dir, 'simulation', 'run-1'), { recursive: true });
      fs.writeFileSync(path.join(dir, 'simulation', 'run-1', 'data.json'), 'data');

      const result = store.refreshProvenance(root, SLUG, version);
      expect(result.tampered).toHaveLength(1);
      expect(result.tampered).toContain('demo.md');

      // Verify the sealed file is still in provenance (not removed)
      const afterProv = store.readProvenance(root, SLUG, version);
      expect(afterProv.artifacts['demo.md']).toBeDefined();
    });

    test('backward compat: array.length still works (returns added count)', () => {
      const { version, dir } = store.newVersion(root, SLUG, { date: '2026-11-07' });
      fs.writeFileSync(path.join(dir, 'demo.md'), 'sealed');
      store.writeProvenance(root, SLUG, version, { seal: true });

      fs.mkdirSync(path.join(dir, 'simulation', 'run-1'), { recursive: true });
      fs.writeFileSync(path.join(dir, 'simulation', 'run-1', 'data.json'), 'data');

      const result = store.refreshProvenance(root, SLUG, version);
      expect(result.length).toBe(1); // Only the data.json was added
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toBe(path.join('simulation', 'run-1', 'data.json'));
    });
  });

  describe('writeRun: duplicate guard', () => {
    test('refuses to write duplicate run without force', () => {
      const simulationDir = path.join(root, 'simulation');

      // Write first run
      const result1 = report.writeRun(simulationDir, {
        agg: AGG,
        timeline: TL,
        listeners: LS,
        hall: { listeners: [2] },
        meta: { title: 'Test', lang: 'en' },
        assets: { hallScript: '', threeSource: '' }
      });
      expect(path.basename(result1.dir)).toBe('run-1');

      // Try to write identical data again (should throw)
      expect(() => {
        report.writeRun(simulationDir, {
          agg: AGG,
          timeline: TL,
          listeners: LS,
          hall: { listeners: [2] },
          meta: { title: 'Test', lang: 'en' },
          assets: { hallScript: '', threeSource: '' }
        });
      }).toThrow(/duplicate run: identical to run-1/);
    });

    test('writes duplicate run with force option', () => {
      const simulationDir = path.join(root, 'simulation');

      const result1 = report.writeRun(simulationDir, {
        agg: AGG,
        timeline: TL,
        listeners: LS,
        hall: { listeners: [2] },
        meta: { title: 'Test', lang: 'en' },
        assets: { hallScript: '', threeSource: '' }
      });
      expect(path.basename(result1.dir)).toBe('run-1');

      // Write the same data with force = true
      const result2 = report.writeRun(simulationDir, {
        agg: AGG,
        timeline: TL,
        listeners: LS,
        hall: { listeners: [2] },
        meta: { title: 'Test', lang: 'en' },
        assets: { hallScript: '', threeSource: '' }
      }, { force: true });
      expect(path.basename(result2.dir)).toBe('run-2');

      // Verify both runs have identical data
      const data1 = JSON.parse(fs.readFileSync(path.join(result1.dir, 'data.json'), 'utf8'));
      const data2 = JSON.parse(fs.readFileSync(path.join(result2.dir, 'data.json'), 'utf8'));

      // Compare data excluding generatedAt
      const normalize = (data) => ({ timeline: data.timeline, listeners: data.listeners, hall: data.hall, aggregate: data.aggregate, panel: data.panel });
      expect(normalize(data1)).toEqual(normalize(data2));
    });

    test('allows different data to be written as run-2', () => {
      const simulationDir = path.join(root, 'simulation');

      const result1 = report.writeRun(simulationDir, {
        agg: AGG,
        timeline: TL,
        listeners: LS,
        hall: { listeners: [2] },
        meta: { title: 'Test1', lang: 'en' },
        assets: { hallScript: '', threeSource: '' }
      });
      expect(path.basename(result1.dir)).toBe('run-1');

      // Create modified aggregate by changing listeners
      const LS2 = [sim.parseListener({ personaId: 3, states: [{ seg: 0, attention: 70 }] }, TL).listener];
      const AGG2 = aggregate({ timeline: TL, listeners: LS2, manifest: M, primary: [3], keyMessages: ['test'], keywords: ['test'] });

      // Write different data
      const result2 = report.writeRun(simulationDir, {
        agg: AGG2,
        timeline: TL,
        listeners: LS2,
        hall: { listeners: [3] },
        meta: { title: 'Test2', lang: 'en' },
        assets: { hallScript: '', threeSource: '' }
      });
      expect(path.basename(result2.dir)).toBe('run-2');

      // Verify they're in separate directories
      expect(result1.dir).not.toBe(result2.dir);
    });

    test('detects duplicate considering panel data', () => {
      const simulationDir = path.join(root, 'simulation');

      const panelData = {
        summary: { count: 1 },
        messages: []
      };

      const result1 = report.writeRun(simulationDir, {
        agg: AGG,
        timeline: TL,
        listeners: LS,
        hall: { listeners: [2] },
        meta: { title: 'Test', lang: 'en' },
        panel: panelData,
        assets: { hallScript: '', threeSource: '' }
      });
      expect(path.basename(result1.dir)).toBe('run-1');

      // Write same data with same panel
      expect(() => {
        report.writeRun(simulationDir, {
          agg: AGG,
          timeline: TL,
          listeners: LS,
          hall: { listeners: [2] },
          meta: { title: 'Test', lang: 'en' },
          panel: panelData,
          assets: { hallScript: '', threeSource: '' }
        });
      }).toThrow(/duplicate run/);

      // Write same data without panel (should succeed - different data)
      const result2 = report.writeRun(simulationDir, {
        agg: AGG,
        timeline: TL,
        listeners: LS,
        hall: { listeners: [2] },
        meta: { title: 'Test', lang: 'en' },
        assets: { hallScript: '', threeSource: '' }
      });
      expect(path.basename(result2.dir)).toBe('run-2');
    });
  });

  describe('backward compatibility', () => {
    test('existing refreshProvenance test still passes (backward compat array)', () => {
      const { version, dir } = store.newVersion(root, SLUG, { date: '2026-11-07' });
      fs.writeFileSync(path.join(dir, 'demo.md'), 'v1');
      const before = store.writeProvenance(root, SLUG, version, { seal: true });

      fs.mkdirSync(path.join(dir, 'simulation', 'run-1'), { recursive: true });
      fs.writeFileSync(path.join(dir, 'simulation', 'run-1', 'data.json'), '{}');
      fs.writeFileSync(path.join(dir, 'demo.md'), 'hand edit');

      const result = store.refreshProvenance(root, SLUG, version);

      // Test from phase176: should work as an array of added files
      expect(result.length).toBe(1);
      expect(result[0]).toBe(path.join('simulation', 'run-1', 'data.json'));

      // And still be an array
      expect(Array.isArray(result)).toBe(true);

      // With extra properties for the new functionality
      expect(result.added).toEqual([path.join('simulation', 'run-1', 'data.json')]);
      expect(result.removed).toEqual([]);
      expect(result.updated).toEqual([]);
      // Tampered is now detected (new functionality in BUG-038)
      expect(result.tampered).toEqual(['demo.md']);

      // Verify backward compat: sealed file hash unchanged, hand edit still detectable
      const after = store.readProvenance(root, SLUG, version);
      expect(after.artifacts['demo.md']).toBe(before.artifacts['demo.md']);
      expect(store.detectHandEdits(root, SLUG, version).map((d) => d.artifact)).toEqual(['demo.md']);
    });
  });
});
