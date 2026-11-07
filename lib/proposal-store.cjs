'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute SHA256 hash of a file.
 * @param {string} filePath - Absolute path to file
 * @returns {string} Hex digest
 */
function hashFile(filePath) {
  const data = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Ensure directory exists, creating if needed.
 * @param {string} dirPath - Absolute path
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Extract viepilotVersion from package.json (one level up from lib/).
 * @param {string} projectRoot - Absolute path to project root
 * @returns {string} Version string or 'unknown'
 */
function getViepilotVersion(projectRoot) {
  try {
    // Package.json is at {projectRoot}/package.json (where lib/ is {projectRoot}/lib)
    const pkgPath = path.join(projectRoot, '..', 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      return pkg.version || 'unknown';
    }
  } catch (e) {
    // Silently ignore, return 'unknown'
  }
  return 'unknown';
}

/**
 * Slugify a string for matching.
 * @param {string} str
 * @returns {string}
 */
function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// Core API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a new proposal (idempotent: returns existing if present).
 * @param {string} projectRoot - Absolute path to project root
 * @param {Object} opts - { slug, title, type, variant, lang }
 * @returns {Object} { slug, title, type, variant, lang, created, currentVersion }
 */
function createProposal(projectRoot, opts = {}) {
  const { slug, title, type, variant, lang = 'en' } = opts;
  if (!slug || !title || !type) {
    throw new Error('createProposal requires: slug, title, type');
  }

  const proposalDir = path.join(projectRoot, 'docs', 'proposals', slug);
  const proposalJsonPath = path.join(proposalDir, 'proposal.json');

  ensureDir(proposalDir);

  // If proposal.json already exists, return it (idempotent)
  if (fs.existsSync(proposalJsonPath)) {
    return JSON.parse(fs.readFileSync(proposalJsonPath, 'utf8'));
  }

  const now = new Date().toISOString();
  const proposal = {
    slug,
    title,
    type,
    variant: variant || null,
    lang,
    created: now,
    currentVersion: null,
  };

  // Write with 'w' flag since we know it doesn't exist
  fs.writeFileSync(proposalJsonPath, JSON.stringify(proposal, null, 2), 'utf8');
  return proposal;
}

/**
 * Read a proposal.json.
 * @param {string} projectRoot
 * @param {string} slug
 * @returns {Object|null}
 */
function readProposal(projectRoot, slug) {
  const proposalJsonPath = path.join(projectRoot, 'docs', 'proposals', slug, 'proposal.json');
  if (!fs.existsSync(proposalJsonPath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(proposalJsonPath, 'utf8'));
}

/**
 * List all proposals.
 * @param {string} projectRoot
 * @returns {Array} Array of proposal objects
 */
function listProposals(projectRoot) {
  const proposalDir = path.join(projectRoot, 'docs', 'proposals');
  if (!fs.existsSync(proposalDir)) {
    return [];
  }

  const proposals = [];
  const entries = fs.readdirSync(proposalDir);
  for (const entry of entries) {
    const fullPath = path.join(proposalDir, entry);
    if (!fs.statSync(fullPath).isDirectory()) continue;

    const proposalJsonPath = path.join(fullPath, 'proposal.json');
    if (fs.existsSync(proposalJsonPath)) {
      try {
        proposals.push(JSON.parse(fs.readFileSync(proposalJsonPath, 'utf8')));
      } catch (e) {
        // Skip invalid proposal.json
      }
    }
  }
  return proposals;
}

/**
 * Create a new version. Never overwrites.
 * @param {string} projectRoot
 * @param {string} slug
 * @param {Object} opts - { date?: 'YYYY-MM-DD' }
 * @returns {Object} { version: 'v{n}-{date}', dir: absolute path }
 */
function newVersion(projectRoot, slug, opts = {}) {
  const proposal = readProposal(projectRoot, slug);
  if (!proposal) {
    throw new Error(`Proposal "${slug}" not found`);
  }

  const date = opts.date || new Date().toISOString().slice(0, 10);
  const versionsDir = path.join(projectRoot, 'docs', 'proposals', slug, 'versions');
  ensureDir(versionsDir);

  // Find the next version number for this date
  let versionNum = 1;
  let versionName = `v${versionNum}-${date}`;
  let versionPath = path.join(versionsDir, versionName);

  while (fs.existsSync(versionPath)) {
    versionNum++;
    versionName = `v${versionNum}-${date}`;
    versionPath = path.join(versionsDir, versionName);
  }

  ensureDir(versionPath);

  return {
    version: versionName,
    dir: versionPath,
  };
}

/**
 * Get paths for a specific version's artifacts.
 * @param {string} projectRoot
 * @param {string} slug
 * @param {string} version - e.g. 'v1-2026-11-07'
 * @returns {Object} { pptx, docx, md, script, script5, script30, scriptDocx, review, backstage, outline, manifest, provenance, upgradeReport, simulationDir }
 */
function versionPaths(projectRoot, slug, version) {
  const versionDir = path.join(projectRoot, 'docs', 'proposals', slug, 'versions', version);
  const base = slug;

  return {
    pptx: path.join(versionDir, `${base}.pptx`),
    docx: path.join(versionDir, `${base}.docx`),
    md: path.join(versionDir, `${base}.md`),
    script: path.join(versionDir, `${base}-script.md`),
    script5: path.join(versionDir, `${base}-script-5min.md`),
    script30: path.join(versionDir, `${base}-script-30min.md`),
    scriptDocx: path.join(versionDir, `${base}-script-docx.md`),
    review: path.join(versionDir, `${base}-review.md`),
    backstage: path.join(versionDir, `${base}-backstage.md`),
    outline: path.join(versionDir, `${base}-outline.md`),
    manifest: path.join(versionDir, 'manifest.json'),
    provenance: path.join(versionDir, 'provenance.json'),
    upgradeReport: path.join(versionDir, 'upgrade-report.md'),
    simulationDir: path.join(versionDir, 'simulation'),
  };
}

/**
 * Write provenance for a version.
 * Reads all existing artifacts in the version dir and computes hashes.
 * @param {string} projectRoot
 * @param {string} slug
 * @param {string} version
 * @param {Object} opts - { gatesPassed, inputsHash, skillsUsed, skillVersion, workflowVersion }
 */
function writeProvenance(projectRoot, slug, version, opts = {}) {
  const versionDir = path.join(projectRoot, 'docs', 'proposals', slug, 'versions', version);
  if (!fs.existsSync(versionDir)) {
    throw new Error(`Version dir not found: ${versionDir}`);
  }

  const paths = versionPaths(projectRoot, slug, version);
  const artifacts = {};

  // Scan all known artifact paths and hash existing files
  for (const [key, filePath] of Object.entries(paths)) {
    if (key === 'simulationDir') continue; // Skip directory
    if (fs.existsSync(filePath)) {
      artifacts[path.basename(filePath)] = hashFile(filePath);
    }
  }

  // Also scan simulation dir if it exists
  if (fs.existsSync(paths.simulationDir)) {
    const simFiles = fs.readdirSync(paths.simulationDir);
    for (const file of simFiles) {
      const filePath = path.join(paths.simulationDir, file);
      if (fs.statSync(filePath).isFile()) {
        artifacts[path.join('simulation', file)] = hashFile(filePath);
      }
    }
  }

  const viepilotVersion = getViepilotVersion(projectRoot);
  const provenance = {
    viepilotVersion,
    generatedAt: new Date().toISOString(),
    gatesPassed: opts.gatesPassed || [],
    inputsHash: opts.inputsHash || null,
    skillsUsed: opts.skillsUsed || [],
    skillVersion: opts.skillVersion || null,
    workflowVersion: opts.workflowVersion || null,
    artifacts,
  };

  const provenancePath = paths.provenance;
  fs.writeFileSync(provenancePath, JSON.stringify(provenance, null, 2), 'utf8');
  return provenance;
}

/**
 * Read provenance for a version.
 * @param {string} projectRoot
 * @param {string} slug
 * @param {string} version
 * @returns {Object|null}
 */
function readProvenance(projectRoot, slug, version) {
  const paths = versionPaths(projectRoot, slug, version);
  if (!fs.existsSync(paths.provenance)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(paths.provenance, 'utf8'));
}

/**
 * Detect hand edits by comparing current file hashes with stored hashes.
 * @param {string} projectRoot
 * @param {string} slug
 * @param {string} version
 * @returns {Array} [{ artifact, path, expected, actual }, ...]
 */
function detectHandEdits(projectRoot, slug, version) {
  const provenance = readProvenance(projectRoot, slug, version);
  if (!provenance) {
    return [];
  }

  const versionDir = path.join(projectRoot, 'docs', 'proposals', slug, 'versions', version);
  const diffs = [];

  for (const [filename, expectedHash] of Object.entries(provenance.artifacts)) {
    const filePath = path.join(versionDir, filename);
    if (!fs.existsSync(filePath)) {
      diffs.push({
        artifact: filename,
        path: filePath,
        expected: expectedHash,
        actual: null,
      });
    } else {
      const actualHash = hashFile(filePath);
      if (actualHash !== expectedHash) {
        diffs.push({
          artifact: filename,
          path: filePath,
          expected: expectedHash,
          actual: actualHash,
        });
      }
    }
  }

  return diffs;
}

/**
 * Set the current version in proposal.json.
 * @param {string} projectRoot
 * @param {string} slug
 * @param {string} version - e.g. 'v1-2026-11-07'
 */
function setCurrentVersion(projectRoot, slug, version) {
  const proposal = readProposal(projectRoot, slug);
  if (!proposal) {
    throw new Error(`Proposal "${slug}" not found`);
  }

  proposal.currentVersion = version;
  const proposalJsonPath = path.join(projectRoot, 'docs', 'proposals', slug, 'proposal.json');
  fs.writeFileSync(proposalJsonPath, JSON.stringify(proposal, null, 2), 'utf8');
}

/**
 * Detect existing proposals (new and legacy flat files).
 * @param {string} projectRoot
 * @param {Object} opts - { slug?, topic? }
 * @returns {Object} { proposals: [...], legacy: [...] }
 */
function detectExisting(projectRoot, opts = {}) {
  const { slug, topic } = opts;
  const proposals = [];
  const legacy = [];

  // Search for new-style proposals (folder-based)
  const proposalDir = path.join(projectRoot, 'docs', 'proposals');
  if (fs.existsSync(proposalDir)) {
    const entries = fs.readdirSync(proposalDir);
    for (const entry of entries) {
      const fullPath = path.join(proposalDir, entry);
      if (!fs.statSync(fullPath).isDirectory()) continue;

      // Skip if it looks like a legacy flat file (has extension)
      if (entry.includes('.')) continue;

      const proposalJsonPath = path.join(fullPath, 'proposal.json');
      if (fs.existsSync(proposalJsonPath)) {
        try {
          const proposal = JSON.parse(fs.readFileSync(proposalJsonPath, 'utf8'));

          // Match by slug or topic
          if (slug && proposal.slug === slug) {
            proposals.push(proposal);
          } else if (topic) {
            const topicSlug = slugify(topic);
            const proposalSlug = slugify(proposal.slug);
            const proposalTitle = slugify(proposal.title);
            if (proposalSlug.includes(topicSlug) || proposalTitle.includes(topicSlug)) {
              proposals.push(proposal);
            }
          }
        } catch (e) {
          // Skip invalid proposal.json
        }
      }
    }
  }

  // Search for legacy flat files: {slug}-{date}.*
  if (fs.existsSync(proposalDir)) {
    const entries = fs.readdirSync(proposalDir);
    for (const entry of entries) {
      const fullPath = path.join(proposalDir, entry);
      // Legacy files are flat files (not directories)
      if (fs.statSync(fullPath).isDirectory()) continue;

      // Match pattern: {slug}-{YYYY-MM-DD}...
      // Date format YYYY-MM-DD is unique enough to work backwards
      const dateMatch = entry.match(/(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) {
        const date = dateMatch[1];
        const dateIndex = entry.indexOf(date);
        if (dateIndex > 0) {
          // Everything before the date (minus the trailing dash) is the slug
          const legacySlug = entry.substring(0, dateIndex - 1);

          // Match by slug or topic
          let shouldAdd = false;
          if (slug && legacySlug === slug) {
            shouldAdd = true;
          } else if (topic) {
            const topicSlug = slugify(topic);
            if (slugify(legacySlug).includes(topicSlug)) {
              shouldAdd = true;
            }
          }

          if (shouldAdd) {
            // Group by slug+date
            let legacyEntry = legacy.find(l => l.slug === legacySlug && l.date === date);
            if (!legacyEntry) {
              legacyEntry = { slug: legacySlug, date, files: [] };
              legacy.push(legacyEntry);
            }
            legacyEntry.files.push(entry);
          }
        }
      }
    }
  }

  return { proposals, legacy };
}

module.exports = {
  createProposal,
  readProposal,
  listProposals,
  newVersion,
  versionPaths,
  writeProvenance,
  readProvenance,
  detectHandEdits,
  setCurrentVersion,
  detectExisting,
};
