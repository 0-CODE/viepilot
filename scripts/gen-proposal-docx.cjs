'use strict';
/**
 * gen-proposal-docx.cjs
 * Generates 1 stock .docx template for vp-proposal — project-detail document.
 *
 * Usage: node scripts/gen-proposal-docx.cjs
 */

const path = require('path');
const fs   = require('fs');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, PageBreak, Table, TableRow, TableCell,
  WidthType, BorderStyle, ShadingType,
} = require('docx');

const OUT_DIR  = path.join(__dirname, '..', 'templates', 'proposal', 'docx');
const OUT_FILE = path.join(OUT_DIR, 'project-detail.docx');

// ── Colour palette (hex without #) ────────────────────────────────────────────
const NAVY    = '1a1f36';
const ACCENT  = '4f6ef7';
const MUTED   = '8892b0';

// ── Helpers ───────────────────────────────────────────────────────────────────
function h1(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
    thematicBreak: false,
  });
}

function h2(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 150 },
  });
}

function para(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, ...opts })],
    spacing: { before: 100, after: 100 },
  });
}

function placeholder(label) {
  return para(`{{${label}}}`, { color: MUTED, italics: true });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function twoColTable(rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map(([label, value]) =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, color: 'auto', fill: 'F5F6FA' },
            children: [para(label, { bold: true })],
          }),
          new TableCell({
            width: { size: 70, type: WidthType.PERCENTAGE },
            children: [placeholder(value)],
          }),
        ],
      })
    ),
  });
}

// ── Document ──────────────────────────────────────────────────────────────────
async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const doc = new Document({
    styles: {
      paragraphStyles: [
        {
          id: 'Normal',
          name: 'Normal',
          run: { font: 'Calibri', size: 22 },  // 11pt
        },
        {
          id: 'Heading1',
          name: 'Heading 1',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { size: 36, bold: true, color: NAVY },
          paragraph: { spacing: { before: 400, after: 200 } },
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { size: 28, bold: true, color: ACCENT },
          paragraph: { spacing: { before: 300, after: 150 } },
        },
      ],
    },
    sections: [
      {
        children: [

          // ── Cover ──────────────────────────────────────────────────────────
          new Paragraph({
            children: [new TextRun({ text: '{{Project Name}}', size: 64, bold: true, color: NAVY })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 1200, after: 400 },
          }),
          new Paragraph({
            children: [new TextRun({ text: 'Project Detail Document', size: 32, color: MUTED })],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [new TextRun({ text: 'Prepared for: {{Client / Partner}}', size: 24, color: MUTED })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [new TextRun({ text: 'Date: {{Date}}', size: 24, color: MUTED })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [new TextRun({ text: 'Prepared by ViePilot vp-proposal', size: 20, color: MUTED, italics: true })],
            alignment: AlignmentType.CENTER,
          }),
          pageBreak(),

          // ── 1. Executive Summary ───────────────────────────────────────────
          h1('1. Executive Summary'),
          placeholder('Brief 2–3 paragraph overview of the project, its goals, and expected outcomes'),
          para(''),

          // ── 2. Problem & Opportunity ───────────────────────────────────────
          h1('2. Problem & Opportunity'),
          h2('2.1 Background'),
          placeholder('Context and background — what situation led to this proposal'),
          h2('2.2 Problem Statement'),
          placeholder('Clearly articulate the core problem being solved'),
          h2('2.3 Opportunity'),
          placeholder('What opportunity exists; why now'),
          para(''),

          // ── 3. Proposed Solution ──────────────────────────────────────────
          h1('3. Proposed Solution'),
          h2('3.1 Solution Overview'),
          placeholder('High-level description of the solution'),
          h2('3.2 Key Features'),
          placeholder('Feature 1: description'),
          placeholder('Feature 2: description'),
          placeholder('Feature 3: description'),
          h2('3.3 Value Proposition'),
          placeholder('Why this solution is the right choice — differentiators'),
          para(''),

          // ── 4. Technical Specifications ───────────────────────────────────
          h1('4. Technical Specifications'),
          h2('4.1 Architecture'),
          placeholder('System architecture description — components, interactions'),
          h2('4.2 Tech Stack'),
          twoColTable([
            ['Frontend', 'tech-stack'],
            ['Backend', 'tech-stack'],
            ['Database', 'tech-stack'],
            ['Infrastructure', 'tech-stack'],
            ['3rd-party services', 'integrations'],
          ]),
          para(''),
          h2('4.3 Integration Points'),
          placeholder('External systems, APIs, data flows'),
          h2('4.4 Security & Compliance'),
          placeholder('Auth, encryption, compliance requirements'),
          para(''),

          // ── 5. Project Timeline ──────────────────────────────────────────
          h1('5. Project Timeline'),
          twoColTable([
            ['Phase 1', 'description + duration'],
            ['Phase 2', 'description + duration'],
            ['Phase 3', 'description + duration'],
            ['Go-live', 'target date'],
          ]),
          para(''),

          // ── 6. Team ──────────────────────────────────────────────────────
          h1('6. Team'),
          twoColTable([
            ['{{Name}}', 'Role, background, relevant experience'],
            ['{{Name}}', 'Role, background, relevant experience'],
            ['{{Name}}', 'Role, background, relevant experience'],
          ]),
          para(''),

          // ── 7. Investment / Budget ────────────────────────────────────────
          h1('7. Investment & Budget'),
          twoColTable([
            ['Total estimate', 'amount'],
            ['Payment schedule', 'terms / milestones'],
            ['Included', 'scope summary'],
            ['Excluded', 'out-of-scope items'],
          ]),
          para(''),

          // ── 8. Risk & Mitigation ──────────────────────────────────────────
          h1('8. Risk & Mitigation'),
          twoColTable([
            ['{{Risk 1}}', 'mitigation strategy'],
            ['{{Risk 2}}', 'mitigation strategy'],
            ['{{Risk 3}}', 'mitigation strategy'],
          ]),
          para(''),

          // ── 9. Next Steps ─────────────────────────────────────────────────
          h1('9. Next Steps'),
          placeholder('Step 1: {{action}} by {{owner}} — {{date}}'),
          placeholder('Step 2: {{action}} by {{owner}} — {{date}}'),
          placeholder('Step 3: {{action}} by {{owner}} — {{date}}'),
          para(''),

          // ── 10. Appendix ──────────────────────────────────────────────────
          h1('10. Appendix'),
          h2('10.1 Brainstorm Notes'),
          placeholder('Auto-populated from vp-brainstorm session when available'),
          h2('10.2 References'),
          placeholder('Any external references, research, or supporting documents'),
          para(''),
          new Paragraph({
            children: [new TextRun({ text: '—  Generated by ViePilot vp-proposal  —', color: MUTED, italics: true })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 600 },
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(OUT_FILE, buffer);
  const size = Math.round(buffer.length / 1024);
  console.log(`  ✓ project-detail.docx  (${size} KB)`);
  console.log('\nStock .docx template generated in templates/proposal/docx/');
}

main().catch(err => { console.error(err); process.exit(1); });
