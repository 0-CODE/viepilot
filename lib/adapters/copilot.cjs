'use strict';
const os = require('os');
const path = require('path');
const fs = require('fs');

module.exports = {
  id: 'copilot',
  name: 'GitHub Copilot',
  // Paths (home-relative; resolved at install time)
  skillsDir:   (home) => path.join(home, '.config', 'gh-copilot', 'skills'),
  viepilotDir: (home) => path.join(home, '.config', 'gh-copilot', 'viepilot'),
  // {envToolDir} in SKILL.md files resolves to this value at install time (ENH-035)
  executionContextBase: '.config/gh-copilot/viepilot',
  // Copilot Chat uses /skill-name (same as Claude Code / Cursor)
  postInstallHint: 'Open Copilot Chat in VS Code and type /vp-status to get started',
  hooks: {
    configFile: null,  // Copilot uses .agent.md convention, not programmatic hooks
    schema: 'copilot',
    supportedEvents: []
  },
  installSubdirs: [
    'workflows',
    path.join('templates', 'project'),
    path.join('templates', 'phase'),
    path.join('templates', 'architect'),
    'bin',
    'lib',
    'ui-components',
    'agents'
  ],
  isAvailable: (home) => {
    const h = home || os.homedir();
    // Primary: gh-copilot config dir exists
    if (fs.existsSync(path.join(h, '.config', 'gh-copilot'))) return true;
    // Secondary: gh CLI installed at common paths (user likely has Copilot access)
    const ghPaths = [
      '/usr/local/bin/gh',
      '/opt/homebrew/bin/gh',
      '/usr/bin/gh',
      path.join(h, '.local', 'bin', 'gh'),
    ];
    return ghPaths.some((p) => fs.existsSync(p));
  },
};
