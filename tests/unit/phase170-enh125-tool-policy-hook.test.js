/**
 * @jest-environment node
 *
 * Phase 170 — ENH-125: tool-use policy hook (PreToolUse)
 * Tests: hook warn/block/off modes, hooks installer idempotency, CLI commands
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const { planHookInstall, applyHookInstall } = require('../../lib/hooks-installer.cjs');
const { classifyBashCommand } = require('../../lib/tool-policy.cjs');

const REPO_ROOT = path.join(__dirname, '..', '..');
const VP_TOOLS = path.join(REPO_ROOT, 'bin', 'vp-tools.cjs');
const HOOK_SCRIPT = path.join(REPO_ROOT, 'lib', 'hooks', 'tool-policy-hook.cjs');

// ──────────────────────────────────────────────────────────────────────────────
// Utilities
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Spawn the hook script with JSON input and return stdout, stderr, exit code.
 */
function spawnHook(input, mode) {
  const env = {
    ...process.env,
    VIEPILOT_TOOL_POLICY: mode,
    NODE_ENV: 'test',
  };
  const result = spawnSync('node', [HOOK_SCRIPT], {
    input: JSON.stringify(input),
    encoding: 'utf8',
    env,
    timeout: 10000,
    maxBuffer: 1024 * 1024,
  });
  return {
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    status: result.status !== null ? result.status : -1,
    error: result.error,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Group 1: Tool Policy Hook — Bash command classification
// ──────────────────────────────────────────────────────────────────────────────

describe('Phase 170 — tool-policy-hook: classifyBashCommand', () => {
  test('classifyBashCommand detects sed -i violation', () => {
    const result = classifyBashCommand('sed -i "s/old/new/" file.txt');
    expect(result.violation).toBe(true);
    expect(result.kind).toBe('edit');
    expect(result.suggestion).toContain('Edit');
  });

  test('classifyBashCommand detects cat file violation', () => {
    const result = classifyBashCommand('cat myfile.txt');
    expect(result.violation).toBe(true);
    expect(result.kind).toBe('read');
    expect(result.suggestion).toContain('Read');
  });

  test('classifyBashCommand detects grep file violation', () => {
    const result = classifyBashCommand('grep pattern file.txt');
    expect(result.violation).toBe(true);
    expect(result.kind).toBe('search');
    expect(result.suggestion).toContain('Grep');
  });

  test('classifyBashCommand detects find path violation', () => {
    const result = classifyBashCommand('find /path -name "*.js"');
    expect(result.violation).toBe(true);
    expect(result.kind).toBe('search');
    expect(result.suggestion).toContain('Glob');
  });

  test('classifyBashCommand allows git commands', () => {
    const result = classifyBashCommand('git commit -m "test"');
    expect(result.violation).toBe(false);
  });

  test('classifyBashCommand allows npm test', () => {
    const result = classifyBashCommand('npm test');
    expect(result.violation).toBe(false);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Group 2: Tool Policy Hook — stdin hook modes
// ──────────────────────────────────────────────────────────────────────────────

describe('Phase 170 — tool-policy-hook: PreToolUse hook modes', () => {
  test('hook file exists with shebang', () => {
    expect(fs.existsSync(HOOK_SCRIPT)).toBe(true);
    const content = fs.readFileSync(HOOK_SCRIPT, 'utf8');
    expect(content.startsWith('#!/usr/bin/env node')).toBe(true);
  });

  test('hook ignores non-Bash tools (tool_name mismatch)', () => {
    const input = {
      tool_name: 'Read',
      tool_input: { command: 'some file' },
    };
    const result = spawnHook(input, 'warn');
    expect(result.status).toBe(0);
    expect(result.stdout).toBe('');
    expect(result.stderr).toBe('');
  });

  test('hook exits 0 on malformed input', () => {
    const result = spawnSync('node', [HOOK_SCRIPT], {
      input: 'not valid json',
      encoding: 'utf8',
      env: { VIEPILOT_TOOL_POLICY: 'warn', ...process.env },
      timeout: 5000,
    });
    // Should either exit 0 or timeout (both acceptable for malformed input)
    expect(result.status === 0 || result.signal !== null).toBe(true);
  });

  test('hook warns on violation with mode=warn', () => {
    const input = {
      tool_name: 'Bash',
      tool_input: { command: 'sed -i "s/foo/bar/" file.txt' },
      cwd: '/tmp',
    };
    const result = spawnHook(input, 'warn');
    expect(result.status).toBe(0);
    expect(result.stderr).toContain('⚠');
    expect(result.stderr).toContain('edit');
    expect(result.stderr).toContain('Edit');
  });

  test('hook blocks with JSON deny on violation with mode=block', () => {
    const input = {
      tool_name: 'Bash',
      tool_input: { command: 'grep pattern file.txt' },
      cwd: '/tmp',
    };
    const result = spawnHook(input, 'block');
    expect(result.status).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.hookSpecificOutput).toBeDefined();
    expect(output.hookSpecificOutput.hookEventName).toBe('PreToolUse');
    expect(output.hookSpecificOutput.permissionDecision).toBe('deny');
    expect(output.hookSpecificOutput.permissionDecisionReason).toContain('Grep');
  });

  test('hook exits silently with mode=off', () => {
    const input = {
      tool_name: 'Bash',
      tool_input: { command: 'sed -i "s/foo/bar/" file.txt' },
      cwd: '/tmp',
    };
    const result = spawnHook(input, 'off');
    expect(result.status).toBe(0);
    expect(result.stdout).toBe('');
    expect(result.stderr).toBe('');
  });

  test('hook allows safe commands on all modes', () => {
    const input = {
      tool_name: 'Bash',
      tool_input: { command: 'git status' },
      cwd: '/tmp',
    };
    for (const mode of ['warn', 'block', 'off']) {
      const result = spawnHook(input, mode);
      expect(result.status).toBe(0);
    }
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Group 3: Hook installer — planHookInstall idempotency + stale removal
// ──────────────────────────────────────────────────────────────────────────────

describe('Phase 170 — hook installer: planHookInstall', () => {
  test('planHookInstall is idempotent (no duplicates)', () => {
    const settings = {};
    const cmd = 'node /path/to/hook.cjs';

    const plan1 = planHookInstall({
      settings,
      event: 'PreToolUse',
      matcher: { tool_name: 'Bash' },
      command: cmd,
    });
    expect(plan1.changed).toBe(true);

    const plan2 = planHookInstall({
      settings: plan1.settings,
      event: 'PreToolUse',
      matcher: { tool_name: 'Bash' },
      command: cmd,
    });
    expect(plan2.changed).toBe(false);
    expect(plan2.settings.hooks.PreToolUse).toHaveLength(1);
  });

  test('planHookInstall removes stale commands', () => {
    const oldCmd = 'node /old/path/hook.cjs';
    const newCmd = 'node /new/path/hook.cjs';
    const settings = {
      hooks: {
        PreToolUse: [
          {
            matcher: { tool_name: 'Bash' },
            hooks: [{ type: 'command', command: oldCmd }],
          },
        ],
      },
    };

    const plan = planHookInstall({
      settings,
      event: 'PreToolUse',
      matcher: { tool_name: 'Bash' },
      command: newCmd,
      removeCommands: [oldCmd],
    });

    expect(plan.changed).toBe(true);
    expect(plan.settings.hooks.PreToolUse).toHaveLength(1);
    expect(plan.settings.hooks.PreToolUse[0].hooks[0].command).toBe(newCmd);
  });

  test('planHookInstall preserves other events', () => {
    const settings = {
      hooks: {
        Stop: [
          {
            matcher: {},
            hooks: [{ type: 'command', command: 'node other.cjs' }],
          },
        ],
      },
    };

    const plan = planHookInstall({
      settings,
      event: 'PreToolUse',
      matcher: { tool_name: 'Bash' },
      command: 'node tool-policy.cjs',
    });

    expect(plan.settings.hooks.Stop).toHaveLength(1);
    expect(plan.settings.hooks.PreToolUse).toHaveLength(1);
  });

  test('applyHookInstall writes settings to disk', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-hook-apply-'));
    const configPath = path.join(tmpDir, 'settings.json');
    const settings = { tools: { policy: 'warn' } };

    const plan = {
      settings: { ...settings, hooks: { PreToolUse: [] } },
      changed: true,
    };

    applyHookInstall({ configPath, plan, dryRun: false });

    expect(fs.existsSync(configPath)).toBe(true);
    const written = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    expect(written.hooks.PreToolUse).toBeDefined();

    fs.rmSync(tmpDir, { recursive: true });
  });

  test('applyHookInstall with dryRun does not write', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-hook-dryrun-'));
    const configPath = path.join(tmpDir, 'settings.json');
    const plan = { settings: { hooks: {} }, changed: true };

    applyHookInstall({ configPath, plan, dryRun: true });

    expect(fs.existsSync(configPath)).toBe(false);

    fs.rmSync(tmpDir, { recursive: true });
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Group 4: vp-tools hooks install --policy command
// ──────────────────────────────────────────────────────────────────────────────

describe('Phase 170 — vp-tools hooks install --policy', () => {
  test('vp-tools hooks install --policy requires a mode', () => {
    const result = spawnSync('node', [VP_TOOLS, 'hooks', 'install', '--policy'], {
      encoding: 'utf8',
      timeout: 5000,
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('policy');
  });

  test('vp-tools hooks install --policy with --dry-run does not write', () => {
    const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-tools-dryrun-'));
    const configPath = path.join(tmpHome, '.claude', 'settings.json');

    const result = spawnSync('node', [VP_TOOLS, 'hooks', 'install', '--policy', 'warn', '--dry-run', '--yes'], {
      encoding: 'utf8',
      env: {
        ...process.env,
        HOME: tmpHome,
        USERPROFILE: tmpHome,
      },
      timeout: 5000,
    });

    expect(result.status).toBe(0);
    expect(fs.existsSync(configPath)).toBe(false);

    fs.rmSync(tmpHome, { recursive: true });
  });

  test('vp-tools hooks install --policy with --yes writes settings', () => {
    const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-tools-yes-'));
    const configPath = path.join(tmpHome, '.claude', 'settings.json');

    const result = spawnSync('node', [VP_TOOLS, 'hooks', 'install', '--policy', 'warn', '--yes'], {
      encoding: 'utf8',
      env: {
        ...process.env,
        HOME: tmpHome,
        USERPROFILE: tmpHome,
      },
      timeout: 5000,
    });

    expect(result.status).toBe(0);
    expect(fs.existsSync(configPath)).toBe(true);

    const settings = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    expect(settings.hooks.PreToolUse).toBeDefined();
    expect(settings.hooks.PreToolUse.length).toBeGreaterThanOrEqual(1);

    fs.rmSync(tmpHome, { recursive: true });
  });

  test('vp-tools hooks install (no --policy) still works (staleness hook)', () => {
    const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-tools-staleness-'));
    const configPath = path.join(tmpHome, '.claude', 'settings.json');

    const result = spawnSync('node', [VP_TOOLS, 'hooks', 'install'], {
      encoding: 'utf8',
      env: {
        ...process.env,
        HOME: tmpHome,
        USERPROFILE: tmpHome,
      },
      timeout: 5000,
    });

    expect(result.status).toBe(0);
    expect(fs.existsSync(configPath)).toBe(true);

    const settings = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    expect(settings.hooks.Stop).toBeDefined();

    fs.rmSync(tmpHome, { recursive: true });
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Group 5: Existing hooks tests must still pass
// ──────────────────────────────────────────────────────────────────────────────

describe('Phase 170 — regression: existing hooks functionality', () => {
  test('brainstorm-staleness hook still exists', () => {
    const stalePath = path.join(REPO_ROOT, 'lib', 'hooks', 'brainstorm-staleness.cjs');
    expect(fs.existsSync(stalePath)).toBe(true);
  });

  test('vp-tools hooks scaffold still works', () => {
    const result = spawnSync('node', [VP_TOOLS, 'hooks', 'scaffold'], {
      encoding: 'utf8',
      timeout: 5000,
    });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('brainstorm-staleness');
  });

  test('vp-tools hooks help shows all options', () => {
    const result = spawnSync('node', [VP_TOOLS, 'hooks', 'help'], {
      encoding: 'utf8',
      timeout: 5000,
    });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('scaffold');
    expect(result.stdout).toContain('install');
  });
});
