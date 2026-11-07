#!/usr/bin/env node
'use strict';

/**
 * ViePilot PreToolUse policy hook — ENH-125 Phase 170
 * Reads PreToolUse JSON from stdin; warns on or blocks Bash commands
 * that violate tool policy (edit/read/search files).
 *
 * Mode from: env VIEPILOT_TOOL_POLICY or config tools.policy (default: warn)
 *   - warn:  print suggestion to stderr, exit 0 (non-blocking)
 *   - block: output JSON deny decision, exit 0
 *   - off:   silent exit 0
 *
 * Non-blocking: exit 0 always. Errors logged to stderr, never thrown.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const { classifyBashCommand } = require('../tool-policy.cjs');
const viepilotConfig = require('../viepilot-config.cjs');

const isTTY = process.stderr.isTTY;
const colors = {
  reset: isTTY ? '\x1b[0m' : '',
  yellow: isTTY ? '\x1b[33m' : '',
  red: isTTY ? '\x1b[31m' : '',
  gray: isTTY ? '\x1b[90m' : '',
};

/**
 * Read and parse stdin JSON input (PreToolUse event).
 * Returns null on error (malformed input).
 * @returns {object | null}
 */
async function readStdinJson() {
  return new Promise((resolve) => {
    let data = '';
    let resolved = false;

    // Set timeout to catch hanging stdin
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(null);
      }
    }, 1000);

    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (chunk) => {
      data += chunk;
    });

    process.stdin.on('end', () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (_e) {
          // Malformed input → treat as off
          resolve(null);
        }
      }
    });

    process.stdin.on('error', (_e) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        resolve(null);
      }
    });

    // If stdin is not a TTY and has no data, resolve immediately
    if (!process.stdin.isTTY && !data) {
      // Give it a moment for data to arrive
      process.nextTick(() => {
        if (!resolved && data === '') {
          // Still no data, might need to wait for 'end' event
        }
      });
    }
  });
}

/**
 * Get policy mode from env VIEPILOT_TOOL_POLICY or config.
 * @returns {string} 'warn' | 'block' | 'off'
 */
function getPolicyMode() {
  const envMode = process.env.VIEPILOT_TOOL_POLICY;
  if (envMode && ['warn', 'block', 'off'].includes(envMode)) {
    return envMode;
  }

  try {
    const config = viepilotConfig.readConfig();
    const configMode = config?.tools?.policy;
    if (configMode && ['warn', 'block', 'off'].includes(configMode)) {
      return configMode;
    }
  } catch (_e) {
    // Ignore config read errors
  }

  return 'warn'; // default
}

/**
 * Main hook logic.
 */
async function run() {
  try {
    // Read stdin
    const event = await readStdinJson();
    if (!event) {
      // Malformed input → exit 0 silently
      process.exit(0);
    }

    // Only process Bash tool
    if (event.tool_name !== 'Bash') {
      process.exit(0);
    }

    // Extract command
    const command = event.tool_input?.command;
    if (!command) {
      process.exit(0);
    }

    // Classify command
    const result = classifyBashCommand(command);
    if (!result.violation) {
      process.exit(0);
    }

    // Get policy mode
    const mode = getPolicyMode();

    if (mode === 'off') {
      // Silent exit
      process.exit(0);
    }

    if (mode === 'warn') {
      // Write warning to stderr, exit 0
      process.stderr.write(
        `${colors.yellow}⚠${colors.reset} Tool policy violation (${result.kind}): ${result.suggestion}\n`
      );
      process.exit(0);
    }

    if (mode === 'block') {
      // Output JSON deny decision to stdout, exit 0
      const decision = {
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'deny',
          permissionDecisionReason: result.suggestion,
        },
      };
      process.stdout.write(JSON.stringify(decision) + '\n');
      process.exit(0);
    }

    // Unknown mode → treat as off
    process.exit(0);
  } catch (_e) {
    // Never throw; any error → exit 0 silently
    process.exit(0);
  }
}

run();
