const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

describe('ENH-022 crystallize architecture .mermaid sidecars', () => {
  test('crystallize Step 4 defines ENH-022 mirror policy and canonical filenames', () => {
    const w = read('workflows/crystallize.md');
    expect(w).toMatch(/Architecture diagram source files on disk \(ENH-022\)/);
    expect(w).toMatch(/Single source of truth \(mirror policy\)/);
    expect(w).toMatch(/system-overview\.mermaid/);
    expect(w).toMatch(/data-flow\.mermaid/);
    expect(w).toMatch(/event-flows\.mermaid/);
    expect(w).toMatch(/module-dependencies\.mermaid/);
    expect(w).toMatch(/deployment\.mermaid/);
    expect(w).toMatch(/user-use-case\.mermaid/);
  });

  test('project ARCHITECTURE template documents diagram source paths', () => {
    const t = read('templates/project/ARCHITECTURE.md');
    expect(t).toMatch(/## Diagram source files \(ENH-022\)/);
    expect(t).toMatch(/\.viepilot\/architecture\//);
    expect(t).toMatch(/user-use-case\.mermaid/);
  });

  test('vp-crystallize skill references ENH-022 sidecar files', () => {
    const s = read('skills/vp-crystallize/SKILL.md');
    expect(s).toMatch(/ENH-022/);
    expect(s).toMatch(/architecture\/.*ENH-022/);
  });

  test('vp-audit skill recommends ENH-022 sidecar check', () => {
    const s = read('skills/vp-audit/SKILL.md');
    expect(s).toMatch(/ENH-022 \(recommended check\)/);
    expect(s).toMatch(/\.viepilot\/architecture/);
  });
});
