'use strict';

const fs            = require('fs');
const path          = require('path');
const { execSync }  = require('child_process');

const BATCH_SIZE = 10;

// ─── Keyword extraction ───────────────────────────────────────────────────────

function extractKeywords(ticket) {
  const title = ticket.title || '';
  // Extract capitalized words (≥4 chars) — likely proper nouns / component names
  const capitalized = title.match(/\b[A-Z][a-zA-Z]{3,}\b/g) || [];
  // Also extract lower-case content words ≥5 chars (skip stop words)
  const STOP = new Set(['with', 'from', 'that', 'this', 'have', 'will', 'when', 'then', 'into', 'about']);
  const content = (title.match(/\b[a-z]{5,}\b/g) || []).filter((w) => !STOP.has(w));
  const combined = [...new Set([...capitalized, ...content])];
  return combined.slice(0, 3);
}

// ─── Single-ticket validation ─────────────────────────────────────────────────

async function validateTicket(ticket, projectRoot) {
  const keywords = extractKeywords(ticket);
  if (keywords.length === 0) return { status: 'unknown' };

  let fileMatch = null;
  let similarRequest = null;

  // ── Codebase match: non-CC inline grep ──────────────────────────────────────
  // (Claude Code path: caller may swap this out with file-scanner-agent)
  const srcDirs = ['src', 'lib', 'app', 'components', 'pages'].filter(
    (d) => fs.existsSync(path.join(projectRoot, d)),
  );
  const searchRoot = srcDirs.length > 0 ? path.join(projectRoot, srcDirs[0]) : projectRoot;

  for (const kw of keywords) {
    try {
      const result = execSync(
        `grep -r -l --include="*.ts" --include="*.tsx" --include="*.js" --include="*.cjs" -i "${kw}" "${searchRoot}" 2>/dev/null`,
        { encoding: 'utf8', timeout: 5000 },
      ).trim();
      if (result) {
        const firstFile = result.split('\n')[0];
        const rel = path.relative(projectRoot, firstFile);
        fileMatch = rel;
        break;
      }
    } catch {
      // grep returns exit 1 when no match — ignore
    }
  }

  // ── Duplicate detection: scan existing requests ───────────────────────────
  const reqDir = path.join(projectRoot, '.viepilot', 'requests');
  if (fs.existsSync(reqDir)) {
    const files = fs.readdirSync(reqDir).filter((f) => f.endsWith('.md'));
    for (const f of files) {
      const content = fs.readFileSync(path.join(reqDir, f), 'utf8').toLowerCase();
      const matchCount = keywords.filter((kw) => content.includes(kw.toLowerCase())).length;
      if (matchCount >= 2) {
        similarRequest = f.replace('.md', '');
        break;
      }
    }
  }

  if (similarRequest) return { status: 'similar', similar_request: similarRequest };
  if (fileMatch)      return { status: 'found',   file: fileMatch };
  return { status: 'unknown' };
}

// ─── Fan-out validation ───────────────────────────────────────────────────────

async function validateTickets(tickets, projectRoot, options = {}) {
  if (options.skipValidation) return tickets;

  const batches = [];
  for (let i = 0; i < tickets.length; i += BATCH_SIZE) {
    batches.push(tickets.slice(i, i + BATCH_SIZE));
  }

  for (const batch of batches) {
    const results = await Promise.all(batch.map((t) => {
      // Claude Code path: if Agent tool available, caller may override validateTicket
      // to use subagent_type: "file-scanner-agent" for richer results.
      // Non-CC: runs inline grep + duplicate check above.
      return validateTicket(t, projectRoot).catch(() => ({ status: 'unknown' }));
    }));
    batch.forEach((t, i) => { t._validation = results[i]; });
  }

  return tickets;
}

module.exports = { validateTickets, extractKeywords, validateTicket };
