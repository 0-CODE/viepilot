#!/usr/bin/env node
'use strict';

/**
 * release.cjs — guarded release orchestrator (ENH-115, Phase 164.3).
 *
 * Flow (aborts on any failure):
 *   1. Run the FULL release preflight gate (scripts/release-preflight.cjs).
 *   2. --dry-run: print the plan and STOP before any mutation (exit 0).
 *   3. Else: create `v<version>` git tag and push it. Pushing the tag is what triggers
 *      `.github/workflows/release-npm.yml` to publish — CI owns `npm publish`, not this script.
 *   4. Print a TRACKER post-publish reminder.
 *
 * IMPORTANT: version bumps are performed by **changelog-agent** (ENH-053) BEFORE release. This
 * orchestrator only VERIFIES the already-bumped version — it never re-bumps (avoids the ENH-053
 * dual-bump conflict).
 *
 * Usage: node scripts/release.cjs [--dry-run] [--local] [--strict]
 */

const { spawnSync } = require('child_process');
const path = require('path');
const { runGates, printReport } = require('./release-preflight.cjs');

const REPO_ROOT = path.resolve(__dirname, '..');

function git(args) {
  return spawnSync('git', args, { cwd: REPO_ROOT, encoding: 'utf8' });
}

function tagExists(tag) {
  const local = git(['tag', '-l', tag]).stdout.trim();
  if (local === tag) return true;
  const remote = spawnSync('git', ['ls-remote', '--tags', 'origin', tag], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
  });
  return Boolean(remote.stdout && remote.stdout.includes(`refs/tags/${tag}`));
}

function main() {
  const argv = process.argv.slice(2);
  const opts = {
    dryRun: argv.includes('--dry-run'),
    local: argv.includes('--local'),
    strict: argv.includes('--strict'),
  };

  // 1. Preflight (full tier).
  const report = runGates({ local: opts.local, strict: opts.strict });
  printReport(report);

  const version = report.version;
  const tag = `v${version}`;

  // 2. Dry-run always previews (gate results + plan) and stops before any mutation.
  if (opts.dryRun) {
    if (!report.ok) {
      console.log(`(dry-run) ⚠ preflight has failing gates (${report.failed.map((f) => f.name).join(', ')}) — a real release would ABORT here.`);
    }
    console.log('(dry-run) plan:');
    console.log(`  • git tag ${tag}`);
    console.log(`  • git push origin ${tag}   → triggers .github/workflows/release-npm.yml (npm publish)`);
    console.log('  • then update .viepilot/TRACKER.md (Framework release line + decision-log row)');
    console.log('\nNo tag created. Re-run without --dry-run to release.');
    process.exit(0);
  }

  // 3. Real release: enforce gates, then tag + push (the publish trigger). CI owns `npm publish`.
  if (!report.ok) {
    console.error(`✗ release aborted: preflight failed (${report.failed.map((f) => f.name).join(', ')})`);
    console.error('  Fix the gates above, or re-run the version bump via changelog-agent.');
    process.exit(1);
  }
  if (tagExists(tag)) {
    console.error(`✗ release aborted: tag ${tag} already exists (locally or on origin).`);
    process.exit(1);
  }
  console.log(`Tagging ${tag} ...`);
  const t = git(['tag', tag]);
  if (t.status !== 0) {
    console.error(`✗ git tag failed: ${t.stderr}`);
    process.exit(1);
  }
  const p = git(['push', 'origin', tag]);
  if (p.status !== 0) {
    console.error(`✗ git push failed: ${p.stderr}`);
    console.error(`  Local tag ${tag} created but not pushed. Push manually or delete: git tag -d ${tag}`);
    process.exit(1);
  }

  // 4. Post-publish reminder.
  console.log(`\n✓ Pushed ${tag}. CI (Release to npm) will publish ${report.version}.`);
  console.log('\nPost-publish checklist:');
  console.log('  • Update .viepilot/TRACKER.md — "Framework release" line → ' + version);
  console.log('  • Add a decision-log row for the release');
  console.log('  • Verify: npm run smoke:published');
  process.exit(0);
}

try {
  main();
} catch (err) {
  console.error(`release.cjs error: ${err.message}`);
  process.exit(1);
}
