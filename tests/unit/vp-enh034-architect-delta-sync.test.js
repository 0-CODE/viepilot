'use strict';

/**
 * ENH-034 Architect Delta Sync contracts
 *
 * Verifies:
 *   1. workflows/brainstorm.md has the architect_delta_sync step
 *   2. templates/architect/style.css has .arch-stale + .arch-gap-badge
 *   3. templates/architect/architect-actions.js has markStale + injectStaleBadges
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

// ─────────────────────────────────────────────────────────────────────────────
// Test Group 1: workflows/brainstorm.md — architect_delta_sync step
// ─────────────────────────────────────────────────────────────────────────────
describe('ENH-034 — brainstorm.md: architect_delta_sync step', () => {
  let src;

  beforeAll(() => {
    src = read('workflows/brainstorm.md');
  });

  test('architect_delta_sync step present', () => {
    expect(src).toMatch(/architect_delta_sync/);
  });

  test('/sync-arch command documented', () => {
    expect(src).toMatch(/\/sync-arch/);
  });

  test('gap detection maps to architect pages', () => {
    expect(src).toMatch(/erd\.html|apis\.html|deployment\.html/);
  });

  test('HTML update instruction uses data-updated', () => {
    expect(src).toMatch(/data-updated/);
  });

  test('notes.md architect_sync section documented', () => {
    expect(src).toMatch(/architect_sync/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test Group 2: templates/architect/style.css — stale gap classes
// ─────────────────────────────────────────────────────────────────────────────
describe('ENH-034 — style.css: arch-stale + arch-gap-badge classes', () => {
  let src;

  beforeAll(() => {
    src = read('templates/architect/style.css');
  });

  test('.arch-gap-badge class exists', () => {
    expect(src).toMatch(/\.arch-gap-badge/);
  });

  test('amber color present (f59e0b or d97706)', () => {
    expect(src).toMatch(/f59e0b|d97706/);
  });

  test('[data-arch-stale] selector present', () => {
    expect(src).toMatch(/\[data-arch-stale/);
  });

  test('light mode override for .arch-gap-badge present', () => {
    expect(src).toMatch(/html\.light .arch-gap-badge/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test Group 3: templates/architect/architect-actions.js — stale injection
// ─────────────────────────────────────────────────────────────────────────────
describe('ENH-034 — architect-actions.js: markStale + injectStaleBadges', () => {
  let src;

  beforeAll(() => {
    src = read('templates/architect/architect-actions.js');
  });

  test('markStale function present', () => {
    expect(src).toMatch(/function markStale/);
  });

  test('injectStaleBadges function present', () => {
    expect(src).toMatch(/function injectStaleBadges/);
  });

  test('data-arch-stale attribute referenced', () => {
    expect(src).toMatch(/data-arch-stale/);
  });

  test('arch-gap-badge class injected', () => {
    expect(src).toMatch(/arch-gap-badge/);
  });

  test('window.vpMarkStale exposed', () => {
    expect(src).toMatch(/window\.vpMarkStale/);
  });
});
