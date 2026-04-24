'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

const VIEPILOT_DIR = path.join(os.homedir(), '.viepilot');
const TRACES_DIR = path.join(VIEPILOT_DIR, 'traces');
const OVERLAYS_DIR = path.join(VIEPILOT_DIR, 'overlays');
const REFLECTIONS_FILE = path.join(VIEPILOT_DIR, 'persona-reflections.json');
const PENDING_REVIEW_FILE = path.join(VIEPILOT_DIR, 'pending-review.md');
const PERSONAS_DIR = path.join(VIEPILOT_DIR, 'personas');
const ACTIVE_PERSONA_FILE = path.join(VIEPILOT_DIR, 'persona.json');

function readJsonSafe(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch { return null; }
}
function writeJsonSafe(filePath, data) {
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch { /* silent */ }
}

/**
 * Write session trace async (fire-and-forget).
 * traceData: { skill, persona, topics_offered, topics_discussed, topics_skipped, stacks_mentioned, duration_min }
 */
function writeSessionTrace(traceData) {
  setImmediate(() => {
    try {
      fs.mkdirSync(TRACES_DIR, { recursive: true });
      const rand = crypto.randomBytes(2).toString('hex');
      const date = new Date().toISOString().slice(0, 10);
      const skill = (traceData.skill || 'unknown').replace(/[^a-z0-9-]/gi, '-');
      const sessionId = `${skill}-${date}-${rand}`;
      const filePath = path.join(TRACES_DIR, `${sessionId}.json`);
      fs.writeFileSync(filePath, JSON.stringify({ ...traceData, session_id: sessionId, recorded_at: new Date().toISOString() }, null, 2), 'utf8');
    } catch { /* silent */ }
  });
}

/**
 * Read last N traces from ~/.viepilot/traces/*.json
 */
function readTraces(n = 20, opts = {}) {
  try {
    const files = fs.readdirSync(TRACES_DIR)
      .filter(f => f.endsWith('.json'))
      .map(f => path.join(TRACES_DIR, f));
    const traces = files
      .map(f => readJsonSafe(f))
      .filter(Boolean)
      .filter(t => !opts.persona || t.persona === opts.persona)
      .sort((a, b) => (b.recorded_at || '').localeCompare(a.recorded_at || ''));
    return traces.slice(0, n);
  } catch { return []; }
}

/**
 * Detect patterns across traces and return proposals.
 */
function detectPatterns(traces) {
  if (!traces || traces.length < 3) return [];
  const reflections = readJsonSafe(REFLECTIONS_FILE) || { applied: [], guardrail_journal: [] };
  const guardrailIds = new Set((reflections.guardrail_journal || []).map(g => g.id));
  const proposals = [];

  // Group by persona
  const byPersona = {};
  for (const t of traces) {
    const p = t.persona || 'unknown';
    if (!byPersona[p]) byPersona[p] = [];
    byPersona[p].push(t);
  }

  for (const [persona, pTraces] of Object.entries(byPersona)) {
    if (pTraces.length < 3) continue;

    // Topic skip rate
    const topicSkipCounts = {};
    const topicOfferCounts = {};
    for (const t of pTraces) {
      for (const topic of (t.topics_offered || [])) {
        topicOfferCounts[topic] = (topicOfferCounts[topic] || 0) + 1;
      }
      for (const topic of (t.topics_skipped || [])) {
        topicSkipCounts[topic] = (topicSkipCounts[topic] || 0) + 1;
      }
    }
    for (const [topic, offerCount] of Object.entries(topicOfferCounts)) {
      const skipCount = topicSkipCounts[topic] || 0;
      const skipRate = skipCount / offerCount;
      if (skipRate >= 0.70 && offerCount >= 3) {
        const id = `topic_skip:${persona}:${topic}`;
        if (!guardrailIds.has(id)) {
          proposals.push({
            id, persona, risk: 'green',
            description: `Topic '${topic}' skipped in ${Math.round(skipRate * 100)}% of sessions`,
            patch: { op: 'add_topic_skip', topic_id: topic },
          });
        }
      }
    }

    // Stack frequency
    const stackCounts = {};
    for (const t of pTraces) {
      for (const stack of (t.stacks_mentioned || [])) {
        stackCounts[stack] = (stackCounts[stack] || 0) + 1;
      }
    }
    for (const [stack, count] of Object.entries(stackCounts)) {
      const freq = count / pTraces.length;
      if (freq >= 0.80) {
        const id = `stack_add:${persona}:${stack}`;
        if (!guardrailIds.has(id)) {
          proposals.push({
            id, persona, risk: 'green',
            description: `Stack '${stack}' mentioned in ${Math.round(freq * 100)}% of sessions`,
            patch: { op: 'add_stack', stack },
          });
        }
      }
    }

    // Long session duration → suggest balanced output_style
    const avgDuration = pTraces.reduce((s, t) => s + (t.duration_min || 0), 0) / pTraces.length;
    if (avgDuration > 60) {
      const id = `output_style:${persona}:balanced`;
      if (!guardrailIds.has(id)) {
        proposals.push({
          id, persona, risk: 'yellow',
          description: `Average session duration ${Math.round(avgDuration)}min — suggest output_style: balanced`,
          patch: { op: 'set_output_style', value: 'balanced' },
        });
      }
    }
  }

  return proposals;
}

/**
 * Apply a proposal patch to the persona file.
 */
function applyProposalToPersona(proposal) {
  try {
    const personaFile = path.join(PERSONAS_DIR, `${proposal.persona}.json`);
    const persona = readJsonSafe(personaFile);
    if (!persona) return false;
    const { op, topic_id, stack, value } = proposal.patch;
    if (op === 'add_topic_skip' && topic_id) {
      if (!persona.brainstorm) persona.brainstorm = { topic_priority: [], topic_skip: [] };
      if (!persona.brainstorm.topic_skip.includes(topic_id)) {
        persona.brainstorm.topic_skip.push(topic_id);
      }
    } else if (op === 'add_stack' && stack) {
      if (!persona.stacks) persona.stacks = [];
      if (!persona.stacks.includes(stack)) persona.stacks.push(stack);
    } else if (op === 'set_output_style' && value) {
      persona.output_style = value;
    } else if (op === 'set_phase_default' && value) {
      persona.phase_template = value;
    } else {
      return false;
    }
    writeJsonSafe(personaFile, persona);
    return true;
  } catch { return false; }
}

/**
 * Write a JSON Patch overlay for a persona's workflow.
 */
function applyOverlay(personaName, patch) {
  try {
    const overlayDir = path.join(OVERLAYS_DIR, personaName);
    fs.mkdirSync(overlayDir, { recursive: true });
    const overlayFile = path.join(overlayDir, 'brainstorm.patch.json');
    const existing = readJsonSafe(overlayFile) || [];
    existing.push({ ...patch, applied_at: new Date().toISOString() });
    writeJsonSafe(overlayFile, existing);
  } catch { /* silent */ }
}

/**
 * Read overlays for a persona.
 */
function readOverlays(personaName) {
  try {
    const overlayFile = path.join(OVERLAYS_DIR, personaName, 'brainstorm.patch.json');
    return readJsonSafe(overlayFile) || [];
  } catch { return []; }
}

/**
 * Append an entry to pending-review.md.
 */
function appendPendingReview(message, personaName) {
  try {
    const date = new Date().toISOString().slice(0, 10);
    const line = `- [${date}] 🟡 ${message} (persona: ${personaName}) — run /vp-persona to review\n`;
    fs.mkdirSync(VIEPILOT_DIR, { recursive: true });
    fs.appendFileSync(PENDING_REVIEW_FILE, line, 'utf8');
  } catch { /* silent */ }
}

/**
 * Record applied/rejected proposals in reflections file.
 */
function recordReflections(applied, rejected) {
  try {
    const reflections = readJsonSafe(REFLECTIONS_FILE) || { applied: [], guardrail_journal: [] };
    const date = new Date().toISOString();
    for (const p of applied) {
      reflections.applied.push({ ...p, applied_at: date });
    }
    for (const p of rejected) {
      reflections.guardrail_journal.push({ id: p.id, rejected_at: date, reason: 'user_rejected' });
    }
    writeJsonSafe(REFLECTIONS_FILE, reflections);
  } catch { /* silent */ }
}

/**
 * Main calibration runner. Reads traces → detects patterns → applies by risk tier.
 * Returns { applied, pending, blocked }
 */
async function runCalibration(opts = {}) {
  const n = opts.traceCount || 20;
  const personaFilter = opts.persona || null;
  const traces = readTraces(n, personaFilter ? { persona: personaFilter } : {});
  if (traces.length < 3) return { applied: [], pending: [], blocked: [] };

  const proposals = detectPatterns(traces);
  const green = proposals.filter(p => p.risk === 'green');
  const yellow = proposals.filter(p => p.risk === 'yellow');
  const red = proposals.filter(p => p.risk === 'red');

  const applied = [];
  const pending = [];

  // Apply green automatically
  for (const p of green) {
    const ok = applyProposalToPersona(p);
    if (ok) {
      applyOverlay(p.persona, { op: p.patch.op, reason: p.description, ...p.patch });
      applied.push(p);
    }
  }

  // Apply yellow automatically + log to pending-review
  for (const p of yellow) {
    const ok = applyProposalToPersona(p);
    if (ok) {
      applyOverlay(p.persona, { op: p.patch.op, reason: p.description, ...p.patch });
      appendPendingReview(p.description, p.persona);
      applied.push(p);
      pending.push(p);
    }
  }

  // Record applied in reflections (prevents re-proposing)
  if (applied.length > 0) recordReflections(applied, []);

  return { applied, pending, blocked: red };
}

module.exports = {
  writeSessionTrace,
  runCalibration,
  readTraces,
  detectPatterns,
  applyOverlay,
  readOverlays,
  appendPendingReview,
};
