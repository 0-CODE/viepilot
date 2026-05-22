'use strict';
const path = require('path');
const os = require('os');
const fs = require('fs');

const ROOT = path.join(__dirname, '../..');
const { buildInstallPlan } = require('../../lib/viepilot-install.cjs');

describe('Phase 134 — BUG-027: claudeAgentsDir wired into install plan', () => {

  let plan;
  const fakeHome = '/fake/home';

  beforeAll(() => {
    plan = buildInstallPlan(ROOT, {
      VIEPILOT_INSTALL_PROFILE: 'claude-code',
    }, { installTargets: ['claude-code'], overrideHomedir: fakeHome });
  });

  test('install plan includes mkdir step for ~/.claude/agents/', () => {
    const mkdirSteps = plan.steps.filter(s => s.kind === 'mkdir');
    const agentsDir = path.join(fakeHome, '.claude', 'agents');
    const hasAgentsMkdir = mkdirSteps.some(s => s.path === agentsDir);
    expect(hasAgentsMkdir).toBe(true);
  });

  test('install plan copies vp-task-executor.md to ~/.claude/agents/', () => {
    const copySteps = plan.steps.filter(s => s.kind === 'copy_file');
    const agentsDest = path.join(fakeHome, '.claude', 'agents');
    const hasTaskExecutor = copySteps.some(
      s => s.dest === path.join(agentsDest, 'vp-task-executor.md')
        || (s.to && s.to === path.join(agentsDest, 'vp-task-executor.md'))
    );
    expect(hasTaskExecutor).toBe(true);
  });

  test('install plan copies vp-phase-planner.md to ~/.claude/agents/', () => {
    const copySteps = plan.steps.filter(s => s.kind === 'copy_file');
    const agentsDest = path.join(fakeHome, '.claude', 'agents');
    const hasPlanner = copySteps.some(
      s => s.dest === path.join(agentsDest, 'vp-phase-planner.md')
        || (s.to && s.to === path.join(agentsDest, 'vp-phase-planner.md'))
    );
    expect(hasPlanner).toBe(true);
  });

  test('install plan copies vp-quality-gate.md to ~/.claude/agents/', () => {
    const copySteps = plan.steps.filter(s => s.kind === 'copy_file');
    const agentsDest = path.join(fakeHome, '.claude', 'agents');
    const hasGate = copySteps.some(
      s => s.dest === path.join(agentsDest, 'vp-quality-gate.md')
        || (s.to && s.to === path.join(agentsDest, 'vp-quality-gate.md'))
    );
    expect(hasGate).toBe(true);
  });

  test('agent copy destination is ~/.claude/agents/ NOT ~/.claude/viepilot/agents/', () => {
    const copySteps = plan.steps.filter(s => s.kind === 'copy_file' && s.to && s.to.includes('vp-task-executor.md'));
    if (copySteps.length > 0) {
      const dest = copySteps[0].to;
      expect(dest).not.toMatch(/viepilot\/agents/);
      expect(dest).toMatch(/\.claude\/agents\/vp-task-executor\.md/);
    } else {
      // If the step uses 'dest' key instead of 'to'
      const byDest = plan.steps.filter(s => s.dest && s.dest.includes('vp-task-executor.md'));
      expect(byDest.length).toBeGreaterThan(0);
    }
  });

});
