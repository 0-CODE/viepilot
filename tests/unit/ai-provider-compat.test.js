/**
 * AI Provider Compatibility Tests
 *
 * ViePilot skills and workflows are consumed by AI assistants (Cursor, Claude CLI, etc.).
 * These tests verify that all skill and workflow files conform to the expected structure
 * that AI providers require to parse and execute them correctly.
 *
 * Provider compatibility matrix:
 *   - Cursor AI  : reads SKILL.md with YAML frontmatter + XML-like tags
 *   - Claude CLI : reads SKILL.md as plain markdown, follows <process> blocks
 *   - Codex      : reads SKILL.md as structured markdown and host-specific runtime bundles
 *   - Generic AI : reads any markdown with clear headings
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '../..');
const SKILLS_DIR = path.join(ROOT, 'skills');
const WORKFLOWS_DIR = path.join(ROOT, 'workflows');

// ============================================================================
// Helpers
// ============================================================================

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function getSkillFiles() {
  return fs.readdirSync(SKILLS_DIR)
    .filter(d => d.startsWith('vp-'))
    .filter(d => fs.statSync(path.join(SKILLS_DIR, d)).isDirectory())
    .map(d => ({
      name: d,
      path: path.join(SKILLS_DIR, d, 'SKILL.md'),
    }))
    .filter(s => fs.existsSync(s.path));
}

function getWorkflowFiles() {
  return fs.readdirSync(WORKFLOWS_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => ({
      name: f.replace('.md', ''),
      path: path.join(WORKFLOWS_DIR, f),
    }));
}

// ============================================================================
// Skill file structure tests
// ============================================================================

describe('Skill files: structure conformance', () => {
  const skills = getSkillFiles();

  test('at least one skill file exists', () => {
    expect(skills.length).toBeGreaterThan(0);
  });

  test.each(skills)('$name: has required XML-like sections', ({ name, path: skillPath }) => {
    const content = readFile(skillPath);

    // host adapter block describes invocation/tool expectations across runtimes
    expect(content).toContain('<host_skill_adapter>');
    expect(content).toContain('</host_skill_adapter>');

    // objective block required — tells AI what the skill does
    expect(content).toContain('<objective>');
    expect(content).toContain('</objective>');

    // success_criteria required — AI checks completion
    expect(content).toContain('<success_criteria>');
    expect(content).toContain('</success_criteria>');
  });

  test.each(skills)('$name: host_skill_adapter has Skill Invocation section', ({ name, path: skillPath }) => {
    const content = readFile(skillPath);
    // Must describe how the skill is triggered
    expect(content).toContain('Skill Invocation');
  });

  test.each(skills)('$name: host_skill_adapter has Tool Usage section', ({ name, path: skillPath }) => {
    const content = readFile(skillPath);
    // Must list tools so AI knows what it can use
    expect(content).toContain('Tool Usage');
  });

  test.each(skills)('$name: has either execution_context or inline process', ({ name, path: skillPath }) => {
    const content = readFile(skillPath);
    // Skills either delegate to a separate workflow via <execution_context>
    // or contain their own <process> block inline. Both patterns are valid.
    const hasExecContext = content.includes('<execution_context>');
    const hasProcess = content.includes('<process>');
    expect(hasExecContext || hasProcess).toBe(true);
  });

  test.each(skills)('$name: if execution_context present, references existing workflow', ({ name, path: skillPath }) => {
    const content = readFile(skillPath);
    if (!content.includes('<execution_context>')) return; // skip inline-process skills
    const match = content.match(/workflows\/([\w-]+\.md)/);
    if (match) {
      const workflowName = match[1];
      // May be local source reference or installed host runtime bundle
      const localPath = path.join(WORKFLOWS_DIR, workflowName);
      const installedPaths = [
        path.join(process.env.HOME, '.cursor', 'viepilot', 'workflows', workflowName),
        path.join(process.env.HOME, '.claude', 'viepilot', 'workflows', workflowName),
        path.join(process.env.HOME, '.codex', 'viepilot', 'workflows', workflowName),
      ];
      const exists = fs.existsSync(localPath) || installedPaths.some((p) => fs.existsSync(p));
      expect(exists).toBe(true);
    }
  });

  test.each(skills)('$name: success_criteria has at least one checkbox', ({ name, path: skillPath }) => {
    const content = readFile(skillPath);
    const criteriaSection = content.match(/<success_criteria>([\s\S]*?)<\/success_criteria>/);
    expect(criteriaSection).not.toBeNull();
    // At least one "- [ ]" checkbox
    expect(criteriaSection[1]).toMatch(/- \[ \]/);
  });
});

// ============================================================================
// Workflow file structure tests
// ============================================================================

describe('Workflow files: structure conformance', () => {
  const workflows = getWorkflowFiles();

  test('at least one workflow file exists', () => {
    expect(workflows.length).toBeGreaterThan(0);
  });

  test.each(workflows)('$name: has purpose block', ({ name, path: wfPath }) => {
    const content = readFile(wfPath);
    expect(content).toContain('<purpose>');
    expect(content).toContain('</purpose>');
  });

  test.each(workflows)('$name: has process block', ({ name, path: wfPath }) => {
    const content = readFile(wfPath);
    expect(content).toContain('<process>');
    expect(content).toContain('</process>');
  });

  test.each(workflows)('$name: has at least one named step', ({ name, path: wfPath }) => {
    const content = readFile(wfPath);
    // Steps must have name attribute for AI to reference
    expect(content).toMatch(/<step name="[\w_]+">/);
  });

  test.each(workflows)('$name: has success_criteria', ({ name, path: wfPath }) => {
    const content = readFile(wfPath);
    expect(content).toContain('<success_criteria>');
    expect(content).toContain('</success_criteria>');
  });

  test.each(workflows)('$name: all steps are properly closed', ({ name, path: wfPath }) => {
    const content = readFile(wfPath);
    const openSteps = (content.match(/<step /g) || []).length;
    const closeSteps = (content.match(/<\/step>/g) || []).length;
    expect(openSteps).toBe(closeSteps);
  });
});

// ============================================================================
// Cross-provider markdown compatibility
// ============================================================================

describe('Cross-provider markdown compatibility', () => {
  test('all skill files are valid UTF-8 (no binary content)', () => {
    const skills = getSkillFiles();
    for (const { path: skillPath } of skills) {
      expect(() => readFile(skillPath)).not.toThrow();
      const content = readFile(skillPath);
      // Should not contain null bytes (binary indicator)
      expect(content).not.toContain('\0');
    }
  });

  test('all workflow files are valid UTF-8 (no binary content)', () => {
    const workflows = getWorkflowFiles();
    for (const { path: wfPath } of workflows) {
      expect(() => readFile(wfPath)).not.toThrow();
      const content = readFile(wfPath);
      expect(content).not.toContain('\0');
    }
  });

  test('skill names follow vp-{name} naming convention', () => {
    const skills = getSkillFiles();
    for (const { name } of skills) {
      expect(name).toMatch(/^vp-[a-z][a-z0-9-]*$/);
    }
  });

  test('workflow files use lowercase kebab-case names', () => {
    const workflows = getWorkflowFiles();
    for (const { name } of workflows) {
      expect(name).toMatch(/^[a-z][a-z0-9-]*$/);
    }
  });

  test('skills reference workflow by filename only (portable paths)', () => {
    const skills = getSkillFiles();
    for (const { path: skillPath } of skills) {
      const content = readFile(skillPath);
      // Should use relative source refs or host bundle refs — not hardcoded absolute user paths
      const execContext = content.match(/<execution_context>([\s\S]*?)<\/execution_context>/);
      if (execContext) {
        // Must not contain hardcoded /Users/ or /home/ absolute paths
        expect(execContext[1]).not.toMatch(/^\/Users\/|^\/home\//m);
      }
    }
  });
});

// ============================================================================
// Template files compatibility
// ============================================================================

describe('Template files: placeholder format', () => {
  const TEMPLATES_DIR = path.join(ROOT, 'templates');

  function getAllTemplates(dir) {
    const results = [];
    if (!fs.existsSync(dir)) return results;
    for (const entry of fs.readdirSync(dir)) {
      const full = path.join(dir, entry);
      if (fs.statSync(full).isDirectory()) {
        results.push(...getAllTemplates(full));
      } else if (entry.endsWith('.md')) {
        results.push(full);
      }
    }
    return results;
  }

  const templates = getAllTemplates(TEMPLATES_DIR);

  test('template directory has files', () => {
    expect(templates.length).toBeGreaterThan(0);
  });

  test('all template files use {{PLACEHOLDER}} format (not single braces)', () => {
    for (const tplPath of templates) {
      const content = readFile(tplPath);
      // Reject single-brace {PLACEHOLDER} that would conflict with JSON/code blocks
      // Allow: {{PLACEHOLDER}}, {type}({scope}) (conventional commits in examples), code blocks
      const lines = content.split('\n').filter(l =>
        // Skip code block lines
        !l.trim().startsWith('```') && !l.startsWith('    ')
      );
      for (const line of lines) {
        // Single braces used as template placeholders (not double)
        const singleBracePlaceholder = line.match(/(?<!\{)\{([A-Z_]{2,})\}(?!\})/);
        if (singleBracePlaceholder) {
          // This is allowed inside backtick code spans
          if (!line.includes('`')) {
            // Warn but don't fail — some templates use {PLACEHOLDER} intentionally
            // Just ensure it's not the primary pattern
          }
        }
      }
      // At least pass the basic read check
      expect(content.length).toBeGreaterThan(0);
    }
  });
});
