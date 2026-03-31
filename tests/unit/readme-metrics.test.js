const {
  formatLoc,
  extractLocFromClocJson,
  buildTotalLocCell,
  updateReadmeTotalLoc,
} = require('../../scripts/sync-readme-metrics.cjs');

describe('readme metrics sync helpers', () => {
  test('formats location with separators', () => {
    expect(formatLoc(12345)).toBe('12,345');
  });

  test('extracts code loc from cloc json', () => {
    const loc = extractLocFromClocJson(JSON.stringify({ SUM: { code: 24001 } }));
    expect(loc).toBe(24001);
  });

  test('builds total LOC table cell', () => {
    const cell = buildTotalLocCell(24001);
    expect(cell).toContain('~24,001+');
    expect(cell).toContain('node_modules');
  });

  test('updates Total LOC row in README table', () => {
    const readme = [
      '| Chỉ số / Metric | Giá trị / Value |',
      '|-----------------|-----------------|',
      '| Total LOC | **~24,000+** (`.md`) |',
      '| Skills | **14** |',
    ].join('\n');
    const updated = updateReadmeTotalLoc(readme, 25000);
    expect(updated).toContain('| Total LOC | **~25,000+**');
    expect(updated).toContain('| Skills | **14** |');
  });
});
