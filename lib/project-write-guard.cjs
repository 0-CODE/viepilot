/**
 * BUG-007: enforce that shipping edits target project cwd only.
 * Install paths (~/.claude/viepilot, ~/.cursor/viepilot) are never valid write targets.
 */

const path = require('path');
const os = require('os');

/**
 * True if `target` is the same as `base` or a path inside `base` (pure path logic; no I/O).
 * @param {string} base
 * @param {string} target
 */
function isPathInsideOrEqual(base, target) {
  const b = path.resolve(base);
  const t = path.resolve(target);
  const rel = path.relative(b, t);
  if (rel === '') return true;
  if (path.isAbsolute(rel)) return false;
  return !rel.startsWith(`..${path.sep}`) && rel !== '..';
}

/**
 * @param {string} projectRoot
 * @param {string} candidatePath
 * @param {{ homedir?: string }} [options]
 * @returns {{ ok: boolean, code: string, message?: string }}
 */
function validateWriteTarget(projectRoot, candidatePath, options = {}) {
  const homedir = options.homedir ?? os.homedir();

  if (!projectRoot || candidatePath == null || String(candidatePath).trim() === '') {
    return {
      ok: false,
      code: 'invalid_args',
      message: 'projectRoot and non-empty candidatePath are required',
    };
  }

  const rootResolved = path.resolve(projectRoot);
  const abs = path.isAbsolute(candidatePath)
    ? path.resolve(candidatePath)
    : path.resolve(rootResolved, candidatePath);

  if (isPathInsideOrEqual(rootResolved, abs)) {
    return { ok: true, code: 'ok' };
  }

  const installRoots = [
    path.resolve(homedir, '.claude', 'viepilot'),
    path.resolve(homedir, '.cursor', 'viepilot'),
  ];

  for (const ir of installRoots) {
    if (isPathInsideOrEqual(ir, abs)) {
      return {
        ok: false,
        code: 'install_path',
        message: 'Edit target is under ViePilot install path (READ-ONLY).',
      };
    }
  }

  return {
    ok: false,
    code: 'outside_project',
    message: 'Edit target is outside project working directory.',
  };
}

module.exports = {
  validateWriteTarget,
  isPathInsideOrEqual,
};
