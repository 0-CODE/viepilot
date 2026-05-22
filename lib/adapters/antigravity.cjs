'use strict';
const os = require('os');
const path = require('path');
const fs = require('fs');

module.exports = {
  id: 'antigravity',
  name: 'Antigravity',
  // Global install path (unchanged)
  skillsDir:   (home) => path.join(home, '.gemini', 'antigravity', 'skills'),
  viepilotDir: (home) => path.join(home, '.gemini', 'antigravity', 'viepilot'),
  // Phase 131 (FEAT-021): project-level install path (Antigravity v1 uses .agents/skills/)
  projectSkillsDir: '.agents/skills',
  // {envToolDir} in SKILL.md files resolves to this value at install time (ENH-035)
  executionContextBase: '.gemini/antigravity/viepilot',
  // Post-install hint shown in "Next actions" after viepilot install
  postInstallHint: 'Open project and run /vp-status',
  // Phase 131 (FEAT-021): Gemini CLI was deprecated June 18, 2026
  deprecationNotice: '⚠️  Gemini CLI was deprecated June 18, 2026. This installs for Antigravity CLI (the successor). Skill path: .agents/skills/ (project) or ~/.gemini/antigravity/skills/ (global).',
  hooks: {
    configFile: null,       // Antigravity has no programmatic hooks system
    schema: 'antigravity',
    supportedEvents: ['before_tool', 'after_file_edit', 'session_start']
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
      || fs.existsSync(path.join(h, '.antigravity'))
      || fs.existsSync(path.join(process.cwd(), '.agents'));
  }
};
