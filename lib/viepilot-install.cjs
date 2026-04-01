/**
 * ViePilot filesystem install plan — Node implementation (ENH-017 / Phase 28).
 * Mirrors install.sh steps as a structured plan for dry-run and (later) execution.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { resolveViepilotPackageRoot } = require('./viepilot-info.cjs');

/** @see docs/dev/global-profiles.md (FEAT-009) */
const VIEPILOT_PROFILE_MAP_SEED = `# ViePilot profile map

Machine-level registry for reusable org/client profiles. Add rows when you create files under \`profiles/\`. Normative contract: bundled \`docs/dev/global-profiles.md\`.

| profile_id | display_name | org_tag | profile_path | tags | last_used |
|------------|--------------|---------|--------------|------|-----------|
`;

/**
 * @param {Record<string, string | undefined>} [envSource]
 * @returns {{ autoYes: boolean, profile: string, addPath: boolean, symlinkSkills: boolean }}
 */
function normalizeInstallEnv(envSource = process.env) {
  return {
    autoYes: envSource.VIEPILOT_AUTO_YES === '1',
    profile: envSource.VIEPILOT_INSTALL_PROFILE || 'cursor-ide',
    addPath: envSource.VIEPILOT_ADD_PATH === '1',
    symlinkSkills: envSource.VIEPILOT_SYMLINK_SKILLS === '1',
  };
}

/**
 * Same guard as install.sh: README.md + skills/ directory.
 * @param {string} root - viepilot package root
 */
function validateViepilotPackageRoot(root) {
  const readme = path.join(root, 'README.md');
  const skillsDir = path.join(root, 'skills');
  if (!fs.existsSync(readme)) {
    const err = new Error('Please run this from the viepilot package root (README.md missing)');
    err.code = 'VIEPILOT_LAYOUT';
    throw err;
  }
  if (!fs.existsSync(skillsDir) || !fs.statSync(skillsDir).isDirectory()) {
    const err = new Error('Please run this from the viepilot package root (skills/ missing)');
    err.code = 'VIEPILOT_LAYOUT';
    throw err;
  }
}

/**
 * @param {string} packageRoot
 * @returns {string[]}
 */
function listSkillDirNames(packageRoot) {
  const skillsDir = path.join(packageRoot, 'skills');
  return fs
    .readdirSync(skillsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

/**
 * @param {string} packageRoot
 * @param {string} subdir - relative to package root
 */
function listDirEntries(packageRoot, subdir) {
  const full = path.join(packageRoot, subdir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full, { withFileTypes: true });
}

/**
 * Build an ordered install plan (no I/O besides reading source tree layout).
 *
 * @param {string} packageRoot - absolute viepilot package root
 * @param {Record<string, string | undefined>} [envSource] - defaults to process.env
 * @param {{ wantPathShim?: boolean, overrideHomedir?: string }} [opts] - `overrideHomedir`: absolute fake home for tests only. `wantPathShim`: append /usr/local/bin steps (skipped on Windows at apply time).
 * @returns {{ version: number, packageRoot: string, env: ReturnType<typeof normalizeInstallEnv>, home: string, paths: object, steps: object[] }}
 */
function buildInstallPlan(packageRoot, envSource = process.env, opts = {}) {
  const root = path.resolve(packageRoot);
  validateViepilotPackageRoot(root);
  const env = normalizeInstallEnv(envSource);
  const home =
    opts.overrideHomedir != null ? path.resolve(opts.overrideHomedir) : os.homedir();
  const cursorSkillsDir = path.join(home, '.cursor', 'skills');
  const viepilotDir = path.join(home, '.cursor', 'viepilot');
  const viepilotUserDataDir = path.join(home, '.viepilot');
  const viepilotProfilesDir = path.join(viepilotUserDataDir, 'profiles');
  const viepilotProfileMapPath = path.join(viepilotUserDataDir, 'profile-map.md');

  let wantPathShim = opts.wantPathShim;
  if (wantPathShim === undefined) {
    wantPathShim = env.autoYes && env.addPath;
  }

  /** @type {object[]} */
  const steps = [];

  const mkdirTargets = [
    cursorSkillsDir,
    path.join(viepilotDir, 'workflows'),
    path.join(viepilotDir, 'templates', 'project'),
    path.join(viepilotDir, 'templates', 'phase'),
    path.join(viepilotDir, 'bin'),
    path.join(viepilotDir, 'lib'),
    path.join(viepilotDir, 'ui-components'),
  ];
  for (const dir of mkdirTargets) {
    steps.push({ kind: 'mkdir', path: dir });
  }

  steps.push({ kind: 'mkdir', path: viepilotProfilesDir });
  steps.push({
    kind: 'write_file_if_missing',
    path: viepilotProfileMapPath,
    content: VIEPILOT_PROFILE_MAP_SEED,
  });

  for (const name of listSkillDirNames(root)) {
    const src = path.join(root, 'skills', name);
    const dest = path.join(cursorSkillsDir, name);
    if (env.symlinkSkills) {
      steps.push({
        kind: 'symlink_dir',
        target: dest,
        sourceAbsolute: path.resolve(src),
      });
    } else {
      steps.push({ kind: 'copy_dir', from: src, to: dest });
    }
  }

  for (const ent of listDirEntries(root, 'workflows')) {
    const src = path.join(root, 'workflows', ent.name);
    const dest = path.join(viepilotDir, 'workflows', ent.name);
    if (ent.isDirectory()) {
      steps.push({ kind: 'copy_dir', from: src, to: dest });
    } else if (ent.isFile()) {
      steps.push({ kind: 'copy_file', from: src, to: dest });
    }
  }

  for (const ent of listDirEntries(root, path.join('templates', 'project'))) {
    const src = path.join(root, 'templates', 'project', ent.name);
    const dest = path.join(viepilotDir, 'templates', 'project', ent.name);
    if (ent.isDirectory()) {
      steps.push({ kind: 'copy_dir', from: src, to: dest });
    } else if (ent.isFile()) {
      steps.push({ kind: 'copy_file', from: src, to: dest });
    }
  }

  for (const ent of listDirEntries(root, path.join('templates', 'phase'))) {
    const src = path.join(root, 'templates', 'phase', ent.name);
    const dest = path.join(viepilotDir, 'templates', 'phase', ent.name);
    if (ent.isDirectory()) {
      steps.push({ kind: 'copy_dir', from: src, to: dest });
    } else if (ent.isFile()) {
      steps.push({ kind: 'copy_file', from: src, to: dest });
    }
  }

  const uiRoot = path.join(root, 'ui-components');
  if (fs.existsSync(uiRoot)) {
    for (const ent of listDirEntries(root, 'ui-components')) {
      const src = path.join(root, 'ui-components', ent.name);
      const dest = path.join(viepilotDir, 'ui-components', ent.name);
      if (ent.isDirectory()) {
        steps.push({ kind: 'copy_dir', from: src, to: dest });
      } else if (ent.isFile()) {
        steps.push({ kind: 'copy_file', from: src, to: dest });
      }
    }
  }

  const binFiles = ['vp-tools.cjs', 'viepilot.cjs'];
  for (const f of binFiles) {
    steps.push({
      kind: 'copy_file',
      from: path.join(root, 'bin', f),
      to: path.join(viepilotDir, 'bin', f),
    });
  }
  steps.push({
    kind: 'copy_file',
    from: path.join(root, 'lib', 'cli-shared.cjs'),
    to: path.join(viepilotDir, 'lib', 'cli-shared.cjs'),
  });

  for (const f of binFiles) {
    steps.push({
      kind: 'chmod',
      path: path.join(viepilotDir, 'bin', f),
      mode: 0o755,
    });
  }

  steps.push({
    kind: 'note',
    id: 'cloc_optional',
    message:
      'Check optional cloc for README metrics (brew/apt/dnf/choco); installation continues if missing.',
  });

  if (wantPathShim) {
    steps.push({
      kind: 'path_shim',
      links: [
        { path: '/usr/local/bin/vp-tools', target: path.join(viepilotDir, 'bin', 'vp-tools.cjs') },
        { path: '/usr/local/bin/viepilot', target: path.join(viepilotDir, 'bin', 'viepilot.cjs') },
      ],
      note: 'Unix typical; on Windows native, PATH shim may be skipped or manual.',
    });
  }

  return {
    version: 1,
    packageRoot: root,
    env,
    home,
    paths: {
      cursorSkillsDir,
      viepilotDir,
      viepilotUserDataDir,
      viepilotProfilesDir,
      viepilotProfileMapPath,
    },
    steps,
  };
}

/**
 * Human-readable lines for dry-run output.
 * @param {ReturnType<typeof buildInstallPlan>} plan
 * @returns {string[]}
 */
function formatPlanLines(plan) {
  const lines = [];
  lines.push('ViePilot install plan (dry-run)');
  lines.push(`  packageRoot: ${plan.packageRoot}`);
  lines.push(`  profile: ${plan.env.profile} (informational; same file set as install.sh)`);
  lines.push(`  skills: ${plan.paths.cursorSkillsDir}`);
  lines.push(`  viepilot: ${plan.paths.viepilotDir}`);
  if (plan.paths.viepilotUserDataDir) {
    lines.push(`  userData (~/.viepilot): ${plan.paths.viepilotUserDataDir}`);
  }
  lines.push('');
  for (let i = 0; i < plan.steps.length; i++) {
    const s = plan.steps[i];
    const n = i + 1;
    switch (s.kind) {
      case 'mkdir':
        lines.push(`${n}. mkdir -p ${s.path}`);
        break;
      case 'write_file_if_missing':
        lines.push(`${n}. writeFileIfMissing ${s.path}`);
        break;
      case 'copy_file':
        lines.push(`${n}. copy ${s.from} -> ${s.to}`);
        break;
      case 'copy_dir':
        lines.push(`${n}. copyDir ${s.from} -> ${s.to}`);
        break;
      case 'symlink_dir':
        lines.push(`${n}. symlink ${s.target} -> ${s.sourceAbsolute}`);
        break;
      case 'chmod':
        lines.push(`${n}. chmod ${s.mode.toString(8)} ${s.path}`);
        break;
      case 'note':
        lines.push(`${n}. note: ${s.message}`);
        break;
      case 'path_shim':
        lines.push(`${n}. path shim: ${s.links.map((l) => `${l.path} -> ${l.target}`).join('; ')}`);
        if (s.note) lines.push(`    (${s.note})`);
        break;
      default:
        lines.push(`${n}. ${JSON.stringify(s)}`);
    }
  }
  return lines;
}

function removePathIfExists(p) {
  if (fs.existsSync(p)) {
    fs.rmSync(p, { recursive: true, force: true });
  }
}

function ensureDirForFile(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function copyDirRecursive(src, dest) {
  removePathIfExists(dest);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (typeof fs.cpSync === 'function') {
    fs.cpSync(src, dest, { recursive: true });
    return;
  }
  fs.mkdirSync(dest, { recursive: true });
  for (const ent of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, ent.name);
    const d = path.join(dest, ent.name);
    if (ent.isDirectory()) {
      copyDirRecursive(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

function symlinkSkillDir(sourceAbsolute, target) {
  removePathIfExists(target);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const linkType = process.platform === 'win32' ? 'dir' : 'dir';
  fs.symlinkSync(sourceAbsolute, target, linkType);
}

/**
 * Same messaging as install.sh install_cloc_best_effort (non-blocking; no interactive install here).
 * @param {ReturnType<typeof normalizeInstallEnv>} env
 * @returns {string[]}
 */
function getClocGuidanceLines(env) {
  const lines = [];
  try {
    const { execFileSync } = require('child_process');
    execFileSync('cloc', ['--version'], { stdio: 'ignore' });
    lines.push('  ✓ cloc detected');
    return lines;
  } catch (_e) {
    /* continue */
  }
  lines.push('  cloc not found.');
  lines.push('  README metric auto-sync can still run with fallback, but LOC refresh will be skipped.');
  lines.push('  Suggested install:');
  lines.push('    - macOS: brew install cloc');
  lines.push('    - Ubuntu/Debian: sudo apt-get install -y cloc');
  lines.push('    - Windows: choco install cloc');
  if (!env.autoYes) {
    lines.push('  (Interactive cloc install omitted in Node installer; set AUTO_YES and use OS package manager.)');
  }
  return lines;
}

/**
 * Apply install plan to disk (or dry-run log only).
 *
 * @param {ReturnType<typeof buildInstallPlan>} plan
 * @param {{ dryRun?: boolean }} [options]
 * @returns {{ ok: boolean, logs: string[], errors: { step: object, error: Error }[] }}
 */
function applyInstallPlan(plan, options = {}) {
  const dryRun = !!options.dryRun;
  /** @type {string[]} */
  const logs = [];
  /** @type {{ step: object, error: Error }[]} */
  const errors = [];

  for (const step of plan.steps) {
    try {
      switch (step.kind) {
        case 'mkdir':
          if (dryRun) logs.push(`[dry-run] mkdir -p ${step.path}`);
          else fs.mkdirSync(step.path, { recursive: true });
          break;
        case 'write_file_if_missing':
          if (dryRun) logs.push(`[dry-run] writeFileIfMissing ${step.path}`);
          else {
            fs.mkdirSync(path.dirname(step.path), { recursive: true });
            if (!fs.existsSync(step.path)) {
              fs.writeFileSync(step.path, step.content, 'utf8');
            }
          }
          break;
        case 'copy_file':
          if (dryRun) logs.push(`[dry-run] copy ${step.from} -> ${step.to}`);
          else {
            if (!fs.existsSync(step.from)) {
              throw new Error(`Missing source: ${step.from}`);
            }
            ensureDirForFile(step.to);
            fs.copyFileSync(step.from, step.to);
          }
          break;
        case 'copy_dir':
          if (dryRun) logs.push(`[dry-run] copyDir ${step.from} -> ${step.to}`);
          else {
            if (!fs.existsSync(step.from)) {
              throw new Error(`Missing source dir: ${step.from}`);
            }
            copyDirRecursive(step.from, step.to);
          }
          break;
        case 'symlink_dir':
          if (dryRun) {
            logs.push(`[dry-run] symlink ${step.target} -> ${step.sourceAbsolute}`);
          } else {
            symlinkSkillDir(step.sourceAbsolute, step.target);
          }
          break;
        case 'chmod':
          if (dryRun) logs.push(`[dry-run] chmod ${step.mode.toString(8)} ${step.path}`);
          else {
            try {
              fs.chmodSync(step.path, step.mode);
            } catch (e) {
              logs.push(`chmod skipped: ${step.path} (${e.message})`);
            }
          }
          break;
        case 'note':
          if (step.id === 'cloc_optional') {
            logs.push(...getClocGuidanceLines(plan.env));
          } else {
            logs.push(`note: ${step.message}`);
          }
          break;
        case 'path_shim':
          if (process.platform === 'win32') {
            logs.push('path_shim: skipped on Windows (add ~/.cursor/viepilot/bin to PATH manually if needed).');
            break;
          }
          if (dryRun) {
            logs.push(`[dry-run] path_shim: ${step.links.map((l) => `${l.path} -> ${l.target}`).join('; ')}`);
            break;
          }
          for (const L of step.links) {
            try {
              removePathIfExists(L.path);
              fs.mkdirSync(path.dirname(L.path), { recursive: true });
              fs.symlinkSync(L.target, L.path, 'file');
              logs.push(`path_shim: ${L.path} -> ${L.target}`);
            } catch (e) {
              logs.push(`path_shim failed ${L.path}: ${e.message} (try sudo or adjust permissions)`);
            }
          }
          break;
        default:
          logs.push(`unknown step kind: ${JSON.stringify(step)}`);
      }
    } catch (e) {
      errors.push({ step, error: e });
      return { ok: false, logs, errors };
    }
  }

  return { ok: true, logs, errors };
}

module.exports = {
  resolveViepilotPackageRoot,
  normalizeInstallEnv,
  validateViepilotPackageRoot,
  listSkillDirNames,
  buildInstallPlan,
  formatPlanLines,
  applyInstallPlan,
  getClocGuidanceLines,
};
