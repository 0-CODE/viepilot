/**
 * Tests for BUG-039 R2: stack-cache module and CLI
 * Validates that research findings persist correctly and subagents don't write files
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const stackCache = require('../../lib/stack-cache.cjs');

describe('BUG-039 R2: Stack Cache', () => {
  const projectRoot = path.join(__dirname, '../../');

  describe('stack-cache module: validateStackId', () => {
    test('accepts valid lowercase ID with numbers', () => {
      const result = stackCache.validateStackId('mybatis');
      expect(result.valid).toBe(true);
    });

    test('accepts ID with dots and dashes', () => {
      const result = stackCache.validateStackId('spring-boot-3.x');
      expect(result.valid).toBe(true);
    });

    test('rejects UPPERCASE', () => {
      const result = stackCache.validateStackId('MYBATIS');
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/must match/i);
    });

    test('rejects empty string', () => {
      const result = stackCache.validateStackId('');
      expect(result.valid).toBe(false);
    });

    test('rejects ID starting with dash', () => {
      const result = stackCache.validateStackId('-mybatis');
      expect(result.valid).toBe(false);
    });

    test('accepts ID with underscore', () => {
      const result = stackCache.validateStackId('my_batis');
      expect(result.valid).toBe(true);
    });
  });

  describe('stack-cache module: validateSections', () => {
    const goodSections = {
      SUMMARY: 'summary text',
      'BEST-PRACTICES': 'best practices text',
      'ANTI-PATTERNS': 'anti-patterns text',
      SOURCES: 'sources text',
    };

    test('accepts all four required sections', () => {
      const result = stackCache.validateSections(goodSections);
      expect(result.valid).toBe(true);
    });

    test('rejects missing SUMMARY', () => {
      const sections = { ...goodSections };
      delete sections.SUMMARY;
      const result = stackCache.validateSections(sections);
      expect(result.valid).toBe(false);
      expect(result.missing).toContain('SUMMARY');
    });

    test('rejects missing BEST-PRACTICES', () => {
      const sections = { ...goodSections };
      delete sections['BEST-PRACTICES'];
      const result = stackCache.validateSections(sections);
      expect(result.valid).toBe(false);
      expect(result.missing).toContain('BEST-PRACTICES');
    });

    test('rejects missing ANTI-PATTERNS', () => {
      const sections = { ...goodSections };
      delete sections['ANTI-PATTERNS'];
      const result = stackCache.validateSections(sections);
      expect(result.valid).toBe(false);
      expect(result.missing).toContain('ANTI-PATTERNS');
    });

    test('rejects missing SOURCES', () => {
      const sections = { ...goodSections };
      delete sections.SOURCES;
      const result = stackCache.validateSections(sections);
      expect(result.valid).toBe(false);
      expect(result.missing).toContain('SOURCES');
    });

    test('rejects empty section content', () => {
      const sections = { ...goodSections, SUMMARY: '' };
      const result = stackCache.validateSections(sections);
      expect(result.valid).toBe(false);
      expect(result.missing).toContain('SUMMARY');
    });

    test('rejects non-object input', () => {
      const result = stackCache.validateSections(null);
      expect(result.valid).toBe(false);
      expect(result.missing).toHaveLength(4);
    });
  });

  describe('stack-cache module: parseSections', () => {
    test('parses markdown headings', () => {
      const text = `## SUMMARY
Quick guide

## BEST-PRACTICES
Do this

## ANTI-PATTERNS
Avoid that

## SOURCES
Links here`;
      const sections = stackCache.parseSections(text);
      expect(sections.SUMMARY).toContain('Quick');
      expect(sections['BEST-PRACTICES']).toContain('Do');
      expect(sections['ANTI-PATTERNS']).toContain('Avoid');
      expect(sections.SOURCES).toContain('Links');
    });

    test('parses fenced code blocks', () => {
      const text = `\`\`\`SUMMARY
Quick guide
\`\`\`

\`\`\`BEST-PRACTICES
Do this
\`\`\`

\`\`\`ANTI-PATTERNS
Avoid that
\`\`\`

\`\`\`SOURCES
Links here
\`\`\``;
      const sections = stackCache.parseSections(text);
      expect(sections.SUMMARY).toContain('Quick');
      expect(sections['BEST-PRACTICES']).toContain('Do');
    });

    test('handles empty input', () => {
      const sections = stackCache.parseSections('');
      expect(Object.keys(sections)).toHaveLength(0);
    });

    test('handles null input', () => {
      const sections = stackCache.parseSections(null);
      expect(Object.keys(sections)).toHaveLength(0);
    });
  });

  describe('stack-cache module: writeStackCache', () => {
    const goodSections = {
      SUMMARY: 'summary text',
      'BEST-PRACTICES': 'best practices text',
      'ANTI-PATTERNS': 'anti-patterns text',
      SOURCES: 'sources text',
    };

    test('writes four files to temp home', () => {
      const tempHome = fs.mkdtempSync(path.join(os.tmpdir(), 'viepilot-'));
      try {
        const paths = stackCache.writeStackCache({
          stack: 'test-stack',
          sections: goodSections,
          home: tempHome,
        });

        expect(paths).toHaveLength(4);
        expect(paths[0]).toMatch(/SUMMARY\.md$/);
        expect(paths[1]).toMatch(/BEST-PRACTICES\.md$/);
        expect(paths[2]).toMatch(/ANTI-PATTERNS\.md$/);
        expect(paths[3]).toMatch(/SOURCES\.md$/);

        // Verify files exist
        paths.forEach(p => {
          expect(fs.existsSync(p)).toBe(true);
        });
      } finally {
        fs.rmSync(tempHome, { recursive: true });
      }
    });

    test('writes headers with stack ID and date', () => {
      const tempHome = fs.mkdtempSync(path.join(os.tmpdir(), 'viepilot-'));
      try {
        stackCache.writeStackCache({
          stack: 'mybatis',
          sections: goodSections,
          home: tempHome,
        });

        const summaryPath = path.join(tempHome, '.viepilot/stacks/mybatis/SUMMARY.md');
        const content = fs.readFileSync(summaryPath, 'utf8');
        expect(content).toMatch(/<!-- stack: mybatis, cached: \d{4}-\d{2}-\d{2} -->/);
      } finally {
        fs.rmSync(tempHome, { recursive: true });
      }
    });

    test('throws on invalid stack ID', () => {
      const tempHome = fs.mkdtempSync(path.join(os.tmpdir(), 'viepilot-'));
      try {
        expect(() => {
          stackCache.writeStackCache({
            stack: 'INVALID',
            sections: goodSections,
            home: tempHome,
          });
        }).toThrow(/must match/i);
      } finally {
        fs.rmSync(tempHome, { recursive: true });
      }
    });

    test('throws on missing sections', () => {
      const tempHome = fs.mkdtempSync(path.join(os.tmpdir(), 'viepilot-'));
      try {
        const { SOURCES, ...incomplete } = goodSections;
        expect(() => {
          stackCache.writeStackCache({
            stack: 'mybatis',
            sections: incomplete,
            home: tempHome,
          });
        }).toThrow(/Missing required sections/);
      } finally {
        fs.rmSync(tempHome, { recursive: true });
      }
    });
  });

  describe('CLI: vp-tools stack-cache write', () => {
    const vpTools = path.join(projectRoot, 'bin', 'vp-tools.cjs');

    test('writes stack cache from JSON stdin', () => {
      const tempHome = fs.mkdtempSync(path.join(os.tmpdir(), 'viepilot-'));
      try {
        const json = JSON.stringify({
          SUMMARY: 'test summary',
          'BEST-PRACTICES': 'test practices',
          'ANTI-PATTERNS': 'test patterns',
          SOURCES: 'test sources',
        });

        const cmd = `echo '${json}' | node ${vpTools} stack-cache write --stack test-cli --from - --home ${tempHome}`;
        const output = execSync(cmd, { encoding: 'utf8' });
        expect(output).toContain('Stack cache written');
        expect(output).toContain('SUMMARY.md');

        const summaryPath = path.join(tempHome, '.viepilot/stacks/test-cli/SUMMARY.md');
        expect(fs.existsSync(summaryPath)).toBe(true);
      } finally {
        fs.rmSync(tempHome, { recursive: true });
      }
    });

    test('rejects missing --stack argument', () => {
      expect(() => {
        const cmd = `node ${vpTools} stack-cache write --from -`;
        execSync(cmd, { encoding: 'utf8' });
      }).toThrow();
    });

    test('rejects missing --from argument', () => {
      expect(() => {
        const cmd = `node ${vpTools} stack-cache write --stack test-id`;
        execSync(cmd, { encoding: 'utf8' });
      }).toThrow();
    });

    test('rejects bad stack ID', () => {
      const tempHome = fs.mkdtempSync(path.join(os.tmpdir(), 'viepilot-'));
      try {
        const json = JSON.stringify({
          SUMMARY: 'test',
          'BEST-PRACTICES': 'test',
          'ANTI-PATTERNS': 'test',
          SOURCES: 'test',
        });

        expect(() => {
          const cmd = `echo '${json}' | node ${vpTools} stack-cache write --stack INVALID --from - --home ${tempHome}`;
          execSync(cmd, { encoding: 'utf8' });
        }).toThrow();
      } finally {
        fs.rmSync(tempHome, { recursive: true });
      }
    });

    test('rejects missing sections', () => {
      const tempHome = fs.mkdtempSync(path.join(os.tmpdir(), 'viepilot-'));
      try {
        const json = JSON.stringify({
          SUMMARY: 'test',
          'BEST-PRACTICES': 'test',
          // Missing ANTI-PATTERNS and SOURCES
        });

        expect(() => {
          const cmd = `echo '${json}' | node ${vpTools} stack-cache write --stack test --from - --home ${tempHome}`;
          execSync(cmd, { encoding: 'utf8' });
        }).toThrow();
      } finally {
        fs.rmSync(tempHome, { recursive: true });
      }
    });
  });

  describe('Lint: workflows must not ask subagents to write to ~/.viepilot/stacks', () => {
    test('crystallize.md tells subagents to return text, not write files', () => {
      const crystallizePath = path.join(projectRoot, 'workflows', 'crystallize.md');
      const content = fs.readFileSync(crystallizePath, 'utf8');

      // Should NOT contain directives asking subagents to write to stacks
      expect(content).not.toMatch(/subagent.*write.*viepilot\/stacks/i);
      expect(content).not.toMatch(/agent.*write.*viepilot\/stacks/i);

      // SHOULD contain "Return findings as ... sections" or similar
      expect(content).toMatch(/Return findings as.*sections/i);
      expect(content).toMatch(/do NOT write files/i);

      // SHOULD mention orchestrator persists or vp-tools stack-cache write
      expect(content).toMatch(/orchestrator.*persists/i);
      expect(content).toMatch(/vp-tools stack-cache write/);
    });

    test('no workflow instructs subagent to write report files to ~/.viepilot/stacks', () => {
      const workflowsDir = path.join(projectRoot, 'workflows');
      const workflows = fs.readdirSync(workflowsDir).filter(f => f.endsWith('.md'));

      workflows.forEach(workflow => {
        const filePath = path.join(workflowsDir, workflow);
        const content = fs.readFileSync(filePath, 'utf8');

        // Check for anti-pattern: asking subagent/agent to write to stacks
        const hasSubagentWrite = /subagent.*write.*viepilot\/stacks/i.test(content);
        const hasAgentWrite = /agent.*write.*viepilot\/stacks/i.test(content);

        expect(hasSubagentWrite || hasAgentWrite).toBe(false);
      });
    });
  });
});
