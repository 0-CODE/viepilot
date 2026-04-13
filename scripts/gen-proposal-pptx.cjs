'use strict';
/**
 * gen-proposal-pptx.cjs
 * Generates stock .pptx templates for vp-proposal skill.
 * ENH-040: 5 distinct slide layouts — cover, section, two-column, data, closing.
 * ENH-045: 3 colour palettes + 3 rich layouts (timeline-gantt, team-card, investment-visual)
 *          + 3 project-proposal palette variants.
 *
 * Usage: node scripts/gen-proposal-pptx.cjs
 */

const path = require('path');
const fs   = require('fs');
const PptxGenJS = require('pptxgenjs');

const OUT_DIR = path.join(__dirname, '..', 'templates', 'proposal', 'pptx');

// ── Colour palette ────────────────────────────────────────────────────────────
const C = {
  navy:     '1a1f36',
  charcoal: '2d3142',
  accent:   '4f6ef7',
  accentDim:'2a3f9e',
  light:    'e8ecf4',
  muted:    '8892b0',
  mutedDim: '5a637a',
  white:    'FFFFFF',
  dark:     '0d1020',
};

// ── Palette map — ENH-045 ──────────────────────────────────────────────────────
const PALETTES = {
  'modern-tech': { bg: '1a1f36', accent: '4f6ef7', accentDim: '2a3f9e', muted: '8892b0', mutedDim: '5a637a' },
  'enterprise':  { bg: '1a1f36', accent: 'c9a84c', accentDim: '9b7b2a', muted: '9aa0b0', mutedDim: '6b7080' },
  'creative':    { bg: '0d1020', accent: 'f7376e', accentDim: 'b02050', muted: '9b8fb0', mutedDim: '6b5f80' },
};

// ── Slide Master ──────────────────────────────────────────────────────────────
/**
 * @param {string} [paletteKey] - 'modern-tech' | 'enterprise' | 'creative' (default: 'modern-tech')
 */
function makePres(paletteKey = 'modern-tech') {
  const pal = PALETTES[paletteKey] || PALETTES['modern-tech'];
  const pres = new PptxGenJS();
  pres.layout = 'LAYOUT_WIDE';   // 13.33" × 7.5"
  pres.defineSlideMaster({
    title: 'VIEPILOT_MASTER',
    background: { color: pal.bg },
    objects: [
      // Bottom accent bar
      { rect: { x: 0, y: 7.18, w: '100%', h: 0.06, fill: { color: pal.accent } } },
      // Footer: brand left
      { text: {
          text: 'ViePilot',
          options: { x: 0.3, y: 7.24, w: 2, h: 0.22, fontSize: 8, color: pal.muted, align: 'left', fontFace: 'Calibri' },
      }},
      // Footer: page number right
      { text: {
          text: '·',
          options: { x: 11.5, y: 7.24, w: 1.5, h: 0.22, fontSize: 8, color: pal.mutedDim, align: 'right', fontFace: 'Calibri' },
      }},
    ],
  });
  // Attach palette to pres for use in layout functions
  pres._vpPalette = pal;
  return pres;
}

// ── Layout 1: Cover ───────────────────────────────────────────────────────────
// Full-bleed title, large accent graphic element, subtitle + meta
function addCoverSlide(pres, { title, subtitle, meta }) {
  const slide = pres.addSlide({ masterName: 'VIEPILOT_MASTER' });
  // Large accent background block (left 40%)
  slide.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: 5.2, h: 7.5,
    fill: { color: C.charcoal },
  });
  // Accent bar left edge
  slide.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: 0.2, h: 7.5,
    fill: { color: C.accent },
  });
  // Horizontal accent line (right panel divider)
  slide.addShape(pres.ShapeType.rect, {
    x: 5.4, y: 2.8, w: 7.7, h: 0.05,
    fill: { color: C.accent },
  });
  // "PROPOSAL" label top-right
  slide.addText('PROPOSAL', {
    x: 5.6, y: 0.5, w: 7.4, h: 0.4,
    fontSize: 11, bold: true, color: C.accent, charSpacing: 3, fontFace: 'Calibri',
  });
  // Main title (right panel)
  slide.addText(title, {
    x: 5.4, y: 1.1, w: 7.7, h: 1.8,
    fontSize: 34, bold: true, color: C.light, fontFace: 'Calibri', wrap: true,
  });
  // Subtitle (right panel, below divider)
  slide.addText(subtitle, {
    x: 5.4, y: 3.0, w: 7.7, h: 0.9,
    fontSize: 17, color: C.muted, fontFace: 'Calibri', wrap: true,
  });
  // Meta info (right panel bottom)
  if (meta) {
    slide.addText(meta, {
      x: 5.4, y: 4.1, w: 7.7, h: 0.5,
      fontSize: 12, color: C.mutedDim, fontFace: 'Calibri',
    });
  }
  // Left panel: ViePilot mark
  slide.addText('V', {
    x: 0.4, y: 0.5, w: 1.2, h: 1.2,
    fontSize: 56, bold: true, color: C.accent, fontFace: 'Calibri',
  });
  // Left panel: "ViePilot" brand
  slide.addText('ViePilot', {
    x: 0.4, y: 6.5, w: 4.4, h: 0.4,
    fontSize: 11, color: C.muted, fontFace: 'Calibri',
  });
  return slide;
}

// ── Layout 2: Section ─────────────────────────────────────────────────────────
// Accent left sidebar (thin), heading row, bullets body
function addSectionSlide(pres, { heading, bullets }) {
  const slide = pres.addSlide({ masterName: 'VIEPILOT_MASTER' });
  // Left accent sidebar
  slide.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: 0.12, h: 7.5,
    fill: { color: C.accent },
  });
  // Heading background row
  slide.addShape(pres.ShapeType.rect, {
    x: 0.12, y: 0, w: 13.21, h: 1.0,
    fill: { color: C.charcoal },
  });
  // Heading text
  slide.addText(heading, {
    x: 0.38, y: 0.12, w: 12.7, h: 0.76,
    fontSize: 22, bold: true, color: C.light, fontFace: 'Calibri', valign: 'middle',
  });
  // Bullets
  const bulletItems = bullets.map(b => ({ text: b, options: { bullet: { type: 'bullet', characterCode: '2022', indent: 15 }, color: C.light, fontSize: 15 } }));
  slide.addText(bulletItems, {
    x: 0.5, y: 1.2, w: 12.5, h: 5.7,
    fontFace: 'Calibri', valign: 'top', paraSpaceAfter: 8,
  });
  return slide;
}

// ── Layout 3: Two-Column ──────────────────────────────────────────────────────
// Heading row, two equal content columns (comparisons, before/after, pros/cons)
function addTwoColumnSlide(pres, { heading, leftLabel, leftBullets, rightLabel, rightBullets }) {
  const slide = pres.addSlide({ masterName: 'VIEPILOT_MASTER' });
  // Top heading bar
  slide.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: 1.0,
    fill: { color: C.charcoal },
  });
  slide.addText(heading, {
    x: 0.38, y: 0.12, w: 12.7, h: 0.76,
    fontSize: 22, bold: true, color: C.light, fontFace: 'Calibri', valign: 'middle',
  });
  // Column divider
  slide.addShape(pres.ShapeType.rect, {
    x: 6.55, y: 1.15, w: 0.04, h: 5.8,
    fill: { color: C.mutedDim },
  });
  // Left column label
  slide.addText(leftLabel || 'Current', {
    x: 0.38, y: 1.15, w: 6.0, h: 0.45,
    fontSize: 13, bold: true, color: C.accent, fontFace: 'Calibri',
  });
  // Left column bullets
  const leftItems = leftBullets.map(b => ({ text: b, options: { bullet: true, color: C.light, fontSize: 14 } }));
  slide.addText(leftItems, {
    x: 0.38, y: 1.7, w: 6.0, h: 5.0,
    fontFace: 'Calibri', valign: 'top', paraSpaceAfter: 7,
  });
  // Right column label
  slide.addText(rightLabel || 'Proposed', {
    x: 6.9, y: 1.15, w: 6.0, h: 0.45,
    fontSize: 13, bold: true, color: C.accent, fontFace: 'Calibri',
  });
  // Right column bullets
  const rightItems = rightBullets.map(b => ({ text: b, options: { bullet: true, color: C.light, fontSize: 14 } }));
  slide.addText(rightItems, {
    x: 6.9, y: 1.7, w: 6.0, h: 5.0,
    fontFace: 'Calibri', valign: 'top', paraSpaceAfter: 7,
  });
  return slide;
}

// ── Layout 4: Data / Metrics ──────────────────────────────────────────────────
// Heading, up to 3 large metric callout boxes
function addDataSlide(pres, { heading, metrics }) {
  const slide = pres.addSlide({ masterName: 'VIEPILOT_MASTER' });
  // Top heading bar
  slide.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: 1.0,
    fill: { color: C.charcoal },
  });
  slide.addText(heading, {
    x: 0.38, y: 0.12, w: 12.7, h: 0.76,
    fontSize: 22, bold: true, color: C.light, fontFace: 'Calibri', valign: 'middle',
  });
  // Metric boxes (up to 3, evenly spaced)
  const count = Math.min(metrics.length, 3);
  const boxW  = 3.8;
  const gap   = (13.33 - count * boxW) / (count + 1);
  metrics.slice(0, count).forEach((m, i) => {
    const x = gap + i * (boxW + gap);
    // Box background
    slide.addShape(pres.ShapeType.rect, {
      x, y: 1.6, w: boxW, h: 3.2,
      fill: { color: C.charcoal },
      line: { color: C.accent, width: 1.5 },
    });
    // Metric value (large)
    slide.addText(m.value || '{{Value}}', {
      x, y: 1.8, w: boxW, h: 1.4,
      fontSize: 40, bold: true, color: C.accent, align: 'center', fontFace: 'Calibri',
    });
    // Metric label
    slide.addText(m.label || '{{Label}}', {
      x, y: 3.2, w: boxW, h: 0.55,
      fontSize: 15, color: C.light, align: 'center', fontFace: 'Calibri',
    });
    // Metric sub-note
    if (m.note) {
      slide.addText(m.note, {
        x, y: 3.75, w: boxW, h: 0.4,
        fontSize: 11, color: C.muted, align: 'center', fontFace: 'Calibri',
      });
    }
  });
  return slide;
}

// ── Layout 5: Closing ─────────────────────────────────────────────────────────
// Full-bleed charcoal, accent top bar, large CTA, contact line
function addClosingSlide(pres, { cta, contact }) {
  const slide = pres.addSlide({ masterName: 'VIEPILOT_MASTER' });
  // Full background
  slide.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: 7.5,
    fill: { color: C.charcoal },
  });
  // Top accent bar
  slide.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: 0.15,
    fill: { color: C.accent },
  });
  // Bottom accent bar
  slide.addShape(pres.ShapeType.rect, {
    x: 0, y: 7.35, w: '100%', h: 0.15,
    fill: { color: C.accent },
  });
  // CTA label
  slide.addText("What's Next", {
    x: 0.5, y: 1.4, w: 12.4, h: 0.5,
    fontSize: 13, bold: true, color: C.accent, align: 'center', charSpacing: 2, fontFace: 'Calibri',
  });
  // Main CTA text
  slide.addText(cta, {
    x: 1.0, y: 2.1, w: 11.4, h: 2.0,
    fontSize: 32, bold: true, color: C.white, align: 'center', fontFace: 'Calibri', wrap: true,
  });
  // Accent divider
  slide.addShape(pres.ShapeType.rect, {
    x: 4.5, y: 4.3, w: 4.4, h: 0.04,
    fill: { color: C.accent },
  });
  // Contact info
  slide.addText(contact || 'contact@example.com  ·  viepilot.dev', {
    x: 0.5, y: 4.55, w: 12.4, h: 0.45,
    fontSize: 13, color: C.muted, align: 'center', fontFace: 'Calibri',
  });
  // ViePilot brand bottom
  slide.addText('Powered by ViePilot', {
    x: 0.5, y: 6.6, w: 12.4, h: 0.35,
    fontSize: 10, color: C.mutedDim, align: 'center', fontFace: 'Calibri',
  });
  return slide;
}

// ── Rich Layout: Timeline Gantt — ENH-045 ────────────────────────────────────
// Gantt-style timeline slide: heading + phase bars with labels and duration notes.
// phases: Array<{ label: string, duration: string, note?: string }> (up to 5)
function addTimelineGanttSlide(pres, { heading, phases }) {
  const pal = pres._vpPalette || PALETTES['modern-tech'];
  const slide = pres.addSlide({ masterName: 'VIEPILOT_MASTER' });
  // Heading bar
  slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 1.0, fill: { color: pal.accentDim } });
  slide.addText(heading, {
    x: 0.4, y: 0.15, w: 12.5, h: 0.7,
    fontSize: 22, bold: true, color: C.white, fontFace: 'Calibri Light',
  });

  const maxItems = Math.min(phases.length, 5);
  const barColors = [pal.accent, pal.accentDim, pal.muted, pal.accent, pal.accentDim];
  const rowH   = 0.9;
  const startY = 1.25;
  const labelW = 2.8;
  const barMaxW = 7.5;
  const noteX  = labelW + barMaxW + 0.6;

  for (let i = 0; i < maxItems; i++) {
    const ph  = phases[i];
    const y   = startY + i * rowH;
    const pct = (i + 1) / maxItems; // proportional width — last phase fills most
    const barW = Math.max(0.8, barMaxW * (0.35 + 0.65 * pct));

    // Phase label
    slide.addText(ph.label || `Phase ${i + 1}`, {
      x: 0.4, y: y + 0.05, w: labelW - 0.1, h: 0.6,
      fontSize: 12, color: C.white, fontFace: 'Calibri', valign: 'middle',
    });
    // Bar
    slide.addShape(pres.ShapeType.rect, {
      x: labelW + 0.1, y: y + 0.1, w: barW, h: 0.55,
      fill: { color: barColors[i % barColors.length] },
      line: { type: 'none' },
    });
    // Duration inside bar
    if (ph.duration) {
      slide.addText(ph.duration, {
        x: labelW + 0.2, y: y + 0.1, w: barW - 0.2, h: 0.55,
        fontSize: 11, bold: true, color: C.white, fontFace: 'Calibri', valign: 'middle',
      });
    }
    // Note to right of bar
    if (ph.note) {
      slide.addText(ph.note, {
        x: noteX, y: y + 0.1, w: 2.8, h: 0.55,
        fontSize: 10, color: pal.muted, fontFace: 'Calibri', valign: 'middle',
      });
    }
  }
  return slide;
}

// ── Rich Layout: Team Card Grid — ENH-045 ─────────────────────────────────────
// 2×2 card grid for team members. members: Array<{ name, role, background }> (up to 4)
function addTeamCardSlide(pres, { heading, members }) {
  const pal = pres._vpPalette || PALETTES['modern-tech'];
  const slide = pres.addSlide({ masterName: 'VIEPILOT_MASTER' });
  // Heading bar
  slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 1.0, fill: { color: pal.accentDim } });
  slide.addText(heading, {
    x: 0.4, y: 0.15, w: 12.5, h: 0.7,
    fontSize: 22, bold: true, color: C.white, fontFace: 'Calibri Light',
  });

  const positions = [
    { col: 0, row: 0 }, { col: 1, row: 0 },
    { col: 0, row: 1 }, { col: 1, row: 1 },
  ];
  const cardW = 5.8, cardH = 2.5;
  const colX  = [0.4, 6.7];
  const rowY  = [1.2, 3.85];
  const maxMembers = Math.min(members.length, 4);

  for (let i = 0; i < maxMembers; i++) {
    const m   = members[i];
    const pos = positions[i];
    const x   = colX[pos.col];
    const y   = rowY[pos.row];

    // Card background
    slide.addShape(pres.ShapeType.rect, {
      x, y, w: cardW, h: cardH,
      fill: { color: C.charcoal },
      line: { type: 'none' },
    });
    // Accent left stripe
    slide.addShape(pres.ShapeType.rect, {
      x, y, w: 0.12, h: cardH,
      fill: { color: pal.accent },
      line: { type: 'none' },
    });
    // Role (bold, accent colour)
    slide.addText(m.role || 'Role', {
      x: x + 0.25, y: y + 0.2, w: cardW - 0.35, h: 0.45,
      fontSize: 13, bold: true, color: pal.accent, fontFace: 'Calibri',
    });
    // Name
    slide.addText(m.name || '{{Name}}', {
      x: x + 0.25, y: y + 0.65, w: cardW - 0.35, h: 0.4,
      fontSize: 14, bold: true, color: C.white, fontFace: 'Calibri',
    });
    // Background line
    if (m.background) {
      slide.addText(m.background, {
        x: x + 0.25, y: y + 1.1, w: cardW - 0.35, h: 1.2,
        fontSize: 11, color: pal.muted, fontFace: 'Calibri', wrap: true,
      });
    }
  }
  return slide;
}

// ── Rich Layout: Investment Visual — ENH-045 ──────────────────────────────────
// Large total value + 3-column breakdown.
// breakdown: Array<{ value, label, note }> (3 items)
function addInvestmentVisualSlide(pres, { heading, total, totalNote, breakdown }) {
  const pal = pres._vpPalette || PALETTES['modern-tech'];
  const slide = pres.addSlide({ masterName: 'VIEPILOT_MASTER' });
  // Heading bar
  slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 1.0, fill: { color: pal.accentDim } });
  slide.addText(heading, {
    x: 0.4, y: 0.15, w: 12.5, h: 0.7,
    fontSize: 22, bold: true, color: C.white, fontFace: 'Calibri Light',
  });

  // Large total (centred)
  slide.addText(total || '$XX,XXX', {
    x: 0.5, y: 1.15, w: 12.4, h: 1.3,
    fontSize: 64, bold: true, color: pal.accent, align: 'center', fontFace: 'Calibri',
  });
  if (totalNote) {
    slide.addText(totalNote, {
      x: 0.5, y: 2.5, w: 12.4, h: 0.4,
      fontSize: 13, color: pal.muted, align: 'center', fontFace: 'Calibri Light',
    });
  }

  // Separator bar
  slide.addShape(pres.ShapeType.rect, {
    x: 1.5, y: 3.1, w: 10.3, h: 0.04,
    fill: { color: pal.accentDim }, line: { type: 'none' },
  });

  // 3-column breakdown
  const cols = [{ x: 0.5 }, { x: 4.7 }, { x: 8.9 }];
  const items = (breakdown || []).slice(0, 3);
  items.forEach((item, i) => {
    const cx = cols[i].x;
    slide.addText(item.value || '—', {
      x: cx, y: 3.3, w: 3.9, h: 0.85,
      fontSize: 30, bold: true, color: C.white, align: 'center', fontFace: 'Calibri',
    });
    slide.addText(item.label || '', {
      x: cx, y: 4.2, w: 3.9, h: 0.45,
      fontSize: 13, color: pal.muted, align: 'center', fontFace: 'Calibri Light',
    });
    if (item.note) {
      slide.addText(item.note, {
        x: cx, y: 4.7, w: 3.9, h: 0.35,
        fontSize: 10, color: pal.mutedDim, align: 'center', fontFace: 'Calibri',
      });
    }
  });
  return slide;
}

// ── Template definitions ──────────────────────────────────────────────────────

const TEMPLATES = {
  'project-proposal': {
    label: 'Project Proposal',
    cover: {
      title: '{{Project Name}}',
      subtitle: '{{One sentence describing the value this project delivers to the client}}',
      meta: 'Prepared for {{Client}} · {{Date}}',
    },
    slides: [
      // index 2 — Agenda (section)
      { layout: 'section', heading: 'Agenda', bullets: [
        'Problem & Opportunity', 'Proposed Solution', 'Key Deliverables',
        'Technical Approach', 'Timeline & Investment', 'Next Steps',
      ]},
      // index 3 — Problem (section)
      { layout: 'section', heading: 'Problem / Opportunity', bullets: [
        '{{Describe the core problem in 8–12 words, outcome-oriented}}',
        '{{Current pain point — quantify if possible: "$X lost per month"}}',
        '{{Business impact if unresolved: risk, cost, missed opportunity}}',
      ]},
      // index 4 — Solution (section)
      { layout: 'section', heading: 'Proposed Solution', bullets: [
        '{{Lead with the key capability: "A platform that automates..."}}',
        '{{How the approach is different from what they tried before}}',
        '{{The core value proposition in one outcome sentence}}',
      ]},
      // index 5 — Deliverables vs Out-of-scope (two-column)
      { layout: 'two-column', heading: 'Scope & Deliverables',
        leftLabel: 'In Scope', leftBullets: ['{{Deliverable 1}}', '{{Deliverable 2}}', '{{Deliverable 3}}'],
        rightLabel: 'Out of Scope', rightBullets: ['{{Exclusion 1}}', '{{Exclusion 2}}', '{{Exclusion 3}}'],
      },
      // index 6 — Technical Approach (section)
      { layout: 'section', heading: 'Technical Approach', bullets: [
        '{{Architecture decision + rationale in one sentence}}',
        '{{Tech stack choice: "Built on X because Y"}}',
        '{{Integration with existing systems: timeline + effort}}',
      ]},
      // index 7 — Timeline (data)
      { layout: 'data', heading: 'Project Timeline', metrics: [
        { value: 'Phase 1', label: 'Discovery & Design', note: '2 weeks' },
        { value: 'Phase 2', label: 'Development', note: '6–8 weeks' },
        { value: 'Phase 3', label: 'Testing & Launch', note: '2 weeks' },
      ]},
      // index 8 — Team (section)
      { layout: 'section', heading: 'Team & Expertise', bullets: [
        '{{Team Lead}} — {{Role, 1-line background relevant to this project}}',
        '{{Team Member}} — {{Role, key skill}}',
        '{{Relevant past project: "Delivered X for Y — outcome"}}',
      ]},
      // index 9 — Investment (data)
      { layout: 'data', heading: 'Investment Estimate', metrics: [
        { value: '${{XX}}K', label: 'Total Investment', note: '{{Payment terms}}' },
        { value: '{{N}} wks', label: 'Time to Delivery', note: 'From kickoff' },
        { value: '{{ROI}}', label: 'Expected Return', note: '{{Timeframe}}' },
      ]},
    ],
    closing: {
      cta: '{{Ready to start? Let\'s schedule the kickoff.}}',
      contact: 'contact@example.com  ·  Schedule a call: calendly.com/{{handle}}',
    },
  },

  'tech-architecture': {
    label: 'Technical Architecture',
    cover: {
      title: '{{System Name}}',
      subtitle: '{{One sentence: what problem this architecture solves at scale}}',
      meta: 'Technical Brief for {{Partner}} · {{Date}}',
    },
    slides: [
      { layout: 'section', heading: 'Executive Summary', bullets: [
        '{{System purpose: "Enables X to do Y at Z scale"}}',
        '{{Key architectural decision + rationale}}',
        '{{Expected outcome: performance target, cost reduction, or reliability gain}}',
      ]},
      { layout: 'section', heading: 'Problem Statement', bullets: [
        '{{Current limitation: "The existing system cannot handle X because Y"}}',
        '{{Scale requirement: throughput, latency, or data volume target}}',
        '{{Constraint: budget, timeline, team size, or compliance requirement}}',
      ]},
      { layout: 'section', heading: 'Architecture Overview', bullets: [
        '{{Layer 1 (e.g. Presentation)}} → {{Layer 2 (e.g. API Gateway)}} → {{Layer 3 (e.g. Services)}}',
        '{{Core architectural pattern: microservices / event-driven / serverless}}',
        '{{Key infrastructure: cloud provider, orchestration, data store}}',
      ]},
      { layout: 'two-column', heading: 'Component Breakdown',
        leftLabel: 'Frontend / Client', leftBullets: ['{{Component A}} — {{responsibility}}', '{{Component B}} — {{responsibility}}', '{{State management: approach}}'],
        rightLabel: 'Backend / Services', rightBullets: ['{{Service X}} — {{responsibility}}', '{{Service Y}} — {{responsibility}}', '{{Data layer: type + rationale}}'],
      },
      { layout: 'section', heading: 'Data Flow', bullets: [
        'Input: {{Source}} → {{Processing step 1}} → {{Processing step 2}}',
        'Storage: {{What is persisted, where, and why}}',
        'Output: {{Consumers / downstream systems / APIs exposed}}',
      ]},
      { layout: 'section', heading: 'Tech Stack', bullets: [
        'Frontend: {{technologies + version}}',
        'Backend: {{technologies + version}}',
        'Infrastructure: {{cloud + container + CI/CD}}',
      ]},
      { layout: 'two-column', heading: 'Security & Scalability',
        leftLabel: 'Security', leftBullets: ['Auth: {{OAuth2 / JWT / RBAC}}', 'Encryption: {{at rest + in transit}}', 'Compliance: {{SOC2 / GDPR / HIPAA}}'],
        rightLabel: 'Scalability', rightBullets: ['Scale-out: {{horizontal strategy}}', 'Throughput target: {{X req/sec}}', 'Bottleneck mitigation: {{caching / queue}}'],
      },
      { layout: 'data', heading: 'Performance Targets', metrics: [
        { value: '<{{N}}ms', label: 'p95 Latency', note: 'API response time' },
        { value: '{{X}}K/s', label: 'Throughput', note: 'Requests per second' },
        { value: '99.{{N}}%', label: 'Availability', note: 'Monthly uptime SLA' },
      ]},
      { layout: 'section', heading: 'Integration Points', bullets: [
        '{{External API 1}}: {{protocol, frequency, SLA expectation}}',
        '{{Internal service}}: {{sync/async, data contract}}',
        '{{Third-party tool}}: {{purpose + dependency risk}}',
      ]},
      { layout: 'section', heading: 'Implementation Roadmap', bullets: [
        'Sprint 1–2: {{Foundation — infra, CI/CD, auth}}',
        'Sprint 3–5: {{Core services — {{key features}}}}',
        'Sprint 6–7: {{Integration, load testing, hardening}}',
      ]},
    ],
    closing: {
      cta: '{{Questions? Let\'s schedule a technical deep-dive.}}',
      contact: 'engineering@example.com  ·  GitHub: github.com/{{org}}',
    },
  },

  'product-pitch': {
    label: 'Product Pitch Deck',
    cover: {
      title: '{{Product Name}}',
      subtitle: '{{One sentence: who you help, what problem you solve, and the key outcome}}',
      meta: '{{Round / Stage}} · {{Date}}',
    },
    slides: [
      { layout: 'section', heading: 'The Problem', bullets: [
        '{{Vivid description of pain: "Every day, X people struggle with Y — costing Z"}}',
        '{{Why current solutions fail: "Existing tools are X, Y, and Z"}}',
        '{{Market signal: survey data, search volume, or VC attention}}',
      ]},
      { layout: 'section', heading: 'Our Solution', bullets: [
        '{{What it does in one sentence: "{{Product}} lets X do Y in Z time"}}',
        '{{Key differentiator: what makes this fundamentally different}}',
        '{{User experience: describe the "aha moment" for a new user}}',
      ]},
      { layout: 'data', heading: 'Market Opportunity', metrics: [
        { value: '${{X}}B', label: 'TAM', note: 'Total addressable market' },
        { value: '${{Y}}M', label: 'SAM', note: 'Serviceable segment' },
        { value: '${{Z}}M', label: 'SOM (Y1)', note: '{{Go-to-market target}}' },
      ]},
      { layout: 'section', heading: 'Product Highlights', bullets: [
        '{{Feature 1}}: {{outcome in user-centric language}}',
        '{{Feature 2}}: {{outcome — quantify if possible}}',
        '{{Feature 3}}: {{outcome — how it compares to status quo}}',
      ]},
      { layout: 'section', heading: 'Business Model', bullets: [
        'Revenue model: {{SaaS / usage-based / marketplace / license}}',
        'Pricing: {{Tier 1 at $X/mo — Tier 2 at $Y/mo — Enterprise custom}}',
        'Unit economics: LTV ${{X}} · CAC ${{Y}} · Payback {{N}} months',
      ]},
      { layout: 'data', heading: 'Traction & Validation', metrics: [
        { value: '{{X}}', label: '{{Key metric e.g. Active Users}}', note: '{{Growth rate}}' },
        { value: '${{Y}}K', label: 'ARR / MRR', note: '{{MoM growth %}}' },
        { value: '{{N}}', label: 'Customers', note: '{{Notable logos}}' },
      ]},
      { layout: 'two-column', heading: 'Competitive Landscape',
        leftLabel: 'Competitors', leftBullets: ['{{Competitor A}} — {{key weakness}}', '{{Competitor B}} — {{key weakness}}', '{{Status quo}} — {{why it fails}}'],
        rightLabel: 'Our Advantage', rightBullets: ['{{Differentiator 1}}: {{why it matters}}', '{{Differentiator 2}}: {{moat or defensibility}}', '{{Differentiator 3}}: {{network effect / IP / switching cost}}'],
      },
      { layout: 'section', heading: 'Team', bullets: [
        '{{Founder/CEO}} — {{1-line background: domain expertise + prior outcome}}',
        '{{CTO/Co-founder}} — {{technical background + relevant achievement}}',
        '{{Advisor/Investor}} — {{credibility signal}}',
      ]},
      { layout: 'section', heading: 'Roadmap', bullets: [
        'Q{{N}} {{Year}}: {{Milestone — e.g. GA launch, key integration, first enterprise deal}}',
        'Q{{N+1}}: {{Milestone — growth lever or product expansion}}',
        'Q{{N+2}}: {{Milestone — scale or expansion target}}',
      ]},
      { layout: 'section', heading: 'The Ask', bullets: [
        'Raising: ${{Amount}} ({{round type: pre-seed / seed / Series A}}) ',
        'Use of funds: {{XX}}% product · {{YY}}% GTM · {{ZZ}}% ops',
        'Key milestone: {{What this round buys — users, revenue, product}}',
      ]},
    ],
    closing: {
      cta: '{{Join us in building {{product name}}.}}',
      contact: 'founder@{{product}}.com  ·  deck@{{product}}.com',
    },
  },

  'general': {
    label: 'General Proposal',
    cover: {
      title: '{{Proposal Title}}',
      subtitle: '{{One sentence: what you are proposing and the key benefit to the audience}}',
      meta: '{{Organisation}} · {{Date}}',
    },
    slides: [
      { layout: 'section', heading: 'Overview', bullets: [
        '{{Purpose of this proposal in one sentence: "We propose to X in order to Y"}}',
        '{{Scope: what is covered (and what is not)}}',
        '{{Expected outcomes: 2–3 measurable benefits}}',
      ]},
      { layout: 'section', heading: 'Problem / Context', bullets: [
        '{{Background: why this situation exists}}',
        '{{Current challenge: specific, measurable if possible}}',
        '{{Opportunity: what becomes possible if this is addressed}}',
      ]},
      { layout: 'section', heading: 'Proposed Solution', bullets: [
        '{{What we are proposing: specific and concrete}}',
        '{{Why this approach: rationale over alternatives}}',
        '{{Expected benefit: outcome-first language}}',
      ]},
      { layout: 'two-column', heading: 'Key Benefits',
        leftLabel: 'Short-term (0–3 months)', leftBullets: ['{{Benefit A}}', '{{Benefit B}}', '{{Benefit C}}'],
        rightLabel: 'Long-term (3–12 months)', rightBullets: ['{{Benefit D}}', '{{Benefit E}}', '{{Benefit F}}'],
      },
      { layout: 'section', heading: 'Approach & Timeline', bullets: [
        'Phase 1 ({{duration}}): {{goal + key activities}}',
        'Phase 2 ({{duration}}): {{goal + key activities}}',
        'Phase 3 ({{duration}}): {{goal + delivery}}',
      ]},
      { layout: 'section', heading: 'About Us / Credentials', bullets: [
        '{{Organisation background: founded, mission, size}}',
        '{{Relevant experience: past project + outcome}}',
        '{{Credential / reference: client name or award}}',
      ]},
    ],
    closing: {
      cta: '{{We look forward to your feedback and the opportunity to move forward together.}}',
      contact: 'contact@example.com  ·  {{phone or website}}',
    },
  },
};

// ── Visual embedding helpers (ENH-042) ────────────────────────────────────────

/**
 * Add a styled placeholder shape to a slide where a screenshot would appear.
 * Used as fallback when puppeteer is not installed or artifact file is missing.
 *
 * @param {object} slide - pptxgenjs slide object
 * @param {string} [label='Screenshot placeholder'] - Label text shown in the box
 */
function addPlaceholderVisual(slide, label = 'Screenshot placeholder') {
  // Dark background box (matches navy theme)
  slide.addShape(pptxgen.ShapeType.rect, {
    x: 0.4, y: 1.6, w: '58%', h: 3.6,
    fill: { color: '2d3142' },
    line: { color: '4f6ef7', width: 1.5 },
  });
  // Label text
  slide.addText(label, {
    x: 0.4, y: 1.6, w: '58%', h: 3.6,
    color: '8892b0', fontSize: 12, italic: true,
    align: 'center', valign: 'middle',
  });
}

// ── Runtime visual embedding (called by vp-proposal workflow, not template gen) ──
// When visualSlides[] is populated by Step 4c, apply screenshots or placeholders:
//
//   const { screenshotArtifact, cleanupScreenshot } = require('../lib/screenshot-artifact.cjs');
//
//   for (const entry of visualSlides) {
//     const slide = pptx.slides[entry.slideIndex];
//     if (!slide) continue;
//     const tmpPng = await screenshotArtifact(entry.htmlPath);
//     if (tmpPng) {
//       slide.addImage({ path: tmpPng, x: 0.4, y: 1.6, w: '58%', h: 3.6 });
//       cleanupScreenshot(tmpPng);
//     } else {
//       addPlaceholderVisual(slide, entry.label || 'Visual: ' + entry.artifactType);
//     }
//   }

// ── Shared pres build helper ──────────────────────────────────────────────────
async function buildPres(typeId, def, paletteKey, outFileName) {
  const pres = makePres(paletteKey);
  addCoverSlide(pres, def.cover);
  for (const s of def.slides) {
    switch (s.layout) {
      case 'section':      addSectionSlide(pres, s);    break;
      case 'two-column':   addTwoColumnSlide(pres, s);  break;
      case 'data':         addDataSlide(pres, s);        break;
      case 'timeline-gantt':    addTimelineGanttSlide(pres, s);    break;
      case 'team-card':         addTeamCardSlide(pres, s);         break;
      case 'investment-visual': addInvestmentVisualSlide(pres, s); break;
      default:             addSectionSlide(pres, s);
    }
  }
  addClosingSlide(pres, def.closing);
  const outPath = path.join(OUT_DIR, outFileName);
  await pres.writeFile({ fileName: outPath });
  const size       = Math.round(fs.statSync(outPath).size / 1024);
  const slideCount = 1 + def.slides.length + 1;
  console.log(`  ✓ ${outFileName}  (${size} KB, ${slideCount} slides)`);
}

// ── Generate all templates ─────────────────────────────────────────────────────
async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // Standard types (single palette — modern-tech default)
  for (const [typeId, def] of Object.entries(TEMPLATES)) {
    if (typeId === 'project-proposal') continue; // handled separately below
    await buildPres(typeId, def, 'modern-tech', `${typeId}.pptx`);
  }

  // ENH-045: project-proposal — 3 palette variants
  const ppDef = TEMPLATES['project-proposal'];
  for (const pal of ['modern-tech', 'enterprise', 'creative']) {
    await buildPres('project-proposal', ppDef, pal, `project-proposal-${pal}.pptx`);
  }

  console.log('\nStock .pptx templates generated in templates/proposal/pptx/');
}

main().catch(err => { console.error(err); process.exit(1); });
