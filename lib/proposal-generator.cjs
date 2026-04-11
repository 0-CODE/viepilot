'use strict';

const fs   = require('fs');
const path = require('path');

// ─────────────────────────────────────────────────────────────────────────────
// Proposal type definitions
// ─────────────────────────────────────────────────────────────────────────────
const PROPOSAL_TYPES = {
  'project-proposal':  { slides: 10, label: 'Project Proposal' },
  'tech-architecture': { slides: 12, label: 'Technical Architecture' },
  'product-pitch':     { slides: 12, label: 'Product Pitch Deck' },
  'general':           { slides: 8,  label: 'General Proposal' },
};

// ─────────────────────────────────────────────────────────────────────────────
// Template resolution — 2-tier
//   Tier 1: {projectRoot}/.viepilot/proposal-templates/{type}.{ext}  (project override)
//   Tier 2: {packageRoot}/templates/proposal/{ext}/{type}.{ext}       (stock)
// ─────────────────────────────────────────────────────────────────────────────
function resolveTemplate(type, ext, projectRoot) {
  const override = path.join(projectRoot, '.viepilot', 'proposal-templates', `${type}.${ext}`);
  if (fs.existsSync(override)) return override;
  // Stock fallback — lives next to this file at ../templates/proposal/{ext}/
  return path.join(__dirname, '..', 'templates', 'proposal', ext, `${type}.${ext}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Context detection — auto-load latest brainstorm session
// ─────────────────────────────────────────────────────────────────────────────
function detectBrainstormSession(projectRoot) {
  const dir = path.join(projectRoot, 'docs', 'brainstorm');
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir)
    .filter(f => f.startsWith('session-') && f.endsWith('.md'))
    .sort()
    .reverse();
  return files.length ? path.join(dir, files[0]) : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Proposal type validation
// ─────────────────────────────────────────────────────────────────────────────
function validateType(type) {
  if (!PROPOSAL_TYPES[type]) {
    throw new Error(
      `Unknown proposal type "${type}". Valid types: ${Object.keys(PROPOSAL_TYPES).join(', ')}`
    );
  }
  return PROPOSAL_TYPES[type];
}

// ─────────────────────────────────────────────────────────────────────────────
// Manifest meta schema (ENH-040)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Manifest meta object — collected via Step 2C quality brief.
 *
 * @typedef {Object} ProposalMeta
 * @property {string} cta           - Decision/action the proposal should drive
 * @property {string} [budget]      - Approximate budget range (optional)
 * @property {string} [timeline]    - Key deadline or constraint (optional)
 * @property {string} decisionMaker - Who is the primary audience/decision-maker
 */

// ─────────────────────────────────────────────────────────────────────────────
// Output path builder
// ─────────────────────────────────────────────────────────────────────────────
function buildOutputPaths(slug, projectRoot) {
  const date = new Date().toISOString().slice(0, 10);
  const base = path.join(projectRoot, 'docs', 'proposals', `${slug}-${date}`);
  return {
    md:     `${base}.md`,
    pptx:   `${base}.pptx`,
    docx:   `${base}.docx`,
    slides: `${base}-slides.txt`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Language instruction builder (ENH-039)
// ─────────────────────────────────────────────────────────────────────────────

const LANG_NAMES = {
  vi: 'Vietnamese', ja: 'Japanese', fr: 'French', zh: 'Chinese',
  ko: 'Korean', de: 'German', es: 'Spanish', pt: 'Portuguese',
  it: 'Italian', th: 'Thai', ar: 'Arabic', hi: 'Hindi',
};

/**
 * Build a language instruction string to prepend to the AI content generation prompt.
 *
 * @param {string} lang - ISO 639-1 code (e.g. 'vi', 'en', 'ja')
 * @param {boolean} [contentOnly=false] - if true, translate content only; keep structural labels English
 * @returns {string} Instruction to inject into AI prompt (empty string for English)
 */
function buildLangInstruction(lang, contentOnly = false) {
  if (!lang || lang === 'en') {
    return '';  // English is default — no explicit instruction needed
  }
  const langName = LANG_NAMES[lang] || lang.toUpperCase();

  if (contentOnly) {
    return (
      `LANGUAGE INSTRUCTION: Generate all slide content (bullet points, body text, ` +
      `speaker notes, and paragraph content) in ${langName}. ` +
      `Keep structural labels, section names, and template placeholders in English.`
    );
  }
  return (
    `LANGUAGE INSTRUCTION: Generate ALL content — slide headings, bullet points, ` +
    `body text, speaker notes, document section titles, and paragraph content — in ${langName}. ` +
    `Do not mix languages.`
  );
}

/** @type {Record<string, string[]>} */
const DIAGRAM_TYPES_BY_PROPOSAL = {
  'project-proposal':  ['flowchart', 'gantt'],
  'tech-architecture': ['flowchart', 'sequenceDiagram', 'classDiagram'],
  'product-pitch':     ['flowchart', 'sequenceDiagram'],
  'general':           ['flowchart'],
};

/**
 * Returns the list of Mermaid diagram types to generate for a given proposal type.
 * @param {string} typeId - Proposal type ID (e.g. 'project-proposal')
 * @returns {string[]} Array of Mermaid diagram type identifiers
 */
function getDiagramTypes(typeId) {
  return DIAGRAM_TYPES_BY_PROPOSAL[typeId] || ['flowchart'];
}

module.exports = {
  PROPOSAL_TYPES,
  resolveTemplate,
  detectBrainstormSession,
  validateType,
  buildOutputPaths,
  buildLangInstruction,
  getDiagramTypes,
};
