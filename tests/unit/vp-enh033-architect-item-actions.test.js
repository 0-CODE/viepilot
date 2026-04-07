'use strict';

/**
 * ENH-033 Architect HTML Item Actions contracts
 *
 * Verifies:
 *   1. templates/architect/architect-actions.js exists and contains required functions
 *   2. style.css contains .arch-id-badge and .arch-btn classes
 *   3. All 11 content HTML templates have data-arch-id and data-arch-slug attributes
 *   4. workflows/brainstorm.md contains the isolation rule
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

function exists(relPath) {
  return fs.existsSync(path.join(ROOT, relPath));
}

// ─────────────────────────────────────────────────────────────────────────────
// Test Group 1: architect-actions.js exists and has required content
// ─────────────────────────────────────────────────────────────────────────────
describe('ENH-033 — architect-actions.js: exists and required functions', () => {
  let src;

  beforeAll(() => {
    src = read('templates/architect/architect-actions.js');
  });

  test('templates/architect/architect-actions.js exists', () => {
    expect(exists('templates/architect/architect-actions.js')).toBe(true);
  });

  test('contains approvePrompt function/template', () => {
    expect(src).toMatch(/APPROVE/);
  });

  test('contains editPrompt function/template', () => {
    expect(src).toMatch(/EDIT/);
  });

  test('contains copyText or clipboard logic', () => {
    expect(src).toMatch(/clipboard|execCommand/);
  });

  test('contains DOMContentLoaded or inject call', () => {
    expect(src).toMatch(/DOMContentLoaded|inject/);
  });

  test('prompt format includes page slug ([ARCH:{slug}:{id}])', () => {
    expect(src).toMatch(/ARCH.*slug.*id|ARCH.*archSlug/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test Group 2: style.css has item action styles
// ─────────────────────────────────────────────────────────────────────────────
describe('ENH-033 — style.css: item action styles present', () => {
  let css;

  beforeAll(() => {
    css = read('templates/architect/style.css');
  });

  test('.arch-id-badge class defined', () => {
    expect(css).toMatch(/\.arch-id-badge/);
  });

  test('.arch-btn class defined', () => {
    expect(css).toMatch(/\.arch-btn[^-]/);
  });

  test('.arch-btn-approve class defined', () => {
    expect(css).toMatch(/\.arch-btn-approve/);
  });

  test('.arch-btn-edit class defined', () => {
    expect(css).toMatch(/\.arch-btn-edit/);
  });

  test('.arch-item-actions class defined', () => {
    expect(css).toMatch(/\.arch-item-actions/);
  });

  test('hover-reveal pattern present', () => {
    expect(css).toMatch(/hover.*arch-item-actions|arch-item-actions.*opacity/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test Group 3: All 11 content HTML templates have data-arch-id and data-arch-slug
// ─────────────────────────────────────────────────────────────────────────────
describe('ENH-033 — HTML templates: data-arch-id and data-arch-slug present', () => {
  const CONTENT_TEMPLATES = [
    { file: 'decisions.html',        slug: 'decisions' },
    { file: 'architecture.html',     slug: 'architecture' },
    { file: 'erd.html',              slug: 'erd' },
    { file: 'user-use-cases.html',   slug: 'use-cases' },
    { file: 'apis.html',             slug: 'apis' },
    { file: 'deployment.html',       slug: 'deployment' },
    { file: 'data-flow.html',        slug: 'data-flow' },
    { file: 'sequence-diagram.html', slug: 'sequence' },
    { file: 'tech-stack.html',       slug: 'tech-stack' },
    { file: 'tech-notes.html',       slug: 'tech-notes' },
    { file: 'feature-map.html',      slug: 'features' },
  ];

  CONTENT_TEMPLATES.forEach(({ file, slug }) => {
    const relPath = `templates/architect/${file}`;

    test(`${file}: has data-arch-id attribute`, () => {
      const html = read(relPath);
      expect(html).toMatch(/data-arch-id=/);
    });

    test(`${file}: has data-arch-slug="${slug}"`, () => {
      const html = read(relPath);
      expect(html).toContain(`data-arch-slug="${slug}"`);
    });

    test(`${file}: includes architect-actions.js`, () => {
      const html = read(relPath);
      expect(html).toMatch(/architect-actions\.js/);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test Group 4: workflows/brainstorm.md contains the isolation rule
// ─────────────────────────────────────────────────────────────────────────────
describe('ENH-033 — workflows/brainstorm.md: isolation rule documented', () => {
  let content;

  beforeAll(() => {
    content = read('workflows/brainstorm.md');
  });

  test('Architect Item Actions section present', () => {
    expect(content).toMatch(/Architect Item Actions.*ENH-033/i);
  });

  test('ISOLATION RULE stated', () => {
    expect(content).toMatch(/ISOLATION RULE/i);
  });

  test('cross-page cascade prohibition stated', () => {
    expect(content).toMatch(/does NOT approve|never.*cascade|no.*cascade/i);
  });

  test('APPROVE prompt handling documented', () => {
    expect(content).toMatch(/APPROVE.*prompt|receive.*APPROVE/i);
  });

  test('EDIT prompt handling documented', () => {
    expect(content).toMatch(/EDIT.*prompt|receive.*EDIT/i);
  });
});
