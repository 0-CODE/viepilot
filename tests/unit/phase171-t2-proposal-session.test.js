const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const os = require('os');

const proposalSession = require('../../lib/proposal-session.cjs');
const proposalStore = require('../../lib/proposal-store.cjs');

// Create a temporary project directory for each test
function createTempProject() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-test-'));
  const docsDir = path.join(tempDir, 'docs', 'proposals');
  fs.mkdirSync(docsDir, { recursive: true });
  // Create .viepilot directory so CLI recognizes it as a project
  fs.mkdirSync(path.join(tempDir, '.viepilot'), { recursive: true });
  return tempDir;
}

// Clean up temp project
function cleanupProject(projectRoot) {
  if (fs.existsSync(projectRoot)) {
    fs.rmSync(projectRoot, { recursive: true });
  }
}

describe('proposal-session (ENH-124, ENH-126)', () => {
  describe('Schema versioning and migration', () => {
    it('should create session with the current SCHEMA_VERSION', () => {
      const projectRoot = createTempProject();
      try {
        proposalStore.createProposal(projectRoot, { slug: 'test-prop', title: 'Test', type: 'proposal' });
        const session = proposalSession.startSession(projectRoot, 'test-prop');

        assert.strictEqual(session.schemaVersion, proposalSession.SCHEMA_VERSION);
        assert.strictEqual(session.slug, 'test-prop');
        assert.strictEqual(session.status, 'in_progress');
      } finally {
        cleanupProject(projectRoot);
      }
    });

    it('should migrate session with missing schemaVersion', () => {
      const projectRoot = createTempProject();
      try {
        proposalStore.createProposal(projectRoot, { slug: 'test-prop', title: 'Test', type: 'proposal' });

        // Create a session without schemaVersion (simulating old format)
        const sessionPath = path.join(projectRoot, 'docs', 'proposals', 'test-prop', 'session.json');
        const oldSession = {
          slug: 'test-prop',
          status: 'in_progress',
          currentStep: 'design',
        };
        fs.writeFileSync(sessionPath, JSON.stringify(oldSession));

        // Load should migrate it
        const session = proposalSession.loadSession(projectRoot, 'test-prop');

        assert.strictEqual(session.schemaVersion, proposalSession.SCHEMA_VERSION);
        assert.strictEqual(session.status, 'in_progress');
        assert.strictEqual(session.currentStep, 'design');
        assert.deepStrictEqual(session.completedSteps, []);
        assert.deepStrictEqual(session.decisions, {});
        assert.deepStrictEqual(session.gates, {});
      } finally {
        cleanupProject(projectRoot);
      }
    });

    it('should persist migrated session to file', () => {
      const projectRoot = createTempProject();
      try {
        proposalStore.createProposal(projectRoot, { slug: 'test-prop', title: 'Test', type: 'proposal' });

        const sessionPath = path.join(projectRoot, 'docs', 'proposals', 'test-prop', 'session.json');
        const oldSession = { slug: 'test-prop', status: 'in_progress' };
        fs.writeFileSync(sessionPath, JSON.stringify(oldSession));

        proposalSession.loadSession(projectRoot, 'test-prop');

        const persisted = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
        assert.strictEqual(persisted.schemaVersion, proposalSession.SCHEMA_VERSION);
      } finally {
        cleanupProject(projectRoot);
      }
    });
  });

  describe('Atomic writes', () => {
    it('should write session atomically (no partial files on error)', () => {
      const projectRoot = createTempProject();
      try {
        proposalStore.createProposal(projectRoot, { slug: 'test-prop', title: 'Test', type: 'proposal' });
        proposalSession.startSession(projectRoot, 'test-prop');

        const sessionPath = path.join(projectRoot, 'docs', 'proposals', 'test-prop', 'session.json');
        const tmpPath = `${sessionPath}.tmp`;

        // After write, no .tmp file should remain
        proposalSession.recordStep(projectRoot, 'test-prop', 'step1');

        assert(!fs.existsSync(tmpPath), 'Temp file should not exist after atomic write');
        assert(fs.existsSync(sessionPath), 'Session file should exist');
      } finally {
        cleanupProject(projectRoot);
      }
    });
  });

  describe('recordStep, recordDecision, recordGate, setPendingGate', () => {
    it('should record step', () => {
      const projectRoot = createTempProject();
      try {
        proposalStore.createProposal(projectRoot, { slug: 'test-prop', title: 'Test', type: 'proposal' });
        proposalSession.startSession(projectRoot, 'test-prop');
        proposalSession.recordStep(projectRoot, 'test-prop', 'step1');

        const session = proposalSession.loadSession(projectRoot, 'test-prop');
        assert.strictEqual(session.currentStep, 'step1');
        assert(session.completedSteps.includes('step1'));
      } finally {
        cleanupProject(projectRoot);
      }
    });

    it('should record decision with source', () => {
      const projectRoot = createTempProject();
      try {
        proposalStore.createProposal(projectRoot, { slug: 'test-prop', title: 'Test', type: 'proposal' });
        proposalSession.startSession(projectRoot, 'test-prop');
        proposalSession.recordDecision(projectRoot, 'test-prop', 'format', 'pptx', 'flag');

        const session = proposalSession.loadSession(projectRoot, 'test-prop');
        assert.strictEqual(session.decisions.format.value, 'pptx');
        assert.strictEqual(session.decisions.format.source, 'flag');
        assert(session.decisions.format.at);
      } finally {
        cleanupProject(projectRoot);
      }
    });

    it('should record gate', () => {
      const projectRoot = createTempProject();
      try {
        proposalStore.createProposal(projectRoot, { slug: 'test-prop', title: 'Test', type: 'proposal' });
        proposalSession.startSession(projectRoot, 'test-prop');
        proposalSession.recordGate(projectRoot, 'test-prop', 'review', 'council', 'accepted');

        const session = proposalSession.loadSession(projectRoot, 'test-prop');
        assert.strictEqual(session.gates.review.kind, 'council');
        assert.strictEqual(session.gates.review.result, 'accepted');
      } finally {
        cleanupProject(projectRoot);
      }
    });

    it('should set pending gate', () => {
      const projectRoot = createTempProject();
      try {
        proposalStore.createProposal(projectRoot, { slug: 'test-prop', title: 'Test', type: 'proposal' });
        proposalSession.startSession(projectRoot, 'test-prop');
        proposalSession.setPendingGate(projectRoot, 'test-prop', { step: 'review', kind: 'council' });

        const session = proposalSession.loadSession(projectRoot, 'test-prop');
        assert.strictEqual(session.pendingGate.step, 'review');
        assert.strictEqual(session.pendingGate.kind, 'council');
      } finally {
        cleanupProject(projectRoot);
      }
    });

    it('should clear pending gate', () => {
      const projectRoot = createTempProject();
      try {
        proposalStore.createProposal(projectRoot, { slug: 'test-prop', title: 'Test', type: 'proposal' });
        proposalSession.startSession(projectRoot, 'test-prop');
        proposalSession.setPendingGate(projectRoot, 'test-prop', { step: 'review', kind: 'council' });
        proposalSession.setPendingGate(projectRoot, 'test-prop', null);

        const session = proposalSession.loadSession(projectRoot, 'test-prop');
        assert.strictEqual(session.pendingGate, null);
      } finally {
        cleanupProject(projectRoot);
      }
    });
  });

  describe('finishSession', () => {
    it('should mark session as done', () => {
      const projectRoot = createTempProject();
      try {
        proposalStore.createProposal(projectRoot, { slug: 'test-prop', title: 'Test', type: 'proposal' });
        proposalSession.startSession(projectRoot, 'test-prop');
        proposalSession.finishSession(projectRoot, 'test-prop');

        const session = proposalSession.loadSession(projectRoot, 'test-prop');
        assert.strictEqual(session.status, 'done');
      } finally {
        cleanupProject(projectRoot);
      }
    });
  });

  describe('activeSessions', () => {
    it('should list active sessions (in_progress)', () => {
      const projectRoot = createTempProject();
      try {
        proposalStore.createProposal(projectRoot, { slug: 'prop1', title: 'Proposal 1', type: 'proposal' });
        proposalStore.createProposal(projectRoot, { slug: 'prop2', title: 'Proposal 2', type: 'proposal' });

        proposalSession.startSession(projectRoot, 'prop1');
        proposalSession.startSession(projectRoot, 'prop2', { status: 'done' });

        const active = proposalSession.activeSessions(projectRoot, { maxAgeHours: 24 });

        // Should include prop1 (in_progress) and prop2 (done, recent)
        assert.strictEqual(active.length, 2);
      } finally {
        cleanupProject(projectRoot);
      }
    });

    it('should filter by maxAgeHours', () => {
      const projectRoot = createTempProject();
      try {
        proposalStore.createProposal(projectRoot, { slug: 'prop1', title: 'Proposal 1', type: 'proposal' });
        proposalSession.startSession(projectRoot, 'prop1', { status: 'done' });

        // Manually set updatedAt to > 24 hours ago
        const sessionPath = path.join(projectRoot, 'docs', 'proposals', 'prop1', 'session.json');
        const session = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
        session.updatedAt = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
        fs.writeFileSync(sessionPath, JSON.stringify(session));

        const active = proposalSession.activeSessions(projectRoot, { maxAgeHours: 24 });
        assert.strictEqual(active.length, 0);
      } finally {
        cleanupProject(projectRoot);
      }
    });

    it('should include in_progress sessions regardless of age', () => {
      const projectRoot = createTempProject();
      try {
        proposalStore.createProposal(projectRoot, { slug: 'prop1', title: 'Proposal 1', type: 'proposal' });
        proposalSession.startSession(projectRoot, 'prop1');

        // Manually set updatedAt to > 24 hours ago
        const sessionPath = path.join(projectRoot, 'docs', 'proposals', 'prop1', 'session.json');
        const session = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
        session.updatedAt = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
        fs.writeFileSync(sessionPath, JSON.stringify(session));

        const active = proposalSession.activeSessions(projectRoot, { maxAgeHours: 24 });
        assert.strictEqual(active.length, 1);
      } finally {
        cleanupProject(projectRoot);
      }
    });
  });

  describe('CLI: vp-tools proposal status', () => {
    it('should show status of active sessions', () => {
      const projectRoot = createTempProject();
      try {
        proposalStore.createProposal(projectRoot, { slug: 'test-prop', title: 'Test', type: 'proposal' });
        proposalSession.startSession(projectRoot, 'test-prop');
        proposalSession.recordStep(projectRoot, 'test-prop', 'design');

        const result = spawnSync('node',
          [path.join(__dirname, '../../bin/vp-tools.cjs'), 'proposal', 'status'],
          { cwd: projectRoot, encoding: 'utf8' }
        );

        assert.strictEqual(result.status, 0);
        assert(result.stdout.includes('test-prop'));
        assert(result.stdout.includes('in_progress'));
        assert(result.stdout.includes('design'));
      } finally {
        cleanupProject(projectRoot);
      }
    });

    it('should show status as JSON', () => {
      const projectRoot = createTempProject();
      try {
        proposalStore.createProposal(projectRoot, { slug: 'test-prop', title: 'Test', type: 'proposal' });
        proposalSession.startSession(projectRoot, 'test-prop');

        const result = spawnSync('node',
          [path.join(__dirname, '../../bin/vp-tools.cjs'), 'proposal', 'status', '--json'],
          { cwd: projectRoot, encoding: 'utf8' }
        );

        assert.strictEqual(result.status, 0);
        const output = JSON.parse(result.stdout);
        assert(Array.isArray(output));
        assert.strictEqual(output[0].slug, 'test-prop');
      } finally {
        cleanupProject(projectRoot);
      }
    });

    it('should filter by slug', () => {
      const projectRoot = createTempProject();
      try {
        proposalStore.createProposal(projectRoot, { slug: 'prop1', title: 'Proposal 1', type: 'proposal' });
        proposalStore.createProposal(projectRoot, { slug: 'prop2', title: 'Proposal 2', type: 'proposal' });
        proposalSession.startSession(projectRoot, 'prop1');
        proposalSession.startSession(projectRoot, 'prop2');

        const result = spawnSync('node',
          [path.join(__dirname, '../../bin/vp-tools.cjs'), 'proposal', 'status', '--slug', 'prop1'],
          { cwd: projectRoot, encoding: 'utf8' }
        );

        assert.strictEqual(result.status, 0);
        assert(result.stdout.includes('prop1'));
        assert(!result.stdout.includes('prop2'));
      } finally {
        cleanupProject(projectRoot);
      }
    });
  });

  describe('CLI: vp-tools proposal resume', () => {
    it('should show current step and decisions', () => {
      const projectRoot = createTempProject();
      try {
        proposalStore.createProposal(projectRoot, { slug: 'test-prop', title: 'Test', type: 'proposal' });
        proposalSession.startSession(projectRoot, 'test-prop');
        proposalSession.recordStep(projectRoot, 'test-prop', 'design');
        proposalSession.recordDecision(projectRoot, 'test-prop', 'format', 'pptx', 'flag');

        const result = spawnSync('node',
          [path.join(__dirname, '../../bin/vp-tools.cjs'), 'proposal', 'resume'],
          { cwd: projectRoot, encoding: 'utf8' }
        );

        assert.strictEqual(result.status, 0);
        assert(result.stdout.includes('design'));
        assert(result.stdout.includes('format'));
        assert(result.stdout.includes('pptx'));
      } finally {
        cleanupProject(projectRoot);
      }
    });

    it('should exit 1 when nothing to resume', () => {
      const projectRoot = createTempProject();
      try {
        const result = spawnSync('node',
          [path.join(__dirname, '../../bin/vp-tools.cjs'), 'proposal', 'resume'],
          { cwd: projectRoot, encoding: 'utf8' }
        );

        assert.strictEqual(result.status, 1);
      } finally {
        cleanupProject(projectRoot);
      }
    });
  });

  describe('CLI: vp-tools proposal migrate', () => {
    it('should print migration plan with --dry-run', () => {
      const projectRoot = createTempProject();
      try {
        // Create a legacy proposal (flat files)
        const legacyDir = path.join(projectRoot, 'docs', 'proposals');
        fs.writeFileSync(path.join(legacyDir, 'old-prop-2026-11-01.md'), '# Old');
        fs.writeFileSync(path.join(legacyDir, 'old-prop-2026-11-01-script.md'), 'script');

        const result = spawnSync('node',
          [path.join(__dirname, '../../bin/vp-tools.cjs'), 'proposal', 'migrate', '--dry-run'],
          { cwd: projectRoot, encoding: 'utf8' }
        );

        assert.strictEqual(result.status, 0);
        assert(result.stdout.includes('Migration plan'));
        assert(result.stdout.includes('old-prop'));
        assert(result.stdout.includes('Dry run'));
      } finally {
        cleanupProject(projectRoot);
      }
    });

    it('should not write files with --dry-run', () => {
      const projectRoot = createTempProject();
      try {
        const legacyDir = path.join(projectRoot, 'docs', 'proposals');
        fs.writeFileSync(path.join(legacyDir, 'old-prop-2026-11-01.md'), '# Old');

        spawnSync('node',
          [path.join(__dirname, '../../bin/vp-tools.cjs'), 'proposal', 'migrate', '--dry-run'],
          { cwd: projectRoot, encoding: 'utf8' }
        );

        // Version dir should not be created
        const versionsDir = path.join(projectRoot, 'docs', 'proposals', 'old-prop', 'versions');
        assert(!fs.existsSync(versionsDir));
      } finally {
        cleanupProject(projectRoot);
      }
    });

    it('should copy legacy files and create provenance with viepilotVersion legacy on real run', () => {
      const projectRoot = createTempProject();
      try {
        const legacyDir = path.join(projectRoot, 'docs', 'proposals');
        const content = '# Test Proposal';
        fs.writeFileSync(path.join(legacyDir, 'old-prop-2026-11-01.md'), content);

        const result = spawnSync('node',
          [path.join(__dirname, '../../bin/vp-tools.cjs'), 'proposal', 'migrate', '--yes'],
          { cwd: projectRoot, encoding: 'utf8' }
        );

        assert.strictEqual(result.status, 0);

        // Original should be kept
        assert(fs.existsSync(path.join(legacyDir, 'old-prop-2026-11-01.md')));

        // New version structure created
        const versionPath = path.join(projectRoot, 'docs', 'proposals', 'old-prop', 'versions', 'v1-2026-11-01');
        assert(fs.existsSync(versionPath));
        assert(fs.existsSync(path.join(versionPath, 'old-prop.md'))); // renamed to the versioned `{slug}.ext` form

        // Provenance created with legacy version
        const provenance = JSON.parse(fs.readFileSync(path.join(versionPath, 'provenance.json'), 'utf8'));
        assert.strictEqual(provenance.viepilotVersion, 'legacy');
      } finally {
        cleanupProject(projectRoot);
      }
    });
  });

  describe('CLI: vp-tools proposal diff', () => {
    it('should compare two versions', () => {
      const projectRoot = createTempProject();
      try {
        proposalStore.createProposal(projectRoot, { slug: 'test-prop', title: 'Test', type: 'proposal' });

        // Create two versions with fixtures
        const v1 = proposalStore.newVersion(projectRoot, 'test-prop', { date: '2026-11-01' });
        const v2 = proposalStore.newVersion(projectRoot, 'test-prop', { date: '2026-11-02' });

        // Write minimal manifests
        const manifest1 = { slides: [{ title: 'Slide 1' }] };
        const manifest2 = { slides: [{ title: 'Slide 1' }, { title: 'Slide 2' }] };

        fs.writeFileSync(path.join(v1.dir, 'manifest.json'), JSON.stringify(manifest1));
        fs.writeFileSync(path.join(v2.dir, 'manifest.json'), JSON.stringify(manifest2));

        proposalStore.setCurrentVersion(projectRoot, 'test-prop', v2.version);

        const result = spawnSync('node',
          [path.join(__dirname, '../../bin/vp-tools.cjs'), 'proposal', 'diff', 'test-prop'],
          { cwd: projectRoot, encoding: 'utf8' }
        );

        assert.strictEqual(result.status, 0);
        assert(result.stdout.includes('Diff'));
        assert(result.stdout.includes('Slides'));
        assert(result.stdout.includes('1 →'));
      } finally {
        cleanupProject(projectRoot);
      }
    });
  });

  describe('CLI: vp-tools proposal prune', () => {
    it('should delete old versions, keeping current and N versions', () => {
      const projectRoot = createTempProject();
      try {
        proposalStore.createProposal(projectRoot, { slug: 'test-prop', title: 'Test', type: 'proposal' });

        // Create 3 versions
        const v1 = proposalStore.newVersion(projectRoot, 'test-prop', { date: '2026-11-01' });
        const v2 = proposalStore.newVersion(projectRoot, 'test-prop', { date: '2026-11-02' });
        const v3 = proposalStore.newVersion(projectRoot, 'test-prop', { date: '2026-11-03' });

        proposalStore.setCurrentVersion(projectRoot, 'test-prop', v3.version);

        const result = spawnSync('node',
          [path.join(__dirname, '../../bin/vp-tools.cjs'), 'proposal', 'prune', 'test-prop', '--keep', '1', '--yes'],
          { cwd: projectRoot, encoding: 'utf8' }
        );

        assert.strictEqual(result.status, 0);

        const versionsDir = path.join(projectRoot, 'docs', 'proposals', 'test-prop', 'versions');
        const remaining = fs.readdirSync(versionsDir);

        // Should keep current (v3) and 1 more
        assert(remaining.includes(v3.version));
        assert(remaining.length <= 2);
      } finally {
        cleanupProject(projectRoot);
      }
    });

    it('should never delete current version', () => {
      const projectRoot = createTempProject();
      try {
        proposalStore.createProposal(projectRoot, { slug: 'test-prop', title: 'Test', type: 'proposal' });

        const v1 = proposalStore.newVersion(projectRoot, 'test-prop', { date: '2026-11-01' });
        proposalStore.setCurrentVersion(projectRoot, 'test-prop', v1.version);

        spawnSync('node',
          [path.join(__dirname, '../../bin/vp-tools.cjs'), 'proposal', 'prune', 'test-prop', '--keep', '0', '--yes'],
          { cwd: projectRoot, encoding: 'utf8' }
        );

        const versionsDir = path.join(projectRoot, 'docs', 'proposals', 'test-prop', 'versions');
        assert(fs.existsSync(path.join(versionsDir, v1.version)));
      } finally {
        cleanupProject(projectRoot);
      }
    });
  });

  describe('CLI help', () => {
    it('should show proposal command help', () => {
      const result = spawnSync('node',
        [path.join(__dirname, '../../bin/vp-tools.cjs'), 'help', 'proposal'],
        { encoding: 'utf8' }
      );

      assert.strictEqual(result.status, 0);
      assert(result.stdout.includes('proposal'));
      assert(result.stdout.includes('status'));
      assert(result.stdout.includes('resume'));
      assert(result.stdout.includes('migrate'));
      assert(result.stdout.includes('diff'));
      assert(result.stdout.includes('prune'));
    });

    it('should list proposal command in main help', () => {
      const result = spawnSync('node',
        [path.join(__dirname, '../../bin/vp-tools.cjs'), 'help'],
        { encoding: 'utf8' }
      );

      assert.strictEqual(result.status, 0);
      assert(result.stdout.includes('proposal'));
    });
  });
});

describe('phase171-t2 review: migrate has no side effects in dry-run and is not repeated', () => {
  const { spawnSync } = require('child_process');
  const VP = path.join(__dirname, '../../bin/vp-tools.cjs');
  test('dry-run creates nothing; real run creates v1 once; re-run is a no-op', () => {
    const root = fs.mkdtempSync(path.join(require('os').tmpdir(), 'vp-migrate-'));
    try {
      const dir = path.join(root, 'docs', 'proposals');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'old-pitch-2026-10-01.pptx'), 'P');
      fs.writeFileSync(path.join(dir, 'old-pitch-2026-10-01-script-5min.md'), 's');
      const run = (...a) => spawnSync(process.execPath, [VP, 'proposal', 'migrate', ...a], { cwd: root, encoding: 'utf8' });
      run('--dry-run');
      expect(fs.existsSync(path.join(dir, 'old-pitch'))).toBe(false);
      run('--yes');
      const v = path.join(dir, 'old-pitch', 'versions');
      expect(fs.readdirSync(v)).toEqual(['v1-2026-10-01']);
      expect(fs.readdirSync(path.join(v, 'v1-2026-10-01')).sort()).toEqual(['old-pitch-script-5min.md', 'old-pitch.pptx', 'provenance.json']);
      const prov = JSON.parse(fs.readFileSync(path.join(v, 'v1-2026-10-01', 'provenance.json'), 'utf8'));
      expect(prov.viepilotVersion).toBe('legacy');
      expect(Object.keys(prov.artifacts).sort()).toEqual(['old-pitch-script-5min.md', 'old-pitch.pptx']);
      run('--yes');
      expect(fs.readdirSync(v)).toEqual(['v1-2026-10-01']);
      expect(fs.existsSync(path.join(dir, 'old-pitch-2026-10-01.pptx'))).toBe(true); // originals kept
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
