'use strict';

const fs = require('fs');
const path = require('path');

const BRAINSTORM = path.join(__dirname, '../../workflows/brainstorm.md');
const CRYSTALLIZE = path.join(__dirname, '../../workflows/crystallize.md');
const SKILL_BRAINSTORM = path.join(__dirname, '../../skills/vp-brainstorm/SKILL.md');
const PKG = path.join(__dirname, '../../package.json');
const CHANGELOG = path.join(__dirname, '../../CHANGELOG.md');

const brainstorm = fs.readFileSync(BRAINSTORM, 'utf8');
const crystallize = fs.readFileSync(CRYSTALLIZE, 'utf8');
const skillBrainstorm = fs.readFileSync(SKILL_BRAINSTORM, 'utf8');
const pkg = JSON.parse(fs.readFileSync(PKG, 'utf8'));
const changelog = fs.readFileSync(CHANGELOG, 'utf8');

describe('Phase 112 — ENH-076: Design.MD brainstorm extraction + crystallize gate', () => {

  // DEBT-004 (phase 163): ENH-103 (phase 153) removed the inline "Design Token Extraction" section
  // from brainstorm.md and replaced it with the Design System Delegate Hook (delegates to
  // vp-design --init). Assertions repointed to the ENH-103 successor; the design.md capability now
  // lives in vp-design. crystallize-side ENH-076 export (112.2) is unchanged and still asserted below.
  describe('112.1 — brainstorm.md: Design System Delegate Hook (ENH-103, supersedes ENH-076 inline)', () => {
    test('has Design System Delegate Hook (ENH-103) heading', () => {
      expect(brainstorm).toMatch(/Design System Delegate Hook \(ENH-103\)/);
    });

    test('delegate hook triggers vp-design --init for design.md', () => {
      const block = brainstorm.split('Design System Delegate Hook')[1].split('\n### ')[0];
      expect(block).toMatch(/vp-design --init/);
      expect(block).toMatch(/design\.md/);
    });

    test('aesthetic context injection documented (ENH-103)', () => {
      expect(brainstorm).toMatch(/Aesthetic Context Injection \(ENH-103\)/);
    });
  });

  describe('112.2 — crystallize.md: Step 1D.14 mandatory-acknowledge gate', () => {
    test('has Step 1D.14 Design.MD Export section', () => {
      expect(crystallize).toMatch(/Step 1D\.14.*Design\.MD Export/i);
    });

    test('references ENH-076', () => {
      const block = crystallize.split('Step 1D.14')[1]?.split('### Step 1D')[0] ?? '';
      expect(block).toMatch(/ENH-076/);
    });

    test('documents trigger conditions (design.md OR design_tokens OR keywords)', () => {
      const block = crystallize.split('Step 1D.14')[1]?.split('### Step 1D')[0] ?? '';
      expect(block).toMatch(/design\.md.*exists|design_tokens|≥3 design keywords/i);
    });

    test('documents AUQ with 3 options', () => {
      const block = crystallize.split('Step 1D.14')[1]?.split('### Step 1D')[0] ?? '';
      expect(block).toMatch(/Export.*project root/i);
      expect(block).toMatch(/Finalize.*export/i);
      expect(block).toMatch(/Skip/i);
    });

    test('export pipeline updates ARCHITECTURE.md Design System section', () => {
      const block = crystallize.split('Step 1D.14')[1]?.split('### Step 1D')[0] ?? '';
      expect(block).toMatch(/ARCHITECTURE\.md/);
      expect(block).toMatch(/## Design System/);
    });

    test('export pipeline adds design_md: true to PROJECT-CONTEXT.md', () => {
      const block = crystallize.split('Step 1D.14')[1]?.split('### Step 1D')[0] ?? '';
      expect(block).toMatch(/PROJECT-CONTEXT\.md/);
      expect(block).toMatch(/design_md:\s*true/);
    });

    test('idempotent skip flag documented (design_md_status: skipped)', () => {
      const block = crystallize.split('Step 1D.14')[1]?.split('### Step 1D')[0] ?? '';
      expect(block).toMatch(/design_md_status.*skipped/);
    });

    test('conflict handling documented (Override/Merge/Keep/Diff)', () => {
      const block = crystallize.split('Step 1D.14')[1]?.split('### Step 1D')[0] ?? '';
      expect(block).toMatch(/Override|Merge|Keep.*existing/i);
    });

    test('skip shows warning about vp-auto not applying brand tokens', () => {
      const block = crystallize.split('Step 1D.14')[1]?.split('### Step 1D')[0] ?? '';
      expect(block).toMatch(/vp-auto.*brand tokens|brand tokens.*vp-auto/i);
    });
  });

  describe('112.3 — skills/vp-brainstorm/SKILL.md updated', () => {
    test('--ui flag description mentions design.md and ENH-076', () => {
      expect(skillBrainstorm).toMatch(/--ui.*design\.md.*ENH-076|--ui.*ENH-076/);
    });

    test('success_criteria includes ENH-076 design.md item', () => {
      expect(skillBrainstorm).toMatch(/ENH-076.*design\.md|design\.md.*ENH-076/);
    });
  });

  describe('112.4 — version + CHANGELOG', () => {
    test('package.json version is 2.44.0 or later', () => {
      const [major, minor] = pkg.version.split('.').map(Number);
      expect(major).toBeGreaterThanOrEqual(2);
      if (major < 3) expect(minor).toBeGreaterThanOrEqual(44);
    });

    test('CHANGELOG contains [2.44.0] entry', () => {
      expect(changelog).toMatch(/\[2\.44\.0\]/);
    });

    test('CHANGELOG 2.44.0 entry mentions ENH-076 or Design.MD', () => {
      const entry = changelog.split('[2.44.0]')[1]?.split('\n## [')[0] ?? '';
      expect(entry).toMatch(/ENH-076|Design\.MD|design\.md/i);
    });
  });
});
