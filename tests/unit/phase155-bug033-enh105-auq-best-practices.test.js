'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

describe('Phase 155 — BUG-033 + ENH-105: AUQ Best Practices', () => {

  it('BUG-033: no AUQ header violations in workflows/ or skills/', () => {
    const result = execSync(
      `grep -rn 'header:.*".\\{13,\\}"' workflows/ skills/ || true`,
      { cwd: path.join(__dirname, '../..'), encoding: 'utf8' }
    );
    // Filter out template placeholders
    const real = result.split('\n').filter(l => l.includes('header:') && !l.includes('{'));
    expect(real.filter(Boolean)).toHaveLength(0);
  });

  it('ENH-105: interactive-prompts.md has Correct Call Template section', () => {
    const doc = fs.readFileSync(
      path.join(__dirname, '../../docs/user/features/interactive-prompts.md'), 'utf8'
    );
    expect(doc).toMatch(/## Correct Call Template/);
    expect(doc).toMatch(/≤ 12/);
  });

  it('ENH-105: interactive-prompts.md has Anti-Patterns table', () => {
    const doc = fs.readFileSync(
      path.join(__dirname, '../../docs/user/features/interactive-prompts.md'), 'utf8'
    );
    expect(doc).toMatch(/## Anti-Patterns/);
    // Should have at least 5 rows in the anti-patterns table
    const rows = (doc.match(/InputValidationError|Tool not found/g) || []);
    expect(rows.length).toBeGreaterThanOrEqual(5);
  });

  it('ENH-105: npm run lint:auq script exists and exits 0', () => {
    const pkg = require(path.join(__dirname, '../../package.json'));
    expect(pkg.scripts['lint:auq']).toBeDefined();
    // Actually run it
    expect(() => execSync('npm run lint:auq --silent', {
      cwd: path.join(__dirname, '../..'),
      stdio: 'pipe'
    })).not.toThrow();
  });

});
