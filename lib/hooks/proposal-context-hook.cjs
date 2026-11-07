#!/usr/bin/env node
'use strict';
/**
 * ViePilot proposal context hook (ENH-124).
 * Claude Code UserPromptSubmit + SessionStart (startup | resume | compact) handler.
 *
 * When the project has an active vp-proposal session, prints a short context note (stdout is added
 * to the model's context for these events) so the agent stays inside the skill: which proposal,
 * which step, which gate is pending, and how to re-enter.
 *
 * Silent when there is no active session. Never blocks: always exit 0; errors go to stderr.
 */

const fs = require('fs');
const path = require('path');

function readStdin() {
  try { return fs.readFileSync(0, 'utf8'); } catch (_) { return ''; }
}

// Same rule as `vp-tools proposal`: nearest ancestor with docs/proposals or .viepilot, else cwd.
function proposalRoot(start) {
  let dir = start;
  for (;;) {
    if (fs.existsSync(path.join(dir, 'docs', 'proposals')) || fs.existsSync(path.join(dir, '.viepilot'))) return dir;
    const up = path.dirname(dir);
    if (up === dir) return start;
    dir = up;
  }
}

function formatNote(event, sessions) {
  const lines = ['[vp-proposal] Active proposal session — stay inside the vp-proposal skill.'];
  for (const s of sessions.slice(0, 3)) {
    const bits = [`slug: ${s.slug}`, `status: ${s.status}`, `step: ${s.currentStep || 'start'}`];
    if (s.pendingGate) bits.push(`pending gate: ${typeof s.pendingGate === 'string' ? s.pendingGate : JSON.stringify(s.pendingGate)}`);
    if (s.currentVersion) bits.push(`version: ${s.currentVersion}`);
    lines.push(`- ${bits.join(' · ')}`);
  }
  lines.push('Re-enter with `/vp-proposal --resume <slug>` before acting on any request about this proposal; every gate uses AskUserQuestion.');
  if (event === 'SessionStart') lines.push('Decisions already confirmed are in docs/proposals/<slug>/session.json — do not ask them again.');
  return lines.join('\n');
}

function main() {
  let payload = {};
  try { payload = JSON.parse(readStdin() || '{}'); } catch (_) { payload = {}; }
  const cwd = payload.cwd || process.cwd();
  const event = payload.hook_event_name || 'UserPromptSubmit';
  let sessions = [];
  try {
    const { activeSessions } = require(path.join(__dirname, '..', 'proposal-session.cjs'));
    sessions = activeSessions(proposalRoot(cwd)) || [];
  } catch (e) {
    process.stderr.write(`[vp-proposal hook] ${e.message}\n`);
    return;
  }
  if (sessions.length) process.stdout.write(formatNote(event, sessions) + '\n');
}

try { main(); } catch (e) { process.stderr.write(`[vp-proposal hook] ${e.message}\n`); }
process.exit(0);
