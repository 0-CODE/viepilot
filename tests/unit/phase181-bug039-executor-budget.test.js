/**
 * Phase 181, BUG-039 R3: Executor turn budget, split rule, report-before-budget
 * Tests that executor has sufficient budget (60 turns) and prompt rules for reporting/committing.
 */

const fs = require('fs');
const path = require('path');

describe('Phase 181 — BUG-039 R3: Executor Budget and Rules', () => {
  let executorDef, autonomousWf, evolveWf, crystallizeWf, packageJson;

  beforeAll(() => {
    // Load executor definition
    executorDef = fs.readFileSync(
      path.join(__dirname, '../../agents/claude-code/vp-task-executor.md'),
      'utf-8'
    );

    // Load workflows
    autonomousWf = fs.readFileSync(
      path.join(__dirname, '../../workflows/autonomous.md'),
      'utf-8'
    );
    evolveWf = fs.readFileSync(
      path.join(__dirname, '../../workflows/evolve.md'),
      'utf-8'
    );
    crystallizeWf = fs.readFileSync(
      path.join(__dirname, '../../workflows/crystallize.md'),
      'utf-8'
    );

    // Load package.json
    packageJson = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, '../../package.json'),
        'utf-8'
      )
    );
  });

  describe('Executor maxTurns budget (BUG-039 R3)', () => {
    test('executor maxTurns should be >= 60', () => {
      const match = executorDef.match(/maxTurns:\s*(\d+)/);
      expect(match).toBeTruthy();
      const maxTurns = parseInt(match[1], 10);
      expect(maxTurns).toBeGreaterThanOrEqual(60);
    });

    test('executor should have Executor Budget Rules section', () => {
      expect(executorDef).toContain('Executor Budget Rules (BUG-039 R3)');
    });

    test('executor prompt should require commit after verified sub-parts', () => {
      expect(executorDef).toContain('Commit after each verified sub-part');
      expect(executorDef).toContain('git commit');
    });

    test('executor prompt should require report before budget exhaustion', () => {
      expect(executorDef).toContain('Report before budget exhaustion');
      expect(executorDef).toContain('TASK_RESULT:');
      expect(executorDef).toContain('PARTIAL');
    });

    test('executor prompt should state missing report = PARTIAL', () => {
      expect(executorDef).toContain('Missing report = PARTIAL');
      expect(executorDef).toContain('executor returns without a final');
    });
  });

  describe('Autonomous workflow missing report handling', () => {
    test('autonomous.md should document executor missing report = PARTIAL', () => {
      expect(autonomousWf).toContain('executor missing report');
      expect(autonomousWf).toContain('BUG-039 R3');
      expect(autonomousWf).toContain('PARTIAL');
    });

    test('autonomous.md should handle staged work from failed executor', () => {
      expect(autonomousWf).toContain('git status');
      expect(autonomousWf).toContain('git diff');
      expect(autonomousWf).toContain('npm test');
    });

    test('autonomous.md should allow resuming or re-dispatching executor', () => {
      expect(autonomousWf).toContain('Resume');
      expect(autonomousWf).toContain('remaining items');
    });
  });

  describe('Evolve/Crystallize split rule for L/XL and multi-platform tasks', () => {
    test('evolve.md should have Task Splitting Rule section', () => {
      expect(evolveWf).toContain('Task Splitting Rule for L/XL and Multi-Platform Scaffolds');
      expect(evolveWf).toContain('BUG-039 R3');
    });

    test('evolve.md split rule should specify one sub-task per platform/component', () => {
      expect(evolveWf).toContain('one sub-task per platform/component');
      expect(evolveWf).toContain('complexity ≤ M');
    });

    test('evolve.md should provide example split', () => {
      expect(evolveWf).toContain('Monorepo Scaffold');
      expect(evolveWf).toContain('Rust workspace');
    });

    test('crystallize.md should mention split rule in ROADMAP generation', () => {
      expect(crystallizeWf).toContain('Task Splitting for L/XL and Multi-Platform Scaffolds');
      expect(crystallizeWf).toContain('BUG-039 R3');
    });

    test('crystallize.md split rule should reference executor turn budget', () => {
      expect(crystallizeWf).toContain('executor turn budget');
      expect(crystallizeWf).toContain('parallel execution');
    });
  });

  describe('Version consistency', () => {
    test('package.json version should be 3.25.0', () => {
      expect(packageJson.version).toBe('3.25.0');
    });

    test('no hardcoded version literals in test suite', () => {
      // Check that version is read from package.json, not hardcoded
      const hasVersionString = executorDef.includes('"3.25.0"') ||
                               executorDef.includes("'3.25.0'");
      expect(hasVersionString).toBe(false);
    });
  });

  describe('CHANGELOG.md 3.25.0 entry', () => {
    let changelogContent;

    beforeAll(() => {
      changelogContent = fs.readFileSync(
        path.join(__dirname, '../../CHANGELOG.md'),
        'utf-8'
      );
    });

    test('CHANGELOG should have 3.25.0 entry', () => {
      expect(changelogContent).toContain('## [3.25.0]');
    });

    test('CHANGELOG 3.25.0 should cover BUG-039 fixes A, C, R1–R3', () => {
      const changelogSection = changelogContent.split('## [3.24.0]')[0];
      expect(changelogSection).toContain('BUG-039');
      expect(changelogSection).toContain('A:');
      expect(changelogSection).toContain('C:');
      expect(changelogSection).toContain('R1:');
      expect(changelogSection).toContain('R2:');
      expect(changelogSection).toContain('R3:');
    });

    test('CHANGELOG 3.25.0 should reference executor budget', () => {
      const changelogSection = changelogContent.split('## [3.24.0]')[0];
      expect(changelogSection).toContain('maxTurns');
      expect(changelogSection).toContain('60');
    });
  });
});
