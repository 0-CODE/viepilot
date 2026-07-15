#!/usr/bin/env node
'use strict';

/**
 * version-refs.cjs — stale hardcoded version-reference sweep (ENH-115, Phase 164.2).
 *
 * Closes `feedback_vp_evolve_version_bump_gap`: the bump step (vp-evolve Step 4) does not grep
 * Dockerfile / CI / README badges for hardcoded version references before a version bump, so a
 * release can ship with a file still pinned to the previous version.
 *
 * This is a PURE, deterministic module — no git, no network — so it is unit-testable with fixtures.
 * It scans a bounded set of files known to embed the *package* version and reports every occurrence
 * whose embedded SemVer differs from `expected` (defaults to package.json version).
 *
 * SCOPE DECISION (deliberate): we only flag references to the **npm package version**. We do NOT
 * scan `skills/**\/SKILL.md` invocation banners by default, because those show the *framework*
 * version (a separate version line, e.g. `fw 2.19.0`) which legitimately differs from the package
 * version — flagging them would produce false positives. SKILL-banner scanning is available only
 * when `opts.includeSkillBanners` is explicitly set (opt-in, off by default).
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const SEMVER_RE = /\d+\.\d+\.\d+/g;

function repoPath(rel) {
  return path.join(REPO_ROOT, rel);
}

function readLinesSafe(absPath) {
  try {
    return fs.readFileSync(absPath, 'utf8').split('\n');
  } catch (_err) {
    return null; // missing/unreadable → skip silently (offenders only)
  }
}

function listWorkflowFiles() {
  const dir = repoPath('.github/workflows');
  let entries;
  try {
    entries = fs.readdirSync(dir);
  } catch (_err) {
    return [];
  }
  return entries
    .filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'))
    .map((f) => path.join('.github/workflows', f));
}

function listDockerfiles() {
  let entries;
  try {
    entries = fs.readdirSync(REPO_ROOT);
  } catch (_err) {
    return [];
  }
  return entries.filter((f) => f === 'Dockerfile' || f.startsWith('Dockerfile.'));
}

/**
 * Only lines that plausibly PIN the package version are candidates — a bare SemVer elsewhere in a
 * workflow (e.g. an action ref like `actions/checkout@v4` has no x.y.z, but node-version could) is
 * not a package-version pin. We look for the package name adjacency or explicit version-assignment
 * keywords so we do not false-positive on unrelated SemVers (node versions, action SHAs, etc).
 */
function isPackageVersionLine(line) {
  return (
    /viepilot@\d+\.\d+\.\d+/i.test(line) ||
    /VIEPILOT_VERSION/i.test(line) ||
    /\bviepilot\b[^\n]*\bversion\b/i.test(line) ||
    /shields\.io[^\n]*viepilot/i.test(line) ||
    /badge\/version/i.test(line) ||
    /npm\/v\/viepilot/i.test(line)
  );
}

function scanFile(relPath, expected, { requirePin }) {
  const abs = repoPath(relPath);
  const lines = readLinesSafe(abs);
  if (!lines) return [];
  const offenders = [];
  lines.forEach((line, idx) => {
    if (requirePin && !isPackageVersionLine(line)) return;
    const matches = line.match(SEMVER_RE);
    if (!matches) return;
    for (const found of matches) {
      if (found !== expected) {
        offenders.push({ file: relPath, line: idx + 1, found, expected });
      }
    }
  });
  return offenders;
}

/**
 * findStaleVersionRefs({ expected, includeSkillBanners })
 * @returns {Array<{file, line, found, expected}>} offenders (empty when clean)
 */
function findStaleVersionRefs(opts = {}) {
  const expected =
    opts.expected || require(repoPath('package.json')).version;
  const offenders = [];

  // CI workflows + Dockerfiles: only lines that pin the package version.
  for (const wf of listWorkflowFiles()) {
    offenders.push(...scanFile(wf, expected, { requirePin: true }));
  }
  for (const df of listDockerfiles()) {
    offenders.push(...scanFile(df, expected, { requirePin: true }));
  }

  // README: version badges / shields that encode the package version.
  offenders.push(...scanFile('README.md', expected, { requirePin: true }));

  // Opt-in only — framework banner ≠ package version, off by default (see SCOPE DECISION).
  if (opts.includeSkillBanners) {
    offenders.push(...scanSkillBanners(expected));
  }

  return offenders;
}

function scanSkillBanners(expected) {
  const skillsDir = repoPath('skills');
  const offenders = [];
  let skills;
  try {
    skills = fs.readdirSync(skillsDir);
  } catch (_err) {
    return offenders;
  }
  for (const name of skills) {
    const rel = path.join('skills', name, 'SKILL.md');
    const lines = readLinesSafe(repoPath(rel));
    if (!lines) continue;
    lines.forEach((line, idx) => {
      // Only banner lines that reference the package version explicitly.
      if (!/viepilot@\d+\.\d+\.\d+/i.test(line)) return;
      const matches = line.match(SEMVER_RE) || [];
      for (const found of matches) {
        if (found !== expected) {
          offenders.push({ file: rel, line: idx + 1, found, expected });
        }
      }
    });
  }
  return offenders;
}

module.exports = { findStaleVersionRefs, REPO_ROOT };

if (require.main === module) {
  const includeSkillBanners = process.argv.includes('--include-skill-banners');
  const offenders = findStaleVersionRefs({ includeSkillBanners });
  if (offenders.length === 0) {
    console.log('✓ version-refs: no stale hardcoded version references found.');
    process.exit(0);
  }
  console.error(`✗ version-refs: ${offenders.length} stale version reference(s):`);
  for (const o of offenders) {
    console.error(`  ${o.file}:${o.line}  found ${o.found}  expected ${o.expected}`);
  }
  process.exit(1);
}
