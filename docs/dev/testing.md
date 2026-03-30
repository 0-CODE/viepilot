# Testing Guide

ViePilot có 3 loại tests, tổng cộng **194 tests**.

## Test Structure

```
tests/
├── unit/
│   ├── validators.test.js          # 30 tests — CLI command behavior
│   └── ai-provider-compat.test.js  # 142 tests — Skill/workflow structure
└── integration/
    └── workflow.test.js            # 22 tests — End-to-end workflows
```

## Running Tests

```bash
# All tests
npm test

# With coverage report
npm run test:coverage

# Watch mode (re-runs on file change)
npm run test:watch

# Specific suite
npx jest tests/unit/validators.test.js
npx jest tests/integration/workflow.test.js

# Verbose output
npx jest --verbose
```

## Test Suites

### Unit Tests — `tests/unit/validators.test.js`

Tests CLI commands via subprocess spawning (black-box approach).

**Covers**:
- `current-timestamp` — all formats, `--raw` flag, invalid format rejection
- `task-status` — all valid statuses, invalid input rejection
- `commit` — message validation, `--files` flag
- `version` — get, bump (patch/minor/major), invalid type rejection
- `help` — general and command-specific help
- `init` — project root detection, failure outside project
- `progress` — phase data structure
- `clean --dry-run` — non-destructive behavior
- Unknown command — Levenshtein suggestion

**Helper**: `extractJson(stdout)` — strips ANSI codes, finds last JSON block

### AI Provider Compatibility — `tests/unit/ai-provider-compat.test.js`

Validates skill and workflow files conform to structure required by AI providers.

**Covers**:
- All 13 skill files have required XML-like sections
- `<cursor_skill_adapter>` with Skill Invocation + Tool Usage
- `<execution_context>` or inline `<process>` (both valid)
- Referenced workflows exist on disk
- `<success_criteria>` has at least one checkbox
- All 11 workflow files have `<purpose>`, `<process>`, named `<step>`, `<success_criteria>`
- Steps are properly closed (open count == close count)
- UTF-8 validity, no binary content
- Naming conventions (vp-{name}, kebab-case)
- Portable paths (no hardcoded `/Users/` in execution_context)
- Template `{{PLACEHOLDER}}` format

### Integration Tests — `tests/integration/workflow.test.js`

End-to-end tests using isolated temp project directories.

**Covers**:
- Project initialization workflow
- Task lifecycle: `not_started → in_progress → done`
- Version management sequence
- Commit command structure
- Timestamp consistency across formats
- `save-state` persistence (HANDOFF.json updated)
- `clean --dry-run` safety
- Error handling and graceful failures

**Setup**: Each test suite creates a fresh temp dir with minimal `.viepilot/` structure.

## Writing New Tests

### Unit Test Pattern

```javascript
const { spawnSync } = require('child_process');
const CLI = path.join(__dirname, '../../bin/vp-tools.cjs');

function run(args, cwd = PROJECT_ROOT) {
  return spawnSync('node', [CLI, ...args], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, NO_COLOR: '1' },
  });
}

test('my command returns expected output', () => {
  const { stdout, code } = run(['my-command', 'arg']);
  expect(code).toBe(0);
  const data = extractJson(stdout);
  expect(data.field).toBe('expected');
});
```

### Integration Test Pattern

```javascript
function createTempProject() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-test-'));
  // Create minimal .viepilot/ structure
  fs.mkdirSync(path.join(dir, '.viepilot'), { recursive: true });
  // Write TRACKER.md, ROADMAP.md, HANDOFF.json
  return dir;
}

describe('My workflow', () => {
  let projectDir;
  beforeAll(() => { projectDir = createTempProject(); });
  afterAll(() => { fs.rmSync(projectDir, { recursive: true }); });

  test('workflow step works', () => {
    const { stdout, code } = run(['command'], projectDir);
    expect(code).toBe(0);
  });
});
```

### AI Compatibility Test Pattern

New skills are automatically picked up by `getSkillFiles()` — no test changes needed. The existing test suite validates all `skills/vp-*/SKILL.md` files.

## Coverage

```bash
npm run test:coverage
```

Coverage is collected from `bin/vp-tools.cjs`.

**Threshold**: ≥ 80% line coverage (enforced in CI).

**Report formats**: text (console) + lcov (HTML, uploaded as CI artifact).

## CI Integration

Tests run automatically on every push and PR via GitHub Actions:

```yaml
# .github/workflows/ci.yml
jobs:
  test:
    strategy:
      matrix:
        node-version: [18, 20, 22]
    steps:
      - run: npx jest tests/unit/ --no-coverage
      - run: npx jest tests/integration/ --no-coverage

  coverage:
    steps:
      - run: npx jest --coverage
```

Coverage artifact is available for 7 days after each run.
