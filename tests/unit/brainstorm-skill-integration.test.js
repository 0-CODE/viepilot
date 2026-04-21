'use strict';

const fs   = require('fs');
const os   = require('os');
const path = require('path');

const { loadRegistry } = require('../../lib/skill-registry.cjs');

function makeTempHome() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'vp-bsi-test-'));
}

function rmrf(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

const BRAINSTORM_MD = fs.readFileSync(
  path.join(__dirname, '../../workflows/brainstorm.md'), 'utf8'
);
const BRAINSTORM_SKILL_MD = fs.readFileSync(
  path.join(__dirname, '../../skills/vp-brainstorm/SKILL.md'), 'utf8'
);

// ─────────────────────────────────────────────────────────────────────────────
// Group 1: workflows/brainstorm.md contracts
// ─────────────────────────────────────────────────────────────────────────────
describe('FEAT-020: workflows/brainstorm.md contracts', () => {
  test('1. contains "Skill Registry Integration"', () => {
    expect(BRAINSTORM_MD).toContain('Skill Registry Integration');
  });

  test('2. contains "FEAT-020"', () => {
    expect(BRAINSTORM_MD).toContain('FEAT-020');
  });

  test('3. contains "get-registry" (BUG-016: shell-executable registry load)', () => {
    expect(BRAINSTORM_MD).toContain('get-registry');
  });

  test('4. contains "skills_used"', () => {
    expect(BRAINSTORM_MD).toContain('skills_used');
  });

  test('5. contains silent apply rule ("silent")', () => {
    expect(BRAINSTORM_MD.toLowerCase()).toContain('silent');
  });

  test('6. contains capability-to-signal mapping table (ui-generation)', () => {
    expect(BRAINSTORM_MD).toContain('ui-generation');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Group 2: skills/vp-brainstorm/SKILL.md contracts
// ─────────────────────────────────────────────────────────────────────────────
describe('FEAT-020: skills/vp-brainstorm/SKILL.md contracts', () => {
  test('7. contains "FEAT-020"', () => {
    expect(BRAINSTORM_SKILL_MD).toContain('FEAT-020');
  });

  test('8. contains "skills_used"', () => {
    expect(BRAINSTORM_SKILL_MD).toContain('skills_used');
  });

  test('9. contains "skill-registry" reference', () => {
    expect(BRAINSTORM_SKILL_MD).toContain('skill-registry');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Group 3: loadRegistry() contracts
// ─────────────────────────────────────────────────────────────────────────────
describe('FEAT-020: loadRegistry() contracts', () => {
  let homeDir;

  beforeEach(() => { homeDir = makeTempHome(); });
  afterEach(() => { rmrf(homeDir); });

  test('10. returns null (no crash) when registry absent', () => {
    const result = loadRegistry(homeDir);
    expect(result).toBeNull();
  });

  test('11. returns parsed object when registry exists', () => {
    const registryDir = path.join(homeDir, '.viepilot');
    fs.mkdirSync(registryDir, { recursive: true });
    const registry = {
      version: '1.0',
      last_scan: new Date().toISOString(),
      scan_paths: [],
      skills: [{ id: 'test-skill', capabilities: ['ui-generation'], tags: [], best_practices: [], adapters: [] }],
    };
    fs.writeFileSync(path.join(registryDir, 'skill-registry.json'), JSON.stringify(registry));
    const result = loadRegistry(homeDir);
    expect(result).not.toBeNull();
    expect(result.skills).toHaveLength(1);
    expect(result.skills[0].id).toBe('test-skill');
  });
});
