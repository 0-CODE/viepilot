/**
 * ViePilot filesystem install plan — Node implementation (ENH-017 / Phase 28).
 * Mirrors install.sh steps as a structured plan for dry-run and (later) execution.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { resolveViepilotPackageRoot } = require('./viepilot-info.cjs');

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
 * @param {{ wantPathShim?: boolean }} [opts] - if true, append /usr/local/bin shim steps (non-Windows caution). When VIEPILOT_AUTO_YES=1, defaults follow VIEPILOT_ADD_PATH unless overridden here.
 * @returns {{ version: number, packageRoot: string, env: ReturnType<typeof normalizeInstallEnv>, home: string, paths: object, steps: object[] }}
 */
function buildInstallPlan(packageRoot, envSource = process.env, opts = {}) {
  const root = path.resolve(packageRoot);
  validateViepilotPackageRoot(root);
  const env = normalizeInstallEnv(envSource);
  const home = os.homedir();
  const cursorSkillsDir = path.join(home, '.cursor', 'skills');
  const viepilotDir = path.join(home, '.cursor', 'viepilot');

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
  lines.push('');
  for (let i = 0; i < plan.steps.length; i++) {
    const s = plan.steps[i];
    const n = i + 1;
    switch (s.kind) {
      case 'mkdir':
        lines.push(`${n}. mkdir -p ${s.path}`);
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

module.exports = {
  resolveViepilotPackageRoot,
  normalizeInstallEnv,
  validateViepilotPackageRoot,
  listSkillDirNames,
  buildInstallPlan,
  formatPlanLines,
};
