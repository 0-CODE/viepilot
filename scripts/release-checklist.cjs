#!/usr/bin/env node
'use strict';

/**
 * release-checklist.cjs — informational release status report (ENH-115, Phase 164.3).
 *
 * Upgraded from the old print-only "Run: ..." echo to invoke the real preflight gate in report
 * mode (release-preflight.cjs) so the checklist reflects ACTUAL gate status. This script stays
 * non-fatal (informational); the fail-closed enforcement lives in `npm run release:preflight` /
 * `npm run release`.
 *
 * Version bumps are performed by changelog-agent (ENH-053) — this checklist only reports.
 */

const { execSync } = require('child_process');
const { runGates, printReport } = require('./release-preflight.cjs');

function run(command) {
  return execSync(command, { encoding: 'utf8' }).trim();
}

function section(title) {
  console.log(`\n=== ${title} ===`);
}

try {
  section('Version');
  console.log(`package.json: ${run("node -p \"require('./package.json').version\"")}`);

  section('Changelog (top 20 lines)');
  console.log(
    run(
      "node -e \"const fs=require('fs');const t=fs.readFileSync('CHANGELOG.md','utf8');console.log(t.split('\\n').slice(0,20).join('\\n'))\""
    )
  );

  section('Preflight gate status (report mode — non-fatal)');
  const report = runGates({});
  printReport(report);
  if (!report.ok) {
    console.log(`⚠ ${report.failed.length} gate(s) failing: ${report.failed.map((f) => f.name).join(', ')}`);
    console.log('  Enforced by: npm run release:preflight   (or: npm run release)');
  } else {
    console.log('✓ all preflight gates pass — ready to release.');
  }

  section('How to release');
  console.log('  1. Bump version via changelog-agent (do NOT hand-edit — ENH-053 single bump authority)');
  console.log('  2. npm run release                   (preflight → tag vX.Y.Z → push → CI publishes)');
  console.log('     or: npm run release -- --dry-run  (gate + plan, no mutation)');
  console.log('  3. Post-publish: npm run smoke:published');
} catch (error) {
  console.error(`Checklist failed: ${error.message}`);
  process.exit(1);
}
