'use strict';

/**
 * vp-proposal environment detection (ENH-127).
 *
 * Which host document skills (pptx, docx, xlsx, pdf) and which helper programs/modules they need
 * are available. The result is recorded in session.json (`environment`) and provenance
 * (`skillsUsed`); anything missing is reported with an install hint and the dependent check is
 * labelled "skipped — <reason>", never silently passed.
 *
 * Zero dependencies; never throws.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const DOCUMENT_SKILLS = Object.freeze(['pptx', 'docx', 'xlsx', 'pdf']);
const SKILL_NAMES = Object.freeze(Object.fromEntries(DOCUMENT_SKILLS.map((s) => [s, `anthropic-skills:${s}`])));

// What each skill needs to run its scripts (see the skills' Dependencies sections).
const DEPENDENCIES = Object.freeze({
  python3: { kind: 'program', check: ['python3', ['--version']], neededBy: ['pptx', 'docx', 'xlsx', 'pdf'],
    hint: { darwin: 'brew install python', linux: 'apt install python3', win32: 'winget install Python.Python.3' } },
  'python-pptx': { kind: 'python', module: 'pptx', neededBy: ['pptx'], hint: { any: 'pip install python-pptx' } },
  openpyxl: { kind: 'python', module: 'openpyxl', neededBy: ['xlsx'], hint: { any: 'pip install openpyxl' } },
  defusedxml: { kind: 'python', module: 'defusedxml', neededBy: ['pptx', 'docx'], hint: { any: 'pip install defusedxml' } },
  lxml: { kind: 'python', module: 'lxml', neededBy: ['pptx', 'docx'], hint: { any: 'pip install lxml' } },
  soffice: { kind: 'program', check: ['soffice', ['--version']], neededBy: ['pptx', 'docx', 'xlsx'], purpose: 'visual QA (render to PDF), formula recalculation',
    hint: { darwin: 'brew install --cask libreoffice', linux: 'apt install libreoffice', win32: 'winget install TheDocumentFoundation.LibreOffice' } },
  pdftoppm: { kind: 'program', check: ['pdftoppm', ['-v']], neededBy: ['pptx', 'pdf'], purpose: 'slide images for visual QA',
    hint: { darwin: 'brew install poppler', linux: 'apt install poppler-utils', win32: 'choco install poppler' } },
});

function runs(cmd, args) {
  try {
    const r = spawnSync(cmd, args, { encoding: 'utf8', timeout: 8000 });
    return !r.error && (r.status === 0 || /version|pdftoppm/i.test(`${r.stdout}${r.stderr}`));
  } catch (_) {
    return false;
  }
}

function pythonHas(module) {
  return runs('python3', ['-c', `import ${module}`]);
}

// Claude Code keeps synced/plugin skills in several places; look for <dir>/<name>/SKILL.md.
function skillSearchRoots(home) {
  const base = path.join(home, '.claude');
  const roots = [path.join(base, 'skills')];
  for (const sub of ['skills/synced', 'plugins/cache', 'plugins/marketplaces']) {
    const dir = path.join(base, sub);
    if (!fs.existsSync(dir)) continue;
    roots.push(dir);
    for (const e of safeReaddir(dir)) if (e.isDirectory()) roots.push(path.join(dir, e.name));
  }
  return roots;
}

function safeReaddir(dir) {
  try { return fs.readdirSync(dir, { withFileTypes: true }); } catch (_) { return []; }
}

function findSkillDir(home, name) {
  const queue = skillSearchRoots(home).map((r) => [r, 0]);
  while (queue.length) {
    const [dir, depth] = queue.shift();
    const candidate = path.join(dir, name, 'SKILL.md');
    if (fs.existsSync(candidate)) {
      const head = fs.readFileSync(candidate, 'utf8').slice(0, 400);
      if (new RegExp(`^name:\\s*${name}\\s*$`, 'm').test(head)) return path.dirname(candidate);
    }
    if (depth < 3) for (const e of safeReaddir(dir)) if (e.isDirectory() && !e.name.startsWith('.')) queue.push([path.join(dir, e.name), depth + 1]);
  }
  return null;
}

/**
 * @param {{home?: string, sessionSkills?: string[]}} [opts] sessionSkills = skill names the host lists for this session
 * @returns {Record<'pptx'|'docx'|'xlsx'|'pdf', {available: boolean, name: string, dir: string|null, via: 'session'|'disk'|null}>}
 */
function detectDocumentSkills(opts = {}) {
  const home = opts.home || os.homedir();
  const listed = new Set(opts.sessionSkills || []);
  const out = {};
  for (const s of DOCUMENT_SKILLS) {
    const dir = findSkillDir(home, s);
    const inSession = listed.has(SKILL_NAMES[s]);
    out[s] = { available: inSession || !!dir, name: SKILL_NAMES[s], dir, via: inSession ? 'session' : dir ? 'disk' : null };
  }
  return out;
}

/**
 * @param {{platform?: string, probe?: (dep: object, name: string) => boolean}} [opts] probe is injectable for tests
 * @returns {Record<string, {available: boolean, neededBy: string[], purpose?: string, hint: string}>}
 */
function detectDependencies(opts = {}) {
  const platform = opts.platform || process.platform;
  const probe = opts.probe || ((dep) => (dep.kind === 'python' ? pythonHas(dep.module) : runs(dep.check[0], dep.check[1])));
  const out = {};
  for (const [name, dep] of Object.entries(DEPENDENCIES)) {
    let ok = false;
    try { ok = !!probe(dep, name); } catch (_) { ok = false; }
    out[name] = { available: ok, neededBy: dep.neededBy.slice(), purpose: dep.purpose, hint: dep.hint.any || dep.hint[platform] || Object.values(dep.hint)[0] };
  }
  return out;
}

/**
 * Which proposal checks can run, and why not when they cannot.
 * @returns {{skills, dependencies, checks: Record<string, {canRun: boolean, reason: string|null}>, missing: {skills: string[], dependencies: string[]}}}
 */
function assessEnvironment(opts = {}) {
  const skills = opts.skills || detectDocumentSkills(opts);
  const deps = opts.dependencies || detectDependencies(opts);
  const need = (skill, depNames) => {
    if (!skills[skill] || !skills[skill].available) return { canRun: false, reason: `skipped — ${SKILL_NAMES[skill]} unavailable` };
    const miss = depNames.filter((d) => !deps[d] || !deps[d].available);
    return miss.length ? { canRun: false, reason: `skipped — missing ${miss.join(', ')} (${miss.map((d) => deps[d] && deps[d].hint).filter(Boolean).join('; ')})` } : { canRun: true, reason: null };
  };
  const checks = {
    pptxContentQA: need('pptx', ['python3', 'python-pptx']),
    pptxFileQA: need('pptx', ['python3', 'defusedxml', 'lxml']),
    pptxVisualQA: need('pptx', ['python3', 'soffice', 'pdftoppm']),
    docxVerify: need('docx', ['python3', 'defusedxml', 'lxml']),
    xlsxRecalc: need('xlsx', ['python3', 'openpyxl', 'soffice']),
    pdfRead: need('pdf', ['python3']),
  };
  return {
    skills,
    dependencies: deps,
    checks,
    missing: {
      skills: DOCUMENT_SKILLS.filter((s) => !skills[s].available),
      dependencies: Object.keys(deps).filter((d) => !deps[d].available),
    },
  };
}

module.exports = { DOCUMENT_SKILLS, SKILL_NAMES, DEPENDENCIES, detectDocumentSkills, detectDependencies, assessEnvironment };
