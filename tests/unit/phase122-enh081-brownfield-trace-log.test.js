'use strict';
const fs = require('fs');
const path = require('path');

const crystallize = fs.readFileSync(
  path.join(__dirname, '../../workflows/crystallize.md'), 'utf8'
);
const pkg = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8')
);
const changelog = fs.readFileSync(
  path.join(__dirname, '../../CHANGELOG.md'), 'utf8'
);

describe('Phase 122 — ENH-081: Brownfield Scan Trace Log', () => {

  // ── Trace initialization ──────────────────────────────────────────────────

  test('Trace initialization section present (ENH-081)', () => {
    expect(crystallize).toMatch(/Brownfield Scan Trace — Initialization.*ENH-081/);
  });

  test('BROWNFIELD-TRACE.md artifact path documented', () => {
    expect(crystallize).toMatch(/\.viepilot\/BROWNFIELD-TRACE\.md/);
  });

  test('Resume detection: scan_complete case with AUQ options', () => {
    expect(crystallize).toMatch(/Status: scan_complete/);
    expect(crystallize).toMatch(/Resume.*skip re-scan.*gap-filling/);
    expect(crystallize).toMatch(/Re-scan from scratch.*overwrite trace/);
  });

  test('Interrupted scan detection: scanning in-progress with resume option', () => {
    expect(crystallize).toMatch(/Status: scanning.*interrupted/i);
    expect(crystallize).toMatch(/Resume from Signal Cat \{N\}/);
  });

  test('All 13 categories pre-populated as planned in trace template', () => {
    const template = crystallize.match(
      /create `\.viepilot\/BROWNFIELD-TRACE\.md`:[\s\S]*?```markdown([\s\S]*?)```\s*\*\*Write this/
    )?.[1] ?? '';
    const plannedRows = (template.match(/\| planned \|/g) || []).length;
    expect(plannedRows).toBe(13);
  });

  test('Trace template has all required sections', () => {
    expect(crystallize).toMatch(/## Signal Coverage/);
    expect(crystallize).toMatch(/## Files Read Log/);
    expect(crystallize).toMatch(/## Gap Filling Log/);
    expect(crystallize).toMatch(/## Step Completion/);
  });

  test('Write trace file to disk BEFORE scanning begins', () => {
    expect(crystallize).toMatch(/Write this file to disk immediately.*before any signal category/i);
  });

  // ── Per-category update protocol ─────────────────────────────────────────

  test('Per-Category Update Protocol section present', () => {
    expect(crystallize).toMatch(/Per-Category Update Protocol.*ENH-081/);
  });

  test('Status transitions table present', () => {
    expect(crystallize).toMatch(/planned.*scanning.*done/);
    expect(crystallize).toMatch(/scanning.*assumed/);
    expect(crystallize).toMatch(/scanning.*skipped/);
  });

  test('Files Read Log format: [x] read and [ ] not present', () => {
    expect(crystallize).toMatch(/\[x\].*file was read/);
    expect(crystallize).toMatch(/\[ \].*not found on disk/);
  });

  test('Example: Signal Category 5 (API Contract Files) present', () => {
    expect(crystallize).toMatch(/Signal 5 — API Contract Files/);
    expect(crystallize).toMatch(/openapi\.yaml.*REST/);
  });

  test('Signal Category 13 special format documented', () => {
    expect(crystallize).toMatch(/tailwind.*colors.*routes.*framework.*components.*ui_library/);
  });

  // ── Coverage gate + Gap Filling Log + Step Completion ────────────────────

  test('Coverage gate block present before Scan Report presentation', () => {
    expect(crystallize).toMatch(/Coverage gate.*ENH-081/);
    expect(crystallize).toMatch(/Coverage incomplete.*signal categories not executed/);
  });

  test('Coverage gate: non-blocking + sets scan_complete', () => {
    const gateSection = crystallize.match(
      /Coverage gate.*ENH-081[\s\S]*?(?=\n1\. Display Scan Report)/
    )?.[0] ?? '';
    expect(gateSection).toMatch(/non-blocking|Non-blocking/i);
    expect(gateSection).toMatch(/Status: scan_complete/);
  });

  test('Gap Filling Log spec: appends row per user answer (not batched)', () => {
    expect(crystallize).toMatch(/Gap Filling Log.*ENH-081/);
    expect(crystallize).toMatch(/Write after each.*user response.*do not batch/);
  });

  test('Step 0-C trace update: marks Brainstorm Stub done', () => {
    expect(crystallize).toMatch(/Trace update.*ENH-081[\s\S]*?0-C Brainstorm Stub.*done/);
  });

  test('Step 0-D trace update: 3 cases (done/skipped/N/A)', () => {
    expect(crystallize).toMatch(/Trace update.*ENH-081[\s\S]*?0-D UI Workspace/);
    expect(crystallize).toMatch(/workspace generated.*done/i);
    expect(crystallize).toMatch(/user skipped/);
    expect(crystallize).toMatch(/Signal Category 13 did not trigger.*N\/A/);
  });

  // ── package.json + CHANGELOG ──────────────────────────────────────────────

  test('package.json version is 2.47.0 or later', () => {
    const [major, minor] = pkg.version.split('.').map(Number);
    expect(major).toBeGreaterThanOrEqual(2);
    if (major === 2) expect(minor).toBeGreaterThanOrEqual(47);
  });

  test('CHANGELOG has [2.47.0] entry with ENH-081 mention', () => {
    expect(changelog).toMatch(/## \[2\.47\.0\]/);
    expect(changelog).toMatch(/ENH-081/);
    expect(changelog).toMatch(/BROWNFIELD-TRACE\.md/);
  });

});
