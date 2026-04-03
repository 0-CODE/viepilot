/**
 * ENH-022: domain entity manifest + dependency validation (integration).
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const {
  runEnh022DependencyCheck,
  parseDomainEntityManifest,
  taskReferencesEntity,
} = require('../../lib/crystallize-dependency-validate.cjs');

function readFixture(name, file) {
  return fs.readFileSync(
    path.join(ROOT, 'tests/fixtures', name, '.viepilot', file),
    'utf8'
  );
}

function readWorkflow(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

describe('ENH-022 runEnh022DependencyCheck (fixtures)', () => {
  test('gap fixture: MISSING Invoice + task reference → dependency gap', () => {
    const specMd = readFixture('enh022-gap', 'SPEC.md');
    const roadmapMd = readFixture('enh022-gap', 'ROADMAP.md');
    const gaps = runEnh022DependencyCheck({ specMd, roadmapMd });
    expect(gaps.length).toBe(1);
    expect(gaps[0].entity).toBe('Invoice');
    expect(gaps[0].gapType).toBe('MISSING service phase');
    expect(gaps[0].matchedPatterns.length).toBeGreaterThan(0);
  });

  test('ok fixture: service phase present → no gaps', () => {
    const specMd = readFixture('enh022-ok', 'SPEC.md');
    const roadmapMd = readFixture('enh022-ok', 'ROADMAP.md');
    const gaps = runEnh022DependencyCheck({ specMd, roadmapMd });
    expect(gaps).toEqual([]);
  });

  test('needs_crud_api no: no gap even if MISSING-ish label on N/A row', () => {
    const specMd = [
      '## Domain Entity Manifest',
      '',
      '| Entity | Type | needs_crud_api | Service Phase | Status |',
      '|--------|------|---------------|---------------|--------|',
      '| ConfigFlag | reference | no | — | N/A |',
      '',
    ].join('\n');
    const roadmap = 'Task: resolve ConfigFlag at runtime';
    const gaps = runEnh022DependencyCheck({ specMd, roadmapMd: roadmap });
    expect(gaps).toEqual([]);
  });
});

describe('ENH-022 parseDomainEntityManifest', () => {
  test('parses standard table', () => {
    const md = readFixture('enh022-gap', 'SPEC.md');
    const rows = parseDomainEntityManifest(md);
    expect(rows).toHaveLength(1);
    expect(rows[0].entity).toBe('Invoice');
    expect(rows[0].needs_crud_api).toBe('yes');
  });
});

describe('ENH-022 taskReferencesEntity', () => {
  test('matches enrich Device', () => {
    expect(taskReferencesEntity('Device', 'Phase task: enrich device payload')).toBe(true);
  });

  test('matches TenantService token', () => {
    expect(taskReferencesEntity('Tenant', 'Wire TenantService client')).toBe(true);
  });
});

describe('ENH-022 crystallize.md contracts', () => {
  test('Step 6A and 11A present with dependency patterns', () => {
    const w = readWorkflow('workflows/crystallize.md');
    expect(w).toMatch(/Step 6A: Domain Entity Extraction/);
    expect(w).toMatch(/## Domain Entity Manifest/);
    expect(w).toMatch(/needs_crud_api/);
    expect(w).toMatch(/Step 11A: Dependency Validation/);
    expect(w).toMatch(/resolve \{entity\}/);
    expect(w).toMatch(/enrich \{entity\}/);
    expect(w).toMatch(/\{entity\}Service/);
  });
});
