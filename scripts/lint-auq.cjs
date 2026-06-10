#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SCAN_DIRS = ['skills', 'workflows'];
const HEADER_MAX = 12;

let violations = 0;
const errors = [];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const rel = path.relative(ROOT, filePath);

  const headerRe = /header:\s*["'](.+?)["']/g;
  let m;
  while ((m = headerRe.exec(content)) !== null) {
    const val = m[1];
    if (val.startsWith('{')) continue; // skip template placeholders like {short label, ≤12 chars}
    if (val.length > HEADER_MAX) {
      const line = content.substring(0, m.index).split('\n').length;
      errors.push(`${rel}:${line}  header "${val}" is ${val.length} chars (max ${HEADER_MAX})`);
      violations++;
    }
  }
}

function walkDir(dir) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return;
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    const full = path.join(abs, entry.name);
    if (entry.isDirectory()) walkDir(path.join(dir, entry.name));
    else if (entry.name.endsWith('.md') || entry.name.endsWith('.cjs')) scanFile(full);
  }
}

for (const d of SCAN_DIRS) walkDir(d);

if (violations === 0) {
  console.log('lint:auq — 0 violations ✓');
  process.exit(0);
} else {
  console.error(`lint:auq — ${violations} violation(s):`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}
