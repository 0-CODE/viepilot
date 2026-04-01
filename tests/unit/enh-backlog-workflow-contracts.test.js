/**
 * Regression guard for ENH-001 ~ ENH-005: doc sync + audit drift contracts
 * (workflows + skills must keep documented behavior).
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', '..');

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

describe('ENH backlog workflow contracts (001~005)', () => {
  test('autonomous.md: ROADMAP sync per phase + README on milestone + skills-reference hook', () => {
    const md = read('workflows/autonomous.md');
    expect(md).toMatch(/Sync ROADMAP\.md/i);
    expect(md).toMatch(/skills-reference/i);
    expect(md).toMatch(/Sync README\.md/i);
    expect(md).toMatch(/milestone complete/i);
  });

  test('documentation.md: git remote context + skills-reference scan + placeholder validation', () => {
    const md = read('workflows/documentation.md');
    expect(md).toContain('git remote get-url origin');
    expect(md).toMatch(/skills-reference/i);
    expect(md).toMatch(/scan.*skills/i);
    expect(md).toMatch(/your-org|YOUR_USERNAME|placeholder/i);
  });

  test('audit.md: README / skills-reference / placeholder drift + auto-fix section', () => {
    const md = read('workflows/audit.md');
    expect(md).toMatch(/skills-reference/i);
    expect(md).toMatch(/README\.md/i);
    expect(md).toMatch(/placeholder|your-org|YOUR_USERNAME/i);
    expect(md).toMatch(/Auto-Fix|auto-fix/i);
  });

  test('vp-auto SKILL: ROADMAP, skills-reference, README on milestone', () => {
    const md = read('skills/vp-auto/SKILL.md');
    expect(md).toMatch(/ROADMAP\.md/i);
    expect(md).toMatch(/skills-reference/i);
    expect(md).toMatch(/README\.md/i);
  });

  test('vp-docs SKILL: README root sync + git context + skills-reference incremental', () => {
    const md = read('skills/vp-docs/SKILL.md');
    expect(md).toContain('Documentation table');
    expect(md).toMatch(/root `README\.md`|Root README\.md/i);
    expect(md).toMatch(/git remote|GITHUB_OWNER/i);
    expect(md).toMatch(/skills-reference/i);
  });

  test('vp-audit SKILL: Tier 4 skills-reference + placeholder + auto-fix', () => {
    const md = read('skills/vp-audit/SKILL.md');
    expect(md).toMatch(/skills-reference/i);
    expect(md).toMatch(/placeholder|Placeholder/i);
    expect(md).toMatch(/Auto-fix|--fix/i);
  });
});
