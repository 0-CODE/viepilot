'use strict';

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '../..');

describe('BUG-036 177.1 — listener prompt requires seeing the slides', () => {
  const tpl = fs.readFileSync(path.join(ROOT, 'templates/proposal/simulation/listener-prompt.md'), 'utf8');
  test('precondition: open every slide image; report slidesSeen and visualNotes', () => {
    expect(tpl).toMatch(/open \*\*every\*\* slide image/);
    expect(tpl).toMatch(/"slidesSeen"/);
    expect(tpl).toMatch(/"visualNotes"/);
    expect(tpl).toMatch(/text-only/);
  });
  test('quote rule: only the few words; whole-segment copy discarded; estimates', () => {
    expect(tpl).toMatch(/only the few words/);
    expect(tpl).toMatch(/copy of the whole segment is not a quote/);
    expect(tpl).toMatch(/estimates, not measurements/);
  });
  test('workflow documents visual verification', () => {
    const wf = fs.readFileSync(path.join(ROOT, 'workflows/proposal.md'), 'utf8');
    expect(wf).toMatch(/verifyVisual\(entries, imagePaths\)/);
    expect(wf).toMatch(/quoteQuality: mechanical/);
  });
});
