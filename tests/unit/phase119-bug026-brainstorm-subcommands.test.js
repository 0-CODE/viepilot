'use strict';

const fs = require('fs');
const path = require('path');

const SKILL = path.join(__dirname, '../../skills/vp-brainstorm/SKILL.md');
const WORKFLOW = path.join(__dirname, '../../workflows/brainstorm.md');
const PKG = path.join(__dirname, '../../package.json');
const CHANGELOG = path.join(__dirname, '../../CHANGELOG.md');

const skill = fs.readFileSync(SKILL, 'utf8');
const workflow = fs.readFileSync(WORKFLOW, 'utf8');
const pkg = JSON.parse(fs.readFileSync(PKG, 'utf8'));
const changelog = fs.readFileSync(CHANGELOG, 'utf8');

describe('Phase 119 — BUG-026: vp-brainstorm sub-commands → proactive AUQ triggers', () => {

  describe('119.1 — SKILL.md: Section D proactive AUQ triggers', () => {
    test('BUG-026 referenced in SKILL.md', () => {
      expect(skill).toMatch(/BUG-026/);
    });

    test('Section D "Session Actions" present in cursor_skill_adapter', () => {
      expect(skill).toMatch(/Session Actions.*Proactive AUQ|D\. Session Actions/i);
    });

    test('Save trigger documents intent keywords including Vietnamese', () => {
      expect(skill).toMatch(/save.*done.*xong|xong.*lưu/i);
    });

    test('UX walkthrough listed as proactive AUQ trigger (not slash command)', () => {
      expect(skill).toMatch(/UX walkthrough.*AUQ|proactively.*AUQ.*walkthrough/i);
    });

    test('Architecture review listed as proactive AUQ trigger (not slash command)', () => {
      expect(skill).toMatch(/arch.*review.*AUQ|AUQ.*arch.*review/i);
    });

    test('No /save slash sub-command in objective section', () => {
      const objectiveStart = skill.indexOf('<objective>');
      const objectiveEnd = skill.indexOf('</objective>');
      const objective = skill.slice(objectiveStart, objectiveEnd);
      // Should not document /save as a user-typed command
      expect(objective).not.toMatch(/command.*`\/save`|`\/save`.*command/);
    });

    test('No /research-ui slash sub-command in objective section', () => {
      const objectiveStart = skill.indexOf('<objective>');
      const objectiveEnd = skill.indexOf('</objective>');
      const objective = skill.slice(objectiveStart, objectiveEnd);
      expect(objective).not.toMatch(/command.*`\/research-ui`|`\/research-ui`.*command/);
    });
  });

  describe('119.2 — workflows/brainstorm.md: intent-based triggers replace slash commands', () => {
    test('Save trigger uses intent detection not /save command', () => {
      expect(workflow).toMatch(/Save Trigger|save.*intent|intent.*save/i);
      expect(workflow).toMatch(/xong|lưu/); // Vietnamese intent signals
    });

    test('Save step AUQ spec present', () => {
      expect(workflow).toMatch(/Save \+ prepare for crystallize/);
      expect(workflow).toMatch(/Save Trigger/);
      expect(workflow).toMatch(/AskUserQuestion/);
    });

    test('UX walkthrough trigger is proactive AUQ not /research-ui command', () => {
      expect(workflow).toMatch(/proactively triggered via AUQ|AUQ.*UX.*walkthrough|walkthrough.*AUQ/i);
    });

    test('UX walkthrough AUQ spec has Yes/Skip options', () => {
      expect(workflow).toMatch(/Run UX walkthrough\?|full walkthrough/i);
      expect(workflow).toMatch(/Skip for now/i);
    });

    test('Architecture review is intent-triggered not /review-arch command', () => {
      expect(workflow).toMatch(/review.*intent|intent.*review|when user asks to review/i);
    });

    test('No bare /save trigger remains in surface triggers list', () => {
      // The "(b) User types /save" line should be gone
      expect(workflow).not.toMatch(/User types `\/save`/);
    });

    test('/sync-ui slash command removed from coverage gate message', () => {
      expect(workflow).not.toMatch(/running \/sync-ui/);
    });
  });

  describe('119.3 — version and changelog', () => {
    test('package.json version is at least 2.45.6', () => {
      const [, minor, patch] = pkg.version.split('.').map(Number);
      expect(minor).toBeGreaterThanOrEqual(45);
      if (minor === 45) expect(patch).toBeGreaterThanOrEqual(6);
    });

    test('CHANGELOG has [2.45.6] entry', () => {
      expect(changelog).toMatch(/\[2\.45\.6\]/);
    });

    test('CHANGELOG BUG-026 entry references brainstorm or sub-commands', () => {
      expect(changelog).toMatch(/BUG-026/);
    });
  });
});
