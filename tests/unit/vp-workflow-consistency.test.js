/**
 * Contract tests — Phase 81: Workflow Consistency Fixes
 * BUG-014, ENH-051, ENH-052, ENH-053, ENH-054, ENH-055
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '../..');
const wf = (f) => fs.readFileSync(path.join(ROOT, 'workflows', f), 'utf8');
const skill = (s) => fs.readFileSync(path.join(ROOT, 'skills', s, 'SKILL.md'), 'utf8');

// ─── BUG-014: rollback.md enriched tag parse ─────────────────────────────────
describe('BUG-014: rollback.md enriched tag format (Step 7)', () => {
  const content = wf('rollback.md');

  test('Step 7 documents 3 supported formats', () => {
    expect(content).toMatch(/Format A/i);
    expect(content).toMatch(/Format B/i);
    expect(content).toMatch(/Format C/i);
  });

  test('Step 7 uses grep -oE to extract phase number from any tag format', () => {
    expect(content).toMatch(/grep.*-oE.*vp-p\[0-9\]/);
  });

  test('Step 7 handles -complete suffix for phase restore', () => {
    expect(content).toMatch(/\\-complete\$.*RESTORE_PHASE|complete.*PHASE_NUM.*\+.*1/s);
  });

  test('Step 7 handles -done suffix for task restore', () => {
    expect(content).toMatch(/\\-done\$.*RESTORE_TASK|done.*TASK_NUM.*\+.*1/s);
  });
});

// ─── ENH-051: crystallize.md brownfield path table ───────────────────────────
describe('ENH-051: crystallize.md brownfield execution path', () => {
  const content = wf('crystallize.md');

  test('Brownfield Execution Path table is present', () => {
    expect(content).toMatch(/Brownfield Execution Path/i);
  });

  test('Step 1A is documented as CONDITIONAL', () => {
    expect(content).toMatch(/1A.*CONDITIONAL/i);
  });

  test('Step 1B is documented as CONDITIONAL', () => {
    expect(content).toMatch(/1B.*CONDITIONAL/i);
  });

  test('Step 1C is documented as SKIP', () => {
    expect(content).toMatch(/1C.*SKIP/i);
  });

  test('Step 1D is documented as SKIP', () => {
    expect(content).toMatch(/1D.*SKIP/i);
  });
});

// ─── ENH-052: brainstorm.md pre-save phase validation ─────────────────────────
describe('ENH-052: brainstorm.md pre-save phase assignment validation', () => {
  const content = wf('brainstorm.md');

  test('Pre-save validation block is present in Step 6', () => {
    expect(content).toMatch(/Pre-Save Phase.*Validation|pre-save.*phase.*validation/i);
  });

  test('Validation gate references scope-locked sessions', () => {
    expect(content).toMatch(/scope.*lock|SCOPE_LOCKED/i);
  });

  test('Save is blocked when phases missing', () => {
    expect(content).toMatch(/Block save|block.*save/i);
  });

  test('Exploratory sessions bypass the gate', () => {
    expect(content).toMatch(/[Ee]xploratory session/);
  });

  test('Brownfield stubs are exempt from the gate', () => {
    expect(content).toMatch(/IS_BROWNFIELD|brownfield.*skip.*gate|skip.*brownfield/i);
  });
});

// ─── ENH-053: version bump unification ────────────────────────────────────────
describe('ENH-053: version bump unification', () => {
  test('evolve.md references SYSTEM-RULES.md for bump rules', () => {
    const content = wf('evolve.md');
    expect(content).toMatch(/SYSTEM-RULES\.md/);
  });

  test('autonomous.md references SYSTEM-RULES.md for bump rules', () => {
    const content = wf('autonomous.md');
    expect(content).toMatch(/SYSTEM-RULES\.md.*[Vv]ersion [Bb]ump|[Vv]ersion [Bb]ump.*SYSTEM-RULES/);
  });

  test('evolve.md no longer defines bump rules as standalone table (no orphan MINOR/PATCH table)', () => {
    const content = wf('evolve.md');
    // Should not have the old 3-row "Mode / Version Bump" table
    expect(content).not.toMatch(/\| Add Feature \| MINOR \(x\.Y\.z\) \|/);
  });
});

// ─── ENH-054: audit.md post-phase auto-hook ───────────────────────────────────
describe('ENH-054: audit.md + autonomous.md post-phase auto-hook', () => {
  test('autonomous.md has post_phase_audit step', () => {
    const content = wf('autonomous.md');
    expect(content).toMatch(/post_phase_audit/);
  });

  test('post_phase_audit step checks ROADMAP.md for ✅', () => {
    const content = wf('autonomous.md');
    expect(content).toMatch(/ROADMAP.*✅|✅.*ROADMAP/);
  });

  test('post_phase_audit step checks HANDOFF.json phase', () => {
    const content = wf('autonomous.md');
    expect(content).toMatch(/HANDOFF.*phase|HANDOFF_PHASE/i);
  });

  test('post_phase_audit step checks README.md version badge', () => {
    const content = wf('autonomous.md');
    expect(content).toMatch(/README.*badge|README_VERSION/i);
  });

  test('audit.md integration section has concrete XML block (not just conceptual)', () => {
    const content = wf('audit.md');
    expect(content).not.toMatch(/# Conceptually:/);
    expect(content).toMatch(/AUDIT_ISSUES/);
  });

  test('post-phase hook does NOT mention Tier 3 or Tier 4', () => {
    const auto = wf('autonomous.md');
    const hookMatch = auto.match(/post_phase_audit[\s\S]*?<\/step>/);
    expect(hookMatch).not.toBeNull();
    if (hookMatch) {
      expect(hookMatch[0]).not.toMatch(/Tier 3|Tier 4/);
    }
  });
});

// ─── ENH-055: AskUserQuestion enforcement ────────────────────────────────────
describe('ENH-055: AskUserQuestion enforcement — REQUIRED on Claude Code', () => {
  const workflows = ['evolve.md', 'request.md', 'brainstorm.md', 'crystallize.md'];

  workflows.forEach((wfFile) => {
    test(`${wfFile} contains REQUIRED enforcement marker`, () => {
      expect(wf(wfFile)).toMatch(/REQUIRED/);
    });

    test(`${wfFile} adapter table shows REQUIRED`, () => {
      expect(wf(wfFile)).toMatch(/AskUserQuestion.*REQUIRED|REQUIRED.*AskUserQuestion/);
    });
  });

  const skills = ['vp-evolve', 'vp-request', 'vp-brainstorm', 'vp-crystallize'];
  skills.forEach((s) => {
    test(`${s}/SKILL.md contains REQUIRED enforcement marker`, () => {
      expect(skill(s)).toMatch(/REQUIRED/);
    });
  });
});
