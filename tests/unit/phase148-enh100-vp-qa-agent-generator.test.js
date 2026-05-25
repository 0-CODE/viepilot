const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const pkg  = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

describe('Phase 148 — ENH-100: vp-qa scan-first QA agent generator', () => {
  describe('skills/vp-qa/SKILL.md', () => {
    const skill = fs.readFileSync(path.join(ROOT, 'skills/vp-qa/SKILL.md'), 'utf8');

    it('has VP-QA v1.0.0 greeting banner', () => {
      expect(skill).toMatch(/VP-QA.*v1\.0\.0/);
    });
    it('has claude-code adapter section', () => {
      expect(skill).toMatch(/<adapter id="claude-code">/);
    });
    it('has codex adapter section', () => {
      expect(skill).toMatch(/<adapter id="codex">/);
    });
    it('describes Phase 1 Research', () => {
      expect(skill).toMatch(/Phase 1.*Research|Research.*Phase 1/i);
    });
    it('references lib/qa-router.cjs for adapter path mapping', () => {
      expect(skill).toMatch(/qa-router/);
    });
    it('mentions LLM writes files directly (not template rendering)', () => {
      expect(skill).toMatch(/Write tool|write.*directly|LLM.*generat/i);
    });
    it('documents --run and --target flags', () => {
      expect(skill).toMatch(/--run/);
      expect(skill).toMatch(/--target/);
    });
    it('references agents/qa-templates/rules/ for stack patterns', () => {
      expect(skill).toMatch(/qa-templates.*rules|rules.*qa-templates/);
    });
  });

  describe('lib/qa-router.cjs', () => {
    const router = require('../../lib/qa-router.cjs');

    it('exports resolveOutputSpec', () => {
      expect(typeof router.resolveOutputSpec).toBe('function');
    });
    it('exports expectedPaths', () => {
      expect(typeof router.expectedPaths).toBe('function');
    });
    it('claude-code resolves to .claude/agents/', () => {
      const spec = router.resolveOutputSpec('claude-code', '/tmp/proj');
      expect(spec.dir).toContain('.claude/agents');
      expect(spec.mode).toBe('multi-file');
    });
    it('codex resolves to AGENTS.md in append mode', () => {
      const spec = router.resolveOutputSpec('codex', '/tmp/proj');
      expect(spec.file).toBe('AGENTS.md');
      expect(spec.mode).toBe('append');
    });
    it('cursor-agent resolves to .cursor/rules/ with frontmatterRequired', () => {
      const spec = router.resolveOutputSpec('cursor-agent', '/tmp/proj');
      expect(spec.dir).toContain('.cursor/rules');
      expect(spec.frontmatterRequired).toBe(true);
    });
    it('unknown adapter falls back to claude-code', () => {
      const spec = router.resolveOutputSpec('unknown-adapter', '/tmp/proj');
      expect(spec.dir).toContain('.claude/agents');
    });
    it('expectedPaths for claude-code returns orchestrator + domain files', () => {
      const paths = router.expectedPaths('claude-code', '/tmp/proj', ['security', 'performance']);
      expect(paths).toHaveLength(3);
      expect(paths.some(p => p.includes('qa-orchestrator'))).toBe(true);
    });
  });

  describe('Stack reference docs', () => {
    const rulesDir = path.join(ROOT, 'agents/qa-templates/rules');

    ['node', 'python', 'java', 'go', 'ruby'].forEach(stack => {
      it(`${stack}.md exists`, () => {
        expect(fs.existsSync(path.join(rulesDir, `${stack}.md`))).toBe(true);
      });
      it(`${stack}.md has 4 sections`, () => {
        const content = fs.readFileSync(path.join(rulesDir, `${stack}.md`), 'utf8');
        expect(content).toMatch(/Completeness/i);
        expect(content).toMatch(/Security/i);
        expect(content).toMatch(/Performance/i);
        expect(content).toMatch(/Context/i);
      });
    });

    it('node.md contains eval() security reference', () => {
      const c = fs.readFileSync(path.join(rulesDir, 'node.md'), 'utf8');
      expect(c).toMatch(/eval/);
    });
    it('python.md contains pickle.loads reference', () => {
      const c = fs.readFileSync(path.join(rulesDir, 'python.md'), 'utf8');
      expect(c).toMatch(/pickle/);
    });
    it('java.md contains Hibernate / N+1 reference', () => {
      const c = fs.readFileSync(path.join(rulesDir, 'java.md'), 'utf8');
      expect(c).toMatch(/Hibernate|N\+1/);
    });
  });

  describe('package.json', () => {
    it('version is 3.12.1', () => {
      expect(pkg.version).toBe('3.12.1');
    });
  });
});
