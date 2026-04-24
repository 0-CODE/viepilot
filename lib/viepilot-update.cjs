/**
 * Plan and run `npm` upgrade for the viepilot package (FEAT-008 / vp-tools update).
 * ENH-072: checkLatestVersion() — non-blocking npm registry check with 24h cache.
 */

const path = require('path');
const fs = require('fs');
const os = require('os');
const https = require('https');
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

/**
 * ENH-072: Check npm registry for a newer ViePilot version, with 24h cache.
 *
 * Silent on all errors — never throws, never crashes a skill invocation.
 *
 * @param {{ force?: boolean, cacheFile?: string, _fetchFn?: function }} opts
 * @returns {Promise<{ upToDate: boolean, installed: string, latest: string }>}
 */
async function checkLatestVersion(opts = {}) {
  const SILENT_RESULT = { upToDate: true, installed: '', latest: '' };
  const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

  try {
    const cacheFile =
      opts.cacheFile || path.join(os.homedir(), '.viepilot', 'update-cache.json');

    // Read installed version from package.json at viepilot package root
    const pkgRoot = viepilotInfo.resolveViepilotPackageRoot(path.join(__dirname, '..'));
    const installed = pkgRoot ? viepilotInfo.readInstalledVersion(pkgRoot) : null;
    if (!installed) return SILENT_RESULT;

    // Check cache unless force
    if (!opts.force) {
      try {
        const raw = fs.readFileSync(cacheFile, 'utf8');
        const cache = JSON.parse(raw);
        if (
          cache &&
          typeof cache.checked_at === 'string' &&
          typeof cache.latest === 'string' &&
          Date.now() - new Date(cache.checked_at).getTime() < TTL_MS
        ) {
          const upToDate = compareSemver(installed, cache.latest) >= 0;
          return { upToDate, installed, latest: cache.latest };
        }
      } catch (_e) {
        // cache missing or unreadable — proceed to network
      }
    }

    // Fetch latest version from npm registry with 3s timeout
    const fetchFn = opts._fetchFn || _fetchNpmLatest;
    let latest;
    try {
      latest = await fetchFn('viepilot');
    } catch (_e) {
      return { upToDate: true, installed, latest: installed };
    }
    if (!latest || typeof latest !== 'string') {
      return { upToDate: true, installed, latest: installed };
    }

    // Write cache
    try {
      const cacheDir = path.dirname(cacheFile);
      fs.mkdirSync(cacheDir, { recursive: true });
      const has_update = compareSemver(installed, latest) < 0;
      fs.writeFileSync(
        cacheFile,
        JSON.stringify({ checked_at: new Date().toISOString(), installed, latest, has_update }),
        'utf8'
      );
    } catch (_e) {
      // cache write failure is non-fatal
    }

    const upToDate = compareSemver(installed, latest) >= 0;
    return { upToDate, installed, latest };
  } catch (_e) {
    return SILENT_RESULT;
  }
}

/**
 * Fetch latest version of a package from npm registry using https (3s timeout).
 * @param {string} pkgName
 * @returns {Promise<string>}
 */
function _fetchNpmLatest(pkgName) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      `https://registry.npmjs.org/${pkgName}/latest`,
      { headers: { 'Accept': 'application/json' } },
      (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            if (data && typeof data.version === 'string') {
              resolve(data.version);
            } else {
              reject(new Error('no version in response'));
            }
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    req.on('error', reject);
    req.setTimeout(3000, () => {
      req.destroy(new Error('timeout'));
    });
  });
}

module.exports = {
  tryGetNpmGlobalViepilotPath,
  classifyInstall,
  compareSemver,
  buildUpdatePlan,
  runNpmUpdate,
  checkLatestVersion,
  _fetchNpmLatest,
};
