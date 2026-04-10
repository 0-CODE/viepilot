const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

describe('ENH-021 implementation routing contracts', () => {
  test('core workflows define Implementation routing guard', () => {
    expect(read('workflows/request.md')).toMatch(/## Implementation routing guard/);
    expect(read('workflows/evolve.md')).toMatch(/## Implementation routing guard/);
    expect(read('workflows/debug.md')).toMatch(/## Implementation routing guard/);
    expect(read('workflows/autonomous.md')).toMatch(/## Implementation entry/);
  });

  test('all vp-* skills include implementation_routing_guard block', () => {
    const dir = path.join(ROOT, 'skills');
    const skills = fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isDirectory() && d.name.startsWith('vp-'));
    expect(skills.length).toBe(17);
    for (const d of skills) {
      const md = read(path.join('skills', d.name, 'SKILL.md'));
      expect(md).toMatch(/<implementation_routing_guard>/);
      expect(md).toMatch(/ENH-021/);
    }
  });

  test('vp-auto declares Primary implementation lane', () => {
    expect(read('skills/vp-auto/SKILL.md')).toMatch(/Primary implementation lane/);
  });
});
