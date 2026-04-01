const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

describe('FEAT-001 Claude Code documentation contracts', () => {
  test('claude-code-setup.md covers CLI, .claude paths, and official docs', () => {
    const md = read('docs/user/claude-code-setup.md');
    expect(md).toMatch(/vp-tools/);
    expect(md).toMatch(/\.claude\/skills/);
    expect(md).toMatch(/code\.claude\.com\/docs\/en\/skills/);
    expect(md).toMatch(/code\.claude\.com\/docs\/en\/claude-directory/);
    expect(md).toMatch(/~\/\.cursor\/skills/);
    expect(md).toMatch(/npx viepilot install/);
    expect(md).toMatch(/\/vp-request/);
    expect(md).toMatch(/\/vp-evolve/);
    expect(md).toMatch(/\/vp-auto/);
  });

  test('doc entrypoints link to claude-code-setup.md', () => {
    expect(read('docs/getting-started.md')).toMatch(/claude-code-setup\.md/);
    expect(read('docs/user/quick-start.md')).toMatch(/claude-code-setup\.md/);
    expect(read('docs/user/faq.md')).toMatch(/claude-code-setup\.md/);
    expect(read('docs/README.md')).toMatch(/claude-code-setup\.md/);
  });
});
