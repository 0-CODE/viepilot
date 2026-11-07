'use strict';

const { ADAPTER_CONTEXTS, getTodoCapability } = require('./adapter-context.cjs');

const POLICY_VERSION = '1.0.0';

/**
 * TOOL_MAP — per-adapter abstract tool mapping.
 * Keys: adapter IDs from ADAPTER_CONTEXTS.
 * Values: object with keys: read, search, edit, write, task, todo_write.
 */
function buildToolMap() {
  const map = {};

  for (const id of Object.keys(ADAPTER_CONTEXTS)) {
    // Skip aliases
    if (['cursor', 'cursor-ide'].includes(id)) continue;

    const ctx = ADAPTER_CONTEXTS[id];

    // Map abstract tools to adapter-specific tools
    map[id] = {
      read: ctx.tools.read || '(shell)',
      search: (ctx.tools.search || ctx.tools.glob || '(shell)'),
      edit: ctx.tools.edit || '(N/A)',
      write: ctx.tools.write || '(N/A)',
      task: ctx.tools.agent || '(N/A)',
      todo_write: getTodoCapability(id).tools[0] || '(N/A)',
    };
  }

  return map;
}

const TOOL_MAP = Object.freeze(buildToolMap());

/**
 * Render the tool policy block for a given adapter ID.
 * Returns a markdown block wrapped in <tool_policy>…</tool_policy>.
 * Throws if adapter ID is unknown.
 */
function renderPolicyBlock(adapterId) {
  // Normalize aliases
  let id = adapterId;
  if (id === 'cursor' || id === 'cursor-ide') id = 'cursor-agent';

  if (!TOOL_MAP[id]) {
    const known = Object.keys(TOOL_MAP).join(', ');
    throw new Error(
      `Unknown adapter in renderPolicyBlock: "${adapterId}". Known: ${known}`
    );
  }

  const tools = TOOL_MAP[id];
  const adapterCtx = ADAPTER_CONTEXTS[id];

  // Build the markdown block
  const lines = [
    '<tool_policy>',
    '',
    `## Tool Policy for ${adapterCtx.name}`,
    '',
    '### Required Tools',
    '',
    '| Operation | Tool |',
    '|---|---|',
    `| Read files | ${tools.read} |`,
    `| Search files | ${tools.search} |`,
    `| Edit files | ${tools.edit} |`,
    `| Create files | ${tools.write} |`,
    `| Run programs (git, npm, vp-tools) | ${adapterCtx.tools.shell} |`,
    `| Track task list | ${tools.todo_write} |`,
  ];

  if (tools.task !== '(N/A)') {
    lines.push(`| Delegate sub-tasks | ${tools.task} |`);
  } else {
    lines.push('| Delegate sub-tasks | Work inline (no callable subagent) |');
  }

  lines.push('');
  lines.push('### Forbidden Patterns');
  lines.push('');
  lines.push('**Do NOT** edit, read, or search files via:');
  lines.push('- File edits: `sed -i`, `perl -pi`, `awk > file`, `> file`, `>> file`, `tee`, `cat <<EOF > file`, Python/Node `writeFileSync`');
  lines.push('- File reads: `cat file`, `head file`, `tail file`, `sed -n`');
  lines.push('- Searches: `grep file`, `find path`, `rg file`');
  lines.push('');
  lines.push('### Allowed Patterns');
  lines.push('');
  lines.push('**Do** use shell for:');
  lines.push('- `git …`, `npm test`, `npx jest …`, `node bin/vp-tools.cjs …`, `ls`, `mkdir -p`');
  lines.push('- Pipes: `… | grep`, `… 2>&1`, `… > /dev/null`');
  lines.push('');
  lines.push('See `templates/tool-policy.md` for full rules and exceptions.');
  lines.push('');
  lines.push('</tool_policy>');

  return lines.join('\n');
}

// Commands that do not read from a pipe: the first command of each `|` pipeline,
// splitting on `&&`, `||` and `;` as well. Later pipe segments are stdin filters.
function leadingCommands(cmdline) {
  const out = [];
  for (const chain of cmdline.split(/&&|\|\||;/)) {
    const first = chain.split('|')[0].trim();
    if (first) out.push(first);
  }
  return out;
}

// Arguments after the command name that are not flags (quotes stripped).
function nonFlagArgs(cmd) {
  return cmd.split(/\s+/).slice(1).filter((t) => t && !t.startsWith('-')).map((t) => t.replace(/^['"]|['"]$/g, ''));
}

/**
 * Classify a bash command for tool-use policy violations.
 * Returns: { violation: bool, kind: 'edit'|'read'|'search'|null, suggestion: string }
 *
 * kind meanings:
 *   'edit'   — attempt to edit/write files via forbidden commands
 *   'read'   — attempt to read files via cat/head/tail/less/more
 *   'search' — attempt to search via grep/find/rg on files
 *   null     — allowed or no clear violation
 */
function classifyBashCommand(cmd) {
  if (!cmd || typeof cmd !== 'string') {
    return { violation: false, kind: null, suggestion: '' };
  }

  const trimmed = cmd.trim();

  // Normalize whitespace for pattern matching
  const normalized = trimmed.replace(/\s+/g, ' ');

  // --- FORBIDDEN EDIT PATTERNS ---

  // sed -i (any form)
  if (/\bsed\s+.*-i\b/.test(normalized) || /\bsed\s+-i/.test(normalized)) {
    return {
      violation: true,
      kind: 'edit',
      suggestion: 'Use Edit tool instead of sed -i',
    };
  }

  // perl -pi or perl -i (any order)
  if (/\bperl\b/.test(normalized)) {
    // Check for -pi flag (combined)
    if (/\s-pi\b/.test(normalized) || /\s-pi\s/.test(normalized)) {
      return {
        violation: true,
        kind: 'edit',
        suggestion: 'Use Edit tool instead of perl -pi or -i',
      };
    }
    // Check for -i flag alone (followed by space or end)
    if (/\s-i\s/.test(normalized) || /\s-i$/.test(normalized)) {
      return {
        violation: true,
        kind: 'edit',
        suggestion: 'Use Edit tool instead of perl -pi or -i',
      };
    }
    // Check for -p ... -i or -i ... -p (separate flags)
    if (/\s-p[\s"].*-i\b/.test(normalized) || /\s-i[\s"].*-p\b/.test(normalized)) {
      return {
        violation: true,
        kind: 'edit',
        suggestion: 'Use Edit tool instead of perl -pi or -i',
      };
    }
  }

  // awk, cut, tr with redirect > file
  if (/\b(awk|cut|tr)\b.*>\s*\S+/.test(normalized)) {
    return {
      violation: true,
      kind: 'edit',
      suggestion: 'Use Edit or Write tool instead of awk/cut/tr > file',
    };
  }

  // Bare > file or >> file redirect (but allow > /dev/null, > /tmp/..., >> /dev/null, 2>&1)
  // We want to catch things like: echo "hello" > myfile.txt
  // But NOT: 2>&1, 2>/dev/null, npm test 2>&1
  // Strategy: match > that's not preceded by a digit (for stderr redirects like 2>)
  const stdoutRedirectMatch = normalized.match(/([^\d&|\s])\s*(>+)\s*(\S+)/);
  if (stdoutRedirectMatch) {
    const target = stdoutRedirectMatch[3];
    // Skip allowed targets
    if (!target.startsWith('/dev/null') && !target.startsWith('/tmp/') &&
        !target.startsWith('/private/tmp/') && target !== '2>&1' && target !== '/dev/stdout' &&
        target !== '/dev/stderr' && target !== '&1' && !target.startsWith('&')) {
      // This looks like a file redirect
      return {
        violation: true,
        kind: 'edit',
        suggestion: `Use Write tool instead of > ${target}`,
      };
    }
  }

  // tee file (write via tee) — but allow tee /dev/null or tee with no args (stdout)
  if (/\btee\s+(\S+)/.test(normalized)) {
    const teeArg = normalized.match(/\btee\s+(\S+)/)[1];
    if (!teeArg.startsWith('/dev/') && !teeArg.startsWith('/tmp/')) {
      return {
        violation: true,
        kind: 'edit',
        suggestion: 'Use Write tool instead of tee file',
      };
    }
  }

  // cat <<EOF > file (heredoc redirect)
  if (/cat\s*<</.test(normalized) && />\s*\S+/.test(normalized)) {
    return {
      violation: true,
      kind: 'edit',
      suggestion: 'Use Write tool instead of cat <<EOF > file',
    };
  }

  // Python with file write: open(..., 'w') or open(..., 'a')
  if (/\b(python|python3)\b/.test(normalized)) {
    if (/open\s*\([^)]*['"](w|a|ab|wb)['"]\)/.test(normalized)) {
      return {
        violation: true,
        kind: 'edit',
        suggestion: 'Use Write/Edit tool instead of Python open(..., w/a)',
      };
    }
  }

  // Node with writeFileSync or appendFileSync
  if (/\bnode\b/.test(normalized)) {
    if (/writeFileSync|appendFileSync/.test(normalized)) {
      return {
        violation: true,
        kind: 'edit',
        suggestion: 'Use Write/Edit tool instead of Node writeFileSync/appendFileSync',
      };
    }
  }

  // --- FORBIDDEN READ PATTERNS ---

  // cat file (but allow cat without args or cat from pipe)
  // Heuristic: cat followed by a word that looks like a file path, not piped
  if (/\bcat\s+\S+/.test(normalized) && !normalized.includes('|')) {
    // cat with an argument that's not piped — likely reading a file
    return {
      violation: true,
      kind: 'read',
      suggestion: 'Use Read tool instead of cat file',
    };
  }

  // head file / tail file (not piped)
  if (/\b(head|tail)\s+\S+/.test(normalized) && !normalized.includes('|')) {
    return {
      violation: true,
      kind: 'read',
      suggestion: 'Use Read tool instead of head/tail file',
    };
  }

  // sed -n … file (read lines via sed) — any sed -n that is not reading a pipe
  for (const cmd of leadingCommands(normalized)) {
    if (/^sed\s/.test(cmd) && /\s-n\b/.test(' ' + cmd.slice(3)) && nonFlagArgs(cmd).length >= 2) {
      return { violation: true, kind: 'read', suggestion: 'Use Read tool instead of sed -n file' };
    }
  }

  // less file / more file (pager)
  if (/\b(less|more)\s+\S+/.test(normalized)) {
    return {
      violation: true,
      kind: 'read',
      suggestion: 'Use Read tool instead of less/more file',
    };
  }

  // --- FORBIDDEN SEARCH PATTERNS ---

  // grep on files (allowed only as a filter reading a pipe: `… | grep x`)
  for (const cmd of leadingCommands(normalized)) {
    if (/^(grep|egrep|fgrep)\s/.test(cmd) && nonFlagArgs(cmd).length >= 1) {
      return { violation: true, kind: 'search', suggestion: 'Use Grep tool instead of grep file' };
    }
  }

  // rg file (ripgrep on files)
  if (/\brg\s+\S+/.test(normalized) && !normalized.includes('|')) {
    return {
      violation: true,
      kind: 'search',
      suggestion: 'Use Grep tool instead of rg file',
    };
  }

  // find path (search files)
  if (/\bfind\s+\S+/.test(normalized)) {
    return {
      violation: true,
      kind: 'search',
      suggestion: 'Use Glob tool instead of find path',
    };
  }

  // --- ALLOWED: no violation detected ---
  return { violation: false, kind: null, suggestion: '' };
}

module.exports = {
  POLICY_VERSION,
  TOOL_MAP,
  renderPolicyBlock,
  classifyBashCommand,
};
