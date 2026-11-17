'use strict';

/**
 * BUG-039: skills load their workflow deterministically.
 *
 * Source SKILL.md files point at their workflow with an `@$HOME/{envToolDir}/workflows/X.md` include (or a bare
 * `workflows/X.md`). Hosts do not expand `@` includes inside skill bodies, so the workflow never reached the model.
 * At install time the installer copies each referenced workflow into `<skillDir>/references/X.md` and replaces the
 * include with one explicit Step 0: read that resolved absolute path with the host's Read tool.
 */

const fs = require('fs');
const path = require('path');

const STEP0_MARK = 'Step 0 (MANDATORY, before anything else)';
const RES_MARK = 'Resources (resolved at install)';
const WF_REF = /(?:@\$HOME\/[^\s`]*?\/)?workflows\/([a-z0-9-]+)\.md/g;
const EXEC_BLOCK = /<execution_context>\n([\s\S]*?)\n<\/execution_context>/;

function step0Block(paths, extras) {
  const q = (p) => `\`${p}\``;
  const lines = ['<execution_context>'];
  if (paths.length) {
    lines.push(
      `**${STEP0_MARK}:** read ${paths.map(q).join(', ')} with the host's Read tool`,
      '(Claude Code: Read, in chunks with offset/limit for long files). Never read it with the shell (cat, sed, grep, head).',
      'The hard gates of this skill live in that file; do not start step 1 until it is loaded.',
    );
  }
  if (extras.length) lines.push(`${RES_MARK}: ${extras.map(q).join(', ')}`);
  lines.push('</execution_context>');
  return lines.join('\n');
}

/**
 * Render one SKILL.md. Pure and idempotent.
 * @param {string} text SKILL.md content
 * @param {{ skillDir: string, home?: string }} opts installed skill directory (absolute); home resolves other `@$HOME/` includes
 * @returns {{ text: string, refs: string[], changed: boolean }} refs = workflow names (without .md)
 */
function renderSkillWorkflowRefs(text, { skillDir, home = require('os').homedir() }) {
  const m = text.match(EXEC_BLOCK);
  if (!m) return { text, refs: [], changed: false };
  const refPath = (name) => path.join(skillDir, 'references', `${name}.md`);
  let refs;
  let out = text;
  if (m[1].includes(STEP0_MARK) || m[1].includes(RES_MARK)) {
    refs = [...m[1].matchAll(/references\/([a-z0-9-]+)\.md/g)].map((x) => x[1]);
  } else {
    refs = [...new Set([...m[1].matchAll(WF_REF)].map((x) => x[1]))];
    const extras = m[1].split('\n').map((l) => l.trim())
      .filter((l) => l && !/workflows\/[a-z0-9-]+\.md$/.test(l))
      .map((l) => l.replace(/^@\$HOME\//, `${home}/`).replace(/^@/, ''));
    if (!refs.length && !extras.length) return { text, refs: [], changed: false };
    out = out.replace(EXEC_BLOCK, () => step0Block(refs.map(refPath), extras));
  }
  out = out.replace(/Execute workflow from `@?[^`]*?workflows\/([a-z0-9-]+)\.md`/g,
    (all, name) => (refs.includes(name) ? `Execute the workflow in \`${refPath(name)}\` (loaded in Step 0)` : all));
  // Any other include of a workflow: drop the unexpandable `@$HOME/...` form, keep a resolved path.
  out = out.replace(/@\$HOME\/[^\s`]*?\/workflows\/([a-z0-9-]+)\.md/g,
    (all, name) => (refs.includes(name) ? refPath(name) : all.replace(/^@\$HOME/, home)));
  out = out.replace(/@\$HOME\//g, `${home}/`);
  return { text: out, refs, changed: out !== text };
}

/**
 * Render every installed skill under skillsDir: copy referenced workflows into references/ and rewrite SKILL.md.
 * @param {{ skillsDir: string, workflowsDir: string, skillNames?: string[] }} opts
 * @returns {{ skills: number, refs: number, missing: string[] }}
 */
function renderInstalledSkills({ skillsDir, workflowsDir, skillNames, home }) {
  const names = skillNames || (fs.existsSync(skillsDir) ? fs.readdirSync(skillsDir) : []);
  let skills = 0;
  let refCount = 0;
  const missing = [];
  for (const name of names) {
    const skillDir = path.join(skillsDir, name);
    const file = path.join(skillDir, 'SKILL.md');
    if (!fs.existsSync(file) || fs.lstatSync(skillDir).isSymbolicLink()) continue;
    const r = renderSkillWorkflowRefs(fs.readFileSync(file, 'utf8'), { skillDir, home });
    if (!r.changed && !r.refs.length) continue;
    for (const ref of r.refs) {
      const src = path.join(workflowsDir, `${ref}.md`);
      if (!fs.existsSync(src)) { missing.push(`${name}: workflows/${ref}.md`); continue; }
      fs.mkdirSync(path.join(skillDir, 'references'), { recursive: true });
      fs.copyFileSync(src, path.join(skillDir, 'references', `${ref}.md`));
      refCount++;
    }
    if (r.changed) fs.writeFileSync(file, r.text, 'utf8');
    skills++;
  }
  return { skills, refs: refCount, missing };
}

module.exports = { STEP0_MARK, renderSkillWorkflowRefs, renderInstalledSkills };
