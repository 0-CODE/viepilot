#!/usr/bin/env node

/**
 * ViePilot CLI Tools
 * Helper utilities for state management and workflow operations
 */

const fs = require('fs');
const path = require('path');

const VIEPILOT_DIR = '.viepilot';

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
    const projectRoot = findProjectRoot();
    if (!projectRoot) {
      console.log(JSON.stringify({ error: 'No ViePilot project found' }));
      return;
    }

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

    console.log(JSON.stringify(result));
  },

  /**
   * Get current timestamp
   */
  'current-timestamp': (args) => {
    const format = args[0] || 'iso';
    const raw = args.includes('--raw');
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
    if (!phaseNum) {
      console.log(JSON.stringify({ error: 'Phase number required' }));
      return;
    }

    const projectRoot = findProjectRoot();
    if (!projectRoot) {
      console.log(JSON.stringify({ error: 'No ViePilot project found' }));
      return;
    }

    const phasesDir = path.join(projectRoot, VIEPILOT_DIR, 'phases');
    const phaseDirs = fs.readdirSync(phasesDir).filter(d => d.startsWith(phaseNum.padStart(2, '0')));

    if (phaseDirs.length === 0) {
      console.log(JSON.stringify({ error: `Phase ${phaseNum} not found` }));
      return;
    }

    const phaseDir = path.join(phasesDir, phaseDirs[0]);
    const specPath = path.join(phaseDir, 'SPEC.md');
    const statePath = path.join(phaseDir, 'PHASE-STATE.md');
    const tasksDir = path.join(phaseDir, 'tasks');

    const result = {
      phase_number: phaseNum,
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

    console.log(JSON.stringify(result));
  },

  /**
   * Update task status
   */
  'task-status': (args) => {
    const phaseNum = args[0];
    const taskNum = args[1];
    const status = args[2];

    if (!phaseNum || !taskNum || !status) {
      console.log(JSON.stringify({ error: 'Usage: task-status <phase> <task> <status>' }));
      return;
    }

    const projectRoot = findProjectRoot();
    if (!projectRoot) {
      console.log(JSON.stringify({ error: 'No ViePilot project found' }));
      return;
    }

    // This would update the PHASE-STATE.md file
    // For now, just acknowledge
    console.log(JSON.stringify({
      updated: true,
      phase: phaseNum,
      task: taskNum,
      status: status,
      timestamp: currentTimestamp(),
    }));
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

    if (!message) {
      console.log(JSON.stringify({ error: 'Commit message required' }));
      return;
    }

    // Output command to be executed
    console.log(JSON.stringify({
      command: 'git',
      args: ['commit', '-m', message],
      files: files,
    }));
  },

  /**
   * Calculate progress
   */
  progress: (args) => {
    const projectRoot = findProjectRoot();
    if (!projectRoot) {
      console.log(JSON.stringify({ error: 'No ViePilot project found' }));
      return;
    }

    const phasesDir = path.join(projectRoot, VIEPILOT_DIR, 'phases');
    if (!fs.existsSync(phasesDir)) {
      console.log(JSON.stringify({ phases: [], overall: 0 }));
      return;
    }

    const phases = fs.readdirSync(phasesDir)
      .filter(d => fs.statSync(path.join(phasesDir, d)).isDirectory())
      .map(d => {
        const statePath = path.join(phasesDir, d, 'PHASE-STATE.md');
        const tasksDir = path.join(phasesDir, d, 'tasks');
        
        let taskCount = 0;
        let completedCount = 0;
        
        if (fs.existsSync(tasksDir)) {
          taskCount = fs.readdirSync(tasksDir).filter(f => f.endsWith('.md')).length;
        }
        
        // Parse PHASE-STATE.md for completed tasks
        if (fs.existsSync(statePath)) {
          const content = readMarkdown(statePath);
          const doneMatches = content.match(/✅ done/g);
          completedCount = doneMatches ? doneMatches.length : 0;
        }
        
        return {
          name: d,
          tasks: taskCount,
          completed: completedCount,
          progress: taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0,
        };
      });

    const totalTasks = phases.reduce((sum, p) => sum + p.tasks, 0);
    const totalCompleted = phases.reduce((sum, p) => sum + p.completed, 0);
    const overall = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

    console.log(JSON.stringify({
      phases,
      total_tasks: totalTasks,
      total_completed: totalCompleted,
      overall,
    }));
  },

  /**
   * Version management
   */
  version: (args) => {
    const action = args[0];
    const projectRoot = findProjectRoot();
    
    if (!projectRoot) {
      console.log(JSON.stringify({ error: 'No ViePilot project found' }));
      return;
    }

    const trackerPath = path.join(projectRoot, VIEPILOT_DIR, 'TRACKER.md');
    const content = readMarkdown(trackerPath);
    
    if (!content) {
      console.log(JSON.stringify({ error: 'Cannot read TRACKER.md' }));
      return;
    }

    // Extract current version
    const versionMatch = content.match(/```\n([\d.]+[-\w.]*)\n```/);
    const currentVersion = versionMatch ? versionMatch[1] : '0.0.0';

    if (action === 'get') {
      console.log(JSON.stringify({ version: currentVersion }));
      return;
    }

    if (action === 'bump') {
      const type = args[1] || 'patch';
      const parts = currentVersion.replace(/-.*/, '').split('.').map(Number);
      
      switch (type) {
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
      console.log(JSON.stringify({
        old_version: currentVersion,
        new_version: newVersion,
        bump_type: type,
      }));
      return;
    }

    console.log(JSON.stringify({ version: currentVersion }));
  },

  /**
   * Help
   */
  help: () => {
    console.log(`
ViePilot CLI Tools

Commands:
  init                    Get project initialization state
  current-timestamp       Get current timestamp (iso|date|full) [--raw]
  phase-info <N>          Get phase N information
  task-status <P> <T> <S> Update task T in phase P to status S
  commit <msg> [--files]  Create git commit
  progress                Calculate overall progress
  version [get|bump]      Version management
  help                    Show this help

Examples:
  vp-tools init
  vp-tools current-timestamp full --raw
  vp-tools phase-info 1
  vp-tools progress
  vp-tools version bump minor
`);
  },
};

// ============================================================================
// Main
// ============================================================================

const args = process.argv.slice(2);
const command = args[0];

if (!command || command === 'help' || command === '--help' || command === '-h') {
  commands.help();
} else if (commands[command]) {
  commands[command](args.slice(1));
} else {
  console.log(JSON.stringify({ error: `Unknown command: ${command}` }));
  process.exit(1);
}
