'use strict';

const fs   = require('fs');
const os   = require('os');
const path = require('path');

const { detectChannel, installSkill, uninstallSkill, updateSkill } = require('../../lib/skill-installer.cjs');

function makeTempHome() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'vp-installer-test-'));
}

function rmrf(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

// Build a minimal fake adapter dirs structure inside a temp home.
// We mock listAdapters by pointing the claude-code skillsDir to a known path.
function makeClaudeSkillsDir(homeDir) {
  const skillsDir = path.join(homeDir, '.claude', 'skills');
  fs.mkdirSync(skillsDir, { recursive: true });
  return skillsDir;
}

function createLocalSkill(srcDir, skillId, mdContent = '# Test Skill\n## Capabilities\n- test\n') {
  const skillDir = path.join(srcDir, skillId);
  fs.mkdirSync(skillDir, { recursive: true });
  fs.writeFileSync(path.join(skillDir, 'SKILL.md'), mdContent, 'utf8');
  return skillDir;
}

// ─────────────────────────────────────────────────────────────────────────────
// Group 1: detectChannel
// ─────────────────────────────────────────────────────────────────────────────
describe('FEAT-020: detectChannel', () => {
  test('1. "npm:@org/pkg" → npm', () => {
    expect(detectChannel('npm:@org/pkg')).toBe('npm');
  });

  test('2. "@org/pkg" bare npm name → npm', () => {
    expect(detectChannel('@org/pkg')).toBe('npm');
  });

  test('3. "github:org/repo" → github', () => {
    expect(detectChannel('github:org/repo')).toBe('github');
  });

  test('4. "./local" → local', () => {
    expect(detectChannel('./local')).toBe('local');
  });

  test('5. "/abs/path" → local', () => {
    expect(detectChannel('/abs/path')).toBe('local');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Group 2: installSkill — local channel
// ─────────────────────────────────────────────────────────────────────────────
describe('FEAT-020: installSkill — local channel', () => {
  let homeDir, srcBase;

  beforeEach(() => {
    homeDir = makeTempHome();
    srcBase = makeTempHome();
    makeClaudeSkillsDir(homeDir);
  });

  afterEach(() => {
    rmrf(homeDir);
    rmrf(srcBase);
  });

  test('6. installSkill with valid local SKILL.md → ok=true', async () => {
    const localSkillPath = createLocalSkill(srcBase, 'my-skill');
    const result = await installSkill(localSkillPath, homeDir);
    expect(result.ok).toBe(true);
  });

  test('7. installSkill copies SKILL.md into adapter skill dir', async () => {
    const localSkillPath = createLocalSkill(srcBase, 'my-skill');
    const result = await installSkill(localSkillPath, homeDir);
    expect(result.ok).toBe(true);
    const installed = result.installedPaths[0];
    expect(fs.existsSync(path.join(installed, 'SKILL.md'))).toBe(true);
  });

  test('8. installSkill writes skill-meta.json with source field', async () => {
    const localSkillPath = createLocalSkill(srcBase, 'my-skill');
    const result = await installSkill(localSkillPath, homeDir);
    expect(result.ok).toBe(true);
    const metaPath = path.join(result.installedPaths[0], 'skill-meta.json');
    expect(fs.existsSync(metaPath)).toBe(true);
    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    expect(meta.source).toBe(localSkillPath);
    expect(meta.id).toBeTruthy();
  });

  test('9. installSkill updates registry (scanSkills called)', async () => {
    const localSkillPath = createLocalSkill(srcBase, 'my-skill');
    await installSkill(localSkillPath, homeDir);
    const registryPath = path.join(homeDir, '.viepilot', 'skill-registry.json');
    expect(fs.existsSync(registryPath)).toBe(true);
    const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    expect(Array.isArray(registry.skills)).toBe(true);
  });

  test('10. installSkill with non-existent path → ok=false', async () => {
    const result = await installSkill('/does/not/exist', homeDir);
    expect(result.ok).toBe(false);
    expect(result.error).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Group 3: uninstallSkill
// ─────────────────────────────────────────────────────────────────────────────
describe('FEAT-020: uninstallSkill', () => {
  let homeDir, srcBase;

  beforeEach(() => {
    homeDir = makeTempHome();
    srcBase = makeTempHome();
    makeClaudeSkillsDir(homeDir);
  });

  afterEach(() => {
    rmrf(homeDir);
    rmrf(srcBase);
  });

  test('11. uninstallSkill removes skill dir from installed adapter dirs', async () => {
    const localSkillPath = createLocalSkill(srcBase, 'my-skill');
    const installResult = await installSkill(localSkillPath, homeDir);
    expect(installResult.ok).toBe(true);
    const installedDir = installResult.installedPaths[0];
    expect(fs.existsSync(installedDir)).toBe(true);

    const uninstallResult = uninstallSkill(installResult.id, homeDir);
    expect(uninstallResult.ok).toBe(true);
    expect(fs.existsSync(installedDir)).toBe(false);
  });

  test('12. uninstallSkill refreshes registry after removal', async () => {
    const localSkillPath = createLocalSkill(srcBase, 'my-skill');
    const installResult = await installSkill(localSkillPath, homeDir);

    const registryBefore = JSON.parse(fs.readFileSync(
      path.join(homeDir, '.viepilot', 'skill-registry.json'), 'utf8'
    ));
    const countBefore = registryBefore.skills.length;

    uninstallSkill(installResult.id, homeDir);

    const registryAfter = JSON.parse(fs.readFileSync(
      path.join(homeDir, '.viepilot', 'skill-registry.json'), 'utf8'
    ));
    expect(registryAfter.skills.length).toBeLessThan(countBefore);
  });

  test('13. uninstallSkill on not-installed id → ok=true with empty removedPaths', () => {
    const result = uninstallSkill('does-not-exist', homeDir);
    expect(result.ok).toBe(true);
    expect(result.removedPaths).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Group 4: CLI integration
// ─────────────────────────────────────────────────────────────────────────────
describe('FEAT-020: CLI help integration', () => {
  const { execSync } = require('child_process');

  test('14. --help includes "install-skill"', () => {
    const out = execSync('node bin/viepilot.cjs --help', { encoding: 'utf8' });
    expect(out).toContain('install-skill');
  });

  test('15. --help includes "uninstall-skill"', () => {
    const out = execSync('node bin/viepilot.cjs --help', { encoding: 'utf8' });
    expect(out).toContain('uninstall-skill');
  });

  test('16. --help includes "update-skill"', () => {
    const out = execSync('node bin/viepilot.cjs --help', { encoding: 'utf8' });
    expect(out).toContain('update-skill');
  });
});
