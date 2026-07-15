#!/usr/bin/env node
'use strict';

/**
 * release-preflight.cjs — fail-closed release gate (ENH-115, Phase 164.1).
 *
 * Replaces the old print-only `release:checklist` behavior with real enforcement: a release cannot
 * proceed while any gate fails. The gate VERIFIES an already-performed version bump — it never
 * re-bumps (bump authority stays with changelog-agent, ENH-053).
 *
 * Two tiers (so we don't reintroduce the per-bump dev friction DEBT-004 removed):
 *   - content-only : version-consistency only. Cheap + offline. Wired into `verify:release` so
 *                    `npm pack --dry-run` / `prepublishOnly` stay safe on a dirty dev tree.
 *   - full (default): + git (clean/branch/synced) + npm-auth + stale-version-refs + not-published.
 *                    Used by `scripts/release.cjs` and the CI publish job.
 *
 * Auto-skips (so the gate is correct in CI's detached-HEAD-at-tag checkout):
 *   - git clean/branch/synced : skipped when `--local`, `process.env.CI`, or no upstream.
 *   - npm-auth                : skipped when `process.env.CI` or `process.env.NODE_AUTH_TOKEN`.
 *
 * CLI:
 *   node scripts/release-preflight.cjs [--dry-run] [--content-only] [--local] [--strict]
 *   --dry-run : run every gate, print the table + planned version, ALWAYS exit 0.
 *   default   : exit 1 if any gate failed, else 0.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { findStaleVersionRefs } = require('./lib/version-refs.cjs');

const REPO_ROOT = path.resolve(__dirname, '..');
const PKG_NAME = 'viepilot';

function repoPath(rel) {
  return path.join(REPO_ROOT, rel);
}

function tryExec(cmd) {
  try {
    return { ok: true, out: execSync(cmd, { cwd: REPO_ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() };
  } catch (err) {
    return { ok: false, out: '', err };
  }
}

function pkgVersion() {
  return JSON.parse(fs.readFileSync(repoPath('package.json'), 'utf8')).version;
}

/** Top released `## [x.y.z]` heading in CHANGELOG (ignores `[Unreleased]`). */
function changelogTopVersion() {
  const text = fs.readFileSync(repoPath('CHANGELOG.md'), 'utf8');
  const re = /^##\s*\[(\d+\.\d+\.\d+)\]/gm;
  const m = re.exec(text);
  return m ? m[1] : null;
}

function inCI() {
  return Boolean(process.env.CI);
}

// ── Gates ─────────────────────────────────────────────────────────────────────
// Each gate returns { name, status: 'pass'|'fail'|'skip', detail }.

function gateGitClean(ctx) {
  const name = 'git-clean';
  if (ctx.local || inCI()) return { name, status: 'skip', detail: ctx.local ? '--local' : 'CI' };
  const r = tryExec('git status --porcelain');
  if (!r.ok) return { name, status: 'skip', detail: 'not a git repo' };
  return r.out === ''
    ? { name, status: 'pass', detail: 'working tree clean' }
    : { name, status: 'fail', detail: `uncommitted changes:\n${r.out}` };
}

function gateGitBranch(ctx) {
  const name = 'git-branch';
  if (ctx.local || inCI()) return { name, status: 'skip', detail: ctx.local ? '--local' : 'CI' };
  const r = tryExec('git rev-parse --abbrev-ref HEAD');
  if (!r.ok) return { name, status: 'skip', detail: 'no branch' };
  return r.out === 'main'
    ? { name, status: 'pass', detail: 'on main' }
    : { name, status: 'fail', detail: `on '${r.out}', expected 'main'` };
}

function gateGitSynced(ctx) {
  const name = 'git-synced';
  if (ctx.local || inCI()) return { name, status: 'skip', detail: ctx.local ? '--local' : 'CI' };
  const up = tryExec('git rev-parse --abbrev-ref --symbolic-full-name @{u}');
  if (!up.ok) return { name, status: 'skip', detail: 'no upstream' };
  const ahead = tryExec('git rev-list --count @{u}..HEAD');
  const behind = tryExec('git rev-list --count HEAD..@{u}');
  const a = ahead.ok ? Number(ahead.out) : 0;
  const b = behind.ok ? Number(behind.out) : 0;
  if (a === 0 && b === 0) return { name, status: 'pass', detail: `in sync with ${up.out}` };
  return { name, status: 'fail', detail: `${a} ahead / ${b} behind ${up.out}` };
}

function gateNpmAuth() {
  const name = 'npm-auth';
  if (inCI() || process.env.NODE_AUTH_TOKEN) {
    return { name, status: 'skip', detail: inCI() ? 'CI (token auth)' : 'NODE_AUTH_TOKEN set' };
  }
  const r = tryExec('npm whoami');
  return r.ok
    ? { name, status: 'pass', detail: `authenticated as ${r.out}` }
    : { name, status: 'fail', detail: 'npm whoami failed — run `npm login`' };
}

function gateVersionConsistency() {
  const name = 'version-consistency';
  const pkg = pkgVersion();
  const top = changelogTopVersion();
  if (!top) return { name, status: 'fail', detail: 'no released [x.y.z] heading in CHANGELOG.md' };
  return pkg === top
    ? { name, status: 'pass', detail: `package.json == CHANGELOG top (${pkg})` }
    : { name, status: 'fail', detail: `package.json ${pkg} != CHANGELOG top ${top}` };
}

function gateStaleVersionRefs() {
  const name = 'stale-version-refs';
  const offenders = findStaleVersionRefs({ expected: pkgVersion() });
  if (offenders.length === 0) return { name, status: 'pass', detail: 'no stale version refs' };
  const lines = offenders.map((o) => `  ${o.file}:${o.line} found ${o.found} expected ${o.expected}`).join('\n');
  return { name, status: 'fail', detail: `${offenders.length} stale ref(s):\n${lines}` };
}

function gateNotPublished(ctx) {
  const name = 'not-published';
  const v = pkgVersion();
  const r = tryExec(`npm view ${PKG_NAME}@${v} version`);
  if (r.ok && r.out === v) {
    return { name, status: 'fail', detail: `${PKG_NAME}@${v} is already published` };
  }
  if (r.ok && r.out === '') {
    return { name, status: 'pass', detail: `${v} not yet on npm` };
  }
  // npm view failed: E404 (version not found) is the happy path; other errors → skip unless strict.
  const msg = (r.err && String(r.err.message)) || '';
  if (/E404|not found|404/i.test(msg) || !r.ok) {
    if (ctx.strict) return { name, status: 'fail', detail: `could not verify npm registry: ${msg.split('\n')[0]}` };
    return { name, status: 'skip', detail: 'not on registry (or offline)' };
  }
  return { name, status: 'pass', detail: `${v} not yet on npm` };
}

const CONTENT_GATES = [gateVersionConsistency];
const FULL_GATES = [
  gateGitClean,
  gateGitBranch,
  gateGitSynced,
  gateNpmAuth,
  gateVersionConsistency,
  gateStaleVersionRefs,
  gateNotPublished,
];

/**
 * runGates(opts) → { version, results: [{name,status,detail}], failed: [...], ok: boolean }
 * @param {object} opts { contentOnly, local, strict }
 */
function runGates(opts = {}) {
  const ctx = { local: Boolean(opts.local), strict: Boolean(opts.strict) };
  const gates = opts.contentOnly ? CONTENT_GATES : FULL_GATES;
  const results = gates.map((g) => g(ctx));
  const failed = results.filter((r) => r.status === 'fail');
  return { version: pkgVersion(), results, failed, ok: failed.length === 0 };
}

function icon(status) {
  return status === 'pass' ? '✓' : status === 'fail' ? '✗' : '·';
}

function printReport(report) {
  console.log(`\nRelease preflight — ${PKG_NAME}@${report.version}\n`);
  for (const r of report.results) {
    console.log(`  ${icon(r.status)} ${r.status.padEnd(4)} ${r.name}`);
    if (r.status !== 'pass' && r.detail) {
      for (const line of String(r.detail).split('\n')) console.log(`        ${line}`);
    }
  }
  console.log('');
}

module.exports = {
  runGates,
  gateGitClean,
  gateGitBranch,
  gateGitSynced,
  gateNpmAuth,
  gateVersionConsistency,
  gateStaleVersionRefs,
  gateNotPublished,
  changelogTopVersion,
  pkgVersion,
  printReport,
};

if (require.main === module) {
  const argv = process.argv.slice(2);
  const opts = {
    dryRun: argv.includes('--dry-run'),
    contentOnly: argv.includes('--content-only'),
    local: argv.includes('--local'),
    strict: argv.includes('--strict'),
  };
  const report = runGates(opts);
  printReport(report);
  if (opts.dryRun) {
    console.log(`(dry-run) would release ${PKG_NAME}@${report.version} · tag v${report.version}`);
    process.exit(0);
  }
  if (!report.ok) {
    console.error(`✗ release preflight FAILED: ${report.failed.map((f) => f.name).join(', ')}`);
    process.exit(1);
  }
  console.log('✓ release preflight passed.');
  process.exit(0);
}
