'use strict';
/**
 * Contract tests — ENH-050: git tag format includes branch + version
 * Verifies that workflow files use the enriched TAG_PREFIX format.
 */

const fs = require('fs');
const path = require('path');

const autonomousContent = fs.readFileSync(
  path.join(__dirname, '../../workflows/autonomous.md'), 'utf8');
const auditContent = fs.readFileSync(
  path.join(__dirname, '../../workflows/audit.md'), 'utf8');
const rollbackContent = fs.readFileSync(
  path.join(__dirname, '../../workflows/rollback.md'), 'utf8');

describe('ENH-050: Git tag format includes branch + version', () => {
  describe('workflows/autonomous.md — TAG_PREFIX resolution', () => {
    it('defines BRANCH_SAFE variable', () => {
      expect(autonomousContent).toContain('BRANCH_SAFE');
    });

    it('resolves BRANCH_SAFE from git rev-parse', () => {
      expect(autonomousContent).toContain('git rev-parse --abbrev-ref HEAD');
    });

    it('defines VERSION variable from package.json', () => {
      expect(autonomousContent).toMatch(/VERSION=.*package\.json/);
    });

    it('assembles TAG_PREFIX from all three components', () => {
      expect(autonomousContent).toContain('TAG_PREFIX="${PROJECT_PREFIX}-${BRANCH_SAFE}-${VERSION}"');
    });

    it('documents example enriched tag format', () => {
      // Should show something like viepilot-main-2.17.0
      expect(autonomousContent).toMatch(/[a-z]+-main-\d+\.\d+\.\d+/);
    });
  });

  describe('workflows/autonomous.md — tag creation patterns', () => {
    it('task start tag uses TAG_PREFIX pattern', () => {
      expect(autonomousContent).toMatch(/TAG_PREFIX.*vp-p\{phase\}-t\{task\}/);
    });

    it('task start tag has bash command form', () => {
      expect(autonomousContent).toContain('git tag "${TAG_PREFIX}-vp-p${PHASE}-t${TASK}"');
    });

    it('task done tag uses TAG_PREFIX pattern', () => {
      expect(autonomousContent).toMatch(/TAG_PREFIX.*vp-p.*-done/);
    });

    it('phase complete tag uses TAG_PREFIX pattern', () => {
      expect(autonomousContent).toMatch(/TAG_PREFIX.*vp-p.*complete/);
    });

    it('no remaining {projectPrefix} in tag creation lines', () => {
      // Ensure old pattern is gone from tag creation context
      const lines = autonomousContent.split('\n').filter(l =>
        l.includes('Create git tag') || l.includes('git tag "${')
      );
      lines.forEach(line => {
        expect(line).not.toContain('projectPrefix');
      });
    });
  });

  describe('workflows/audit.md — regex matches both old and new format', () => {
    // COMPLETE_TAGS spans multiple lines — read a wider block from COMPLETE_TAGS= to sort)
    const ctStart = auditContent.indexOf('COMPLETE_TAGS=');
    const ctBlock = auditContent.slice(ctStart, ctStart + 600);

    it('COMPLETE_TAGS block has legacy bare format (^vp-p)', () => {
      expect(ctBlock).toContain('^vp-p');
    });

    it('COMPLETE_TAGS block has legacy prefix format', () => {
      expect(ctBlock).toMatch(/a-z0-9-\].*vp-p/);
    });

    it('COMPLETE_TAGS block has enriched format with version pattern', () => {
      // Third alternative covers X.Y.Z version in tag
      expect(ctBlock).toMatch(/\[0-9\].*\\\..*\[0-9\]/);
    });

    it('PREV_TAG grep uses [a-z0-9._-] to match dots in version strings', () => {
      expect(auditContent).toMatch(/\[a-z0-9\._-\]\+.*vp-p/);
    });
  });

  describe('workflows/rollback.md — regex matches enriched format', () => {
    it('tag grep includes dot in character class for version strings', () => {
      expect(rollbackContent).toMatch(/\[a-z0-9\._-\]\+-vp-p/);
    });

    it('ENH-050 comment is present', () => {
      expect(rollbackContent).toContain('ENH-050');
    });
  });
});
