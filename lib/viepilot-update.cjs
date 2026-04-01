/**
 * Plan and run `npm` upgrade for the viepilot package (FEAT-008 / vp-tools update).
 */

const path = require('path');
const { spawnSync, execFileSync } = require('child_process');
const viepilotInfo = require('./viepilot-info.cjs');

/**
 * @returns {string|null} absolute path to global .../node_modules/viepilot
 */
function tryGetNpmGlobalViepilotPath() {
  try {
    const root = execFileSync('npm', ['root', '-g'], {
      encoding: 'utf8',
      timeout: 10000,
      windowsHide: true,
    }).trim();
    if (!root) return null;
    return path.resolve(root, 'viepilot');
  } catch (_e) {
    return null;
  }
}

/**
 * @param {string} viepilotPackageRoot
 * @param {boolean} forceGlobal
 * @param {string|null} globalViepilotPath
 */
function classifyInstall(viepilotPackageRoot, forceGlobal, globalViepilotPath) {
  if (forceGlobal) {
    return {
      mode: 'global',
      cwd: undefined,
      npmArgs: ['install', '-g', 'viepilot@latest'],
      ambiguous: false,
    };
  }
  const r = path.resolve(viepilotPackageRoot);
  if (globalViepilotPath) {
    const g = path.resolve(globalViepilotPath);
    if (r === g) {
      return {
        mode: 'global',
        cwd: undefined,
        npmArgs: ['install', '-g', 'viepilot@latest'],
        ambiguous: false,
      };
    }
  }
  const localSuffix = path.join('node_modules', 'viepilot');
  if (r.endsWith(localSuffix)) {
    const projectRoot = path.resolve(viepilotPackageRoot, '..', '..');
    return {
      mode: 'local',
      cwd: projectRoot,
      npmArgs: ['install', 'viepilot@latest'],
      ambiguous: false,
    };
  }
  return {
    mode: 'global',
    cwd: undefined,
    npmArgs: ['install', '-g', 'viepilot@latest'],
    ambiguous: true,
  };
}

/**
 * Rough semver compare for x.y.z (numeric segments only).
 * @returns {-1|0|1|null} null if either side empty
 */
function compareSemver(a, b) {
  if (a == null || b == null || a === '' || b === '') return null;
  const pa = String(a).split(/[.+]/).map((x) => parseInt(x, 10) || 0);
  const pb = String(b).split(/[.+]/).map((x) => parseInt(x, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const da = pa[i] || 0;
    const db = pb[i] || 0;
    if (da < db) return -1;
    if (da > db) return 1;
  }
  return 0;
}

/**
 * @param {{ startDir: string, forceGlobal?: boolean }} opts
 */
function buildUpdatePlan(opts) {
  const startDir = opts.startDir;
  const forceGlobal = Boolean(opts.forceGlobal);
  const root = viepilotInfo.resolveViepilotPackageRoot(startDir);
  if (!root) {
    return { ok: false, error: 'Could not locate viepilot package root' };
  }

  const installed = viepilotInfo.readInstalledVersion(root);
  const latestResult = viepilotInfo.fetchLatestNpmVersion();

  if (latestResult.ok && installed && compareSemver(installed, latestResult.version) >= 0) {
    return {
      ok: true,
      alreadyLatest: true,
      installedVersion: installed,
      latestVersion: latestResult.version,
      viepilotRoot: root,
    };
  }

  const globalViepilotPath = tryGetNpmGlobalViepilotPath();
  const layout = classifyInstall(root, forceGlobal, globalViepilotPath);
  const displayCommand = layout.cwd
    ? `(cwd ${layout.cwd}) npm ${layout.npmArgs.join(' ')}`
    : `npm ${layout.npmArgs.join(' ')}`;

  return {
    ok: true,
    alreadyLatest: false,
    installedVersion: installed,
    latestVersion: latestResult.ok ? latestResult.version : null,
    latestNpmError: latestResult.ok ? null : latestResult.error,
    viepilotRoot: root,
    mode: layout.mode,
    cwd: layout.cwd,
    npmArgs: layout.npmArgs,
    ambiguous: layout.ambiguous,
    displayCommand,
  };
}

/**
 * @param {object} plan - from buildUpdatePlan (not alreadyLatest)
 * @returns {{ ok: boolean, code?: number }}
 */
function runNpmUpdate(plan) {
  const r = spawnSync('npm', plan.npmArgs, {
    cwd: plan.cwd,
    stdio: 'inherit',
    shell: false,
    windowsHide: true,
  });
  if (r.status === 0) {
    return { ok: true };
  }
  return { ok: false, code: r.status == null ? 1 : r.status };
}

module.exports = {
  tryGetNpmGlobalViepilotPath,
  classifyInstall,
  compareSemver,
  buildUpdatePlan,
  runNpmUpdate,
};
