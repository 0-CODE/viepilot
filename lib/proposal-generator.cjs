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

module.exports = {
  PROPOSAL_TYPES,
  resolveTemplate,
  detectBrainstormSession,
  validateType,
  buildOutputPaths,
};
