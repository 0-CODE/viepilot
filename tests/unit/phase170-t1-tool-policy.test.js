'use strict';

const {
  POLICY_VERSION,
  TOOL_MAP,
  renderPolicyBlock,
  classifyBashCommand,
} = require('../../lib/tool-policy.cjs');

describe('ENH-125 Tool Policy — POLICY_VERSION', () => {
  test('POLICY_VERSION is defined and a string', () => {
    expect(POLICY_VERSION).toBeDefined();
    expect(typeof POLICY_VERSION).toBe('string');
    expect(POLICY_VERSION.length).toBeGreaterThan(0);
  });
});

describe('ENH-125 Tool Policy — TOOL_MAP', () => {
  test('TOOL_MAP is frozen (immutable)', () => {
    expect(Object.isFrozen(TOOL_MAP)).toBe(true);
  });

  test('TOOL_MAP contains all 5 canonical adapter IDs', () => {
    const expectedIds = ['claude-code', 'cursor-agent', 'antigravity', 'codex', 'copilot'];
    for (const id of expectedIds) {
      expect(TOOL_MAP[id]).toBeDefined();
    }
  });

  test('TOOL_MAP does not include aliases', () => {
    // Aliases should not be keys
    expect(TOOL_MAP['cursor']).toBeUndefined();
    expect(TOOL_MAP['cursor-ide']).toBeUndefined();
  });

  test('each adapter entry has all required abstract tool keys', () => {
    const requiredKeys = ['read', 'search', 'edit', 'write', 'task', 'todo_write'];
    for (const [id, tools] of Object.entries(TOOL_MAP)) {
      for (const key of requiredKeys) {
        expect(tools[key]).toBeDefined();
        expect(typeof tools[key]).toBe('string');
      }
    }
  });

  test('claude-code has Read, Grep, Edit, Write, Task, TodoWrite', () => {
    const cc = TOOL_MAP['claude-code'];
    expect(cc.read).toBe('Read');
    expect(cc.search).toMatch(/(Grep|Glob)/);
    expect(cc.edit).toBe('Edit');
    expect(cc.write).toBe('Write');
    expect(cc.task).toBe('Agent');
    expect(['TodoWrite', 'TaskCreate', 'TaskUpdate', 'TaskList']).toContain(cc.todo_write);
  });

  test('cursor-agent has read_file, grep_search, edit_file', () => {
    const cursor = TOOL_MAP['cursor-agent'];
    expect(cursor.read).toBe('read_file');
    expect(cursor.search).toMatch(/(grep_search|file_search)/);
    expect(cursor.edit).toBe('edit_file');
    expect(cursor.write).toBe('edit_file');
  });

  test('cursor-agent has no callable subagent (task tool is N/A)', () => {
    const cursor = TOOL_MAP['cursor-agent'];
    expect(cursor.task).toBe('(N/A)');
  });

  test('codex has apply_patch, container.exec', () => {
    const codex = TOOL_MAP['codex'];
    expect(codex.edit).toBe('apply_patch');
    expect(codex.write).toBe('apply_patch');
  });

  test('codex has subagent tool', () => {
    const codex = TOOL_MAP['codex'];
    expect(codex.task).toBe('subagent');
  });

  test('copilot has editFiles, none callable subagent', () => {
    const copilot = TOOL_MAP['copilot'];
    expect(['edit', 'editFiles']).toContain(copilot.edit);
    expect(copilot.task).toBe('(N/A)');
  });

  test('antigravity has file_write, no callable subagent', () => {
    const ag = TOOL_MAP['antigravity'];
    expect(ag.write).toBe('file_write');
    expect(ag.edit).toBe('file_write');
    expect(ag.task).toBe('(N/A)');
  });
});

describe('ENH-125 Tool Policy — renderPolicyBlock', () => {
  test('renderPolicyBlock works for claude-code', () => {
    const block = renderPolicyBlock('claude-code');
    expect(block).toContain('<tool_policy>');
    expect(block).toContain('</tool_policy>');
    expect(block).toContain('Claude Code');
    expect(block).toContain('Read');
  });

  test('renderPolicyBlock works for cursor-agent', () => {
    const block = renderPolicyBlock('cursor-agent');
    expect(block).toContain('<tool_policy>');
    expect(block).toContain('Cursor');
    expect(block).toContain('read_file');
  });

  test('renderPolicyBlock works for codex', () => {
    const block = renderPolicyBlock('codex');
    expect(block).toContain('<tool_policy>');
    expect(block).toContain('OpenAI Codex');
    expect(block).toContain('apply_patch');
  });

  test('renderPolicyBlock works for copilot', () => {
    const block = renderPolicyBlock('copilot');
    expect(block).toContain('<tool_policy>');
    expect(block).toContain('GitHub Copilot');
  });

  test('renderPolicyBlock works for antigravity', () => {
    const block = renderPolicyBlock('antigravity');
    expect(block).toContain('<tool_policy>');
    expect(block).toContain('Antigravity');
    expect(block).toContain('file_read');
  });

  test('all renderPolicyBlock outputs have matching tags', () => {
    const ids = ['claude-code', 'cursor-agent', 'codex', 'copilot', 'antigravity'];
    for (const id of ids) {
      const block = renderPolicyBlock(id);
      const openCount = (block.match(/<tool_policy>/g) || []).length;
      const closeCount = (block.match(/<\/tool_policy>/g) || []).length;
      expect(openCount).toBe(1);
      expect(closeCount).toBe(1);
    }
  });

  test('renderPolicyBlock includes tool mapping table', () => {
    const block = renderPolicyBlock('claude-code');
    expect(block).toContain('| Operation | Tool |');
    expect(block).toContain('| Read files |');
    expect(block).toContain('| Search files |');
    expect(block).toContain('| Edit files |');
    expect(block).toContain('| Create files |');
    expect(block).toContain('| Run programs');
    expect(block).toContain('| Track task list |');
  });

  test('renderPolicyBlock for alias "cursor" resolves to cursor-agent', () => {
    const block = renderPolicyBlock('cursor');
    expect(block).toContain('Cursor');
  });

  test('renderPolicyBlock throws for unknown adapter', () => {
    expect(() => renderPolicyBlock('unknown-adapter')).toThrow(/Unknown adapter/);
    expect(() => renderPolicyBlock('unknown-adapter')).toThrow(/Known:/);
  });

  test('renderPolicyBlock includes forbidden patterns section', () => {
    const block = renderPolicyBlock('claude-code');
    expect(block).toContain('Forbidden Patterns');
    expect(block).toContain('sed -i');
    expect(block).toContain('perl -pi');
  });

  test('renderPolicyBlock includes allowed patterns section', () => {
    const block = renderPolicyBlock('claude-code');
    expect(block).toContain('Allowed Patterns');
    expect(block).toContain('git');
    expect(block).toContain('npm');
  });
});

describe('ENH-125 Tool Policy — classifyBashCommand forbidden edits', () => {
  test('flags: sed -i (in-place edit)', () => {
    const result = classifyBashCommand('sed -i "s/foo/bar/" file.txt');
    expect(result.violation).toBe(true);
    expect(result.kind).toBe('edit');
  });

  test('flags: sed with -i flag', () => {
    const result = classifyBashCommand('sed -e "s/a/b/" -i file.txt');
    expect(result.violation).toBe(true);
    expect(result.kind).toBe('edit');
  });

  test('flags: perl -pi (in-place edit)', () => {
    const result = classifyBashCommand('perl -pi -e "s/x/y/" file.txt');
    expect(result.violation).toBe(true);
    expect(result.kind).toBe('edit');
  });

  test('flags: perl -i (in-place edit)', () => {
    const result = classifyBashCommand('perl -i -e "print" file.txt');
    expect(result.violation).toBe(true);
    expect(result.kind).toBe('edit');
  });

  test('flags: awk with redirect > file', () => {
    const result = classifyBashCommand('awk "{print $1}" input.txt > output.txt');
    expect(result.violation).toBe(true);
    expect(result.kind).toBe('edit');
  });

  test('flags: cut with redirect > file', () => {
    const result = classifyBashCommand('cut -d: -f1 /etc/passwd > users.txt');
    expect(result.violation).toBe(true);
    expect(result.kind).toBe('edit');
  });

  test('flags: tr with redirect > file', () => {
    const result = classifyBashCommand('tr "[:lower:]" "[:upper:]" < input.txt > output.txt');
    expect(result.violation).toBe(true);
    expect(result.kind).toBe('edit');
  });

  test('flags: bare > file redirect', () => {
    const result = classifyBashCommand('echo "hello" > myfile.txt');
    expect(result.violation).toBe(true);
    expect(result.kind).toBe('edit');
  });

  test('flags: bare >> file redirect', () => {
    const result = classifyBashCommand('echo "world" >> myfile.txt');
    expect(result.violation).toBe(true);
    expect(result.kind).toBe('edit');
  });

  test('flags: tee file (write via pipe)', () => {
    const result = classifyBashCommand('echo "data" | tee myfile.txt');
    expect(result.violation).toBe(true);
    expect(result.kind).toBe('edit');
  });

  test('flags: cat <<EOF > file (heredoc redirect)', () => {
    const result = classifyBashCommand('cat <<EOF > file.txt\ndata\nEOF');
    expect(result.violation).toBe(true);
    expect(result.kind).toBe('edit');
  });

  test('flags: python open write', () => {
    const result = classifyBashCommand('python -c \'open("file.txt", "w").write("data")\'');
    expect(result.violation).toBe(true);
    expect(result.kind).toBe('edit');
  });

  test('flags: python3 open append', () => {
    const result = classifyBashCommand('python3 -c \'open("file.txt", "a").write("more")\'');
    expect(result.violation).toBe(true);
    expect(result.kind).toBe('edit');
  });

  test('flags: node writeFileSync', () => {
    const result = classifyBashCommand('node -e "require(\'fs\').writeFileSync(\'file.txt\', \'data\')"');
    expect(result.violation).toBe(true);
    expect(result.kind).toBe('edit');
  });

  test('flags: node appendFileSync', () => {
    const result = classifyBashCommand('node -e "require(\'fs\').appendFileSync(\'file.txt\', \'more\')"');
    expect(result.violation).toBe(true);
    expect(result.kind).toBe('edit');
  });
});

describe('ENH-125 Tool Policy — classifyBashCommand forbidden reads', () => {
  test('flags: cat file (read entire file)', () => {
    const result = classifyBashCommand('cat myfile.txt');
    expect(result.violation).toBe(true);
    expect(result.kind).toBe('read');
  });

  test('flags: head file (read beginning)', () => {
    const result = classifyBashCommand('head -20 myfile.txt');
    expect(result.violation).toBe(true);
    expect(result.kind).toBe('read');
  });

  test('flags: tail file (read end)', () => {
    const result = classifyBashCommand('tail -10 myfile.txt');
    expect(result.violation).toBe(true);
    expect(result.kind).toBe('read');
  });

  test('flags: sed -n (read lines via sed)', () => {
    const result = classifyBashCommand('sed -n "1,10p" myfile.txt');
    expect(result.violation).toBe(true);
    expect(result.kind).toBe('read');
  });

  test('flags: less file (pager)', () => {
    const result = classifyBashCommand('less myfile.txt');
    expect(result.violation).toBe(true);
    expect(result.kind).toBe('read');
  });

  test('flags: more file (pager)', () => {
    const result = classifyBashCommand('more myfile.txt');
    expect(result.violation).toBe(true);
    expect(result.kind).toBe('read');
  });
});

describe('ENH-125 Tool Policy — classifyBashCommand forbidden searches', () => {
  test('flags: grep file (search in file)', () => {
    const result = classifyBashCommand('grep "pattern" myfile.txt');
    expect(result.violation).toBe(true);
    expect(result.kind).toBe('search');
  });

  test('flags: rg file (ripgrep on file)', () => {
    const result = classifyBashCommand('rg "pattern" myfile.txt');
    expect(result.violation).toBe(true);
    expect(result.kind).toBe('search');
  });

  test('flags: find path (find files)', () => {
    const result = classifyBashCommand('find . -name "*.js"');
    expect(result.violation).toBe(true);
    expect(result.kind).toBe('search');
  });
});

describe('ENH-125 Tool Policy — classifyBashCommand allowed commands', () => {
  test('allows: git command', () => {
    const result = classifyBashCommand('git status');
    expect(result.violation).toBe(false);
  });

  test('allows: git add', () => {
    const result = classifyBashCommand('git add file.txt');
    expect(result.violation).toBe(false);
  });

  test('allows: git commit', () => {
    const result = classifyBashCommand('git commit -m "message"');
    expect(result.violation).toBe(false);
  });

  test('allows: npm test', () => {
    const result = classifyBashCommand('npm test');
    expect(result.violation).toBe(false);
  });

  test('allows: npm run script', () => {
    const result = classifyBashCommand('npm run build');
    expect(result.violation).toBe(false);
  });

  test('allows: npx jest', () => {
    const result = classifyBashCommand('npx jest --coverage');
    expect(result.violation).toBe(false);
  });

  test('allows: node bin/vp-tools.cjs', () => {
    const result = classifyBashCommand('node bin/vp-tools.cjs config get tools.policy');
    expect(result.violation).toBe(false);
  });

  test('allows: node scripts/*.cjs', () => {
    const result = classifyBashCommand('node scripts/build.cjs');
    expect(result.violation).toBe(false);
  });

  test('allows: ls command', () => {
    const result = classifyBashCommand('ls -la /some/dir');
    expect(result.violation).toBe(false);
  });

  test('allows: mkdir -p', () => {
    const result = classifyBashCommand('mkdir -p some/nested/dir');
    expect(result.violation).toBe(false);
  });

  test('allows: python scripts (non-write)', () => {
    const result = classifyBashCommand('python scripts/office/validate.py deck.pptx');
    expect(result.violation).toBe(false);
  });

  test('allows: grep in pipe (not on files)', () => {
    const result = classifyBashCommand('npm test 2>&1 | grep "Tests:"');
    expect(result.violation).toBe(false);
  });

  test('allows: node -e without writes', () => {
    const result = classifyBashCommand('node -e "console.log(require(\'./lib/tool-policy.cjs\').POLICY_VERSION)"');
    expect(result.violation).toBe(false);
  });

  test('allows: redirect to /dev/null', () => {
    const result = classifyBashCommand('npm run build > /dev/null 2>&1');
    expect(result.violation).toBe(false);
  });

  test('allows: redirect 2>&1', () => {
    const result = classifyBashCommand('npm test 2>&1');
    expect(result.violation).toBe(false);
  });

  test('allows: cat without arguments (stdout)', () => {
    const result = classifyBashCommand('cat');
    expect(result.violation).toBe(false);
  });

  test('allows: cat in a pipe (not reading file)', () => {
    const result = classifyBashCommand('git show HEAD:file.txt | cat');
    expect(result.violation).toBe(false);
  });
});

describe('ENH-125 Tool Policy — classifyBashCommand edge cases', () => {
  test('returns false for empty command', () => {
    const result = classifyBashCommand('');
    expect(result.violation).toBe(false);
  });

  test('returns false for null', () => {
    const result = classifyBashCommand(null);
    expect(result.violation).toBe(false);
  });

  test('returns false for undefined', () => {
    const result = classifyBashCommand(undefined);
    expect(result.violation).toBe(false);
  });

  test('includes suggestion in violation result', () => {
    const result = classifyBashCommand('sed -i "s/a/b/" file.txt');
    expect(result.violation).toBe(true);
    expect(result.suggestion).toBeTruthy();
    expect(typeof result.suggestion).toBe('string');
  });

  test('includes empty suggestion for allowed commands', () => {
    const result = classifyBashCommand('npm test');
    expect(result.violation).toBe(false);
    expect(result.suggestion).toBe('');
  });

  test('handles whitespace variation: sed with multiple spaces', () => {
    const result = classifyBashCommand('sed    -i    "s/x/y/"    file.txt');
    expect(result.violation).toBe(true);
  });

  test('detects violation in complex piped command', () => {
    // Last command in pipe is sed -i
    const result = classifyBashCommand('cat input.txt | sed -i "s/a/b/"');
    expect(result.violation).toBe(true);
  });
});

describe('ENH-125 Tool Policy — integration', () => {
  test('TOOL_MAP and renderPolicyBlock are consistent', () => {
    const ids = Object.keys(TOOL_MAP);
    expect(ids.length).toBeGreaterThanOrEqual(5);

    for (const id of ids) {
      const block = renderPolicyBlock(id);
      const tools = TOOL_MAP[id];

      // Block should mention at least some of the tools
      expect(block).toContain(tools.read);
      if (tools.edit !== '(N/A)') {
        expect(block).toContain(tools.edit);
      }
    }
  });

  test('has at least 12 distinct forbidden edit patterns detected', () => {
    const forbiddenEdits = [
      'sed -i "s/a/b/" f.txt',
      'sed -e "x" -i f.txt',
      'perl -pi -e "s/x/y/" f.txt',
      'perl -i -e "print" f.txt',
      'awk "{print}" < f.txt > g.txt',
      'cut -d: -f1 f.txt > g.txt',
      'tr a b < f.txt > g.txt',
      'echo x > f.txt',
      'echo x >> f.txt',
      'echo x | tee f.txt',
      'cat <<EOF > f.txt\nx\nEOF',
      'python -c \'open("f", "w").write("x")\'',
      'python3 -c \'open("f", "a").write("x")\'',
      'node -e "require(\'fs\').writeFileSync(\'f\', \'x\')"',
    ];

    const violations = forbiddenEdits.filter(cmd => {
      const result = classifyBashCommand(cmd);
      return result.violation && result.kind === 'edit';
    });

    expect(violations.length).toBeGreaterThanOrEqual(12);
  });

  test('allows at least 10 distinct allowed patterns', () => {
    const allowedCmds = [
      'git status',
      'git add file.txt',
      'git commit -m "msg"',
      'npm test',
      'npm run build',
      'npx jest --coverage',
      'node bin/vp-tools.cjs config get',
      'node scripts/build.cjs',
      'ls -la',
      'mkdir -p dir',
      'python scripts/office/validate.py deck.pptx',
      'npm test 2>&1 | grep "Tests:"',
      'node -e "require(\'./lib\').test"',
      'cat > /dev/null',
      'npm run lint 2>&1',
    ];

    const allowed = allowedCmds.filter(cmd => {
      const result = classifyBashCommand(cmd);
      return !result.violation;
    });

    expect(allowed.length).toBeGreaterThanOrEqual(10);
  });
});

describe('phase170-t1: review probes — unquoted sed -n and grep on paths', () => {
  const { classifyBashCommand } = require('../../lib/tool-policy.cjs');
  test.each(['sed -n 1,20p a.md', "sed -n '5,9p' a.md", 'grep -rn foo lib', 'grep foo file.md', 'cd x && grep -r foo .'])(
    'flags %s', (cmd) => expect(classifyBashCommand(cmd).violation).toBe(true));
  test.each(['npm test 2>&1 | grep Tests:', 'git log --oneline | grep vp-p', 'git status --porcelain | grep -v x', 'echo a | sed -n 1p'])(
    'allows pipe filter %s', (cmd) => expect(classifyBashCommand(cmd).violation).toBe(false));
});
