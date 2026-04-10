'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

// ─────────────────────────────────────────────────────────────────────────────

describe('BUG-012 PATH RESOLUTION RULE — codebase vs install', () => {

  test('autonomous.md: has PATH RESOLUTION RULE (BUG-012) block after BUG-009 preflight', () => {
    const content = read('workflows/autonomous.md');

    // Block marker present
    expect(content).toMatch(/⛔.*PATH RESOLUTION RULE.*BUG-012/);

    // Block contains cwd anchor
    expect(content).toMatch(/\{cwd\}/);

    // Block appears AFTER the BUG-009 preflight text
    const bug009Pos = content.indexOf('Preflight: Task Paths Validation (BUG-009)');
    const bug012Pos = content.indexOf('PATH RESOLUTION RULE (BUG-012)');
    expect(bug009Pos).toBeGreaterThan(-1);
    expect(bug012Pos).toBeGreaterThan(bug009Pos);
  });

  test('autonomous.md: PATH RESOLUTION RULE explicitly forbids ~/.claude/ and ~/.cursor/', () => {
    const content = read('workflows/autonomous.md');

    expect(content).toContain('~/.claude/');
    expect(content).toMatch(/~\/.cursor\/|install director/);
  });

  test('evolve.md: TASK PATH RULE has BUG-012 cwd-resolution clarification', () => {
    const content = read('workflows/evolve.md');

    expect(content).toMatch(/BUG-012/);
    expect(content).toMatch(/\{cwd\}/);
    // Must mention forbidden install destinations
    expect(content).toContain('~/.claude/');
  });

});
