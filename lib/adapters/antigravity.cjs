'use strict';
const os = require('os');
const path = require('path');
const fs = require('fs');

module.exports = {
  id: 'antigravity',
  name: 'Antigravity',
  skillsDir:   (home) => path.join(home, '.antigravity', 'skills'),
  viepilotDir: (home) => path.join(home, '.antigravity', 'viepilot'),
  // {envToolDir} in SKILL.md files resolves to this value at install time (ENH-035)
  executionContextBase: '.antigravity/viepilot',
  hooks: {
    configFile: null,       // Antigravity has no programmatic hooks system
    schema: 'antigravity',
    supportedEvents: []
  },
  installSubdirs: [
    'workflows',
    path.join('templates', 'project'),
    path.join('templates', 'phase'),
    path.join('templates', 'architect'),
    'bin',
    'lib',
    'ui-components'
  ],
  isAvailable: (home) => {
    const h = home || os.homedir();
    return fs.existsSync(path.join(h, '.antigravity'));
  }
};
