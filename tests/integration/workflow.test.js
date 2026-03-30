/**
 * Integration tests for end-to-end ViePilot workflows.
 * Each test sets up an isolated temp project directory and runs CLI commands
 * in sequence to simulate real workflow execution.
 */

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const CLI = path.join(__dirname, '../../bin/vp-tools.cjs');
const VIEPILOT_SRC = path.join(__dirname, '../..');

// ============================================================================
// Helpers
// ============================================================================

function run(args, cwd) {
  const result = spawnSync('node', [CLI, ...args], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
  });
  return {
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    code: result.status,
  };
}

function extractJson(stdout) {
  const clean = stdout.replace(/\x1b\[[0-9;]*m/g, '');
  let depth = 0;
  let end = -1;
  for (let i = clean.length - 1; i >= 0; i--) {
    const ch = clean[i];
    if (ch === '}') {
      if (depth === 0) end = i;
      depth++;
    } else if (ch === '{') {
      depth--;
      if (depth === 0) {
        const candidate = clean.slice(i, end + 1);
        try { return JSON.parse(candidate); } catch (e) { depth = 0; end = -1; }
      }
    }
  }
  throw new Error(`No JSON in:\n${stdout}`);
}

/**
 * Create a minimal isolated ViePilot project in a temp directory.
 * Copies the real .viepilot/ scaffold from templates.
 */
function createTempProject() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-test-'));

  // Create minimal .viepilot structure
  const vpDir = path.join(dir, '.viepilot');
  fs.mkdirSync(vpDir, { recursive: true });
  fs.mkdirSync(path.join(vpDir, 'phases'), { recursive: true });

  // Write minimal TRACKER.md
  fs.writeFileSync(path.join(vpDir, 'TRACKER.md'), [
    '# ViePilot - Tracker',
    '',
    '## Current State',
    '- **Milestone**: M1 - Test',
    '- **Current Phase**: 1',
    '- **Last Activity**: 2026-01-01',
    '',
    '## Version Info',
    '',
    '### Current Version',
    '```',
    '0.1.0',
    '```',
  ].join('\n'));

  // Write minimal ROADMAP.md
  fs.writeFileSync(path.join(vpDir, 'ROADMAP.md'), [
    '# Roadmap',
    '',
    '## Phase 1: Test Phase',
    '| Task | Description | Acceptance Criteria | Complexity |',
    '|------|-------------|---------------------|------------|',
    '| 1.1 | Task one | Criterion A | S |',
    '| 1.2 | Task two | Criterion B | M |',
  ].join('\n'));

  // Write minimal HANDOFF.json
  fs.writeFileSync(path.join(vpDir, 'HANDOFF.json'), JSON.stringify({
    milestone: 'M1',
    phase: 1,
    task: 1,
    status: 'not_started',
    last_activity: '2026-01-01T00:00:00Z',
    context: { files_touched: [], decisions: [], blockers: [] },
  }, null, 2));

  // Create phase 01
  const phaseDir = path.join(vpDir, 'phases', '01-test-phase');
  fs.mkdirSync(phaseDir, { recursive: true });

  fs.writeFileSync(path.join(phaseDir, 'SPEC.md'), [
    '# Phase 1: Test Phase',
    '| ID | Task | Description | Complexity |',
    '|----|------|-------------|------------|',
    '| 1.1 | Task one | Do thing A | S |',
    '| 1.2 | Task two | Do thing B | M |',
  ].join('\n'));

  fs.writeFileSync(path.join(phaseDir, 'PHASE-STATE.md'), [
    '# Phase 1 State',
    '| Task | Status | Started | Completed | Notes |',
    '|------|--------|---------|-----------|-------|',
    '| 1.1 | ⬜ Not Started | - | - | - |',
    '| 1.2 | ⬜ Not Started | - | - | - |',
  ].join('\n'));

  return dir;
}

function removeTempProject(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

// ============================================================================
// Workflow: Project initialization sequence
// ============================================================================

describe('Workflow: project initialization', () => {
  let projectDir;

  beforeAll(() => { projectDir = createTempProject(); });
  afterAll(() => { removeTempProject(projectDir); });

  test('init detects the project root', () => {
    const { stdout, code } = run(['init'], projectDir);
    expect(code).toBe(0);
    const data = extractJson(stdout);
    // Resolve symlinks — macOS /var → /private/var
    expect(fs.realpathSync(data.project_root)).toBe(fs.realpathSync(projectDir));
    expect(data.tracker_exists).toBe(true);
    expect(data.roadmap_exists).toBe(true);
    expect(data.handoff_exists).toBe(true);
  });

  test('progress returns correct phase count', () => {
    const { stdout, code } = run(['progress'], projectDir);
    expect(code).toBe(0);
    const data = extractJson(stdout);
    expect(data.phases.length).toBe(1);
    expect(data.phases[0].name).toBe('01-test-phase');
    // 2 tasks from SPEC.md
    expect(data.phases[0].tasks).toBe(2);
  });

  test('phase-info returns correct phase data', () => {
    const { stdout, code } = run(['phase-info', '1'], projectDir);
    expect(code).toBe(0);
    const data = extractJson(stdout);
    expect(data.phase_number).toBe(1);
    expect(data.has_spec).toBe(true);
    expect(data.has_state).toBe(true);
  });
});

// ============================================================================
// Workflow: Task lifecycle (not_started → in_progress → done)
// ============================================================================

describe('Workflow: task lifecycle', () => {
  let projectDir;

  beforeAll(() => { projectDir = createTempProject(); });
  afterAll(() => { removeTempProject(projectDir); });

  test('task starts as 0% complete', () => {
    const { stdout, code } = run(['progress'], projectDir);
    expect(code).toBe(0);
    const data = extractJson(stdout);
    expect(data.phases[0].completed).toBe(0);
    expect(data.overall).toBe(0);
  });

  test('task-status in_progress updates correctly', () => {
    const { stdout, code } = run(['task-status', '1', '1', 'in_progress'], projectDir);
    expect(code).toBe(0);
    const data = extractJson(stdout);
    expect(data.updated).toBe(true);
    expect(data.phase).toBe(1);
    expect(data.task).toBe(1);
    expect(data.status).toBe('in_progress');
  });

  test('task-status done marks task complete', () => {
    const { stdout, code } = run(['task-status', '1', '1', 'done'], projectDir);
    expect(code).toBe(0);
    const data = extractJson(stdout);
    expect(data.status).toBe('done');
  });

  test('task-status accepts all valid transitions', () => {
    const statuses = ['not_started', 'in_progress', 'done', 'skipped', 'blocked'];
    for (const s of statuses) {
      const { code } = run(['task-status', '1', '2', s], projectDir);
      expect(code).toBe(0);
    }
  });
});

// ============================================================================
// Workflow: Version management sequence
// ============================================================================

describe('Workflow: version management', () => {
  let projectDir;

  beforeAll(() => { projectDir = createTempProject(); });
  afterAll(() => { removeTempProject(projectDir); });

  test('initial version is 0.1.0', () => {
    const { stdout, code } = run(['version', 'get'], projectDir);
    expect(code).toBe(0);
    const data = extractJson(stdout);
    expect(data.version).toBe('0.1.0');
  });

  test('patch bump increments patch', () => {
    const { stdout, code } = run(['version', 'bump', 'patch'], projectDir);
    expect(code).toBe(0);
    const data = extractJson(stdout);
    expect(data.old_version).toBe('0.1.0');
    expect(data.new_version).toBe('0.1.1');
  });

  test('minor bump increments minor and resets patch', () => {
    const { stdout, code } = run(['version', 'bump', 'minor'], projectDir);
    expect(code).toBe(0);
    const data = extractJson(stdout);
    expect(data.new_version).toBe('0.2.0');
  });

  test('major bump increments major and resets minor+patch', () => {
    const { stdout, code } = run(['version', 'bump', 'major'], projectDir);
    expect(code).toBe(0);
    const data = extractJson(stdout);
    expect(data.new_version).toBe('1.0.0');
  });
});

// ============================================================================
// Workflow: Commit command sequence
// ============================================================================

describe('Workflow: commit command', () => {
  let projectDir;

  beforeAll(() => { projectDir = createTempProject(); });
  afterAll(() => { removeTempProject(projectDir); });

  test('generates correct git commit structure for feat', () => {
    const { stdout, code } = run(['commit', 'feat(skill): add new vp-example skill'], projectDir);
    expect(code).toBe(0);
    const data = extractJson(stdout);
    expect(data.command).toBe('git');
    expect(data.args[0]).toBe('commit');
    expect(data.args[1]).toBe('-m');
    expect(data.args[2]).toContain('feat(skill)');
  });

  test('generates correct git commit structure for fix', () => {
    const { stdout, code } = run(['commit', 'fix(workflow): resolve state tracking bug'], projectDir);
    expect(code).toBe(0);
    const data = extractJson(stdout);
    expect(data.args[2]).toContain('fix(workflow)');
  });

  test('includes file list when --files provided', () => {
    const { stdout, code } = run(
      ['commit', 'docs(readme): update installation', '--files', 'README.md', 'docs/install.md'],
      projectDir
    );
    expect(code).toBe(0);
    const data = extractJson(stdout);
    expect(data.files).toEqual(['README.md', 'docs/install.md']);
  });
});

// ============================================================================
// Workflow: Timestamp utility sequence
// ============================================================================

describe('Workflow: timestamp utility', () => {
  let projectDir;

  beforeAll(() => { projectDir = createTempProject(); });
  afterAll(() => { removeTempProject(projectDir); });

  test('timestamps are consistent across formats', () => {
    const { stdout: isoOut } = run(['current-timestamp', 'iso'], projectDir);
    const { stdout: dateOut } = run(['current-timestamp', 'date'], projectDir);

    const isoData = extractJson(isoOut);
    const dateData = extractJson(dateOut);

    // Date part of ISO should match date-only
    const isoDate = isoData.timestamp.split('T')[0];
    expect(isoDate).toBe(dateData.timestamp);
  });

  test('raw flag returns only the timestamp string', () => {
    const { stdout, code } = run(['current-timestamp', 'date', '--raw'], projectDir);
    expect(code).toBe(0);
    expect(stdout.trim()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

// ============================================================================
// Workflow: save-state persists context
// ============================================================================

describe('Workflow: save-state', () => {
  let projectDir;

  beforeAll(() => { projectDir = createTempProject(); });
  afterAll(() => { removeTempProject(projectDir); });

  test('save-state succeeds and updates HANDOFF.json', () => {
    const { stdout, code } = run(['save-state'], projectDir);
    expect(code).toBe(0);
    expect(stdout).toContain('State saved');

    // Verify HANDOFF.json was updated
    const handoff = JSON.parse(
      fs.readFileSync(path.join(projectDir, '.viepilot', 'HANDOFF.json'), 'utf8')
    );
    expect(handoff.updated_at).toBeDefined();
    expect(handoff.resume_point).toBeDefined();
    expect(handoff.resume_point.node_version).toMatch(/^v\d+/);
  });
});

// ============================================================================
// Workflow: clean --dry-run (safe)
// ============================================================================

describe('Workflow: clean --dry-run', () => {
  let projectDir;

  beforeAll(() => { projectDir = createTempProject(); });
  afterAll(() => { removeTempProject(projectDir); });

  test('dry-run does not remove files', () => {
    const handoffPath = path.join(projectDir, '.viepilot', 'HANDOFF.json');
    expect(fs.existsSync(handoffPath)).toBe(true);

    const { code } = run(['clean', '--dry-run'], projectDir);
    expect(code).toBe(0);

    // File should still exist
    expect(fs.existsSync(handoffPath)).toBe(true);
  });
});

// ============================================================================
// Workflow: error handling
// ============================================================================

describe('Workflow: error handling', () => {
  let projectDir;

  beforeAll(() => { projectDir = createTempProject(); });
  afterAll(() => { removeTempProject(projectDir); });

  test('init fails outside viepilot project', () => {
    const { stderr, code } = run(['init'], os.tmpdir());
    expect(code).toBe(1);
    expect(stderr).toContain('No ViePilot project found');
  });

  test('phase-info fails for non-existent phase', () => {
    const { stderr, code } = run(['phase-info', '99'], projectDir);
    expect(code).toBe(1);
    expect(stderr).toContain('not found');
  });

  test('unknown command suggests alternatives', () => {
    const { stderr, code } = run(['progreess'], projectDir);
    expect(code).toBe(1);
    expect(stderr).toContain('Did you mean');
  });

  test('version bump with invalid type fails gracefully', () => {
    const { stderr, code } = run(['version', 'bump', 'ultra'], projectDir);
    expect(code).toBe(1);
    expect(stderr).toContain('Invalid bump type');
  });
});
