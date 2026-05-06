'use strict';
const fs = require('fs');
const path = require('path');

const crystallize = fs.readFileSync(
  path.join(__dirname, '../../workflows/crystallize.md'), 'utf8'
);
const brainstorm = fs.readFileSync(
  path.join(__dirname, '../../workflows/brainstorm.md'), 'utf8'
);
const pkg = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8')
);
const changelog = fs.readFileSync(
  path.join(__dirname, '../../CHANGELOG.md'), 'utf8'
);

describe('Phase 120 — ENH-079: Signal Category 13 — Brownfield UI/Design Reverse-Engineering', () => {

  // ── crystallize.md: Signal Category 13 spec ──────────────────────────────

  test('Signal Category 13 section present', () => {
    expect(crystallize).toMatch(/### Signal Category 13 — UI\/Design System Signals/);
  });

  test('Trigger condition block has all 4 conditions', () => {
    expect(crystallize).toMatch(/tailwind\.config\.js.*or.*tailwind\.config\.ts/);
    expect(crystallize).toMatch(/\.css.*or.*\.scss.*files > 5/);
    expect(crystallize).toMatch(/Component files.*\.jsx.*\.tsx.*\.vue.*\.svelte.*> 10/);
    expect(crystallize).toMatch(/Route config files detected/);
  });

  test('Sub-scan A: tailwind.config source documented', () => {
    expect(crystallize).toMatch(/Sub-scan A — Design Token Extraction/);
    expect(crystallize).toMatch(/tailwind\.config\.js.*\/.*tailwind\.config\.ts/);
    expect(crystallize).toMatch(/theme\.extend\.colors/);
  });

  test('Sub-scan A: CSS custom properties documented', () => {
    expect(crystallize).toMatch(/--color-\*/);
    expect(crystallize).toMatch(/TOKEN_MAP\.colors/);
    expect(crystallize).toMatch(/TOKEN_MAP\.typography/);
  });

  test('Sub-scan B: 8-framework table present', () => {
    expect(crystallize).toMatch(/Sub-scan B — Page\/Route Inventory/);
    expect(crystallize).toMatch(/Next\.js 13\+ App Router/);
    expect(crystallize).toMatch(/Vue Router/);
    expect(crystallize).toMatch(/SvelteKit/);
    expect(crystallize).toMatch(/Plain HTML/);
  });

  test('Sub-scan B: route extraction method per framework', () => {
    expect(crystallize).toMatch(/Directory structure.*route paths/);
    expect(crystallize).toMatch(/Parse.*Route path/);
    expect(crystallize).toMatch(/src\/router\/index\.\{js,ts\}/);
  });

  test('Sub-scan C: UI library detection present', () => {
    expect(crystallize).toMatch(/Sub-scan C — Component Inventory/);
    expect(crystallize).toMatch(/@mui\/material.*Material UI/);
    expect(crystallize).toMatch(/@shadcn\/ui.*shadcn\/ui/);
    expect(crystallize).toMatch(/@radix-ui/);
  });

  test('Sub-scan C: common component pattern detection', () => {
    expect(crystallize).toMatch(/Button.*Modal.*Dialog.*Card/);
    expect(crystallize).toMatch(/src\/components\/\*\*\/\*\.\{jsx,tsx,vue,svelte\}/);
  });

  // ── crystallize.md: Scan Report schema extension ─────────────────────────

  test('Scan Report schema has ui_signals field', () => {
    expect(crystallize).toMatch(/ui_signals:.*# present only when Signal Category 13 triggered/);
    expect(crystallize).toMatch(/workspace_generated: bool/);
    expect(crystallize).toMatch(/ui_tokens:/);
    expect(crystallize).toMatch(/ui_pages:/);
    expect(crystallize).toMatch(/ui_components:/);
  });

  // ── crystallize.md: AUQ gate + workspace generation ──────────────────────

  test('AUQ gate present with correct header', () => {
    expect(crystallize).toMatch(/Brownfield UI Reverse-Engineering/);
    expect(crystallize).toMatch(/UI Workspace Generation Gate/);
  });

  test('Workspace generation spec includes reverse_engineered flag', () => {
    expect(crystallize).toMatch(/reverse_engineered: true/);
    expect(crystallize).toMatch(/pages\/\{slug\}\.html/);
    expect(crystallize).toMatch(/design\.md.*Design\.MD v1/);
    expect(crystallize).toMatch(/notes\.md/);
    expect(crystallize).toMatch(/index\.html/);
  });

  // ── brainstorm.md: brownfield stub import ────────────────────────────────

  test('Brownfield UI Signal Import step present', () => {
    expect(brainstorm).toMatch(/Step 3C: Brownfield UI Signal Import/);
    expect(brainstorm).toMatch(/brownfield_ui_signal_import/);
  });

  test('All 3 import cases handled', () => {
    expect(brainstorm).toMatch(/Case 1.*workspace already generated/);
    expect(brainstorm).toMatch(/Case 2.*Signal 13 data present.*workspace NOT yet generated/);
    expect(brainstorm).toMatch(/Case 3.*ui_signals.*not present/);
  });

  test('reverse_engineered flag handling in brainstorm', () => {
    expect(brainstorm).toMatch(/reverse_engineered: true/);
    expect(brainstorm).toMatch(/Reverse-engineered.*badge/);
    expect(brainstorm).toMatch(/skip.*missing brainstorm.*warnings/i);
  });

  // ── package.json + CHANGELOG ──────────────────────────────────────────────

  test('package.json version is 2.46.0', () => {
    expect(pkg.version).toBe('2.46.0');
  });

  test('CHANGELOG has [2.46.0] entry with ENH-079 mention', () => {
    expect(changelog).toMatch(/## \[2\.46\.0\]/);
    expect(changelog).toMatch(/ENH-079/);
    expect(changelog).toMatch(/Signal Category 13/);
  });

  test('CHANGELOG [2.46.0] lists sub-scans A B C', () => {
    const entry = changelog.match(/## \[2\.46\.0\][\s\S]*?(?=## \[2\.\d+\.\d+\]|$)/)?.[0] ?? '';
    expect(entry).toMatch(/Sub-scan A/);
    expect(entry).toMatch(/Sub-scan B/);
    expect(entry).toMatch(/Sub-scan C/);
  });

});
