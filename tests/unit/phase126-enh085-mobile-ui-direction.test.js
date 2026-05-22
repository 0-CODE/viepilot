'use strict';
const fs = require('fs');
const path = require('path');

const crystallize = fs.readFileSync(
  path.join(__dirname, '../../workflows/crystallize.md'), 'utf8'
);
const brainstorm = fs.readFileSync(
  path.join(__dirname, '../../workflows/brainstorm.md'), 'utf8'
);
const design = fs.readFileSync(
  path.join(__dirname, '../../workflows/design.md'), 'utf8'
);
const pkg = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8')
);
const changelog = fs.readFileSync(
  path.join(__dirname, '../../CHANGELOG.md'), 'utf8'
);

describe('Phase 126 — ENH-085: Mobile UI Direction Breakdown Quality', () => {

  // ── design.md schema ─────────────────────────────────────────────────────

  test('design.md YAML template has screens block with 4 breakpoints', () => {
    expect(design).toMatch(/screens:/);
    expect(design).toMatch(/mobile:.*0.767px/);
    expect(design).toMatch(/tablet:.*768.1023px/);
    expect(design).toMatch(/desktop:.*1024.1279px/);
    expect(design).toMatch(/wide:.*1280px/);
  });

  test('design.md YAML template has strategy field', () => {
    expect(design).toMatch(/strategy:\s*mobile-first/);
  });

  test('design.md prose template has Responsive Components table', () => {
    expect(design).toMatch(/## Responsive Components/);
    expect(design).toMatch(/Navigation/);
    expect(design).toMatch(/Hamburger drawer/);
    expect(design).toMatch(/Full horizontal/);
  });

  test('design.md --sync TOKEN_MAP includes screens and strategy', () => {
    expect(design).toMatch(/screens:\s*\{.*mobile.*tablet.*desktop.*wide/s);
    expect(design).toMatch(/strategy:.*mobile-first.*desktop-first/);
  });

  test('design.md --sync Tailwind mode emits screens block', () => {
    expect(design).toMatch(/\/\/ Responsive breakpoints — emitted only when screens:/);
    expect(design).toMatch(/mobile:\s*'0px'/);
    expect(design).toMatch(/tablet:\s*'768px'/);
    expect(design).toMatch(/desktop:\s*'1024px'/);
  });

  // ── brainstorm: Mobile Design Direction sub-phase ─────────────────────────

  test('brainstorm has Mobile Design Direction sub-phase section', () => {
    expect(brainstorm).toMatch(/### Mobile Design Direction Sub-Phase \(ENH-085\)/);
  });

  test('brainstorm mobile sub-phase trigger keywords include new additions', () => {
    expect(brainstorm).toMatch(/breakpoint.*viewport.*adaptive.*touch/);
    expect(brainstorm).toMatch(/swipe.*safe-area.*hamburger/);
  });

  test('brainstorm mobile sub-phase has AUQ 1 with 4 strategy options', () => {
    expect(brainstorm).toMatch(/AUQ 1 — Viewport Strategy/);
    expect(brainstorm).toMatch(/Mobile-first.*Recommended/);
    expect(brainstorm).toMatch(/Desktop-first/);
    expect(brainstorm).toMatch(/Mobile only/);
    expect(brainstorm).toMatch(/Desktop only/);
  });

  test('brainstorm mobile sub-phase has AUQ 2 multi-select device scope', () => {
    expect(brainstorm).toMatch(/AUQ 2 — Target Device Scope.*multiSelect: true/s);
    expect(brainstorm).toMatch(/Phone.*≤767px/);
    expect(brainstorm).toMatch(/Tablet.*768.1023px/);
    expect(brainstorm).toMatch(/Desktop.*≥1024px/);
  });

  test('brainstorm stores responsive_strategy and target_devices in session context', () => {
    expect(brainstorm).toMatch(/responsive_strategy:\s*mobile-first.*desktop-first/);
    expect(brainstorm).toMatch(/target_devices:.*phone.*tablet.*desktop.*wide/);
  });

  test('brainstorm skill keyword table includes new responsive-layout keywords', () => {
    expect(brainstorm).toMatch(/breakpoint.*viewport.*adaptive.*touch.*swipe.*safe-area.*hamburger.*responsive-layout/s);
  });

  // ── brainstorm: per-breakpoint HTML sections ──────────────────────────────

  test('brainstorm defines responsive-breakdown div template for pages/*.html', () => {
    expect(brainstorm).toMatch(/Per-breakpoint sections in pages\/\*\.html \(ENH-085\)/);
    expect(brainstorm).toMatch(/class="responsive-breakdown"/);
    expect(brainstorm).toMatch(/<details open>/);
  });

  test('brainstorm per-breakpoint HTML has navigation strategy lookup table', () => {
    expect(brainstorm).toMatch(/Navigation strategy lookup/);
    expect(brainstorm).toMatch(/App.*dashboard.*Hamburger drawer.*Bottom tab bar.*Left sidebar/s);
    expect(brainstorm).toMatch(/Auth.*login.*Centered card/s);
  });

  test('brainstorm includes CSS for responsive-breakdown in style.css', () => {
    expect(brainstorm).toMatch(/\.responsive-breakdown/);
    expect(brainstorm).toMatch(/ENH-085.*Responsive Breakdown/);
  });

  // ── brainstorm: Component Responsive Map in notes.md ─────────────────────

  test('brainstorm Component Responsive Map section appended to notes.md', () => {
    expect(brainstorm).toMatch(/Component Responsive Map in notes\.md \(ENH-085\)/);
    expect(brainstorm).toMatch(/## Component Responsive Map/);
    expect(brainstorm).toMatch(/Navigation Pattern Detail/);
    expect(brainstorm).toMatch(/Responsive Utilities Reference.*Tailwind/s);
  });

  test('brainstorm Component Responsive Map has guard against duplication', () => {
    expect(brainstorm).toMatch(/Guard:.*notes\.md.*already contains.*## Component Responsive Map.*skip/);
  });

  // ── Sub-scan A: theme.screens + sm:/md:/lg: detection ────────────────────

  test('crystallize Sub-scan A documents theme.screens extraction (ENH-085)', () => {
    expect(crystallize).toMatch(/ENH-085 — Breakpoint extraction/);
    expect(crystallize).toMatch(/theme\.screens.*theme\.extend\.screens/);
  });

  test('crystallize Sub-scan A documents Tailwind default fallback', () => {
    expect(crystallize).toMatch(/Tailwind defaults.*sm:.*640.*md:.*768.*lg:.*1024/s);
    expect(crystallize).toMatch(/breakpoints_source:\s*custom \| tailwind-defaults/);
  });

  test('crystallize Sub-scan A documents responsive utility detection', () => {
    expect(crystallize).toMatch(/ENH-085 — Responsive utility detection/);
    expect(crystallize).toMatch(/sm\|md\|lg\|xl\|2xl/);
    expect(crystallize).toMatch(/top 10 files/);
  });

  test('crystallize Sub-scan A strategy inference rule documented', () => {
    expect(crystallize).toMatch(/strategy_inference:\s*mobile-first \| desktop-first \| mixed \| unknown/);
    expect(crystallize).toMatch(/RESPONSIVE SUMMARY/);
  });

  // ── crystallize: Step 1A-iv responsive consumption ───────────────────────

  test('crystallize has Step 1A-iv for responsive metadata consumption', () => {
    expect(crystallize).toMatch(/### Step 1A-iv: Consume Responsive \/ Breakpoint Metadata \(ENH-085\)/);
  });

  test('crystallize Step 1A-iv consumes Component Responsive Map from notes.md', () => {
    expect(crystallize).toMatch(/Source 1 — notes\.md Component Responsive Map/);
    expect(crystallize).toMatch(/crystallize_context\.responsive_components/);
  });

  test('crystallize Step 1A-iv consumes per-page breakpoint sections from HTML', () => {
    expect(crystallize).toMatch(/Source 3 — pages\/\*\.html responsive-breakdown sections/);
    expect(crystallize).toMatch(/responsive_pages\[slug\]/);
  });

  test('crystallize Step 1A-iv generates Responsive Implementation Notes in ARCHITECTURE.md', () => {
    expect(crystallize).toMatch(/## Responsive Implementation Notes/);
    expect(crystallize).toMatch(/Per-Page Responsive Targets/);
    expect(crystallize).toMatch(/High-Priority Responsive Components/);
  });

  test('crystallize Step 1A-iv has skip condition for non-mobile projects', () => {
    expect(crystallize).toMatch(/Skip condition:.*none of Sources 1.4.*omit.*Responsive Implementation Notes/s);
  });

  // ── version + changelog ───────────────────────────────────────────────────

  test('package.json version is 2.51.0', () => {
    expect(pkg.version).toBe('2.51.0');
  });

  test('CHANGELOG has 2.51.0 entry with ENH-085 items', () => {
    expect(changelog).toMatch(/## \[2\.51\.0\]/);
    expect(changelog).toMatch(/ENH-085/);
    expect(changelog).toMatch(/Mobile UI Direction/);
    expect(changelog).toMatch(/Mobile Design Direction sub-phase/);
    expect(changelog).toMatch(/Component Responsive Map/);
  });

});
