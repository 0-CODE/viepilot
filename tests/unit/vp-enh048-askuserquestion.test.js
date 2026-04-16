'use strict';
// ENH-048: AskUserQuestion adapter-aware integration — contract tests
// Verifies that all affected workflow and skill files contain the expected
// adapter-aware instruction markers and preserve text fallback lists.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

describe('ENH-048: AskUserQuestion adapter-aware pattern', () => {

  // ── workflows/crystallize.md ──────────────────────────────────────────────

  describe('workflows/crystallize.md', () => {
    let content;
    beforeAll(() => { content = read('workflows/crystallize.md'); });

    test('has Adapter Compatibility table', () => {
      expect(content).toContain('## Adapter Compatibility');
      expect(content).toContain('AskUserQuestion');
      expect(content).toContain('text fallback');
    });

    test('has adapter-aware prompt on license question', () => {
      expect(content).toContain('Adapter-aware prompt');
      expect(content).toContain('Which license for this project?');
    });

    test('has AUQ spec with 4 license options', () => {
      expect(content).toContain('"MIT"');
      expect(content).toContain('"Apache-2.0"');
      expect(content).toContain('"GPL-3.0"');
      expect(content).toContain('"Proprietary"');
    });

    test('preserves text fallback for license (BSD-3-Clause)', () => {
      // Original text list still present
      expect(content).toContain('BSD-3-Clause');
    });

    test('has adapter-aware prompt on brownfield overwrite confirmation', () => {
      expect(content).toContain('Overwrite?');
      expect(content).toContain('Re-running brownfield mode will overwrite artifacts');
    });

    test('has adapter-aware prompt on polyrepo related-repos question', () => {
      expect(content).toContain('Polyrepo?');
      expect(content).toContain('Polyrepo signals detected');
    });

    test('has adapter-aware prompt on UI direction gate', () => {
      expect(content).toContain('UI Direction');
      expect(content).toContain('Return to /vp-brainstorm --ui');
    });

    test('has adapter-aware prompt on architect mode suggestion', () => {
      expect(content).toContain('Architect?');
      expect(content).toContain('Complex architecture detected');
    });

    test('all adapter-aware blocks specify Cursor/Codex fallback', () => {
      const fallbackCount = (content.match(/Cursor \/ Codex \/ Antigravity \/ other/g) || []).length;
      expect(fallbackCount).toBeGreaterThanOrEqual(4);
    });
  });

  // ── workflows/brainstorm.md ───────────────────────────────────────────────

  describe('workflows/brainstorm.md', () => {
    let content;
    beforeAll(() => { content = read('workflows/brainstorm.md'); });

    test('has Adapter Compatibility table', () => {
      expect(content).toContain('## Adapter Compatibility');
      expect(content).toContain('AskUserQuestion');
    });

    test('has adapter-aware prompt on session intent question', () => {
      expect(content).toContain('Previous brainstorm sessions found');
      expect(content).toContain('Adapter-aware prompt');
    });

    test('has adapter-aware prompt on landing page layout selection', () => {
      expect(content).toContain('Which landing page layout');
      expect(content).toContain('Layout A');
      expect(content).toContain('Layout B');
      expect(content).toContain('Layout C');
      expect(content).toContain('Layout D');
    });

    test('preserves text fallback layout list', () => {
      // Original layout list entries still present
      expect(content).toContain('Layout A: Hero centric');
      expect(content).toContain('Layout B: Problem/Solution');
    });
  });

  // ── workflows/request.md ─────────────────────────────────────────────────

  describe('workflows/request.md', () => {
    let content;
    beforeAll(() => { content = read('workflows/request.md'); });

    test('has Adapter Compatibility table', () => {
      expect(content).toContain('## Adapter Compatibility');
      expect(content).toContain('AskUserQuestion');
    });

    test('has adapter-aware prompt on request type detection', () => {
      expect(content).toContain('What type of request would you like to create?');
      expect(content).toContain('Request type');
    });

    test('has 4 structured type options in AUQ spec', () => {
      expect(content).toContain('Bug Report');
      expect(content).toContain('Feature Request');
      expect(content).toContain('Enhancement');
      expect(content).toContain('Technical Debt');
    });

    test('has adapter-aware prompt on bug severity', () => {
      expect(content).toContain('What is the bug severity?');
      expect(content).toContain('Critical');
      expect(content).toContain('High');
      expect(content).toContain('Medium');
      expect(content).toContain('Low');
    });

    test('has adapter-aware prompt on feature priority', () => {
      expect(content).toContain('What is the feature priority?');
      expect(content).toContain('Must-have');
      expect(content).toContain('Should-have');
      expect(content).toContain('Nice-to-have');
    });

    test('preserves original text menu (Brainstorm + List options)', () => {
      expect(content).toContain('Brainstorm - Explore new ideas');
      expect(content).toContain('List Requests');
    });
  });

  // ── workflows/evolve.md ───────────────────────────────────────────────────

  describe('workflows/evolve.md', () => {
    let content;
    beforeAll(() => { content = read('workflows/evolve.md'); });

    test('has Adapter Compatibility table', () => {
      expect(content).toContain('## Adapter Compatibility');
      expect(content).toContain('AskUserQuestion');
    });

    test('has adapter-aware prompt on intent detection', () => {
      expect(content).toContain('How would you like to evolve the project?');
      expect(content).toContain('Evolve mode');
    });

    test('has 3 structured intent options', () => {
      expect(content).toContain('Add Feature');
      expect(content).toContain('New Milestone');
      expect(content).toContain('Refactor');
    });

    test('has adapter-aware prompt on complexity question', () => {
      expect(content).toContain('Estimated implementation complexity?');
      expect(content).toContain('S — Small');
      expect(content).toContain('XL — Extra Large');
    });

    test('has adapter-aware prompt on brainstorm routing', () => {
      expect(content).toContain('Does this feature need a brainstorm session first?');
    });
  });

  // ── skills/vp-crystallize/SKILL.md ───────────────────────────────────────

  describe('skills/vp-crystallize/SKILL.md', () => {
    let content;
    beforeAll(() => { content = read('skills/vp-crystallize/SKILL.md'); });

    test('has Adapter Compatibility section', () => {
      expect(content).toContain('## Adapter Compatibility');
    });

    test('lists all 6 adapter rows', () => {
      expect(content).toContain('Claude Code (terminal)');
      expect(content).toContain('Claude Code (VS Code ext)');
      expect(content).toContain('Cursor (Plan Mode)');
      expect(content).toContain('Cursor (Agent/Skills)');
      expect(content).toContain('Codex CLI');
      expect(content).toContain('Antigravity (native agent)');
    });

    test('lists prompts using AskUserQuestion', () => {
      expect(content).toContain('License selection');
      expect(content).toContain('Polyrepo');
    });
  });

  // ── skills/vp-brainstorm/SKILL.md ────────────────────────────────────────

  describe('skills/vp-brainstorm/SKILL.md', () => {
    let content;
    beforeAll(() => { content = read('skills/vp-brainstorm/SKILL.md'); });

    test('has Adapter Compatibility section', () => {
      expect(content).toContain('## Adapter Compatibility');
    });

    test('lists all 6 adapter rows', () => {
      expect(content).toContain('Claude Code (terminal)');
      expect(content).toContain('Antigravity (native agent)');
    });

    test('lists prompts using AskUserQuestion', () => {
      expect(content).toContain('Session intent');
      expect(content).toContain('Landing page layout selection');
    });
  });

  // ── skills/vp-request/SKILL.md ───────────────────────────────────────────

  describe('skills/vp-request/SKILL.md', () => {
    let content;
    beforeAll(() => { content = read('skills/vp-request/SKILL.md'); });

    test('has Adapter Compatibility section', () => {
      expect(content).toContain('## Adapter Compatibility');
    });

    test('lists all 6 adapter rows', () => {
      expect(content).toContain('Claude Code (terminal)');
      expect(content).toContain('Antigravity (native agent)');
    });

    test('lists prompts using AskUserQuestion', () => {
      expect(content).toContain('Request type detection');
      expect(content).toContain('Bug severity selection');
      expect(content).toContain('Feature priority selection');
    });
  });

});
