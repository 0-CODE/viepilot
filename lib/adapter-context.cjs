'use strict';

/**
 * ADAPTER_CONTEXT — per-adapter capability map for ViePilot v3.
 *
 * Each adapter entry defines:
 *   tools{}          — canonical tool name for each abstract operation
 *   interactive      — "AUQ" | "text" | "text-plan-only" | "none"
 *   orchestration{}  — parallel dispatch capability
 *   hooks{}          — hook event support
 *   mcp{}            — MCP support constraints
 *   subagent         — "multi-level" | "single-level" | "command-only" | "none"
 *
 * Skills read ADAPTER_CONTEXT instead of maintaining inline compat tables.
 */

const ADAPTER_CONTEXTS = {

  'claude-code': {
    id: 'claude-code',
    name: 'Claude Code',
    tools: {
      shell:        'Bash',
      read:         'Read',
      write:        'Write',
      edit:         'Edit',
      multi_edit:   'MultiEdit',
      search:       'Grep',
      glob:         'Glob',
      ls:           'LS',
      web_search:   'WebSearch',
      web_fetch:    'WebFetch',
      notebook_read: 'NotebookRead',
      notebook_edit: 'NotebookEdit',
      tool_search:  'ToolSearch',
      todo_read:    'TodoRead',
      todo_write:   'TodoWrite',
      agent:        'Agent',
      interactive:  'AskUserQuestion',   // deferred — preload via ToolSearch first
    },
    interactive:  'AUQ',               // must call ToolSearch before first AUQ
    subagent:     'multi-level',        // Agent tool supports nested spawning
    orchestration: {
      mode:            'agent-tool',    // Agent tool = callable from skill
      parallel:        true,
      teams:           true,            // CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
      background:      true,
      model_override:  {
        worker:        'claude-haiku-4-5',
        orchestrator:  'claude-sonnet-4-6',
      },
      max_parallel_tasks: 5,
    },
    hooks: {
      count: 28,
      supported_events: [
        'SessionStart', 'SessionEnd', 'Stop', 'StopFailure',
        'UserPromptSubmit', 'PreToolUse', 'PostToolUse', 'PostToolUseFailure',
        'FileChanged', 'SubagentStart', 'SubagentStop',
        'TaskCreated', 'TaskCompleted', 'PreCompact', 'PostCompact',
      ],
    },
    mcp: { supported: true, tool_limit: null },
    skill_path_project: '.claude/skills',
    skill_path_global:  '~/.claude/skills',
    agents_dir: '.claude/agents',
  },

  'cursor-agent': {
    id: 'cursor-agent',
    name: 'Cursor (Agent Mode)',
    tools: {
      shell:        'run_terminal_cmd',
      read:         'read_file',
      write:        'edit_file',
      edit:         'edit_file',
      multi_edit:   'edit_file',
      search:       'grep_search',
      glob:         'file_search',
      ls:           'list_dir',
      web_search:   'web_search',
      web_fetch:    null,              // not available
      notebook_read: null,
      notebook_edit: null,
      tool_search:  null,
      todo_read:    null,
      todo_write:   null,
      agent:        null,              // /multitask is user command, not callable tool
      interactive:  null,              // AskQuestion only in Plan Mode
    },
    interactive:  'text',              // plain-text numbered list fallback
    subagent:     'command-only',      // /multitask user cmd, single-level, not callable
    orchestration: {
      mode:            'sequential',
      parallel:        false,
      teams:           false,
      background:      false,
      model_override:  null,
      max_parallel_tasks: 1,
    },
    hooks: {
      count: 5,
      supported_events: [
        'beforeShellExecution', 'beforeMCPExecution',
        'beforeReadFile', 'afterFileEdit', 'stop',
      ],
    },
    mcp: { supported: true, tool_limit: 40 },
    skill_path_project: '.cursor/skills',
    skill_path_global:  '~/.cursor/skills',
    agents_dir: null,
  },

  'antigravity': {
    id: 'antigravity',
    name: 'Antigravity (Google)',
    tools: {
      shell:        'shell',
      read:         'file_read',
      write:        'file_write',
      edit:         'file_write',
      multi_edit:   'file_write',
      search:       null,              // via shell or MCP
      glob:         null,              // via shell
      ls:           null,              // via shell
      web_search:   null,              // via MCP plugin
      web_fetch:    null,              // via MCP plugin
      notebook_read: null,
      notebook_edit: null,
      tool_search:  null,
      todo_read:    null,
      todo_write:   null,
      agent:        null,              // async TUI dispatch only
      interactive:  null,             // TUI-based, no formal AUQ
    },
    interactive:  'none',
    subagent:     'none',
    orchestration: {
      mode:            'sequential',
      parallel:        false,
      teams:           false,
      background:      false,
      model_override:  null,
      max_parallel_tasks: 1,
    },
    hooks: {
      count: 3,
      supported_events: ['before_tool', 'after_file_edit', 'session_start'],
    },
    mcp: { supported: true, tool_limit: null },
    skill_path_project: '.agents/skills',
    skill_path_global:  '~/.gemini/antigravity/skills',
    agents_dir: null,
    deprecation_notice: 'Gemini CLI was deprecated June 18, 2026. Use Antigravity CLI instead.',
  },

  'codex': {
    id: 'codex',
    name: 'OpenAI Codex CLI',
    tools: {
      shell:        'container.exec',  // sandboxed shell
      read:         null,              // patch-based — no explicit read tool
      write:        'apply_patch',
      edit:         'apply_patch',
      multi_edit:   'apply_patch',
      search:       null,              // via shell
      glob:         null,              // via shell
      ls:           null,              // via shell
      web_search:   'web_search',      // native or MCP
      web_fetch:    null,
      notebook_read: null,
      notebook_edit: null,
      tool_search:  null,
      todo_read:    null,
      todo_write:   null,
      agent:        'subagent',        // subagents supported
      interactive:  null,             // TUI Tab/Enter injection only
    },
    interactive:  'none',
    subagent:     'single-level',
    orchestration: {
      mode:            'sequential',
      parallel:        false,
      teams:           false,
      background:      false,
      model_override:  null,
      max_parallel_tasks: 1,
    },
    hooks: {
      count: 0,
      supported_events: [],
    },
    mcp: { supported: true, tool_limit: null },
    skill_path_project: null,
    skill_path_global:  '~/.codex',
    agents_dir: null,
  },

  'copilot': {
    id: 'copilot',
    name: 'GitHub Copilot',
    tools: {
      shell:        'runCommands',
      read:         'read',
      write:        'editFiles',
      edit:         'edit',
      multi_edit:   'editFiles',
      search:       'code_search',
      glob:         null,
      ls:           null,
      web_search:   null,
      web_fetch:    null,
      notebook_read: null,
      notebook_edit: null,
      tool_search:  null,
      todo_read:    null,
      todo_write:   null,
      agent:        null,             // explore/task are built-in agents, not callable
      // askQuestions available in main agent ONLY — not in subagents (VS Code #293745)
      interactive:  'askQuestions',
    },
    interactive:  'text',             // askQuestions not available in subagents
    subagent:     'none',
    orchestration: {
      mode:            'sequential',
      parallel:        false,
      teams:           false,
      background:      false,
      model_override:  null,
      max_parallel_tasks: 1,
    },
    hooks: {
      count: 0,
      supported_events: [],
    },
    mcp: { supported: true, tool_limit: null },
    skill_path_project: '.github/agents',
    skill_path_global:  null,
    agents_dir: '.github/agents',
  },
};

// Aliases
ADAPTER_CONTEXTS['cursor'] = ADAPTER_CONTEXTS['cursor-agent'];
ADAPTER_CONTEXTS['cursor-ide'] = ADAPTER_CONTEXTS['cursor-agent'];

/**
 * Get ADAPTER_CONTEXT for a given adapter ID. Throws if unknown.
 */
function getAdapterContext(id) {
  const ctx = ADAPTER_CONTEXTS[id];
  if (!ctx) {
    throw new Error(`Unknown adapter: "${id}". Known: ${Object.keys(ADAPTER_CONTEXTS).filter(k => !['cursor','cursor-ide'].includes(k)).join(', ')}`);
  }
  return ctx;
}

/**
 * List all canonical adapter IDs (no aliases).
 */
function listAdapterIds() {
  return ['claude-code', 'cursor-agent', 'antigravity', 'codex', 'copilot'];
}

/**
 * Detect the active adapter from environment heuristics.
 * Returns the adapter ID string.
 */
function detectAdapter() {
  const env = process.env;

  // Env-var signals (strongest signals first)
  if (env.CURSOR_TRACE || env.CURSOR_CHANNEL || env.CURSOR_ENABLED) return 'cursor-agent';
  if (env.ANTIGRAVITY_SESSION || env.GEMINI_ANTIGRAVITY_SESSION) return 'antigravity';
  if (env.CODEX_SESSION || env.OPENAI_CODEX_SESSION) return 'codex';
  if (env.GITHUB_COPILOT_AGENT || env.COPILOT_AGENT) return 'copilot';

  // TERM_PROGRAM / process name signals
  const termProgram = (env.TERM_PROGRAM || '').toLowerCase();
  if (termProgram === 'claude' || termProgram === 'claude-code') return 'claude-code';

  // ~/.claude directory exists → likely Claude Code
  const os = require('os');
  const fs = require('fs');
  const path = require('path');
  const home = os.homedir();
  if (fs.existsSync(path.join(home, '.claude', 'settings.json'))) return 'claude-code';
  if (fs.existsSync(path.join(home, '.claude'))) return 'claude-code';

  // Fallback: claude-code (most common in ViePilot context)
  return 'claude-code';
}

module.exports = { ADAPTER_CONTEXTS, getAdapterContext, listAdapterIds, detectAdapter };
