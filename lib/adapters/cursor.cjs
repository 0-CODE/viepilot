'use strict';
const os = require('os');
const path = require('path');
const fs = require('fs');

module.exports = {
  id: 'cursor',          // maps to cursor-agent and cursor-ide (same paths)
  name: 'Cursor',
  skillsDir:   (home) => path.join(home, '.cursor', 'skills'),
  viepilotDir: (home) => path.join(home, '.cursor', 'viepilot'),
  executionContextBase: '.cursor/viepilot',
  // Post-install hint shown in "Next actions" after viepilot install
  postInstallHint: 'Open project and run /vp-status',
  hooks: {
    configFile: null,    // Cursor uses .cursorrules/MDC, not settings.json hooks
    schema: 'cursor',
    supportedEvents: []  // no programmatic hook events
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
    return fs.existsSync(path.join(h, '.cursor'));
  }
};
