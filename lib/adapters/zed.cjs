'use strict';
const os = require('os');
const path = require('path');
const fs = require('fs');

module.exports = {
  id: 'zed',
  name: 'Zed',
  skillsDir:   (home) => path.join(home, '.agents', 'skills'),
  viepilotDir: (home) => path.join(home, '.agents', 'viepilot'),
  // {envToolDir} in SKILL.md files resolves to this value at install time (ENH-035)
  executionContextBase: '.agents/viepilot',
  // Project-local skills share .agents/skills/ with Antigravity (Zed docs + agentskills.io)
  projectSkillsDir: '.agents/skills',
  postInstallHint: 'Open Zed Agent Panel and type /vp-status (native Zed Agent; ACP threads use their own skill dirs)',
  hooks: {
    configFile: null,  // Zed uses tool permissions, not lifecycle hooks
    schema: 'zed',
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
    if (fs.existsSync(path.join(h, '.config', 'zed'))) return true;
    if (fs.existsSync(path.join(h, '.zed'))) return true;
    if (fs.existsSync(path.join(h, '.agents', 'skills'))) return true;
    const appData = process.env.APPDATA;
    if (appData && fs.existsSync(path.join(appData, 'Zed'))) return true;
    return false;
  },
};
