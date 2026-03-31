/**
 * Unit tests for vp-tools.cjs validator logic
 * Tests extracted validator behavior via CLI subprocess calls
 */

const { execSync, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const CLI = path.join(__dirname, '../../bin/vp-tools.cjs');
const PROJECT_ROOT = path.join(__dirname, '../..');
const TEST_VP_DIR = path.join(PROJECT_ROOT, '.viepilot');
const TEST_TRACKER = path.join(TEST_VP_DIR, 'TRACKER.md');
const TEST_ROADMAP = path.join(TEST_VP_DIR, 'ROADMAP.md');
const TEST_HANDOFF = path.join(TEST_VP_DIR, 'HANDOFF.json');

// In-process coverage target: lib/cli-shared.cjs (CLI subprocess runs are not instrumented by Jest).
const {
  validators: inProcValidators,
  levenshteinDistance,
  findProjectRoot: inProcFindRoot,
  getProjectSlug,
  getCheckpointTagPrefix,
  isCheckpointTag,
} = require('../../lib/cli-shared.cjs');

function run(args, cwd = PROJECT_ROOT) {
  const result = spawnSync('node', [CLI, ...args], {
    cwd,
    encoding: 'utf8',
    // Force no TTY so color codes are stripped
    env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
  });
  return {
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    code: result.status,
  };
}

/**
 * Extract the last valid top-level JSON value from CLI output.
 * Handles multi-line JSON objects that appear after human-readable status lines.
 * Uses balanced-brace scanning to avoid matching progress bar characters.
 */
function extractJson(stdout) {
  // Strip ANSI escape codes
  const clean = stdout.replace(/\x1b\[[0-9;]*m/g, '');

  // Walk backwards through the string finding the last top-level { ... } block
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
        try {
          return JSON.parse(candidate);
        } catch (e) {
          // Not valid JSON at this position, keep scanning
          depth = 0;
          end = -1;
        }
      }
    }
  }
  throw new Error(`No JSON found in output:\n${stdout}`);
}

let fixtureState = { existed: false, tracker: null, roadmap: null, handoff: null };

beforeAll(() => {
  fixtureState.existed = fs.existsSync(TEST_VP_DIR);
  if (fixtureState.existed) {
    fixtureState.tracker = fs.existsSync(TEST_TRACKER) ? fs.readFileSync(TEST_TRACKER, 'utf8') : null;
    fixtureState.roadmap = fs.existsSync(TEST_ROADMAP) ? fs.readFileSync(TEST_ROADMAP, 'utf8') : null;
    fixtureState.handoff = fs.existsSync(TEST_HANDOFF) ? fs.readFileSync(TEST_HANDOFF, 'utf8') : null;
  }

  fs.mkdirSync(TEST_VP_DIR, { recursive: true });
  if (!fs.existsSync(TEST_TRACKER)) {
    fs.writeFileSync(
      TEST_TRACKER,
      '# Tracker\n\n### Current Version\n```\n1.1.0\n```\n',
      'utf8'
    );
  }
  if (!fs.existsSync(TEST_ROADMAP)) {
    fs.writeFileSync(TEST_ROADMAP, '# Roadmap\n', 'utf8');
  }
  if (!fs.existsSync(TEST_HANDOFF)) {
    fs.writeFileSync(TEST_HANDOFF, '{}\n', 'utf8');
  }
});

afterAll(() => {
  if (fixtureState.existed) {
    if (fixtureState.tracker !== null) fs.writeFileSync(TEST_TRACKER, fixtureState.tracker, 'utf8');
    if (fixtureState.roadmap !== null) fs.writeFileSync(TEST_ROADMAP, fixtureState.roadmap, 'utf8');
    if (fixtureState.handoff !== null) fs.writeFileSync(TEST_HANDOFF, fixtureState.handoff, 'utf8');
    return;
  }

  if (fs.existsSync(TEST_VP_DIR)) {
    fs.rmSync(TEST_VP_DIR, { recursive: true, force: true });
  }
});

// ============================================================================
// current-timestamp
// ============================================================================

describe('current-timestamp', () => {
  test('returns ISO timestamp by default', () => {
    const { stdout, code } = run(['current-timestamp']);
    expect(code).toBe(0);
    const data = extractJson(stdout);
    expect(data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  test('returns date-only with "date" format', () => {
    const { stdout, code } = run(['current-timestamp', 'date']);
    expect(code).toBe(0);
    const data = extractJson(stdout);
    expect(data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('returns full timestamp with "full" format', () => {
    const { stdout, code } = run(['current-timestamp', 'full']);
    expect(code).toBe(0);
    const data = extractJson(stdout);
    expect(data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
  });

  test('--raw flag outputs raw string only', () => {
    const { stdout, code } = run(['current-timestamp', 'iso', '--raw']);
    expect(code).toBe(0);
    const trimmed = stdout.trim();
    expect(trimmed).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(trimmed).not.toContain('{');
  });

  test('rejects invalid format', () => {
    const { stderr, code } = run(['current-timestamp', 'invalid']);
    expect(code).toBe(1);
    expect(stderr).toContain('Invalid timestamp format');
  });
});

// ============================================================================
// task-status (validation only — no filesystem writes needed)
// ============================================================================

describe('task-status validation', () => {
  test('rejects missing phase argument', () => {
    const { stderr, code } = run(['task-status']);
    expect(code).toBe(1);
    expect(stderr).toContain('required');
  });

  test('rejects invalid status', () => {
    const { stderr, code } = run(['task-status', '1', '1', 'invalid_status']);
    expect(code).toBe(1);
    expect(stderr).toContain('Invalid status');
  });

  test('accepts valid status "done"', () => {
    const { stdout, code } = run(['task-status', '1', '1', 'done']);
    expect(code).toBe(0);
    const data = extractJson(stdout);
    expect(data.updated).toBe(true);
    expect(data.status).toBe('done');
  });

  test('accepts valid status "in_progress"', () => {
    const { stdout, code } = run(['task-status', '2', '3', 'in_progress']);
    expect(code).toBe(0);
    const data = extractJson(stdout);
    expect(data.phase).toBe(2);
    expect(data.task).toBe(3);
    expect(data.status).toBe('in_progress');
  });

  test('accepts all valid statuses', () => {
    const validStatuses = ['not_started', 'in_progress', 'done', 'skipped', 'blocked'];
    for (const s of validStatuses) {
      const { code } = run(['task-status', '1', '1', s]);
      expect(code).toBe(0);
    }
  });

  test('rejects non-integer phase', () => {
    const { stderr, code } = run(['task-status', 'abc', '1', 'done']);
    expect(code).toBe(1);
    expect(stderr).toContain('positive integer');
  });
});

// ============================================================================
// commit
// ============================================================================

describe('commit', () => {
  test('rejects empty message', () => {
    const { stderr, code } = run(['commit', '']);
    expect(code).toBe(1);
    expect(stderr).toContain('cannot be empty');
  });

  test('rejects missing message', () => {
    const { stderr, code } = run(['commit']);
    expect(code).toBe(1);
    expect(stderr).toContain('cannot be empty');
  });

  test('returns git command structure', () => {
    const { stdout, code } = run(['commit', 'feat(cli): add tests']);
    expect(code).toBe(0);
    const data = extractJson(stdout);
    expect(data.command).toBe('git');
    expect(data.args).toContain('-m');
    expect(data.args).toContain('feat(cli): add tests');
  });

  test('includes files when --files provided', () => {
    const { stdout, code } = run(['commit', 'fix(core): bug', '--files', 'foo.js', 'bar.js']);
    expect(code).toBe(0);
    const data = extractJson(stdout);
    expect(data.files).toContain('foo.js');
    expect(data.files).toContain('bar.js');
  });
});

// ============================================================================
// version
// ============================================================================

describe('version', () => {
  test('gets current version', () => {
    const { stdout, code } = run(['version', 'get']);
    expect(code).toBe(0);
    const data = extractJson(stdout);
    expect(data.version).toMatch(/^\d+\.\d+\.\d+/);
  });

  test('version with no args defaults to get', () => {
    const { stdout, code } = run(['version']);
    expect(code).toBe(0);
    const data = extractJson(stdout);
    expect(data.version).toBeDefined();
  });

  test('bumps patch version correctly', () => {
    const { stdout, code } = run(['version', 'bump', 'patch']);
    expect(code).toBe(0);
    const data = extractJson(stdout);
    expect(data.bump_type).toBe('patch');
    expect(data.new_version).toMatch(/^\d+\.\d+\.\d+$/);
    const [oldMajor, oldMinor, oldPatch] = data.old_version.split('.').map(Number);
    const [newMajor, newMinor, newPatch] = data.new_version.split('.').map(Number);
    expect(newPatch).toBe(oldPatch + 1);
    expect(newMinor).toBe(oldMinor);
    expect(newMajor).toBe(oldMajor);
  });

  test('bumps minor version and resets patch', () => {
    const { stdout, code } = run(['version', 'bump', 'minor']);
    expect(code).toBe(0);
    const data = extractJson(stdout);
    const [, , newPatch] = data.new_version.split('.').map(Number);
    expect(newPatch).toBe(0);
    expect(data.bump_type).toBe('minor');
  });

  test('bumps major version and resets minor/patch', () => {
    const { stdout, code } = run(['version', 'bump', 'major']);
    expect(code).toBe(0);
    const data = extractJson(stdout);
    const [, newMinor, newPatch] = data.new_version.split('.').map(Number);
    expect(newMinor).toBe(0);
    expect(newPatch).toBe(0);
  });

  test('rejects invalid bump type', () => {
    const { stderr, code } = run(['version', 'bump', 'superversion']);
    expect(code).toBe(1);
    expect(stderr).toContain('Invalid bump type');
  });
});

// ============================================================================
// tag-prefix
// ============================================================================

describe('tag-prefix', () => {
  test('returns project-scoped prefix', () => {
    const { stdout, code } = run(['tag-prefix']);
    expect(code).toBe(0);
    const data = extractJson(stdout);
    expect(data.prefix).toMatch(/^[a-z0-9-]+-vp$/);
  });

  test('returns raw prefix with --raw', () => {
    const { stdout, code } = run(['tag-prefix', '--raw']);
    expect(code).toBe(0);
    expect(stdout.trim()).toMatch(/^[a-z0-9-]+-vp$/);
  });
});

// ============================================================================
// git-persistence
// ============================================================================

describe('git-persistence', () => {
  test('returns persistence gate status payload', () => {
    const { stdout, code } = run(['git-persistence']);
    expect(code).toBe(0);
    const data = extractJson(stdout);
    expect(typeof data.clean_worktree).toBe('boolean');
    expect(typeof data.upstream_configured).toBe('boolean');
    expect(data).toHaveProperty('ahead_count');
    expect(typeof data.ready_for_persisted_pass).toBe('boolean');
  });
});

// ============================================================================
// help
// ============================================================================

describe('help', () => {
  test('shows help with no args', () => {
    const { stdout, code } = run([]);
    expect(code).toBe(0);
    expect(stdout).toContain('ViePilot CLI Tools');
    expect(stdout).toContain('Commands:');
  });

  test('shows help with "help" command', () => {
    const { stdout, code } = run(['help']);
    expect(code).toBe(0);
    expect(stdout).toContain('Commands:');
  });

  test('shows specific command help', () => {
    const { stdout, code } = run(['help', 'version']);
    expect(code).toBe(0);
    expect(stdout).toContain('version');
    expect(stdout).toContain('Usage:');
    expect(stdout).toContain('Examples:');
  });
});

// ============================================================================
// Unknown command
// ============================================================================

describe('unknown command', () => {
  test('exits with code 1 for unknown command', () => {
    const { code, stderr } = run(['nonexistent_command_xyz']);
    expect(code).toBe(1);
    expect(stderr).toContain('Unknown command');
  });

  test('suggests similar command', () => {
    const { stderr, code } = run(['versoin']);
    expect(code).toBe(1);
    // Should suggest "version" via Levenshtein
    expect(stderr).toContain('Did you mean');
  });
});

// ============================================================================
// init & progress (project-dependent)
// ============================================================================

describe('init (project root detection)', () => {
  test('finds project root from project directory', () => {
    const { stdout, code } = run(['init']);
    expect(code).toBe(0);
    const data = extractJson(stdout);
    expect(data.project_root).toBeTruthy();
    expect(data.tracker_exists).toBe(true);
    expect(data.roadmap_exists).toBe(true);
  });

  test('fails when run outside a viepilot project', () => {
    const { stderr, code } = run(['init'], os.tmpdir());
    expect(code).toBe(1);
    expect(stderr).toContain('No ViePilot project found');
  });
});

describe('progress', () => {
  test('returns phase progress data', () => {
    const { stdout, code } = run(['progress']);
    expect(code).toBe(0);
    const data = extractJson(stdout);
    expect(Array.isArray(data.phases)).toBe(true);
    expect(typeof data.overall).toBe('number');
    expect(data.overall).toBeGreaterThanOrEqual(0);
    expect(data.overall).toBeLessThanOrEqual(100);
  });
});

// ============================================================================
// clean --dry-run (safe, non-destructive)
// ============================================================================

describe('clean --dry-run', () => {
  test('does not delete files in dry-run mode', () => {
    const { stdout, code } = run(['clean', '--dry-run']);
    expect(code).toBe(0);
    expect(stdout).toContain('Dry run');
  });
});

// ============================================================================
// In-process module paths (Jest coverage for bin/vp-tools.cjs)
// ============================================================================

describe('vp-tools validators (in-process)', () => {
  test('isPositiveInteger', () => {
    expect(inProcValidators.isPositiveInteger('3', 'n').valid).toBe(true);
    expect(inProcValidators.isPositiveInteger('0', 'n').valid).toBe(false);
    expect(inProcValidators.isPositiveInteger('x', 'n').valid).toBe(false);
  });

  test('isValidStatus', () => {
    expect(inProcValidators.isValidStatus('done').valid).toBe(true);
    expect(inProcValidators.isValidStatus('invalid').valid).toBe(false);
  });

  test('isValidTimestampFormat', () => {
    expect(inProcValidators.isValidTimestampFormat('iso').valid).toBe(true);
    expect(inProcValidators.isValidTimestampFormat('bad').valid).toBe(false);
  });

  test('isValidBumpType', () => {
    expect(inProcValidators.isValidBumpType('patch').valid).toBe(true);
    expect(inProcValidators.isValidBumpType('major').valid).toBe(true);
    expect(inProcValidators.isValidBumpType('nope').valid).toBe(false);
  });

  test('isNonEmptyString', () => {
    expect(inProcValidators.isNonEmptyString(' x ', 'm').valid).toBe(true);
    expect(inProcValidators.isNonEmptyString('   ', 'm').valid).toBe(false);
    expect(inProcValidators.isNonEmptyString('', 'm').valid).toBe(false);
  });

  test('requireProjectRoot when cwd is project', () => {
    const prev = process.cwd();
    try {
      process.chdir(PROJECT_ROOT);
      const r = inProcValidators.requireProjectRoot();
      expect(r.valid).toBe(true);
      expect(path.resolve(r.value)).toBe(path.resolve(PROJECT_ROOT));
      expect(path.resolve(inProcFindRoot())).toBe(path.resolve(PROJECT_ROOT));
    } finally {
      process.chdir(prev);
    }
  });

  test('requireProjectRoot fails outside project tree', () => {
    const prev = process.cwd();
    try {
      process.chdir(os.tmpdir());
      const r = inProcValidators.requireProjectRoot();
      expect(r.valid).toBe(false);
    } finally {
      process.chdir(prev);
    }
  });

  test('levenshteinDistance', () => {
    expect(levenshteinDistance('version', 'versoin')).toBeLessThanOrEqual(2);
    expect(levenshteinDistance('', 'a')).toBe(1);
    expect(levenshteinDistance('a', '')).toBe(1);
  });

  test('project slug + checkpoint prefix helpers', () => {
    const slug = getProjectSlug(PROJECT_ROOT);
    const prefix = getCheckpointTagPrefix(PROJECT_ROOT);
    expect(slug).toMatch(/^[a-z0-9-]+$/);
    expect(prefix).toBe(`${slug}-vp`);
  });

  test('checkpoint tag matcher supports legacy and project-scoped formats', () => {
    expect(isCheckpointTag('vp-p2-t3')).toBe(true);
    expect(isCheckpointTag('vp-p2-t3-done')).toBe(true);
    expect(isCheckpointTag('vp-p2-complete')).toBe(true);
    expect(isCheckpointTag('viepilot-vp-p2-t3')).toBe(true);
    expect(isCheckpointTag('viepilot-vp-p2-complete')).toBe(true);
    expect(isCheckpointTag('v1.2.0')).toBe(false);
  });
});
