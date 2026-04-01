#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const INVENTORY_HEADING = '## Pages inventory';

function listSessionDirs(uiDirectionRoot) {
  if (!fs.existsSync(uiDirectionRoot)) return [];
  return fs
    .readdirSync(uiDirectionRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => path.join(uiDirectionRoot, d.name));
}

function listPageHtmlFiles(sessionDir) {
  const pagesDir = path.join(sessionDir, 'pages');
  if (!fs.existsSync(pagesDir) || !fs.statSync(pagesDir).isDirectory()) {
    return [];
  }
  return fs
    .readdirSync(pagesDir)
    .filter((f) => f.endsWith('.html'))
    .map((f) => path.posix.join('pages', f.replace(/\\/g, '/')));
}

function validateSession(sessionDir) {
  const errors = [];
  const rel = path.relative(process.cwd(), sessionDir) || sessionDir;
  const pageFiles = listPageHtmlFiles(sessionDir);
  if (pageFiles.length === 0) {
    return { ok: true, errors: [], pageFiles: [] };
  }

  const notesPath = path.join(sessionDir, 'notes.md');
  if (!fs.existsSync(notesPath)) {
    errors.push(`${rel}: pages/*.html present but notes.md is missing`);
    return { ok: false, errors, pageFiles };
  }

  const notes = fs.readFileSync(notesPath, 'utf8');
  if (!notes.includes(INVENTORY_HEADING)) {
    errors.push(`${rel}: missing "${INVENTORY_HEADING}" in notes.md (required when pages/*.html exist)`);
  }

  for (const pf of pageFiles) {
    if (!notes.includes(pf)) {
      errors.push(`${rel}: notes.md must mention each page file (missing reference to "${pf}")`);
    }
  }

  return { ok: errors.length === 0, errors, pageFiles };
}

function verifyAll(projectRoot = process.cwd()) {
  const uiRoot = path.join(projectRoot, '.viepilot', 'ui-direction');
  const sessions = listSessionDirs(uiRoot);
  const allErrors = [];
  for (const dir of sessions) {
    const { errors } = validateSession(dir);
    allErrors.push(...errors);
  }
  return { ok: allErrors.length === 0, errors: allErrors, uiRoot };
}

function main() {
  const { ok, errors, uiRoot } = verifyAll();
  if (!fs.existsSync(uiRoot)) {
    console.log('[verify-ui-direction] No .viepilot/ui-direction — nothing to check.');
    process.exit(0);
  }
  if (ok) {
    console.log('[verify-ui-direction] OK — all multi-page sessions have inventory coverage.');
    process.exit(0);
  }
  console.error('[verify-ui-direction] Issues found:');
  errors.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
}

if (require.main === module) {
  main();
}

module.exports = {
  INVENTORY_HEADING,
  listSessionDirs,
  listPageHtmlFiles,
  validateSession,
  verifyAll,
};
