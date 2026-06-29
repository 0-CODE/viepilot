const fs = require('fs');

describe('Phase 158 — ENH-110: Embedded Testing & Verification', () => {
  const brainstorm = fs.readFileSync('workflows/brainstorm.md', 'utf8');
  const crystallize = fs.readFileSync('workflows/crystallize.md', 'utf8');
  const bsSkill = fs.readFileSync('skills/vp-brainstorm/SKILL.md', 'utf8');
  const crSkill = fs.readFileSync('skills/vp-crystallize/SKILL.md', 'utf8');

  // --- 158.1: Topic probe ---
  it('158.1 brainstorm.md has a Testing & Verification probe + ## test_strategy', () => {
    expect(brainstorm).toMatch(/Testing & Verification Topic \(ENH-110\)/);
    expect(brainstorm).toMatch(/## test_strategy/);
  });

  it('158.1 probe covers host unit, static analysis, HIL, CI, fault injection', () => {
    expect(brainstorm).toMatch(/Unity \+ CMock|Unity\+CMock/);
    expect(brainstorm).toMatch(/MISRA/);
    expect(brainstorm).toMatch(/cppcheck/);
    expect(brainstorm).toMatch(/HIL|hardware-in-loop/i);
    expect(brainstorm).toMatch(/fault injection/i);
  });

  it('158.1 vp-brainstorm SKILL.md documents ENH-110', () => {
    expect(bsSkill).toMatch(/ENH-110/);
  });

  // --- 158.2: Architect page ---
  it('158.2 brainstorm.md adds the test-strategy.html architect page', () => {
    expect(brainstorm).toMatch(/test-strategy\.html.*Testing & Verification \(ENH-110\)/s);
  });

  it('158.2 Embedded nav links test-strategy.html (page count >= 8, bumped from 7)', () => {
    expect(brainstorm).toMatch(/<a href="test-strategy\.html">/);
    const m = brainstorm.match(/All (\d+) pages below/);
    expect(m).not.toBeNull();
    expect(Number(m[1])).toBeGreaterThanOrEqual(8);
  });

  it('158.2 Page Boundary delineates test-strategy from the ENH-108 per-task contract', () => {
    expect(brainstorm).toMatch(/test-strategy\.html.*ENH-108 2-tier/s);
  });

  it('158.2 vp-brainstorm SKILL.md lists test-strategy.html (page count >= 8)', () => {
    expect(bsSkill).toMatch(/test-strategy\.html/);
    const m = bsSkill.match(/(\d+) new Architect workspace pages/);
    expect(m).not.toBeNull();
    expect(Number(m[1])).toBeGreaterThanOrEqual(8);
  });

  // --- 158.3: crystallize export ---
  it('158.3 crystallize exports ## Test & Verification Strategy', () => {
    expect(crystallize).toMatch(/## Test & Verification Strategy/);
  });

  it('158.3 export is cross-linked to the ENH-108 2-tier contract', () => {
    expect(crystallize).toMatch(/Test & Verification Strategy.*ENH-108 2-tier/s);
  });

  it('158.3 test_strategy added to Step 1D item 13 trigger list', () => {
    expect(crystallize).toMatch(/## test_strategy/);
  });

  it('158.3 new section is READ-ONLY for vp-auto', () => {
    expect(crystallize).toMatch(/Test & Verification Strategy.*ENH-110/s);
  });

  it('158.3 vp-crystallize SKILL.md documents ENH-110 export', () => {
    expect(crSkill).toMatch(/ENH-110/);
    expect(crSkill).toMatch(/Test & Verification Strategy/);
  });
});
