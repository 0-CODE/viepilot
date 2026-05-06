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

describe('Phase 121 — ENH-080: Upgrade re-scan awareness for Signal Category 13', () => {

  // ── Delta computation table — v2.46.0 row ────────────────────────────────

  test('v2.46.0 row present in delta computation table', () => {
    expect(crystallize).toMatch(/v2\.46\.0.*UI\/Design scan not run.*Signal Cat 13/);
  });

  test('v2.46.0 row uses ui_signals_imported as detection field', () => {
    const tableRow = crystallize.match(/v2\.46\.0[^\n]*/)?.[0] ?? '';
    expect(tableRow).toMatch(/ui_signals_imported.*absent from HANDOFF\.json/);
  });

  test('v2.46.0 row includes trigger re-check condition (css OR tailwind OR components)', () => {
    const tableRow = crystallize.match(/v2\.46\.0[^\n]*/)?.[0] ?? '';
    expect(tableRow).toMatch(/\.css.*\.scss.*files > 5/);
    expect(tableRow).toMatch(/tailwind\.config\.js/);
    expect(tableRow).toMatch(/\.jsx.*\.tsx.*\.vue.*\.svelte.*> 10/);
  });

  test('UI trigger re-check note present (backend-only false-positive guard)', () => {
    expect(crystallize).toMatch(/UI trigger re-check note.*backend-only/);
  });

  // ── HANDOFF.json persistence — success path ───────────────────────────────

  test('Success path: ui_signals_imported: true written to HANDOFF.json', () => {
    expect(crystallize).toMatch(/"ui_signals_imported": true/);
  });

  test('Success path: ui_signals_imported_at timestamp field present', () => {
    expect(crystallize).toMatch(/"ui_signals_imported_at"/);
  });

  test('Success path: ui_signals_version field present', () => {
    expect(crystallize).toMatch(/"ui_signals_version": "2\.46\.0"/);
  });

  // ── HANDOFF.json persistence — skip path ─────────────────────────────────

  test('Skip path: ui_signals_imported: false written to HANDOFF.json', () => {
    expect(crystallize).toMatch(/"ui_signals_imported": false/);
  });

  test('Skip path: ui_signals_skipped_at field present', () => {
    expect(crystallize).toMatch(/"ui_signals_skipped_at"/);
  });

  // ── Patch mode handler ────────────────────────────────────────────────────

  test('Patch mode lists UI/Design scan handler with ENH-079 reference', () => {
    expect(crystallize).toMatch(/UI\/Design scan.*v2\.46\.0.*ENH-079/);
  });

  test('Patch mode handler notes AUQ gate preserved', () => {
    const patchSection = crystallize.match(
      /### Patch mode[\s\S]*?(?=### Full re-generate)/
    )?.[0] ?? '';
    expect(patchSection).toMatch(/AUQ gate is preserved/);
  });

  test('Patch mode handler notes no brainstorm supplement check', () => {
    const patchSection = crystallize.match(
      /### Patch mode[\s\S]*?(?=### Full re-generate)/
    )?.[0] ?? '';
    expect(patchSection).toMatch(/No brainstorm supplement check/i);
  });

  // ── package.json + CHANGELOG ──────────────────────────────────────────────

  test('package.json version is 2.46.x or higher', () => {
    const [major, minor] = pkg.version.split('.').map(Number);
    expect(major).toBe(2);
    expect(minor).toBeGreaterThanOrEqual(46);
  });

  test('CHANGELOG has [2.46.1] entry with ENH-080 mention', () => {
    expect(changelog).toMatch(/## \[2\.46\.1\]/);
    expect(changelog).toMatch(/ENH-080/);
  });

});
