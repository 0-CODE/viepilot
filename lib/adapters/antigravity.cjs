'use strict';
const os = require('os');
const path = require('path');
const fs = require('fs');

module.exports = {
  id: 'antigravity',
  name: 'Antigravity',
  skillsDir:   (home) => path.join(home, '.gemini', 'antigravity', 'skills'),
  viepilotDir: (home) => path.join(home, '.gemini', 'antigravity', 'viepilot'),
  // {envToolDir} in SKILL.md files resolves to this value at install time (ENH-035)
  executionContextBase: '.gemini/antigravity/viepilot',
  // Post-install hint shown in "Next actions" after viepilot install
  postInstallHint: 'Open project and run /vp-status',
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
    'ui-components',
    'agents'
  ],
  isAvailable: (home) => {
    const h = home || os.homedir();
    return fs.existsSync(path.join(h, '.gemini', 'antigravity'))
      || fs.existsSync(path.join(h, '.antigravity'));
  }
};
