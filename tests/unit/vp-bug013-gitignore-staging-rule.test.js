'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

// ─────────────────────────────────────────────────────────────────────────────

describe('BUG-013 GITIGNORE-AWARE STAGING RULE — never stage gitignored files', () => {

  test('autonomous.md: has GITIGNORE-AWARE STAGING RULE (BUG-013) block in commit section', () => {
    const content = read('workflows/autonomous.md');

    // Block marker present
    expect(content).toMatch(/⛔.*GITIGNORE-AWARE STAGING RULE.*BUG-013/);

    // References git check-ignore
    expect(content).toContain('git check-ignore');

    // Explicitly names .viepilot/ as always gitignored
    expect(content).toContain('.viepilot/');
  });

  test('autonomous.md: staging rule appears after git add in commit block', () => {
    const content = read('workflows/autonomous.md');

    const gitAddPos = content.indexOf('git add {relevant files}');
    const bug013Pos = content.indexOf('GITIGNORE-AWARE STAGING RULE (BUG-013)');

    expect(gitAddPos).toBeGreaterThan(-1);
    expect(bug013Pos).toBeGreaterThan(gitAddPos);
  });

  test('autonomous.md: git persistence gate has BUG-013 note about ?? lines', () => {
    const content = read('workflows/autonomous.md');

    // BUG-013 note must appear near the porcelain check
    const porcelainPos = content.indexOf('git status --porcelain');
    const notePos = content.indexOf('BUG-013', porcelainPos);

    expect(porcelainPos).toBeGreaterThan(-1);
    // A BUG-013 note exists within 500 chars of the porcelain check
    expect(notePos).toBeGreaterThan(porcelainPos);
    expect(notePos - porcelainPos).toBeLessThan(500);

    // The note explains ?? lines
    const noteSection = content.slice(notePos, notePos + 300);
    expect(noteSection).toContain('??');
  });

});
