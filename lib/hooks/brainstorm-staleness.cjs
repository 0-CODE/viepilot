#!/usr/bin/env node
'use strict';
/**
 * ViePilot brainstorm staleness hook (FEAT-012)
 * Claude Code Stop event handler.
 *
 * Reads stdin JSON: { session_id, transcript_path, cwd, ... }
 * Detects architect HTML items that have become stale relative to the active
 * brainstorm session notes, and marks them data-arch-stale="true" (flag-only).
 *
 * Non-blocking: exit 0 always. Errors are logged to stderr, never thrown.
 *
 * Install via: node bin/vp-tools.cjs hooks install
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// ──────────────────────────────────────────────────────────────────────────────
// Architect page trigger keywords (reuses ENH-034 keyword lists)
// ──────────────────────────────────────────────────────────────────────────────
const ARCHITECT_TRIGGERS = {
  'architecture.html':    ['c4', 'context diagram', 'system diagram', 'component', 'architecture'],
  'data-flow.html':       ['data flow', 'request flow', 'event flow', 'pipeline', 'data-flow'],
  'erd.html':             ['entity', 'relation', 'table', 'schema', 'database', 'erd'],
  'user-use-cases.html':  ['use case', 'actor', 'user story', 'persona', 'use-case'],
  'sequence-diagram.html':['sequence', 'interaction', 'message flow', 'sequence diagram'],
  'deployment.html':      ['deploy', 'infrastructure', 'container', 'cloud', 'k8s', 'kubernetes'],
  'apis.html':            ['api', 'endpoint', 'rest', 'graphql', 'grpc', 'swagger', 'openapi'],
  'ui-design.html':       ['ui design', 'ux design', 'mockup', 'wireframe', 'layout design'],
};

// ──────────────────────────────────────────────────────────────────────────────
// Session discovery
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Find the most recently modified active brainstorm session file in cwd.
 * Searches .viepilot/ui-direction/{id}/notes.md and docs/brainstorm/session-*.md.
 * @param {string} cwd
 * @returns {{ notesPath: string, sessionContent: string } | null}
 */
function findActiveSession(cwd) {
  const candidates = [];

  // .viepilot/ui-direction/*/notes.md
  const uiDir = path.join(cwd, '.viepilot', 'ui-direction');
  if (fs.existsSync(uiDir)) {
    try {
      for (const entry of fs.readdirSync(uiDir, { withFileTypes: true })) {
        if (entry.isDirectory()) {
          const notesPath = path.join(uiDir, entry.name, 'notes.md');
          if (fs.existsSync(notesPath)) {
            candidates.push(notesPath);
          }
        }
      }
    } catch (_e) { /* ignore */ }
  }

  // docs/brainstorm/session-*.md
  const brainstormDir = path.join(cwd, 'docs', 'brainstorm');
  if (fs.existsSync(brainstormDir)) {
    try {
      for (const entry of fs.readdirSync(brainstormDir, { withFileTypes: true })) {
        if (entry.isFile() && entry.name.startsWith('session-') && entry.name.endsWith('.md')) {
          candidates.push(path.join(brainstormDir, entry.name));
        }
      }
    } catch (_e) { /* ignore */ }
  }

  if (candidates.length === 0) return null;

  // Pick most recently modified
  let latest = null;
  let latestMtime = 0;
  for (const p of candidates) {
    try {
      const stat = fs.statSync(p);
      if (stat.mtimeMs > latestMtime) {
        latestMtime = stat.mtimeMs;
        latest = p;
      }
    } catch (_e) { /* ignore */ }
  }

  if (!latest) return null;

  try {
    const sessionContent = fs.readFileSync(latest, 'utf8');
    return { notesPath: latest, sessionContent };
  } catch (_e) {
    return null;
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Staleness detection
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Detect which architect HTML pages have become stale based on session content.
 * @param {string} sessionContent
 * @param {string} architectDir - directory containing architect HTML files
 * @returns {{ page: string, reason: string }[]}
 */
function detectStaleItems(sessionContent, architectDir) {
  const lower = sessionContent.toLowerCase();
  const stale = [];

  for (const [page, keywords] of Object.entries(ARCHITECT_TRIGGERS)) {
    const filePath = path.join(architectDir, page);
    // Only flag pages that actually exist
    if (!fs.existsSync(filePath)) continue;

    const matchedKeywords = keywords.filter((kw) => lower.includes(kw));
    if (matchedKeywords.length > 0) {
      stale.push({
        page,
        reason: `brainstorm session mentions: ${matchedKeywords.slice(0, 3).join(', ')}`,
      });
    }
  }

  return stale;
}

// ──────────────────────────────────────────────────────────────────────────────
// HTML patching
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Mark all [data-arch-id] elements in an HTML file as stale (flag-only, no content rewrite).
 * Idempotent: elements already marked are skipped.
 * @param {string} filePath
 * @param {string} reason
 * @returns {boolean} true if file was modified
 */
function markStaleInFile(filePath, reason) {
  let html;
  try {
    html = fs.readFileSync(filePath, 'utf8');
  } catch (_e) {
    return false;
  }

  // Match opening tags that have data-arch-id but NOT already data-arch-stale
  // Pattern: any tag with data-arch-id="..." that lacks data-arch-stale
  const tagRegex = /(<(?:tr|div|td|section)[^>]*data-arch-id="[^"]*"[^>]*?)(?!\s*data-arch-stale)(>)/gi;

  let changed = false;
  const safeReason = reason.replace(/"/g, '&quot;').replace(/</g, '&lt;');

  const patched = html.replace(tagRegex, (match, tagOpen, closeBracket) => {
    // Double-check not already stale
    if (tagOpen.includes('data-arch-stale')) return match;
    changed = true;
    return `${tagOpen} data-arch-stale="true" data-arch-stale-note="${safeReason}"${closeBracket}`;
  });

  if (!changed) return false;

  try {
    fs.writeFileSync(filePath, patched, 'utf8');
    return true;
  } catch (_e) {
    return false;
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────────────────────────

async function run(hookData) {
  const cwd = hookData.cwd || process.cwd();

  const session = findActiveSession(cwd);
  if (!session) return; // no active brainstorm session — nothing to do

  // Resolve architect directory: prefer repo-local, fall back to installed location
  const repoArchDir = path.join(cwd, 'templates', 'architect');
  const installArchDir = path.join(os.homedir(), '.claude', 'viepilot', 'templates', 'architect');
  const architectDir = fs.existsSync(repoArchDir) ? repoArchDir
    : fs.existsSync(installArchDir) ? installArchDir
    : null;

  if (!architectDir) return;

  const stalePages = detectStaleItems(session.sessionContent, architectDir);
  if (stalePages.length === 0) return;

  let patchCount = 0;
  for (const { page, reason } of stalePages) {
    const filePath = path.join(architectDir, page);
    const changed = markStaleInFile(filePath, reason);
    if (changed) patchCount++;
  }

  if (patchCount > 0) {
    process.stderr.write(
      `[viepilot-hook] ⚠ Marked ${patchCount} architect page(s) stale` +
      ` (session: ${path.basename(path.dirname(session.notesPath))})\n`
    );
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Entry point — only activates when run directly (not when require()'d in tests)
// ──────────────────────────────────────────────────────────────────────────────

if (require.main === module) {
  process.stdin.setEncoding('utf8');
  let raw = '';
  process.stdin.on('data', (chunk) => { raw += chunk; });
  process.stdin.on('end', () => {
    let hookData = {};
    try { hookData = JSON.parse(raw); } catch (_e) { /* no stdin or not JSON = dev/test run */ }
    run(hookData)
      .catch((e) => {
        process.stderr.write(`[viepilot-hook] error: ${e.message}\n`);
      })
      .finally(() => process.exit(0));
  });
  process.stdin.on('error', () => process.exit(0));
}

// Export internals for testing
module.exports = { findActiveSession, detectStaleItems, markStaleInFile };
