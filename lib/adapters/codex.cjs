'use strict';
const os = require('os');
const path = require('path');
const fs = require('fs');

module.exports = {
  id: 'codex',
  name: 'Codex',
  skillsDir:   (home) => path.join(home, '.codex', 'skills'),
  viepilotDir: (home) => path.join(home, '.codex', 'viepilot'),
  // {envToolDir} in SKILL.md files resolves to this value at install time (ENH-035)
  executionContextBase: '.codex/viepilot',
  // NOTE: Codex uses $skill-name syntax (not /skill-name like other adapters)
  // Codex reserves /command for built-in system controls (/plan, /clear, /diff, etc.)
  postInstallHint: 'Open project and type $vp-status to get started',
  hooks: {
    configFile: null,       // Codex uses AGENTS.md convention, not programmatic hooks
    schema: 'codex',
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
    return fs.existsSync(path.join(h, '.codex'));
  }
};
