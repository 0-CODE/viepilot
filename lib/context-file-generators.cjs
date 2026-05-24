'use strict';
const fs = require('fs');
const path = require('path');

/**
 * Read a .viepilot/ source file, return '' if missing.
 */
function readSource(projectRoot, relPath) {
  try {
    return fs.readFileSync(path.join(projectRoot, relPath), 'utf8');
  } catch { return ''; }
}

/**
 * Build the shared core block used by all adapters.
 * Sources: AI-GUIDE.md, PROJECT-CONTEXT.md, SYSTEM-RULES.md, STACKS.md
 */
function buildCoreBlock(projectRoot) {
  const meta    = readSource(projectRoot, '.viepilot/PROJECT-META.md');
  const guide   = readSource(projectRoot, '.viepilot/AI-GUIDE.md');
  const context = readSource(projectRoot, '.viepilot/PROJECT-CONTEXT.md');
  const rules   = readSource(projectRoot, '.viepilot/SYSTEM-RULES.md');
  const stacks  = readSource(projectRoot, '.viepilot/STACKS.md');

  // Extract project name from PROJECT-META.md header or package.json
  let projectName = 'Project';
  const nameMatch = meta.match(/^#\s+(.+)/m);
  if (nameMatch) projectName = nameMatch[1].trim();
  else {
    try {
      projectName = require(path.join(projectRoot, 'package.json')).name || 'Project';
    } catch { /* noop */ }
  }

  return { projectName, guide, context, rules, stacks };
}

/**
 * CLAUDE.md — Claude Code context file (full Markdown, no frontmatter)
 */
function generateClaudeMd(projectRoot) {
  const { projectName, guide, context, rules, stacks } = buildCoreBlock(projectRoot);
  const sections = [];
  sections.push(`# ${projectName} — Claude Code Context\n`);
  if (guide)   sections.push(`## Navigation\n\n${guide}`);
  if (context) sections.push(`## Domain Context\n\n${context}`);
  if (rules)   sections.push(`## Coding Standards\n\n${rules}`);
  if (stacks)  sections.push(`## Stack\n\n${stacks}`);
  sections.push(`\n## ViePilot Workflow\n\n` +
    `- Run \`/vp-auto\` to execute planned phases\n` +
    `- Run \`/vp-request\` to log bugs or features\n` +
    `- Current state: \`.viepilot/TRACKER.md\`\n`);
  return sections.join('\n\n---\n\n');
}

/**
 * GEMINI.md — Antigravity / Gemini CLI context file
 */
function generateGeminiMd(projectRoot) {
  // Same structure as CLAUDE.md; different header note
  const content = generateClaudeMd(projectRoot);
  return content.replace('Claude Code Context', 'Gemini / Antigravity Context');
}

/**
 * AGENTS.md — Codex CLI context file
 * Codex is patch-based + sequential; emphasize apply_patch conventions
 */
function generateAgentsMd(projectRoot) {
  const { projectName, context, rules, stacks } = buildCoreBlock(projectRoot);
  const sections = [];
  sections.push(`# ${projectName} — Codex Agent Instructions\n`);
  sections.push(`## Conventions\n\n` +
    `- Use \`apply_patch\` for all file edits\n` +
    `- No interactive prompts — work sequentially\n` +
    `- Commit after each logical unit\n`);
  if (context) sections.push(`## Domain Context\n\n${context}`);
  if (rules)   sections.push(`## Coding Standards\n\n${rules}`);
  if (stacks)  sections.push(`## Stack\n\n${stacks}`);
  sections.push(`\n## ViePilot\n\nPhase state: \`.viepilot/TRACKER.md\`\n`);
  return sections.join('\n\n---\n\n');
}

/**
 * .cursorrules — Cursor legacy flat-file format
 */
function generateCursorRules(projectRoot) {
  const { projectName, context, rules, stacks } = buildCoreBlock(projectRoot);
  const parts = [`# ${projectName} — Cursor Rules\n`];
  if (rules)   parts.push(rules);
  if (context) parts.push(`## Domain\n\n${context}`);
  if (stacks)  parts.push(`## Stack\n\n${stacks}`);
  return parts.join('\n\n');
}

/**
 * .cursor/rules/viepilot-context.mdc — Cursor new MDC format
 */
function generateCursorMdc(projectRoot) {
  const body = generateCursorRules(projectRoot)
    .replace(/^# .+\n/, ''); // strip header — MDC description field covers it
  const { projectName } = buildCoreBlock(projectRoot);
  return `---
description: ${projectName} coding standards and architecture context
globs: ["**/*"]
alwaysApply: true
---

${body}`;
}

/**
 * .github/copilot-instructions.md — GitHub Copilot
 * Copilot has shorter context; be concise, focus on coding standards
 */
function generateCopilotInstructions(projectRoot) {
  const { projectName, rules, stacks } = buildCoreBlock(projectRoot);
  const parts = [`# Copilot Instructions — ${projectName}\n`];
  if (rules)  parts.push(rules);
  if (stacks) parts.push(`## Stack\n\n${stacks}`);
  return parts.join('\n\n');
}

/**
 * Generate all 5 adapter context files.
 * Returns { path: string, content: string }[] — caller writes them.
 */
function generateAll(projectRoot) {
  return [
    { path: 'CLAUDE.md',                             content: generateClaudeMd(projectRoot) },
    { path: 'GEMINI.md',                             content: generateGeminiMd(projectRoot) },
    { path: 'AGENTS.md',                             content: generateAgentsMd(projectRoot) },
    { path: '.cursorrules',                          content: generateCursorRules(projectRoot) },
    { path: '.cursor/rules/viepilot-context.mdc',   content: generateCursorMdc(projectRoot) },
    { path: '.github/copilot-instructions.md',       content: generateCopilotInstructions(projectRoot) },
  ];
}

module.exports = {
  generateClaudeMd,
  generateGeminiMd,
  generateAgentsMd,
  generateCursorRules,
  generateCursorMdc,
  generateCopilotInstructions,
  generateAll,
};
