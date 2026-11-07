const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { mkdtempSync, rmSync } = require('fs');

const store = require('../../lib/proposal-store.cjs');

// ─────────────────────────────────────────────────────────────────────────────
// Helper: create temp project
// ─────────────────────────────────────────────────────────────────────────────
function createTempProject() {
  const tempDir = mkdtempSync(path.join(__dirname, 'temp-proposal-'));
  const projectRoot = tempDir;

  // Create docs/proposals structure
  const proposalDir = path.join(projectRoot, 'docs', 'proposals');
  fs.mkdirSync(proposalDir, { recursive: true });

  return projectRoot;
}

function cleanupTempProject(projectRoot) {
  rmSync(projectRoot, { recursive: true, force: true });
}

// ─────────────────────────────────────────────────────────────────────────────
// Test suite
// ─────────────────────────────────────────────────────────────────────────────

describe('proposal-store', () => {
  let projectRoot;

  beforeEach(() => {
    projectRoot = createTempProject();
  });

  afterEach(() => {
    cleanupTempProject(projectRoot);
  });

  describe('createProposal', () => {
    test('creates a new proposal with correct structure', () => {
      const result = store.createProposal(projectRoot, {
        slug: 'test-proposal',
        title: 'Test Proposal',
        type: 'project-proposal',
        variant: 'team-intro',
        lang: 'en',
      });

      expect(result.slug).toBe('test-proposal');
      expect(result.title).toBe('Test Proposal');
      expect(result.type).toBe('project-proposal');
      expect(result.variant).toBe('team-intro');
      expect(result.lang).toBe('en');
      expect(result.created).toBeDefined();
      expect(result.currentVersion).toBeNull();
    });

    test('is idempotent (returns existing proposal)', () => {
      const first = store.createProposal(projectRoot, {
        slug: 'idempotent-test',
        title: 'First Call',
        type: 'project-proposal',
      });

      const second = store.createProposal(projectRoot, {
        slug: 'idempotent-test',
        title: 'Second Call (ignored)',
        type: 'research-proposal', // Different type ignored
      });

      expect(first.title).toBe('First Call');
      expect(second.title).toBe('First Call');
      expect(first.created).toBe(second.created);
    });

    test('throws if required fields missing', () => {
      expect(() => {
        store.createProposal(projectRoot, { slug: 'test' }); // Missing title, type
      }).toThrow();
    });
  });

  describe('readProposal / listProposals', () => {
    test('readProposal returns null for non-existent proposal', () => {
      const result = store.readProposal(projectRoot, 'nonexistent');
      expect(result).toBeNull();
    });

    test('readProposal reads a created proposal', () => {
      store.createProposal(projectRoot, {
        slug: 'read-test',
        title: 'Read Test',
        type: 'project-proposal',
      });

      const result = store.readProposal(projectRoot, 'read-test');
      expect(result.slug).toBe('read-test');
      expect(result.title).toBe('Read Test');
    });

    test('listProposals returns all proposals', () => {
      store.createProposal(projectRoot, {
        slug: 'first',
        title: 'First',
        type: 'project-proposal',
      });
      store.createProposal(projectRoot, {
        slug: 'second',
        title: 'Second',
        type: 'research-proposal',
      });

      const all = store.listProposals(projectRoot);
      expect(all.length).toBeGreaterThanOrEqual(2);
      expect(all.some(p => p.slug === 'first')).toBe(true);
      expect(all.some(p => p.slug === 'second')).toBe(true);
    });

    test('listProposals returns empty list when no proposals exist', () => {
      const all = store.listProposals(projectRoot);
      expect(all.length).toBe(0);
    });
  });

  describe('newVersion', () => {
    test('creates v1 on first call', () => {
      store.createProposal(projectRoot, {
        slug: 'version-test',
        title: 'Version Test',
        type: 'project-proposal',
      });

      const v1 = store.newVersion(projectRoot, 'version-test');
      expect(v1.version).toMatch(/^v1-\d{4}-\d{2}-\d{2}$/);
      expect(fs.existsSync(v1.dir)).toBe(true);
    });

    test('creates v2 when called again on same day', () => {
      store.createProposal(projectRoot, {
        slug: 'same-day-test',
        title: 'Same Day Test',
        type: 'project-proposal',
      });

      const date = new Date().toISOString().slice(0, 10);
      const v1 = store.newVersion(projectRoot, 'same-day-test', { date });
      const v2 = store.newVersion(projectRoot, 'same-day-test', { date });

      expect(v1.version).toMatch(/^v1-/);
      expect(v2.version).toMatch(/^v2-/);
      expect(v1.version).not.toBe(v2.version);
      expect(v1.dir).not.toBe(v2.dir);
      expect(fs.existsSync(v1.dir)).toBe(true);
      expect(fs.existsSync(v2.dir)).toBe(true);
    });

    test('never overwrites an existing version directory', () => {
      store.createProposal(projectRoot, {
        slug: 'no-overwrite-test',
        title: 'No Overwrite Test',
        type: 'project-proposal',
      });

      const date = new Date().toISOString().slice(0, 10);
      const v1 = store.newVersion(projectRoot, 'no-overwrite-test', { date });

      // Write a marker file to v1
      const markerFile = path.join(v1.dir, 'marker.txt');
      fs.writeFileSync(markerFile, 'original', 'utf8');

      // Create v2
      const v2 = store.newVersion(projectRoot, 'no-overwrite-test', { date });

      // v1 marker should still exist
      expect(fs.existsSync(markerFile)).toBe(true);
      expect(fs.readFileSync(markerFile, 'utf8')).toBe('original');

      // v2 should be different
      expect(fs.existsSync(path.join(v2.dir, 'marker.txt'))).toBe(false);
    });

    test('throws if proposal does not exist', () => {
      expect(() => {
        store.newVersion(projectRoot, 'nonexistent');
      }).toThrow();
    });
  });

  describe('versionPaths', () => {
    test('returns object with all expected paths', () => {
      store.createProposal(projectRoot, {
        slug: 'path-test',
        title: 'Path Test',
        type: 'project-proposal',
      });
      const version = store.newVersion(projectRoot, 'path-test');

      const paths = store.versionPaths(projectRoot, 'path-test', version.version);

      expect(paths.pptx).toContain('.pptx');
      expect(paths.docx).toContain('.docx');
      expect(paths.md).toContain('.md');
      expect(paths.script).toContain('script');
      expect(paths.manifest).toContain('manifest.json');
      expect(paths.provenance).toContain('provenance.json');
      expect(paths.simulationDir).toBeDefined();

      // All paths should be under the version directory
      for (const key of Object.keys(paths)) {
        if (key !== 'simulationDir') {
          expect(paths[key]).toContain('path-test');
          expect(paths[key]).toContain('versions');
        }
      }
    });
  });

  describe('writeProvenance / readProvenance', () => {
    test('writes and reads provenance with hashes', () => {
      store.createProposal(projectRoot, {
        slug: 'prov-test',
        title: 'Provenance Test',
        type: 'project-proposal',
      });
      const version = store.newVersion(projectRoot, 'prov-test');
      const paths = store.versionPaths(projectRoot, 'prov-test', version.version);

      // Create some artifact files
      fs.writeFileSync(paths.md, '# Test Markdown', 'utf8');
      fs.writeFileSync(paths.pptx, 'fake pptx', 'utf8');

      const provenance = store.writeProvenance(projectRoot, 'prov-test', version.version, {
        gatesPassed: ['context_detection', 'purpose_consult'],
        inputsHash: 'input-hash-123',
        skillsUsed: ['proposal-generator'],
        skillVersion: '3.18.0',
        workflowVersion: '1.0',
      });

      expect(provenance.viepilotVersion).toBeDefined();
      expect(provenance.generatedAt).toBeDefined();
      expect(provenance.gatesPassed).toEqual(['context_detection', 'purpose_consult']);
      expect(provenance.inputsHash).toBe('input-hash-123');
      expect(provenance.artifacts['prov-test.md']).toBeDefined();
      expect(provenance.artifacts['prov-test.pptx']).toBeDefined();

      // Verify hash format (SHA256 hex = 64 chars)
      const hashValue = provenance.artifacts['prov-test.md'];
      expect(hashValue).toMatch(/^[a-f0-9]{64}$/);
    });

    test('readProvenance returns null if provenance.json does not exist', () => {
      store.createProposal(projectRoot, {
        slug: 'no-prov-test',
        title: 'No Provenance Test',
        type: 'project-proposal',
      });
      const version = store.newVersion(projectRoot, 'no-prov-test');

      const result = store.readProvenance(projectRoot, 'no-prov-test', version.version);
      expect(result).toBeNull();
    });

    test('roundtrip: write and read provenance', () => {
      store.createProposal(projectRoot, {
        slug: 'roundtrip-test',
        title: 'Roundtrip Test',
        type: 'project-proposal',
      });
      const version = store.newVersion(projectRoot, 'roundtrip-test');
      const paths = store.versionPaths(projectRoot, 'roundtrip-test', version.version);

      fs.writeFileSync(paths.md, '# Roundtrip', 'utf8');

      store.writeProvenance(projectRoot, 'roundtrip-test', version.version, {
        gatesPassed: ['gate1', 'gate2'],
      });

      const read = store.readProvenance(projectRoot, 'roundtrip-test', version.version);
      expect(read.gatesPassed).toEqual(['gate1', 'gate2']);
      expect(read.artifacts['roundtrip-test.md']).toBeDefined();
    });
  });

  describe('detectHandEdits', () => {
    test('detects modifications to artifact files', () => {
      store.createProposal(projectRoot, {
        slug: 'edit-test',
        title: 'Edit Test',
        type: 'project-proposal',
      });
      const version = store.newVersion(projectRoot, 'edit-test');
      const paths = store.versionPaths(projectRoot, 'edit-test', version.version);

      // Write initial artifact
      fs.writeFileSync(paths.md, '# Original', 'utf8');

      // Store provenance
      store.writeProvenance(projectRoot, 'edit-test', version.version);

      // Modify the file (simulating hand edits)
      fs.writeFileSync(paths.md, '# Original\n# Modified by user', 'utf8');

      // Detect hand edits
      const edits = store.detectHandEdits(projectRoot, 'edit-test', version.version);
      expect(edits.length).toBeGreaterThan(0);
      expect(edits.some(e => e.artifact.includes('edit-test.md'))).toBe(true);

      const mdEdit = edits.find(e => e.artifact.includes('edit-test.md'));
      expect(mdEdit.expected).toBeDefined();
      expect(mdEdit.actual).toBeDefined();
      expect(mdEdit.expected).not.toBe(mdEdit.actual);
    });

    test('returns empty array if no edits detected', () => {
      store.createProposal(projectRoot, {
        slug: 'no-edit-test',
        title: 'No Edit Test',
        type: 'project-proposal',
      });
      const version = store.newVersion(projectRoot, 'no-edit-test');
      const paths = store.versionPaths(projectRoot, 'no-edit-test', version.version);

      fs.writeFileSync(paths.md, '# No Edit', 'utf8');
      store.writeProvenance(projectRoot, 'no-edit-test', version.version);

      // Do not modify; detect
      const edits = store.detectHandEdits(projectRoot, 'no-edit-test', version.version);
      expect(edits.length).toBe(0);
    });

    test('detects missing files', () => {
      store.createProposal(projectRoot, {
        slug: 'missing-test',
        title: 'Missing Test',
        type: 'project-proposal',
      });
      const version = store.newVersion(projectRoot, 'missing-test');
      const paths = store.versionPaths(projectRoot, 'missing-test', version.version);

      fs.writeFileSync(paths.md, '# Content', 'utf8');
      store.writeProvenance(projectRoot, 'missing-test', version.version);

      // Delete the file
      fs.unlinkSync(paths.md);

      const edits = store.detectHandEdits(projectRoot, 'missing-test', version.version);
      expect(edits.length).toBeGreaterThan(0);
      expect(edits.some(e => e.actual === null)).toBe(true);
    });

    test('returns empty array if no provenance exists', () => {
      store.createProposal(projectRoot, {
        slug: 'no-prov-edit-test',
        title: 'No Provenance Edit Test',
        type: 'project-proposal',
      });
      const version = store.newVersion(projectRoot, 'no-prov-edit-test');

      const edits = store.detectHandEdits(projectRoot, 'no-prov-edit-test', version.version);
      expect(edits.length).toBe(0);
    });
  });

  describe('setCurrentVersion', () => {
    test('updates proposal.json currentVersion field', () => {
      store.createProposal(projectRoot, {
        slug: 'current-version-test',
        title: 'Current Version Test',
        type: 'project-proposal',
      });

      const version = store.newVersion(projectRoot, 'current-version-test');
      store.setCurrentVersion(projectRoot, 'current-version-test', version.version);

      const proposal = store.readProposal(projectRoot, 'current-version-test');
      expect(proposal.currentVersion).toBe(version.version);
    });

    test('throws if proposal does not exist', () => {
      expect(() => {
        store.setCurrentVersion(projectRoot, 'nonexistent', 'v1-2026-11-07');
      }).toThrow();
    });
  });

  describe('detectExisting', () => {
    test('detects new-style proposals by slug', () => {
      store.createProposal(projectRoot, {
        slug: 'existing-test',
        title: 'Existing Test',
        type: 'project-proposal',
      });

      const result = store.detectExisting(projectRoot, { slug: 'existing-test' });
      expect(result.proposals.length).toBeGreaterThan(0);
      expect(result.proposals.some(p => p.slug === 'existing-test')).toBe(true);
    });

    test('detects legacy flat files', () => {
      const proposalDir = path.join(projectRoot, 'docs', 'proposals');
      fs.mkdirSync(proposalDir, { recursive: true });

      // Create legacy flat files
      fs.writeFileSync(path.join(proposalDir, 'old-proposal-2026-10-01.md'), '# Old', 'utf8');
      fs.writeFileSync(path.join(proposalDir, 'old-proposal-2026-10-01.pptx'), 'fake', 'utf8');

      const result = store.detectExisting(projectRoot, { slug: 'old-proposal' });
      expect(result.legacy.length).toBeGreaterThan(0);

      const legacyEntry = result.legacy.find(l => l.slug === 'old-proposal');
      expect(legacyEntry).toBeDefined();
      expect(legacyEntry.date).toBe('2026-10-01');
      expect(legacyEntry.files.length).toBeGreaterThan(0);
    });

    test('detects by topic (slugified matching)', () => {
      store.createProposal(projectRoot, {
        slug: 'project-alpha',
        title: 'Alpha Project Proposal',
        type: 'project-proposal',
      });

      // Should match by topic
      const result = store.detectExisting(projectRoot, { topic: 'alpha' });
      expect(result.proposals.length).toBeGreaterThan(0);
      expect(result.proposals.some(p => p.slug === 'project-alpha')).toBe(true);
    });

    test('returns empty if no matches found', () => {
      const result = store.detectExisting(projectRoot, { slug: 'nonexistent-slug' });
      expect(result.proposals.length).toBe(0);
      expect(result.legacy.length).toBe(0);
    });

    test('groups legacy files by slug and date', () => {
      const proposalDir = path.join(projectRoot, 'docs', 'proposals');
      fs.mkdirSync(proposalDir, { recursive: true });

      // Multiple extensions for same date
      fs.writeFileSync(path.join(proposalDir, 'research-2026-11-01.md'), 'content', 'utf8');
      fs.writeFileSync(path.join(proposalDir, 'research-2026-11-01.pptx'), 'slides', 'utf8');
      fs.writeFileSync(path.join(proposalDir, 'research-2026-11-01-review.md'), 'review', 'utf8');

      const result = store.detectExisting(projectRoot, { slug: 'research' });
      expect(result.legacy.length).toBe(1);

      const entry = result.legacy[0];
      expect(entry.slug).toBe('research');
      expect(entry.date).toBe('2026-11-01');
      expect(entry.files.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Integration: full versioning workflow', () => {
    test('multiple versions never overwrite each other', () => {
      // Create proposal
      store.createProposal(projectRoot, {
        slug: 'integration-test',
        title: 'Integration Test',
        type: 'project-proposal',
      });

      const date = new Date().toISOString().slice(0, 10);

      // Create three versions on same day
      const versions = [];
      for (let i = 0; i < 3; i++) {
        const v = store.newVersion(projectRoot, 'integration-test', { date });
        versions.push(v);

        const paths = store.versionPaths(projectRoot, 'integration-test', v.version);
        const content = `Version ${i + 1}`;
        fs.writeFileSync(paths.md, content, 'utf8');
        store.writeProvenance(projectRoot, 'integration-test', v.version);
      }

      // Verify all three versions exist and have correct content
      for (let i = 0; i < 3; i++) {
        const paths = store.versionPaths(projectRoot, 'integration-test', versions[i].version);
        const content = fs.readFileSync(paths.md, 'utf8');
        expect(content).toBe(`Version ${i + 1}`);
      }

      // Verify versions are named v1, v2, v3
      expect(versions[0].version).toMatch(/^v1-/);
      expect(versions[1].version).toMatch(/^v2-/);
      expect(versions[2].version).toMatch(/^v3-/);
    });

    test('provenance tracks all versions correctly', () => {
      store.createProposal(projectRoot, {
        slug: 'provenance-track-test',
        title: 'Provenance Tracking',
        type: 'project-proposal',
      });

      const date = new Date().toISOString().slice(0, 10);

      const v1 = store.newVersion(projectRoot, 'provenance-track-test', { date });
      const v1Paths = store.versionPaths(projectRoot, 'provenance-track-test', v1.version);
      fs.writeFileSync(v1Paths.md, 'v1 content', 'utf8');
      const prov1 = store.writeProvenance(projectRoot, 'provenance-track-test', v1.version, {
        gatesPassed: ['gate1'],
      });

      const v2 = store.newVersion(projectRoot, 'provenance-track-test', { date });
      const v2Paths = store.versionPaths(projectRoot, 'provenance-track-test', v2.version);
      fs.writeFileSync(v2Paths.md, 'v2 content', 'utf8');
      const prov2 = store.writeProvenance(projectRoot, 'provenance-track-test', v2.version, {
        gatesPassed: ['gate1', 'gate2'],
      });

      // Read back both
      const readProv1 = store.readProvenance(projectRoot, 'provenance-track-test', v1.version);
      const readProv2 = store.readProvenance(projectRoot, 'provenance-track-test', v2.version);

      expect(readProv1.gatesPassed).toEqual(['gate1']);
      expect(readProv2.gatesPassed).toEqual(['gate1', 'gate2']);

      // Hashes should be different (different content)
      expect(readProv1.artifacts['provenance-track-test.md'])
        .not.toBe(readProv2.artifacts['provenance-track-test.md']);
    });
  });
});

describe('phase171-t1 review fixes', () => {
  const fs = require('fs'); const os = require('os'); const path = require('path');
  const store = require('../../lib/proposal-store.cjs');
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8'));
  let root;
  beforeEach(() => { root = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-store-review-')); });
  afterEach(() => fs.rmSync(root, { recursive: true, force: true }));

  test('provenance records ViePilot\'s own version, not the user project\'s', () => {
    fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ name: 'user-app', version: '9.9.9' }));
    store.createProposal(root, { slug: 'crm', title: 'CRM', type: 'project-proposal' });
    const v = store.newVersion(root, 'crm');
    store.writeProvenance(root, 'crm', v.version, {});
    expect(store.readProvenance(root, 'crm', v.version).viepilotVersion).toBe(pkg.version);
  });

  test('topic matching is word-based and diacritic-insensitive', () => {
    store.createProposal(root, { slug: 'ke-hoach-crm', title: 'Kế hoạch CRM', type: 'project-proposal' });
    fs.writeFileSync(path.join(root, 'docs/proposals/old-pitch-2026-10-01.pptx'), 'x');
    expect(store.detectExisting(root, { topic: 'Old pitch for investors' }).legacy.map((l) => l.slug)).toEqual(['old-pitch']);
    expect(store.detectExisting(root, { topic: 'Kế hoạch triển khai CRM' }).proposals.map((p) => p.slug)).toEqual(['ke-hoach-crm']);
    expect(store.detectExisting(root, { topic: 'Hội thảo khoa học' }).proposals).toEqual([]);
    const all = store.detectExisting(root, {});
    expect(all.proposals.length).toBe(1);
    expect(all.legacy.length).toBe(1);
  });
});
