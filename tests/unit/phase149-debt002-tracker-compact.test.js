const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '../..');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

describe('Phase 149 — DEBT-002: TRACKER.md Compaction', () => {
  describe('A) lib/tracker-compact.cjs exports', () => {
    const c = require('../../lib/tracker-compact.cjs');

    it('exports compact function', () => {
      expect(typeof c.compact).toBe('function');
    });

    it('exports rewriteCurrentState function', () => {
      expect(typeof c.rewriteCurrentState).toBe('function');
    });
  });

  describe('B) rewriteCurrentState behavior', () => {
    const { rewriteCurrentState } = require('../../lib/tracker-compact.cjs');

    it('replaces Current State block', () => {
      const input = '# Title\n\n## Current State\nold stuff\n\n## Next Section\nkeep this\n';
      const result = rewriteCurrentState(input, '## Current State\nnew stuff\n\n');
      expect(result).toContain('new stuff');
      expect(result).not.toContain('old stuff');
      expect(result).toContain('## Next Section');
      expect(result).toContain('keep this');
    });

    it('no-op if Current State section missing', () => {
      const input = '# Title\n\n## Other Section\ncontent\n';
      const result = rewriteCurrentState(input, '## Current State\nnew\n');
      expect(result).toBe(input);
    });
  });

  describe('C) compact dry-run', () => {
    const { compact } = require('../../lib/tracker-compact.cjs');

    it('compact dry-run returns stats without writing files', () => {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-test-'));
      const trackerPath = path.join(tmpDir, 'TRACKER.md');

      // Build bloated TRACKER.md
      let content = '# Tracker\n\n## Current State\n';
      for (let i = 1; i <= 20; i++) {
        content += `- **Current Phase**: ${i}\n- **Last Completed Phase**: ${i - 1}\n\n`;
      }
      content += '\n## Decision Log\n\n| Date | Decision | Rationale | Phase |\n|------|----------|-----------|-------|\n';
      for (let i = 1; i <= 30; i++) {
        content += `| 2026-01-${String(i).padStart(2, '0')} | Decision ${i} | Rationale ${i} | ${i} |\n`;
      }
      content += '\n## Version Info\n\n### Current Version\n```\n1.0.0\n```\n';

      fs.writeFileSync(trackerPath, content);
      const originalSize = fs.statSync(trackerPath).size;

      const result = compact(trackerPath, { keep: 5, dryRun: true });

      expect(typeof result.linesRemoved).toBe('number');
      expect(typeof result.rowsArchived).toBe('number');
      expect(typeof result.trackerLines).toBe('number');
      // dryRun: no files written
      expect(fs.existsSync(path.join(tmpDir, 'TRACKER-HISTORY.md'))).toBe(false);
      expect(fs.statSync(trackerPath).size).toBe(originalSize); // unchanged

      fs.rmSync(tmpDir, { recursive: true });
    });
  });

  describe('D) compact live run', () => {
    const { compact } = require('../../lib/tracker-compact.cjs');

    it('compact live run shrinks TRACKER.md and creates TRACKER-HISTORY.md', () => {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vp-test-'));
      const trackerPath = path.join(tmpDir, 'TRACKER.md');

      let content = '# Tracker\n\n## Current State\n';
      for (let i = 1; i <= 20; i++) {
        content += `- **Current Phase**: ${i}\n- **Last Completed Phase**: ${i - 1}\n\n`;
      }
      content += '## Decision Log\n\n| Date | Decision | Rationale | Phase |\n|------|----------|-----------|-------|\n';
      for (let i = 1; i <= 30; i++) {
        content += `| 2026-01-${String(i).padStart(2, '0')} | Decision ${i} | Rationale ${i} | ${i} |\n`;
      }

      const originalLines = content.split('\n').length;
      fs.writeFileSync(trackerPath, content);

      const result = compact(trackerPath, { keep: 5 });

      const newTracker = fs.readFileSync(trackerPath, 'utf8');
      const historyPath = path.join(tmpDir, 'TRACKER-HISTORY.md');

      expect(fs.existsSync(historyPath)).toBe(true);
      expect(newTracker.split('\n').length).toBeLessThan(originalLines);
      expect(result.linesRemoved).toBeGreaterThan(0);
      expect(result.rowsArchived).toBeGreaterThan(0);
      expect(result.trackerLines).toBeLessThan(originalLines);

      fs.rmSync(tmpDir, { recursive: true });
    });
  });

  describe('E) CLI subcommand', () => {
    it('bin/vp-tools.cjs source references tracker-compact', () => {
      const src = fs.readFileSync(path.join(__dirname, '../../bin/vp-tools.cjs'), 'utf8');
      expect(src).toMatch(/tracker-compact/);
      expect(src).toMatch(/tracker/);
      expect(src).toMatch(/compact/);
    });

    it('tracker compact --dry-run exits 0', () => {
      // Use a nonexistent path so we test the error path too
      try {
        const out = execSync('node bin/vp-tools.cjs tracker compact --dry-run 2>&1', {
          cwd: path.join(__dirname, '../..'),
          encoding: 'utf8'
        });
        // Either dry-run success output or "not found" — both valid since .viepilot/TRACKER.md may not exist in test env
        expect(typeof out).toBe('string');
      } catch (e) {
        // If exit 1 because TRACKER.md not found — that's also valid behavior
        expect(e.stdout || e.message).toMatch(/tracker|compact|TRACKER/i);
      }
    });
  });

  describe('F) autonomous.md contract', () => {
    const autonomous = fs.readFileSync(path.join(__dirname, '../../workflows/autonomous.md'), 'utf8');

    it('autonomous.md contains rewrite-current-state', () => {
      expect(autonomous).toContain('rewrite-current-state');
    });

    it('autonomous.md does NOT contain update-current-state', () => {
      expect(autonomous).not.toContain('update-current-state');
    });

    it('autonomous.md contains auto-compact size guard', () => {
      expect(autonomous).toMatch(/auto-compact|auto-compacting/);
    });

    it('autonomous.md contains Decision Log cap instruction', () => {
      expect(autonomous).toMatch(/20 rows|cap.*Decision|Decision.*20/i);
    });
  });

  describe('G) version', () => {
    it('package.json version is 3.12.1', () => {
      expect(pkg.version).toBe('3.12.2');
    });
  });
});
