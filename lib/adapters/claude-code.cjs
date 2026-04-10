'use strict';
const os = require('os');
const path = require('path');
const fs = require('fs');

module.exports = {
  id: 'claude-code',
  name: 'Claude Code',
  // Paths (home-relative; resolved at install time)
  skillsDir:   (home) => path.join(home, '.claude', 'skills'),
  viepilotDir: (home) => path.join(home, '.claude', 'viepilot'),
  // execution_context base for skill .md files
  executionContextBase: '.claude/viepilot',
  // Hooks configuration (Claude Code settings.json)
  hooks: {
    configFile: (home) => path.join(home, '.claude', 'settings.json'),
    schema: 'claude-code',
    supportedEvents: [
      'SessionStart', 'SessionEnd', 'Stop', 'StopFailure',
      'UserPromptSubmit', 'PreToolUse', 'PostToolUse', 'PostToolUseFailure',
      'FileChanged', 'SubagentStart', 'SubagentStop',
      'TaskCreated', 'TaskCompleted', 'PreCompact', 'PostCompact'
    ]
  },
  // Files/dirs to install into viepilotDir
  installSubdirs: [
    'workflows',
    path.join('templates', 'project'),
    path.join('templates', 'phase'),
    path.join('templates', 'architect'),
    'bin',
    'lib',
    'ui-components'
  ],
  // Detection: is this platform available on the current machine?
  isAvailable: (home) => {
    const h = home || os.homedir();
    return fs.existsSync(path.join(h, '.claude'));
  }
};
