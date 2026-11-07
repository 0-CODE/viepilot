#!/usr/bin/env node
'use strict';

/**
 * ViePilot hook installer — reusable for Phase 170+ hooks
 * Pure functions for planning and applying hook installations.
 *
 * Used by Phase 170 (tool-policy-hook) and Phase 171+.
 */

const fs = require('fs');
const path = require('path');

/**
 * Plan a hook installation (pure, idempotent).
 *
 * @param {object} settings - existing settings object
 * @param {string} event - hook event name (e.g., "PreToolUse", "Stop")
 * @param {string|object} matcher - Claude Code tool-name pattern string (e.g. "Bash"); {} for events without a matcher
 * @param {string} command - full hook command to install
 * @param {string[]} removeCommands - array of stale commands to remove (default: [])
 * @returns {{settings: object, changed: boolean}}
 */
function planHookInstall({ settings, event, matcher, command, removeCommands = [] }) {
  // Deep copy settings
  const newSettings = JSON.parse(JSON.stringify(settings));

  // Ensure event array exists
  if (!newSettings.hooks) newSettings.hooks = {};
  if (!newSettings.hooks[event]) newSettings.hooks[event] = [];

  // Step A: remove stale entries by filtering out commands matching removeCommands
  newSettings.hooks[event] = newSettings.hooks[event].filter((entry) => {
    if (!Array.isArray(entry.hooks)) return true;
    return !entry.hooks.some((h) =>
      h.type === 'command' && removeCommands.includes(h.command)
    );
  });

  // Step B: check if already installed (idempotent)
  const alreadyInstalled = newSettings.hooks[event].some((entry) =>
    Array.isArray(entry.hooks) &&
    entry.hooks.some((h) => h.type === 'command' && h.command === command)
  );

  if (alreadyInstalled) {
    return {
      settings: newSettings,
      changed: false,
    };
  }

  // Step C: add new entry
  newSettings.hooks[event].push({
    matcher: matcher,
    hooks: [{ type: 'command', command: command }],
  });

  return {
    settings: newSettings,
    changed: true,
  };
}

/**
 * Apply hook installation plan to config file.
 *
 * @param {string} configPath - path to settings.json
 * @param {object} plan - result from planHookInstall
 * @param {boolean} dryRun - if true, only log, don't write (default: false)
 */
function applyHookInstall({ configPath, plan, dryRun = false }) {
  if (dryRun) {
    return;
  }

  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify(plan.settings, null, 2) + '\n', 'utf8');
}

module.exports = {
  planHookInstall,
  applyHookInstall,
};
