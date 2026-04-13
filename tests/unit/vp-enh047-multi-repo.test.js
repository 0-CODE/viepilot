'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

describe('ENH-047 Brownfield Multi-Repo, Submodules & Per-Module Gap Detection', () => {

  describe('workflows/crystallize.md — Gap A: Git Submodule Detection', () => {
    let content;
    beforeAll(() => { content = read('workflows/crystallize.md'); });

    test('.gitmodules detection step documented', () => {
      expect(content).toMatch(/\.gitmodules/);
      expect(content).toMatch(/\[submodule/i);
    });

    test('submodule scan covers Signal Cat 1, 2, and 4', () => {
      expect(content).toMatch(/Run Signal Cat 1.*manifest scan/i);
      expect(content).toMatch(/Run Signal Cat 2.*framework/i);
      expect(content).toMatch(/Run Signal Cat 4.*DB signals/i);
    });

    test('safety rule: never run git submodule update', () => {
      expect(content).toMatch(/Never run.*git submodule update|never run.*git submodule/i);
    });

    test('schema: type field with submodule|workspace|root values', () => {
      expect(content).toMatch(/type: submodule.*workspace.*root|type: workspace.*submodule.*root/i);
    });

    test('schema: submodule_url field present', () => {
      expect(content).toMatch(/submodule_url:/);
    });

    test('schema: initialized field present', () => {
      expect(content).toMatch(/initialized: bool|initialized: true|initialized: false/);
    });

    test('uninitialized submodule path → primary_language MISSING', () => {
      expect(content).toMatch(/initialized.*false.*MISSING|not initialized.*MISSING|initialized: false/i);
    });
  });

  describe('workflows/crystallize.md — Gap B: Polyrepo Detection', () => {
    let content;
    beforeAll(() => { content = read('workflows/crystallize.md'); });

    test('Polyrepo / Multi-Repo Detection subsection present', () => {
      expect(content).toMatch(/Polyrepo.*Multi-Repo Detection|Polyrepo Detection/i);
    });

    test('docker-compose ../ build context signal listed', () => {
      expect(content).toMatch(/docker-compose.*build:.*\.\.\/|context:.*\.\.\//i);
    });

    test('file:../ package.json signal listed', () => {
      expect(content).toMatch(/file:\.\.\/|file:.*\.\.\//);
    });

    test('CI cross-repo clone signal listed (git clone or uses:)', () => {
      expect(content).toMatch(/git clone|uses:.*other-repo/i);
    });

    test('polyrepo_hints[] field in schema', () => {
      expect(content).toMatch(/polyrepo_hints:/);
    });

    test('related_repos[] field in schema', () => {
      expect(content).toMatch(/related_repos:/);
    });

    test('interactive prompt defined for polyrepo signals', () => {
      expect(content).toMatch(/⚠️ Polyrepo signals detected|Polyrepo signals detected/i);
    });

    test('gap-fill rule: hints without related_repos → ASSUMED', () => {
      expect(content).toMatch(/related_repos.*empty.*ASSUMED|ASSUMED.*related_repos|hints.*ASSUMED/i);
    });

    test('clean single-repo rule: polyrepo_hints absent when empty', () => {
      expect(content).toMatch(/empty.*skip.*section|polyrepo_hints.*empty.*skip|absent.*empty.*single-repo/i);
    });
  });

  describe('workflows/crystallize.md — Gap C: Per-Module Gap Detection', () => {
    let content;
    beforeAll(() => { content = read('workflows/crystallize.md'); });

    test('Per-Module Gap Detection section present', () => {
      expect(content).toMatch(/Per-Module Gap Detection/);
    });

    test('must_detect_status field documented', () => {
      expect(content).toMatch(/must_detect_status/);
    });

    test('gap_tier field on module entries in schema', () => {
      expect(content).toMatch(/gap_tier: DETECTED.*ASSUMED.*MISSING|gap_tier:/);
    });

    test('root rollup rule: worst tier across all modules', () => {
      expect(content).toMatch(/worst tier.*modules|root.*gap_tier.*worst/i);
    });

    test('pause-and-ask rule for MISSING module documented', () => {
      expect(content).toMatch(/gap_tier.*MISSING.*block|MISSING.*block.*artifact|Module.*MISSING.*required/i);
    });

    test('must_detect_status source conventions: inferred + absent + user', () => {
      expect(content).toMatch(/source:.*inferred/);
      expect(content).toMatch(/source:.*absent/);
      expect(content).toMatch(/source:.*user/);
    });

    test('module_purpose field in per-module MUST-DETECT table', () => {
      expect(content).toMatch(/module_purpose/);
    });

    test('entry_point field in per-module MUST-DETECT table', () => {
      expect(content).toMatch(/entry_point/);
    });

    test('scan summary printout table (module | path | language | framework | gap tier)', () => {
      expect(content).toMatch(/Module scan summary|module.*path.*language.*framework.*gap/i);
    });

    test('per-module open_questions rolled up to root', () => {
      expect(content).toMatch(/roll.*per-module.*open_questions|open_questions.*rollup|roll up.*modules/i);
    });
  });

  describe('skills/vp-crystallize/SKILL.md — Gap A+B+C summary', () => {
    let content;
    beforeAll(() => { content = read('skills/vp-crystallize/SKILL.md'); });

    test('must_detect_status mentioned in SKILL.md', () => {
      expect(content).toMatch(/must_detect_status/);
    });

    test('polyrepo_hints mentioned in SKILL.md', () => {
      expect(content).toMatch(/polyrepo_hints/);
    });

    test('related_repos mentioned in SKILL.md', () => {
      expect(content).toMatch(/related_repos/);
    });

    test('git submodule detection mentioned in SKILL.md', () => {
      expect(content).toMatch(/submodule.*detection|Git Submodule|\.gitmodules/i);
    });

    test('never run git submodule update safety rule in SKILL.md', () => {
      expect(content).toMatch(/never.*git submodule update|read-only/i);
    });

    test('root gap_tier rollup documented in SKILL.md', () => {
      expect(content).toMatch(/worst.*tier|gap_tier.*worst|MISSING.*ASSUMED.*DETECTED/i);
    });
  });

});
