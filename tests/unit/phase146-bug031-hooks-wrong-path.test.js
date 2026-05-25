const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const vpTools = fs.readFileSync(path.join(ROOT, 'bin/vp-tools.cjs'), 'utf8');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

describe('Phase 146 — BUG-031: hooks install wrong path fix', () => {
  describe('bin/vp-tools.cjs — hook path fix', () => {
    it('does not contain hardcoded ~/.viepilot/hooks/ path', () => {
      // The old wrong path pattern should be gone
      expect(vpTools).not.toMatch(/['"` ]\.viepilot[/\\\\]hooks[/\\\\]brainstorm/);
    });
    it('uses adapter.viepilotDir for hook path in scaffold section', () => {
      // Should reference viepilotDir + lib/hooks
      expect(vpTools).toMatch(/viepilotDir.*lib.*hooks|lib.*hooks.*brainstorm/);
    });
    it('contains migration filter for old wrong-path entries', () => {
      // Migration removes stale .viepilot/hooks entries
      expect(vpTools).toMatch(/wrongPath|wrong.*path|\.viepilot.*filter|filter.*viepilot/i);
    });
  });

  describe('package.json', () => {
    it('version is 3.12.1', () => {
      expect(pkg.version).toBe('3.12.1');
    });
  });
});
