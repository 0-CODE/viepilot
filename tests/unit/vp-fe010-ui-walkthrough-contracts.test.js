const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

describe('FEAT-010 UI walkthrough contracts', () => {
  test('brainstorm workflow defines /research-ui pipeline and UX walkthrough log', () => {
    const md = read('workflows/brainstorm.md');
    expect(md).toMatch(/\/research-ui/);
    expect(md).toMatch(/\/research ui/);
    expect(md).toMatch(/UI Direction — UX walkthrough & upgrade \(FEAT-010\)/);
    expect(md).toMatch(/## UX walkthrough log/);
    expect(md).toMatch(/Mô phỏng người dùng cuối/);
    expect(md).toMatch(/UX designer \+ research/);
    expect(md).toMatch(/Stress nội dung & tràn layout/);
    expect(md).toMatch(/Stress findings/);
    expect(md).toMatch(/Stress recipes theo archetype \(ENH-020\)/);
    expect(md).toMatch(/\| \*\*Landing \/ marketing\*\*/);
  });

  test('vp-brainstorm skill references FEAT-010 and /research-ui', () => {
    const md = read('skills/vp-brainstorm/SKILL.md');
    expect(md).toMatch(/FEAT-010/);
    expect(md).toMatch(/ENH-019/);
    expect(md).toMatch(/ENH-020/);
    expect(md).toMatch(/\/research-ui/);
    expect(md).toMatch(/version:\s*0\.6\.3/);
  });

  test('ui-direction user doc documents /research-ui', () => {
    const md = read('docs/user/features/ui-direction.md');
    expect(md).toMatch(/\/research-ui/);
    expect(md).toMatch(/FEAT-010/);
    expect(md).toMatch(/ENH-019/);
    expect(md).toMatch(/ENH-020/);
    expect(md).toMatch(/Stress findings/);
    expect(md).toMatch(/## UX walkthrough log/);
  });
});
