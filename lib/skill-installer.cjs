/**
 * ViePilot Skill Installer — multi-channel skill installation (FEAT-020 Phase 91).
 *
 * Channels supported:
 *   npm     — "npm:@scope/pkg" or bare "@scope/pkg" / "pkg"
 *   github  — "github:org/repo"
 *   local   — "./path" or "/absolute/path"
 *
 * After any install/uninstall/update: calls scanSkills() to refresh registry.
 * Records skill-meta.json in skill dir for updateSkill() re-install support.
 */

'use strict';

const fs             = require('fs');
const path           = require('path');
const os             = require('os');
const { execSync }   = require('child_process');
const https          = require('https');
const http           = require('http');

const { scanSkills }   = require('./skill-registry.cjs');
const { listAdapters } = require('./adapters/index.cjs');

// ---------------------------------------------------------------------------
// Channel detection
// ---------------------------------------------------------------------------

function detectChannel(source) {
  if (source.startsWith('github:')) return 'github';
  if (source.startsWith('./') || source.startsWith('/') || source.startsWith('../')) return 'local';
  return 'npm';
}

// ---------------------------------------------------------------------------
// Adapter skill dirs
// ---------------------------------------------------------------------------

function getAdapterSkillDirs(homeDir) {
  const adapters = listAdapters(homeDir);
  return adapters
    .map(a => (typeof a.skillsDir === 'function' ? a.skillsDir(homeDir) : null))
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// npm channel
// ---------------------------------------------------------------------------

function installFromNpm(pkgName, skillId, skillDirs, tempBase) {
  const tempDir = fs.mkdtempSync(path.join(tempBase, 'vp-npm-'));
  try {
    // Pack the package into tempDir
    execSync(`npm pack ${pkgName} --pack-destination "${tempDir}"`, {
      stdio: 'pipe',
      timeout: 60000,
    });

    const tarballs = fs.readdirSync(tempDir).filter(f => f.endsWith('.tgz'));
    if (tarballs.length === 0) throw new Error(`npm pack produced no tarball for ${pkgName}`);

    const tarball = path.join(tempDir, tarballs[0]);
    const extractDir = path.join(tempDir, 'extracted');
    fs.mkdirSync(extractDir, { recursive: true });

    // Extract synchronously
    execSync(`tar -xzf "${tarball}" -C "${extractDir}"`, { stdio: 'pipe' });

    // npm pack wraps in package/
    const packageDir = path.join(extractDir, 'package');
    const skillMdPath = path.join(packageDir, 'SKILL.md');
    if (!fs.existsSync(skillMdPath)) {
      throw new Error(`SKILL.md not found in npm package ${pkgName}`);
    }

    const installedPaths = [];
    for (const skillsDir of skillDirs) {
      const targetDir = path.join(skillsDir, skillId);
      fs.mkdirSync(targetDir, { recursive: true });
      fs.cpSync(packageDir, targetDir, { recursive: true });
      installedPaths.push(targetDir);
    }
    return installedPaths;
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------------------
// github channel
// ---------------------------------------------------------------------------

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https:') ? https : http;
    const file = fs.createWriteStream(destPath);
    proto.get(url, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlinkSync(destPath);
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', reject);
  });
}

async function installFromGithub(orgRepo, skillId, skillDirs, tempBase) {
  const [org, repo] = orgRepo.split('/');
  if (!org || !repo) throw new Error(`Invalid github source "github:${orgRepo}" — expected "github:org/repo"`);

  const tarballUrl = `https://github.com/${org}/${repo}/archive/refs/heads/main.tar.gz`;
  const tempDir = fs.mkdtempSync(path.join(tempBase, 'vp-gh-'));
  try {
    const tarball = path.join(tempDir, 'repo.tar.gz');
    await downloadFile(tarballUrl, tarball);

    const extractDir = path.join(tempDir, 'extracted');
    fs.mkdirSync(extractDir, { recursive: true });
    execSync(`tar -xzf "${tarball}" -C "${extractDir}"`, { stdio: 'pipe' });

    // GitHub archives create org-repo-main/ directory
    const entries = fs.readdirSync(extractDir);
    const repoDir = path.join(extractDir, entries[0]);

    const skillMdPath = path.join(repoDir, 'SKILL.md');
    if (!fs.existsSync(skillMdPath)) {
      throw new Error(`SKILL.md not found in GitHub repo ${org}/${repo}`);
    }

    const installedPaths = [];
    for (const skillsDir of skillDirs) {
      const targetDir = path.join(skillsDir, skillId);
      fs.mkdirSync(targetDir, { recursive: true });
      fs.cpSync(repoDir, targetDir, { recursive: true });
      installedPaths.push(targetDir);
    }
    return installedPaths;
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------------------
// local channel
// ---------------------------------------------------------------------------

function installFromLocal(srcPath, skillId, skillDirs) {
  const resolved = path.resolve(srcPath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Local path not found: ${resolved}`);
  }
  const skillMdPath = path.join(resolved, 'SKILL.md');
  if (!fs.existsSync(skillMdPath)) {
    throw new Error(`SKILL.md not found at ${resolved}`);
  }

  const installedPaths = [];
  for (const skillsDir of skillDirs) {
    const targetDir = path.join(skillsDir, skillId);
    fs.mkdirSync(targetDir, { recursive: true });
    fs.cpSync(resolved, targetDir, { recursive: true });
    installedPaths.push(targetDir);
  }
  return installedPaths;
}

// ---------------------------------------------------------------------------
// skill-meta.json
// ---------------------------------------------------------------------------

function writeSkillMeta(installedPaths, id, source) {
  const meta = { id, source, installed_at: new Date().toISOString() };
  for (const p of installedPaths) {
    fs.writeFileSync(path.join(p, 'skill-meta.json'), JSON.stringify(meta, null, 2));
  }
}

function readSkillMeta(skillId, homeDir) {
  const skillDirs = getAdapterSkillDirs(homeDir);
  for (const skillsDir of skillDirs) {
    const metaPath = path.join(skillsDir, skillId, 'skill-meta.json');
    if (fs.existsSync(metaPath)) {
      try { return JSON.parse(fs.readFileSync(metaPath, 'utf8')); } catch { /* skip */ }
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Install a skill from source.
 * Returns { ok: true, id, installedPaths[] } or { ok: false, error }
 */
async function installSkill(source, home = os.homedir()) {
  try {
    const channel = detectChannel(source);
    const skillDirs = getAdapterSkillDirs(home);
    if (skillDirs.length === 0) {
      return { ok: false, error: 'No adapter skill directories found' };
    }

    const tempBase = os.tmpdir();
    let skillId;
    let installedPaths;

    if (channel === 'npm') {
      const pkgName = source.replace(/^npm:/, '');
      skillId = pkgName.split('/').pop().replace(/^vp-skills-/, '');
      installedPaths = installFromNpm(pkgName, skillId, skillDirs, tempBase);
    } else if (channel === 'github') {
      const orgRepo = source.replace('github:', '');
      skillId = orgRepo.split('/').pop();
      installedPaths = await installFromGithub(orgRepo, skillId, skillDirs, tempBase);
    } else {
      // local
      skillId = path.basename(source.replace(/[/\\]+$/, ''));
      installedPaths = installFromLocal(source, skillId, skillDirs);
    }

    writeSkillMeta(installedPaths, skillId, source);
    scanSkills(home);

    return { ok: true, id: skillId, installedPaths };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Uninstall a skill by id from all adapter dirs.
 * Returns { ok: true, removedPaths[] } or { ok: false, error }
 */
function uninstallSkill(id, home = os.homedir()) {
  try {
    const skillDirs = getAdapterSkillDirs(home);
    const removedPaths = [];

    for (const skillsDir of skillDirs) {
      const targetDir = path.join(skillsDir, id);
      if (fs.existsSync(targetDir)) {
        fs.rmSync(targetDir, { recursive: true, force: true });
        removedPaths.push(targetDir);
      }
    }

    scanSkills(home);
    return { ok: true, removedPaths };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Update a skill by re-installing from its recorded source.
 * Returns installSkill result, or { ok: false, error } if source not found.
 */
async function updateSkill(id, home = os.homedir()) {
  const meta = readSkillMeta(id, home);
  if (!meta || !meta.source) {
    return { ok: false, error: `No skill-meta.json found for skill "${id}" — cannot update` };
  }
  return installSkill(meta.source, home);
}

module.exports = { installSkill, uninstallSkill, updateSkill, detectChannel };
