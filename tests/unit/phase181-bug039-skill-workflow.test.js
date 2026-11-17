'use strict';

// BUG-039: skills load their workflow deterministically (installer ships workflows into <skill>/references/).
const fs = require('fs');
const os = require('os');
const path = require('path');
const { buildInstallPlan, applyInstallPlan, formatPlanLines } = require('../../lib/viepilot-install.cjs');
const { renderSkillWorkflowRefs, renderInstalledSkills, STEP0_MARK } = require('../../lib/skill-workflow-render.cjs');

const ROOT = path.join(__dirname, '..', '..');
const SKILL_DIR = '/h/.claude/skills/vp-x';

function skill(block, extra = '') {
  return `# x\n\n<execution_context>\n${block}\n</execution_context>\n\n${extra}\n`;
}

describe('renderSkillWorkflowRefs', () => {
  test.each([
    ['@$HOME/{envToolDir}/workflows/autonomous.md'],
    ['@$HOME/.claude/viepilot/workflows/autonomous.md'],
    ['workflows/autonomous.md'],
  ])('replaces %s with a Step 0 Read of references/', (ref) => {
    const r = renderSkillWorkflowRefs(skill(ref, `Execute workflow from \`${ref.startsWith('@') ? ref : '@' + ref}\``), { skillDir: SKILL_DIR, home: '/h' });
    expect(r.refs).toEqual(['autonomous']);
    expect(r.text).toContain(STEP0_MARK);
    expect(r.text).toContain('/h/.claude/skills/vp-x/references/autonomous.md');
    expect(r.text).toContain('Execute the workflow in `/h/.claude/skills/vp-x/references/autonomous.md`');
    expect(r.text).not.toContain('@$HOME');
    expect(r.text).toMatch(/Never read it with the shell/);
  });

  test('keeps non-workflow includes as resolved resources', () => {
    const r = renderSkillWorkflowRefs(skill('@$HOME/.claude/viepilot/bin/vp-tools.cjs'), { skillDir: SKILL_DIR, home: '/h' });
    expect(r.refs).toEqual([]);
    expect(r.text).toContain('Resources (resolved at install): `/h/.claude/viepilot/bin/vp-tools.cjs`');
    expect(r.text).not.toContain('@$HOME');
  });

  test('is idempotent', () => {
    const once = renderSkillWorkflowRefs(skill('@$HOME/.claude/viepilot/workflows/evolve.md\n@$HOME/.claude/viepilot/templates/project/'), { skillDir: SKILL_DIR, home: '/h' });
    const twice = renderSkillWorkflowRefs(once.text, { skillDir: SKILL_DIR, home: '/h' });
    expect(twice.text).toBe(once.text);
    expect(twice.changed).toBe(false);
    expect(twice.refs).toEqual(['evolve']);
  });

  test('no execution_context → unchanged', () => {
    const r = renderSkillWorkflowRefs('# x\nno block\n', { skillDir: SKILL_DIR });
    expect(r.changed).toBe(false);
  });
});

describe('install renders every skill (temp HOME)', () => {
  let home;
  let skillsDir;
  beforeAll(() => {
    home = fs.mkdtempSync(path.join(os.tmpdir(), 'vp181-'));
    const plan = buildInstallPlan(ROOT, { VIEPILOT_AUTO_YES: '1', VIEPILOT_SKIP_DEPS: '1' }, { overrideHomedir: home, wantPathShim: false });
    expect(formatPlanLines(plan).some((l) => l.includes('render_skill_workflows'))).toBe(true);
    const r = applyInstallPlan(plan, { dryRun: false, runCommand: () => ({ status: 0, skipped: true }) });
    expect(r.ok).toBe(true);
    skillsDir = path.join(home, '.claude', 'skills');
  });

  test('no installed SKILL.md keeps an unexpandable include', () => {
    for (const name of fs.readdirSync(skillsDir)) {
      const text = fs.readFileSync(path.join(skillsDir, name, 'SKILL.md'), 'utf8');
      expect({ name, at: text.includes('@$HOME') }).toEqual({ name, at: false });
      expect({ name, env: text.includes('{envToolDir}') }).toEqual({ name, env: false });
      const block = (text.match(/<execution_context>[\s\S]*?<\/execution_context>/) || [''])[0];
      expect({ name, bare: /(^|\n)@?workflows\//.test(block) }).toEqual({ name, bare: false });
    }
  });

  test('each workflow-backed skill ships references/<wf>.md identical to the source and a resolved Step 0', () => {
    let count = 0;
    for (const name of fs.readdirSync(path.join(ROOT, 'skills'))) {
      const src = fs.readFileSync(path.join(ROOT, 'skills', name, 'SKILL.md'), 'utf8');
      const block = (src.match(/<execution_context>[\s\S]*?<\/execution_context>/) || [''])[0];
      const wfs = [...block.matchAll(/workflows\/([a-z0-9-]+)\.md/g)].map((m) => m[1]);
      if (!wfs.length) continue;
      const installed = fs.readFileSync(path.join(skillsDir, name, 'SKILL.md'), 'utf8');
      expect(installed).toContain(STEP0_MARK);
      for (const wf of wfs) {
        const ref = path.join(skillsDir, name, 'references', `${wf}.md`);
        expect(installed).toContain(ref);
        expect(fs.readFileSync(ref, 'utf8')).toBe(fs.readFileSync(path.join(ROOT, 'workflows', `${wf}.md`), 'utf8'));
      }
      count++;
    }
    expect(count).toBeGreaterThanOrEqual(14);
  });

  test('re-rendering an installed tree changes nothing', () => {
    const before = fs.readFileSync(path.join(skillsDir, 'vp-auto', 'SKILL.md'), 'utf8');
    renderInstalledSkills({ skillsDir, workflowsDir: path.join(ROOT, 'workflows'), home });
    expect(fs.readFileSync(path.join(skillsDir, 'vp-auto', 'SKILL.md'), 'utf8')).toBe(before);
  });

  test('symlink mode does not render (skills link to source) and says so', () => {
    const plan = buildInstallPlan(ROOT, { VIEPILOT_AUTO_YES: '1', VIEPILOT_SYMLINK_SKILLS: '1' }, { overrideHomedir: home, wantPathShim: false });
    expect(plan.steps.some((s) => s.kind === 'render_skill_workflows')).toBe(false);
    expect(plan.steps.some((s) => s.kind === 'note' && /symlink mode: skill workflows/.test(s.message))).toBe(true);
  });
});
