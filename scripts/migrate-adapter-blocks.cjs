'use strict';
/**
 * Phase 128: Migrate <cursor_skill_adapter> → 5-block <adapter> standard.
 *
 * For each SKILL.md:
 * 1. Extract existing <cursor_skill_adapter> block content
 * 2. Fix the "## C. Tool Usage" line to use Claude Code tool names
 * 3. Wrap content in <adapter id="claude-code">
 * 4. Append 4 more <adapter> blocks for cursor-agent, antigravity, codex, copilot
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SKILLS_DIR = path.join(__dirname, '..', 'skills');

const CURSOR_AGENT_BLOCK = `<adapter id="cursor-agent">
## A. Skill Invocation
Same trigger keywords as claude-code adapter.

## C. Tool Usage
Use Cursor tools: \`run_terminal_cmd\` (shell), \`read_file\` (read), \`edit_file\` (write/edit),
\`grep_search\` (search), \`web_search\`, \`codebase_search\`, \`list_dir\`, \`file_search\`
Interactive: text list fallback (AskQuestion available in Plan Mode only; Agent Mode = text)
Subagent: \`/multitask\` (user command, single-level only — not a callable tool)
MCP limit: 40 tools
</adapter>`;

const ANTIGRAVITY_BLOCK = `<adapter id="antigravity">
## A. Skill Invocation
Same trigger keywords as claude-code adapter.
Skill discovery: LLM-driven (automatic, no slash command needed).

## C. Tool Usage
Use Antigravity tools: \`shell\` (cmd), \`file_read\`, \`file_write\`, MCP plugins
Interactive: text fallback (TUI-based; no formal AskUserQuestion)
Skill path: \`.agents/skills/<skill>/SKILL.md\` (project) or \`~/.gemini/antigravity/skills/\` (global)
Note: Gemini CLI deprecated June 18, 2026 — use Antigravity CLI.
</adapter>`;

const CODEX_BLOCK = `<adapter id="codex">
## A. Skill Invocation
Same trigger keywords as claude-code adapter.

## C. Tool Usage
Use Codex tools: \`container.exec\` (sandboxed shell), \`apply_patch\` (file write), \`web_search\`
Interactive: text fallback (TUI Tab/Enter injection)
Config: \`~/.codex/config.toml\`
</adapter>`;

const COPILOT_BLOCK = `<adapter id="copilot">
## A. Skill Invocation
Same trigger keywords as claude-code adapter.
Discovery: User-driven (\`@agent-name\` in GitHub Copilot Chat).

## C. Tool Usage
Use Copilot tools: \`runCommands\` (shell), \`read\`/\`readfile\` (read), \`edit\`/\`editFiles\` (write),
\`code_search\`, \`find_references\`
Interactive: \`askQuestions\` (main agent only — NOT available in subagents; VS Code issue #293745)
Skill path: \`.github/agents/<name>.agent.md\`
</adapter>`;

const CLAUDE_CODE_TOOL_USAGE = `## C. Tool Usage
Use Claude Code tools: \`Bash\` (shell), \`Read\` (file), \`Edit\` + \`Write\` (file write/patch),
\`Grep\` (search), \`Glob\` (file patterns), \`LS\`, \`WebSearch\`, \`WebFetch\`,
\`Agent\` (spawn subagent — multi-level nesting supported)
Interactive: \`AskUserQuestion\` (deferred — preload via ToolSearch before first call)`;

const SUBAGENT_FIX = `## D. Subagent Spawning
Use \`Agent\` tool for subagent dispatch. For parallel task execution: fan-out with multiple
\`Agent\` calls per cluster (see ADAPTER_CONTEXT.orchestration — claude-code supports parallel: true).`;

let migrated = 0;
let skipped = 0;
let errors = 0;

const skillDirs = fs.readdirSync(SKILLS_DIR).filter(d =>
  fs.existsSync(path.join(SKILLS_DIR, d, 'SKILL.md'))
);

for (const skillDir of skillDirs) {
  const filePath = path.join(SKILLS_DIR, skillDir, 'SKILL.md');
  let content = fs.readFileSync(filePath, 'utf8');

  if (!content.includes('<cursor_skill_adapter>')) {
    console.log(`  SKIP  ${skillDir} (no cursor_skill_adapter)`);
    skipped++;
    continue;
  }

  // Extract cursor_skill_adapter block content
  const startTag = '<cursor_skill_adapter>';
  const endTag = '</cursor_skill_adapter>';
  const startIdx = content.indexOf(startTag);
  const endIdx = content.indexOf(endTag);

  if (startIdx === -1 || endIdx === -1) {
    console.error(`  ERROR ${skillDir}: malformed cursor_skill_adapter tags`);
    errors++;
    continue;
  }

  let blockContent = content.slice(startIdx + startTag.length, endIdx);

  // Fix ## C. Tool Usage line (replace Cursor tool names with Claude Code)
  blockContent = blockContent.replace(
    /## C\. Tool Usage\s*\nUse Cursor tools:[^\n]*/,
    CLAUDE_CODE_TOOL_USAGE
  );

  // Fix Subagent Spawning section (## D) if it mentions Task(subagent_type=...)
  if (blockContent.includes('Task(subagent_type=')) {
    blockContent = blockContent.replace(
      /## D\. Subagent Spawning\s*\nUse `Task\(subagent_type=[^`]*`\)[^\n]*/,
      SUBAGENT_FIX
    );
  }

  // Build claude-code adapter block
  const claudeCodeBlock = `<adapter id="claude-code">${blockContent}</adapter>`;

  // Build the full replacement
  const replacement = [
    claudeCodeBlock,
    CURSOR_AGENT_BLOCK,
    ANTIGRAVITY_BLOCK,
    CODEX_BLOCK,
    COPILOT_BLOCK,
  ].join('\n\n');

  // Replace cursor_skill_adapter block (including tags)
  const before = content.slice(0, startIdx);
  const after = content.slice(endIdx + endTag.length);
  content = before + replacement + after;

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`  OK    ${skillDir}`);
  migrated++;
}

console.log(`\nMigration complete: ${migrated} migrated, ${skipped} skipped, ${errors} errors`);
if (errors > 0) process.exit(1);
