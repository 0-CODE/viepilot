'use strict';

/**
 * vp-proposal outline-first gate (ENH-122).
 *
 * Before any slide content exists, the run agrees on: one key message, and per slide its title,
 * narrative beat, job (what the audience should think / feel / do after it), the evidence it needs,
 * and its time budget. The approved outline is stored as `outline.json` in the version folder and the
 * manifest must follow it.
 *
 * Zero dependencies (reads skeletons from lib/proposal-generator.cjs lazily).
 */

const EVIDENCE = Object.freeze(['number', 'demo', 'quote', 'diagram', 'comparison', 'none']);
const BEATS = Object.freeze(['context', 'conflict', 'turning point', 'solution', 'proof', 'invitation']);

// Skeletons of the four original types (mirrors workflows/proposal.md "Slide structure by type").
const s = (title, beat) => Object.freeze({ title, beat });
const BASE_SKELETONS = Object.freeze({
  'project-proposal': Object.freeze([s('Cover', 'context'), s('Agenda', 'context'), s('Problem / Opportunity', 'conflict'),
    s('Proposed Solution', 'turning point'), s('Key Features & Deliverables', 'solution'), s('Technical Approach', 'solution'),
    s('Project Timeline', 'proof'), s('Team & Expertise', 'proof'), s('Investment / Budget Estimate', 'proof'), s('Next Steps & CTA', 'invitation')]),
  'tech-architecture': Object.freeze([s('Cover', 'context'), s('Executive Summary', 'context'), s('Problem Statement', 'conflict'),
    s('Architecture Overview', 'turning point'), s('Component Breakdown', 'solution'), s('Data Flow', 'solution'), s('Tech Stack', 'solution'),
    s('Security & Compliance', 'proof'), s('Scalability & Performance', 'proof'), s('Integration Points', 'proof'),
    s('Implementation Roadmap', 'proof'), s('Next Steps & CTA', 'invitation')]),
  'product-pitch': Object.freeze([s('Cover', 'context'), s('The Problem', 'conflict'), s('Our Solution', 'turning point'),
    s('Market Opportunity', 'context'), s('Product Demo / Screenshots', 'solution'), s('Business Model', 'solution'),
    s('Traction & Validation', 'proof'), s('Competitive Landscape', 'proof'), s('Team', 'proof'), s('Roadmap', 'solution'),
    s('Ask / Investment', 'invitation'), s('Thank You & Contact', 'invitation')]),
  general: Object.freeze([s('Cover', 'context'), s('Overview', 'context'), s('Problem / Context', 'conflict'),
    s('Solution / Proposal', 'turning point'), s('Key Benefits', 'solution'), s('Approach & Timeline', 'solution'),
    s('About Us / Credentials', 'proof'), s('Next Steps & CTA', 'invitation')]),
});

// Default job and evidence per beat; the AI refines them with the user at the gate.
const BEAT_DEFAULTS = Object.freeze({
  context: { job: 'know why this matters to them now', evidence: 'none' },
  conflict: { job: 'feel the cost of the problem today', evidence: 'number' },
  'turning point': { job: 'see the one idea that changes it', evidence: 'diagram' },
  solution: { job: 'understand how it works for them', evidence: 'demo' },
  proof: { job: 'believe it will work', evidence: 'number' },
  invitation: { job: 'know exactly what to do next', evidence: 'none' },
});

function skeletonFor(type, variant) {
  if (BASE_SKELETONS[type]) return BASE_SKELETONS[type];
  const gen = require('./proposal-generator.cjs');
  const sk = gen.getSkeleton && gen.getSkeleton(type, variant);
  if (!sk) throw new Error(`No skeleton for type "${type}"${variant ? ` / variant "${variant}"` : ''}`);
  return sk;
}

// Cover and closing slides get a short slot; the rest share the remaining time by beat weight.
const WEIGHT = { context: 0.8, conflict: 1.1, 'turning point': 1.2, solution: 1.1, proof: 1.0, invitation: 0.8 };

/**
 * @param {{type: string, variant?: string|null, keyMessage: string, durationMin: number, skeleton?: {title:string,beat:string}[], overrides?: object[]}} opts
 * @returns {{keyMessage: string, durationMin: number, slides: {n:number,title:string,beat:string,job:string,evidenceNeeded:string,timeBudgetSec:number}[]}}
 */
function buildOutline({ type, variant = null, keyMessage, durationMin, skeleton, overrides = [] }) {
  const sk = skeleton || skeletonFor(type, variant);
  const total = Math.round(Number(durationMin) * 60);
  const weights = sk.map((sl, i) => (i === 0 ? 0.4 : WEIGHT[sl.beat] || 1));
  const sum = weights.reduce((a, b) => a + b, 0);
  let assigned = 0;
  const slides = sk.map((sl, i) => {
    const d = BEAT_DEFAULTS[sl.beat] || { job: 'move the story forward', evidence: 'none' };
    const sec = i === sk.length - 1 ? total - assigned : Math.round((weights[i] / sum) * total);
    assigned += sec;
    return { n: i + 1, title: sl.title, beat: sl.beat, job: d.job, evidenceNeeded: d.evidence, timeBudgetSec: sec, ...(overrides[i] || {}) };
  });
  return { type, variant, keyMessage: String(keyMessage || '').trim(), durationMin: Number(durationMin), slides };
}

/**
 * @returns {{ok: boolean, problems: string[]}}
 */
function validateOutline(outline) {
  const problems = [];
  const km = String(outline.keyMessage || '').trim();
  if (!km) problems.push('key message is missing');
  else if ((km.match(/[.!?](\s|$)/g) || []).length > 1) problems.push('key message must be one sentence');
  else if (km.split(/\s+/).length > 30) problems.push('key message is longer than 30 words');
  if (!Array.isArray(outline.slides) || !outline.slides.length) problems.push('outline has no slides');
  (outline.slides || []).forEach((sl) => {
    if (!sl.title) problems.push(`slide ${sl.n}: title missing`);
    if (!BEATS.includes(sl.beat)) problems.push(`slide ${sl.n}: unknown beat "${sl.beat}"`);
    if (!sl.job || !String(sl.job).trim()) problems.push(`slide ${sl.n}: job missing`);
    if (!EVIDENCE.includes(sl.evidenceNeeded)) problems.push(`slide ${sl.n}: evidence must be one of ${EVIDENCE.join(', ')}`);
    if (!(sl.timeBudgetSec > 0)) problems.push(`slide ${sl.n}: time budget must be > 0`);
  });
  const total = (outline.slides || []).reduce((a, sl) => a + (sl.timeBudgetSec || 0), 0);
  const target = Number(outline.durationMin) * 60;
  if (target > 0 && Math.abs(total - target) > target * 0.1) problems.push(`time budgets sum to ${total}s, target ${target}s (±10%)`);
  if (!(outline.slides || []).some((sl) => sl.beat === 'invitation')) problems.push('no invitation (call to action) slide');
  return { ok: problems.length === 0, problems };
}

/** Markdown table for the outline gate and the .md summary. */
function formatOutline(outline) {
  const rows = outline.slides.map((sl) => `| ${sl.n} | ${sl.title} | ${sl.beat} | ${sl.job} | ${sl.evidenceNeeded} | ${Math.round(sl.timeBudgetSec)}s |`);
  return [`**Key message:** ${outline.keyMessage}`, '', '| # | Slide | Beat | Job — after this slide the audience will… | Evidence | Time |', '|---|---|---|---|---|---|', ...rows].join('\n');
}

module.exports = { EVIDENCE, BEATS, BASE_SKELETONS, skeletonFor, buildOutline, validateOutline, formatOutline };
