'use strict';
const path = require('path');

/**
 * Resolve the output spec for QA agent files given an adapter.
 *
 * @param {string} adapterId - 'claude-code'|'cursor-agent'|'codex'|'antigravity'|'copilot'
 * @param {string} projectRoot - Absolute path to the target project root
 * @returns {object} outputSpec
 */
function resolveOutputSpec(adapterId, projectRoot) {
  switch (adapterId) {
    case 'claude-code':
      return {
        mode: 'multi-file',
        dir: path.join(projectRoot, '.claude', 'agents'),
        orchestratorFile: 'qa-orchestrator.md',
        subagentSuffix: '-scanner.md',
        description: '.claude/agents/ (Claude Code native agents)',
      };
    case 'cursor-agent':
      return {
        mode: 'single-file',
        dir: path.join(projectRoot, '.cursor', 'rules'),
        file: 'qa-checklist.mdc',
        frontmatterRequired: true,
        description: '.cursor/rules/qa-checklist.mdc (Cursor MDC rule)',
      };
    case 'codex':
      return {
        mode: 'append',
        dir: projectRoot,
        file: 'AGENTS.md',
        sectionHeader: '## QA Agent Instructions',
        description: 'AGENTS.md (Codex system instructions)',
      };
    case 'antigravity':
      return {
        mode: 'multi-file',
        dir: path.join(projectRoot, '.agents', 'skills'),
        orchestratorFile: 'qa-orchestrator/SKILL.md',
        description: '.agents/skills/ (Antigravity skills)',
      };
    case 'copilot':
      return {
        mode: 'single-file',
        dir: path.join(projectRoot, '.github', 'agents'),
        file: 'qa-orchestrator.agent.md',
        description: '.github/agents/ (Copilot custom agent)',
      };
    default:
      // Fallback to claude-code
      return resolveOutputSpec('claude-code', projectRoot);
  }
}

/**
 * List the expected output file paths for a given adapter + domain list.
 * Useful for pre-flight checks and test assertions.
 */
function expectedPaths(adapterId, projectRoot, domains = []) {
  const spec = resolveOutputSpec(adapterId, projectRoot);
  if (spec.mode === 'multi-file') {
    return [
      path.join(spec.dir, spec.orchestratorFile),
      ...domains.map(d => path.join(spec.dir, `qa-${d}${spec.subagentSuffix || '.md'}`)),
    ];
  }
  return [path.join(spec.dir, spec.file)];
}

module.exports = { resolveOutputSpec, expectedPaths };
