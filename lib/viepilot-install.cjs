/**
 * ViePilot filesystem install plan — Node implementation (ENH-017 / Phase 28).
 * Mirrors install.sh steps as a structured plan for dry-run and (later) execution.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { resolveViepilotPackageRoot } = require('./viepilot-info.cjs');
const { writeConfig } = require('./viepilot-config.cjs');
const { getAdapter } = require('./adapters/index.cjs');

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
    profile: envSource.VIEPILOT_INSTALL_PROFILE || 'claude-code',
    addPath: envSource.VIEPILOT_ADD_PATH === '1',
    symlinkSkills: envSource.VIEPILOT_SYMLINK_SKILLS === '1',
    communicationLang: envSource.VIEPILOT_COMM_LANG || 'en',
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
 * @param {{ wantPathShim?: boolean, overrideHomedir?: string, installTargets?: string[] }} [opts] - `overrideHomedir`: absolute fake home for tests only. `wantPathShim`: append /usr/local/bin steps (skipped on Windows at apply time). `installTargets`: when it includes `claude-code`, also mirror `skills/vp-*` into `~/.claude/skills/` (Claude Code discovery).
 * @returns {{ version: number, packageRoot: string, env: ReturnType<typeof normalizeInstallEnv>, home: string, paths: object, steps: object[] }}
 */
function buildInstallPlan(packageRoot, envSource = process.env, opts = {}) {
  const root = path.resolve(packageRoot);
  validateViepilotPackageRoot(root);
  const env = normalizeInstallEnv(envSource);
  const home =
    opts.overrideHomedir != null ? path.resolve(opts.overrideHomedir) : os.homedir();
  const viepilotUserDataDir = path.join(home, '.viepilot');
  const viepilotProfilesDir = path.join(viepilotUserDataDir, 'profiles');
  const viepilotProfileMapPath = path.join(viepilotUserDataDir, 'profile-map.md');

  const installTargets = Array.isArray(opts.installTargets) ? opts.installTargets : [];

  // Resolve target IDs to adapters.
  // Backward compat: if no installTargets, infer from env.profile (cursor-agent/cursor-ide → cursor).
  // Default: claude-code (FEAT-013 — Claude Code is primary platform).
  let targetIds;
  if (installTargets.length > 0) {
    targetIds = installTargets;
  } else if (env.profile === 'cursor-agent' || env.profile === 'cursor-ide') {
    targetIds = [env.profile];
  } else {
    targetIds = ['claude-code'];
  }

  // Deduplicate by adapter canonical id (cursor-agent + cursor-ide → one cursor install).
  const seenAdapterIds = new Set();
  const selectedAdapters = [];
  for (const id of targetIds) {
    const adapter = getAdapter(id);
    if (!seenAdapterIds.has(adapter.id)) {
      seenAdapterIds.add(adapter.id);
      selectedAdapters.push(adapter);
    }
  }

  let wantPathShim = opts.wantPathShim;
  if (wantPathShim === undefined) {
    wantPathShim = env.autoYes && env.addPath;
  }

  /** @type {object[]} */
  const steps = [];

  steps.push({ kind: 'mkdir', path: viepilotProfilesDir });
  steps.push({
    kind: 'write_file_if_missing',
    path: viepilotProfileMapPath,
    content: VIEPILOT_PROFILE_MAP_SEED,
  });

  const binFiles = ['vp-tools.cjs', 'viepilot.cjs'];
  const uiRoot = path.join(root, 'ui-components');

  // One install loop per selected adapter (replaces cursor block + claude-code if-block).
  for (const adapter of selectedAdapters) {
    const skillsDir = adapter.skillsDir(home);
    const vpDir = adapter.viepilotDir(home);

    // mkdir: skills dir + all viepilot subdirs
    steps.push({ kind: 'mkdir', path: skillsDir });
    for (const sub of adapter.installSubdirs) {
      steps.push({ kind: 'mkdir', path: path.join(vpDir, sub) });
    }

    // copy skills into skillsDir
    for (const name of listSkillDirNames(root)) {
      const src = path.join(root, 'skills', name);
      const dest = path.join(skillsDir, name);
      if (env.symlinkSkills) {
        steps.push({ kind: 'symlink_dir', target: dest, sourceAbsolute: path.resolve(src) });
      } else {
        steps.push({ kind: 'copy_dir', from: src, to: dest });
      }
    }

    // copy viepilot files into vpDir
    for (const ent of listDirEntries(root, 'workflows')) {
      const src = path.join(root, 'workflows', ent.name);
      const dest = path.join(vpDir, 'workflows', ent.name);
      steps.push(ent.isDirectory() ? { kind: 'copy_dir', from: src, to: dest } : { kind: 'copy_file', from: src, to: dest });
    }
    for (const ent of listDirEntries(root, path.join('templates', 'project'))) {
      const src = path.join(root, 'templates', 'project', ent.name);
      const dest = path.join(vpDir, 'templates', 'project', ent.name);
      steps.push(ent.isDirectory() ? { kind: 'copy_dir', from: src, to: dest } : { kind: 'copy_file', from: src, to: dest });
    }
    for (const ent of listDirEntries(root, path.join('templates', 'phase'))) {
      const src = path.join(root, 'templates', 'phase', ent.name);
      const dest = path.join(vpDir, 'templates', 'phase', ent.name);
      steps.push(ent.isDirectory() ? { kind: 'copy_dir', from: src, to: dest } : { kind: 'copy_file', from: src, to: dest });
    }
    for (const ent of listDirEntries(root, path.join('templates', 'architect'))) {
      const src = path.join(root, 'templates', 'architect', ent.name);
      const dest = path.join(vpDir, 'templates', 'architect', ent.name);
      steps.push(ent.isDirectory() ? { kind: 'copy_dir', from: src, to: dest } : { kind: 'copy_file', from: src, to: dest });
    }
    for (const f of binFiles) {
      steps.push({ kind: 'copy_file', from: path.join(root, 'bin', f), to: path.join(vpDir, 'bin', f) });
    }
    // BUG-024: dynamic lib/ scan — copies ALL files + subdirs (adapters/, hooks/, domain-packs/, etc.)
    for (const ent of listDirEntries(root, 'lib')) {
      const src = path.join(root, 'lib', ent.name);
      const dest = path.join(vpDir, 'lib', ent.name);
      steps.push(ent.isDirectory() ? { kind: 'copy_dir', from: src, to: dest } : { kind: 'copy_file', from: src, to: dest });
    }
    if (fs.existsSync(uiRoot)) {
      for (const ent of listDirEntries(root, 'ui-components')) {
        const src = path.join(root, 'ui-components', ent.name);
        const dest = path.join(vpDir, 'ui-components', ent.name);
        steps.push(ent.isDirectory() ? { kind: 'copy_dir', from: src, to: dest } : { kind: 'copy_file', from: src, to: dest });
      }
    }
    // ENH-057: copy agents/ directory (agents layer added in v2.20.0)
    const agentsRoot = path.join(root, 'agents');
    if (fs.existsSync(agentsRoot)) {
      for (const ent of listDirEntries(root, 'agents')) {
        const src = path.join(root, 'agents', ent.name);
        const dest = path.join(vpDir, 'agents', ent.name);
        steps.push(ent.isDirectory() ? { kind: 'copy_dir', from: src, to: dest } : { kind: 'copy_file', from: src, to: dest });
      }
    }
    // BUG-007: copy package.json so resolveViepilotPackageRoot() finds the root
    steps.push({ kind: 'copy_file', from: path.join(root, 'package.json'), to: path.join(vpDir, 'package.json') });

    // chmod bin files
    for (const f of binFiles) {
      steps.push({ kind: 'chmod', path: path.join(vpDir, 'bin', f), mode: 0o755 });
    }

    // resolve {envToolDir} placeholder → adapter's actual install base (ENH-035)
    steps.push({
      kind: 'rewrite_paths_in_dir',
      dir: skillsDir,
      glob: '**/*.md',
      from: '{envToolDir}',
      to: adapter.executionContextBase,
    });
  }

  steps.push({
    kind: 'note',
    id: 'cloc_optional',
    message:
      'Check optional cloc for README metrics (brew/apt/dnf/choco); installation continues if missing.',
  });

  const primaryAdapter = selectedAdapters[0];
  const primaryVpDir = primaryAdapter.viepilotDir(home);

  if (wantPathShim) {
    steps.push({
      kind: 'path_shim',
      links: [
        { path: '/usr/local/bin/vp-tools', target: path.join(primaryVpDir, 'bin', 'vp-tools.cjs') },
        { path: '/usr/local/bin/viepilot', target: path.join(primaryVpDir, 'bin', 'viepilot.cjs') },
      ],
      note: 'Unix typical; on Windows native, PATH shim may be skipped or manual.',
    });
  }

  // ENH-032 / ENH-078: write selected communication language; lang chosen interactively in CLI
  steps.push({
    kind: 'language_config_prompt',
    communicationLang: env.communicationLang,
    autoYes: env.autoYes,
    home,
  });

  // Build paths object — legacy keys preserved for backward compat with existing tests/CLI.
  const cursorAdapter = selectedAdapters.find((a) => a.id === 'cursor');
  const claudeAdapter = selectedAdapters.find((a) => a.id === 'claude-code');

  return {
    version: 1,
    packageRoot: root,
    env,
    home,
    paths: {
      skillsDir: primaryAdapter.skillsDir(home),
      viepilotDir: primaryAdapter.viepilotDir(home),
      // Legacy keys for backward compat:
      cursorSkillsDir: cursorAdapter ? cursorAdapter.skillsDir(home) : null,
      claudeSkillsDir: claudeAdapter ? claudeAdapter.skillsDir(home) : null,
      claudeViepilotDir: claudeAdapter ? claudeAdapter.viepilotDir(home) : null,
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
  lines.push(`  profile: ${plan.env.profile}`);
  lines.push(`  skills: ${plan.paths.skillsDir}`);
  if (plan.paths.cursorSkillsDir && plan.paths.cursorSkillsDir !== plan.paths.skillsDir) {
    lines.push(`  skills (Cursor): ${plan.paths.cursorSkillsDir}`);
  }
  if (plan.paths.claudeSkillsDir && plan.paths.claudeSkillsDir !== plan.paths.skillsDir) {
    lines.push(`  skills (Claude Code): ${plan.paths.claudeSkillsDir}`);
  }
  if (plan.paths.claudeViepilotDir && plan.paths.claudeViepilotDir !== plan.paths.viepilotDir) {
    lines.push(`  viepilot (Claude Code): ${plan.paths.claudeViepilotDir}`);
  }
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
      case 'rewrite_paths_in_dir':
        lines.push(`${n}. rewrite_paths_in_dir ${s.dir}: "${s.from}" → "${s.to}" in ${s.glob}`);
        break;
      case 'language_config_prompt':
        lines.push(`${n}. language_config_prompt: write ~/.viepilot/config.json (communication + document language; ${s.autoYes ? 'auto-yes → defaults' : 'interactive'})`);
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
            logs.push('path_shim: skipped on Windows (add viepilot/bin to PATH manually if needed).');
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
        case 'rewrite_paths_in_dir': {
          if (dryRun) {
            logs.push(`[dry-run] rewrite_paths_in_dir ${step.dir}: "${step.from}" → "${step.to}" in ${step.glob}`);
            break;
          }
          const rewriteDir = (dir) => {
            if (!fs.existsSync(dir)) return;
            for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
              const fullPath = path.join(dir, ent.name);
              if (ent.isDirectory()) {
                rewriteDir(fullPath);
              } else if (ent.isFile() && ent.name.endsWith('.md')) {
                const content = fs.readFileSync(fullPath, 'utf8');
                if (content.includes(step.from)) {
                  fs.writeFileSync(fullPath, content.split(step.from).join(step.to), 'utf8');
                  logs.push(`rewrite: ${fullPath}`);
                }
              }
            }
          };
          rewriteDir(step.dir);
          break;
        }
        case 'language_config_prompt': {
          const commLang = step.communicationLang ?? 'en';
          if (dryRun) {
            logs.push(`[dry-run] language_config_prompt: would write ~/.viepilot/config.json with communication=${commLang}, document=en`);
            break;
          }
          writeConfig({ language: { communication: commLang, document: 'en' } }, step.home);
          logs.push(`language_config_prompt: wrote ${step.home}/.viepilot/config.json (communication=${commLang}, document=en)`);
          break;
        }
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
