/**
 * ViePilot bundle metadata for `vp-tools info` (FEAT-008).
 * Resolves the viepilot package root from the CLI location — no `.viepilot/` project required.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

/**
 * Walk upward from startDir (and optionally cwd) for package.json with name "viepilot".
 * @param {string} startDir - e.g. path.join(__dirname, '..') from bin/vp-tools.cjs
 * @returns {string|null} absolute package root or null
 */
function resolveViepilotPackageRoot(startDir) {
  const tryRoots = [path.resolve(startDir), path.resolve(process.cwd())];
  const seen = new Set();
  for (const base of tryRoots) {
    if (seen.has(base)) continue;
    seen.add(base);
    let dir = base;
    while (dir && dir !== path.dirname(dir)) {
      const pkgPath = path.join(dir, 'package.json');
      if (fs.existsSync(pkgPath)) {
        try {
          const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
          if (pkg && pkg.name === 'viepilot') {
            return dir;
          }
        } catch (_e) {
          /* ignore */
        }
      }
      dir = path.dirname(dir);
    }
  }
  return null;
}

/**
 * @param {string} root - viepilot package root
 * @returns {string|null}
 */
function readInstalledVersion(root) {
  const pkgPath = path.join(root, 'package.json');
  if (!fs.existsSync(pkgPath)) return null;
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    return pkg.version || null;
  } catch (_e) {
    return null;
  }
}

/**
 * Query npm registry for latest published version (requires network + npm on PATH).
 * @returns {{ ok: true, version: string } | { ok: false, error: string }}
 */
function fetchLatestNpmVersion() {
  try {
    const out = execFileSync('npm', ['view', 'viepilot', 'version', '--json'], {
      encoding: 'utf8',
      timeout: 15000,
      windowsHide: true,
    }).trim();
    const parsed = JSON.parse(out);
    const version = typeof parsed === 'string' ? parsed : String(parsed);
    return { ok: true, version };
  } catch (e) {
    return { ok: false, error: e.message || String(e) };
  }
}

/**
 * Parse `version:` from YAML-like frontmatter (first --- block).
 * @param {string} content
 * @returns {string}
 */
function parseSkillFileVersion(content) {
  if (typeof content !== 'string' || !content.startsWith('---')) {
    return 'unspecified';
  }
  const end = content.indexOf('\n---', 3);
  if (end === -1) {
    return 'unspecified';
  }
  const block = content.slice(3, end);
  const m = block.match(/^version:\s*["']?([^"'\r\n]+)["']?/m);
  return m ? m[1].trim() : 'unspecified';
}

/**
 * @param {string} skillsDir - absolute path to a folder containing vp-* skill dirs
 * @returns {Array<{ id: string, version: string, relativePath: string }>}
 */
function listSkillsFromDir(skillsDir) {
  const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
  const out = [];
  for (const ent of entries) {
    if (!ent.name.startsWith('vp-')) continue;
    // Symlinks to skill dirs (dev install) are not `isDirectory()` on Dirent — require SKILL.md instead
    const skillFile = path.join(skillsDir, ent.name, 'SKILL.md');
    if (!fs.existsSync(skillFile)) continue;
    const content = fs.readFileSync(skillFile, 'utf8');
    out.push({
      id: ent.name,
      version: parseSkillFileVersion(content),
      relativePath: path.join('skills', ent.name, 'SKILL.md').replace(/\\/g, '/'),
    });
  }
  out.sort((a, b) => a.id.localeCompare(b.id));
  return out;
}

/**
 * @param {string} root - viepilot package root (e.g. ~/.cursor/viepilot after install)
 * @returns {Array<{ id: string, version: string, relativePath: string }>}
 */
function listSkillsWithVersions(root) {
  const bundled = path.join(root, 'skills');
  if (fs.existsSync(bundled)) {
    const listed = listSkillsFromDir(bundled);
    if (listed.length > 0) return listed;
  }
  // Host installs keep skills outside the runtime dir. Prefer Cursor for backward compatibility.
  const hostSkillDirs = [
    path.join(os.homedir(), '.cursor', 'skills'),
    path.join(os.homedir(), '.claude', 'skills'),
    path.join(os.homedir(), '.codex', 'skills'),
  ];
  for (const skillsDir of hostSkillDirs) {
    if (fs.existsSync(skillsDir)) {
      const listed = listSkillsFromDir(skillsDir);
      if (listed.length > 0) return listed;
    }
  }
  return [];
}

const WORKFLOW_SEMVER_NOTE = 'no semver in workflow markdown';

/**
 * @param {string} root
 * @returns {Array<{ id: string, relativePath: string, semverInFile: null, note: string }>}
 */
function listWorkflows(root) {
  const wfDir = path.join(root, 'workflows');
  if (!fs.existsSync(wfDir)) {
    return [];
  }
  const files = fs
    .readdirSync(wfDir)
    .filter((f) => f.endsWith('.md'))
    .sort((a, b) => a.localeCompare(b));
  return files.map((f) => ({
    id: f.replace(/\.md$/i, ''),
    relativePath: path.join('workflows', f).replace(/\\/g, '/'),
    semverInFile: null,
    note: WORKFLOW_SEMVER_NOTE,
  }));
}

/**
 * @param {string} root
 * @returns {string|null}
 */
function tryGitHead(root) {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: root,
      encoding: 'utf8',
      timeout: 8000,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch (_e) {
    return null;
  }
}

/**
 * @param {string} root
 * @param {{ includeLatestNpm?: boolean }} [options]
 */
function buildInfoReport(root, options = {}) {
  const includeLatestNpm = options.includeLatestNpm !== false;
  const installedVersion = readInstalledVersion(root);
  let pkgName = 'viepilot';
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
    if (pkg.name) pkgName = pkg.name;
  } catch (_e) {
    /* keep default */
  }

  const report = {
    packageRoot: root,
    packageName: pkgName,
    installedVersion: installedVersion || 'unknown',
    latestNpm: includeLatestNpm ? fetchLatestNpmVersion() : { ok: false, error: 'skipped' },
    gitHead: tryGitHead(root),
    skills: listSkillsWithVersions(root),
    workflows: listWorkflows(root),
  };

  return report;
}

module.exports = {
  resolveViepilotPackageRoot,
  readInstalledVersion,
  fetchLatestNpmVersion,
  parseSkillFileVersion,
  listSkillsWithVersions,
  listWorkflows,
  tryGitHead,
  buildInfoReport,
  WORKFLOW_SEMVER_NOTE,
};
