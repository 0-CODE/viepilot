'use strict';

const fs = require('fs');
const path = require('path');
const { renderPolicyBlock, renderCombinedPolicyBlock, TOOL_MAP } = require('./tool-policy.cjs');

const ADAPTER_IDS = Object.keys(TOOL_MAP);

/**
 * Generate the tool policy block for SKILL.md files.
 * Includes all 5 adapters in a single section.
 */
function generateSkillPolicyBlock() {
  return [
    '<!-- tool-policy:start -->',
    '## Tool Policy (ENH-125)',
    '',
    renderCombinedPolicyBlock(),
    '<!-- tool-policy:end -->',
  ].join('\n');
}

/**
 * Generate the tool policy block for agent files (claude-code + generic).
 */
function generateAgentPolicyBlock(isReadOnly = false) {
  const lines = [
    '<!-- tool-policy:start -->',
    '',
    '## Tool Policy (ENH-125)',
    '',
    renderPolicyBlock('claude-code'),
    '',
  ];

  if (isReadOnly) {
    lines.push('**Note**: This read-only agent operates under restricted tool access.');
    lines.push('Bash is for running commands only (tests, git, node); never for reading, searching or editing files.');
    lines.push('');
  }

  lines.push('<!-- tool-policy:end -->');

  return lines.join('\n');
}

/**
 * Generate the one-line reference for workflows.
 */
function generateWorkflowPolicyLine() {
  return 'Tool policy: follow `<tool_policy>` in the invoking skill (source: templates/tool-policy.md)';
}

/**
 * Insert or replace a policy block between markers in a file.
 * Returns true if file was modified.
 */
function updateFileWithPolicy(filePath, policyBlock) {
  const content = fs.readFileSync(filePath, 'utf8');
  const startMarker = '<!-- tool-policy:start -->';
  const endMarker = '<!-- tool-policy:end -->';

  const hasStart = content.includes(startMarker);
  const hasEnd = content.includes(endMarker);

  let newContent;

  if (hasStart && hasEnd) {
    // Replace existing block
    const startIdx = content.indexOf(startMarker);
    const endIdx = content.indexOf(endMarker) + endMarker.length;
    newContent = content.slice(0, startIdx) + policyBlock + content.slice(endIdx);
  } else if (hasStart || hasEnd) {
    // Malformed markers — don't touch
    return false;
  } else {
    // Insert new block at the end
    const trimmed = content.trimEnd();
    newContent = trimmed + '\n\n' + policyBlock;
  }

  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent);
    return true;
  }

  return false;
}

/**
 * Sync policy block into a SKILL.md file.
 * Inserts after last </adapter> tag if not already present.
 */
function syncSkillFile(skillPath) {
  const content = fs.readFileSync(skillPath, 'utf8');
  const policyBlock = generateSkillPolicyBlock();

  // Find the position of the last </adapter> tag
  const lastAdapterEnd = content.lastIndexOf('</adapter>');

  let newContent;
  if (content.includes('<!-- tool-policy:start -->')) {
    // Already has markers — use the standard update
    const startMarker = '<!-- tool-policy:start -->';
    const endMarker = '<!-- tool-policy:end -->';
    const startIdx = content.indexOf(startMarker);
    const endIdx = content.indexOf(endMarker) + endMarker.length;
    newContent = content.slice(0, startIdx) + policyBlock + content.slice(endIdx);
  } else if (lastAdapterEnd >= 0) {
    // Insert after last </adapter>
    const insertPos = lastAdapterEnd + '</adapter>'.length;
    newContent = content.slice(0, insertPos) + '\n\n' + policyBlock + content.slice(insertPos);
  } else {
    // No adapter tags found — append at end
    newContent = content.trimEnd() + '\n\n' + policyBlock;
  }

  if (newContent !== content) {
    fs.writeFileSync(skillPath, newContent);
    return true;
  }

  return false;
}

/**
 * Sync policy block into agent files.
 */
function syncAgentFile(agentPath, isReadOnly = false) {
  return updateFileWithPolicy(agentPath, generateAgentPolicyBlock(isReadOnly));
}

/**
 * Sync policy reference into a workflow file.
 * Inserts after the first heading (## or #).
 */
function syncWorkflowFile(workflowPath) {
  const content = fs.readFileSync(workflowPath, 'utf8');
  const policyLine = generateWorkflowPolicyLine();

  // Check if already has the reference
  if (content.includes(policyLine)) {
    return false;
  }

  // Find the first heading
  const headingMatch = content.match(/^#+\s+.+$/m);
  if (!headingMatch) {
    // No heading found — append at the end
    const newContent = content.trimEnd() + '\n\n' + policyLine;
    fs.writeFileSync(workflowPath, newContent);
    return true;
  }

  const headingEnd = content.indexOf(headingMatch[0]) + headingMatch[0].length;
  const newContent =
    content.slice(0, headingEnd) + '\n' + policyLine + content.slice(headingEnd);

  if (newContent !== content) {
    fs.writeFileSync(workflowPath, newContent);
    return true;
  }

  return false;
}

/**
 * Sync all policy blocks across the project.
 * Returns a list of modified files.
 */
function syncAll(projectRoot, checkOnly = false) {
  const modified = [];

  // Sync SKILL.md files
  const skillsDir = path.join(projectRoot, 'skills');
  if (fs.existsSync(skillsDir)) {
    const skills = fs.readdirSync(skillsDir);
    for (const skill of skills) {
      const skillPath = path.join(skillsDir, skill, 'SKILL.md');
      if (fs.existsSync(skillPath)) {
        const wouldChange = checkOnly
          ? !hasCorrectPolicy(skillPath, 'skill')
          : syncSkillFile(skillPath);
        if (wouldChange) {
          modified.push(skillPath);
        }
      }
    }
  }

  // Sync agent files (claude-code/*)
  const agentsClaudeDir = path.join(projectRoot, 'agents', 'claude-code');
  if (fs.existsSync(agentsClaudeDir)) {
    const agents = fs.readdirSync(agentsClaudeDir).filter(f => f.endsWith('.md'));
    for (const agent of agents) {
      const agentPath = path.join(agentsClaudeDir, agent);
      const readOnly = ['vp-phase-planner.md', 'vp-quality-gate.md', 'file-scanner-agent.md'].includes(agent);
      const wouldChange = checkOnly
        ? !hasCorrectPolicy(agentPath, readOnly ? 'agent-readonly' : 'agent')
        : syncAgentFile(agentPath, readOnly);
      if (wouldChange) {
        modified.push(agentPath);
      }
    }
  }

  // Sync generic agent files
  const agentsDir = path.join(projectRoot, 'agents');
  if (fs.existsSync(agentsDir)) {
    const agents = fs.readdirSync(agentsDir)
      .filter(f => f.endsWith('.md') && !['qa-templates'].includes(f));
    for (const agent of agents) {
      const agentPath = path.join(agentsDir, agent);
      const readOnly = ['file-scanner-agent.md', 'vp-phase-planner.md', 'vp-quality-gate.md'].includes(agent);
      const wouldChange = checkOnly
        ? !hasCorrectPolicy(agentPath, readOnly ? 'agent-readonly' : 'agent')
        : syncAgentFile(agentPath, readOnly);
      if (wouldChange) {
        modified.push(agentPath);
      }
    }
  }

  // Sync workflow files
  const workflowsDir = path.join(projectRoot, 'workflows');
  if (fs.existsSync(workflowsDir)) {
    const workflows = fs.readdirSync(workflowsDir).filter(f => f.endsWith('.md'));
    for (const workflow of workflows) {
      const workflowPath = path.join(workflowsDir, workflow);
      const wouldChange = checkOnly
        ? !hasCorrectPolicy(workflowPath, 'workflow')
        : syncWorkflowFile(workflowPath);
      if (wouldChange) {
        modified.push(workflowPath);
      }
    }
  }

  return modified;
}

/**
 * Check if a file has the correct policy markers/content.
 * Returns true if it does, false otherwise.
 */
function hasCorrectPolicy(filePath, type) {
  const content = fs.readFileSync(filePath, 'utf8');
  if (type === 'workflow') return content.includes(generateWorkflowPolicyLine());
  const expected = type === 'skill'
    ? generateSkillPolicyBlock()
    : generateAgentPolicyBlock(type === 'agent-readonly');
  // Exact block match: anything else (missing, stale, hand-edited) is drift.
  return content.includes(expected);
}

module.exports = {
  generateSkillPolicyBlock,
  generateAgentPolicyBlock,
  generateWorkflowPolicyLine,
  updateFileWithPolicy,
  syncSkillFile,
  syncAgentFile,
  syncWorkflowFile,
  syncAll,
  hasCorrectPolicy,
};
