'use strict';
const { execSync } = require('child_process');
const path = require('path');

const CLI = path.join(__dirname, '../../bin/viepilot.cjs');

describe('BUG-015: viepilot --list-targets includes all adapters', () => {
  let output;
  beforeAll(() => {
    output = execSync(`node "${CLI}" --list-targets`, { encoding: 'utf8' });
  });

  test('--list-targets includes claude-code', () => {
    expect(output).toMatch(/claude-code/);
  });

  test('--list-targets includes cursor-agent', () => {
    expect(output).toMatch(/cursor-agent/);
  });

  test('--list-targets includes antigravity', () => {
    expect(output).toMatch(/antigravity/);
  });

  test('--list-targets includes codex', () => {
    expect(output).toMatch(/codex/);
  });

  test('--list-targets includes copilot', () => {
    expect(output).toMatch(/copilot/);
  });

  test('--list-targets includes GitHub Copilot label', () => {
    expect(output).toMatch(/GitHub Copilot/);
  });

  test('install --target copilot --dry-run does not throw', () => {
    expect(() => {
      execSync(`node "${CLI}" install --target copilot --dry-run --yes`, {
        encoding: 'utf8',
        stdio: 'pipe',
      });
    }).not.toThrow();
  });
});
