'use strict';

const audience = require('../../lib/proposal-audience.cjs');
const sources = require('../../lib/proposal-sources.cjs');

const TRIAL = 'Giới thiệu ViePilot cho đồng nghiệp kỹ thuật (dev, tech lead, product, QA), khoảng 15 người, trực tiếp; mời một đội dùng thử 2 tuần.';

describe('BUG-035 G3 — hints from the trial wording', () => {
  const h = audience.extractAudienceHints(TRIAL, { lang: 'vi' });
  test('engineering first, then tech-lead, product, qa', () => {
    expect(h.raw.roles[0]).toBe('engineering');
    expect(h.raw.roles).toEqual(expect.arrayContaining(['tech-lead', 'product', 'qa']));
  });
  test('"dùng thử" is the adopt goal and outranks "giới thiệu" (update)', () => {
    expect(h.raw.goal).toBe('adopt');
  });
  test('adopt recommends internal team-intro', () => {
    const rec = audience.recommendProposalType(audience.normalizeAudienceProfile(h.raw), { lang: 'vi' });
    expect(rec.typeId).toBe('internal-presentation');
    expect(rec.variant).toBe('team-intro');
    expect(rec.reason).toMatch(/dùng thử/);
  });
  test('English pilot wording', () => {
    const e = audience.extractAudienceHints('Pilot for the dev team and QA testers', { lang: 'en' });
    expect(e.raw.goal).toBe('adopt');
    expect(e.raw.roles).toEqual(expect.arrayContaining(['engineering', 'qa']));
  });
});

describe('BUG-035 G4 — source classifier', () => {
  test.each([
    ['scripts/release.cjs', null],
    ['tests/unit/a.test.js', null],
    ['lib/foo.spec.ts', null],
    ['agents/changelog-agent.md', null],
    ['templates/tests/architecture-fixture.json', null],
    ['CHANGELOG.md', 'process-log'],
    ['docs/user/features/proposal.md', 'product-value'],
    ['docs/architecture/overview.md', 'architecture'],
    ['README.md', 'product-value'],
  ])('%s → %s', (p, kind) => expect(sources.classifyPath(p)).toBe(kind));

  test('findStaleFacts flags versions that disagree with the current one', () => {
    expect(sources.findStaleFacts('ViePilot 3.8.0 — now v3.22.2', { version: '3.22.2' })).toEqual(['3.8.0']);
    expect(sources.findStaleFacts('3.22.2', { version: '3.22.2' })).toEqual([]);
  });
});
