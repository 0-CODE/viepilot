'use strict';
/**
 * gen-proposal-docx.cjs
 * Generates stock .docx template for vp-proposal — project-detail document.
 * ENH-040: Gantt-style Timeline table, Budget/Investment table, Role table, narrative paragraphs.
 *
 * Usage: node scripts/gen-proposal-docx.cjs
 */

const path = require('path');
const fs   = require('fs');
const os   = require('os');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, PageBreak, Table, TableRow, TableCell,
  WidthType, BorderStyle, ShadingType, VerticalAlign,
  ImageRun,
} = require('docx');
const {
  renderMermaidToPng, isMmdcAvailable,
  screenshotArtifact, cleanupScreenshot,
} = require('../lib/screenshot-artifact.cjs');
const { detectVisualArtifacts } = require('../lib/proposal-generator.cjs');

const OUT_DIR  = path.join(__dirname, '..', 'templates', 'proposal', 'docx');
const OUT_FILE = path.join(OUT_DIR, 'project-detail.docx');

// ── Colour palette (hex without #) ────────────────────────────────────────────
const NAVY    = '1a1f36';
const ACCENT  = '4f6ef7';
const MUTED   = '8892b0';
const HEADER_BG = '2d3142';

// ── Helpers ───────────────────────────────────────────────────────────────────
function h1(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 480, after: 200 },
  });
}

function h2(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120 },
  });
}

function para(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, ...opts })],
    spacing: { before: 80, after: 80 },
  });
}

function placeholder(label, bold = false) {
  return new Paragraph({
    children: [new TextRun({ text: `{{${label}}}`, color: MUTED, italics: !bold, bold })],
    spacing: { before: 80, after: 80 },
  });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function spacer() {
  return new Paragraph({ text: '', spacing: { before: 100, after: 100 } });
}

// Header cell for tables
function headerCell(text, widthPct) {
  return new TableCell({
    width: { size: widthPct, type: WidthType.PERCENTAGE },
    shading: { type: ShadingType.CLEAR, color: 'auto', fill: 'D8DCF0' },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      children: [new TextRun({ text, bold: true, size: 20, color: NAVY })],
      spacing: { before: 60, after: 60 },
    })],
  });
}

// Data cell
function dataCell(label, widthPct, muted = false) {
  return new TableCell({
    width: { size: widthPct, type: WidthType.PERCENTAGE },
    children: [muted ? placeholder(label) : para(label)],
  });
}

// ── Timeline table (Gantt-style) ──────────────────────────────────────────────
// Columns: Phase | Milestone | Duration | Dependencies
function timelineTable(rows) {
  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      headerCell('Phase', 12),
      headerCell('Milestone / Deliverable', 38),
      headerCell('Duration', 20),
      headerCell('Dependencies', 30),
    ],
  });
  const dataRows = rows.map(([phase, milestone, duration, deps]) =>
    new TableRow({
      children: [
        dataCell(phase, 12),
        new TableCell({
          width: { size: 38, type: WidthType.PERCENTAGE },
          children: [placeholder(milestone)],
        }),
        new TableCell({
          width: { size: 20, type: WidthType.PERCENTAGE },
          children: [placeholder(duration)],
        }),
        new TableCell({
          width: { size: 30, type: WidthType.PERCENTAGE },
          children: [placeholder(deps)],
        }),
      ],
    })
  );
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
  });
}

// ── Budget table ──────────────────────────────────────────────────────────────
// Columns: Line Item | Estimate | Notes
function budgetTable(rows) {
  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      headerCell('Line Item', 45),
      headerCell('Estimate', 25),
      headerCell('Notes', 30),
    ],
  });
  const dataRows = rows.map(([item, estimate, notes]) => {
    const isTotal = item === 'TOTAL';
    const labelCell = new TableCell({
      width: { size: 45, type: WidthType.PERCENTAGE },
      shading: isTotal ? { type: ShadingType.CLEAR, color: 'auto', fill: 'E8ECF4' } : undefined,
      children: [new Paragraph({
        children: [new TextRun({ text: `{{${item}}}`, bold: isTotal, italics: !isTotal, color: MUTED, size: 20 })],
        spacing: { before: 60, after: 60 },
      })],
    });
    const estimateCell = new TableCell({
      width: { size: 25, type: WidthType.PERCENTAGE },
      shading: isTotal ? { type: ShadingType.CLEAR, color: 'auto', fill: 'E8ECF4' } : undefined,
      children: [placeholder(estimate, isTotal)],
    });
    const notesCell = new TableCell({
      width: { size: 30, type: WidthType.PERCENTAGE },
      children: [placeholder(notes)],
    });
    return new TableRow({ children: [labelCell, estimateCell, notesCell] });
  });
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
  });
}

// ── Team table ────────────────────────────────────────────────────────────────
// Columns: Role | Name / Background | Responsibility
function teamTable(rows) {
  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      headerCell('Role', 25),
      headerCell('Name / Background', 40),
      headerCell('Responsibility on This Project', 35),
    ],
  });
  const dataRows = rows.map(([role, name, resp]) =>
    new TableRow({
      children: [
        dataCell(role, 25),
        new TableCell({
          width: { size: 40, type: WidthType.PERCENTAGE },
          children: [placeholder(name)],
        }),
        new TableCell({
          width: { size: 35, type: WidthType.PERCENTAGE },
          children: [placeholder(resp)],
        }),
      ],
    })
  );
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
  });
}

// ── Risk Register table ───────────────────────────────────────────────────────
// Columns: Risk | Probability | Impact | Mitigation
function riskRegisterTable(rows) {
  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      headerCell('Risk', 35),
      headerCell('Probability', 15),
      headerCell('Impact', 15),
      headerCell('Mitigation', 35),
    ],
  });
  const dataRows = rows.map(([risk, prob, impact, mitigation]) =>
    new TableRow({
      children: [
        new TableCell({ width: { size: 35, type: WidthType.PERCENTAGE }, children: [placeholder(risk)] }),
        new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, children: [placeholder(prob)] }),
        new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, children: [placeholder(impact)] }),
        new TableCell({ width: { size: 35, type: WidthType.PERCENTAGE }, children: [placeholder(mitigation)] }),
      ],
    })
  );
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
  });
}

// ── Glossary table ────────────────────────────────────────────────────────────
// Columns: Term | Definition
function glossaryTable(rows) {
  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      headerCell('Term', 30),
      headerCell('Definition', 70),
    ],
  });
  const dataRows = rows.map(([term, definition]) =>
    new TableRow({
      children: [
        new TableCell({
          width: { size: 30, type: WidthType.PERCENTAGE },
          children: [new Paragraph({
            children: [new TextRun({ text: `{{${term}}}`, bold: true, italics: false, color: NAVY, size: 20 })],
            spacing: { before: 60, after: 60 },
          })],
        }),
        new TableCell({ width: { size: 70, type: WidthType.PERCENTAGE }, children: [placeholder(definition)] }),
      ],
    })
  );
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
  });
}

// ── Tech stack table ──────────────────────────────────────────────────────────
function twoColTable(rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map(([label, value]) =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, color: 'auto', fill: 'F0F2F8' },
            children: [new Paragraph({
              children: [new TextRun({ text: label, bold: true, size: 20 })],
              spacing: { before: 60, after: 60 },
            })],
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

// ── Image embedding helpers (ENH-043) ────────────────────────────────────────

/**
 * Create a docx ImageRun from a PNG file path.
 * Returns null if pngPath is null or file does not exist.
 *
 * @param {string|null} pngPath - Absolute path to PNG
 * @param {number} [widthEmu=5940000] - Width in EMUs (~6.5 inches, full content width)
 * @param {number} [heightEmu=3402000] - Height in EMUs (~3.7 inches)
 * @returns {ImageRun|null}
 */
function imageRunFromPng(pngPath, widthEmu = 5940000, heightEmu = 3402000) {
  if (!pngPath || !fs.existsSync(pngPath)) return null;
  try {
    return new ImageRun({
      data: fs.readFileSync(pngPath),
      transformation: { width: widthEmu, height: heightEmu },
      type: 'png',
    });
  } catch {
    return null;
  }
}

// ── Runtime visual embedding (ENH-043) — called by vp-proposal workflow ───────
//
// 1. Mermaid diagram images in Diagram Reference section:
//    for (const diagram of docxContent.diagrams) {
//      const tmpPng = path.join(os.tmpdir(), `vp-mmdc-${Date.now()}.png`);
//      const rendered = renderMermaidToPng(diagram.mermaidSource, tmpPng);
//      if (rendered) {
//        const imgRun = imageRunFromPng(rendered);
//        if (imgRun) {
//          diagramSectionChildren.push(
//            new Paragraph({ children: [imgRun], spacing: { before: 120, after: 120 } })
//          );
//        }
//        cleanupScreenshot(rendered);
//      }
//      // Fallback already present: preformatted mermaidSource text paragraph
//    }
//
// 2. UI prototype screenshot — before Executive Summary:
//    const artifacts = detectVisualArtifacts();
//    if (artifacts.uiPages[0]) {
//      const tmpPng = await screenshotArtifact(artifacts.uiPages[0]);
//      if (tmpPng) {
//        const imgRun = imageRunFromPng(tmpPng);
//        if (imgRun)
//          executiveSummaryChildren.unshift(
//            new Paragraph({ children: [imgRun], spacing: { before: 120, after: 200 } })
//          );
//        cleanupScreenshot(tmpPng);
//      }
//    }
//
// 3. Architecture screenshot — after Technical Approach section:
//    const archHtml = artifacts.architectPages.find(p => p.endsWith('architecture.html'));
//    if (archHtml) {
//      const tmpPng = await screenshotArtifact(archHtml);
//      if (tmpPng) {
//        const imgRun = imageRunFromPng(tmpPng);
//        if (imgRun)
//          techSectionChildren.push(
//            new Paragraph({ children: [imgRun], spacing: { before: 200, after: 120 } })
//          );
//        cleanupScreenshot(tmpPng);
//      }
//    }

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
          paragraph: { spacing: { line: 280 } },
        },
        {
          id: 'Heading1',
          name: 'Heading 1',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { size: 36, bold: true, color: NAVY, font: 'Calibri' },
          paragraph: { spacing: { before: 480, after: 200 } },
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { size: 26, bold: true, color: ACCENT, font: 'Calibri' },
          paragraph: { spacing: { before: 280, after: 120 } },
        },
      ],
    },
    sections: [
      {
        children: [

          // ── Cover Page ────────────────────────────────────────────────────
          new Paragraph({
            children: [new TextRun({ text: '{{Project Name}}', size: 64, bold: true, color: NAVY, font: 'Calibri' })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 1200, after: 300 },
          }),
          new Paragraph({
            children: [new TextRun({ text: '{{One compelling sentence describing what this project delivers and for whom}}', size: 28, color: MUTED, italics: true, font: 'Calibri' })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 400 },
          }),
          new Paragraph({
            children: [new TextRun({ text: '─────────────────────────────────────', size: 20, color: MUTED })],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [new TextRun({ text: 'Prepared for: ', size: 22, bold: true }), new TextRun({ text: '{{Client / Partner Organisation}}', size: 22, color: MUTED, italics: true })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 80 },
          }),
          new Paragraph({
            children: [new TextRun({ text: 'Date: ', size: 22, bold: true }), new TextRun({ text: '{{Date}}', size: 22, color: MUTED, italics: true })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 80 },
          }),
          new Paragraph({
            children: [new TextRun({ text: 'Prepared by: ', size: 22, bold: true }), new TextRun({ text: '{{Your Name / Organisation}}', size: 22, color: MUTED, italics: true })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 80 },
          }),
          new Paragraph({
            children: [new TextRun({ text: 'Generated with ViePilot /vp-proposal', size: 18, color: MUTED, italics: true })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 400 },
          }),
          pageBreak(),

          // ── 1. Executive Summary ─────────────────────────────────────────
          h1('1. Executive Summary'),
          placeholder('Paragraph 1: State the project purpose — what is being proposed and why, in 2–4 sentences. Lead with the outcome, not the process.'),
          spacer(),
          placeholder('Paragraph 2: Summarise the 2–3 key benefits the client will gain. Be specific — use numbers if available (e.g. "reduce processing time by 60%").'),
          spacer(),
          placeholder('Paragraph 3: Recommended action — what you are asking the reader to do next (approve, schedule kickoff, sign agreement).'),
          spacer(),

          // ── 2. Problem & Opportunity ─────────────────────────────────────
          pageBreak(),
          h1('2. Problem & Opportunity'),
          h2('2.1 Background'),
          placeholder('Context: what situation, constraint, or market condition led to this proposal. 2–3 sentences.'),
          spacer(),
          h2('2.2 Problem Statement'),
          placeholder('Core problem — specific, measurable if possible. Example: "The current manual process takes 3 days and introduces a 12% error rate." 2–4 sentences.'),
          spacer(),
          h2('2.3 Opportunity'),
          placeholder('What becomes possible if this problem is solved. Frame as a gain, not just a fix. Include any time-sensitivity or competitive angle.'),
          spacer(),

          // ── 3. Proposed Solution ─────────────────────────────────────────
          pageBreak(),
          h1('3. Proposed Solution'),
          h2('3.1 Solution Overview'),
          placeholder('Describe what you are proposing in 2–3 sentences. Lead with the core capability, then the approach.'),
          spacer(),
          h2('3.2 Key Features & Deliverables'),
          placeholder('Feature / Deliverable 1: outcome-oriented description (e.g. "Automated reporting dashboard — reduces manual work by 4 hrs/week")'),
          placeholder('Feature / Deliverable 2: outcome-oriented description'),
          placeholder('Feature / Deliverable 3: outcome-oriented description'),
          spacer(),
          h2('3.3 Why This Approach'),
          placeholder('2–3 sentences explaining why this specific approach was chosen over alternatives. Include any tradeoffs considered.'),
          spacer(),

          // ── 4. Technical Approach ────────────────────────────────────────
          pageBreak(),
          h1('4. Technical Approach'),
          h2('4.1 Architecture'),
          placeholder('High-level architecture description — key layers, components, and how they interact. 2–4 sentences.'),
          spacer(),
          h2('4.2 Tech Stack'),
          twoColTable([
            ['Frontend', 'technologies + versions'],
            ['Backend', 'technologies + versions'],
            ['Database', 'technology + rationale'],
            ['Infrastructure', 'cloud + container + CI/CD'],
            ['Integrations', 'external APIs or services'],
          ]),
          spacer(),
          h2('4.3 Security & Compliance'),
          placeholder('Auth strategy, data encryption, compliance requirements (GDPR / SOC2 / HIPAA as applicable).'),
          spacer(),

          // ── 5. Project Timeline ──────────────────────────────────────────
          pageBreak(),
          h1('5. Project Timeline'),
          para('The following table outlines the project phases, key milestones, estimated durations, and dependencies.'),
          spacer(),
          timelineTable([
            ['Phase 1', 'Discovery & Requirements — stakeholder interviews, specs, wireframes', '2 weeks', '—'],
            ['Phase 2', 'Design & Architecture — system design, DB schema, API contracts', '2 weeks', 'Phase 1'],
            ['Phase 3', 'Development (Core) — backend services, data layer, integrations', '4–6 weeks', 'Phase 2'],
            ['Phase 4', 'Development (Frontend) — UI implementation, API integration', '3–4 weeks', 'Phase 3 (partial)'],
            ['Phase 5', 'Testing & QA — unit, integration, UAT, performance testing', '2 weeks', 'Phase 3+4'],
            ['Phase 6', 'Deployment & Handover — production deploy, training, documentation', '1 week', 'Phase 5'],
          ]),
          spacer(),
          placeholder('Note any dependencies, public holidays, or blackout dates that may affect the schedule.'),
          spacer(),

          // ── 6. Investment & Budget ───────────────────────────────────────
          pageBreak(),
          h1('6. Investment & Budget Estimate'),
          para('All estimates are based on the scope described in Section 3. Changes in scope may affect the total investment.'),
          spacer(),
          budgetTable([
            ['Discovery & Requirements', 'estimated amount', 'Fixed fee — 2 weeks'],
            ['Design & Architecture', 'estimated amount', 'Fixed fee — 2 weeks'],
            ['Development (Backend + Frontend)', 'estimated amount', 'Time & materials — 6–10 weeks'],
            ['Testing & QA', 'estimated amount', 'Included in development'],
            ['Deployment & Handover', 'estimated amount', 'Fixed fee — 1 week'],
            ['TOTAL', 'total investment estimate', 'As per meta.budget context'],
          ]),
          spacer(),
          h2('6.1 Payment Schedule'),
          placeholder('e.g. 30% on contract signing · 40% at development milestone · 30% on delivery'),
          spacer(),
          h2('6.2 What Is Included'),
          placeholder('List what is covered: source code, documentation, N months support, deployment, training.'),
          spacer(),
          h2('6.3 What Is Excluded'),
          placeholder('List exclusions: hosting costs, 3rd-party licences, scope changes after kickoff.'),
          spacer(),

          // ── 7. Team & Expertise ──────────────────────────────────────────
          pageBreak(),
          h1('7. Team & Expertise'),
          teamTable([
            ['Project Lead', 'Name — background + years of relevant experience', 'Overall delivery, client communication, scope management'],
            ['Tech Lead / Architect', 'Name — key technical background', 'Architecture decisions, code quality, technical direction'],
            ['Developer', 'Name — specialisation', 'Feature development, integration work'],
            ['QA / Testing', 'Name — QA background', 'Test planning, UAT coordination'],
          ]),
          spacer(),

          // ── 8. Risk Register ─────────────────────────────────────────────
          pageBreak(),
          h1('8. Risk Register'),
          para('The following table summarises key project risks, their likelihood and impact, and the planned mitigation strategies.'),
          spacer(),
          riskRegisterTable([
            ['Requirements scope creep', 'probability: High|Med|Low', 'impact: High|Med|Low', 'mitigation strategy — who owns it and how it is managed'],
            ['Key resource unavailability', 'probability: High|Med|Low', 'impact: High|Med|Low', 'mitigation strategy'],
            ['Third-party API or integration delays', 'probability: High|Med|Low', 'impact: High|Med|Low', 'mitigation strategy'],
            ['Performance under peak load', 'probability: High|Med|Low', 'impact: High|Med|Low', 'mitigation strategy'],
            ['Security vulnerability in dependencies', 'probability: High|Med|Low', 'impact: High|Med|Low', 'mitigation strategy'],
          ]),
          spacer(),

          // ── 9. Why Choose Us ─────────────────────────────────────────────
          pageBreak(),
          h1('9. Why Choose Us'),
          placeholder('Differentiator 1: specific, outcome-oriented reason (e.g. "Delivered 3 similar platforms in the fintech space — avg 15% under budget")'),
          placeholder('Differentiator 2: methodology or process advantage'),
          placeholder('Differentiator 3: support model, IP ownership, or risk mitigation'),
          spacer(),

          // ── 10. Next Steps ───────────────────────────────────────────────
          h1('10. Next Steps'),
          placeholder('Action 1: {{what}} — Owner: {{who}} — By: {{date}}'),
          placeholder('Action 2: {{what}} — Owner: {{who}} — By: {{date}}'),
          placeholder('Action 3: {{what}} — Owner: {{who}} — By: {{date}}'),
          spacer(),
          para('To proceed, please reply to this proposal or contact us at {{contact information}}.', { bold: false }),
          spacer(),

          // ── 11. Glossary ─────────────────────────────────────────────────
          pageBreak(),
          h1('11. Glossary'),
          para('Definitions of key terms and acronyms used in this proposal.'),
          spacer(),
          glossaryTable([
            ['Term / Acronym 1', 'plain-language definition — avoid jargon; write for a non-technical decision maker'],
            ['Term / Acronym 2', 'plain-language definition'],
            ['Term / Acronym 3', 'plain-language definition'],
            ['Term / Acronym 4', 'plain-language definition'],
          ]),
          spacer(),

          // ── 12. Appendix ─────────────────────────────────────────────────
          pageBreak(),
          h1('12. Appendix'),
          h2('12.1 Brainstorm Session Notes'),
          placeholder('Auto-populated from vp-brainstorm session when available. Contains raw ideas, decisions, and open questions captured during ideation.'),
          spacer(),
          h2('12.2 References & Supporting Documents'),
          placeholder('List any external references, research papers, or supporting documents relevant to this proposal.'),
          spacer(),
          h2('12.3 Assumptions'),
          placeholder('List key assumptions made in preparing this proposal (e.g. client provides test data, API access available by Phase 2).'),
          spacer(),
          new Paragraph({
            children: [new TextRun({ text: '—  Generated by ViePilot /vp-proposal  —', color: MUTED, italics: true, size: 18 })],
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
