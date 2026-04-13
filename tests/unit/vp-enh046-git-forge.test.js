'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

describe('ENH-046 Git Forge Agnostic Remote URL Parsing', () => {

  describe('workflows/documentation.md — forge-agnostic parser', () => {
    let content;
    beforeAll(() => { content = read('workflows/documentation.md'); });

    test('GIT_HOST variable defined in URL parser block', () => {
      expect(content).toMatch(/GIT_HOST=/);
    });

    test('GIT_OWNER variable defined in URL parser block', () => {
      expect(content).toMatch(/GIT_OWNER=/);
    });

    test('GIT_REPO variable defined in URL parser block', () => {
      expect(content).toMatch(/GIT_REPO=/);
    });

    test('GITHUB_OWNER / GITHUB_REPO variable names removed', () => {
      // Allow in comments/prose but not as shell variable assignments
      expect(content).not.toMatch(/GITHUB_OWNER\s*=/);
      expect(content).not.toMatch(/GITHUB_REPO\s*=/);
      expect(content).not.toMatch(/GITHUB_SLUG\s*=/);
    });

    test('Azure DevOps branch present (dev.azure.com pattern)', () => {
      expect(content).toMatch(/dev\.azure\.com/);
    });

    test('SSH format branch present (git@ pattern)', () => {
      expect(content).toMatch(/\^git@/);
    });

    test('HTTPS format branch handled (https? pattern)', () => {
      expect(content).toMatch(/https\\?:\/\//);
    });

    test('forge-agnostic instruction uses GIT_HOST/GIT_OWNER/GIT_REPO', () => {
      expect(content).toMatch(/\$GIT_OWNER.*\$GIT_REPO|\$GIT_HOST.*\$GIT_OWNER/);
    });
  });

  describe('skills/vp-docs/SKILL.md — forge-agnostic parser', () => {
    let content;
    beforeAll(() => { content = read('skills/vp-docs/SKILL.md'); });

    test('SKILL.md GIT_HOST defined', () => {
      expect(content).toMatch(/GIT_HOST=/);
    });

    test('SKILL.md GIT_OWNER defined', () => {
      expect(content).toMatch(/GIT_OWNER=/);
    });

    test('SKILL.md GITHUB_OWNER / GITHUB_REPO assignment removed', () => {
      expect(content).not.toMatch(/GITHUB_OWNER\s*=/);
      expect(content).not.toMatch(/GITHUB_REPO\s*=/);
      expect(content).not.toMatch(/GITHUB_SLUG\s*=/);
    });
  });

  describe('workflows/crystallize.md — forge-agnostic Step 0 label', () => {
    let content;
    beforeAll(() => { content = read('workflows/crystallize.md'); });

    test('Step 0 no longer asks "GitHub username" (bare GitHub-only wording)', () => {
      // The old label was exactly "GitHub username? (optional)" — must be gone
      expect(content).not.toMatch(/^\s*10\.\s+GitHub username\? \(optional\)/m);
    });

    test('Step 0 uses forge-agnostic wording (git remote / username)', () => {
      expect(content).toMatch(/Git remote.*username|git remote.*host/i);
    });
  });

});
