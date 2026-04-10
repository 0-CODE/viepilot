'use strict';
/**
 * gen-proposal-pptx.cjs
 * Generates 4 stock .pptx templates for vp-proposal skill.
 * Design: dark navy (#1a1f36) / charcoal (#2d3142) — ViePilot brand.
 *
 * Usage: node scripts/gen-proposal-pptx.cjs
 */

const path = require('path');
const fs   = require('fs');
const PptxGenJS = require('pptxgenjs');

const OUT_DIR = path.join(__dirname, '..', 'templates', 'proposal', 'pptx');

// ── Colour palette ────────────────────────────────────────────────────────────
const C = {
  navy:    '1a1f36',
  charcoal:'2d3142',
  accent:  '4f6ef7',
  light:   'e8ecf4',
  muted:   '8892b0',
  white:   'FFFFFF',
};

// ── Shared helpers ────────────────────────────────────────────────────────────
function makePres() {
  const pres = new PptxGenJS();
  pres.layout = 'LAYOUT_WIDE';
  pres.defineSlideMaster({
    title: 'VIEPILOT_MASTER',
    background: { color: C.navy },
    objects: [
      // Bottom accent bar
      { rect: { x: 0, y: 6.8, w: '100%', h: 0.08, fill: { color: C.accent } } },
      // Footer brand text
      { text: {
          text: 'ViePilot',
          options: { x: 0.3, y: 6.88, w: 2, h: 0.2, fontSize: 9, color: C.muted, align: 'left' }
      }},
    ],
  });
  return pres;
}

function addCoverSlide(pres, title, subtitle) {
  const slide = pres.addSlide({ masterName: 'VIEPILOT_MASTER' });
  // Accent line left
  slide.addShape(pres.ShapeType.rect, { x: 0, y: 1.8, w: 0.12, h: 2.4, fill: { color: C.accent } });
  slide.addText(title, {
    x: 0.4, y: 1.9, w: 11.6, h: 1.2,
    fontSize: 40, bold: true, color: C.light, fontFace: 'Calibri',
  });
  slide.addText(subtitle, {
    x: 0.4, y: 3.2, w: 9, h: 0.7,
    fontSize: 20, color: C.muted, fontFace: 'Calibri',
  });
  slide.addText('Prepared with ViePilot · ' + new Date().getFullYear(), {
    x: 0.4, y: 4.2, w: 6, h: 0.35,
    fontSize: 11, color: C.muted,
  });
  return slide;
}

function addSectionSlide(pres, heading, bullets) {
  const slide = pres.addSlide({ masterName: 'VIEPILOT_MASTER' });
  // Heading bar
  slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 1.1, fill: { color: C.charcoal } });
  slide.addText(heading, {
    x: 0.4, y: 0.18, w: 11.6, h: 0.75,
    fontSize: 24, bold: true, color: C.light, fontFace: 'Calibri',
  });
  // Bullet content
  const bulletText = bullets.map(b => ({ text: b, options: { bullet: true } }));
  slide.addText(bulletText, {
    x: 0.5, y: 1.3, w: 11.4, h: 5.2,
    fontSize: 16, color: C.light, fontFace: 'Calibri', valign: 'top',
  });
  return slide;
}

function addClosingSlide(pres, cta) {
  const slide = pres.addSlide({ masterName: 'VIEPILOT_MASTER' });
  slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: '100%', h: '100%', fill: { color: C.charcoal } });
  slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.08, fill: { color: C.accent } });
  slide.addText('Thank You', {
    x: 0.5, y: 1.5, w: 11.4, h: 1.4,
    fontSize: 48, bold: true, color: C.white, align: 'center',
  });
  slide.addText(cta, {
    x: 0.5, y: 3.2, w: 11.4, h: 0.8,
    fontSize: 20, color: C.muted, align: 'center',
  });
  slide.addText('contact@example.com · viepilot.dev', {
    x: 0.5, y: 4.3, w: 11.4, h: 0.4,
    fontSize: 13, color: C.muted, align: 'center',
  });
  return slide;
}

// ── Template definitions ──────────────────────────────────────────────────────
const TEMPLATES = {
  'project-proposal': {
    label: 'Project Proposal',
    cover: { title: '{{Project Name}}', subtitle: 'Project Proposal · {{Client}} · {{Date}}' },
    sections: [
      { heading: 'Agenda', bullets: ['Problem & Opportunity', 'Proposed Solution', 'Deliverables', 'Timeline & Budget', 'Next Steps'] },
      { heading: 'Problem / Opportunity', bullets: ['{{Problem statement}}', '{{Current pain points}}', '{{Business impact}}'] },
      { heading: 'Proposed Solution', bullets: ['{{Solution overview}}', '{{Key approach}}', '{{Unique value}}'] },
      { heading: 'Key Deliverables', bullets: ['{{Deliverable 1}}', '{{Deliverable 2}}', '{{Deliverable 3}}'] },
      { heading: 'Technical Approach', bullets: ['{{Architecture overview}}', '{{Tech stack}}', '{{Integration points}}'] },
      { heading: 'Project Timeline', bullets: ['Phase 1: {{Description}} — {{Duration}}', 'Phase 2: {{Description}} — {{Duration}}', 'Phase 3: {{Description}} — {{Duration}}'] },
      { heading: 'Team & Expertise', bullets: ['{{Team member 1}} — {{Role}}', '{{Team member 2}} — {{Role}}', '{{Relevant experience}}'] },
      { heading: 'Investment', bullets: ['Total estimate: {{Amount}}', 'Payment schedule: {{Terms}}', 'What\'s included: {{Scope}}'] },
    ],
    closing: 'Ready to get started? Let\'s discuss next steps.',
  },

  'tech-architecture': {
    label: 'Technical Architecture',
    cover: { title: '{{System Name}}', subtitle: 'Technical Architecture · {{Partner}} · {{Date}}' },
    sections: [
      { heading: 'Executive Summary', bullets: ['{{System purpose}}', '{{Key architectural decisions}}', '{{Expected outcomes}}'] },
      { heading: 'Problem Statement', bullets: ['{{Current limitations}}', '{{Scale requirements}}', '{{Technical constraints}}'] },
      { heading: 'Architecture Overview', bullets: ['{{High-level diagram description}}', '{{Core components}}', '{{System boundaries}}'] },
      { heading: 'Component Breakdown', bullets: ['{{Component 1}}: {{responsibility}}', '{{Component 2}}: {{responsibility}}', '{{Component 3}}: {{responsibility}}'] },
      { heading: 'Data Flow', bullets: ['{{Input sources}}', '{{Processing pipeline}}', '{{Output / consumers}}'] },
      { heading: 'Tech Stack', bullets: ['Frontend: {{technologies}}', 'Backend: {{technologies}}', 'Infrastructure: {{technologies}}'] },
      { heading: 'Security & Compliance', bullets: ['{{Auth strategy}}', '{{Data encryption}}', '{{Compliance requirements}}'] },
      { heading: 'Scalability & Performance', bullets: ['{{Scaling approach}}', '{{Performance targets}}', '{{Bottleneck mitigations}}'] },
      { heading: 'Integration Points', bullets: ['{{External API 1}}', '{{External API 2}}', '{{Internal services}}'] },
      { heading: 'Implementation Roadmap', bullets: ['Sprint 1: {{goal}}', 'Sprint 2: {{goal}}', 'Sprint 3: {{goal}}'] },
    ],
    closing: 'Questions? Let\'s dive deeper into any component.',
  },

  'product-pitch': {
    label: 'Product Pitch Deck',
    cover: { title: '{{Product Name}}', subtitle: '{{Tagline}} · {{Date}}' },
    sections: [
      { heading: 'The Problem', bullets: ['{{Pain point 1}}', '{{Pain point 2}}', '{{Market gap}}'] },
      { heading: 'Our Solution', bullets: ['{{What it does}}', '{{How it\'s different}}', '{{Core value proposition}}'] },
      { heading: 'Market Opportunity', bullets: ['TAM: {{Total addressable market}}', 'SAM: {{Serviceable market}}', 'SOM: {{Target share}}'] },
      { heading: 'Product Demo', bullets: ['{{Key feature 1}}', '{{Key feature 2}}', '{{Key feature 3}}'] },
      { heading: 'Business Model', bullets: ['Revenue model: {{description}}', 'Pricing: {{tiers}}', 'Unit economics: {{LTV/CAC}}'] },
      { heading: 'Traction & Validation', bullets: ['{{Metric 1}}: {{value}}', '{{Metric 2}}: {{value}}', '{{Customer proof point}}'] },
      { heading: 'Competitive Landscape', bullets: ['{{Competitor 1}} — {{weakness}}', '{{Competitor 2}} — {{weakness}}', 'Our advantage: {{differentiator}}'] },
      { heading: 'Team', bullets: ['{{Name}} — {{Role, background}}', '{{Name}} — {{Role, background}}', '{{Advisors / investors}}'] },
      { heading: 'Roadmap', bullets: ['Q1: {{milestone}}', 'Q2: {{milestone}}', 'Q3–Q4: {{milestone}}'] },
      { heading: 'The Ask', bullets: ['Raising: {{amount}}', 'Use of funds: {{breakdown}}', 'Milestones with this round: {{goals}}'] },
    ],
    closing: 'Join us in building {{product name}}.',
  },

  'general': {
    label: 'General Proposal',
    cover: { title: '{{Proposal Title}}', subtitle: '{{Organisation}} · {{Date}}' },
    sections: [
      { heading: 'Overview', bullets: ['{{Purpose of this proposal}}', '{{Scope}}', '{{Expected outcomes}}'] },
      { heading: 'Problem / Context', bullets: ['{{Background}}', '{{Current challenges}}', '{{Opportunity}}'] },
      { heading: 'Proposed Solution', bullets: ['{{What we\'re proposing}}', '{{Why this approach}}', '{{Expected benefits}}'] },
      { heading: 'Key Benefits', bullets: ['{{Benefit 1}}', '{{Benefit 2}}', '{{Benefit 3}}'] },
      { heading: 'Approach & Timeline', bullets: ['Phase 1: {{description}}', 'Phase 2: {{description}}', 'Estimated duration: {{timeframe}}'] },
      { heading: 'About Us', bullets: ['{{Organisation background}}', '{{Relevant experience}}', '{{Credentials / references}}'] },
    ],
    closing: 'We look forward to your feedback.',
  },
};

// ── Generate all templates ─────────────────────────────────────────────────────
async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const [typeId, def] of Object.entries(TEMPLATES)) {
    const pres = makePres();
    addCoverSlide(pres, def.cover.title, def.cover.subtitle);
    for (const section of def.sections) {
      addSectionSlide(pres, section.heading, section.bullets);
    }
    addClosingSlide(pres, def.closing);

    const outPath = path.join(OUT_DIR, `${typeId}.pptx`);
    await pres.writeFile({ fileName: outPath });
    const size = Math.round(fs.statSync(outPath).size / 1024);
    console.log(`  ✓ ${typeId}.pptx  (${size} KB)`);
  }
  console.log('\nAll 4 stock .pptx templates generated in templates/proposal/pptx/');
}

main().catch(err => { console.error(err); process.exit(1); });
