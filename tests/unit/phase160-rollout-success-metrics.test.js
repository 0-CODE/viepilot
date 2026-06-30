const fs = require('fs');

describe('Phase 160 — ENH-112: 3-Phase Rollout + Success Metrics', () => {
  const brainstorm = fs.readFileSync('workflows/brainstorm.md', 'utf8');
  const crystallize = fs.readFileSync('workflows/crystallize.md', 'utf8');
  const bsSkill = fs.readFileSync('skills/vp-brainstorm/SKILL.md', 'utf8');
  const crSkill = fs.readFileSync('skills/vp-crystallize/SKILL.md', 'utf8');
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

  // --- 160.1: engagement template + probes ---
  it('160.1 brainstorm.md has the 3-phase engagement template (Discovery/Bring-up Demo/Pilot)', () => {
    expect(brainstorm).toMatch(/Embedded Engagement Template \(ENH-112\)/);
    expect(brainstorm).toMatch(/Discovery/);
    expect(brainstorm).toMatch(/Bring-up Demo/);
    expect(brainstorm).toMatch(/Pilot/);
  });

  it('160.1 brainstorm.md has success_metrics + lab_equipment probes', () => {
    expect(brainstorm).toMatch(/## success_metrics/);
    expect(brainstorm).toMatch(/## lab_equipment/);
    expect(brainstorm).toMatch(/J-Link|ST-Link|logic analyzer|power profiler/i);
  });

  it('160.1 vp-brainstorm SKILL.md mentions ENH-112 + both YAML sections', () => {
    expect(bsSkill).toMatch(/ENH-112/);
    expect(bsSkill).toMatch(/## success_metrics/);
    expect(bsSkill).toMatch(/## lab_equipment/);
  });

  // --- 160.2: crystallize export + page-count sync ---
  it('160.2 crystallize exports ## Success Metrics + ## Lab Equipment', () => {
    expect(crystallize).toMatch(/## Success Metrics/);
    expect(crystallize).toMatch(/## Lab Equipment/);
  });

  it('160.2 success_metrics + lab_equipment added to Step 1D item 13 trigger list', () => {
    expect(crystallize).toMatch(/## success_metrics/);
    expect(crystallize).toMatch(/## lab_equipment/);
  });

  it('160.2 vp-crystallize SKILL.md documents ENH-112 export', () => {
    expect(crSkill).toMatch(/ENH-112/);
  });

  it('160.2 ENH-071 summary synced to 9 pages (no stale "6 Architect workspace pages")', () => {
    expect(bsSkill).not.toMatch(/6 Architect workspace pages/);
    expect(bsSkill).toMatch(/9 Architect workspace pages/);
    // embedded architect page list is now 9 (count-agnostic >=9 guard)
    const m = bsSkill.match(/(\d+) new Architect workspace pages/);
    expect(m).not.toBeNull();
    expect(Number(m[1])).toBeGreaterThanOrEqual(9);
  });

  // --- 160.3: version (resilient: shape + floor, not literal — per feedback-resilient-page-count-asserts) ---
  it('160.3 package.json version is valid SemVer >= 3.21.0 (shape+floor, not literal)', () => {
    expect(pkg.version).toMatch(/^\d+\.\d+\.\d+$/);
    const [maj, min] = pkg.version.split('.').map(Number);
    expect(maj > 3 || (maj === 3 && min >= 21)).toBe(true);
  });
});
