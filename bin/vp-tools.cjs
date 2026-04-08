#!/usr/bin/env node

/**
 * ViePilot CLI Tools
 * Helper utilities for state management and workflow operations
 * 
 * @package viepilot
 * @author Trần Thành Nhân
 * @license MIT
 * @version 0.1.0
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const os = require('os');

const {
  validators,
  levenshteinDistance,
  findProjectRoot,
  VIEPILOT_DIR,
  getCheckpointTagPrefix,
  isCheckpointTag,
} = require(path.join(__dirname, '../lib/cli-shared.cjs'));

const viepilotInfo = require(path.join(__dirname, '../lib/viepilot-info.cjs'));
const viepilotUpdate = require(path.join(__dirname, '../lib/viepilot-update.cjs'));
const viepilotConfig = require(path.join(__dirname, '../lib/viepilot-config.cjs'));

// ============================================================================
// Output Formatting (TTY-aware)
// ============================================================================

const isTTY = process.stdout.isTTY;
const isInteractive = process.stdin.isTTY && process.stdout.isTTY;

const colors = {
  reset: isTTY ? '\x1b[0m' : '',
  red: isTTY ? '\x1b[31m' : '',
  green: isTTY ? '\x1b[32m' : '',
  yellow: isTTY ? '\x1b[33m' : '',
  blue: isTTY ? '\x1b[34m' : '',
  cyan: isTTY ? '\x1b[36m' : '',
  gray: isTTY ? '\x1b[90m' : '',
  bold: isTTY ? '\x1b[1m' : '',
};

function formatError(message, hint = null) {
  let output = `${colors.red}✖ Error:${colors.reset} ${message}`;
  if (hint) {
    output += `\n${colors.gray}  Hint: ${hint}${colors.reset}`;
  }
  return output;
}

function formatSuccess(message) {
  return `${colors.green}✔${colors.reset} ${message}`;
}

function formatWarning(message) {
  return `${colors.yellow}⚠${colors.reset} ${message}`;
}

function formatInfo(message) {
  return `${colors.blue}ℹ${colors.reset} ${message}`;
}

function validateArgs(validations) {
  for (const validation of validations) {
    if (!validation.valid) {
      console.error(formatError(validation.error, validation.hint));
      process.exit(1);
    }
  }
}

// ============================================================================
// Interactive Prompts
// ============================================================================

async function confirm(message, defaultYes = false) {
  if (!isInteractive) {
    console.log(formatWarning(`Non-interactive mode, assuming ${defaultYes ? 'yes' : 'no'}`));
    return defaultYes;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const defaultHint = defaultYes ? '[Y/n]' : '[y/N]';
  
  return new Promise((resolve) => {
    rl.question(`${colors.yellow}?${colors.reset} ${message} ${colors.gray}${defaultHint}${colors.reset} `, (answer) => {
      rl.close();
      const normalized = answer.trim().toLowerCase();
      if (normalized === '') {
        resolve(defaultYes);
      } else {
        resolve(normalized === 'y' || normalized === 'yes');
      }
    });
  });
}

async function select(message, options) {
  if (!isInteractive) {
    console.log(formatWarning('Non-interactive mode, using first option'));
    return options[0].value;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log(`\n${colors.cyan}?${colors.reset} ${message}\n`);
  options.forEach((opt, i) => {
    console.log(`  ${colors.bold}${i + 1}.${colors.reset} ${opt.label}`);
  });
  console.log();

  return new Promise((resolve) => {
    rl.question(`${colors.gray}Enter choice (1-${options.length}):${colors.reset} `, (answer) => {
      rl.close();
      const index = parseInt(answer, 10) - 1;
      if (index >= 0 && index < options.length) {
        resolve(options[index].value);
      } else {
        console.log(formatWarning('Invalid choice, using first option'));
        resolve(options[0].value);
      }
    });
  });
}

// ============================================================================
// Utility Functions
// ============================================================================

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    return null;
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function readMarkdown(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    return null;
  }
}

function currentTimestamp(format = 'iso') {
  const now = new Date();
  if (format === 'iso') {
    return now.toISOString();
  } else if (format === 'date') {
    return now.toISOString().split('T')[0];
  } else if (format === 'full') {
    return now.toISOString().replace('T', ' ').split('.')[0];
  }
  return now.toISOString();
}

// ============================================================================
// Commands
// ============================================================================

const commands = {
  /**
   * Initialize or get project state
   */
  init: (args) => {
    const projectCheck = validators.requireProjectRoot();
    validateArgs([projectCheck]);
    const projectRoot = projectCheck.value;

    const trackerPath = path.join(projectRoot, VIEPILOT_DIR, 'TRACKER.md');
    const roadmapPath = path.join(projectRoot, VIEPILOT_DIR, 'ROADMAP.md');
    const handoffPath = path.join(projectRoot, VIEPILOT_DIR, 'HANDOFF.json');

    const result = {
      project_root: projectRoot,
      viepilot_dir: path.join(projectRoot, VIEPILOT_DIR),
      tracker_exists: fs.existsSync(trackerPath),
      roadmap_exists: fs.existsSync(roadmapPath),
      handoff_exists: fs.existsSync(handoffPath),
    };

    if (result.handoff_exists) {
      result.handoff = readJson(handoffPath);
    }

    console.log(formatSuccess('Project found'));
    console.log(JSON.stringify(result, null, 2));
  },

  /**
   * Get current timestamp
   */
  'current-timestamp': (args) => {
    const format = args[0] || 'iso';
    const raw = args.includes('--raw');
    
    if (args[0] && !args.includes('--raw')) {
      const formatCheck = validators.isValidTimestampFormat(format);
      validateArgs([formatCheck]);
    }
    
    const ts = currentTimestamp(format);
    if (raw) {
      console.log(ts);
    } else {
      console.log(JSON.stringify({ timestamp: ts }));
    }
  },

  /**
   * Get phase information
   */
  'phase-info': (args) => {
    const phaseNum = args[0];
    
    // Validate phase number
    const phaseCheck = validators.isPositiveInteger(phaseNum, 'Phase number');
    const projectCheck = validators.requireProjectRoot();
    validateArgs([
      phaseNum ? phaseCheck : { valid: false, error: 'Phase number is required', hint: 'Usage: vp-tools phase-info <phase_number>' },
      projectCheck
    ]);
    
    const projectRoot = projectCheck.value;
    const phasesDir = path.join(projectRoot, VIEPILOT_DIR, 'phases');
    
    if (!fs.existsSync(phasesDir)) {
      console.error(formatError('No phases directory found', 'Run /vp-crystallize first to create phases'));
      process.exit(1);
    }
    
    const phaseDirs = fs.readdirSync(phasesDir).filter(d => d.startsWith(String(phaseCheck.value).padStart(2, '0')));

    if (phaseDirs.length === 0) {
      console.error(formatError(`Phase ${phaseNum} not found`, `Available phases in ${phasesDir}`));
      process.exit(1);
    }

    const phaseDir = path.join(phasesDir, phaseDirs[0]);
    const specPath = path.join(phaseDir, 'SPEC.md');
    const statePath = path.join(phaseDir, 'PHASE-STATE.md');
    const tasksDir = path.join(phaseDir, 'tasks');

    const result = {
      phase_number: phaseCheck.value,
      phase_dir: phaseDir,
      phase_slug: phaseDirs[0],
      has_spec: fs.existsSync(specPath),
      has_state: fs.existsSync(statePath),
      tasks: [],
    };

    if (fs.existsSync(tasksDir)) {
      result.tasks = fs.readdirSync(tasksDir)
        .filter(f => f.endsWith('.md'))
        .map(f => ({
          file: f,
          path: path.join(tasksDir, f),
        }));
      result.task_count = result.tasks.length;
    }

    console.log(formatSuccess(`Phase ${phaseCheck.value} found`));
    console.log(JSON.stringify(result, null, 2));
  },

  /**
   * Update task status
   */
  'task-status': (args) => {
    const phaseNum = args[0];
    const taskNum = args[1];
    const status = args[2];

    // Validate all inputs
    const phaseCheck = validators.isPositiveInteger(phaseNum, 'Phase number');
    const taskCheck = validators.isPositiveInteger(taskNum, 'Task number');
    const statusCheck = status ? validators.isValidStatus(status) : { valid: false, error: 'Status is required', hint: 'Valid: not_started, in_progress, done, skipped, blocked' };
    const projectCheck = validators.requireProjectRoot();
    
    validateArgs([
      phaseNum ? phaseCheck : { valid: false, error: 'Phase number is required', hint: 'Usage: vp-tools task-status <phase> <task> <status>' },
      taskNum ? taskCheck : { valid: false, error: 'Task number is required', hint: 'Usage: vp-tools task-status <phase> <task> <status>' },
      statusCheck,
      projectCheck
    ]);

    console.log(formatSuccess(`Task ${phaseCheck.value}.${taskCheck.value} → ${statusCheck.value}`));
    console.log(JSON.stringify({
      updated: true,
      phase: phaseCheck.value,
      task: taskCheck.value,
      status: statusCheck.value,
      timestamp: currentTimestamp(),
    }, null, 2));
  },

  /**
   * Create git commit with standard format
   */
  commit: (args) => {
    const message = args[0];
    const filesArg = args.indexOf('--files');
    let files = [];
    
    if (filesArg !== -1) {
      files = args.slice(filesArg + 1);
    }

    // Validate commit message
    const msgCheck = validators.isNonEmptyString(message, 'Commit message');
    validateArgs([msgCheck]);

    console.log(formatInfo(`Commit: ${msgCheck.value.substring(0, 50)}${msgCheck.value.length > 50 ? '...' : ''}`));
    console.log(JSON.stringify({
      command: 'git',
      args: ['commit', '-m', msgCheck.value],
      files: files,
    }, null, 2));
  },

  /**
   * Calculate progress
   */
  progress: (args) => {
    const projectCheck = validators.requireProjectRoot();
    validateArgs([projectCheck]);
    const projectRoot = projectCheck.value;

    const phasesDir = path.join(projectRoot, VIEPILOT_DIR, 'phases');
    if (!fs.existsSync(phasesDir)) {
      console.log(formatWarning('No phases found'));
      console.log(JSON.stringify({ phases: [], overall: 0 }));
      return;
    }

    const phases = fs.readdirSync(phasesDir)
      .filter(d => fs.statSync(path.join(phasesDir, d)).isDirectory())
      .sort()
      .map(d => {
        const statePath = path.join(phasesDir, d, 'PHASE-STATE.md');
        const specPath = path.join(phasesDir, d, 'SPEC.md');
        const tasksDir = path.join(phasesDir, d, 'tasks');
        
        let taskCount = 0;
        let completedCount = 0;
        
        // Count tasks from SPEC.md table (more reliable)
        if (fs.existsSync(specPath)) {
          const content = readMarkdown(specPath);
          const taskMatches = content.match(/\|\s*\d+\.\d+\s*\|/g);
          taskCount = taskMatches ? taskMatches.length : 0;
        }
        
        // Fallback to tasks directory
        if (taskCount === 0 && fs.existsSync(tasksDir)) {
          taskCount = fs.readdirSync(tasksDir).filter(f => f.endsWith('.md')).length;
        }
        
        // Parse PHASE-STATE.md for completed tasks
        if (fs.existsSync(statePath)) {
          const content = readMarkdown(statePath);
          const doneMatches = content.match(/✅\s*(Done|done|DONE)/gi);
          completedCount = doneMatches ? doneMatches.length : 0;
        }
        
        const progress = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;
        const progressBar = createProgressBar(progress);
        
        return {
          name: d,
          tasks: taskCount,
          completed: completedCount,
          progress,
          progressBar,
        };
      });

    const totalTasks = phases.reduce((sum, p) => sum + p.tasks, 0);
    const totalCompleted = phases.reduce((sum, p) => sum + p.completed, 0);
    const overall = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

    // Display formatted progress
    console.log(`\n${colors.bold}Project Progress${colors.reset}\n`);
    phases.forEach(p => {
      const status = p.progress === 100 ? colors.green + '✅' : p.progress > 0 ? colors.yellow + '🔄' : colors.gray + '⏳';
      console.log(`  ${status}${colors.reset} ${p.name.padEnd(30)} ${p.progressBar} ${String(p.progress).padStart(3)}%`);
    });
    console.log(`  ${'─'.repeat(55)}`);
    console.log(`  ${colors.bold}Overall${colors.reset}${' '.repeat(24)} ${createProgressBar(overall)} ${String(overall).padStart(3)}%\n`);
    
    console.log(JSON.stringify({
      phases: phases.map(p => ({ name: p.name, tasks: p.tasks, completed: p.completed, progress: p.progress })),
      total_tasks: totalTasks,
      total_completed: totalCompleted,
      overall,
    }, null, 2));
  },

  /**
   * Version management
   */
  version: (args) => {
    const action = args[0] || 'get';
    const projectCheck = validators.requireProjectRoot();
    validateArgs([projectCheck]);
    const projectRoot = projectCheck.value;

    const trackerPath = path.join(projectRoot, VIEPILOT_DIR, 'TRACKER.md');
    const content = readMarkdown(trackerPath);
    
    if (!content) {
      console.error(formatError('Cannot read TRACKER.md', 'File may be corrupted or missing'));
      process.exit(1);
    }

    // Extract current version
    const versionMatch = content.match(/```\n([\d.]+[-\w.]*)\n```/);
    const currentVersion = versionMatch ? versionMatch[1] : '0.0.0';

    if (action === 'get') {
      console.log(formatInfo(`Current version: ${colors.bold}${currentVersion}${colors.reset}`));
      console.log(JSON.stringify({ version: currentVersion }));
      return;
    }

    if (action === 'bump') {
      const type = args[1] || 'patch';
      const typeCheck = validators.isValidBumpType(type);
      validateArgs([typeCheck]);
      
      const parts = currentVersion.replace(/-.*/, '').split('.').map(Number);
      
      switch (typeCheck.value) {
        case 'major':
          parts[0]++;
          parts[1] = 0;
          parts[2] = 0;
          break;
        case 'minor':
          parts[1]++;
          parts[2] = 0;
          break;
        case 'patch':
          parts[2]++;
          break;
      }
      
      const newVersion = parts.join('.');
      console.log(formatSuccess(`Version bump: ${currentVersion} → ${colors.bold}${newVersion}${colors.reset} (${typeCheck.value})`));
      console.log(JSON.stringify({
        old_version: currentVersion,
        new_version: newVersion,
        bump_type: typeCheck.value,
      }, null, 2));
      return;
    }

    // Unknown action
    console.error(formatError(`Unknown action: "${action}"`, 'Valid actions: get, bump'));
    process.exit(1);
  },

  /**
   * Reset task or phase state (destructive - requires confirmation)
   */
  reset: async (args) => {
    const target = args[0];
    const force = args.includes('--force') || args.includes('-f');
    
    if (!target) {
      console.error(formatError('Reset target required', 'Usage: vp-tools reset <task|phase|all> [--force]'));
      process.exit(1);
    }

    const validTargets = ['task', 'phase', 'all'];
    if (!validTargets.includes(target)) {
      console.error(formatError(`Invalid reset target: "${target}"`, `Valid targets: ${validTargets.join(', ')}`));
      process.exit(1);
    }

    const projectCheck = validators.requireProjectRoot();
    validateArgs([projectCheck]);

    const warnings = {
      task: 'This will reset the current task status to not_started',
      phase: 'This will reset ALL tasks in the current phase',
      all: 'This will reset ALL phases and tasks to not_started',
    };

    console.log(formatWarning(warnings[target]));

    if (!force) {
      const confirmed = await confirm(`Are you sure you want to reset ${target}?`, false);
      if (!confirmed) {
        console.log(formatInfo('Reset cancelled'));
        process.exit(0);
      }
    }

    console.log(formatSuccess(`Reset ${target} completed`));
    console.log(JSON.stringify({ reset: target, timestamp: currentTimestamp() }, null, 2));
  },

  /**
   * Clean generated files (destructive - requires confirmation)
   */
  clean: async (args) => {
    const force = args.includes('--force') || args.includes('-f');
    const dryRun = args.includes('--dry-run');
    
    const projectCheck = validators.requireProjectRoot();
    validateArgs([projectCheck]);
    const projectRoot = projectCheck.value;

    const filesToClean = [
      path.join(projectRoot, VIEPILOT_DIR, 'HANDOFF.json'),
    ];

    console.log(formatWarning('Files to be removed:'));
    filesToClean.forEach(f => {
      if (fs.existsSync(f)) {
        console.log(`  ${colors.red}✖${colors.reset} ${path.relative(projectRoot, f)}`);
      }
    });

    if (dryRun) {
      console.log(formatInfo('Dry run - no files removed'));
      return;
    }

    if (!force) {
      const confirmed = await confirm('Delete these files?', false);
      if (!confirmed) {
        console.log(formatInfo('Clean cancelled'));
        process.exit(0);
      }
    }

    let removed = 0;
    filesToClean.forEach(f => {
      if (fs.existsSync(f)) {
        fs.unlinkSync(f);
        removed++;
      }
    });

    console.log(formatSuccess(`Cleaned ${removed} file(s)`));
  },

  /**
   * List and manage checkpoints (git tags)
   */
  checkpoints: (args) => {
    const projectCheck = validators.requireProjectRoot();
    validateArgs([projectCheck]);
    const projectRoot = projectCheck.value;

    const { execSync } = require('child_process');
    
    try {
      const tags = execSync('git tag --sort=-creatordate', {
        cwd: projectRoot, 
        encoding: 'utf8' 
      }).trim().split('\n').filter(t => t).filter(isCheckpointTag);

      if (tags.length === 0) {
        console.log(formatWarning('No checkpoints found'));
        return;
      }

      console.log(`\n${colors.bold}ViePilot Checkpoints${colors.reset}\n`);
      console.log(`  ${colors.gray}TAG${' '.repeat(25)}COMMIT    DATE${colors.reset}`);
      console.log(`  ${'─'.repeat(55)}`);

      tags.slice(0, 20).forEach(tag => {
        try {
          const info = execSync(`git log -1 --format="%h %ci" ${tag}`, { 
            cwd: projectRoot, 
            encoding: 'utf8' 
          }).trim();
          const [hash, ...dateParts] = info.split(' ');
          const date = dateParts.slice(0, 2).join(' ');
          
          let icon = '📌';
          if (tag.includes('-complete')) icon = '✅';
          else if (tag.includes('-done')) icon = '✔️';
          else if (tag.includes('-backup')) icon = '💾';
          
          console.log(`  ${icon} ${tag.padEnd(26)} ${hash}  ${date}`);
        } catch (e) {
          console.log(`  📌 ${tag.padEnd(26)} ${colors.gray}(no info)${colors.reset}`);
        }
      });

      if (tags.length > 20) {
        console.log(`\n  ${colors.gray}... and ${tags.length - 20} more${colors.reset}`);
      }
      
      console.log(`\n  Total: ${tags.length} checkpoints\n`);
      
    } catch (error) {
      console.error(formatError('Failed to list checkpoints', error.message));
      process.exit(1);
    }
  },

  /**
   * Output deterministic project-scoped checkpoint tag prefix
   */
  'tag-prefix': (args) => {
    const projectCheck = validators.requireProjectRoot();
    validateArgs([projectCheck]);
    const raw = args.includes('--raw');
    const prefix = getCheckpointTagPrefix(projectCheck.value);
    if (raw) {
      console.log(prefix);
      return;
    }
    console.log(formatInfo(`Checkpoint tag prefix: ${colors.bold}${prefix}${colors.reset}`));
    console.log(JSON.stringify({ prefix }));
  },

  /**
   * Validate git persistence readiness for PASS transitions
   */
  'git-persistence': (args) => {
    const projectCheck = validators.requireProjectRoot();
    validateArgs([projectCheck]);
    const projectRoot = projectCheck.value;
    const strict = args.includes('--strict');
    const { execSync } = require('child_process');

    let cleanWorktree = false;
    let upstreamConfigured = false;
    let aheadCount = null;
    let branch = '';

    try {
      branch = execSync('git branch --show-current', { cwd: projectRoot, encoding: 'utf8' }).trim();
    } catch (_e) {
      branch = '';
    }

    try {
      const status = execSync('git status --porcelain', { cwd: projectRoot, encoding: 'utf8' }).trim();
      cleanWorktree = status.length === 0;
    } catch (_e) {
      cleanWorktree = false;
    }

    try {
      execSync('git rev-parse --abbrev-ref --symbolic-full-name @{u}', { cwd: projectRoot, encoding: 'utf8' });
      upstreamConfigured = true;
    } catch (_e) {
      upstreamConfigured = false;
    }

    if (upstreamConfigured) {
      try {
        const output = execSync('git rev-list --count @{u}..HEAD', { cwd: projectRoot, encoding: 'utf8' }).trim();
        aheadCount = parseInt(output, 10);
      } catch (_e) {
        aheadCount = null;
      }
    }

    const readyForPersistedPass = cleanWorktree && upstreamConfigured && aheadCount === 0;
    const result = {
      branch,
      clean_worktree: cleanWorktree,
      upstream_configured: upstreamConfigured,
      ahead_count: aheadCount,
      ready_for_persisted_pass: readyForPersistedPass,
    };

    console.log(JSON.stringify(result, null, 2));

    if (strict && !readyForPersistedPass) {
      process.exit(1);
    }
  },

  /**
   * Show ViePilot package version, npm latest, skills/workflows inventory (FEAT-008)
   */
  info: (args) => {
    const json = args.includes('--json');
    const root = viepilotInfo.resolveViepilotPackageRoot(path.join(__dirname, '..'));
    if (!root) {
      console.error(
        formatError(
          'Could not locate viepilot package root',
          'Install viepilot globally, use npx from a project with viepilot, or run from a viepilot clone'
        )
      );
      process.exit(1);
    }

    const report = viepilotInfo.buildInfoReport(root);

    if (json) {
      console.log(JSON.stringify(report, null, 2));
      return;
    }

    console.log(`\n${colors.bold}ViePilot bundle${colors.reset}\n`);
    console.log(`  ${colors.cyan}Package root:${colors.reset} ${report.packageRoot}`);
    console.log(`  ${colors.cyan}Installed:${colors.reset}   ${colors.bold}${report.installedVersion}${colors.reset} (${report.packageName})`);

    if (report.latestNpm.ok) {
      const upToDate = report.latestNpm.version === report.installedVersion;
      const marker = upToDate ? colors.green : colors.yellow;
      console.log(
        `  ${colors.cyan}npm latest:${colors.reset}  ${marker}${report.latestNpm.version}${colors.reset}${upToDate ? ' (matches installed)' : ''}`
      );
    } else {
      console.log(`  ${colors.cyan}npm latest:${colors.reset}  ${colors.gray}(unavailable: ${report.latestNpm.error})${colors.reset}`);
    }

    if (report.gitHead) {
      console.log(`  ${colors.cyan}Git HEAD:${colors.reset}   ${report.gitHead.slice(0, 7)}`);
    }

    console.log(`\n${colors.bold}Skills (${report.skills.length})${colors.reset}`);
    report.skills.forEach((s) => {
      const verLabel =
        s.version === 'unspecified'
          ? `${colors.gray}unspecified${colors.reset}`
          : `${colors.bold}v${s.version}${colors.reset}`;
      console.log(`  ${colors.bold}${s.id.padEnd(22)}${colors.reset}  ${verLabel}  ${colors.gray}${s.relativePath}${colors.reset}`);
    });

    console.log(`\n${colors.bold}Workflows (${report.workflows.length})${colors.reset} ${colors.gray}— ${viepilotInfo.WORKFLOW_SEMVER_NOTE}${colors.reset}`);
    report.workflows.forEach((w) => {
      console.log(`  ${colors.bold}${w.id.padEnd(22)}${colors.reset} ${colors.gray}${w.relativePath}${colors.reset}`);
    });
    console.log();
  },

  /**
   * Upgrade viepilot via npm (global, local dependency, or --global) — FEAT-008
   */
  update: async (args) => {
    const dryRun = args.includes('--dry-run');
    const yes = args.includes('--yes');
    const globalFlag = args.includes('--global');
    const startDir = path.join(__dirname, '..');
    const plan = viepilotUpdate.buildUpdatePlan({ startDir, forceGlobal: globalFlag });

    if (!plan.ok) {
      console.error(formatError(plan.error));
      process.exit(1);
    }

    if (plan.alreadyLatest) {
      console.log(
        formatSuccess(
          `viepilot@${plan.installedVersion} is already up to date (npm latest: ${plan.latestVersion}).`
        )
      );
      return;
    }

    if (plan.latestNpmError) {
      console.log(formatWarning(`Could not read npm registry (continuing): ${plan.latestNpmError}`));
    }
    if (plan.ambiguous) {
      console.log(
        formatWarning(
          'ViePilot install path looks like a source clone or unknown layout; using global npm install. Use --global to make this explicit.'
        )
      );
    }

    console.log(`\n${colors.cyan}Planned:${colors.reset} ${plan.displayCommand}\n`);
    console.log(
      `${colors.gray}Rollback (example): npm install -g viepilot@${plan.installedVersion || 'PREVIOUS'}${colors.reset}`
    );

    if (dryRun) {
      console.log(`\n${formatInfo('Dry run — no changes applied.')}`);
      return;
    }

    if (!isInteractive && !yes) {
      console.error(
        formatError(
          'Non-interactive terminal: use --yes to run npm or --dry-run to preview only',
          'Example: vp-tools update --dry-run && vp-tools update --yes'
        )
      );
      process.exit(1);
    }

    if (isInteractive && !yes) {
      const ok = await confirm('Run npm to apply this update?', false);
      if (!ok) {
        console.log(formatWarning('Aborted.'));
        return;
      }
    }

    const result = viepilotUpdate.runNpmUpdate(plan);
    if (!result.ok) {
      process.exit(result.code || 1);
    }
    console.log(formatSuccess('npm update completed.'));
  },

  /**
   * Check for potential conflicts
   */
  conflicts: (args) => {
    const projectCheck = validators.requireProjectRoot();
    validateArgs([projectCheck]);
    const projectRoot = projectCheck.value;

    const { execSync } = require('child_process');
    
    try {
      // Check for uncommitted changes
      const status = execSync('git status --porcelain', { 
        cwd: projectRoot, 
        encoding: 'utf8' 
      }).trim();

      const changes = status.split('\n').filter(l => l);
      
      if (changes.length === 0) {
        console.log(formatSuccess('No conflicts detected - working directory clean'));
        return;
      }

      console.log(`\n${colors.bold}Potential Conflicts${colors.reset}\n`);
      
      const conflicts = {
        modified: [],
        untracked: [],
        deleted: [],
        staged: [],
      };

      changes.forEach(line => {
        const [status, ...fileParts] = line.trim().split(/\s+/);
        const file = fileParts.join(' ');
        
        if (status.includes('M')) conflicts.modified.push(file);
        else if (status === '??') conflicts.untracked.push(file);
        else if (status.includes('D')) conflicts.deleted.push(file);
        else if (status.includes('A') || status.includes('R')) conflicts.staged.push(file);
      });

      if (conflicts.modified.length > 0) {
        console.log(`  ${colors.yellow}Modified files:${colors.reset}`);
        conflicts.modified.forEach(f => console.log(`    ${colors.yellow}M${colors.reset} ${f}`));
      }

      if (conflicts.untracked.length > 0) {
        console.log(`  ${colors.blue}Untracked files:${colors.reset}`);
        conflicts.untracked.forEach(f => console.log(`    ${colors.blue}?${colors.reset} ${f}`));
      }

      if (conflicts.deleted.length > 0) {
        console.log(`  ${colors.red}Deleted files:${colors.reset}`);
        conflicts.deleted.forEach(f => console.log(`    ${colors.red}D${colors.reset} ${f}`));
      }

      if (conflicts.staged.length > 0) {
        console.log(`  ${colors.green}Staged files:${colors.reset}`);
        conflicts.staged.forEach(f => console.log(`    ${colors.green}A${colors.reset} ${f}`));
      }

      console.log(`\n  ${colors.gray}Total: ${changes.length} file(s) with changes${colors.reset}\n`);
      
      console.log(formatWarning('Resolve these before running /vp-auto or /vp-rollback'));
      
    } catch (error) {
      console.error(formatError('Failed to check conflicts', error.message));
      process.exit(1);
    }
  },

  /**
   * Save current state for precise resume
   */
  'save-state': (args) => {
    const projectCheck = validators.requireProjectRoot();
    validateArgs([projectCheck]);
    const projectRoot = projectCheck.value;

    const handoffPath = path.join(projectRoot, VIEPILOT_DIR, 'HANDOFF.json');
    const trackerPath = path.join(projectRoot, VIEPILOT_DIR, 'TRACKER.md');

    // Read current state
    let handoff = {};
    if (fs.existsSync(handoffPath)) {
      handoff = readJson(handoffPath);
    }

    // Get current git info
    const { execSync } = require('child_process');
    let gitInfo = {};
    try {
      gitInfo.head = execSync('git rev-parse HEAD', { cwd: projectRoot, encoding: 'utf8' }).trim();
      gitInfo.branch = execSync('git branch --show-current', { cwd: projectRoot, encoding: 'utf8' }).trim();
      gitInfo.status = execSync('git status --porcelain', { cwd: projectRoot, encoding: 'utf8' }).trim();
    } catch (e) {
      gitInfo.error = e.message;
    }

    // Update handoff with precise state
    handoff.updated_at = currentTimestamp();
    handoff.git = gitInfo;
    handoff.resume_point = {
      timestamp: currentTimestamp(),
      cwd: process.cwd(),
      node_version: process.version,
    };

    // Save
    writeJson(handoffPath, handoff);
    
    console.log(formatSuccess('State saved for resume'));
    console.log(JSON.stringify({
      saved_at: handoff.updated_at,
      phase: handoff.phase,
      task: handoff.task,
      git_head: gitInfo.head?.substring(0, 7),
    }, null, 2));
  },

  /**
   * Hooks scaffold — FEAT-013 adapter system
   * Usage: vp-tools hooks scaffold [--adapter <id>]
   */
  hooks: (args) => {
    const sub = args[0];
    if (!sub || sub === 'help') {
      console.log(`${colors.cyan}Usage:${colors.reset}
  vp-tools hooks scaffold [--adapter <id>]

${colors.cyan}Subcommands:${colors.reset}
  scaffold   Print hook config snippet for the target adapter (default: claude-code)

${colors.cyan}Options:${colors.reset}
  --adapter <id>   Adapter ID: claude-code (default), cursor-agent, cursor-ide

${colors.cyan}Examples:${colors.reset}
  ${colors.gray}$${colors.reset} vp-tools hooks scaffold
  ${colors.gray}$${colors.reset} vp-tools hooks scaffold --adapter cursor-agent`);
      return;
    }
    if (sub === 'scaffold') {
      const adapterArgIdx = args.indexOf('--adapter');
      const adapterId = adapterArgIdx !== -1 ? args[adapterArgIdx + 1] : 'claude-code';
      if (!adapterId) {
        console.error(formatError('--adapter requires a value (e.g. claude-code, cursor-agent)'));
        process.exit(1);
      }
      const { getAdapter } = require(path.join(__dirname, '../lib/adapters/index.cjs'));
      let adapter;
      try {
        adapter = getAdapter(adapterId);
      } catch (e) {
        console.error(formatError(e.message));
        process.exit(1);
      }
      if (!adapter.hooks || !adapter.hooks.configFile) {
        console.log(`Adapter "${adapterId}" (${adapter.name}) does not use a settings.json hook config.`);
        console.log(`For Cursor, hooks are configured via .cursorrules or project MDC files.`);
        process.exit(0);
      }
      const home = os.homedir();
      const configPath = adapter.hooks.configFile(home);
      console.log(`\nViePilot hooks scaffold for: ${adapter.name}`);
      console.log(`Config file: ${configPath}\n`);
      console.log(`Add the following to your ${configPath}:\n`);
      console.log(JSON.stringify({
        hooks: {
          Stop: [{
            matcher: {},
            hooks: [{
              type: 'command',
              command: `node ${path.join(home, '.viepilot', 'hooks', 'brainstorm-staleness.cjs')}`
            }]
          }]
        }
      }, null, 2));
      console.log(`\nNote: brainstorm-staleness.cjs is shipped in FEAT-012.`);
      process.exit(0);
    }
    console.error(formatError(`Unknown hooks subcommand: ${sub}`, 'Use: scaffold'));
    process.exit(1);
  },

  /**
   * Config get/set/reset — ENH-032 language configuration
   */
  config: (args) => {
    const sub = args[0];
    if (!sub || sub === 'help') {
      console.log(`${colors.cyan}Usage:${colors.reset}
  vp-tools config get <key>
  vp-tools config set <key> <value>
  vp-tools config reset

${colors.cyan}Keys:${colors.reset}
  language.communication   Language for AI communication/banners (e.g. en, vi)
  language.document        Language for generated project files (e.g. en, vi)

${colors.cyan}Examples:${colors.reset}
  ${colors.gray}$${colors.reset} vp-tools config get language.communication
  ${colors.gray}$${colors.reset} vp-tools config set language.communication vi
  ${colors.gray}$${colors.reset} vp-tools config reset`);
      return;
    }
    if (sub === 'get') {
      const key = args[1];
      if (!key) {
        console.error(formatError('Missing key', 'Usage: vp-tools config get <key>'));
        process.exit(1);
      }
      const cfg = viepilotConfig.readConfig();
      const parts = key.split('.');
      let val = cfg;
      for (const p of parts) {
        if (val == null || typeof val !== 'object') { val = undefined; break; }
        val = val[p];
      }
      if (val === undefined) {
        console.error(formatError(`Unknown config key: ${key}`));
        process.exit(1);
      }
      console.log(val);
      return;
    }
    if (sub === 'set') {
      const key = args[1];
      const value = args[2];
      if (!key || value === undefined) {
        console.error(formatError('Usage: vp-tools config set <key> <value>'));
        process.exit(1);
      }
      const parts = key.split('.');
      if (parts.length !== 2) {
        console.error(formatError('Key must be in format <section>.<field> (e.g. language.communication)'));
        process.exit(1);
      }
      const [section, field] = parts;
      viepilotConfig.writeConfig({ [section]: { [field]: value } });
      console.log(formatSuccess(`Set ${key} = ${value}`));
      return;
    }
    if (sub === 'reset') {
      viepilotConfig.resetConfig();
      console.log(formatSuccess('Config reset to defaults (communication=en, document=en)'));
      return;
    }
    console.error(formatError(`Unknown config subcommand: ${sub}`, 'Use get, set, or reset'));
    process.exit(1);
  },

  /**
   * Help
   */
  help: (args) => {
    const command = args[0];
    
    const commandHelp = {
      init: {
        usage: 'vp-tools init',
        description: 'Get project initialization state and verify .viepilot/ exists',
        examples: ['vp-tools init'],
      },
      'current-timestamp': {
        usage: 'vp-tools current-timestamp [format] [--raw]',
        description: 'Get current timestamp in specified format',
        options: [
          'format: iso (default), date, full',
          '--raw: Output only the timestamp string',
        ],
        examples: [
          'vp-tools current-timestamp',
          'vp-tools current-timestamp full --raw',
        ],
      },
      'phase-info': {
        usage: 'vp-tools phase-info <phase_number>',
        description: 'Get information about a specific phase',
        examples: [
          'vp-tools phase-info 1',
          'vp-tools phase-info 2',
        ],
      },
      'task-status': {
        usage: 'vp-tools task-status <phase> <task> <status>',
        description: 'Update the status of a task',
        options: [
          'status: not_started, in_progress, done, skipped, blocked',
        ],
        examples: [
          'vp-tools task-status 1 1 in_progress',
          'vp-tools task-status 1 2 done',
        ],
      },
      commit: {
        usage: 'vp-tools commit "<message>" [--files <file1> <file2>...]',
        description: 'Generate git commit command with standard format',
        examples: [
          'vp-tools commit "feat(cli): add validation"',
          'vp-tools commit "fix(core): resolve bug" --files src/index.js',
        ],
      },
      progress: {
        usage: 'vp-tools progress',
        description: 'Calculate and display overall project progress',
        examples: ['vp-tools progress'],
      },
      version: {
        usage: 'vp-tools version [get|bump] [major|minor|patch]',
        description: 'Version management - get current or bump version',
        examples: [
          'vp-tools version',
          'vp-tools version get',
          'vp-tools version bump minor',
        ],
      },
      'tag-prefix': {
        usage: 'vp-tools tag-prefix [--raw]',
        description: 'Return deterministic project-scoped checkpoint tag prefix',
        examples: [
          'vp-tools tag-prefix',
          'vp-tools tag-prefix --raw',
        ],
      },
      'git-persistence': {
        usage: 'vp-tools git-persistence [--strict]',
        description: 'Check if commit/push persistence gate is satisfied',
        examples: [
          'vp-tools git-persistence',
          'vp-tools git-persistence --strict',
        ],
      },
      info: {
        usage: 'vp-tools info [--json]',
        description: 'Show installed ViePilot version, latest npm version, skills & workflows inventory',
        options: ['--json: Machine-readable JSON output'],
        examples: ['vp-tools info', 'vp-tools info --json'],
      },
      update: {
        usage: 'vp-tools update [--dry-run] [--yes] [--global]',
        description: 'Update viepilot to npm latest (local dependency, global install, or explicit --global)',
        options: [
          '--dry-run: Print planned npm command only',
          '--yes: Run npm without confirmation (CI / scripts)',
          '--global: Force npm install -g viepilot@latest',
        ],
        examples: [
          'vp-tools update --dry-run',
          'vp-tools update --yes',
          'vp-tools update --global --dry-run',
        ],
      },
    };

    if (command && commandHelp[command]) {
      const help = commandHelp[command];
      console.log(`\n${colors.bold}${command}${colors.reset}\n`);
      console.log(`  ${help.description}\n`);
      console.log(`  ${colors.cyan}Usage:${colors.reset} ${help.usage}\n`);
      if (help.options) {
        console.log(`  ${colors.cyan}Options:${colors.reset}`);
        help.options.forEach(opt => console.log(`    ${opt}`));
        console.log();
      }
      console.log(`  ${colors.cyan}Examples:${colors.reset}`);
      help.examples.forEach(ex => console.log(`    ${colors.gray}$${colors.reset} ${ex}`));
      console.log();
      return;
    }

    console.log(`
${colors.bold}ViePilot CLI Tools${colors.reset}
${colors.gray}Helper utilities for state management and workflow operations${colors.reset}

${colors.cyan}Usage:${colors.reset}
  vp-tools <command> [options]

${colors.cyan}Commands:${colors.reset}
  ${colors.bold}init${colors.reset}                     Get project initialization state
  ${colors.bold}current-timestamp${colors.reset}        Get current timestamp (iso|date|full) [--raw]
  ${colors.bold}phase-info${colors.reset} <N>           Get phase N information
  ${colors.bold}task-status${colors.reset} <P> <T> <S>  Update task T in phase P to status S
  ${colors.bold}commit${colors.reset} <msg> [--files]   Create git commit command
  ${colors.bold}progress${colors.reset}                 Calculate overall progress
  ${colors.bold}version${colors.reset} [get|bump]       Version management
  ${colors.bold}reset${colors.reset} <target> [-f]      Reset task/phase/all state (interactive)
  ${colors.bold}clean${colors.reset} [-f] [--dry-run]   Clean generated files (interactive)
  ${colors.bold}checkpoints${colors.reset}              List all ViePilot checkpoints (git tags)
  ${colors.bold}tag-prefix${colors.reset} [--raw]       Show project-scoped checkpoint prefix
  ${colors.bold}git-persistence${colors.reset} [--strict] Check commit/push persistence readiness
  ${colors.bold}info${colors.reset} [--json]            Show ViePilot version, npm latest, skills/workflows
  ${colors.bold}update${colors.reset} [--dry-run]       Update viepilot via npm (use --yes non-interactive)
  ${colors.bold}conflicts${colors.reset}                Check for potential conflicts
  ${colors.bold}hooks${colors.reset} scaffold [--adapter] Print hook config snippet for adapter (default: claude-code)
  ${colors.bold}config${colors.reset} <get|set|reset>    Read/write language config (~/.viepilot/config.json)
  ${colors.bold}save-state${colors.reset}               Save current state for precise resume
  ${colors.bold}help${colors.reset} [command]           Show help (optionally for specific command)

${colors.cyan}Examples:${colors.reset}
  ${colors.gray}$${colors.reset} vp-tools init
  ${colors.gray}$${colors.reset} vp-tools phase-info 1
  ${colors.gray}$${colors.reset} vp-tools progress
  ${colors.gray}$${colors.reset} vp-tools version bump minor
  ${colors.gray}$${colors.reset} vp-tools help phase-info

${colors.gray}Run 'vp-tools help <command>' for detailed help on a specific command.${colors.reset}
`);
  },
};

// Helper function for progress bars
function createProgressBar(percent, width = 10) {
  const filled = Math.round(percent / (100 / width));
  const empty = width - filled;
  return `[${colors.green}${'█'.repeat(filled)}${colors.gray}${'░'.repeat(empty)}${colors.reset}]`;
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    commands.help(args.slice(1));
    return;
  }
  
  if (commands[command]) {
    try {
      const result = commands[command](args.slice(1));
      if (result instanceof Promise) {
        await result;
      }
    } catch (error) {
      console.error(formatError(`Command failed: ${error.message}`));
      process.exit(1);
    }
    return;
  }
  
  // Suggest similar commands
  const available = Object.keys(commands);
  const similar = available.filter(cmd => 
    cmd.includes(command) || command.includes(cmd) || 
    levenshteinDistance(cmd, command) <= 2
  );
  
  let hint = `Available commands: ${available.join(', ')}`;
  if (similar.length > 0 && similar.length < available.length) {
    hint = `Did you mean: ${similar.join(', ')}?`;
  }
  
  console.error(formatError(`Unknown command: "${command}"`, hint));
  process.exit(1);
}

if (require.main === module) {
  main().catch((err) => {
    console.error(formatError(`Unexpected error: ${err.message}`));
    process.exit(1);
  });
}
