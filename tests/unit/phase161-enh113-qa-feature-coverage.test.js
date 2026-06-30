const fs = require('fs');

// Resilient asserts per feedback-resilient-page-count-asserts:
// no hard-coded package.json version literal; version checked by shape + floor.
function semverGte(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) > (pb[i] || 0)) return true;
    if ((pa[i] || 0) < (pb[i] || 0)) return false;
  }
  return true;
}

describe('Phase 161 — ENH-113: vp-qa Feature Coverage / Spec-Gap Auditor', () => {
  const qa = fs.readFileSync('skills/vp-qa/SKILL.md', 'utf8');
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

  // --- 161.1: new scanner + flag ---
  it('161.1 SKILL.md documents qa-feature-coverage-scanner + --focus coverage', () => {
    expect(qa).toMatch(/qa-feature-coverage-scanner/);
    expect(qa).toMatch(/--focus coverage/);
  });

  it('161.1 scanner does bidirectional analysis (coverage matrix + out-of-spec checklist)', () => {
    expect(qa).toMatch(/spec.*code coverage matrix/i);
    expect(qa).toMatch(/out-of-spec checklist/i);
  });

  it('161.1 governance baseline reuses ENH-063/065/066 surfaces', () => {
    expect(qa).toMatch(/ENH-063/);
    expect(qa).toMatch(/ENH-065/);
    expect(qa).toMatch(/ENH-066/);
  });

  it('161.1 greenfield/thin-spec fallback documented, never silent-empty', () => {
    expect(qa).toMatch(/fallback mode/i);
    expect(qa).toMatch(/silent-empty/i);
  });

  // --- 161.2: orchestrator extension ---
  it('161.2 orchestrator keeps a separate "Feature Gaps" group', () => {
    expect(qa).toMatch(/Feature Gaps/);
  });

  it('161.2 importance scoring = impact x spec-status', () => {
    expect(qa).toMatch(/impact \(core\/domain\/governance/);
    expect(qa).toMatch(/spec-status/);
  });

  it('161.2 emits FEAT-{N}/ENH-{N} (not just BUG) + writes feature-coverage-report.md', () => {
    expect(qa).toMatch(/FEAT-\{N\}/);
    expect(qa).toMatch(/ENH-\{N\}/);
    expect(qa).toMatch(/feature-coverage-report\.md/);
  });

  it('161.2 AUQ headers <=12 chars referenced + final routing to /vp-evolve preserved', () => {
    expect(qa).toMatch(/≤12 chars|<=12 chars/);
    expect(qa).toMatch(/\/vp-evolve/);
  });

  // --- 161.3: version (resilient: shape + floor, not literal) ---
  it('161.3 vp-qa SKILL.md version is SemVer >= 1.1.0 (shape+floor, not literal)', () => {
    const m = qa.match(/^version:\s*(\d+\.\d+\.\d+)/m);
    expect(m).not.toBeNull();
    expect(semverGte(m[1], '1.1.0')).toBe(true);
  });

  it('161.3 package.json version is valid SemVer >= 3.22.0 (shape+floor, not literal)', () => {
    expect(pkg.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(semverGte(pkg.version, '3.22.0')).toBe(true);
  });
});
