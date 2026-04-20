'use strict';

const fs   = require('fs');
const os   = require('os');
const path = require('path');

const { scanSkills, loadRegistry, parseSkillMd } = require('../../lib/skill-registry.cjs');

// Temp home dir for isolation
function makeTempHome() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'vp-skill-test-'));
}

function rmrf(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

// Helper: create a fake skill dir with optional SKILL.md content
function createFakeSkill(skillsDir, skillId, mdContent) {
  const dir = path.join(skillsDir, skillId);
  fs.mkdirSync(dir, { recursive: true });
  if (mdContent !== undefined) {
    fs.writeFileSync(path.join(dir, 'SKILL.md'), mdContent, 'utf8');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Group 1: parseSkillMd — extended format
// ─────────────────────────────────────────────────────────────────────────────
describe('FEAT-020: parseSkillMd — extended format', () => {
  const md = `# Frontend Design
A design guidance skill.

## Capabilities
- ui-generation
- component-design

## Tags
ui, design, frontend

## Best Practices
- Mobile-first
- Design tokens
`;

  test('(1) extracts description from first non-heading line', () => {
    const r = parseSkillMd(md);
    expect(r.description).toBe('A design guidance skill.');
  });

  test('(2) parses ## Capabilities into array', () => {
    const r = parseSkillMd(md);
    expect(r.capabilities).toEqual(['ui-generation', 'component-design']);
  });

  test('(3) parses ## Tags (comma-separated) into array', () => {
    const r = parseSkillMd(md);
    expect(r.tags).toEqual(['ui', 'design', 'frontend']);
  });

  test('(4) parses ## Tags (one-per-line) into array', () => {
    const multiLineTags = `# Skill\n\n## Tags\n- alpha\n- beta\n- gamma\n`;
    const r = parseSkillMd(multiLineTags);
    expect(r.tags).toEqual(['alpha', 'beta', 'gamma']);
  });

  test('(5) parses ## Best Practices into array', () => {
    const r = parseSkillMd(md);
    expect(r.best_practices).toEqual(['Mobile-first', 'Design tokens']);
  });

  test('(6) all three sections present → all fields populated', () => {
    const r = parseSkillMd(md);
    expect(r.capabilities.length).toBeGreaterThan(0);
    expect(r.tags.length).toBeGreaterThan(0);
    expect(r.best_practices.length).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Group 2: parseSkillMd — legacy format (backward compat)
// ─────────────────────────────────────────────────────────────────────────────
describe('FEAT-020: parseSkillMd — legacy format', () => {
  test('(7) legacy SKILL.md (no extended sections) → capabilities=[]', () => {
    const r = parseSkillMd('# Old Skill\nThis is a legacy skill without extended sections.');
    expect(r.capabilities).toEqual([]);
  });

  test('(8) legacy SKILL.md → tags=[]', () => {
    const r = parseSkillMd('# Old Skill\nLegacy.');
    expect(r.tags).toEqual([]);
  });

  test('(9) legacy SKILL.md → best_practices=[]', () => {
    const r = parseSkillMd('# Old Skill\nLegacy.');
    expect(r.best_practices).toEqual([]);
  });

  test('(10) empty SKILL.md → no throw, all fields empty', () => {
    expect(() => parseSkillMd('')).not.toThrow();
    const r = parseSkillMd('');
    expect(Array.isArray(r.capabilities)).toBe(true);
    expect(Array.isArray(r.tags)).toBe(true);
    expect(Array.isArray(r.best_practices)).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Group 3: scanSkills — basic structure
// ─────────────────────────────────────────────────────────────────────────────
describe('FEAT-020: scanSkills — basic structure', () => {
  let home;
  beforeEach(() => { home = makeTempHome(); });
  afterEach(() => { rmrf(home); });

  test('(11) scanSkills() returns object with version, last_scan, scan_paths, skills', () => {
    const r = scanSkills(home);
    expect(r.version).toBe('1.0');
    expect(typeof r.last_scan).toBe('string');
    expect(Array.isArray(r.scan_paths)).toBe(true);
    expect(Array.isArray(r.skills)).toBe(true);
  });

  test('(12) scanSkills() skips adapter dirs that do not exist (no crash)', () => {
    expect(() => scanSkills(home)).not.toThrow();
  });

  test('(13) scanSkills() returns empty skills array when no skills installed', () => {
    const r = scanSkills(home);
    expect(r.skills).toEqual([]);
  });

  test('(14) scanSkills() indexes a skill with extended SKILL.md', () => {
    const claudeSkillsDir = path.join(home, '.claude', 'skills');
    createFakeSkill(claudeSkillsDir, 'my-skill', `# My Skill\nA test.\n\n## Capabilities\n- test-cap\n\n## Tags\ntesting\n\n## Best Practices\n- Do good\n`);
    const r = scanSkills(home);
    const skill = r.skills.find(s => s.id === 'my-skill');
    expect(skill).toBeTruthy();
    expect(skill.capabilities).toContain('test-cap');
    expect(skill.tags).toContain('testing');
    expect(skill.best_practices).toContain('Do good');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Group 4: scanSkills — deduplication
// ─────────────────────────────────────────────────────────────────────────────
describe('FEAT-020: scanSkills — deduplication', () => {
  let home;
  beforeEach(() => { home = makeTempHome(); });
  afterEach(() => { rmrf(home); });

  test('(15) same skill in two adapter dirs → single registry entry', () => {
    const claudeDir = path.join(home, '.claude', 'skills');
    const cursorDir = path.join(home, '.cursor', 'skills');
    createFakeSkill(claudeDir, 'shared-skill', '# Shared\nA shared skill.');
    createFakeSkill(cursorDir, 'shared-skill', '# Shared\nA shared skill.');
    const r = scanSkills(home);
    const entries = r.skills.filter(s => s.id === 'shared-skill');
    expect(entries.length).toBe(1);
  });

  test('(16) merged entry lists both adapters in adapters[]', () => {
    const claudeDir = path.join(home, '.claude', 'skills');
    const cursorDir = path.join(home, '.cursor', 'skills');
    createFakeSkill(claudeDir, 'shared-skill', '# Shared');
    createFakeSkill(cursorDir, 'shared-skill', '# Shared');
    const r = scanSkills(home);
    const skill = r.skills.find(s => s.id === 'shared-skill');
    expect(skill.adapters).toContain('claude-code');
    expect(skill.adapters).toContain('cursor');
  });

  test('(17) merged entry has installed_paths for both adapters', () => {
    const claudeDir = path.join(home, '.claude', 'skills');
    const cursorDir = path.join(home, '.cursor', 'skills');
    createFakeSkill(claudeDir, 'shared-skill', '# Shared');
    createFakeSkill(cursorDir, 'shared-skill', '# Shared');
    const r = scanSkills(home);
    const skill = r.skills.find(s => s.id === 'shared-skill');
    expect(skill.installed_paths['claude-code']).toBeTruthy();
    expect(skill.installed_paths['cursor']).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Group 5: Registry persistence
// ─────────────────────────────────────────────────────────────────────────────
describe('FEAT-020: registry persistence', () => {
  let home;
  beforeEach(() => { home = makeTempHome(); });
  afterEach(() => { rmrf(home); });

  test('(18) scanSkills() writes skill-registry.json to ~/.viepilot/', () => {
    scanSkills(home);
    const registryPath = path.join(home, '.viepilot', 'skill-registry.json');
    expect(fs.existsSync(registryPath)).toBe(true);
  });

  test('(19) loadRegistry() reads and returns the written registry', () => {
    scanSkills(home);
    const r = loadRegistry(home);
    expect(r).not.toBeNull();
    expect(r.version).toBe('1.0');
    expect(Array.isArray(r.skills)).toBe(true);
  });

  test('(20) loadRegistry() returns null if registry does not exist', () => {
    const r = loadRegistry(home);
    expect(r).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Group 6: CLI integration
// ─────────────────────────────────────────────────────────────────────────────
describe('FEAT-020: CLI integration', () => {
  const REPO_ROOT = path.join(__dirname, '..', '..');

  test('(21) bin/viepilot.cjs --help includes scan-skills', () => {
    const { execSync } = require('child_process');
    const help = execSync(`node ${path.join(REPO_ROOT, 'bin', 'viepilot.cjs')} --help`).toString();
    expect(help).toContain('scan-skills');
  });

  test('(22) bin/viepilot.cjs --help includes list-skills', () => {
    const { execSync } = require('child_process');
    const help = execSync(`node ${path.join(REPO_ROOT, 'bin', 'viepilot.cjs')} --help`).toString();
    expect(help).toContain('list-skills');
  });
});
