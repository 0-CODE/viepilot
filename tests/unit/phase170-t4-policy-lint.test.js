'use strict';

/**
 * Phase 170.4 (ENH-125) — lint: the tool policy is present everywhere, and no skill, workflow or
 * agent tells the agent to edit files through the shell.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const POLICY_BLOCK = /<!-- tool-policy:start -->[\s\S]*?<!-- tool-policy:end -->/g;

function mdFiles(dir) {
  const abs = path.join(ROOT, dir);
  return fs.readdirSync(abs, { withFileTypes: true }).flatMap((e) => {
    if (e.isDirectory()) {
      const skill = path.join(abs, e.name, 'SKILL.md');
      return fs.existsSync(skill) ? [skill] : [];
    }
    return e.name.endsWith('.md') ? [path.join(abs, e.name)] : [];
  });
}

const SKILLS = mdFiles('skills');
const WORKFLOWS = mdFiles('workflows');
const AGENTS = [...mdFiles('agents'), ...mdFiles('agents/claude-code')];

// Shell file edits an instruction must never ask for (outside the policy block, which names them as forbidden).
const FORBIDDEN = [
  [/\bsed\s+-i\b/, 'sed -i'],
  [/\bperl\s+-p?i\b/, 'perl -pi'],
  [/\bcat\s+<<-?\s*['"]?\w+['"]?\s*>{1,2}\s*\S/, 'cat <<EOF > file'],
  [/\bcat\s*>{1,2}\s*[\w./-]+\.(md|json|cjs|js|ts|yml|yaml)\b/, 'cat > file'],
  [/\bpython3?\s+-\s*<</, 'python heredoc script'],
  [/\btee\s+(-a\s+)?[\w./-]+\.(md|json|cjs|js)\b/, 'tee file'],
];

function stripPolicy(text) {
  return text.replace(POLICY_BLOCK, '');
}

describe('Phase 170.4 — tool policy lint', () => {
  test('repository has skills, workflows and agents to lint', () => {
    expect(SKILLS.length).toBeGreaterThanOrEqual(20);
    expect(WORKFLOWS.length).toBeGreaterThanOrEqual(10);
    expect(AGENTS.length).toBeGreaterThanOrEqual(14);
  });

  test.each([...SKILLS, ...AGENTS].map((f) => [path.relative(ROOT, f)]))('%s carries the policy block', (rel) => {
    const txt = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    expect(txt).toMatch(POLICY_BLOCK);
    expect(txt).toContain('<tool_policy>');
  });

  test.each([...SKILLS, ...WORKFLOWS, ...AGENTS].map((f) => [path.relative(ROOT, f)]))(
    '%s does not instruct shell file edits', (rel) => {
      const body = stripPolicy(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
      const hits = FORBIDDEN.filter(([re]) => re.test(body)).map(([, name]) => name);
      expect(hits).toEqual([]);
    });

  test.each(['autonomous.md', 'evolve.md', 'proposal.md'])('workflows/%s tells the agent to keep a task list in the todo tool', (wf) => {
    const body = stripPolicy(fs.readFileSync(path.join(ROOT, 'workflows', wf), 'utf8'));
    expect(body).toMatch(/TodoWrite|TaskCreate/);
  });

  test.each(['autonomous.md', 'proposal.md'])('workflows/%s delegates through the subagent tool', (wf) => {
    const body = stripPolicy(fs.readFileSync(path.join(ROOT, 'workflows', wf), 'utf8'));
    expect(body).toMatch(/\bAgent\(|spawn one `Agent`|subagent_type/);
  });

  test('the lint catches a forbidden instruction in a fixture', () => {
    const fixture = 'Then run `sed -i "s/old/new/" README.md` and `cat <<EOF > notes.md`.';
    const hits = FORBIDDEN.filter(([re]) => re.test(fixture)).map(([, n]) => n);
    expect(hits).toEqual(expect.arrayContaining(['sed -i', 'cat <<EOF > file']));
  });

  test('the policy block itself is exempt (it lists the forbidden forms)', () => {
    const txt = fs.readFileSync(SKILLS[0], 'utf8');
    expect(txt).toMatch(/sed -i/);            // named inside the block
    expect(stripPolicy(txt)).not.toMatch(/\bsed\s+-i\b/);
  });
});
