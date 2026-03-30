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

const VIEPILOT_DIR = '.viepilot';
const readline = require('readline');

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

// ============================================================================
// Validation Functions
// ============================================================================

const validators = {
  isPositiveInteger(value, name = 'value') {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 1) {
      return { valid: false, error: `${name} must be a positive integer`, hint: `Got: "${value}"` };
    }
    return { valid: true, value: num };
  },

  isValidStatus(value) {
    const validStatuses = ['not_started', 'in_progress', 'done', 'skipped', 'blocked'];
    if (!validStatuses.includes(value)) {
      return { 
        valid: false, 
        error: `Invalid status: "${value}"`, 
        hint: `Valid statuses: ${validStatuses.join(', ')}` 
      };
    }
    return { valid: true, value };
  },

  isValidTimestampFormat(value) {
    const validFormats = ['iso', 'date', 'full'];
    if (!validFormats.includes(value)) {
      return { 
        valid: false, 
        error: `Invalid timestamp format: "${value}"`, 
        hint: `Valid formats: ${validFormats.join(', ')}` 
      };
    }
    return { valid: true, value };
  },

  isValidBumpType(value) {
    const validTypes = ['major', 'minor', 'patch'];
    if (!validTypes.includes(value)) {
      return { 
        valid: false, 
        error: `Invalid bump type: "${value}"`, 
        hint: `Valid types: ${validTypes.join(', ')}` 
      };
    }
    return { valid: true, value };
  },

  isNonEmptyString(value, name = 'value') {
    if (!value || typeof value !== 'string' || value.trim() === '') {
      return { valid: false, error: `${name} cannot be empty` };
    }
    return { valid: true, value: value.trim() };
  },

  requireProjectRoot() {
    const root = findProjectRoot();
    if (!root) {
      return { 
        valid: false, 
        error: 'No ViePilot project found', 
        hint: 'Run this command from a directory containing .viepilot/' 
      };
    }
    return { valid: true, value: root };
  }
};

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

function findProjectRoot() {
  let dir = process.cwd();
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, VIEPILOT_DIR))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return null;
}

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

// Run main
main().catch(err => {
  console.error(formatError(`Unexpected error: ${err.message}`));
  process.exit(1);
});

// Simple Levenshtein distance for command suggestions
function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] = b.charAt(i - 1) === a.charAt(j - 1)
        ? matrix[i - 1][j - 1]
        : Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
    }
  }
  return matrix[b.length][a.length];
}
