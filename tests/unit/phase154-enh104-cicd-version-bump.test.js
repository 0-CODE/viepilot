const fs = require('fs');
const path = require('path');

describe('Phase 154 — ENH-104: CI/CD-Aware Version Bump Protocol', () => {

  // Test 1: crystallize Step 6 mentions Version Bump Protocol when deployment_signals present
  it('crystallize Step 6 mentions Version Bump Protocol when deployment_signals present', () => {
    const crystallize = fs.readFileSync('workflows/crystallize.md', 'utf8');
    const step6Start = crystallize.indexOf('<step name="generate_system_rules">') !== -1
      ? crystallize.indexOf('<step name="generate_system_rules">')
      : crystallize.indexOf('## Step 6');
    expect(step6Start).toBeGreaterThan(-1);
    const step6End = crystallize.indexOf('</step>', step6Start);
    const step6 = crystallize.substring(step6Start, step6End > -1 ? step6End : step6Start + 5000);
    expect(step6).toMatch(/Version Bump Protocol/);
    expect(step6).toMatch(/deployment_signals/);
  });

  // Test 2: crystallize Step 6 has conditional guard for empty deployment_signals
  it('crystallize Step 6 has conditional guard for empty deployment_signals', () => {
    const crystallize = fs.readFileSync('workflows/crystallize.md', 'utf8');
    // Should mention the "absent/empty" condition for the section
    expect(crystallize).toMatch(/deployment_signals.*empty|MISSING.*skip|absent.*section/i);
  });

  // Test 3: evolve Step 4 includes CI/CD version ref grep audit sub-step
  it('evolve Step 4 includes CI/CD version ref grep audit sub-step', () => {
    const evolve = fs.readFileSync('workflows/evolve.md', 'utf8');
    const step4Start = evolve.indexOf('<step name="update_version">') !== -1
      ? evolve.indexOf('<step name="update_version">')
      : evolve.indexOf('## 4. Update Version');
    expect(step4Start).toBeGreaterThan(-1);
    const step4End = evolve.indexOf('</step>', step4Start);
    const step4 = evolve.substring(step4Start, step4End > -1 ? step4End : step4Start + 3000);
    expect(step4).toMatch(/Version Bump Protocol|CI\/CD.*grep|deployment_signals/i);
    expect(step4).toMatch(/grep.*old_version|old_version.*grep/i);
  });

});
