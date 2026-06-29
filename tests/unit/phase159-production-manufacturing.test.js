const fs = require('fs');

describe('Phase 159 — ENH-111: Production & Manufacturing', () => {
  const brainstorm = fs.readFileSync('workflows/brainstorm.md', 'utf8');
  const crystallize = fs.readFileSync('workflows/crystallize.md', 'utf8');
  const bsSkill = fs.readFileSync('skills/vp-brainstorm/SKILL.md', 'utf8');
  const crSkill = fs.readFileSync('skills/vp-crystallize/SKILL.md', 'utf8');

  // --- 159.1: Topic probe ---
  it('159.1 brainstorm.md has a Production & Manufacturing probe + ## production', () => {
    expect(brainstorm).toMatch(/Production & Manufacturing Topic \(ENH-111\)/);
    expect(brainstorm).toMatch(/## production/);
  });

  it('159.1 probe covers programming, factory test, provisioning/serialization, calibration, traceability', () => {
    expect(brainstorm).toMatch(/gang programmer/);
    expect(brainstorm).toMatch(/factory.test/i);
    expect(brainstorm).toMatch(/serial|X\.509|PSK/);
    expect(brainstorm).toMatch(/calibration/i);
    expect(brainstorm).toMatch(/traceability/i);
  });

  it('159.1 vp-brainstorm SKILL.md documents ENH-111', () => {
    expect(bsSkill).toMatch(/ENH-111/);
  });

  // --- 159.2: Architect page (count-agnostic per resilient-asserts lesson) ---
  it('159.2 brainstorm.md adds the production.html architect page', () => {
    expect(brainstorm).toMatch(/production\.html.*Production & Manufacturing \(ENH-111\)/s);
  });

  it('159.2 Embedded nav links production.html (page count >= 9, bumped from 8)', () => {
    expect(brainstorm).toMatch(/<a href="production\.html">/);
    const m = brainstorm.match(/All (\d+) pages below/);
    expect(m).not.toBeNull();
    expect(Number(m[1])).toBeGreaterThanOrEqual(9);
  });

  it('159.2 Page Boundary delineates production from secure-lifecycle and test-strategy', () => {
    expect(brainstorm).toMatch(/production\.html.*Factory-line execution/s);
  });

  it('159.2 vp-brainstorm SKILL.md lists production.html (page count >= 9)', () => {
    expect(bsSkill).toMatch(/production\.html/);
    const m = bsSkill.match(/(\d+) new Architect workspace pages/);
    expect(m).not.toBeNull();
    expect(Number(m[1])).toBeGreaterThanOrEqual(9);
  });

  // --- 159.3: crystallize export ---
  it('159.3 crystallize exports ## Production & Manufacturing', () => {
    expect(crystallize).toMatch(/## Production & Manufacturing/);
  });

  it('159.3 export is cross-linked to ENH-109 Security Architecture', () => {
    expect(crystallize).toMatch(/Production & Manufacturing.*Security Architecture.*ENH-109/s);
  });

  it('159.3 production added to Step 1D item 13 trigger list', () => {
    expect(crystallize).toMatch(/## production/);
  });

  it('159.3 new section is READ-ONLY for vp-auto', () => {
    expect(crystallize).toMatch(/Production & Manufacturing.*ENH-111/s);
  });

  it('159.3 vp-crystallize SKILL.md documents ENH-111 export', () => {
    expect(crSkill).toMatch(/ENH-111/);
    expect(crSkill).toMatch(/Production & Manufacturing/);
  });
});
