'use strict';

const fs = require('fs');
const path = require('path');

const SCHEMA_VERSION = 2;

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
 * Atomic write: write to temp file then rename.
 * @param {string} filePath - Absolute path
 * @param {any} data - Object to serialize as JSON
 */
function atomicWrite(filePath, data) {
  const dir = path.dirname(filePath);
  ensureDir(dir);

  const tmpPath = `${filePath}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  fs.renameSync(tmpPath, filePath);
}

/**
 * Migrate session to current schema version.
 * If session has an older schemaVersion or is missing it, upgrade in place.
 * @param {Object} session - Loaded session or initial object
 * @returns {Object} Migrated session
 */
function migrateSession(session) {
  const current = session || {};
  const schema = current.schemaVersion || 0;

  if (schema >= SCHEMA_VERSION) {
    return current;
  }

  // v0 → v1 (add any missing v1 fields)
  if (schema < 1) {
    if (!current.schemaVersion) current.schemaVersion = SCHEMA_VERSION;
    if (!current.decisions) current.decisions = {};
    if (!current.gates) current.gates = {};
    if (!current.completedSteps) current.completedSteps = [];
    if (!current.artifacts) current.artifacts = {};
    if (!current.environment) current.environment = {};
    if (!current.pendingGate) current.pendingGate = null;
  }

  // v1 → v2 (BUG-035 G2): each gate keeps every kind it saw (`byKind.input`, `byKind.output`, …) so an
  // output gate no longer overwrites the input gate of the same step.
  if (schema < 2) {
    for (const g of Object.values(current.gates || {})) {
      if (g && typeof g === 'object' && !g.byKind && g.kind) g.byKind = { [g.kind]: { result: g.result, at: g.at } };
    }
    current.schemaVersion = SCHEMA_VERSION;
  }

  return current;
}

/**
 * Start a new session for a proposal.
 * @param {string} projectRoot - Absolute path to project root
 * @param {string} slug - Proposal slug
 * @param {Object} opts - { status?: 'in_progress'|'done', currentStep?, currentVersion? }
 * @returns {Object} The created session
 */
function startSession(projectRoot, slug, opts = {}) {
  const sessionPath = path.join(projectRoot, 'docs', 'proposals', slug, 'session.json');

  const session = {
    schemaVersion: SCHEMA_VERSION,
    slug,
    status: opts.status || 'in_progress',
    currentVersion: opts.currentVersion || null,
    currentStep: opts.currentStep || null,
    completedSteps: [],
    decisions: {},
    gates: {},
    artifacts: {},
    pendingGate: null,
    environment: {},
    updatedAt: new Date().toISOString(),
  };

  atomicWrite(sessionPath, session);
  return session;
}

/**
 * Load and possibly migrate an existing session.
 * @param {string} projectRoot
 * @param {string} slug
 * @returns {Object|null} Session object or null if not found
 */
function loadSession(projectRoot, slug) {
  const sessionPath = path.join(projectRoot, 'docs', 'proposals', slug, 'session.json');

  if (!fs.existsSync(sessionPath)) {
    return null;
  }

  try {
    const raw = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
    const before = raw.schemaVersion || 0; // migrateSession mutates in place — capture first
    const migrated = migrateSession(raw);

    // If migration occurred, write back
    if (migrated.schemaVersion !== before) {
      atomicWrite(sessionPath, migrated);
    }

    return migrated;
  } catch (e) {
    return null;
  }
}

/**
 * Record a completed step.
 * @param {string} projectRoot
 * @param {string} slug
 * @param {string} step - Step name/id
 */
function recordStep(projectRoot, slug, step) {
  const session = loadSession(projectRoot, slug);
  if (!session) return;

  if (!session.completedSteps.includes(step)) {
    session.completedSteps.push(step);
  }
  session.currentStep = step;
  session.updatedAt = new Date().toISOString();

  const sessionPath = path.join(projectRoot, 'docs', 'proposals', slug, 'session.json');
  atomicWrite(sessionPath, session);
}

/**
 * Record a decision.
 * @param {string} projectRoot
 * @param {string} slug
 * @param {string} key - Decision key
 * @param {any} value - Decision value
 * @param {string} source - 'auq'|'flag'|'auto'|'inferred'
 */
function recordDecision(projectRoot, slug, key, value, source = 'auto') {
  const session = loadSession(projectRoot, slug);
  if (!session) return;

  session.decisions[key] = {
    value,
    source,
    at: new Date().toISOString(),
  };
  session.updatedAt = new Date().toISOString();

  const sessionPath = path.join(projectRoot, 'docs', 'proposals', slug, 'session.json');
  atomicWrite(sessionPath, session);
}

/**
 * Record a gate result.
 * @param {string} projectRoot
 * @param {string} slug
 * @param {string} step - Step where gate was encountered
 * @param {string} kind - Gate type (e.g., 'council', 'review')
 * @param {string} result - 'accepted'|'changed'|'regenerated'|'stopped'|'auto-accepted'
 */
function recordGate(projectRoot, slug, step, kind, result) {
  const session = loadSession(projectRoot, slug);
  if (!session) return;

  const at = new Date().toISOString();
  const prev = session.gates[step] || {};
  const byKind = { ...(prev.byKind || (prev.kind ? { [prev.kind]: { result: prev.result, at: prev.at } } : {})) };
  byKind[kind] = { result, at };
  // Top-level kind/result/at = the latest record (backward compatible); byKind keeps all of them.
  session.gates[step] = { kind, result, at, byKind };
  session.updatedAt = new Date().toISOString();

  const sessionPath = path.join(projectRoot, 'docs', 'proposals', slug, 'session.json');
  atomicWrite(sessionPath, session);
}

/**
 * Set the session's current version (kept in step with proposal.json by setCurrentVersion — BUG-035 G2).
 * @param {string} projectRoot
 * @param {string} slug
 * @param {string} version
 */
function setSessionVersion(projectRoot, slug, version) {
  const session = loadSession(projectRoot, slug);
  if (!session) return;
  session.currentVersion = version;
  session.updatedAt = new Date().toISOString();
  atomicWrite(path.join(projectRoot, 'docs', 'proposals', slug, 'session.json'), session);
}

/**
 * Set pending gate (gate waiting for decision).
 * @param {string} projectRoot
 * @param {string} slug
 * @param {Object} gate - { step, kind, ... } or null to clear
 */
function setPendingGate(projectRoot, slug, gate) {
  const session = loadSession(projectRoot, slug);
  if (!session) return;

  session.pendingGate = gate || null;
  session.updatedAt = new Date().toISOString();

  const sessionPath = path.join(projectRoot, 'docs', 'proposals', slug, 'session.json');
  atomicWrite(sessionPath, session);
}

/**
 * Mark session as done.
 * @param {string} projectRoot
 * @param {string} slug
 */
function finishSession(projectRoot, slug) {
  const session = loadSession(projectRoot, slug);
  if (!session) return;

  session.status = 'done';
  session.updatedAt = new Date().toISOString();

  const sessionPath = path.join(projectRoot, 'docs', 'proposals', slug, 'session.json');
  atomicWrite(sessionPath, session);
}

/**
 * List active sessions.
 * @param {string} projectRoot
 * @param {Object} opts - { maxAgeHours: 24 }
 * @returns {Array} Array of sessions (in_progress or done within maxAge)
 */
function activeSessions(projectRoot, opts = {}) {
  const { maxAgeHours = 24 } = opts;
  const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
  const now = Date.now();

  const proposalDir = path.join(projectRoot, 'docs', 'proposals');
  if (!fs.existsSync(proposalDir)) {
    return [];
  }

  const active = [];
  const entries = fs.readdirSync(proposalDir);

  for (const entry of entries) {
    const fullPath = path.join(proposalDir, entry);
    if (!fs.statSync(fullPath).isDirectory()) continue;

    const sessionPath = path.join(fullPath, 'session.json');
    if (!fs.existsSync(sessionPath)) continue;

    try {
      const session = loadSession(projectRoot, entry);
      if (!session) continue;

      const updatedAt = new Date(session.updatedAt).getTime();
      const age = now - updatedAt;

      // Include if: in_progress, or done and within maxAge
      if (session.status === 'in_progress' || age <= maxAgeMs) {
        active.push(session);
      }
    } catch (e) {
      // Skip on error
    }
  }

  return active;
}

module.exports = {
  SCHEMA_VERSION,
  startSession,
  loadSession,
  recordStep,
  recordDecision,
  recordGate,
  setPendingGate,
  setSessionVersion,
  finishSession,
  activeSessions,
  migrateSession,
};
