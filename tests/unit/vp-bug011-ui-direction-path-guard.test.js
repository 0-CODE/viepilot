'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

// ─────────────────────────────────────────────────────────────────────────────

describe('BUG-011 ui-direction path disambiguation guard', () => {

  test('brainstorm.md: confirmation dialogue option 1 uses full .viepilot/ path, not bare ui-direction/', () => {
    const content = read('workflows/brainstorm.md');

    // Must match the full .viepilot/ui-direction/... path
    expect(content).toMatch(/1\.\s+Save to \.viepilot\/ui-direction\/.+\/notes\.md/);

    // Must NOT have the bare ambiguous form
    expect(content).not.toMatch(/1\.\s+Save to ui-direction\/notes\.md/);
  });

  test('crystallize.md: consume_ui_direction step has PATH GUARD block before UI Scope Detection', () => {
    const content = read('workflows/crystallize.md');

    // Guard marker present
    expect(content).toMatch(/⛔.*PATH GUARD.*BUG-011/);

    // Guard appears BEFORE "UI Scope Detection" section
    const guardPos = content.indexOf('PATH GUARD (BUG-011)');
    const scopePos = content.indexOf('UI Scope Detection');

    expect(guardPos).toBeGreaterThan(-1);
    expect(scopePos).toBeGreaterThan(-1);
    expect(guardPos).toBeLessThan(scopePos);

    // Guard mentions IGNORE for root ui-direction
    const guardSection = content.slice(guardPos, scopePos);
    expect(guardSection).toMatch(/IGNORE/i);
  });

  test('crystallize.md: PATH GUARD names .viepilot/ui-direction as the ONLY valid path', () => {
    const content = read('workflows/crystallize.md');

    const guardPos = content.indexOf('PATH GUARD (BUG-011)');
    const guardSection = content.slice(guardPos, guardPos + 500);

    // Names valid path
    expect(guardSection).toContain('.viepilot/ui-direction/');

    // Explicitly references root-level ui-direction as invalid
    expect(guardSection).toMatch(/\{root\}\/ui-direction\//);
  });

});
