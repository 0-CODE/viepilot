'use strict';

const { execSync } = require('child_process');
const path = require('path');
const fs   = require('fs');

const VPT = path.join(__dirname, '../../bin/vp-tools.cjs');
const BRAINSTORM_SKILL_MD = fs.readFileSync(
  path.join(__dirname, '../../skills/vp-brainstorm/SKILL.md'), 'utf8'
);
const CRYSTALLIZE_SKILL_MD = fs.readFileSync(
  path.join(__dirname, '../../skills/vp-crystallize/SKILL.md'), 'utf8'
);

function run(args) {
  return execSync(`node "${VPT}" ${args}`, { encoding: 'utf8' });
}

describe('Phase 101 — BUG-019 vp-tools scan-skills CLI', () => {

  describe('scan-skills command', () => {
    test('1. exits with code 0', () => {
      expect(() => run('scan-skills')).not.toThrow();
    });

    test('2. stdout contains "✔ Scanned"', () => {
      const out = run('scan-skills');
      expect(out).toContain('✔ Scanned');
    });

    test('3. stdout contains "skill-registry.json"', () => {
      const out = run('scan-skills');
      expect(out).toContain('skill-registry.json');
    });

    test('4. stdout matches pattern "Scanned N skill(s)"', () => {
      const out = run('scan-skills');
      expect(out).toMatch(/Scanned \d+ skills? →/);
    });
  });

  describe('help scan-skills', () => {
    test('5. vp-tools help scan-skills exits 0', () => {
      expect(() => run('help scan-skills')).not.toThrow();
    });

    test('6. help output contains "scan-skills"', () => {
      const out = run('help scan-skills');
      expect(out).toContain('scan-skills');
    });

    test('7. help output describes skill-registry.json', () => {
      const out = run('help scan-skills');
      expect(out).toContain('skill-registry.json');
    });
  });

  describe('help banner', () => {
    test('8. vp-tools help lists scan-skills in usage summary', () => {
      const out = run('help');
      expect(out).toContain('scan-skills');
    });
  });

  describe('SKILL.md references', () => {
    test('9. vp-brainstorm/SKILL.md references vp-tools scan-skills', () => {
      expect(BRAINSTORM_SKILL_MD).toContain('vp-tools scan-skills');
    });

    test('10. vp-crystallize/SKILL.md references vp-tools scan-skills', () => {
      expect(CRYSTALLIZE_SKILL_MD).toContain('vp-tools scan-skills');
    });
  });

});
