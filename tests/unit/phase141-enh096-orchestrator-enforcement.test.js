'use strict';
const fs   = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '../..');

describe('Phase 141 — ENH-096: autonomous.md orchestrator enforcement', () => {
  let content;
  beforeAll(() => {
    content = fs.readFileSync(path.join(ROOT, 'workflows/autonomous.md'), 'utf8');
  });

  test('contains ORCHESTRATOR STOP hard stop block', () => {
    expect(content).toMatch(/ORCHESTRATOR STOP/);
  });

  test('hard stop lists forbidden Edit/Write on implementation files', () => {
    expect(content).toMatch(/Edit.*Write.*implementation|forbidden.*inline|inline.*framework violation/i);
  });

  test('orchestrator whitelist is present', () => {
    expect(content).toMatch(/permitted.*only|orchestrator.*may.*only|whitelist/i);
  });

  test('single-task exception is explicitly closed', () => {
    expect(content).toMatch(/even when there is only one task|single.task.*vp-task-executor|single.task.*spawn/i);
  });

  test('concrete vp-task-executor spawn template is present', () => {
    expect(content).toMatch(/subagent_type.*vp-task-executor|vp-task-executor.*subagent_type/);
  });

  test('spawn template has TASK_RESULT return format', () => {
    expect(content).toMatch(/TASK_RESULT.*PASS|PASS.*FAIL.*PARTIAL/);
  });
});
