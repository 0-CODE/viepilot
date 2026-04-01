#!/usr/bin/env node

/**
 * Guided installer entrypoint for `npx viepilot`.
 */

const path = require('path');
const readline = require('readline');
const fs = require('fs');
const os = require('os');
const { buildInstallPlan, applyInstallPlan, resolveViepilotPackageRoot } = require(path.join(
  __dirname,
  '..',
  'lib',
  'viepilot-install.cjs',
));

const TARGETS = [
  { id: 'claude-code', label: 'Claude Code' },
  { id: 'cursor-agent', label: 'Cursor Agent' },
  { id: 'cursor-ide', label: 'Cursor IDE' },
];

function printHelp() {
  console.log(`
ViePilot CLI

Usage:
  viepilot install [options]
  viepilot uninstall [options]
  viepilot --help
  viepilot --list-targets

Install options:
  --target <id|id,id|all>   Target profile(s): claude-code (mirrors vp-* to ~/.claude/skills), cursor-agent, cursor-ide
  --yes                      Non-interactive mode (skip confirmations)
  --dry-run                  Print actions only (Node installer; no bash)
  --list-targets             Print supported targets and exit
  --help                     Show help

Uninstall options:
  --target <id|id,id|all>   Remove assets (claude-code: ~/.claude/skills/vp-*; cursor-*: ~/.cursor/skills/vp-*; shared: ~/.cursor/viepilot)
  --yes                     Non-interactive mode (skip confirmations)
  --dry-run                 Print actions only, do not remove files
`);
}

function printTargets() {
  TARGETS.forEach((t) => {
    console.log(`${t.id}\t${t.label}`);
  });
}

function parseInstallArgs(args) {
  const options = {
    yes: false,
    dryRun: false,
    listTargets: false,
    targets: null,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--yes') options.yes = true;
    else if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--list-targets') options.listTargets = true;
    else if (arg === '--target') {
      const value = args[i + 1];
      if (!value) {
        throw new Error('Missing value for --target');
      }
      options.targets = value;
      i++;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  return options;
}

function parseUninstallArgs(args) {
  const options = {
    yes: false,
    dryRun: false,
    targets: null,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--yes') options.yes = true;
    else if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--target') {
      const value = args[i + 1];
      if (!value) {
        throw new Error('Missing value for --target');
      }
      options.targets = value;
      i++;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  return options;
}

function normalizeTargets(rawTargets) {
  if (!rawTargets) return null;
  if (rawTargets === 'all') return TARGETS.map((t) => t.id);
  const allowed = new Set(TARGETS.map((t) => t.id));
  const parsed = rawTargets.split(',').map((s) => s.trim()).filter(Boolean);
  if (parsed.length === 0) throw new Error('No targets provided');
  for (const item of parsed) {
    if (!allowed.has(item)) throw new Error(`Unsupported target: ${item}`);
  }
  return [...new Set(parsed)];
}

function createSelectorState(items, mode = 'multi') {
  return {
    mode,
    items,
    cursor: 0,
    selected: mode === 'single' ? new Set([0]) : new Set(),
  };
}

function applySelectorKey(state, keyName) {
  const next = {
    ...state,
    selected: new Set([...state.selected]),
  };
  const lastIndex = next.items.length - 1;

  if (keyName === 'up') {
    next.cursor = next.cursor === 0 ? lastIndex : next.cursor - 1;
    return next;
  }
  if (keyName === 'down') {
    next.cursor = next.cursor === lastIndex ? 0 : next.cursor + 1;
    return next;
  }
  if (keyName === 'space') {
    if (next.mode === 'single') {
      next.selected = new Set([next.cursor]);
    } else if (next.selected.has(next.cursor)) {
      next.selected.delete(next.cursor);
    } else {
      next.selected.add(next.cursor);
    }
    return next;
  }
  return next;
}

function renderSelector(state, title) {
  process.stdout.write('\x1Bc');
  console.log(title);
  console.log('');
  for (let i = 0; i < state.items.length; i++) {
    const item = state.items[i];
    const isCursor = i === state.cursor;
    const isSelected = state.selected.has(i);
    const marker = state.mode === 'single' ? (isSelected ? '(*)' : '( )') : (isSelected ? '[x]' : '[ ]');
    const pointer = isCursor ? '>' : ' ';
    console.log(`${pointer} ${marker} ${item.label} (${item.id})`);
  }
  console.log('');
  console.log('Keys: ↑/↓ move, space select, enter confirm, q cancel');
}

function runKeyboardSelector(items, mode, title) {
  return new Promise((resolve) => {
    let state = createSelectorState(items, mode);
    renderSelector(state, title);
    readline.emitKeypressEvents(process.stdin);
    const shouldRestoreRaw = process.stdin.isTTY;
    if (shouldRestoreRaw) process.stdin.setRawMode(true);

    const onKeypress = (_, key) => {
      if (!key) return;
      if (key.name === 'q' || (key.ctrl && key.name === 'c')) {
        cleanup();
        resolve([]);
        return;
      }
      if (key.name === 'return') {
        const selected = [...state.selected].sort((a, b) => a - b).map((idx) => state.items[idx].id);
        cleanup();
        resolve(selected);
        return;
      }
      if (['up', 'down', 'space'].includes(key.name)) {
        state = applySelectorKey(state, key.name);
        renderSelector(state, title);
      }
    };

    const cleanup = () => {
      process.stdin.off('keypress', onKeypress);
      if (shouldRestoreRaw) process.stdin.setRawMode(false);
      console.log('');
    };

    process.stdin.on('keypress', onKeypress);
  });
}

function ask(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function interactiveTargetSelection() {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    console.log('\nSelect install targets (comma-separated numbers):');
    TARGETS.forEach((t, idx) => {
      console.log(`  ${idx + 1}. ${t.label} (${t.id})`);
    });
    console.log(`  ${TARGETS.length + 1}. All targets`);
    console.log('  0. Cancel');
    const answer = await ask('Choice: ');
    if (answer === '0') return [];
    if (answer === String(TARGETS.length + 1)) return TARGETS.map((t) => t.id);
    const indexes = answer
      .split(',')
      .map((x) => Number(x.trim()))
      .filter((n) => Number.isInteger(n) && n >= 1 && n <= TARGETS.length);
    return [...new Set(indexes.map((n) => TARGETS[n - 1].id))];
  }
  return runKeyboardSelector(TARGETS, 'multi', 'Select install targets');
}

/**
 * Core bundle (workflows, bin, ~/.cursor/viepilot) is shared; `claude-code` additionally mirrors vp-* skills into ~/.claude/skills.
 * @param {string[]} selectedTargets
 * @param {boolean} dryRun
 * @returns {{ ok: boolean, code: number }}
 */
function runInstallViaNode(selectedTargets, dryRun) {
  const fallbackRoot = path.join(__dirname, '..');
  const pkgRoot = resolveViepilotPackageRoot(fallbackRoot) || fallbackRoot;
  const profile = selectedTargets[0] || 'cursor-ide';
  const env = {
    ...process.env,
    VIEPILOT_AUTO_YES: '1',
    VIEPILOT_INSTALL_PROFILE: profile,
  };
  const wantPathShim = env.VIEPILOT_ADD_PATH === '1';

  let plan;
  try {
    plan = buildInstallPlan(pkgRoot, env, { wantPathShim, installTargets: selectedTargets });
  } catch (err) {
    console.error(err.message);
    return { ok: false, code: 1 };
  }

  console.log('');
  console.log('ViePilot install (Node — no bash required)');
  console.log(`  Package: ${pkgRoot}`);
  console.log(`  Targets: ${selectedTargets.join(', ')}`);
  if (selectedTargets.includes('claude-code')) {
    console.log('  (claude-code → also ~/.claude/skills/vp-*)');
  }

  const applied = applyInstallPlan(plan, { dryRun });
  if (applied.logs.length > 0) {
    console.log('');
    console.log(applied.logs.join('\n'));
  }
  if (!applied.ok && applied.errors.length > 0) {
    const first = applied.errors[0];
    const msg = first.error && first.error.message ? first.error.message : String(first.error);
    console.error(msg);
  }

  return { ok: applied.ok, code: applied.ok ? 0 : 1 };
}

async function installCommand(rawArgs) {
  const options = parseInstallArgs(rawArgs);
  if (options.help) {
    printHelp();
    return 0;
  }
  if (options.listTargets) {
    printTargets();
    return 0;
  }

  let selectedTargets = normalizeTargets(options.targets);

  if (!selectedTargets) {
    if (options.yes) {
      selectedTargets = TARGETS.map((t) => t.id);
      console.log('No --target provided with --yes; defaulting to all targets.');
    } else {
      selectedTargets = await interactiveTargetSelection();
      if (selectedTargets.length === 0) {
        console.log('Installation canceled.');
        return 0;
      }
    }
  }

  console.log(`\nSelected targets: ${selectedTargets.join(', ')}`);
  const run = runInstallViaNode(selectedTargets, options.dryRun);
  const results = selectedTargets.map((target) => ({
    ok: run.ok,
    target,
    dryRun: options.dryRun,
    code: run.code,
  }));
  const failed = results.filter((r) => !r.ok);

  console.log('\nInstall summary:');
  for (const r of results) {
    if (r.ok && r.dryRun) console.log(`- ${r.target}: planned`);
    else if (r.ok) console.log(`- ${r.target}: installed`);
    else console.log(`- ${r.target}: failed (exit ${r.code})`);
  }
  console.log('\nNext actions:');
  console.log('- Cursor: open project and run /vp-status');
  console.log('- Claude Code: restart session if needed so ~/.claude/skills/vp-* is picked up; then /vp-status');
  console.log('- If needed, run /vp-brainstorm then /vp-crystallize');

  return failed.length === 0 ? 0 : 1;
}

function computeUninstallPaths(targets) {
  const home = process.env.HOME || os.homedir() || '';
  const cursorSkills = path.join(home, '.cursor', 'skills');
  const vpRoot = path.join(home, '.cursor', 'viepilot');
  const paths = [];

  if (targets.some((t) => t === 'cursor-agent' || t === 'cursor-ide')) {
    if (fs.existsSync(cursorSkills)) {
      for (const entry of fs.readdirSync(cursorSkills)) {
        if (entry.startsWith('vp-')) {
          paths.push(path.join(cursorSkills, entry));
        }
      }
    } else {
      paths.push(path.join(cursorSkills, 'vp-*'));
    }
  }

  if (targets.some((t) => t === 'claude-code')) {
    const claudeSkills = path.join(home, '.claude', 'skills');
    if (fs.existsSync(claudeSkills)) {
      for (const entry of fs.readdirSync(claudeSkills)) {
        if (entry.startsWith('vp-')) {
          paths.push(path.join(claudeSkills, entry));
        }
      }
    }
  }

  paths.push(vpRoot);
  paths.push('/usr/local/bin/vp-tools');
  paths.push('/usr/local/bin/viepilot');

  return [...new Set(paths)];
}

function removePathSafely(targetPath, dryRun) {
  if (!fs.existsSync(targetPath)) {
    return { path: targetPath, status: 'missing' };
  }
  if (dryRun) {
    return { path: targetPath, status: 'planned' };
  }
  try {
    fs.rmSync(targetPath, { recursive: true, force: true });
    return { path: targetPath, status: 'removed' };
  } catch (error) {
    return { path: targetPath, status: 'failed', reason: error.message };
  }
}

async function uninstallCommand(rawArgs) {
  const options = parseUninstallArgs(rawArgs);
  if (options.help) {
    printHelp();
    return 0;
  }
  let selectedTargets = normalizeTargets(options.targets);
  if (!selectedTargets) {
    if (options.yes) {
      selectedTargets = TARGETS.map((t) => t.id);
    } else if (process.stdin.isTTY && process.stdout.isTTY) {
      selectedTargets = await runKeyboardSelector(TARGETS, 'single', 'Select uninstall profile');
      if (selectedTargets.length === 0) {
        console.log('Uninstall canceled.');
        return 0;
      }
    } else {
      selectedTargets = TARGETS.map((t) => t.id);
    }
  }

  if (!options.yes && (!process.stdin.isTTY || !process.stdout.isTTY)) {
    throw new Error('Non-interactive uninstall requires --yes');
  }
  if (!options.yes) {
    const answer = await ask(`Uninstall ViePilot for target ${selectedTargets.join(', ')}? (y/N) `);
    if (!/^y(es)?$/i.test(answer)) {
      console.log('Uninstall canceled.');
      return 0;
    }
  }

  const actions = computeUninstallPaths(selectedTargets).map((p) => removePathSafely(p, options.dryRun));
  const failed = actions.filter((a) => a.status === 'failed');

  console.log('\nUninstall summary:');
  for (const action of actions) {
    if (action.status === 'removed') console.log(`- ${action.path}: removed`);
    else if (action.status === 'planned') console.log(`- ${action.path}: planned`);
    else if (action.status === 'missing') console.log(`- ${action.path}: not found`);
    else console.log(`- ${action.path}: failed (${action.reason})`);
  }

  return failed.length === 0 ? 0 : 1;
}

async function main() {
  const [, , command, ...rest] = process.argv;
  if (!command || command === '--help' || command === '-h') {
    printHelp();
    process.exit(0);
  }
  if (command === '--list-targets') {
    printTargets();
    process.exit(0);
  }
  if (command !== 'install' && command !== 'uninstall') {
    console.error(`Unknown command: ${command}`);
    printHelp();
    process.exit(1);
  }

  try {
    const code = command === 'install' ? await installCommand(rest) : await uninstallCommand(rest);
    process.exit(code);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  parseInstallArgs,
  parseUninstallArgs,
  normalizeTargets,
  createSelectorState,
  applySelectorKey,
  computeUninstallPaths,
};
