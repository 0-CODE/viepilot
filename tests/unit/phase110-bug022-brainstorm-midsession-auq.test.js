/**
 * Phase 110 — BUG-022: vp-brainstorm mid-session AUQ for structured choices
 * Contract tests for workflows/brainstorm.md and skills/vp-brainstorm/SKILL.md
 */

const fs = require('fs');
const path = require('path');

const BRAINSTORM_WF = path.join(__dirname, '../../workflows/brainstorm.md');
const BRAINSTORM_SKILL = path.join(__dirname, '../../skills/vp-brainstorm/SKILL.md');

let wfContent, skillContent;

beforeAll(() => {
  wfContent = fs.readFileSync(BRAINSTORM_WF, 'utf8');
  skillContent = fs.readFileSync(BRAINSTORM_SKILL, 'utf8');
});

// ─── Group 1: brainstorm.md — mid-session AUQ rule present ───────────────────

describe('brainstorm.md — mid-session AUQ rule present', () => {
  test('contains BUG-022 reference in mid-session rule', () => {
    expect(wfContent).toContain('BUG-022');
  });

  test('contains "Mid-session" section heading', () => {
    expect(wfContent).toMatch(/Mid-session Structured Choice Rule|Mid-session.*AUQ/i);
  });

  test('specifies ≥2 discrete options as the trigger', () => {
    expect(wfContent).toMatch(/≥2 discrete|2 discrete named/i);
  });

  test('documents exemptions for free-form / open-ended questions', () => {
    expect(wfContent).toMatch(/Exempt from AUQ|free-form|open-ended/i);
  });

  test('documents "AUQ per decision, not per topic" constraint', () => {
    expect(wfContent).toMatch(/per decision|per structured decision/i);
  });

  test('mid-session rule appears before Landing Page Deep-Dive section', () => {
    const midSessionIdx = wfContent.indexOf('BUG-022');
    const landingIdx = wfContent.indexOf('### Landing Page Deep-Dive');
    expect(midSessionIdx).toBeGreaterThan(0);
    expect(landingIdx).toBeGreaterThan(0);
    expect(midSessionIdx).toBeLessThan(landingIdx);
  });

  test('mid-session rule appears inside Interactive Q&A section', () => {
    const qaIdx = wfContent.indexOf('### Interactive Q&A');
    const landingIdx = wfContent.indexOf('### Landing Page Deep-Dive');
    const bugIdx = wfContent.indexOf('BUG-022');
    expect(bugIdx).toBeGreaterThan(qaIdx);
    expect(bugIdx).toBeLessThan(landingIdx);
  });
});

// ─── Group 2: SKILL.md — expanded "Prompts using AUQ" list ───────────────────

describe('skills/vp-brainstorm/SKILL.md — expanded AUQ prompts list', () => {
  test('contains mid-session entry in "Prompts using AskUserQuestion"', () => {
    expect(skillContent).toMatch(/[Mm]id-session/);
  });

  test('mid-session entry references BUG-022', () => {
    expect(skillContent).toContain('BUG-022');
  });

  test('original session intent entry still present (regression check)', () => {
    expect(skillContent).toMatch(/Session intent.*continue.*review.*new|continue \/ review \/ new/i);
  });

  test('original landing page layout entry still present (regression check)', () => {
    expect(skillContent).toMatch(/[Ll]anding page layout|Layout A\/B\/C\/D/);
  });
});

// ─── Group 3: version + changelog ────────────────────────────────────────────

describe('version + changelog', () => {
  test('package.json version is 2.43.1 or later', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8'));
    const [major, minor, patch] = pkg.version.split('.').map(Number);
    expect(major).toBe(2);
    expect(minor).toBe(43);
    expect(patch).toBeGreaterThanOrEqual(1);
  });

  test('CHANGELOG contains [2.43.1] entry', () => {
    const changelog = fs.readFileSync(path.join(__dirname, '../../CHANGELOG.md'), 'utf8');
    expect(changelog).toContain('[2.43.1]');
  });

  test('CHANGELOG 2.43.1 entry mentions BUG-022 or mid-session', () => {
    const changelog = fs.readFileSync(path.join(__dirname, '../../CHANGELOG.md'), 'utf8');
    expect(changelog).toMatch(/BUG-022|mid-session/i);
  });
});
