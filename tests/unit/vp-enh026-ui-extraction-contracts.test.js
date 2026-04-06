'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

describe('ENH-026 vp-brainstorm background UI extraction + crystallize hard gate', () => {
  test('brainstorm.md: Background UI Extraction section exists with ≥20 signal keywords', () => {
    const content = read('workflows/brainstorm.md');
    expect(content).toMatch(/Background UI Extraction/i);
    // The keyword block is a blockquote line starting with "> `"
    const keywordLine = content.match(/^> `[^`]+`.*$/m);
    expect(keywordLine).not.toBeNull();
    // Count backtick-wrapped keywords in that line
    const keywords = keywordLine[0].match(/`[^`]+`/g) || [];
    expect(keywords.length).toBeGreaterThanOrEqual(20);
  });

  test('brainstorm.md: threshold, accumulation and surface rules documented as non-blocking', () => {
    const content = read('workflows/brainstorm.md');
    expect(content).toMatch(/≥3 unique signal/i);
    expect(content).toMatch(/ui_idea_buffer/);
    expect(content).toMatch(/[Nn]on-blocking|non.blocking/);
    expect(content).toMatch(/[Ss]ilent/);
  });

  test('brainstorm.md: surface confirmation dialogue has 3 options and links to UI Direction Mode', () => {
    const content = read('workflows/brainstorm.md');
    // Dialogue template must be present
    expect(content).toMatch(/💡.*I detected/);
    // Three numbered options
    expect(content).toMatch(/1\.\s.*notes\.md/);
    expect(content).toMatch(/2\.\s.*UI Direction Mode/);
    expect(content).toMatch(/3\.\s.*[Dd]iscard/);
    // Option 3 must document buffer preservation
    expect(content).toMatch(/buffer/i);
  });

  test('crystallize.md Step 1A: hard gate with ⚠️ block and /vp-brainstorm --ui reference', () => {
    const content = read('workflows/crystallize.md');
    expect(content).toMatch(/⚠️ UI Direction artifacts missing/);
    expect(content).toMatch(/\/vp-brainstorm --ui/);
    expect(content).toMatch(/ui_scope_detected/);
  });

  test('crystallize.md: option 2 gate bypass writes UI Direction Assumptions to ARCHITECTURE.md', () => {
    const content = read('workflows/crystallize.md');
    expect(content).toMatch(/UI Direction Assumptions/);
    expect(content).toMatch(/ARCHITECTURE\.md/);
    expect(content).toMatch(/ENH-026/);
  });

  test('crystallize.md Step 1A: Pages inventory multi-page check preserved', () => {
    const content = read('workflows/crystallize.md');
    expect(content).toMatch(/Pages inventory/);
    expect(content).toMatch(/pages\/\*\.html/);
  });
});
