const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const crystallize = fs.readFileSync(path.join(ROOT, 'workflows/crystallize.md'), 'utf8');
const vpTools = fs.readFileSync(path.join(ROOT, 'bin/vp-tools.cjs'), 'utf8');

describe('Phase 147 — ENH-101: crystallize adapter context files', () => {
  describe('lib/context-file-generators.cjs', () => {
    const gen = require('../../lib/context-file-generators.cjs');

    it('exports generateAll function', () => {
      expect(typeof gen.generateAll).toBe('function');
    });

    it('generateAll returns 6 entries with path + content', () => {
      const results = gen.generateAll(ROOT);
      expect(results).toHaveLength(6);
      results.forEach(r => {
        expect(r).toHaveProperty('path');
        expect(r).toHaveProperty('content');
        expect(typeof r.content).toBe('string');
      });
    });

    it('generateClaudeMd includes ViePilot Workflow section', () => {
      const content = gen.generateClaudeMd(ROOT);
      expect(content).toMatch(/ViePilot Workflow/);
    });

    it('generateAgentsMd includes apply_patch reference', () => {
      const content = gen.generateAgentsMd(ROOT);
      expect(content).toMatch(/apply_patch/);
    });

    it('generateCursorMdc starts with MDC frontmatter', () => {
      const content = gen.generateCursorMdc(ROOT);
      expect(content).toMatch(/^---/);
      expect(content).toMatch(/alwaysApply:\s*true/);
    });

    it('generateAll paths include CLAUDE.md, GEMINI.md, AGENTS.md', () => {
      const paths = gen.generateAll(ROOT).map(r => r.path);
      expect(paths).toContain('CLAUDE.md');
      expect(paths).toContain('GEMINI.md');
      expect(paths).toContain('AGENTS.md');
      expect(paths).toContain('.cursorrules');
      expect(paths).toContain('.github/copilot-instructions.md');
    });
  });

  describe('workflows/crystallize.md', () => {
    it('contains Step 1F section', () => {
      expect(crystallize).toMatch(/Step 1F/);
    });
    it('mentions CLAUDE.md generation', () => {
      expect(crystallize).toMatch(/CLAUDE\.md/);
    });
    it('mentions context-files subcommand', () => {
      expect(crystallize).toMatch(/context-files/);
    });
  });

  describe('bin/vp-tools.cjs', () => {
    it('contains context-files subcommand handler', () => {
      expect(vpTools).toMatch(/context-files/);
    });
    it('calls generateAll or per-adapter generator', () => {
      expect(vpTools).toMatch(/generateAll|generateClaudeMd/);
    });
  });

  describe('package.json', () => {
    it('version is 3.11.0', () => {
      expect(pkg.version).toBe('3.11.0');
    });
  });
});
