const fs = require('fs');

// Resilient asserts per SYSTEM-RULES Contract Test Conventions (DEBT-004):
// no hard-coded package.json version literal; SKILL version checked by shape + floor.
function semverGte(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) > (pb[i] || 0)) return true;
    if ((pa[i] || 0) < (pb[i] || 0)) return false;
  }
  return true;
}

describe('Phase 162 — ENH-114: vp-qa Live Role-Based Visual QA (--live)', () => {
  const qa = fs.readFileSync('skills/vp-qa/SKILL.md', 'utf8');

  // --- 162.1: --live mode + role matrix + seeder ---
  it('162.1 SKILL.md documents the --live mode', () => {
    expect(qa).toMatch(/--live/);
    expect(qa).toMatch(/Live Role-Based Visual QA generation \(ENH-114/);
  });

  it('162.1 role matrix (Role x Feature x Screen) sourced from spec + ENH-028 + ENH-063', () => {
    expect(qa).toMatch(/Role × Feature × Screen/);
    expect(qa).toMatch(/ENH-028/);
    expect(qa).toMatch(/ENH-063/);
  });

  it('162.1 role-seeder is seed-script-first, idempotent, namespaced, reversible, non-prod', () => {
    expect(qa).toMatch(/seed-script-first/i);
    expect(qa).toMatch(/[Ii]dempotent/);
    expect(qa).toMatch(/namespaced/i);
    expect(qa).toMatch(/reversible/i);
    expect(qa).toMatch(/non-prod/i);
  });

  it('162.1 prereq gate + graceful degrade to static coverage (never silent-fail)', () => {
    expect(qa).toMatch(/agent-browser/);
    expect(qa).toMatch(/degrade/i);
    expect(qa).toMatch(/never silent-fail|silent-fail/i);
  });

  // --- 162.2: live-driver + design reviewer ---
  it('162.2 live-driver reuses browser-audit-agent / browser-runner (not rebuilt)', () => {
    expect(qa).toMatch(/browser-audit-agent/);
    expect(qa).toMatch(/browser-runner/);
    expect(qa).toMatch(/qa\/screenshots\/\{role\}/);
  });

  it('162.2 qa-design-reviewer scores per-screen (ENH-102 4 dims) + cross-screen, screenshot evidence', () => {
    expect(qa).toMatch(/qa-design-reviewer/);
    expect(qa).toMatch(/ENH-102 aesthetic framework — 4 dimensions/);
    expect(qa).toMatch(/[Cc]ross-screen/);
    expect(qa).toMatch(/screenshot path as evidence/i);
  });

  // --- 162.3: orchestrator + report + boundary ---
  it('162.3 orchestrator: functional→BUG, UI→ENH, missing role-screen→FEAT + live-qa-report.md', () => {
    expect(qa).toMatch(/Live QA handling \(ENH-114\)/);
    expect(qa).toMatch(/live-qa-report\.md/);
    expect(qa).toMatch(/missing role-screen.*FEAT-\{N\}/);
  });

  it('162.3 AUQ headers <=12 chars + final /vp-evolve routing preserved', () => {
    expect(qa).toMatch(/≤12 chars|<=12 chars/);
    expect(qa).toMatch(/\/vp-evolve/);
  });

  it('162.3 boundary vs vp-audit --visual documented', () => {
    expect(qa).toMatch(/vp-audit --visual/);
    expect(qa).toMatch(/regression vs a saved baseline|no baseline/i);
  });

  // --- 162.4: version (resilient) ---
  it('162.4 vp-qa SKILL.md version is SemVer >= 1.2.0 (shape+floor, not literal)', () => {
    const m = qa.match(/^version:\s*(\d+\.\d+\.\d+)/m);
    expect(m).not.toBeNull();
    expect(semverGte(m[1], '1.2.0')).toBe(true);
  });
});
