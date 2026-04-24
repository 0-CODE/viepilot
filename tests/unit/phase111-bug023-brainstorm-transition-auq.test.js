'use strict';

const fs = require('fs');
const path = require('path');

const BRAINSTORM = path.join(__dirname, '../../workflows/brainstorm.md');
const SKILL_MD = path.join(__dirname, '../../skills/vp-brainstorm/SKILL.md');
const PKG = path.join(__dirname, '../../package.json');
const CHANGELOG = path.join(__dirname, '../../CHANGELOG.md');

const brainstorm = fs.readFileSync(BRAINSTORM, 'utf8');
const skillMd = fs.readFileSync(SKILL_MD, 'utf8');
const pkg = JSON.parse(fs.readFileSync(PKG, 'utf8'));
const changelog = fs.readFileSync(CHANGELOG, 'utf8');

describe('Phase 111 — BUG-023: vp-brainstorm session-transition AUQ rule', () => {

  describe('111.1 — brainstorm.md: session-transition AUQ rule', () => {
    test('has ### Mid-session Transition Prompt Rule heading', () => {
      expect(brainstorm).toMatch(/###\s+Mid-session Transition Prompt Rule/);
    });

    test('heading references BUG-023', () => {
      expect(brainstorm).toMatch(/Mid-session Transition Prompt Rule.*BUG-023/);
    });

    test('rule mandates AUQ call on Claude Code terminal', () => {
      expect(brainstorm).toMatch(/AskUserQuestion/);
      const transitionBlock = brainstorm.split('### Mid-session Transition Prompt Rule')[1]
        .split('### ')[0];
      expect(transitionBlock).toMatch(/AskUserQuestion/);
    });

    test('rule describes session-flow choices', () => {
      const transitionBlock = brainstorm.split('### Mid-session Transition Prompt Rule')[1]
        .split('### ')[0];
      expect(transitionBlock).toMatch(/session.FLOW|session-flow|session-FLOW/i);
    });

    test('rule contains canonical crystallize option', () => {
      const transitionBlock = brainstorm.split('### Mid-session Transition Prompt Rule')[1]
        .split('### ')[0];
      expect(transitionBlock).toMatch(/crystallize|vp-crystallize/i);
    });

    test('rule contains scope note distinguishing from BUG-022', () => {
      const transitionBlock = brainstorm.split('### Mid-session Transition Prompt Rule')[1]
        .split('### ')[0];
      expect(transitionBlock).toMatch(/BUG-022/);
    });

    test('BUG-023 rule is located after BUG-022 rule', () => {
      const bug022Idx = brainstorm.indexOf('Mid-session Structured Choice Rule (BUG-022)');
      const bug023Idx = brainstorm.indexOf('Mid-session Transition Prompt Rule (BUG-023)');
      expect(bug022Idx).toBeGreaterThan(-1);
      expect(bug023Idx).toBeGreaterThan(bug022Idx);
    });

    test('BUG-023 rule is located before Landing Page Deep-Dive', () => {
      const bug023Idx = brainstorm.indexOf('Mid-session Transition Prompt Rule (BUG-023)');
      const landingIdx = brainstorm.indexOf('### Landing Page Deep-Dive');
      expect(bug023Idx).toBeGreaterThan(-1);
      expect(bug023Idx).toBeLessThan(landingIdx);
    });

    test('rule contains adapter-aware blockquote format', () => {
      const transitionBlock = brainstorm.split('### Mid-session Transition Prompt Rule')[1]
        .split('### ')[0];
      expect(transitionBlock).toMatch(/Claude Code.*terminal.*REQUIRED/i);
      expect(transitionBlock).toMatch(/Cursor.*Codex.*Antigravity/i);
    });
  });

  describe('111.2 — SKILL.md: AUQ prompts list includes session-transition entry', () => {
    test('BUG-022 entry still present (regression check)', () => {
      expect(skillMd).toMatch(/BUG-022/);
      expect(skillMd).toMatch(/mid-session structured choices/i);
    });

    test('BUG-023 entry present in Prompts using AUQ list', () => {
      expect(skillMd).toMatch(/BUG-023/);
    });

    test('BUG-023 entry mentions session-transition or session-flow choices', () => {
      expect(skillMd).toMatch(/session.transition|session.flow/i);
    });
  });

  describe('111.3 — version + CHANGELOG', () => {
    test('package.json version is 2.43.2', () => {
      expect(pkg.version).toBe('2.43.2');
    });

    test('CHANGELOG contains [2.43.2] entry', () => {
      expect(changelog).toMatch(/\[2\.43\.2\]/);
    });

    test('CHANGELOG BUG-023 entry mentions vp-brainstorm', () => {
      const entry = changelog.split('[2.43.2]')[1]?.split('\n## [')[0] ?? '';
      expect(entry).toMatch(/BUG-023|vp-brainstorm|session.transition/i);
    });
  });
});
